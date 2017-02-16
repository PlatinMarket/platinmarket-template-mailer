var config = require('../config/config');
var driver = require("dbox");

config = Object.assign({}, config.dropbox || {});

function Files(){
  this.ready = (config.access_token && config.appkey && config.appsecret);
  this.client = null;
  if (this.ready) {
    console.log('File driver ready for command. Using driver: ' + this.driver);
    this.client = driver.app({ app_key: config.appkey, app_secret: config.appsecret }).client(config.access_token);

  }
}

Files.prototype.getFiles = function () {
  return new Promise((resolve, reject) => {
    if (!this.ready) return resolve([]);
    this.client.readdir('.', (status, files) => {
      console.log(arguments);
      resolve(files || status);
    });
  });
};

// Module Exports
var f = new Files();
module.exports = f;