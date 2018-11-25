'use strict';

const { Storage } = require('@google-cloud/storage');
const path = require('path');

function AppStorage() {

  // Load GoogleCloudStorage with bucket

  var gcs = new Storage({
    projectId: process.env.PROJECT_ID,
  });
  this.bucket = gcs.bucket(process.env.BUCKET);

  // Log current status
  logging.log('verbose', 'Storage: ready', { bucket: process.env.BUCKET, project_id: process.env.PROJECT_ID });
}

function toUi(f, path) {
  var replacer = new RegExp(path + "([^/]*).*", "");
  return Object.assign(f.metadata, { name: f.name.replace(replacer, "$1"), path: '/' + f.name });
}

AppStorage.prototype.joinPath = function() {
  var input = Array.prototype.slice.apply(arguments, [0]);
  var output = path.posix.join.apply(path, input);
  return this.sanitize(output);
};

AppStorage.prototype.resolvePath = function() {
  return this.joinPath.apply(this, arguments);
};

// Public functions
AppStorage.prototype.readFile = function(path) {
  path = this.sanitize(path);
  if (path && path[0] === '/') path = path.slice(1);
  logging.log('verbose', 'Storage: readFile', path);
  return this.bucket.file(path).download().then(data => Promise.resolve(data[0].toString()));
};

AppStorage.prototype.sanitize = function (path) {
  if (path && path[0] === '/') path = path.slice(1);
  return path.replace(/\/+/g, "/");
};

AppStorage.prototype.readdir = function(path){
  path = this.sanitize(path);
  if (path.slice(-1) !== "/" && path) path = path + "/";
  logging.log('verbose', 'Storage: readdir', path);
  return new Promise((resolve, reject) => {
    this.bucket.getFiles({ delimiter: '\/', prefix: path, autoPaginate: false }, function(err, files, token, apiResponse){
      if (err) return reject(err);
      resolve({ files: files.map(f => f.metadata).filter(f => f.contentType !== "application/x-directory"), token, dirs: apiResponse.prefixes });
    });
  });
};

AppStorage.prototype.mkdir = function(path) {
  path = this.sanitize(path);
  if (path.slice(-1) !== "/" && path) path = path + "/";
  var folder = this.bucket.file(path);
  return folder.save(undefined, { metadata: { contentType: "application/x-directory" } })
    .then(() => folder.get())
    .then(f => Promise.resolve(f[0].metadata));
};

AppStorage.prototype.writeFile = function (path, data) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: writeFile', path);
  return this.bucket.file(path).save(data);
};

AppStorage.prototype.makePublic = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: makePublic', path);
  return this.bucket.file(path).makePublic();
};

// Get Public url
AppStorage.prototype.publicUrl = function (path) {
  path = this.sanitize(path);
  return Promise.resolve(`https://storage.googleapis.com/${process.env.BUCKET}/${path}`);
};

AppStorage.prototype.rmdir = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: rmdir', path);
  return this.bucket.deleteFiles({ prefix: path });
};

AppStorage.prototype.exists = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: exists', path);
  return this.bucket.file(path).exists().then(data => Promise.resolve(data[0]));
};

AppStorage.prototype.unlink = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: unlink', path);
  return this.bucket.file(path).delete();
};

/*
Direct upload from memory
 */
AppStorage.prototype.directUpload = function (req, path) {
  path = this.sanitize(path);
  if (path.slice(-1) !== "/" && path) path = path + "/";
  const files = req.file || req.files;
  if (!files) return Promise.reject(new Error('File(s) parameter is empty'));
  return Promise.all(files.map(f => {
    return new Promise((resolve, reject) => {
      const filePath = path + f.originalname;
      const file = this.bucket.file(filePath);
      const stream = file.createWriteStream({ metadata: { contentType: f.mimetype } });
      logging.log('verbose', 'Storage: directUpload', { file: filePath });
      stream.on('error', (err) => reject(err));
      stream.on('finish', () => file.getMetadata().then(m => resolve(m[0])).catch(err => reject(err)));
      stream.end(f.buffer);
    });
  }));
};

AppStorage.prototype.createReadStream = function (path) {
  path = this.sanitize(path);
  return this.bucket.file(path).createReadStream();
};

AppStorage.prototype.stat = function (path) {
  path = this.sanitize(path);
  return this.bucket.file(path).getMetadata().then(data => Promise.resolve(data[0]));
};

// Module Exports
module.exports = new AppStorage();