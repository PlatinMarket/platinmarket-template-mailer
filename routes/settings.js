'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();
  const ajv = new require('ajv')({ allErrors: true });
  const emailSender = require('../sender/email');

  router.get('/settings', (req, res) => {
    res.render('settings', { user: req.user });
  });

  // SMTP Validation
  router.post('/settings/smtp', (req, res, next) => {
    var data = req.body;
    var valid = ajv.validate({
      properties: {
        smtp: {
          required: ['host', 'port', 'secure', 'auth'],
          type: "object",
          properties: {
            host: { type: "string", maxLength: 128, minLength: 1 },
            port: { type: ["number", "string"], maxLength: 10 },
            secure: {type: "string" },
            auth: {
              type: "object",
              required: ['user', 'pass'],
              properties: {
                user: { type: "string", maxLength: 128, minLength: 1 },
                pass: { type: "string", maxLength: 128, minLength: 1 }
              },
              additionalProperties: false
            }
          }
        }
      },
      additionalProperties: { imap: { type: "object" } }
    }, data);
    if (!valid) return res.status(422).json({message: "Alanları kontrol edip tekrar deneyiniz", fields: ajv.errors });
    data.smtp.port = parseInt(data.smtp.port, 10);
    data.smtp.secure = data.smtp.secure === 'true';
    data.imap.port = parseInt(data.imap.port, 10);
    data.imap.secure = data.imap.secure === 'true';
    emailSender.validateSMTP(data).then(valid => {
      if (!valid) return res.status(422).json({message: "SMTP doğrulaması başarısız. " + (emailSender.lastError ? (emailSender.lastError.message || emailSender.lastError.response || "") : ""), error: emailSender.lastError });
      req.body = data;
      next();
    });
  });

  // SMTP Settings Post
  router.post('/settings/smtp', (req, res) => {
    settings.save(req.user, req.body)
      .then(success => res.sendStatus(200))
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  // IMAP Validation
  router.post('/settings/imap', (req, res, next) => {
    var data = req.body;
    var valid = ajv.validate({
      properties: {
        imap: {
          required: ['host', 'secure', 'port'],
          type: "object",
          properties: {
            host: { type: "string", maxLength: 128, minLength: 1 },
            sent_folder: { type: "string", maxLength: 128, minLength: 1 },
            port: { type: ["number", "string"], maxLength: 10 },
            secure: {type: "string" },
            auth: {
              type: "object",
              required: ['user', 'pass'],
              properties: {
                user: { type: "string", maxLength: 128, minLength: 1 },
                pass: { type: "string", maxLength: 128, minLength: 1 }
              },
              additionalProperties: false
            }
          }
        }
      },
      additionalProperties: { smtp: { type: "object" } }
    }, data);
    if (!valid) return res.status(422).json({message: "Alanları kontrol edip tekrar deneyiniz", fields: ajv.errors });
    data.smtp.port = parseInt(data.smtp.port, 10);
    data.smtp.secure = data.smtp.secure === 'true';
    data.imap.port = parseInt(data.imap.port, 10);
    data.imap.secure = data.imap.secure === 'true';
    emailSender.validateIMAP(Object.assign(req.user, data)).then(valid => {
      if (!valid) return res.status(422).json({message: "IMAP doğrulaması başarısız. " + (emailSender.lastError ? emailSender.lastError.code : ""), error: emailSender.lastError });
      req.body = data;
      next();
    });
  });

  // IMAP Settings Post
  router.post('/settings/imap', (req, res) => {
    settings.save(req.user, req.body)
      .then(success => res.sendStatus(200))
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  // IMAP Get Mail box list
  router.post('/settings/mailboxes', (req, res) => {
    var data = req.body || {};
    if (data.smtp) {
      data.smtp.port = parseInt(data.smtp.port, 10);
      data.smtp.secure = data.smtp.secure === 'true';
    }
    if (data.imap) {
      data.imap.port = parseInt(data.imap.port, 10);
      data.imap.secure = data.imap.secure === 'true';
    }
    emailSender.getBoxes(Object.assign(req.user, data)).then(list => res.json(list)).catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  return router;
})();