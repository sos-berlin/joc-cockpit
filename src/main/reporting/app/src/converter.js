const fs = require('fs');
const path = require('path');
const moment = require("moment");
let logger = require('./logger');
logger = new logger().getLogger();
const readline = require('readline');
const generate = require('./generator');
const utils = require('./utils');
const DB = require('./db');

/**
 * Process the files based on frequency type and interval
 * @param runId - Temporary created directory
 * @param files
 * @param frequencyType
 * @param frequencyInterval
 * @param templateData
 * @param options
 */
async function insertDataIntoDb(runId, files, frequencyType, frequencyInterval, templateData, options) {
    DB.createTable(runId, templateData.type);
    let lineCount = 0;
    const batchSize = 20000;
    let data = {};
    let previousKey = '';
    for (const file of files) {
        const fileNameParts = file.split('.')[0].split('-');
        const fileYear = parseInt(fileNameParts[0], 10);
        const fileMonth = parseInt(fileNameParts[1], 10);
        if (options.monthFrom) {
            const arr = options.monthFrom.split('-');
            const fromYear = parseInt(arr[0], 10);
            const fromMonth = parseInt(arr[1], 10);
            if (fileYear < fromYear || (fileYear == fromYear && fileMonth < fromMonth)) {
                continue;
            }
        }
        if (options.monthTo) {
            const arr = options.monthTo.split('-');
            const fromYear = parseInt(arr[0], 10);
            const fromMonth = parseInt(arr[1], 10);
            if (fileYear > fromYear || (fileYear == fromYear && fileMonth > fromMonth)) {
                continue;
            }
        }
        if(!data.files){
            data.files = [];
        }
        data.files.push(file)
        if (frequencyType === 'WEEK') {
            const userInputStart = fileYear + '-' + fileMonth + '-' + '01';
            const userInputEnd = getEndOfMonth(userInputStart);
            const allDatesBetweenWeeks = getAllDatesBetweenWeeks(userInputStart, userInputEnd);
            if (allDatesBetweenWeeks.length > 0) {
                allDatesBetweenWeeks.forEach((dates)=>{
                    const key = dates.startDate + '_to_' + dates.endDate;
                    if (!data[key]) {
                        data[key] = [];
                    }
                    data[key].push(file);
                })
            }
        } else if (frequencyType === 'MONTH') {
            const key = getKeyBasedOnFrequency(fileYear, fileMonth, frequencyInterval);
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push(file);
        } else {
            let key = fileYear;
            if (frequencyInterval === 3) {
                let endYear = +fileYear + 2;
                key = `${fileYear}-${endYear}`;
                if (!previousKey) {
                    previousKey = key;
                } else {
                    if (previousKey.includes(fileYear) || previousKey.includes((+fileYear - 1))) {
                        key = previousKey;
                    }
                }
            }
            if (data[key]) {
                data[key].push(file);
            } else {
                data[key] = [file]
            }
        }
    }

    if(data.files) {
        for (const csvFilePath of data.files) {
            console.log(`Processing file ${csvFilePath}...`);
            const readStream = fs.createReadStream(path.join(options.inputDirectory, csvFilePath), {encoding: 'utf-8'});
            const rl = readline.createInterface({
                input: readStream,
                crlfDelay: Infinity
            });

            let headers;
            let isFirstLine = true;

            let lines = [];
            for await (const line of rl) {
                if (isFirstLine) {
                    headers = line.trim().split(';');
                    isFirstLine = false;
                } else {
                    const values = line.trim().split(';');
                    const obj = {};
                    if (headers) {
                        for (let j = 0; j < headers.length; j++) {
                            obj[headers[j]] = values[j];
                        }
                        let flag = true;
                        if (options.controllerId) {
                            flag = obj.CONTROLLER_ID === options.controllerId;
                        }
                        if (templateData?.data && flag) {
                            if (templateData.data.status === "FAILED") {
                                flag = obj.STATE === '2';
                            } else if (templateData.data.status === "SUCCESS") {
                                flag = obj.STATE === '1';
                            }

                            if (flag && templateData.data.orderState === 'CANCELLED') {
                                flag = obj.ORDER_STATE === '7';
                            }
                            if (flag && templateData.data.criticality === 'HIGH') {
                                flag = obj.CRITICALITY === '2';
                            }
                        }

                        if (flag) {
                            obj.duration = moment(obj.END_TIME).diff(obj.START_TIME) / 1000;
                            delete obj.ID;
                            delete obj.MODIFIED;
                            delete obj.WORKFLOW_VERSION_ID;
                            delete obj.POSITION;
                            delete obj.AGENT_ID;
                            delete obj.CREATED;
                            delete obj.WORKFLOW_PATH;
                            delete obj.CONTROLLER_ID;
                            delete obj.ERROR;
                            if (obj.JOB_NAME) {
                                delete obj.ORDER_ID;
                            }
                            obj.START_TIME = moment(obj.START_TIME).format('YYYY-MM-DD HH:mm:ss');
                            obj.END_TIME = moment(obj.END_TIME).format('YYYY-MM-DD HH:mm:ss');
                            lines.push(obj);
                            lineCount++;
                            if (lineCount % batchSize === 0) {
                                DB.insertRecord(lines, templateData.type);
                                lines = [];
                            }
                        }
                    }
                }
            }
            console.log('Total records found in file ' + csvFilePath, lines.length)
            if (lines.length > 0) {
                DB.insertRecord(lines, templateData.type);
                lines = [];
            }
        }
        console.log('Total records inserted into db ' + lineCount)
    }
    return data;
}


