var fs = require('fs');

var config = Object.assign({
  driver: 'fs'
}, (options ? options.storage : {}) || {});

function Storage() {
  // Check driver if exists
  if (!fs.existsSync('./lib/storage/' + config.driver + '.js')) throw new Error ('Storage driver `' + config.driver + '` not found');

  // Load driver
  this.driver = require('./storage/' + config.driver)(config);
}

Storage.prototype.joinPath = function(){
  return this.driver.joinPath.apply(this.driver, arguments);
};

Storage.prototype.resolvePath = function(){
  return this.driver.resolvePath.apply(this.driver, arguments);
};

Storage.prototype.readFile = function(){
  return this.driver.readFile.apply(this.driver, arguments);
};

Storage.prototype.readdir = function(){
  return this.driver.readdir.apply(this.driver, arguments);
};

Storage.prototype.mkdir = function(){
  return this.driver.mkdir.apply(this.driver, arguments);
};

Storage.prototype.writeFile = function () {
  return this.driver.writeFile.apply(this.driver, arguments);
};

Storage.prototype.exists = function () {
  return this.driver.exists.apply(this.driver, arguments);
};

Storage.prototype.unlink = function () {
  return this.driver.unlink.apply(this.driver, arguments);
};

Storage.prototype.rmdir = function () {
  return this.driver.rmdir.apply(this.driver, arguments);
};

Storage.prototype.stat = function () {
  return this.driver.stat.apply(this.driver, arguments);
};

// Exports module
var s = new Storage();
module.exports = s;