const nodemailer = require('nodemailer');
const Imap = require('imap');
const Transform = require('stream').Transform;

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
      this.lastError = err && err.message ? err : new Error("");
      resolve(false);
      transport.close();
    });
  });
};

// Validate IMAP
EmailSender.prototype.validateIMAP = function (user) {
  return new Promise((resolve, reject) => {
    return resolve(true);
    try {
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
    } catch (err) {
      resolve(false);
    }
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
        if (!boxes) return reject(new Error("No mailbox found"));
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
EmailSender.prototype.createTransport = function (user, sendCallback) {
  var _user = user && user.smtp && user.smtp.host ? user : settings.defaultSmtpUser();
  var config = {
    host: _user.smtp.host,
    port: _user.smtp.port || 2525,
    secure: typeof _user.smtp.secure == "boolean" ? _user.smtp.secure : false,
    auth: _user.smtp.auth,
    connectionTimeout: 5000,
    socketTimeout: 5000,
    greetingTimeout: 5000,
    send: sendCallback
  };
  return nodemailer.createTransport(config);
};

// Create imap client
EmailSender.prototype.createImapClient = function (user) {
  var config = {
    host: user.imap.host,
    port: user.imap.port || 993,
    tls: typeof user.imap.secure == "boolean" ? user.imap.secure : false,
    user: user.imap.auth.user,
    password: user.imap.auth.pass
  };
  return new Imap(config);
};

EmailSender.prototype.getAttachments = function (attachments) {
  return attachments ? attachments.map(a => ({filename: a.filename, cid: a.cid, content: storage.createReadStream(a.path)})) : undefined;
};

// Create message object
EmailSender.prototype.createMessage = function (message, user, to, guid) {
  return Promise.resolve({
    from: user.email,
    to: to,
    subject: message.subject,
    html: message.html,
    text: message.text || null,
    attachments: this.getAttachments(message.attachments),
    headers: {
      'X-MC-Metadata': JSON.stringify({ hizmet_id: guid }),
      'X-MC-Autotext': !message.text ? 'on' : 'off',
      'X-MC-GoogleAnalytics': 'www.platinmarket.com, platinmarket.com, demo.platinmarket.com'
    },
  });
};

// Handle mail send
EmailSender.prototype.process = function(message, from, to, guid) {
  return new Promise((resolve, reject) => {
    // Check user properties
    if (!from.smtp || !from.smtp.auth) return reject(new Error("Bad config for user `" + from.email + "`"));

    // Get raw message
    const transformer = new Transform();
    const rawMessage = [];
    transformer._transform = function(chunk, encoding, done) {
      rawMessage.push(chunk);
      this.push(chunk);
      done();
    };

    // Create transporter
    const transport = this.createTransport(from);

    // Listen on stream
    transport.use('stream', (mail, callback) => {
      mail.message.transform(transformer);
      callback();
    });

    // Send message
    this.createMessage(message, from, to, guid)
      .then(m => transport.sendMail(m))
      .then((result) => {
        transport.close();
        return this.saveSentFolder(Buffer.concat(rawMessage), from).then(() => resolve(result));
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
