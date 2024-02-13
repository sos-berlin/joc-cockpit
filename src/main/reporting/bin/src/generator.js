const path = require('path');
const moment = require('moment');
const _ = require('lodash');
const logger = require('./logger');
const utils = require("./utils");

/**
 * Calculate the maximum parallel job execution for agents.
 * @param {Array} jobData - Job execution data.
 * @param {number} size - Default is 10.
 * @returns {Array} - Agents with the most parallel job execution.
 */
function calculateMaxParallelExecution(jobData, size) {
    // Convert date strings to moment objects and sort by start time
    jobData.forEach(entry => {
        entry.START_TIME = moment(entry.START_TIME, 'YYYY-MM-DD HH:mm:ss');
        entry.END_TIME = moment(entry.END_TIME, 'YYYY-MM-DD HH:mm:ss');
    });

    jobData.sort((a, b) => a.START_TIME - b.START_TIME);

    // Group job data by agent name
    const groupedByAgent = _.groupBy(jobData, 'AGENT_NAME');
    const results = [];

    for (const agent in groupedByAgent) {
        const agentData = _.sortBy(groupedByAgent[agent], 'START_TIME');
        let currentJobs = [];
        let maxParallelJobs = 0;
        let maxParallelJobData = [];

        // Loop through each job for the current agent
        for (const job of agentData) {

            // Check if the job completely overlaps with current parallel jobs
            const overlappingJobs = currentJobs.filter(j => (j.START_TIME.isBefore(job.START_TIME) && j.END_TIME.isAfter(job.START_TIME)) || (j.START_TIME.isSameOrBefore(job.START_TIME) && j.END_TIME.isSameOrAfter(job.END_TIME)));

            // Add the current job to the list
            currentJobs.push(job);

            // Update the maximum parallel jobs count and details
            if (overlappingJobs.length + 1 > maxParallelJobs) {
                maxParallelJobs = overlappingJobs.length + 1;
                maxParallelJobData = [...currentJobs];
            }

            // Remove completed jobs from the current list
            currentJobs = currentJobs.filter(j => j.END_TIME.isAfter(job.START_TIME));
        }

        // Append the result for the current agent with details of max parallel job data
        results.push({agentName: agent, count: maxParallelJobs, data: maxParallelJobData});
    }

    // Sort the results by MaxParallelJobs in descending order
    const sortedResults = _.orderBy(results, ['count'], ['desc']);

    // Limit the number of results based on the 'size' parameter
    return sortedResults.slice(0, size);
}

/**
 * Find frequently failed jobs from job execution data.
 * @param {Array} data - Job execution data.
 * @param {number} size - Number of frequently failed jobs to return.
 * @returns {Object} - Frequently failed jobs data.
 */
function frequentlyFailedJobs(data, size) {
    const failedJobs = {};

    if (!Array.isArray(data)) {
        return {};
    }

    data = data.filter(item => item['STATE'] === '2');
    data.forEach(item => {
        const jobName = item['WORKFLOW_NAME'] + '__' + item['JOB_NAME'];
        if (!failedJobs[jobName]) {
            failedJobs[jobName] = {count: 0, workflow: item['WORKFLOW_NAME'], job: item['JOB_NAME'], data: []};
        }
        failedJobs[jobName].count++;
        item['DURATION'] = moment(item['END_TIME']).diff(item['START_TIME']) / 1000;
        failedJobs[jobName].data.push(item);
    });
    return Object.entries(failedJobs)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, size)
        .reduce((resultObj, [key, {count, data, workflow, job}]) => {
            resultObj[key] = {count, data, workflow, job};
            return resultObj;
        }, {});
}

/**
 * Find low and high parallelism jobs from job execution data.
 * @param {Array} data - Job execution data.
 * @param {number} size - Number of frequently failed jobs to return.
 * @returns {Object} - Frequently failed jobs data.
 */
