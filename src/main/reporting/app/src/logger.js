const winston = require('winston');
const debug = require('debug');

// Configure winston logger
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
});

// Enable debug mode if DEBUG environment variable is set
if (process.env.DEBUG) {
    debug.enabled = true;
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: 'debug'
    }));
}

module.exports = logger;
