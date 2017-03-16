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
  logging.log('verbose', 'Storage: ready', { bucket: process.env.BUCKET, project_id: process.env.PROJECT_ID });
}

function toUi(f, path) {
  var replacer = new RegExp(path + "([^/]*).*", "");
  return Object.assign(f.metadata, { name: f.name.replace(replacer, "$1"), path: '/' + f.name });
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
  logging.log('verbose', 'Storage: readFile', path);
  return this.bucket.file(path).download().then(data => Promise.resolve(data[0].toString()));
};

Storage.prototype.sanitize = function (path) {
  if (path && path[0] == '/') path = path.slice(1);
  return path.replace(/\/+/g, "/");
};

Storage.prototype.readdir = function(path){
  path = this.sanitize(path);
  if (path.slice(-1) != "/" && path) path = path + "/";
  logging.log('verbose', 'Storage: readdir', path);
  return new Promise((resolve, reject) => {
    this.bucket.getFiles({ delimiter: '\/', prefix: path, autoPaginate: false }, function(err, files, token, apiResponse){
      if (err) return reject(err);
      resolve({ files: files.map(f => f.metadata).filter(f => f.contentType != "application/x-directory"), token, dirs: apiResponse.prefixes });
    });
  });
};

Storage.prototype.mkdir = function(path) {
  path = this.sanitize(path);
  if (path.slice(-1) != "/" && path) path = path + "/";
  var folder = this.bucket.file(path);
  return folder.save(undefined, { metadata: { contentType: "application/x-directory" } })
    .then(() => folder.get())
    .then(f => Promise.resolve(f[0].metadata));
};

Storage.prototype.writeFile = function (path, data) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: writeFile', path);
  return this.bucket.file(path).save(data);
};

Storage.prototype.makePublic = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: makePublic', path);
  return this.bucket.file(path).makePublic();
};

// Get Public url
Storage.prototype.publicUrl = function (path) {
  path = this.sanitize(path);
  return Promise.resolve(`https://storage.googleapis.com/${process.env.BUCKET}/${path}`);
};

Storage.prototype.rmdir = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: rmdir', path);
  return this.bucket.deleteFiles({ prefix: path });
};

Storage.prototype.exists = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: exists', path);
  return this.bucket.file(path).exists().then(data => Promise.resolve(data[0]));
};

Storage.prototype.unlink = function (path) {
  path = this.sanitize(path);
  logging.log('verbose', 'Storage: unlink', path);
  return this.bucket.file(path).delete();
};

/*
Direct upload from memory
 */
Storage.prototype.directUpload = function (req, path) {
  path = this.sanitize(path);
  if (path.slice(-1) != "/" && path) path = path + "/";
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

Storage.prototype.createReadStream = function (path) {
  path = this.sanitize(path);
  return this.bucket.file(path).createReadStream();
};

Storage.prototype.stat = function (path) {
  path = this.sanitize(path);
  return this.bucket.file(path).getMetadata().then(data => Promise.resolve(data[0]));
};

// Module Exports
module.exports = new Storage();