function lowAndHighParallelism(data, size) {

    const groupedData = data.reduce((acc, curr) => {
        const startTime = curr.START_TIME.split(' ')[0];
        if (!acc[startTime]) {
            acc[startTime] = [];
        }
        acc[startTime].push(curr);
        return acc;
    }, {});

    // Merge data and calculate duration
    const mergedData = Object.values(groupedData).flatMap(group => {
        return group.reduce((acc, curr, index) => {
            if (index === 0) {
                return [curr];
            } else {
                const prevEndTime = new Date(group[index - 1].END_TIME).getTime();
                const currStartTime = new Date(curr.START_TIME).getTime();
                const duration = moment(prevEndTime).diff(currStartTime) / 1000; // Duration in seconds
                acc.push({...curr, duration});
                return acc;
            }
        }, []);
    });

    // Sort merged data by start time
    mergedData.sort((a, b) => new Date(a.START_TIME) - new Date(b.START_TIME));

    // Calculate parallelism for each period
    const periods = [];
    let currentPeriod = [];

    mergedData.forEach(job => {
        if (currentPeriod.length === 0) {
            currentPeriod.push(job);
        } else {
            const lastJob = currentPeriod[currentPeriod.length - 1];
            const lastJobEndTime = new Date(lastJob.END_TIME).getTime();
            const jobStartTime = new Date(job.START_TIME).getTime();
            if (jobStartTime >= lastJobEndTime) {
                periods.push(currentPeriod);
                currentPeriod = [job];
            } else {
                currentPeriod.push(job);
            }
        }
    });

    // Sort periods by parallelism
    periods.sort((a, b) => b.length - a.length);

    // Get top ${size} periods of low and high parallelism
    const topLowParallelismPeriods = periods.slice(0, size);
    const topHighParallelismPeriods = periods.slice(-size).reverse();
    return {topLowParallelismPeriods, topHighParallelismPeriods};
}

function getTotalExecutionsPerMonth(data) {
    const executionsPerMonth = {};
    data.forEach(job => {
        const startTime = new Date(job.START_TIME);
        const year = startTime.getFullYear();
        const month = startTime.getMonth() + 1; // Month is zero-indexed, so add 1

        const monthKey = `${year}-${month.toString().padStart(2, '0')}`; // Format: YYYY-MM

        if (!executionsPerMonth[monthKey]) {
            executionsPerMonth[monthKey] = {count: 0, data: []};
        }

        executionsPerMonth[monthKey].count++;
        executionsPerMonth[monthKey].data.push(job);
    });

    const result = {count: 0, data: []};

    for (const monthData of Object.values(executionsPerMonth)) {
        result.count += monthData.count;
        result.data.push(...monthData.data);
    }

    return result;
}

function getTotalOrderExecutionsPerMonth(data) {
    // Create a dictionary to store the count of executions per ORDER_ID
    const executionsPerOrder = {};

    // Iterate through the data
    data.forEach(item => {
        // Group by ORDER_ID
        const orderID = item.ORDER_ID;

        // Create an object to store job information
        const jobInfo = Object.assign({}, item);

        // Update the count for the current ORDER_ID
        if (!executionsPerOrder[orderID]) {
            executionsPerOrder[orderID] = {
                totalExecutions: 0,
                jobs: []
            };
        }

        executionsPerOrder[orderID].totalExecutions++;
        executionsPerOrder[orderID].jobs.push(jobInfo);
    });

    return executionsPerOrder
}

function getTopMostLongestExecutionJobs(data, size) {
    // Calculate the duration for each job execution
    data.forEach(item => {
        item.duration =  moment(item.END_TIME).diff(item.START_TIME) / 1000; // Duration in milliseconds
    });

    // Sort the data based on the duration in descending order
    data.sort((a, b) => b.duration - a.duration);

    // Get the top ${size} entries
    const topMost = data.slice(0, size);
    console.log("Top " + size + " Jobs with Longest Execution Time:");
    return topMost
}

function getTopMostPeriodsMostOrdersExecuted(data, size) {
    // Group orders by start time
    const ordersByPeriod = {};
    data.forEach(item => {
        const periodKey = new Date(item.START_TIME);
        if (!ordersByPeriod[periodKey]) {
            ordersByPeriod[periodKey] = [];
        }
        ordersByPeriod[periodKey].push(item);
    });

    // Convert the object to an array of { startTime, orderCount, orders } objects
    const periods = Object.keys(ordersByPeriod).map(periodKey => {
        return {
            startTime: new Date(periodKey),
            orderCount: ordersByPeriod[periodKey].length,
            orders: ordersByPeriod[periodKey]
        };
    });

    // Sort the periods based on start time in ascending order
    periods.sort((a, b) => a.startTime - b.startTime);

    // Sort the periods based on order count in descending order
    periods.sort((a, b) => b.orderCount - a.orderCount);

    // Get the top ${size} periods
    const topMostPeriods = periods.slice(0, size);

    // Print the result
    console.log(`Top ${size} Periods with Most Orders Executed:`);

    return topMostPeriods;
}

