var gcloud = require('google-cloud');

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

// Options
var options = {};

function GCloudStorageDriver(o) {

  // Gather options
  this.options = options = Object.assign({
    bucket: null,
    project: null,
    key_file: null
  }, o || {});

  // Load GoogleCloudStorage with bucket
  var gcs = gcloud.storage({
    projectId: this.options.project,
    keyFilename: this.options.key_file
  });
  this.bucket = gcs.bucket(options.bucket);

  // Log current status
  winston.log('info', 'GCloudStorageDriver: initialized', this.options);
}

GCloudStorageDriver.prototype.joinPath = function() {
  var input = Array.prototype.slice.apply(arguments, [0]);
  var output = path.posix.join.apply(path, input);
  if (output && output[0] == '/') output = output.slice(1);
  return output;
};

GCloudStorageDriver.prototype.resolvePath = function() {
  return this.joinPath.apply(this, arguments);
};

// Public functions
GCloudStorageDriver.prototype.readFile = function(path){
  winston.log('verbose', 'GCloudStorageDriver: readFile', path);
  return this.bucket.file(path).download().then(data => Promise.resolve(data[0].toString()));
};

GCloudStorageDriver.prototype.readdir = function(path){
  winston.log('verbose', 'GCloudStorageDriver: readdir', path);
  var replacer = new RegExp(path + "\/(.*?)\/.*", "gi");
  return this.bucket.getFiles({ prefix: path }).then(data => Promise.resolve(data[0].filter(f => f.name != path).map(f => f.name.replace(replacer, "$1")).filter((f, i, s) => s.indexOf(f) === i)));
};

GCloudStorageDriver.prototype.mkdir = function() {
  return Promise.resolve();
};

GCloudStorageDriver.prototype.writeFile = function (path, data) {
  winston.log('verbose', 'GCloudStorageDriver: writeFile', path);
  return this.bucket.file(path).save(data);
};

GCloudStorageDriver.prototype.rmdir = function (path) {
  winston.log('verbose', 'GCloudStorageDriver: rmdir', path);
  if (path.slice(-1) != "/") path = path + "/";
  return this.bucket.deleteFiles({ prefix: path });
};

GCloudStorageDriver.prototype.exists = function (path) {
  winston.log('verbose', 'GCloudStorageDriver: exists', path);
  return this.bucket.file(path).exists().then(data => Promise.resolve(data[0]));
};

GCloudStorageDriver.prototype.unlink = function (path) {
  winston.log('verbose', 'GCloudStorageDriver: unlink', path);
  return this.bucket.file(path).delete();
};

GCloudStorageDriver.prototype.stat = function (path) {
  return this.bucket.file(path).getMetadata().then(data => Promise.resolve(data[0]));
};

// Module Exports
module.exports = function (options) {
  return new GCloudStorageDriver(options);
};

