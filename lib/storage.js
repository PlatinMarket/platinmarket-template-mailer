var options = require('../config/config');
var fs = require('fs');

options = Object.assign({
  driver: 'fs'
}, (options ? options.storage : {}) || {});

function Storage() {
  // Check driver if exists
  if (!fs.existsSync('./lib/storage/' + options.driver + '.js')) throw new Error ('Storage driver `' + options.driver + '` not found');

  // Load driver
  this.driver = require('./storage/' + options.driver)(options);
}

Storage.prototype.joinPath = function(){
  return this.driver.joinPath.apply(this.driver, arguments);
};

Storage.prototype.resolvePath = function(){
  return this.driver.resolvePath.apply(this.driver, arguments);
};

Storage.prototype.readFile = function(path){
  return this.driver.readFile(path);
};

Storage.prototype.readdir = function(path){
  return this.driver.readdir(path);
};

Storage.prototype.mkdir = function(path){
  return this.driver.mkdir(path);
};

Storage.prototype.writeFile = function (path, data) {
  return this.driver.writeFile(path, data);
};

Storage.prototype.exists = function (path) {
  return this.driver.exists(path);
};

Storage.prototype.unlink = function (path) {
  return this.driver.unlink(path);
};

Storage.prototype.stat = function (path) {
  return this.driver.stat(path);
};

// Exports module
var s = new Storage();
module.exports = s;