function getTopMostPeriodsMostJobsExecuted(data, size) {
    // Group jobs by start time
    const jobsByPeriod = {};
    data.forEach(item => {
        const periodKey = new Date(item.START_TIME);
        if (!jobsByPeriod[periodKey]) {
            jobsByPeriod[periodKey] = [];
        }
        jobsByPeriod[periodKey].push(item);
    });

    // Convert the object to an array of { startTime, jobCount } objects
    const periods = Object.keys(jobsByPeriod).map(periodKey => {
        return {
            startTime: new Date(periodKey),
            jobCount: jobsByPeriod[periodKey].length,
            jobs: jobsByPeriod[periodKey]
        };
    });

    // Sort the periods based on start time in ascending order
    periods.sort((a, b) => a.startTime - b.startTime);

    // Sort the periods based on job count in descending order
    periods.sort((a, b) => b.jobCount - a.jobCount);

    // Get the top ${size} periods
    const topMostPeriods = periods.slice(0, size);

    // Print the result
    console.log(`Top ${size} Periods with Most Jobs Executed:`);
    return topMostPeriods
}

/**
 * Get the top most failed workflows based on the count of failed jobs.
 * @param {Array} data - Job execution data.
 * @param {number} size - Number of failed workflows to return.
 * @returns {Array} - Top most failed workflows data.
 */
function getTopMostFailedWorkflows(data, size) {
    // Group job data by workflow
    const groupedByWorkflow = data.reduce((groups, entry) => {
        const workflow = entry.WORKFLOW_NAME;
        if (!groups[workflow]) {
            groups[workflow] = [];
        }
        groups[workflow].push(entry);
        return groups;
    }, {});

    // Filter workflows with at least one failed job, then map to format data
    const failedWorkflows = Object.entries(groupedByWorkflow)
        .filter(([_, entries]) => entries.some(entry => entry.STATE === '2'))
        .map(([workflow, entries]) => ({workflow, data: entries, count: entries.length}));

    // Sort failed workflows by the count of failed jobs
    failedWorkflows.sort((a, b) => b.count - a.count);

    // Return the top 'size' failed workflows
    return failedWorkflows.slice(0, size);
}

function getTopMostWorkflowsByExecutionTime(data, size) {

    // Calculate execution time for each workflow
    const executionTimes = data.map(entry => {
        const startTime = new Date(entry.START_TIME);
        const endTime = new Date(entry.END_TIME);
        const executionTime = endTime - startTime; // in milliseconds
        return {...entry, EXECUTION_TIME: executionTime};
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
        const totalExecutionTime = executions.reduce((sum, entry) => sum + entry.EXECUTION_TIME, 0);
        return {workflow: workflow, totalExecutionTime: totalExecutionTime};
    });

    // Sort workflows by total execution time in descending order
    workflowExecutionTimes.sort((a, b) => b.TOTAL_EXECUTION_TIME - a.TOTAL_EXECUTION_TIME);

    // Get top ${size} workflows
    return workflowExecutionTimes.slice(0, size);
}


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
        await writeReportData(options, data, directory, file, templateData, options.number);
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
 * Write report data based on template type.
 * @param {object} options - Cmd parameters.
 * @param {string} data - Data to write.
 * @param {string} directory - directory.
 * @param {string} fileName - Filename.
 * @param {object} templateData - Template Data.
 * @param {number} size - Default 10.
 */
async function writeReportData(options, data, directory, fileName, templateData, size = 10) {
    const runId = directory.match(/\d+/)[0];
    const jsonObject = {
        title: templateData.title,
        chartType: templateData.ChartType
    };
    let groupedData;
    switch (templateData.id) {
        case 'template_1':
            groupedData = getTopMostFailedWorkflows(JSON.parse(data), size);
            break;
        case 'template_2':
            groupedData = frequentlyFailedJobs(JSON.parse(data), size);
            break;
        case 'template_3':
            groupedData = calculateMaxParallelExecution(JSON.parse(data), size);
            break;
        case 'template_4':
            groupedData = lowAndHighParallelism(JSON.parse(data), size);
            break;
        case 'template_5':
            groupedData = getTotalExecutionsPerMonth(JSON.parse(data));
            break;
        case 'template_6':
            groupedData = getTotalOrderExecutionsPerMonth(JSON.parse(data));
            break;
        case 'template_7':
            groupedData = getTopMostWorkflowsByExecutionTime(JSON.parse(data), size);
            break;
        case 'template_8':
            groupedData = getTopMostLongestExecutionJobs(JSON.parse(data), size);
            break;
        case 'template_9':
            groupedData = getTopMostPeriodsMostOrdersExecuted(JSON.parse(data), size);
            break;
        case 'template_10':
            groupedData = getTopMostPeriodsMostJobsExecuted(JSON.parse(data), size);
            break;

        default:
            console.log(`Given template is not yet implemented...`);
            process.exit(1);
            break;
    }
    if (groupedData) {
        jsonObject.data = groupedData;
        let outputDir;
        if(options.outputDirectory){
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
