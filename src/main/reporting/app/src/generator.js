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
