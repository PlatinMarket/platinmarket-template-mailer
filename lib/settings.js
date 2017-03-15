const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const Datastore = require('@google-cloud/datastore');

// Application wide default settings
let defaultSettings = null;

// Create datastore
const datastore = Datastore({
  projectId: process.env.PROJECT_ID,
  namespace: process.env.DATASTORE_NAMESPACE || 'Mars'
});

// Kind
const kind_user = 'User';
const kind_settings = 'Settings';
const kind_variables = 'Variables';

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
    isSuper: (defaultSettings.super_users.indexOf(user.email) > -1)
  } : {}));
}

// Encrypt Text
function encrypt(text){
  var cipher = crypto.createCipher(algorithm,defaultSettings.auth_secret);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

// Decrypt Text
function decrypt(text){
  try {
    var decipher = crypto.createDecipher(algorithm,defaultSettings.auth_secret);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch (err) {
    console.warn("Bad password " + text);
    return null;
  }
}

// Decrypt User Data
function decryptUser(user) {
  if (!defaultSettings || !defaultSettings.auth_secret) throw new Error('Mars settings error');
  if (user && user.smtp && user.smtp.auth) user.smtp.auth.pass = decrypt(user.smtp.auth.pass);
  if (user && user.imap && user.imap.auth) user.imap.auth.pass = decrypt(user.imap.auth.pass);
  return user;
}

// Encrypt User Data
function encryptUser(user) {
  if (!defaultSettings || !defaultSettings.auth_secret) throw new Error('Mars settings error');
  if (user && user.smtp && user.smtp.auth) user.smtp.auth.pass = encrypt(user.smtp.auth.pass);
  if (user && user.imap && user.imap.auth) user.imap.auth.pass = encrypt(user.imap.auth.pass);
  return user;
}

// Default Skeleton
function Settings() {}

/*
Save user data
 */
Settings.prototype.save = function(user, data) {
  if (!user) return Promise.resolve(null);
  return this.create(user)
    .then(user => this.get(user))
    .then(settings => {
      let newUser = encryptUser(Object.assign(settings, data || {}));
      return datastore.save({ key: datastore.key([kind_user, this.id(newUser)]), data: newUser}).then(() => Promise.resolve(newUser)).catch(err => Promise.reject(err));
    });
};

/*
Create user config file
 */
Settings.prototype.create = function(user, data) {
  return this.exists(user)
    .then(result => {
      if (result) return Promise.resolve(user);
      let newUser = encryptUser(Object.assign(generateConfig(user), data || {}));
      return datastore.save({ key: datastore.key([kind_user, this.id(newUser)]), data: newUser}).then(() => Promise.resolve(newUser)).catch(err => Promise.reject(err));
    });
};

/*
  Returns user config if exists otherwise returns genericConfig for user
 */
Settings.prototype.get = function (user) {
  if (!user) return Promise.resolve(null);
  return datastore.get(datastore.key([kind_user, this.id(user)])).then(entity => {
    if (entity.length == 0) return Promise.resolve(null);
    return Promise.resolve(Object.assign(generateConfig(user, true), decryptUser(entity[0])));
  })
  .catch(err => Promise.reject(err));
};

/*
  Read setting by key
 */
Settings.prototype.read = function (key, kind = kind_settings){
  return datastore.get(datastore.key([kind, key])).then(entity => {
    if (entity.length == 0) return Promise.resolve(null);
    return Promise.resolve(entity[0]);
  })
  .catch(err => Promise.reject(err));
};

/*
 Write setting by key
 */
Settings.prototype.write = function (key, value, kind = kind_settings) {
  return datastore.save({ key: datastore.key([kind, key]), data: value}).then(() => Promise.resolve(value)).catch(err => Promise.reject(err));
};

/*
Get All users in store
 */
Settings.prototype.users = function () {
  const query = datastore.createQuery(kind_user).limit(100);
  return datastore.runQuery(query).then(entities => Promise.resolve((entities && entities.length > 0 ? entities[0] : []).map(u => decryptUser(u)))).catch(err => Promise.reject(err));
};

/*
 Check user exists in datastore
 */
Settings.prototype.exists = function(user) {
  return datastore.get(datastore.key([kind_user, this.id(user)])).then(data => Promise.resolve(data && data.length > 0)).catch(err => Promise.resolve(false));
};

/*
Get default smtp settings
 */
Settings.prototype.defaultSmtpUser = () => ({
  name: defaultSettings.default_user_name,
  email: defaultSettings.default_user_email,
  smtp: {
    host: defaultSettings.default_smtp_host,
    port: defaultSettings.default_smtp_port,
    secure: defaultSettings.default_smtp_secure,
    auth: {
      user: defaultSettings.default_smtp_auth_user,
      pass: defaultSettings.default_smtp_auth_pass
    }
  }
});

/*
Save default Settings
 */
Settings.prototype.saveDefaults = function(settings) {
  return this.write('default', settings)
    .then(() => this.read('default'))
    .then(settings => {
      defaultSettings = settings;
      winston.log('info', 'Settings changed', defaultSettings);
      Promise.resolve(settings);
    });
};

/*
Get settings
 */
Settings.prototype.getDefaults = () => Object.keys(defaultSettings).map(k => ({ name: k, value: defaultSettings[k], type: (defaultSettings[k] instanceof Array ? "array" : typeof defaultSettings[k]) }));

/*
Get user variables
 */
Settings.prototype.getVariables = (email) => s.read(email, kind_variables).then(vars => Promise.resolve(vars || {})).then(vars => Promise.resolve(defaultSettings.custom_variables.map(c => ({ name: c, value: vars[c] || null}))));

/*
Save user variables
 */
Settings.prototype.setVariables = (email, vars) => s.getVariables(email).then(_vars => Promise.resolve(vars.filter(v => _vars.findIndex(_v => _v.name == v.name) > -1))).then(vars => s.write(email, vars, kind_variables));

/*
  Datastore id generator
 */
Settings.prototype.id = function (user) {
  return user.email;
};

// Export Module
var s = new Settings();

// Get Settings from datastore
s.read('default').then(settings => {
  defaultSettings = settings;
  winston.log('info', 'Settings read from datastore', defaultSettings);
}).catch(err => { throw new Error(err); });

module.exports = s;