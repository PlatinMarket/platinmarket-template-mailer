var config = require('../config/config');
var path = require('path');
var fs = require('fs');

// Extend config
config = Object.assign({
  path: path.resolve(__dirname + '/../user'),
  super: []
}, config.user || {});

// Generate default user config
function generateConfig(user) {
  return {
    name: user.name,
    email: user.email,
    department: user.department,
    smtp: {
      host: '',
      port: 465,
      secure: true,
      auth: {
        user: user.email,
        pass: ''
      }
    },
    isActive: true,
    isSuper: (config.super.indexOf(user.name) > -1)
  };
}

// Default Skeleton
function Settings() {
    this.storeFolder = config.path;
}

/*
Save user data
 */
Settings.prototype.save = function(user, data) {
  return new Promise(resolve => {
    if (!user) return resolve(null);
    this.create(user)
      .then(user => this.get(user))
      .then(settings => {
        fs.writeFile(this.file(user), JSON.stringify(Object.assign(settings, data || {})), (err) => {
          if (err) return reject(err);
          resolve(user);
        });
      })
      .catch((err) => reject(err));
  });
};

/*
Create user config file
 */
Settings.prototype.create = function(user, data) {
  return new Promise((resolve, reject) => {
    this.exists(user)
      .then(result => {
        if (result) return resolve(user);
        fs.writeFile(this.file(user), JSON.stringify(Object.assign(generateConfig(user), data || {})), (err) => {
          if (err) return reject(err);
          resolve(user);
        });
      })
  });
};

/*
Returns user config if exists otherwise returns genericConfig for user
 */
Settings.prototype.get = function (user) {
  return new Promise(resolve => {
    if (!user) return resolve(null);
    this.exists(user).then(result => {
      if (!result) return resolve(generateConfig(user));
      fs.readFile(this.file(user), (err, data) => {
        if (err) return reject(err);
        resolve(Object.assign(generateConfig(user), JSON.parse(data)));
      });
    });
  });
};

/*
 Check user exists in store
 */
Settings.prototype.exists = function(user) {
    return new Promise((resolve) => {
       fs.exists(this.file(user), (exists) => resolve(exists));
    });
};

/*
 Build user file name
 */
Settings.prototype.file = function (user) {
  var hash = require('crypto').createHash('sha1').update(user.name).digest('hex').toString();
  return path.join(this.storeFolder, hash + '.json');
};

// Export Module
var s = new Settings();
module.exports = s;