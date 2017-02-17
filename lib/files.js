var config = require('../config/config');
var Dropbox = require('dropbox');

config = Object.assign({
  bucket: '/cdn_root'
}, config.file || {});

var client = null;
var drivers = [
  {
    name: 'Dropbox',
    init: () => {
      client = new Dropbox({accessToken: config.access_token});
      return new Promise((resolve, reject) => {
        client.filesListFolder({ path: config.bucket }).then(r => resolve(true)).catch(err => {
          if (err.error && err.error.err_summary && err.error.error_summary != 'path/not_found/..') return reject(err);
          client.filesCreateFolder({ path: config.bucket }).then(r => resolve(true)).catch(err => reject(err));
        });
      });
    },
    isReady: () => { return config.access_token ? true : false; },
    listFiles: (args) => {
      args = args || {};
      if (args.cursor) return client.filesListFolderContinue({ cursor: args.cursor.trim() });
      var path = config.bucket;
      if (args.path && args.path.trim() != '/') path = path + args.path.trim();
      return client.filesListFolder({ path });
    },
    deleteFile: (args) => {
      args = args || {};
      if (!args.path) return Promise.reject(new Error("Path not found"));
      args.path = config.bucket + args.path;
      if (args.path.indexOf('..') > -1) return Promise.reject(new Error("Path not found"));
      return client.filesDelete({ path: args.path});
    },
    getThumbnail: (args) => {
      args = args || {};
      if (!args.path) return Promise.reject(new Error("Path not found"));
      args.path = config.bucket + args.path;
      return client.filesGetThumbnail({ path: args.path, size: 'w128h128' });
    },
    createBucket: (bucket) => {
      client.filesCreateFolder({ path: config.bucket });
    },
    clearBucket: (file) => {
      return new Promise((resolve, reject) => {
        if (file.entries)
          file.entries = file.entries.map(f => Object.assign(f, { path_display: f.path_display.replace(config.bucket, ''), path_lower: f.path_display.replace(config.bucket, '') }));
        else
          file = Object.assign(file, { path_display: file.path_display.replace(config.bucket, ''), path_lower: file.path_display.replace(config.bucket, '') });
        resolve(file);
      });
    }
  }
];

function Files(){
  this.driver = config.driver ? drivers.find(d => d.name == config.driver) : undefined;
  this.ready = (config.driver && this.driver && this.driver.isReady());

  if (this.ready) {
    this.driver.init().then(() => console.log('File driver ready for command. Using driver: ' + this.driver.name)).catch(err => {
      console.error(err.error);
      this.ready = false;
    });
  }
}

Files.prototype.deleteFile = function (args) {
  return this.driver.deleteFile(args).then(file => this.driver.clearBucket(file));
};

Files.prototype.getThumbnail = function(args) {
  return this.driver.getThumbnail(args).then(file => this.driver.clearBucket(file));
};

Files.prototype.getFiles = function(args) {
  return this.driver.listFiles(args).then(file => this.driver.clearBucket(file));
};

// Module Exports
var f = new Files();
module.exports = f;