/**
 * Check if a date is within a specific range.
 * @param {number} year - Year of the file.
 * @param {number} month - Month of the file.
 * @param {number} frequencyInterval - Interval in months.
 * @returns {string}
 */
function getKeyBasedOnFrequency(year, month, frequencyInterval) {
    if (frequencyInterval === 1) {
        return `${year}-${month.toString().padStart(2, '0')}`;
    } else {
        const quarter = Math.ceil(month / frequencyInterval);
        if (frequencyInterval === 3) {
            return `${year}-Q${quarter}`;
        } else {
            return `${year}-H${quarter}`;
        }
    }
}


/**
 * Get the end of the month for a given date.
 * @param {string} inputDate - Input date in "YYYY-MM-DD" format.
 * @returns {string} End of the month in "YYYY-MM-DD" format.
 */
function getEndOfMonth(inputDate) {
    const inputDateObj = new Date(inputDate);
    // Get the last day of the month
    const lastDay = new Date(inputDateObj.getFullYear(), inputDateObj.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${(lastDay.getMonth() + 1).toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;
}

/**
 * Get all dates between weeks for a given date range.
 * @param {string} startDate - Start date in "YYYY-MM-DD" format.
 * @param {string} endDate - End date in "YYYY-MM-DD" format.
 * @returns {Array} Array of objects containing start and end dates for each week.
 */
function getAllDatesBetweenWeeks(startDate, endDate) {
    const result = [];
    const currentDate = new Date(startDate);
    while (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    // Iterate through each week until reaching or exceeding the end date
    while (currentDate <= new Date(endDate)) {
        const currentWeekStart = new Date(currentDate);
        currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);

        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

        let obj = {
            startDate: formatDate(currentWeekStart),
            endDate: formatDate(currentWeekEnd),
            weekNum: getWeekNumber(currentWeekStart)
        };

        // Add all dates within the week to the result
        result.push(obj);

        // Move to the next week
        currentDate.setDate(currentDate.getDate() + 7);
    }
    return result;
}


/**
 * Format a date in "YYYY-MM-DD" format.
 * @param {Date} date - Input date.
 * @returns {string} Formatted date string.
 */
function formatDate(date) {
    return (
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        date.getDate().toString().padStart(2, '0')
    );
}

/**
 * Get the ISO week number for a given date.
 * @param {string} inputDate - Input date in "YYYY-MM-DD" format.
 * @returns {number} ISO week number.
 */
function getWeekNumber(inputDate) {
    const date = new Date(inputDate);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7)); // Set to Monday of the current week
    const yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

/**
 * Initialize processing based on options.
 * @param {Object} options - Command-line options.
 */
async function init(options) {
    try {
        console.log('Reading ' + options.templateFilePath + ' template file.')
        utils.readJsonFile(options.templateFilePath)
            .then(async (templateData) => {

                // Check the template and based on this read orders or jobs data directory
                options['inputDirectory'] += JSON.parse(templateData).type === 'ORDER' ? '/orders' : '/jobs';
                const inputFiles = await utils.readInputDirectory(options['inputDirectory']);
                if (!inputFiles || inputFiles.length === 0) {
                    logger.error('Data input directory is empty');
                    process.exit(1);
                } else {
                    console.log('Read ' + options['inputDirectory'] + ' directory and receive ' + inputFiles.length + ' files')
                }

                const runId = utils.generateUnique16BitString();
                await utils.checkAndCreateDirectory('tmp');

                if (options.frequencies) {
                    for (const frequency of options.frequencies) {
                        let frequencyType = '';
                        let interval = 0;
                        switch (frequency) {
                            case 'weekly':
                            case 'every2weeks':
                                interval = (frequency === 'weekly') ? 1 : 2;
                                frequencyType = 'WEEK';
                                break;
                            case 'monthly':
                            case 'every3months':
                            case 'every6months':
                                interval = (frequency === 'monthly') ? 1 : (frequency === 'every3months') ? 3 : 6;
                                frequencyType = 'MONTH';
                                break;
                            case 'yearly':
                            case 'every3years':
                                interval = (frequency === 'yearly') ? 1 : 3;
                                frequencyType = 'YEAR';
                                break;
                            default:
                                console.error(`Invalid processing frequency: ${frequency}. Please provide a valid value (e.g., monthly, 3months, 6months, yearly).`);
                                continue; // Skip the invalid frequency
                        }
                        console.log('Start report processing for frequency ', frequency)
                        const files = await insertDataIntoDb(runId, inputFiles, frequencyType, interval,JSON.parse(templateData), options);
                        await generate(templateData, runId, options, files);
                    }
                }
            })
            .catch(e => {
                handleError('Error while reading template data from ' + options.templateFilePath, e);
                handleError('...Process exit', new Error());
            });
    } catch (error) {
        handleError('', error);
    }
}

/**
 * Handle errors.
 * @param {string} message - Error message.
 * @param {Error} error - Error object.
 */
function handleError(message, error) {
    console.error(message, error);
    logger.error(message, error);
}

module.exports = init;
