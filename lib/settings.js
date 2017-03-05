var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = options.auth.secret;

// Extend config
var config = Object.assign({
  path: '/user',
  super: []
}, options.user || {});

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
      sent_folder: '',
      auth: {
        user: user.email,
        pass: ''
      }
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
        storage.writeFile(this.file(user), JSON.stringify(data)).then(() => resolve(user)).catch(err => reject(err));
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
        storage.writeFile(this.file(user), JSON.stringify(Object.assign(generateConfig(user), data || {}))).then(() => resolve(user)).catch(err => reject(err));
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
      storage.readFile(this.file(user)).then(data => {
        data = JSON.parse(data.toString());
        if (data && data.smtp && data.smtp.auth) data.smtp.auth.pass = decrypt(data.smtp.auth.pass);
        resolve(Object.assign(generateConfig(user, true), data));
      }).catch(err => reject(err));
    });
  });
};


/*
 Return user read file
 */
Settings.prototype.read = function (file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    file = storage.joinPath(this.storeFolder, file);
    storage.exists(file).then(result => {
      if (!result) return resolve(null);
      storage.readFile(file).then(data => {
        data = JSON.parse(data);
        if (data && data.smtp && data.smtp.auth) data.smtp.auth.pass = decrypt(data.smtp.auth.pass);
        resolve(Object.assign(generateConfig(data, true), data, { folder: arguments[0] }));
      }).catch(err => reject(err));
    });
  });
};

/*
Get All users in store
 */
Settings.prototype.users = function () {
  return this.getUserFileList().then(files => Promise.all(files.map(f => this.read(f))));
};

/*
Get All User files
 */
Settings.prototype.getUserFileList = function () {
  return storage.readdir(this.storeFolder).then(files => Promise.resolve(files.filter(file => file.indexOf('.json') > -1)));
};

/*
 Check user exists in store
 */
Settings.prototype.exists = function(user) {
  return storage.exists(this.file(user)).then(exists => Promise.resolve(exists));
};

/*
 Build user file name
 */
Settings.prototype.file = function (user) {
  var hash = require('crypto').createHash('sha1').update(user.name).digest('hex').toString() + '.json';
  return storage.joinPath(this.storeFolder, hash);
};

// Export Module
var s = new Settings();
module.exports = s;