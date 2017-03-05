// Globals
global.winston = new (require('winston').Logger)({
  transports: [
    new (require('winston').transports.Console)({'timestamp':true})
  ]
});

// Set Log Level
winston.level = process.env.LOG_LEVEL || 'info';
winston.log('info', 'Winston Log: ready', winston.level);

// Config manager
var configManager = require('./lib/config');
global.options = {};

configManager.ready().then((data) => {
  global.options = data;
  // Set Global Storage driver
  global.storage = require('./lib/storage');

  // Global files
  global.files = require('./lib/files');
  require('./app');
}).catch(err => console.error(err));