const commander = require('commander');
const init = require('./converter');
const logger = require('./logger');
const ProcessingFrequencies = require('./config/frequencies');
const {isNumber} = require("lodash");

/**
 * Parse command line arguments using Commander.
 * @returns {Object} Parsed options.
 */
function parseCommandLineArguments() {
    commander
        .requiredOption('-t, --templateFilePath <jsonFile>', 'Template absolute file path')
        .requiredOption('-i, --inputDirectory <inputDirectory>', 'Input directory from where data files will be taken')
        .requiredOption('-p, --frequencies <frequencies>', 'Processing frequencies (comma-separated, e.g., "every 3 months, every 6 months, monthly")')
        .option('-o, --outputDirectory <outputDirectory>', 'Output directory where final reports will be created')
        .option('-s, --startDate <startDate>', 'Start date for input file selection e.g. YYYY-MM-DD')
        .option('-n, --number <number>', 'Define the size of report')
        .parse(process.argv);

    const options = commander.opts();

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
    if (options.frequencies) {
        options.frequencies.forEach(freq => {
            freq = freq.toLowerCase();
            if (!Object.values(ProcessingFrequencies).includes(freq)) {
                console.error(`Invalid processing frequency: ${freq}. Please provide a valid value.`);
                logger.error(`Invalid processing frequency: ${freq}. Please provide a valid value.`);
                process.exit(1);
            }
        });
    }
}


/**
 * Check if required parameters are provided.
 * @param {Object} options - Command line options.
 */
function validateRequiredParameters(options) {
    if (!options.templateFilePath || !options.inputDirectory || !options.frequencies) {
        console.error('Usage: node index.js -d <directory> -t <templatePath> -o <outputPath> -i <inputPath> -p <frequencies>');
        logger.error('Usage: node index.js -d <directory> -t <templatePath> -o <outputPath> -i <inputPath> -p <frequencies>');
        process.exit(1);
    } else {
        console.log('Validate: -d <directory> -t <templatePath> -o <outputPath> -i <inputPath> -p <frequencies>');
    }
}

/**
 * Check if user input is a valid date in 'yyyy-mm-dd' format.
 * @param {string} userInput - User input string.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidDate(userInput) {
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/; // Regular expression for 'yyyy-mm-dd' format

    if (!dateFormat.test(userInput)) {
        return false;
    }

    const parts = userInput.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is zero-based index
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    // Check if the date components match the input and are valid
    return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
    );
}

/**
 * Check if parameters are valid.
 * @param {Object} options - Command line options.
 */
function validateNumAndDate(options) {
    if (options.number || options.startDate) {
        if (options.number && !isNumber(+options.number)) {
            console.error(`Invalid number: ${options.number}. Please provide a valid value.`);
            logger.error(`Invalid number: ${options.number}. Please provide a valid value.`);
            process.exit(1);
        } else if (options.startDate && (typeof options.startDate != 'string' || !isValidDate(options.startDate))) {
            console.error(`Invalid start date: ${options.startDate}. Please provide a valid value.`);
            logger.error(`Invalid start date: ${options.startDate}. Please provide a valid value.`);
            process.exit(1);
        }
    }
}

/**
 * Main application logic.
 * @param {Object} options - Command line options.
 */
async function main(options) {
    try {
        await init(options);
    } catch (error) {
        console.log.error(error.message);
        logger.error(error.message);
    }
}

/**
 * Execute the main application logic.
 */
function run() {
    const options = parseCommandLineArguments();
    validateRequiredParameters(options);
    validateProcessingFrequencies(options);
    validateNumAndDate(options);
    main(options).then();
}

module.exports = run;

// Execute the main application logic
run();

