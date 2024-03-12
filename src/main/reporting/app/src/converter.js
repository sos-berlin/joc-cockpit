const fs = require('fs');
const path = require('path');
const moment = require("moment");
const {promisify} = require('util');
let logger = require('./logger');
logger = new logger().getLogger();
const generate = require('./generator');
const utils = require('./utils');

const appendFileAsync = promisify(fs.appendFile);

class PriorityQueue {
    constructor(compareFunction) {
        this.heap = [];
        this.compare = compareFunction;
    }

    enqueue(item) {
        this.heap.push(item);
        this.bubbleUp();
    }

    dequeue() {
        const max = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown();
        }
        return max;
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                break;
            }
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    sinkDown() {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let swap = null;

            if (leftChildIndex < length && this.compare(this.heap[leftChildIndex], this.heap[index]) > 0) {
                swap = leftChildIndex;
            }
            if (rightChildIndex < length && this.compare(this.heap[rightChildIndex], this.heap[index]) > 0 &&
                this.compare(this.heap[rightChildIndex], this.heap[leftChildIndex]) > 0) {
                swap = rightChildIndex;
            }
            if (swap === null) break;

            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }

    peek() {
        return this.heap[0];
    }

    size() {
        return this.heap.length;
    }
}

async function* chunkGenerator(array, chunkSize) {
    for (let i = 0; i < array.length; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
}

async function getTopEntries(array, k, compareFunction, chunkSize = 1000) {
    const pq = new PriorityQueue(compareFunction);
    let count = 0;

    for await (const chunk of chunkGenerator(array, chunkSize)) {
        for (const entry of chunk) {
            pq.enqueue(entry);
            if (pq.size() > k) {
                pq.dequeue();
            }
        }
        count += chunk.length;
        if (count >= k) break; // Stop processing chunks once we have enough top entries
    }

    const result = [];
    while (pq.size() > 0) {
        result.unshift(pq.dequeue());
    }
    return result;
}


/**
 * Check content date from file and organize based on weeks.
 * @param {string} filePath - Path to the file.
 * @param {Array} weeks - Array of week objects.
 * @param {number} frequencyInterval - Interval for frequency.
 * @param {string} runId - Identifier for the run.
 * @param {Object} options - Additional parameters.
 * @param {Object} templateData - Template Data.
 */
async function checkDateFromContent(filePath, weeks, frequencyInterval, runId, options, templateData) {
    try {
        let obj = {};
        let data = await utils.convertCsvToJson(filePath, options.controllerId, templateData);
        console.log(`CSV file ${filePath} is converted successfully into JSON.`);
        data = data.reverse();
        for (const item of data) {
            let rowData = item;
            if (typeof rowData == 'string') {
                rowData = JSON.parse(item);
            }
            const contentDate = new Date(rowData.START_TIME).setHours(0, 0, 0, 0);
            for (let i = 0; i < weeks.length; i++) {
                const startDate = new Date(weeks[i].startDate).setHours(0, 0, 0, 0);
                const _date = new Date(weeks[i].startDate);
                const textEndDate = moment(_date.setDate((_date.getDate() + frequencyInterval * 7) - 1)).format('YYYY-MM-DD');
                const endDate = new Date(textEndDate).setHours(0, 0, 0, 0);
                if (!isNaN(startDate) && !isNaN(endDate)) {
                    if (contentDate >= startDate && contentDate <= endDate) {
                        const prop = `${weeks[i].startDate}_${textEndDate}`;
                        obj[prop] ? obj[prop].push(item) : obj[prop] = [item];
                    }
                } else {
                    handleError(`Invalid date at index ${i} in weeks array.`, null);
                }
            }
        }

        for (let i = 0; i < weeks.length; i += frequencyInterval) {
            const startIndex = i;
            const _date = new Date(weeks[startIndex].startDate);
            const endWeekDate = moment(_date.setDate((_date.getDate() + frequencyInterval * 7) - 1)).format('YYYY-MM-DD');

            let outputArray = obj[`${weeks[startIndex].startDate}_${endWeekDate}`] || [];

            // Write output file
            if (outputArray.length !== 0) {
                const fileName = `${weeks[startIndex].startDate}_to_${endWeekDate}.json`;
                try {
                    // Check if the file exists synchronously
                    fs.accessSync(path.join('tmp/' + runId, fileName), fs.constants.F_OK);
                    if (templateData.execution === "DURATION") {
                        // Example comparator function to compare objects based on 'duration' property
                        const compareByDuration = (a, b) => b.duration - a.duration;
                        // Get top 10 entries based on duration
                        const top10Entries = await getTopEntries(outputArray, options.hits, compareByDuration);
                        await writeJsonToFile(path.join('tmp/' + runId, fileName), top10Entries, true);
                    } else {
                        await writeJsonToFile(path.join('tmp/' + runId, fileName), outputArray, true);
                    }
                } catch (err) {
                    // File doesn't exist or other error occurred
                    if (templateData.execution === "DURATION") {
                        // Example comparator function to compare objects based on 'duration' property
                        const compareByDuration = (a, b) => b.duration - a.duration;
                        // Get top 10 entries based on duration
                        const top10Entries = await getTopEntries(outputArray, options.hits, compareByDuration);
                        await writeJsonToFile(path.join('tmp/' + runId, fileName), top10Entries);
                    } else {
                        await writeJsonToFile(path.join('tmp/' + runId, fileName), outputArray);
                    }
                }
            }
        }
    } catch (error) {
        handleError(error.message, error);
    }
}


/**
 * Write JSON data to file.
 * @param {string} outputPath - Path to write the file.
 * @param {object} jsonData - Data to be written.
 * @param {boolean} addComma - Add comma to starting or not.
 */
async function writeJsonToFile(outputPath, jsonData, addComma = false) {
    try {
      
        const dataLength = jsonData.length;
        const chunkSize = 1024; // Adjust the chunk size as needed

        for (let i = 0; i < dataLength; i += chunkSize) {
            const chunk = jsonData.slice(i, i + chunkSize);
            let jsonString = '';
            if (i === 0 && !addComma) {
                jsonString = JSON.stringify(chunk, null, 2).slice(1, -1) + '\n'
            } else {
                jsonString = ',' + JSON.stringify(chunk, null, 2).slice(1, -1) + '\n'
            }
            await appendFileAsync(outputPath, jsonString);
        }
        console.log(`JSON data has been written to file ${outputPath} successfully.`);
    } catch (error) {
        console.error('Error writing JSON file:', error);
        throw new Error(`Error writing JSON file: ${error.message}`);
    }
}

async function processCsvFiles(csvFilePaths, outputJsonPath, templateData, options) {
    try {
        const combinedJsonData = await combineCsvToJson(csvFilePaths, templateData, options);
        if (templateData.execution === "DURATION") {
            // Example comparator function to compare objects based on 'duration' property
            const compareByDuration = (a, b) => b.duration - a.duration;
            // Get top 10 entries based on duration
            const top10Entries = await getTopEntries(combinedJsonData, options.hits, compareByDuration);
            await writeJsonToFile(outputJsonPath, top10Entries);
        } else {
            await writeJsonToFile(outputJsonPath, combinedJsonData);
        }
    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Process CSV files and combine them into JSON.
 * @param {Array} csvFilePaths - Array of CSV file paths.
 * @param {Object} templateData - Template Data.
 * @param {Object} options - Command-line options.
 * @returns {Array} Combined JSON data.
 */
async function combineCsvToJson(csvFilePaths, templateData, options) {
    let combinedData = [];
    for (const csvFilePath of csvFilePaths) {
        const filePath = path.join(options.inputDirectory, csvFilePath);
        const jsonData = await utils.convertCsvToJson(filePath, options.controllerId, templateData);
        combinedData = combinedData.concat(jsonData);
    }
    return combinedData;
}

/**
 * Process the files based on frequency type and interval
 * @param runId - Temporary created directory
 * @param files
 * @param frequencyType
 * @param frequencyInterval
 * @param templateData
 * @param options
 */
async function checkFileNameWithFrequency(runId, files, frequencyType, frequencyInterval, templateData, options) {
    let data = {};
    // Example usage:
    const uniqueString = utils.generateUnique16BitString();
    const tmpFileName = path.join('tmp/' + runId, uniqueString + '.json');
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
        if (frequencyType === 'WEEK') {
            const userInputStart = fileYear + '-' + fileMonth + '-' + '01';
            const userInputEnd = getEndOfMonth(userInputStart);
            const allDatesBetweenWeeks = getAllDatesBetweenWeeks(userInputStart, userInputEnd);
            if (allDatesBetweenWeeks.length > 0) {
                await checkDateFromContent(path.join(options['inputDirectory'], file), allDatesBetweenWeeks, frequencyInterval, runId, options, templateData);
            }
            data.file = tmpFileName;
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
    if (!data.file) {
        for (let prop in data) {
            await processCsvFiles(data[prop], path.join('tmp/' + runId, prop + '.json'), templateData, options);
        }
    }
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
                await utils.checkAndCreateDirectory(path.join('tmp', runId));

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
                        await checkFileNameWithFrequency(runId, inputFiles, frequencyType, interval, JSON.parse(templateData).data, options);
                    }

                   await generate(templateData, runId, options);
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
