var config = require('../config/config');
var Dropbox = require('dropbox');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

config = Object.assign({
  bucket: '/cdn_root',
  cache_folder: path.resolve(__dirname + '/../cache')
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
    createFolder: (args) => {
      args = args || {};
      if (!args.path) return Promise.reject(new Error("Path not found"));
      args.path = config.bucket + args.path;
      return client.filesCreateFolder({ path: args.path });
    },
    downloadFile: (args) => {
      args = args || {};
      if (!args.path) return Promise.reject(new Error("Path not found"));
      args.path = config.bucket + args.path;
      return client.filesDownload(args).then(f => Promise.resolve(f.fileBinary)).catch(err => Promise.reject(err));
    },
    uploadFile: (args) => {
      args = args || {};
      if (!args.path) return Promise.reject(new Error("Path not found"));
      args.path = config.bucket + args.path;
      return client.filesUpload(args);
    },
    resolvePath: (args) => {
      args = args || {};
      if (!args.path) return Promise.reject(new Error("Path not found"));
      args.path = config.bucket + args.path;
      return client.sharingCreateSharedLink(args);
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
    mkdirp(config.cache_folder, function (err) { if (err) console.warn(err); });
    this.driver.init().then(() => winston.log('info', 'FileDriver: ready.', { driver: this.driver.name, bucket: config.bucket })).catch(err => {
      console.error(err.error);
      this.ready = false;
    });
  }
}

Files.prototype.downloadFile = function (args) {
  return new Promise((resolve, reject) => {
    isPublished().then(useCache => {
      var cacheFile = path.join(config.cache_folder, args.path);
      if (useCache && fs.existsSync(cacheFile)) {
        var stats = fs.statSync(cacheFile);
        var mtime = new Date(stats.mtime);
        mtime.setDate(stats.mtime.getDate() + 1); // Set cache to 1 day
        var interval =  mtime - (new Date());
        if (interval > 0) return resolve(cacheFile);
      }
      this.driver.downloadFile(args).then(fileBinary => {
        winston.log('verbose', 'FileDriver: Downloading file.', { file: args.path, driver: this.driver.name });
        try {
          mkdirp(path.dirname(cacheFile), (err) => {
            if (err) return reject(err);
            fs.writeFile(cacheFile, fileBinary, 'binary', (err) => {
              if (err) return reject(err);
              resolve(cacheFile);
            });
          });
        } catch (err) {
          reject(err);
        }
      }).catch(err => reject(err))
    }).catch(err => reject(err));
  });
};

Files.prototype.resolvePath = function (args) {
  return this.driver.resolvePath(args);
};

Files.prototype.uploadFile = function (args) {
  return this.driver.uploadFile(args).then(file => this.driver.clearBucket(file));
};

Files.prototype.createFolder = function (args) {
  return this.driver.createFolder(args).then(folder => this.driver.clearBucket(folder));
};

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