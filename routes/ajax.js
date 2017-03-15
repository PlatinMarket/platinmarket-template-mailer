'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();

  // Get Groups
  router.get('/groups', function (req, res) {
    templateStore.groups()
      .then(groups => res.json(groups))
      .catch(err => res.status(500).send("Hata oluştu"));
  });

  // Get Groups
  router.get('/departments', function (req, res) {
    templateStore.departments()
      .then(departments => res.json(departments))
      .catch(err => {
        console.error(err);
        res.status(500).send("Hata oluştu")
      });
  });

  // Get template list
  router.get('/template', (req, res) => {
    templateStore.list(['name', 'department'])
      .then(list => res.json(list.filter(l => req.user.isSuper || l.department.indexOf(req.user.department) > -1).map(l => Object.assign({id: l.id, name: l.name})).filter((t,i,l) => l.findIndex(_t => _t.name == t.name) == i)))
      .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  return router;
})();
