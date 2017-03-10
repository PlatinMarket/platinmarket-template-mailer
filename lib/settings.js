const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const Datastore = require('@google-cloud/datastore');

// Super users
const superUsers = options && options.user && options.user.super ? options.user.super : [];

// Password for encryption
const password = options.auth.secret;

// Create datastore
const datastore = Datastore({
  projectId: options.datastore.project
});

// Kind
const kind = 'MARS_User';

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
    isSuper: (superUsers.indexOf(user.email) > -1)
  } : {}));
}

// Encrypt Text
function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

// Decrypt Text
function decrypt(text){
  try {
    var decipher = crypto.createDecipher(algorithm,password);
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
  if (user && user.smtp && user.smtp.auth) user.smtp.auth.pass = decrypt(user.smtp.auth.pass);
  if (user && user.imap && user.imap.auth) user.imap.auth.pass = decrypt(user.imap.auth.pass);
  return user;
}

// Encrypt User Data
function encryptUser(user) {
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
      return datastore.save({ key: datastore.key([kind, this.id(newUser)]), data: newUser}).then(() => Promise.resolve(newUser)).catch(err => Promise.reject(err));
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
      return datastore.save({ key: datastore.key([kind, this.id(newUser)]), data: newUser}).then(() => Promise.resolve(newUser)).catch(err => Promise.reject(err));
    });
};

/*
  Returns user config if exists otherwise returns genericConfig for user
 */
Settings.prototype.get = function (user) {
  if (!user) return Promise.resolve(null);
  return datastore.get(datastore.key([kind, this.id(user)])).then(entity => {
    if (entity.length == 0) return Promise.resolve(null);
    return Promise.resolve(Object.assign(generateConfig(user, true), decryptUser(entity[0])));
  });
};

/*
Get All users in store
 */
Settings.prototype.users = function () {
  const query = datastore.createQuery(kind).limit(100);
  return datastore.runQuery(query).then(entities => Promise.resolve(entities && entities.length > 0 ? entities[0] : [])).catch(err => Promise.reject(err));
};

/*
 Check user exists in datastore
 */
Settings.prototype.exists = function(user) {
  return datastore.get(datastore.key([kind, this.id(user)])).then(data => Promise.resolve(data && data.length > 0)).catch(err => Promise.resolve(false));
};

/*
  Datastore id generator
 */
Settings.prototype.id = function (user) {
  return user.email;
};

// Export Module
var s = new Settings();
module.exports = s;