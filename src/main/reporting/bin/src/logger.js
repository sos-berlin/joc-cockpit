const winston = require('winston');

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

module.exports = logger;