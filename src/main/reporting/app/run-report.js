const path = require('path');
const fs = require('fs');
const commander = require('commander');
const {isNumber} = require("lodash");
const init = require('./src/converter');
const CustomLogger = require('./src/logger');

const ProcessingFrequencies = require('./src/config/frequencies');

let logger;

commander.on('--help', function () {
    logger.debug('.....');
    logger.debug('node run-report -t template.json -i inputDir -p "every 3 months, weekly" -o outputDir -c controllerID');
    logger.debug('.....');
});

commander.option('--debug', 'Enable debug mode');

/**
 * Parse command line arguments using Commander.
 * @returns {Object} Parsed options.
 */
function parseCommandLineArguments() {
    commander
        .option('-t, --templateFilePath <jsonFile>', 'Template absolute file path')
        .option('-i, --inputDirectory <inputDirectory>', 'Input directory from where data files will be taken')
        .option('-p, --frequencies <frequencies>', 'Processing frequencies (comma-separated, e.g., "every 3 months, every 6 months, monthly")')
        .option('-o, --outputDirectory <outputDirectory>', 'Output directory where final reports will be created')
        .option('-c, --controllerId <controllerId>', 'Controller Id for which the report needs to be generated')
        .option('-s, --monthFrom <monthFrom>', 'Month from for input file selection e.g. YYYY-MM')
        .option('-e, --monthTo <monthTo>', 'Month to for input file selection e.g. YYYY-MM')
        .option('-n, --hits <hits>', 'Define the hits of report')
        .option('-d, --logDir <directory>', 'Specify the log directory')
        .parse(process.argv);

    const options = commander.opts();
    // Define the command line options
    const logDirectory = options.logDir ? path.resolve(options.logDir) : './logs';
    let custLogger = new CustomLogger(logDirectory, options.debug);
    logger = custLogger.logger;

    // Ensure the log directory exists
    fs.mkdirSync(logDirectory, {recursive: true});
    // If processingFrequencies is provided, split them into an array
    if (typeof options.frequencies === 'string') {
        options.frequencies = options.frequencies.split(',').map(freq => freq.trim());
        // Map processing frequencies to the Enum values
        options.frequencies = options.frequencies.map(freq => {
            const formattedFreq = freq.toLowerCase().replace(/\s+/g, ''); // Convert to lowercase and remove spaces
            switch (formattedFreq) {
                case 'weekly':
                    return ProcessingFrequencies.WEEKLY;
                case 'every2weeks':
                    return ProcessingFrequencies.TWO_WEEKS;
                case 'monthly':
                    return ProcessingFrequencies.MONTHLY;
                case 'every3months':
                    return ProcessingFrequencies.THREE_MONTHS;
                case 'every6months':
                    return ProcessingFrequencies.SIX_MONTHS;
                case 'yearly':
                    return ProcessingFrequencies.YEARLY;
                case 'every3years':
                    return ProcessingFrequencies.THREE_YEARS;
                default:
                    return freq; // Keep the original value if not recognized
            }
        });
    }

    return options;
}

// Validate processing frequencies
function validateProcessingFrequencies(options) {
    let flag = true;
    if (options.frequencies) {
        options.frequencies.forEach(freq => {
            freq = freq.toLowerCase();
            if (!Object.values(ProcessingFrequencies).includes(freq)) {
                logger.error(`Invalid processing frequency: ${freq}. Please provide a valid value.`);
                logger.error(`e.g., "weekly, every 2 weeks, monthly, every 3 months, every 6 months, yearly and every 3 years`);
                flag = false;
            }
        });
    }
    return flag;
}

/**
 * Check if required parameters are provided.
 * @param {Object} options - Command line options.
 */
function validateRequiredParameters(options) {
    if (!options.templateFilePath || !options.inputDirectory || !options.frequencies) {
        logger.error('Usage: node index.js -d <directory> -t <templatePath> -o <outputPath> -i <inputPath> -p <frequencies>');
        if (!options.templateFilePath) {
            logger.error("error: required option '-t, --templateFilePath <jsonFile>' not specified")
        } else if (!options.inputDirectory) {
            logger.error("error: required option '-i, --inputDirectory <inputDirectory>' not specified")
        } else {
            logger.error("error: required option '-p, --frequencies <frequencies>' not specified")
        }
        logger.error('Usage: node index.js -d <directory> -t <templatePath> -o <outputPath> -i <inputPath> -p <frequencies>');
       return false;
    } else {
        logger.debug('Validate: -d <directory> -t <templatePath> -o <outputPath> -i <inputPath> -p <frequencies>');
    }
    return true;
}


/**
 * Check if user input is a valid date in 'yyyy-mm-dd' format.
 * @param {string} userInput - User input string.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidDate(userInput) {
    const dateFormat = /^\d{4}-\d{2}$/; // Regular expression for 'yyyy-mm' format

    if (!dateFormat.test(userInput)) {
        return false;
    }

    const parts = userInput.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is zero-based index

    const date = new Date(year, month, 1);

    // Check if the date components match the input and are valid
    return (
        date.getFullYear() === year &&
        date.getMonth() === month
    );
}

/**
 * Check if parameters are valid.
 * @param {Object} options - Command line options.
 */
function validateNumAndDate(options) {
    let flag = true;
    if (options.hits || options.monthFrom || options.monthTo) {
        if (options.hits && !isNumber(+options.hits)) {
            logger.error(`Invalid hits: ${options.hits}. Please provide a valid value.`);
            flag = false;
        } else if (options.monthFrom && (typeof options.monthFrom != 'string' || !isValidDate(options.monthFrom))) {
            logger.error(`Invalid month from: ${options.monthFrom}. Please provide a valid value.`);
            flag = false;
        } else if (options.monthTo && (typeof options.monthTo != 'string' || !isValidDate(options.monthTo))) {
            logger.error(`Invalid month to: ${options.monthTo}. Please provide a valid value.`);
            flag = false;
        }
    }
    return flag;
}

/**
 * Main application logic.
 * @param {Object} options - Command line options.
 */
async function main(options) {
    try {
        await init(options, logger);
    } catch (error) {
        logger.error(error.message);
    }
}

/**
 * Execute the main application logic.
 */
function run() {
    const options = parseCommandLineArguments();
    if (validateRequiredParameters(options) &&
        validateProcessingFrequencies(options) &&
        validateNumAndDate(options)) {
        main(options).then();
    }
}

module.exports = run;

// Execute the main application logic
run();

