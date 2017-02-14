var nodemailer = require('nodemailer');
    var email = require('emailjs');

function EmailSender() {}

EmailSender.prototype.createTransport = function (user) {
  var config = {
    authMethod:'NTLM',
    host: user.smtp.host,
    port: user.smtp.port || 465,
    secure: typeof user.smtp.secure == "boolean" ? user.smtp.secure : false,
    auth: user.smtp.auth
  };
  return nodemailer.createTransport(config);
};

EmailSender.prototype.createMessage = function (message, user, to) {
  return {
    from: user.email,
    to: to,
    subject: message.subject,
    html: message.html,
    text: message.text || null
  };
};

EmailSender.prototype.process = function(message, from, to) {
  return new Promise((resolve, reject) => {
    if (!from.smtp || !from.smtp.auth) return reject(new Error("Bad config for user `" + from.email + "`"));
    var server = email.server.connect({
      user: from.smtp.auth.user,
      password: from.smtp.auth.pass,
      host: from.smtp.host,
      ssl: typeof from.smtp.secure == "boolean" ? from.smtp.secure : false,
      port: from.smtp.port || 465
    });

    server.send({
      text: "",
      from: from.email,
      to: to,
      subject: message.subject,
      attachment:
        [
          {data: message.html, alternative:true}
        ]
    }, (err) => {
      if (err) return reject(err);
      resolve("success");
    });
  });
};

// Exports module
module.exports = new EmailSender();