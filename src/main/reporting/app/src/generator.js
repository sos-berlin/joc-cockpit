const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const moment = require('moment');
const _ = require('lodash');
let logger = require('./logger');
logger = new logger().getLogger();
const utils = require("./utils");
const v8 = require("v8");
const DB = require('./db');


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
        chartType: templateData.data.chartType,
        data: data
    };

    const heapStats = v8.getHeapStatistics();
    logger.debug(`  - Total Available Size: ${(heapStats.total_available_size / (1024 * 1024)).toFixed(2)} MB`);
    logger.debug(`  - Used Heap Size: ${(heapStats.used_heap_size / (1024 * 1024)).toFixed(2)} MB`);
    logger.debug(`  - Heap Size Limit: ${(heapStats.heap_size_limit / (1024 * 1024)).toFixed(2)} MB`);

    if (jsonObject.data) {
        let outputDir;
        if (options.outputDirectory) {
            outputDir = path.join(options.outputDirectory, fileName);
        } else {
            outputDir = path.join('report/' + runId, fileName);
        }
        logger.debug(`Output file ${outputDir} written successfully.`);
        try {
            await utils.writeOutputFile(outputDir, jsonObject);
        } catch (e) {
            logger.error(`Error writing output file: ${e.message}`);
        }
    }
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
                    let overlappingJobs = currentJobs.filter(j => (j.START_TIME.isBefore(job.START_TIME) && j.END_TIME.isAfter(job.START_TIME)) || (j.START_TIME.isSameOrBefore(job.START_TIME) && j.END_TIME.isSameOrAfter(job.END_TIME)));
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
            const groupedData = Object.values(data.reduce((acc, curr) => {
                let startTime = curr.START_TIME?.split(' ')[0];
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

            let sortedPeriods = [];
            let currentPeriod = [];

            groupedData.forEach(job => {
                const lastJob = currentPeriod[currentPeriod.length - 1];
                if (!lastJob || new Date(lastJob.END_TIME).getTime() <= new Date(job.START_TIME).getTime()) {
                    currentPeriod.push(job);
                } else {
                    sortedPeriods.push(currentPeriod);
                    currentPeriod = [job];
                }
            });

            sortedPeriods = sortedPeriods.sort((a, b) => b.length - a.length);
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
        }

    }
}

async function readDataFromDb(directory, options, templateData, files) {
    if (typeof templateData === 'string') {
        templateData = JSON.parse(templateData);
    }

    const runId = directory.match(/\d+/)[0];
    const outputDir = options.outputDirectory || path.join('report', runId);

    await utils.checkAndCreateDirectory(outputDir);

    const dbName = templateData.type === 'ORDER' ? 'orders' : 'jobs';
    const getDataFromDbAsync = promisify(DB.getDataFromDb.bind(DB));

    for (const file of Object.keys(files)) {
        if (file !== 'files') {
            try {
                const data = await getDataFromDbAsync(logger, templateData, dbName, options.hits || 10, file);
                await writeReportData(options, data, directory, `${file}.json`, templateData, options.hits || 10);
            } catch (err) {
                logger.error('Error while reading template data', err);
                throw err; // Rethrow error to stop processing if an error occurs
            }
        }
    }

    await DB.deleteDb(`tmp/${runId}.db`, logger);
}

/**
 * Generate reports based on template data and directory path.
 * @param {string} templateData - Template data in JSON format.
 * @param {string} directoryPath - Directory path containing input files.
 * @param {Object} options - Additional options.
 * @param {Object} files - Name of output files.
 * @param {Object} _logger - Instance of logger
 */
async function generate(templateData, directoryPath, options, files, _logger) {
    if (!logger) {
        logger = _logger;
    }
    try {
        await readDataFromDb('tmp/' + directoryPath, options, templateData, files);
    } catch (error) {
        logger.error(error);
    }
}

module.exports = generate;
