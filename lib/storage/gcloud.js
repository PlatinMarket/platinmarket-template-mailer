var gcloud = require('google-cloud');

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

// Options
var options = {};

function FsStorageDriver(o) {

  // Gather options
  this.options = options = Object.assign({
    bucket: process.cwd()
  }, o || {});

  this.gcs = gcloud.storage({
    projectId: this.options.project,
    keyFilename: this.options.key_file
  });

  var bucket = this.gcs.bucket('sender-app-storage');
  bucket.getFiles().then(data => console.log(data));

  // Log current status
  winston.log('info', 'FSStorageDriver: initialized', this.options);
}

FsStorageDriver.prototype.joinPath = function() {
  var input = Array.prototype.slice.apply(arguments, [0]);
  var output = path.join.apply(path, input);
  winston.log('debug', 'FSStorageDriver: joinPath', { input, output });
  return output;
};

FsStorageDriver.prototype.resolvePath = function() {
  var input = Array.prototype.slice.apply(arguments, [0]);
  input.unshift(this.options.bucket);
  var output = path.join.apply(path, input);
  winston.log('debug', 'FSStorageDriver: resolvePath', { input: arguments[0], output });
  return output;
};

// Public functions
FsStorageDriver.prototype.readFile = function(path){
  return new Promise((resolve, reject) => {
    fs.readFile(this.resolvePath(path), (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: readFile', this.resolvePath(path));
    });
  });
};

FsStorageDriver.prototype.readdir = function(path){
  return new Promise((resolve, reject) => {
    winston.log('verbose', 'FSStorageDriver: readdir', this.resolvePath(path));
    fs.readdir(this.resolvePath(path), (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

FsStorageDriver.prototype.mkdir = function(path){
  return new Promise((resolve, reject) => {
    mkdirp(this.resolvePath(path), (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: mkdir', this.resolvePath(path));
    });
  });
};

FsStorageDriver.prototype.writeFile = function (path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(this.resolvePath(path), data, (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: writeFile', this.resolvePath(path));
    });
  });
};

FsStorageDriver.prototype.rmdir = function (path) {
  return new Promise((resolve, reject) => {
    fs.rmdir(this.resolvePath(path), (err) => {
      if (err) return reject(err);
      resolve();
      winston.log('verbose', 'FSStorageDriver: rmdir', this.resolvePath(path));
    });
  });
};

FsStorageDriver.prototype.exists = function (path) {
  return new Promise((resolve) => {
    fs.stat(this.resolvePath(path), (err) => {
      if (err) return resolve(false);
      resolve(true);
      winston.log('verbose', 'FSStorageDriver: exists', this.resolvePath(path));
    });
  });
};

FsStorageDriver.prototype.unlink = function (path) {
  return new Promise((resolve, reject) => {
    fs.unlink(this.resolvePath(path), (err) => {
      if (err) return reject(err);
      resolve();
      winston.log('verbose', 'FSStorageDriver: unlink', this.resolvePath(path));
    });
  });
};

FsStorageDriver.prototype.stat = function (path) {
  return new Promise((resolve, reject) => {
    fs.stat(this.resolvePath(path), (err, data) => {
      if (err) return reject(err);
      resolve(data);
      winston.log('verbose', 'FSStorageDriver: stat', this.resolvePath(path));
    });
  });
};

// Module Exports
module.exports = function (options) {
  return new FsStorageDriver(options);
};

