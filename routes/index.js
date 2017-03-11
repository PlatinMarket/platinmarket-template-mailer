'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();

  // Main page
  router.get('/', (req, res) => {
    templateStore.list()
      .then(templates => {
        templates = templates.filter(l => req.user.isSuper || l.department.indexOf(req.user.department) > -1);
        var departmentTemplates = templateStore.departments(templates).filter(d => req.user.isSuper || req.user.department == d).map(d => {
          return { name: d, templates: templates.filter(t => t.department && t.department.indexOf(d) > -1) };
        });
        var groupTemplates = templateStore.groups(templates).map(d => {
          return { name: d, templates: templates.filter(t => t.group && t.group.indexOf(d) > -1).map(t => t.name) };
        });
        res.render('index', { user: req.user, templates, departments: departmentTemplates, groups: groupTemplates });
      })
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  return router;
})();