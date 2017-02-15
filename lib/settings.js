var config = require('../config/config');
var path = require('path');
var fs = require('fs');

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = config.auth.secret;

// Extend config
config = Object.assign({
  path: path.resolve(__dirname + '/../user'),
  super: []
}, config.user || {});

// Generate default user config
function generateConfig(user, forRead) {
  forRead = forRead || false;
  return Object.assign({
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
    imap: {
      host: '',
      port: 993,
      secure: true,
      sent_folder: ''
    }
  }, (forRead ? {
    isSuper: (config.super.indexOf(user.email) > -1)
  } : {}));
}

// Encrypt Text
function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

// Decrypt Text
function decrypt(text){
  try {
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  } catch (err) {
    console.warn("Bad password " + text);
    return null;
  }
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
        data = Object.assign(settings, data || {});
        if (data && data.smtp && data.smtp.auth) data.smtp.auth.pass = encrypt(data.smtp.auth.pass);
        fs.writeFile(this.file(user), JSON.stringify(data), (err) => {
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
  return new Promise((resolve, reject) => {
    if (!user) return resolve(null);
    this.exists(user).then(result => {
      if (!result) return resolve(generateConfig(user, true));
      fs.readFile(this.file(user), (err, data) => {
        if (err) return reject(err);
        data = JSON.parse(data.toString());
        if (data && data.smtp && data.smtp.auth) data.smtp.auth.pass = decrypt(data.smtp.auth.pass);
        resolve(Object.assign(generateConfig(user, true), data));
      });
    });
  });
};


/*
 Return user read file
 */
Settings.prototype.read = function (file) {
  if (!file) return null;
  file = path.join(this.storeFolder, file);
  if (!fs.existsSync(file)) return null;
  var data = JSON.parse(fs.readFileSync(file));
  if (data && data.smtp && data.smtp.auth) data.smtp.auth.pass = decrypt(data.smtp.auth.pass);
  return Object.assign(generateConfig(data, true), data);
};

/*
Get All users in store
 */
Settings.prototype.users = function () {
  return new Promise((resolve, reject) => {
    fs.readdir(this.storeFolder, (err, files) => {
      if (err) return reject(err);
      resolve(files.filter(file => fs.statSync(path.join(this.storeFolder, file)).isFile()).filter(file => file.indexOf('.json') > -1).map(file => Object.assign({folder: file}, this.read(file))));
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
  var hash = require('crypto').createHash('sha1').update(user.name).digest('hex').toString() + '.json';
  return path.join(this.storeFolder, hash);
};

// Export Module
var s = new Settings();
module.exports = s;