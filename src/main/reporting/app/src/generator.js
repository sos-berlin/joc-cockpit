const path = require('path');
const moment = require('moment');
const _ = require('lodash');
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
        let data = await utils.readJsonFile(filePath);
        if (data.match('}{')) {
            data = data.replaceAll('}{', ',');
        }
        await writeReportData(options, data, directory, file, templateData, options.hits);
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

    await utils.deleteDirectory('tmp/' + runId)
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
            // Calculate execution time for each workflow
            const executionTimes = data.map(item => {
                const executionTime = item.duration = moment(item.END_TIME).diff(item.START_TIME) // in milliseconds
                const duration = executionTime / 1000; // Convert to seconds
                return {...item, executionTime: executionTime, duration};
            });

            // Group data by workflow
            const groupedData = executionTimes.reduce((acc, entry) => {
                acc[entry.WORKFLOW_NAME] = acc[entry.WORKFLOW_NAME] || [];
                acc[entry.WORKFLOW_NAME].push(entry);
                return acc;
            }, {});

            // Calculate total execution time for each workflow
            const workflowExecutionTimes = Object.keys(groupedData).map(workflow => {
                const executions = groupedData[workflow];
                const totalExecutionTime = executions.reduce((sum, entry) => sum + entry.executionTime, 0);
                return {workflow, totalExecutionTime};
            });

            // Sort workflows by total execution time in descending order
            workflowExecutionTimes.sort((a, b) => b.totalExecutionTime - a.totalExecutionTime);

            // Get top ${hits} workflows
            return workflowExecutionTimes.slice(0, options.hits).map(({workflow, totalExecutionTime}) => ({
                workflow,
                totalExecutionTime,
                // Add additional fields
                data: groupedData[workflow].map(({
                                                     START_TIME,
                                                     duration,
                                                     JOB_NAME,
                                                     AGENT_NAME,
                                                     STATE,
                                                     WORKFLOW_NAME
                                                 }) => ({
                    START_TIME,
                    duration,
                    JOB_NAME,
                    AGENT_NAME,
                    STATE,
                    WORKFLOW_NAME
                }))
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
                                                                  AGENT_NAME,
                                                                  START_TIME,
                                                                  STATE,
                                                                  duration
                                                              }) => ({
                            WORKFLOW_NAME,
                            JOB_NAME,
                            AGENT_NAME,
                            START_TIME,
                            STATE,
                            duration
                        }));
                    }

                    return currentJobs.filter(j => j.END_TIME.isAfter(job.START_TIME));
                }, []);

                return {agentName: agent, count: maxParallelJobs, data: maxParallelJobData};
            });

            return _.orderBy(results, ['count'], ['desc']).slice(0, options.hits);
        } else if (templates.data.groupBy === 'START_TIME' && templates.data.execution === "PARALLELISM") {
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

            const topLowCounts = sortedPeriods.slice(0, options.hits).reduce((acc, period) => acc + period.length, 0);
            const topHighCounts = sortedPeriods.slice(-options.hits).reduce((acc, period) => acc + period.length, 0);
            const count = topLowCounts + topHighCounts;

            return [{
                count,
                data: [
                    {
                        count: topLowCounts,
                        'topLowParallelismPeriods': sortedPeriods.slice(0, options.hits).map(period => ({
                            period: `${period[0].START_TIME} - ${period[period.length - 1].END_TIME}`,
                            data: period.map(({
                                                  WORKFLOW_NAME,
                                                  JOB_NAME,
                                                  AGENT_NAME,
                                                  ORDER_ID,
                                                  START_TIME,
                                                  ORDER_STATE,
                                                  STATE,
                                                  duration
                                              }) => ({
                                WORKFLOW_NAME,
                                JOB_NAME,
                                AGENT_NAME,
                                ORDER_ID,
                                START_TIME,
                                ORDER_STATE,
                                STATE,
                                duration
                            }))
                        }))
                    },
                    {
                        count: topHighCounts,
                        'topHighParallelismPeriods': sortedPeriods.slice(-options.hits).reverse().map(period => ({
                            period: `${period[0].START_TIME} - ${period[period.length - 1].END_TIME}`,
                            data: period.map(({
                                                  WORKFLOW_NAME,
                                                  JOB_NAME,
                                                  AGENT_NAME,
                                                  ORDER_ID,
                                                  START_TIME,
                                                  ORDER_STATE,
                                                  STATE,
                                                  duration
                                              }) => ({
                                WORKFLOW_NAME,
                                JOB_NAME,
                                AGENT_NAME,
                                ORDER_ID,
                                START_TIME,
                                ORDER_STATE,
                                STATE,
                                duration
                            }))
                        }))
                    }
                ]
            }];
        } else if (templates.data.groupBy === 'START_TIME' && templates.data.execution === "DURATION") {
            // Calculate the duration for each job execution
            data.forEach(item => {
                item.duration = moment(item.END_TIME).diff(item.START_TIME) / 1000; // Duration in seconds
            });

            // Extract the required fields and return the modified data array
            return data.slice(0, options.hits).map(({WORKFLOW_NAME, JOB_NAME, duration}) => ({
                WORKFLOW_NAME,
                JOB_NAME,
                duration,
                data: data.map(({
                                    WORKFLOW_NAME,
                                    JOB_NAME,
                                    AGENT_NAME,
                                    ORDER_ID,
                                    START_TIME,
                                    ORDER_STATE,
                                    STATE,
                                    duration
                                }) => ({
                    WORKFLOW_NAME,
                    JOB_NAME,
                    AGENT_NAME,
                    ORDER_ID,
                    START_TIME,
                    ORDER_STATE,
                    STATE,
                    duration,
                }))
            }));
        } else {
            return Object.entries(data.reduce((groups, item) => {
                let key = item[templates.data.groupBy];
                if (templates.data.groupBy === 'JOB_NAME') {
                    key = item['WORKFLOW_NAME'] + '__' + item['JOB_NAME'];
                }

                if (!groups[key]) {
                    groups[key] = {count: 0, workflow: item['WORKFLOW_NAME'], job: item['JOB_NAME'], data: []};
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
                    // Add overlapping data
                    const overlappingData = [];
                    value.data.forEach(item => {
                        item.duration = moment(item.END_TIME).diff(item.START_TIME) / 1000; // Duration in seconds
                    });

                    return {
                        [templates.data.groupBy.toLowerCase()]: key,
                        count: value.count,
                        workflow: value.workflow,
                        job: value.job,
                        data: value.data.concat(overlappingData).map(({
                                                                          WORKFLOW_NAME,
                                                                          JOB_NAME,
                                                                          START_TIME,
                                                                          duration,
                                                                          AGENT_NAME,
                                                                          ORDER_STATE,
                                                                          STATE,
                                                                          ORDER_ID
                                                                      }) => ({
                            WORKFLOW_NAME,
                            JOB_NAME,
                            AGENT_NAME,
                            ORDER_ID,
                            START_TIME,
                            ORDER_STATE,
                            STATE,
                            duration,
                        }))
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
    let groupedData;

    groupedData = dynamicData(templateData, JSON.parse(data), options);

    if (groupedData) {
        jsonObject.data = groupedData;
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
