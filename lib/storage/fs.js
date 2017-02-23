var fs = require('fs');
var path = require('path');

function FsStorageDriver(options) {

  // Gather options
  this.options = Object.assign({
    bucket: process.cwd()
  }, options || {});

  // Log current status
  winston.log('info', 'FSStorageDriver: initialized', this.options);
}


// Public functions

FsStorageDriver.prototype.readFile = function(path){
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: readFile', path);
    });
  });
};

FsStorageDriver.prototype.mkdir = function(path){
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: mkdir', path);
    });
  });
};

FsStorageDriver.prototype.writeFile = function (path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: writeFile', path);
    });
  });
};

FsStorageDriver.prototype.exists = function (path) {
  return new Promise((resolve) => {
    fs.stat(path, (err) => {
      if (err) return resolve(false);
      resolve(true);
      winston.log('verbose', 'FSStorageDriver: exists', path);
    });
  });
};

FsStorageDriver.prototype.unlink = function (path) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) return reject(err);
      resolve();
      winston.log('verbose', 'FSStorageDriver: unlink', path);
    });
  });
};

FsStorageDriver.prototype.stat = function (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: stat', path);
    });
  });
};

// Module Exports
module.exports = function (options) {
  return new FsStorageDriver(options);
};

