'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();

  /*
   SEND PROCESS START
   */

  // 0. Check Job already add to queue
  router.use(['/send/:id', '/send'], (req, res, next) => {
    if (!req.query.guid) return next();
    sender.getJobFromGUID(req.query.guid).then(jobs => {
      if (!jobs || jobs.length === 0) return next();
      res.json(jobs.map(j => Object.assign({id: parseInt(j.id, 10), guid: j.data.guid || undefined, subject: j.data.message.subject, to: j.data.to, type: j.data.message.template.type })));
    }).catch(err => {
      winston.log('error', 'SEND_PROCESS_0', err);
      res.status(500).send(err);
    });
  });

  // 1. Parse template
  router.use(['/send/:id', '/send'], (req, res, next) => {
    req.params['id'] = req.params.id || req.query.id;
    if (req.query.id) delete(req.query.id);
    if (!req.params.id || req.params.id.trim() === "") return res.sendStatus(404);
    req.params.id = req.params.id.trim();
    templateStore.list()
      .then(templates => {
        var template = templates.find(t => t.id && t.id.toString() === req.params.id.toString()) || templates.filter(t => t.group && t.group.map(g => g.toLowerCase()).indexOf(req.params.id.toLowerCase()) > -1);
        templates = template instanceof Array ? template : [template];
        if (templates.length === 0) return res.sendStatus(404);
        Promise.all(templates.map(t => templateStore.get(t.id)))
          .then(templates => {
            req.templates = templates;
            next();
          })
          .catch(err => {
            winston.log('error', 'SEND_PROCESS_1_0', err);
            res.sendStatus(500);
          })
      })
      .catch(err => {
        winston.log('error', 'SEND_PROCESS_1_1', err);
        res.sendStatus(500);
      });
  });

  // 2. Parse params
  router.use(['/send/:id', '/send'], (req, res, next) => {
    var params = Object.assign(req.query, req.body);
    params = Object.assign({
      from: req.user ? req.user.email : (options && options.user && options.user.default ? options.user.default.email : undefined),
    }, params);
    req.body = params;
    if (!params || !params.from || !params.to) return res.sendStatus(400);
    settings.users()
      .then(users => {
        const defaultSmtpUser = settings.defaultSmtpUser();
        req.user = params.from === defaultSmtpUser.email ? Object.assign(defaultSmtpUser, { isDefault: true }) : (users.find(u => u.email == params.from) || req.user);
        if (!req.user) {
          winston.log('warn', 'SEND_PROCESS_2_0', new Error('User ' + params.from + ' not found'));
          res.sendStatus(400);
        };
        next();
      })
      .catch(err => {
        winston.log('error', 'SEND_PROCESS_2_1', err);
        res.sendStatus(500);
      });
  });

  // 3. Render templates
  router.use(['/send/:id', '/send'], (req, res, next) => {
    Promise.all(req.templates.map(t => templateStore.render(t, req.body, { user: {name: req.user.name, email: req.user.email} })))
      .then((renderedTemplates) => {
        req.templates = renderedTemplates.map(t => Object.assign(t, { template: req.templates.find(_t => _t.id.toString() === t.id.toString()) })).filter(t => t.template && t.template.type);
        next();
      })
      .catch(err => {
        winston.log('error', 'SEND_PROCESS_3', err);
        res.sendStatus(500);
      });
  });

  // 5. Send mail
  router.use(['/send/:id', '/send'], (req, res) => {
    Promise.all(req.templates.map(t => sender.addQueue(t.template.type, t, req.user, req.body.to, (req.body.guid || null)))).then((jobs) => {
      res.json(jobs.map(j => Object.assign({id: parseInt(j.id, 10), guid: j.data.guid || undefined, subject: j.data.message.subject, to: j.data.to, type: j.data.message.template.type })));
    }).catch(err => {
      winston.log('error', 'SEND_PROCESS_4', err);
      res.sendStatus(500);
    });
  });

  /*
   SEND PROCESS END
   */

  return router;
})();