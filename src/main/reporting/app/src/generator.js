const fs = require('fs');
const path = require('path');
const moment = require('moment');
const _ = require('lodash');
const readline = require('readline');
let logger = require('./logger');
logger = new logger().getLogger();
const utils = require("./utils");


/**
 * Read JSON data from a file and process it.
 * @param {string} directory - Directory containing the file.
 * @param {string} file - Filename.
 * @param {Object} options - Additional options.
 * @param {Object} templateData - Template Data.
 */
async function readJSONData(directory, file, options, templateData) {
    const filePath = path.join(directory, file);
    console.log(`Read ${filePath} file and start data processing...`)
    try {
        if (templateData.data.groupBy === 'START_TIME' && !templateData.data.execution) {
            return new Promise((resolve, reject) => {
                // Create a readable stream to read the input file
                const readStream = fs.createReadStream(filePath, {encoding: 'utf-8'});
                // Create an interface to read the stream line by line
                const rl = readline.createInterface({
                    input: readStream,
                    crlfDelay: Infinity // To recognize all instances of CR LF ('\r\n') as a single line break
                });
                const jsonObject = {
                    title: templateData.title,
                    type: templateData.type,
                    chartType: templateData.data.chartType,
                    data: []
                };
                const groupedData = {};
                rl.on('line', (line) => {
                    try {
                        if (line) {
                            line = line.replace(/,\s*$/, '');
                            if(line) {
                                try {
                                    const data = JSON.parse(line);

                                    if (typeof data == 'string') {
                                        let _data = JSON.parse(data);
                                        const startTime = _data.START_TIME;
                                        // Group the data by category
                                        if (!groupedData[startTime]) {
                                            groupedData[startTime] = [];
                                        }
                                        groupedData[startTime].push(_data);
                                    }
                                } catch (e) {
                                    console.log('line', line, '>>>')
                                    console.log(e)
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });

                // Event listener for 'close' event, triggered when file reading is finished
                readStream.on('close', async () => {
                    console.log('Creation of report data is finished...');
                    jsonObject.data = Object.entries(groupedData).map(([key, value]) => {
                        return {
                            period: key, count: value.length, data: value.map(item => {
                                return {
                                    WORKFLOW_NAME: item.WORKFLOW_NAME,
                                    JOB_NAME: item.JOB_NAME,
                                    START_TIME: item.START_TIME
                                }
                            })
                        }
                    }).sort((a, b) => b.count - a.count) // Sort by count in descending order
                        // Slice to get only the specified hits
                        .slice(0, options.hits);
                    // jsonObject.data = arr;
                    if (jsonObject.data) {
                        const runId = directory.match(/\d+/)[0];
                        let outputDir;
                        if (options.outputDirectory) {
                            outputDir = path.join(options.outputDirectory, file);
                        } else {
                            outputDir = path.join('report/' + runId, file);
                        }
                        await utils.writeOutputFile(outputDir, jsonObject);
                    }

                    resolve();
                });
                // Event listener for 'error' event, triggered when an error occurs
                readStream.on('error', (error) => {
                    console.error('Error reading file:', error);
                    logger.error('Error reading file:', error);
                    reject(error); // Reject the promise with the error
                });
            });
        } else {
            let data = await utils.readJsonFile(filePath);
            if (data.match('}{')) {
                data = data.replaceAll('}{', ',');
            }
            await writeReportData(options, data, directory, file, templateData, options.hits);
        }
    } catch (error) {
        console.error('Error while reading template data', error);
        logger.error('Error while reading template data', error);
    }
}

/**
 * Read data from a directory and process each file.
 * @param {string} directory - Directory containing the files.
 * @param {Object} options - Additional options.
 * @param {string} templateData - Template Data.
 */
async function readDataDirectory(directory, options, templateData) {
    const inputFiles = await utils.readInputDirectory(directory);
    const runId = directory.match(/\d+/)[0];
    let outputDir;
    if (options.outputDirectory) {
        outputDir = options.outputDirectory;
    } else {
        outputDir = path.join('report', runId);
    }
    await utils.checkAndCreateDirectory(outputDir);
    for (const file of inputFiles) {
        await readJSONData(directory, file, options, JSON.parse(templateData));
    }
    //  await utils.deleteDirectory('tmp/' + runId)
}

/**
 * Dynamically filters and groups data based on provided templates and hits.
 * @param {object} templates - The templates object containing groupBy and status properties.
 * @param {Array} data - The data array to be filtered and grouped.
 * @param {object} options - Additional options.
 * @returns {Array} - The filtered and grouped data.
 */
function dynamicData(templates, data, options) {
    // Check if templates contain groupBy property
    if (templates?.data?.groupBy) {
        // Group data dynamically based on the groupBy property

        if (templates.data.groupBy === 'WORKFLOW_NAME' && templates.data.execution === "DURATION") {
            // Sort workflows by total execution time in descending order
            data.sort((a, b) => b.duration - a.duration);

            // Get top ${hits} workflows
            return data.map(({WORKFLOW_NAME, START_TIME, duration}) => ({
                WORKFLOW_NAME,
                START_TIME,
                duration,
                // Add additional fields
                data: []
            }));
        } else if (templates.data.groupBy === 'AGENT_NAME' && templates.data.groupBy2 === "START_TIME") {
            data.forEach(entry => {
                entry.START_TIME = moment(entry.START_TIME, 'YYYY-MM-DD HH:mm:ss');
                entry.END_TIME = moment(entry.END_TIME, 'YYYY-MM-DD HH:mm:ss');
            });

            data.sort((a, b) => a.START_TIME - b.START_TIME);

            const results = Object.entries(_.groupBy(data, 'AGENT_NAME')).map(([agent, agentData]) => {
                let maxParallelJobs = 0;
                let maxParallelJobData = [];

                agentData.reduce((currentJobs, job) => {
                    const overlappingJobs = currentJobs.filter(j => (j.START_TIME.isBefore(job.START_TIME) && j.END_TIME.isAfter(job.START_TIME)) || (j.START_TIME.isSameOrBefore(job.START_TIME) && j.END_TIME.isSameOrAfter(job.END_TIME)));
                    currentJobs.push(job);
                    if (overlappingJobs.length + 1 > maxParallelJobs) {
                        maxParallelJobs = overlappingJobs.length + 1;
                        maxParallelJobData = currentJobs.map(({
                                                                  WORKFLOW_NAME,
                                                                  JOB_NAME,
                                                                  START_TIME,
                                                                  duration
                                                              }) => ({
                            WORKFLOW_NAME,
                            JOB_NAME,
                            START_TIME,
                            duration
                        }));
                    }

                    return currentJobs.filter(j => j.END_TIME.isAfter(job.START_TIME));
                }, []);

                return {agentName: agent, count: maxParallelJobs, data: maxParallelJobData};
            });

            return _.orderBy(results, ['count'], ['desc']).slice(0, options.hits);
        } else if (templates.data.groupBy === 'START_TIME' && templates.data.execution === "PARALLELISM") {
            //TODO
            const groupedData = Object.values(data.reduce((acc, curr) => {
                const startTime = curr.START_TIME?.split(' ')[0];
                acc[startTime] = acc[startTime] || [];
                acc[startTime].push(curr);
                return acc;
            }, {})).flatMap(group => {
                return group.reduce((acc, curr, index) => {
                    if (index === 0 || new Date(group[index - 1].END_TIME).getTime() <= new Date(curr.START_TIME).getTime()) {
                        acc.push(curr);
                    } else {
                        acc.push({
                            START_TIME: curr.START_TIME,
                            END_TIME: curr.END_TIME,
                            duration: Math.abs((new Date(curr.START_TIME).getTime() - new Date(group[index - 1].END_TIME).getTime()) / 1000),
                            JOB_NAME: curr.JOB_NAME,
                            WORKFLOW_NAME: curr.WORKFLOW_NAME
                        });
                    }
                    return acc;
                }, []);
            }).sort((a, b) => new Date(a.START_TIME) - new Date(b.START_TIME));

            const periods = [];
            let currentPeriod = [];

            groupedData.forEach(job => {
                const lastJob = currentPeriod[currentPeriod.length - 1];
                if (!lastJob || new Date(lastJob.END_TIME).getTime() <= new Date(job.START_TIME).getTime()) {
                    currentPeriod.push(job);
                } else {
                    periods.push(currentPeriod);
                    currentPeriod = [job];
                }
            });

            const sortedPeriods = periods.sort((a, b) => b.length - a.length);
            return {
                'topLowParallelismPeriods': sortedPeriods.slice(0, options.hits).map(period => ({
                    period: `${period[0].START_TIME} - ${period[period.length - 1].END_TIME}`,
                    data: period.map(({
                                          WORKFLOW_NAME,
                                          JOB_NAME,
                                          AGENT_NAME,
                                          START_TIME,
                                          duration
                                      }) => ({
                        WORKFLOW_NAME,
                        JOB_NAME,
                        AGENT_NAME,
                        START_TIME,
                        duration
                    }))
                })),
                'topHighParallelismPeriods': sortedPeriods.slice(-options.hits).reverse().map(period => ({
                    period: `${period[0].START_TIME} - ${period[period.length - 1].END_TIME}`,
                    data: period.map(({
                                          WORKFLOW_NAME,
                                          JOB_NAME,
                                          AGENT_NAME,
                                          START_TIME,
                                          duration
                                      }) => ({
                        WORKFLOW_NAME,
                        JOB_NAME,
                        AGENT_NAME,
                        START_TIME,
                        duration
                    }))
                }))

            };
        } else if (templates.data.groupBy === 'START_TIME' && templates.data.execution === "DURATION") {
            // Extract the required fields and return the modified data array
            return data.map(({WORKFLOW_NAME, JOB_NAME, START_TIME, duration}) => ({
                WORKFLOW_NAME,
                JOB_NAME,
                START_TIME,
                duration,
                data: []
            }));
        } else {
            return Object.entries(data.reduce((groups, item) => {
                let key = item[templates.data.groupBy];
                if (templates.data.groupBy === 'JOB_NAME') {
                    key = item['WORKFLOW_NAME'] + '__' + item['JOB_NAME'];
                }

                if (!groups[key]) {
                    groups[key] = {count: 0, data: []};
                }
                groups[key].count++;
                groups[key].data.push(item);
                return groups;
            }, {}))
                .sort((a, b) => b[1].count - a[1].count) // Sort by count in descending order
                // Slice to get only the specified hits
                .slice(0, options.hits)

                // Map to transform the data format
                .map(([key, value]) => {
                    return {
                        [templates.data.groupBy.toLowerCase()]: key,
                        count: value.count,
                        data: value.data.map(({START_TIME}) => START_TIME)
                    };
                });
        }

    }
}

/**
 * Write report data based on template type.
 * @param {object} options - Cmd parameters.
 * @param {string} data - Data to write.
 * @param {string} directory - directory.
 * @param {string} fileName - Filename.
 * @param {object} templateData - Template Data.
 * @param {number} hits - Default 10.
 */
async function writeReportData(options, data, directory, fileName, templateData, hits = 10) {
    const runId = directory.match(/\d+/)[0];
    const jsonObject = {
        title: templateData.title,
        type: templateData.type,
        chartType: templateData.data.chartType
    };
    data = '[' + data + ']';
    jsonObject.data = dynamicData(templateData, JSON.parse(data), options);

    if (jsonObject.data) {
        let outputDir;
        if (options.outputDirectory) {
            outputDir = path.join(options.outputDirectory, fileName);
        } else {
            outputDir = path.join('report/' + runId, fileName);
        }
        await utils.writeOutputFile(outputDir, jsonObject);
    }
}

/**
 * Generate reports based on template data and directory path.
 * @param {string} templateData - Template data in JSON format.
 * @param {string} directoryPath - Directory path containing input files.
 * @param {Object} options - Additional options.
 */
async function generate(templateData, directoryPath, options) {
    try {
        await readDataDirectory('tmp/' + directoryPath, options, templateData);
    } catch (error) {
        logger.error(error);
    }
}

module.exports = generate;
