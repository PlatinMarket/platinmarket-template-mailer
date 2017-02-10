// Requirements
var express = require('express');
var app = express();
var fs = require('fs');
var expressHandlebars  = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var templateStore = require('./lib/templates');
var settings = require('./lib/settings');
var ajv = new require('ajv')({allErrors: true});
var surl = require('speakingurl');

// Session middleware
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: false }
}));

// Set body parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Public folder
app.use(express.static('public'));

// Template Engine
app.engine('tpl', expressHandlebars({defaultLayout: 'default'}));
app.set('views', './views');
app.set('view engine', 'tpl');

// Login require pages
app.use(['/template', '/settings', '/logout', /^\/$/], function (req, res, next) {
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
    res.redirect('/login');
});

// Main page
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// Get template list
app.get('/template', (req, res) => {
    templateStore.list()
      .then(list => res.json(list.filter(l => req.user.isSuper || l.department.indexOf(req.user.department) > -1).map(l => Object.assign({folder: l.folder, name: l.name}))))
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// Template post
app.post(['/template/create', '/template/:id/edit'], function (req, res, next) {
  var data = req.body;
  var valid = ajv.validate({
    required: ['name', 'html', 'description', 'department', 'parameter', 'textFallback'],
    properties: {
      name: { type: "string", maxLength: 128, minLength: 5 },
      description: { type: "string", maxLength: 128 },
      department: { type: "array", items: { type: "string", maxLength: 128 } },
      parameter: {
        type: "array",
        items: {
          type: "object",
          required: ['name', 'title', 'type', 'require', 'default'],
          properties: {
            name: { type: "string", maxLength: 128, minLength: 1 },
            title: { type: "string", maxLength: 128, minLength: 1 },
            type: { type: "string", enum: ["string", "boolean"] },
            require: { type: "string" },
            default: { type: "string", maxLength: 128 }
          },
          additionalProperties: false
        }
      },
      textFallback: { type: "string" },
      html: { type: "string" },
      text: { type: "string" }
    },
    additionalProperties: false
  }, data);
  if (!valid) return res.status(422).json({message: "Alanları kontrol edip tekrar deneyiniz", fields: ajv.errors });
  data.textFallback = data.textFallback === 'true';
  data.parameter.forEach(p => {
    p.require = (p.require === 'true');
    p.name = surl(p.title, {separator: '_', lang: 'tr'});
  });
  next();
});

// Template create
app.get('/template/create', (req, res) => {
  res.render('edit_create_template', { user: req.user, currentTemplate: {} });
});

// Template post
app.post('/template/create', function (req, res) {
  var id = surl(req.body.name.trim().slice(0, 15), {separator: '_', lang: 'tr'});
  templateStore.create(id, req.body)
    .then(success => res.status(200).json({ id }))
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// Template required requests
app.use('/template/:id', function (req, res, next) {
  templateStore.get(req.params.id)
    .then(template => {
      req.template = template;
      next();
    })
    .catch(err => res.status(404).send(err ? err.message : 'Template `' + req.params.id + '` not found'));
});

// Template edit
app.get('/template/:id/edit', (req, res) => {
    res.render('edit_create_template', { user: req.user, currentTemplate: req.template });
});

// Template edit post
app.post('/template/:id/edit', (req, res) => {
  templateStore.save(req.params.id, req.body)
    .then(success => res.sendStatus(200))
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// Template render
app.get('/template/:name/render', (req, res) => {
    res.render('view_template', { user: req.user });
});

// Template create
app.get('/template/create', (req, res) => {
    res.render('create_template', { user: req.user });
});

// Settings
app.get('/settings', (req, res) => {
    res.render('settings', { user: req.user });
});

// Settings Post
app.post('/settings/smtp', (req, res) => {
    var data = req.body;
    var valid = ajv.validate({
        required: ['host', 'port', 'secure', 'auth'],
        properties: {
            host: { type: "string", maxLength: 128, minLength: 5 },
            port: { type: ["number", "string"], maxLength: 5 },
            secure: {type: "string" },
            auth: {
                type: "object",
                required: ['user', 'pass'],
                properties: {
                    user: { type: "string", maxLength: 128, minLength: 5 },
                    pass: { type: "string", maxLength: 128, minLength: 5 }
                },
                additionalProperties: false
            }
        },
        additionalProperties: false
    }, data);
    if (!valid) return res.status(422).json({message: "Alanları kontrol edip tekrar deneyiniz", fields: ajv.errors });
    data.port = parseInt(data.port, 10);
    data.secure = data.secure === 'true';
    settings.save(req.user, {smtp: data})
      .then(success => res.sendStatus(200))
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { layout: 'login' });
});

// Logout page
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Login post
app.post('/login', (req, res) => {
    if (!req.body.email || !req.body.password) return res.sendStatus(400);
    var auth = require('./lib/auth');
    auth(req.body.email, req.body.password)
        .then(user => {
            req.session.user = user;
            return res.sendStatus(200);
        })
        .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// Start server
app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port " + (process.env.PORT || 3000).toString());
});