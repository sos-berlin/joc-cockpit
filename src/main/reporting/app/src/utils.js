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
        console.log(`Output file ${outputPath} written successfully.`);
        return fs.appendFileSync(outputPath, JSON.stringify(data, null, 2) );
    } catch (error) {
        logger.error(`Error writing output file: ${error.message}`);
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
    generateUnique16BitString,
    checkAndCreateDirectory
};
