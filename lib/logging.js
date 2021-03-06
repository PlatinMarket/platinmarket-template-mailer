'use strict';

const winston = require('winston');
const expressWinston = require('express-winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

// Set colorize options
const colorize = process.env.NODE_ENV !== 'production';

// Set Log Level
winston.level = process.env.LOG_LEVEL || 'info';

// Create Transport
function createTransport(){
  if (process.env.NODE_ENV !== 'production') {
    return new winston.transports.Console({
      level: winston.level,
      timestamp: true,
      colorize: colorize
    })
  }
  return new LoggingWinston({
    level: winston.level,
    projectId: process.env.PROJECT_ID,
    logName: "platinmarket-template-mailer"
  });
}

// Logger to capture all requests and output them to the console.
const requestLogger = expressWinston.logger({
  winstonInstance: winston.createLogger({ transports: [ createTransport() ] }),
  expressFormat: true,
  meta: false,
  ignoredRoutes: [ '/healthz', '/red-mars.png', '/favicon.ico' ]
});
// Logger to capture any top-level errors and output json diagnostic info.
const errorLogger = expressWinston.errorLogger({
  transports: [ createTransport() ]
});

const defLog = winston.createLogger({ transports: [ createTransport() ] });

module.exports = {
  requestLogger: requestLogger,
  errorLogger: errorLogger,
  log: defLog.log.bind(defLog)
};

defLog.log('verbose', 'Winston Log: ready', winston.level);