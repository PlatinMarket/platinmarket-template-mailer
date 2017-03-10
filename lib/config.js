const fs = require('fs');
const path = require('path');

// Load config from source
function loadConfig(source) {
  return new Promise((resolve, reject) => {
    switch (source) {
      case 'local':
        resolve(require('../config/config'));
        break;
      case 'remote':
        var gcloud = require('google-cloud');

        // Options
        var bucketName = process.env.CFG_BUCKET;
        var projectId = process.env.CFG_PROJECT_ID;
        var configFile = process.env.CFG_CONFIG_FILE || 'config.json';

        // Check vars
        if (!bucketName || !projectId || !configFile) reject(new Error('Config file not found'));

        // Create bucket
        var bucket = gcloud.storage({ projectId: projectId }).bucket(bucketName);

        // Write log
        winston.log('info', 'Accessing config file from remote');

        // Get bucket file
        bucket.file(configFile).download().then((data) => {

          resolve(JSON.parse(data.toString()));
        }).catch((err) => reject(err));

        break;
      default:
        reject(new Error('Config source ' + source + ' not defined'));
        break;
    }
  });
}

// Constructor
function Config(){
  var configFile = path.resolve('./config/config.js');
  var configSource = process.env.CFG_SOURCE || 'local';
  if (!fs.existsSync(configFile) && configSource == 'local') throw new Error('Config file ' + configFile + ' not found');

  this.data = {};
}

// Read config file
Config.prototype.read = function(key) {
  return Objet.assign(this.data[key] || {});
};

// Read all config file
Config.prototype.readAll = function() {
  return Object.assign(this.data);
};

Config.prototype.ready = function() {
  var configSource = process.env.CFG_SOURCE || 'local';
  return loadConfig(configSource).then(data => Promise.resolve(this.data = data));
};

module.exports = new Config();