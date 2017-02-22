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
var files = require('./lib/files');
var multer  = require('multer');

// Set template file storage
templateStore.setStorageService(files);

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
app.use(['/files', '/explorer', '/job', '/departments', '/groups', '/template', '/settings', '/logout', /^\/$/], function (req, res, next) {
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
    if (req.get('X-Requested-With') == 'XMLHttpRequest') return res.status(401).json({message: "Giriş yapınız" });
    res.redirect('/login');
});

// Super User Zone
app.use(['/files', '/explorer', '/template/:id/edit', '/template/create', '/template/:id/delete'], function (req, res, next) {
  if (!req.user || !req.user.isSuper) return res.status(403).send("Yetkiniz yok");
  next();
});

// -- FILES -----

// Get file from StorageService
app.get('/s/*', function (req, res) {
  var path = req.params['0'];
  if (!path) return res.sendStatus(404);
  path = "/" + path;
  files.downloadFile({ path }).then(a => res.sendFile(a)).catch(err => {
    if (err && err.status == 409) return res.sendStatus(404);
    res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" });
  });
});

// File Explorer
app.get('/explorer*', function (req, res) {
  res.render('file_explorer', { user: req.user });
});

// Get files
app.post('/files', function (req, res) {
  files.getFiles(req.body)
    .then(files => res.json(files))
    .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
});

// Get file thumbnail
app.post('/files/thumbnail', function (req, res) {
  files.getThumbnail(req.body)
    .then(files => res.json(files))
    .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
});

// Delete file / folder
app.post('/files/delete', function (req, res) {
  files.deleteFile(req.body)
    .then(r => res.json(r))
    .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
});

// Create folder
app.post('/files/create_folder', function (req, res) {
  files.createFolder(req.body)
    .then(r => res.json(r))
    .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
});

// File upload
var upload = multer({ dest: 'uploads/' });
app.post('/files/upload', upload.array('files[]'), function (req, res) {
  Promise.all(req.files.map(f => files.uploadFile({ path: req.body.path + '/' + f.originalname, contents: fs.readFileSync(f.path)}))).then(r => {
    if (req.files && req.files instanceof Array) req.files.forEach(f => fs.unlinkSync(f.path));
    res.json(r);
  }).catch(err => {
    if (req.files && req.files instanceof Array) req.files.forEach(f => fs.unlinkSync(f.path));
    res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" });
  });
});

// -- FILES -----

