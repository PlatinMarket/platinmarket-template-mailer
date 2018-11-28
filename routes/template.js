'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();
  const ajv = new require('ajv')({ allErrors: true });
  const surl = require('speakingurl');

  // Template post
  router.post(['/template/create', '/template/:id/edit'], function (req, res, next) {
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
  router.get('/template/create', (req, res) => {
    res.render('edit_create_template', { user: req.user, currentTemplate: {} });
  });

  // Template post
  router.post('/template/create', function (req, res) {
    templateStore.create(req.body)
      .then(template => res.status(200).json({ id: template.id }))
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  // Template render
  router.get('/template/group/view', (req, res) => {
    templateStore.groups()
      .then(groups => {
        var group = groups.find(g => req.query.name == g);
        if (!group) return res.status(404).send("Group not found");
        templateStore.list()
          .then(templates => {
            templates = templates.filter(t => (req.user.isSuper || t.department.indexOf(req.user.department) > -1) && t.group && t.group.indexOf(group) > -1);
            var parameters = [];
            templates.forEach(t => t.parameter.filter(p => parameters.find(_p => _p.name == p.name) == null).forEach(p => parameters.push(p)));
            res.render('view_template', { currentTemplate: { name: group, description: templates.map(t => t.name), templateIds: templates.map(t => t.id), subTemplates: templates, parameter: parameters, isGroup: true }, user: req.user });
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
  router.post('/template/send/:guid', (req, res) => {
    var params = req.body.params;
    try {
      params = JSON.parse(params);
    } catch (err) {
      params = {};
    }
    res.render('send_template', { user: req.user, params, guid: req.params.guid, template: req.body.template, to: req.body.to });
  });

  router.get('/template/send*', (req, res) => {
    res.sendStatus(404);
  });

  // Template required requests
  router.use('/template/:id', function (req, res, next) {
    templateStore.get(req.params.id)
      .then(template => {
        req.template = template;
        if (!req.user.isSuper && req.template.department.indexOf(req.user.department) == -1) return res.status(403).send("Yetkiniz yok");
        next();
      })
      .catch(err => res.status(404).send(err ? err.message : 'Template `' + req.params.id + '` not found'));
  });

  // Show template details
  router.get('/template/:id', function (req, res) {
    delete(req.template.subject);
    delete(req.template.html);
    delete(req.template.text);
    res.json(req.template);
  });

  // Template edit
  router.get('/template/:id/edit', (req, res) => {
    res.render('edit_create_template', { user: req.user, currentTemplate: req.template });
  });

  // Template edit post
  router.post('/template/:id/edit', (req, res) => {
    templateStore.save(req.params.id, req.body)
      .then(success => res.sendStatus(200))
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  // Template delete
  router.get('/template/:id/delete', (req, res) => {
    templateStore.delete(req.params.id)
      .then(() => res.redirect('/'))
      .catch(err => res.status(404).send(err ? err.message : 'Template `' + req.params.id + '` not found'));
  });

  // Template render
  router.get('/template/:id/view', (req, res) => {
    res.render('view_template', { currentTemplate: Object.assign(req.template, { isGroup: false }), user: req.user });
  });

  // Template render
  router.post(['/template/:id/render', '/template/:id/render/:type'], (req, res) => {
    var type = req.params.type || null;
    if (type && ['html', 'text', 'subject'].indexOf(type) === -1) return res.status(404).send('Requested type `' + type + '` not found!');
    templateStore.render(req.template, req.body, { user: Object.assign(req.user, { smtp: null }) }, true)
      .then((rendered) => {
        res.json(type ? rendered[type] : rendered);
        res.end();
      })
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  // Template create
  router.get('/template/create', (req, res) => {
    res.render('create_template', { user: req.user });
  });

  return router;
})();