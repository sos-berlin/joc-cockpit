const fs = require('fs');
let logger = require('./logger');
logger = new logger().getLogger();

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
        return new Promise((resolve, reject) => {
            // Create a readable stream to read the input file
            const readStream = fs.createReadStream(csvFilePath, {encoding: 'utf-8'});
            // Event listener for 'data' event, triggered when data is available to read
            const arr = [];
            let headers = [];
            readStream.on('data', (chunk) => {
                // Split CSV data into lines
                let lines = chunk.split('\n');

                // Extract header (first line)
                if (headers.length === 0) {
                    headers = lines[0].trim().split(';');
                    lines = lines.splice(0, 1);
                }

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
                    if (flag) {
                        arr.push(obj);
                    }
                }

            });

            // Event listener for 'close' event, triggered when file reading is finished
            readStream.on('close', async () => {
                console.log('File reading is finished...');
                resolve(arr);
            });
            // Event listener for 'error' event, triggered when an error occurs
            readStream.on('error', (error) => {
                console.error('Error reading file:', error);
                logger.error('Error reading file:', error);
                reject(error); // Reject the promise with the error
            });
        });
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
