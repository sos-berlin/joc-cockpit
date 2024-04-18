const winston = require('winston');
const path = require('path');

class CustomLogger {
    constructor(logDirectory, isDebug) {
        if (logDirectory) {
            this.logDirectory = logDirectory;
            // Define transports for console and debug file
            // Define transports for debug file and error file
            let debugTransport;
            if (isDebug) {
                debugTransport = new winston.transports.File({
                    filename: path.join(this.logDirectory, 'service-reporting-debug.log'),
                    level: 'debug',
                    handleExceptions: true
                });
            }
            const errorTransport = new winston.transports.File({
                filename: path.join(this.logDirectory, 'service-reporting-error.log'),
                level: 'error'
            });

            // Define format for error messages
            const errorFormat = winston.format.printf(({level, message, timestamp, stack}) => {
                return `${timestamp} ${level}: ${message} ${stack || ''}`;
            });
            // Configure winston logger
            this.logger = winston.createLogger({
                exitOnError: false, // Don't exit the process when an error occurs
                format: winston.format.combine(
                    winston.format.timestamp(),
                    errorFormat // Log stack traces for error
                ),
                transports: [
                    new winston.transports.Console({
                        format: winston.format.simple(),
                    }),
                    errorTransport  // Log 'error' and above to error file
                ]
            });
            // Log 'debug' and above to debug file
            if (isDebug) {
                this.logger.add(debugTransport);
                this.logger.debug('Debug mode enabled');
            } else {
                this.logger.add(new winston.transports.Console({level: 'debug'}));
            }
        }
    }

    getLogger() {
        return this.logger;
    }
}

module.exports = CustomLogger;
