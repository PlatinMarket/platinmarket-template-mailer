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
var handlebars = require('handlebars');
var sender = require('./lib/sender');
var config = require('./config/config');
var emailSender = require('./sender/email');

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
app.use(['/departments', '/groups', '/template', '/settings', '/logout', /^\/$/], function (req, res, next) {
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

// Super User Zone
app.use(['/template/:id/edit', '/template/create', '/template/:id/delete'], function (req, res, next) {
  if (!req.user.isSuper) return res.status(403).send("Yetkiniz yok");
  next();
});

// Main page
app.get('/', (req, res) => {
  templateStore.list()
    .then(templates => {
      templates = templates.filter(l => req.user.isSuper || l.department.indexOf(req.user.department) > -1);
      departmentTemplates = templateStore.departments(templates).map(d => {
        return { name: d, templates: templates.filter(t => t.department && t.department.indexOf(d) > -1) };
      });
      groupTemplates = templateStore.groups(templates).map(d => {
        return { name: d, templates: templates.filter(t => t.group && t.group.indexOf(d) > -1).map(t => t.name) };
      });
      res.render('index', { user: req.user, templates, departments: departmentTemplates, groups: groupTemplates });
    })
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// Get Groups
app.get('/groups', function (req, res) {
  templateStore.groups()
    .then(groups => res.json(groups))
    .catch(err => res.status(500).send("Hata oluştu"));
});

// Get Groups
app.get('/departments', function (req, res) {
  templateStore.departments()
    .then(departments => res.json(departments))
    .catch(err => res.status(500).send("Hata oluştu"));
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
    required: ['name', 'subject', 'html', 'description', 'department', 'parameter', 'textFallback'],
    properties: {
      name: { type: "string", maxLength: 128, minLength: 5 },
      type: { type: "string", enum: ["email", "sms"] },
      subject: { type: "string", minLength: 5 },
      description: { type: "string", maxLength: 128 },
      group: { type: "array", items: { type: "string", maxLength: 128 } },
      department: { type: "array", items: { type: "string", maxLength: 128 } },
      parameter: {
        type: "array",
        items: {
          type: "object",
          required: ['name', 'title', 'type', 'require', 'default'],
          properties: {
            name: { type: "string", maxLength: 40, minLength: 3 },
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
    p.name = p.name && p.name.match(/[\s|\W]/) == null ? p.name : surl(p.title.replace(/-/gi, "_").trim(), {separator: '_', lang: 'tr'});
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

// Template render
app.get('/template/group/view', (req, res) => {
  templateStore.groups()
    .then(groups => {
      var group = groups.find(g => req.query.name == g);
      if (!group) return res.status(404).send("Group not found");
      templateStore.list()
        .then(templates => {
          templates = templates.filter(t => (req.user.isSuper || t.department.indexOf(req.user.department) > -1) && t.group && t.group.indexOf(group) > -1);
          var parameters = [];
          templates.forEach(t => t.parameter.filter(p => parameters.find(_p => _p.name == p.name) == null).forEach(p => parameters.push(p)));
          res.render('view_template', { currentTemplate: { name: group, description: templates.map(t => t.name), templateFolders: templates.map(t => t.folder), subTemplates: templates, parameter: parameters, isGroup: true }, user: req.user });
        })
        .catch(err => {
          res.status(500).send("Hata oluştu");
          console.error(err);
        });
    })
    .catch(err => {
      res.status(500).send("Hata oluştu");
      console.error(err);
    });
});

// Template required requests
app.use('/template/:id', function (req, res, next) {
  templateStore.get(req.params.id)
    .then(template => {
      req.template = template;
      if (!req.user.isSuper && req.template.department.indexOf(req.user.department) == -1) return res.status(403).send("Yetkiniz yok");
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

// Template delete
app.get('/template/:id/delete', (req, res) => {
  templateStore.delete(req.params.id)
    .then(() => res.redirect('/'))
    .catch(err => res.status(404).send(err ? err.message : 'Template `' + req.params.id + '` not found'));
});

// Template render
app.get('/template/:id/view', (req, res) => {
    res.render('view_template', { currentTemplate: Object.assign(req.template, { isGroup: false }), user: req.user });
});

// Template render
app.post(['/template/:id/render', '/template/:id/render/:type'], (req, res) => {
  var type = req.params.type || null;
  if (type && ['html', 'text', 'subject'].indexOf(type) === -1) return res.status(404).send('Requested type `' + type + '` not found!');
  templateStore.render(req.template, req.body, { user: Object.assign(req.user, { smtp: null }) })
    .then((rendered) => {
      res.json(type ? rendered[type] : rendered);
      res.end();
    })
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

/*
SEND PROCESS
 */

// 1. Parse template
app.use('/send/:id', (req, res, next) => {
  if (!req.params.id || req.params.id.trim() == "") return res.sendStatus(404);
  req.params.id = req.params.id.trim();
  templateStore.list()
    .then(templates => {
      var template = templates.find(t => t.folder && t.folder === req.params.id.trim()) || templates.filter(t => t.group && t.group.indexOf(req.params.id.trim()) > -1);
      templates = template instanceof Array ? template : [template];
      if (templates.length == 0) return res.sendStatus(404);
      Promise.all(templates.map(t => templateStore.get(t.folder)))
        .then(templates => {
          req.templates = templates;
          next();
        })
        .catch(err => { throw err; })
    })
    .catch(err => res.sendStatus(500));
});

// 2. Parse params
app.use('/send/:id', (req, res, next) => {
  var params = Object.assign(req.query, req.body);
  params = Object.assign({
    from: req.user ? req.user.email : (config && config.user && config.user.default ? config.user.default.email : undefined),
  }, params);
  req.body = params;
  if (!params || !params.from || !params.to) return res.sendStatus(400);
  settings.users()
    .then(users => {
      var defaultUser = (config && config.user && config.user && config.user.default  ? config.user.default : {});
      req.user = params.from == defaultUser.email ? Object.assign(defaultUser, { isDefault: true }) : users.find(u => u.email == params.from);
      if (!req.user) return res.sendStatus(400);
      next();
    })
    .catch(err => res.status(500).send(err));
});

// Template render
app.use('/send/:id', (req, res) => {
  Promise.all(req.templates.map(t => templateStore.render(t, req.body, { user: {name: req.user.name, email: req.user.email} })))
    .then((renderedTemplates) => {
      renderedTemplates = renderedTemplates.map(t => Object.assign(t, { template: req.templates.find(_t => _t.folder == t.template_id), template_id: undefined })).filter(t => t.template && t.template.type);
      renderedTemplates.map(t => sender.addQueue(t.template.type, t, req.user, req.body.to));
      res.sendStatus(200);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});

// Template create
app.get('/template/create', (req, res) => {
    res.render('create_template', { user: req.user });
});

// Settings
app.get('/settings', (req, res) => {
    res.render('settings', { user: req.user });
});

// SMTP Validation
app.post('/settings/smtp', (req, res, next) => {
  var data = req.body;
  var valid = ajv.validate({
    required: ['host', 'port', 'secure', 'auth'],
    properties: {
      host: { type: "string", maxLength: 128, minLength: 1 },
      port: { type: ["number", "string"], maxLength: 1 },
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
    },
    additionalProperties: false
  }, data);
  if (!valid) return res.status(422).json({message: "Alanları kontrol edip tekrar deneyiniz", fields: ajv.errors });
  data.port = parseInt(data.port, 10);
  data.secure = data.secure === 'true';
  emailSender.validateSMTP({ smtp: data }).then(valid => {
    if (!valid) return res.status(422).json({message: "SMTP doğrulaması başarısız. " + (emailSender.lastError ? emailSender.lastError.response : ""), error: emailSender.lastError });
    req.body = data;
    next();
  });
});

// SMTP Settings Post
app.post('/settings/smtp', (req, res) => {
  settings.save(req.user, { smtp: req.body })
    .then(success => res.sendStatus(200))
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// IMAP Validation
app.post('/settings/imap', (req, res, next) => {
  var data = req.body;
  var valid = ajv.validate({
    required: ['host', 'secure', 'port'],
    properties: {
      host: { type: "string", maxLength: 128, minLength: 1 },
      sent_folder: { type: "string", maxLength: 128, minLength: 1 },
      port: { type: ["number", "string"], maxLength: 1 },
      secure: {type: "string" }
    },
    additionalProperties: false
  }, data);
  if (!valid) return res.status(422).json({message: "Alanları kontrol edip tekrar deneyiniz", fields: ajv.errors });
  data.port = parseInt(data.port, 10);
  data.secure = data.secure === 'true';
  emailSender.validateIMAP(Object.assign(req.user, { imap: req.body })).then(valid => {
    if (!valid) return res.status(422).json({message: "IMAP doğrulaması başarısız. " + (emailSender.lastError ? emailSender.lastError.code : ""), error: emailSender.lastError });
    req.body = data;
    next();
  });
});

// IMAP Settings Post
app.post('/settings/imap', (req, res) => {
  settings.save(req.user, { imap: req.body })
    .then(success => res.sendStatus(200))
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// IMAP Get Mail box list
app.post('/settings/mailboxes', (req, res) => {
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
        .catch(err => res.status(500).json({message: err ? err.message : "Belirsiz bir hata", stack: err ? err.stack : ""}));
});

// Start server
app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port " + (process.env.PORT || 3000).toString());
});