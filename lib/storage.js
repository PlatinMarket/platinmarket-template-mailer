'use strict';

const gcloud = require('google-cloud');
const path = require('path');

function Storage() {

  // Load GoogleCloudStorage with bucket
  var gcs = gcloud.storage({
    projectId: process.env.PROJECT_ID,
  });
  this.bucket = gcs.bucket(process.env.BUCKET);

  // Log current status
  winston.log('info', 'Storage: ready', { bucket: process.env.BUCKET, project_id: process.env.PROJECT_ID });
}

Storage.prototype.joinPath = function() {
  var input = Array.prototype.slice.apply(arguments, [0]);
  var output = path.posix.join.apply(path, input);
  return this.sanitize(output);
};

Storage.prototype.resolvePath = function() {
  return this.joinPath.apply(this, arguments);
};

// Public functions
Storage.prototype.readFile = function(path) {
  path = this.sanitize(path);
  if (path && path[0] == '/') path = path.slice(1);
  winston.log('verbose', 'Storage: readFile', path);
  return this.bucket.file(path).download().then(data => Promise.resolve(data[0].toString()));
};

Storage.prototype.sanitize = function (path) {
  if (path && path[0] == '/') path = path.slice(1);
  return path;
};

Storage.prototype.readdir = function(path){
  path = this.sanitize(path);
  if (path.slice(-1) != "/" && path) path = path + "/";
  var replacer = new RegExp(path + "([^/]*).*", "");
  winston.log('verbose', 'Storage: readdir', path);
  return this.bucket.getFiles({ prefix: path }).then(data => Promise.resolve(data[0].filter(f => f.name != path).map(f => Object.assign(f.metadata, { name: f.name.replace(replacer, "$1"), path: '/' + f.name })).filter((f, i, s) => s.map(_s => _s.name).indexOf(f.name) === i)));
};

Storage.prototype.mkdir = function() {
  return Promise.resolve();
};

Storage.prototype.writeFile = function (path, data) {
  path = this.sanitize(path);
  winston.log('verbose', 'Storage: writeFile', path);
  return this.bucket.file(path).save(data);
};

Storage.prototype.makePublic = function (path) {
  path = this.sanitize(path);
  winston.log('verbose', 'Storage: makePublic', path);
  return this.bucket.file(path).makePublic();
};

Storage.prototype.rmdir = function (path) {
  path = this.sanitize(path);
  winston.log('verbose', 'Storage: rmdir', path);
  if (path.slice(-1) != "/") path = path + "/";
  return this.bucket.deleteFiles({ prefix: path });
};

Storage.prototype.exists = function (path) {
  path = this.sanitize(path);
  winston.log('verbose', 'Storage: exists', path);
  return this.bucket.file(path).exists().then(data => Promise.resolve(data[0]));
};

Storage.prototype.unlink = function (path) {
  path = this.sanitize(path);
  winston.log('verbose', 'Storage: unlink', path);
  return this.bucket.file(path).delete();
};

Storage.prototype.stat = function (path) {
  path = this.sanitize(path);
  return this.bucket.file(path).getMetadata().then(data => Promise.resolve(data[0]));
};

// Module Exports
module.exports = new Storage();