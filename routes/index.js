'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();

  // Main page
  router.get('/', (req, res) => {
    templateStore.list()
      .then(templates => {
        templates = templates.filter(l => req.user.isSuper || l.department.indexOf(req.user.department) > -1);
        const departments = Array.prototype.concat.apply([], templates.map(t => t.department.filter(d => req.user.isSuper || d == req.user.department))).filter((d,i,l) => l.indexOf(d) == i).map(d => ({ name: d, templates: templates.filter(t => t.department && t.department.indexOf(d) > -1) }));
        const groups = Array.prototype.concat.apply([], templates.map(t => t.group)).filter((d,i,l) => l.indexOf(d) == i).map(d => ({ name: d, templates: templates.filter(t => t.group && t.group.indexOf(d) > -1).map(t => t.name) }));
        res.render('index', { user: req.user, departments, groups });
      })
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  // Health Check
  router.get('/healthz', (req, res) => {
    res.sendStatus(200);
  });

  return router;
})();