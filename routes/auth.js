'use strict';

const jwt = require('jsonwebtoken');

// Login Require Pages
const loginRequirePages = [
  '/send',
  '/files',
  '/explorer',
  '/job',
  '/departments',
  '/groups',
  '/template',
  '/settings',
  '/logout',
  /^\/$/
];

// Super User Pages
const superUserPages = [
  '/files',
  '/explorer',
  '/template/:id/edit',
  '/template/create',
  '/template/:id/delete',
  '/settings/app',
  '/settings/app.json'
];

// Routes
module.exports = (function() {
  const router = require('express').Router();
  const auth = require('../lib/auth');

  // Check JWT token
  router.use(loginRequirePages, function (req, res, next) {
    // Check if JWT_SECRET setted
    if (!process.env.JWT_SECRET) return next();
    // Check has token
    if (!req.headers.authorization || req.headers.authorization.split(' ')[0] !== 'Bearer' || req.headers.authorization.split(' ').length < 1) return next();
    // Get token
    const token = req.headers.authorization.split(' ')[1];
    // verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Geçersiz token" });
      const email = (decoded || {}).email;
      if (!email) return res.status(401).json({ message: "Geçersiz payload" });
      settings.get({ email })
        .then(user => {
          req.user = user;
          next();
        })
        .catch(err => res.status(500).json({ message: err.message, stack: err.stack }));
    });
  });

  // Login require pages
  router.use(loginRequirePages, function (req, res, next) {
    // Check already auth
    if (req.user) return next();
    var sess = req.session;
    if (sess && sess.user) {
      settings.get(sess.user)
        .then(user => {
          req.user = user;
          next();
        })
        .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
      return;
    }
    if (req.get('X-Requested-With') === 'XMLHttpRequest' || req.get('Accept') === 'application/json') return res.status(401).json({message: "Giriş yapınız" });
    res.redirect('/login');
  });

  // Super User Zone
  router.use(superUserPages, function (req, res, next) {
    if (!req.user || !req.user.isSuper) return res.status(403).send("Yetkiniz yok");
    next();
  });

  // Login page
  router.get('/login', (req, res) => {
    res.render('login', { layout: 'login' });
  });

// Logout page
  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

// Login post
  router.post('/login', (req, res) => {
    if (!req.body.email || !req.body.password) return res.sendStatus(400);
    auth(req.body.email, req.body.password)
      .then(user => {
        req.session.user = user;
        return res.sendStatus(200);
      })
      .catch(err => res.status(500).json({message: err ? err.message : "Belirsiz bir hata", stack: err ? err.stack : ""}));
  });

  return router;
})();