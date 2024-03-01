const winston = require('winston');
const debug = require('debug');
const path = require('path');

class CustomLogger {
    constructor(logDirectory = 'logs') {
        this.logDirectory = logDirectory;

        // Configure winston logger
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.File({ filename: path.join(this.logDirectory, 'service-reporting-error.log'), level: 'error' }),
            ],
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple(),
                winston.format.errors({ stack: true }), // Log stack traces for errors
            ),
        });

        // Enable debug mode if DEBUG environment variable is set
        if (process.env.DEBUG) {
            debug.enabled = true;
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
                level: 'debug'
            }));
        }
    }

    getLogger() {
        return this.logger;
    }
}

module.exports = CustomLogger;