// Get Job List by type
app.get('/job/detail/:type/:id', (req, res) => {
  sender.getJob(req.params.type, req.params.id).then(job => {
    if (!req.user.isSuper && job.data.from.email != req.user.email) return res.status(403).send("Yetkiniz yok");
    res.json(job)
  }).catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// Get Job List by type
app.get('/job/list/:type', (req, res) => {
  var type = req.params.type;
  var typeMap = {'completed': 'getCompleted', 'failed': 'getFailed', 'active': 'getActive', 'waiting': 'getWaiting'};
  type = typeMap[type]
  if (!type) return res.sendStatus(400);
  Promise.all(sender.getQueues().map(q => { return q[type]().then(jobs => Object.assign({name:q.name, list: jobs.filter(j => j.data.from && (req.user.isSuper || j.data.from.email == req.user.email)).map(j => Object.assign({from: j.data.from.email, subject: j.data.message.subject, timestamp: j.timestamp, to: j.data.to, id: j.jobId})) } )); })).then(list => res.json(list));
});

// Main page
app.get('/', (req, res) => {
  templateStore.list()
    .then(templates => {
      templates = templates.filter(l => req.user.isSuper || l.department.indexOf(req.user.department) > -1);
      departmentTemplates = templateStore.departments(templates).filter(d => req.user.isSuper || req.user.department == d).map(d => {
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

// Template send
app.post('/template/send/:guid', (req, res) => {
  var params = req.body.params;
  try {
    params = JSON.parse(params);
  } catch (err) {
    params = {};
  }
  res.render('send_template', { user: req.user, params, guid: req.params.guid, template: req.body.template, to: req.body.to });
});
app.get('/template/send*', (req, res) => {
  res.sendStatus(404);
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
  templateStore.render(req.template, req.body, { user: Object.assign(req.user, { smtp: null }) }, true)
    .then((rendered) => {
      res.json(type ? rendered[type] : rendered);
      res.end();
    })
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

/*
SEND PROCESS START
 */

// 0. Check Job already add to queue
app.use(['/send/:id', '/send'], (req, res, next) => {
  if (!req.query.guid) return next();
  sender.getJobFromGUID(req.query.guid).then(jobs => {
    if (!jobs || jobs.length == 0) return next();
    res.json(jobs.map(j => Object.assign({id: parseInt(j.jobId, 10), guid: j.data.guid || undefined, subject: j.data.message.subject, to: j.data.to, type: j.data.message.template.type })));
  }).catch(err => res.status(500).send(err));
});

// 1. Parse template
app.use(['/send/:id', '/send'], (req, res, next) => {
  req.params['id'] = req.params.id || req.query.id;
  if (req.query.id) delete(req.query.id);
  if (!req.params.id || req.params.id.trim() == "") return res.sendStatus(404);
  req.params.id = req.params.id.trim();
  templateStore.list()
    .then(templates => {
      var template = templates.find(t => t.folder && t.folder.toLowerCase() === req.params.id.toLowerCase()) || templates.filter(t => t.group && t.group.map(g => g.toLowerCase()).indexOf(req.params.id.toLowerCase()) > -1);
      templates = template instanceof Array ? template : [template];
      if (templates.length == 0) return res.sendStatus(404);
      Promise.all(templates.map(t => templateStore.get(t.folder)))
        .then(templates => {
          req.templates = templates;
          next();
        })
        .catch(err => { throw err; })
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
});

// 2. Parse params
app.use(['/send/:id', '/send'], (req, res, next) => {
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

// 3. Render templates
app.use(['/send/:id', '/send'], (req, res, next) => {
  Promise.all(req.templates.map(t => templateStore.render(t, req.body, { user: {name: req.user.name, email: req.user.email} })))
    .then((renderedTemplates) => {
      req.templates = renderedTemplates.map(t => Object.assign(t, { template: req.templates.find(_t => _t.folder == t.template_id), template_id: undefined })).filter(t => t.template && t.template.type);
      next();
    })
    .catch(err => res.status(500).send(err));
});

// 4. Download attachments
app.use(['/send/:id', '/send'], (req, res, next) => {
  var attachments = [];
  req.templates
    .filter(t => (t.attachments && (t.attachments instanceof Array) && t.attachments.length > 0))
    .forEach(t => t.attachments.filter(a => !attachments.find(_a => _a.path != a.path)).forEach(a => attachments.push(a)));
  Promise.all(attachments.map(a => {
    return new Promise((resolve, reject) => {
      files.downloadFile({ path: a.path }).then(localPath => {
        a._path = localPath;
        resolve(a);
      }).catch(err => {
        var templateNames = req.templates.map(t => t.template.name);
        if (err && err.status == 409) return res.status(400).json({success: 'error', message: 'Attachment `' + a.path + '` not found! Templates `' + templateNames.join(',') + '`'});
        reject(err);
      });
    });
  })).then(attachments => {
    attachments.forEach(a => req.templates.filter(t => t.attachments.find(_a => _a.path == a.path)).forEach(t => t.attachments.filter(_a => _a.path == a.path).forEach(_a => _a.path = a.path)));
    req.templates.forEach(t => t.attachments.forEach(a => {
      a.path = a._path.slice(0);
      delete(a._path);
    }));
    next();
  }).catch(err => res.status(500).send(err));
});

// 5. Send mail
app.use(['/send/:id', '/send'], (req, res) => {
  Promise.all(req.templates.map(t => sender.addQueue(t.template.type, t, req.user, req.body.to, (req.body.guid || null)))).then((jobs) => {
    res.json(jobs.map(j => Object.assign({id: parseInt(j.jobId, 10), guid: j.data.guid || undefined, subject: j.data.message.subject, to: j.data.to, type: j.data.message.template.type })));
  });
});

/*
 SEND PROCESS END
 */

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
    if (!valid) return res.status(422).json({message: "SMTP doğrulaması başarısız. " + (emailSender.lastError ? emailSender.lastError.response : ""), error: emailSender.lastError });
    req.body = data;
    next();
  });
});

// SMTP Settings Post
app.post('/settings/smtp', (req, res) => {
  settings.save(req.user, req.body)
    .then(success => res.sendStatus(200))
    .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
});

// IMAP Validation
app.post('/settings/imap', (req, res, next) => {
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
          secure: {type: "string" }
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
app.post('/settings/imap', (req, res) => {
  settings.save(req.user, req.body)
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

// Build queue & Start server
sender.getReady().then(() => {
  console.log("-- ACTIVE QUEUES ------");
  sender.getQueues().forEach(q => console.log("* " + q.name + " ready"));
  console.log("-----------------------");
  app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port " + (process.env.PORT || 3000).toString());
  });
}).catch(err => console.error('Redis connection error', err));
