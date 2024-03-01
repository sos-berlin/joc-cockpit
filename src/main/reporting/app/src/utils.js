const fs = require('fs');
const logger = require('./logger');

/**
 * Read files from a directory.
 * @param {string} directoryPath - Path to the directory.
 * @returns {Promise<Array>} A promise that resolves with an array of file names.
 */
function readInputDirectory(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(`Error reading input directory: ${err.message}`);
            } else {
                resolve(files);
            }
        });
    });
}

/**
 * Write data to an output file.
 * @param {string} outputPath - Path to the output file.
 * @param {object} data - Data to write to the file.
 * @returns {Promise<string>} A promise that resolves with a success message.
 */
function writeOutputFile(outputPath, data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        console.log(`Output file ${outputPath} written successfully.`);
        return fs.appendFileSync(outputPath, jsonData);
    } catch (error) {
        logger.error(`Error writing output file: ${error.message}`);
        throw error;
    }
}

function deleteDirectory(directoryPath) {
    fs.rm(directoryPath, {recursive: true}, (err) => {
        if (err) {
            console.error(`Error deleting directory: ${err.message}`);
        } else {
            console.log(`Directory ${directoryPath} is deleted successfully.`);
        }
    });
}

// Function to process data in chunks asynchronously
async function processDataInChunks(headers, dataArray, chunkSize, processChunk, controllerId, templateData) {
    let index = 0;
    let arr = [];

    async function processNextChunk() {
        const chunk = dataArray.slice(index, index + chunkSize);
        await processChunk(headers, chunk, arr, controllerId, templateData)
        index += chunkSize;
        // If there are more chunks to process, schedule the next chunk after a delay
        if (index < dataArray.length) {
            return new Promise(resolve => {
                setTimeout(async () => {
                    await processNextChunk();
                    resolve(); // Recursively call processNextChunk asynchronously
                }, 10);

            });
        }
    }

    // Start processing the first chunk
    await processNextChunk();
    return arr;
}

// Sample function to process each chunk
async function processChunk(headers, lines, jsonArray, controllerId, templateData) {
    // Iterate over each line (starting from 1, as 0 is the header)
    await new Promise(resolve => {
        for (let i = 0; i < lines.length; i++) {
            const values = lines[i].trim().split(';');
            // Create an object with header keys and corresponding values
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = values[j];
            }
            let flag = false;
            if (controllerId) {
                flag = obj.CONTROLLER_ID === options.controllerId;
            } else {
                flag = true;
            }
            if (templateData && flag) {
                // Filter data based on the status
                if (templateData.status === "FAILED") {
                    flag = obj.STATE === '2';
                } else if (templateData.status === "SUCCESS") {
                    flag = obj.STATE === '1';
                }
                if (templateData.orderState === 'CANCELLED') {
                    flag = obj.ORDER_STATE === '7';
                }

                if (templateData.criticality === 'HIGH') {
                    flag = obj.CRITICALITY === '2';
                }
            }
            if(flag) {
                jsonArray.push(obj);
            }
        }
        resolve();
    });
}


/**
 * Convert CSV to JSON.
 * @param {string} csvFilePath - Path to the CSV file.
 * @param {string} controllerId - Filter data by controller ID.
 * @param {Object} templateData - Template data.
 * @returns {Promise<Array>} A promise that resolves with the JSON array.
 */
async function convertCsvToJson(csvFilePath, controllerId, templateData) {

    try {
        console.log(`Converting file ${csvFilePath} into JSON...`);
        const csvData = await fs.readFileSync(csvFilePath, 'utf8');
        // Split CSV data into lines
        const lines = csvData.split('\n');

        // Extract header (first line)
        const headers = lines[0].trim().split(';');

        // Define the chunk size
        const chunkSize = 1000; // Adjust as needed based on your processing requirements

        // Process data in chunks
        return await processDataInChunks(headers, lines, chunkSize, processChunk, controllerId, templateData);
    } catch (error) {
        console.error('Error processing CSV:' + csvFilePath, error.message);
        logger.error('Error processing CSV:' + csvFilePath, error.message);
        throw error;
    }
}


/**
 * Read content from a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {Promise<string>} A promise that resolves with the file content.
 */
async function readJsonFile(filePath) {
    try {
        return await fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        logger.error(`Error reading JSON file: ${error.message}`);
        throw error;
    }
}

function generateUnique16BitString() {
    // Generate a timestamp (milliseconds since the Unix epoch)
    const timestamp = Date.now();
    // Generate a random 6-digit number
    const randomComponent = Math.floor(Math.random() * 1000000);

    // Combine the timestamp and random component to create a unique string
    const uniqueString = `${timestamp}${randomComponent}`;

    // Take the last 16 characters to ensure a 16-bit string
    return uniqueString.slice(-16);
}

/**
 * Check the directory existence, if not found then create it
 * @param {string} directoryPath
 */
async function checkAndCreateDirectory(directoryPath) {
    // Check if the directory exists
    if (!fs.existsSync(directoryPath)) {
        // Create the directory if it doesn't exist
        try {
            await fs.mkdirSync(directoryPath, {recursive: true});
        } catch (e) {
            console.error(e);
            logger.error(e);
            process.exit(1);
        }
        console.log(`Directory '${directoryPath}' created successfully.`);
    } else {
        console.log(`Directory '${directoryPath}' already exists.`);
    }
}

// Export the utility function
module.exports = {
    readInputDirectory,
    writeOutputFile,
    readJsonFile,
    convertCsvToJson,
    generateUnique16BitString,
    checkAndCreateDirectory,
    deleteDirectory
};
