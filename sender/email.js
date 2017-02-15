var nodemailer = require('nodemailer');
var Imap = require('imap');

// Default inheritance
function EmailSender() {}

// Holds last error
EmailSender.prototype.lastError = null;

// Validate SMTP
EmailSender.prototype.validateSMTP = function (user) {
  return new Promise((resolve, reject) => {
    var transport = this.createTransport(user);
    transport.verify().then(() => {
      resolve(true);
      transport.close();
    }).catch(err => {
      this.lastError = err;
      resolve(false);
      transport.close();
    });
  });
};

// Validate IMAP
EmailSender.prototype.validateIMAP = function (user) {
  return new Promise((resolve, reject) => {
    var imap = this.createImapClient(user);
    imap.once('ready', () => {
      resolve(true);
      imap.end();
    });
    imap.once('error', (err) => {
      this.lastError = err;
      resolve(false);
      imap.end();
    });
    imap.connect();
  });
};

// Save mail to sent folder
EmailSender.prototype.saveSentFolder = function (message, user) {
  return new Promise((resolve, reject) => {
    if (!user || !user.imap || !user.imap.host) return resolve();
    var imap = this.createImapClient(user);
    imap.once('ready', () => {
      imap.append(message, { mailbox: user.imap.sent_folder, flags: ['Seen'] }, (err) => {
        imap.end();
        if (err) return reject(err);
        resolve();
      })
    });
    imap.once('error', (err) => {
      reject(err);
      imap.end();
    });
    imap.connect();
  });
};

// Get Mail Box List
EmailSender.prototype.getBoxes = function (user) {
  return new Promise((resolve, reject) => {
    var imap = this.createImapClient(user);
    imap.once('ready', () => {
      imap.getBoxes(function (err, boxes) {
        if (err) return reject(err);
        if (!boxes) return reject(new Error("No mailbox found"))
        imap.end();
        resolve(Object.keys(boxes));
      });
    });
    imap.once('error', (err) => {
      reject(err);
      imap.end();
    });
    imap.connect();
  });
};

// Create transport opject
EmailSender.prototype.createTransport = function (user) {
  var config = {
    host: user.smtp.host,
    port: user.smtp.port || 465,
    secure: typeof user.smtp.secure == "boolean" ? user.smtp.secure : false,
    auth: user.smtp.auth
  };
  return nodemailer.createTransport(config);
};

// Create imap client
EmailSender.prototype.createImapClient = function (user) {
  var config = {
    host: user.imap.host,
    port: user.imap.port || 993,
    tls: typeof user.imap.secure == "boolean" ? user.imap.secure : false,
    user: user.smtp.auth.user,
    password: user.smtp.auth.pass
  };
  return new Imap(config);
};

// Create message object
EmailSender.prototype.createMessage = function (message, user, to) {
  return {
    from: user.email,
    to: to,
    subject: message.subject,
    html: message.html,
    text: message.text || null
  };
};

// Handle mail send
EmailSender.prototype.process = function(message, from, to) {
  return new Promise((resolve, reject) => {
    // Check user properties
    if (!from.smtp || !from.smtp.auth) return reject(new Error("Bad config for user `" + from.email + "`"));

    // Set Transport
    var transport = this.createTransport(from);

    // Get raw message
    var rawMessage = null;
    transport.use('stream', (mail, cb) => {
      mail.message.build((err, data) => {
        if (err) return cb(err);
        rawMessage = data.toString();
        cb();
      });
    });

    // Send message
    transport.sendMail(this.createMessage(message, from, to))
      .then(result => {
        transport.close();
        // Save message to sent_folder
        return this.saveSentFolder(rawMessage, from).then(() => resolve(result));
      })
      .catch(err => {
        transport.close();
        this.lastError = err;
        reject(err);
      });
  });
};

// Exports module
module.exports = new EmailSender();