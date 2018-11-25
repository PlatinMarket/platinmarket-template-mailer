'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();

  // Get Job List by type
  router.get('/job/detail/:type/:id', (req, res) => {
    sender.getJob(req.params.type, req.params.id).then(job => {
      if (!req.user.isSuper && job.data.from.email != req.user.email) return res.status(403).send("Yetkiniz yok");
      res.json(job)
    }).catch(err => res.status(500).json({message: err.message, stack: err.stack}));
  });

  // Get Job List by type
  router.get('/job/list/:type', (req, res) => {
    var type = req.params.type;
    var typeMap = {'completed': 'getCompleted', 'failed': 'getFailed', 'active': 'getActive', 'waiting': 'getWaiting'};
    type = typeMap[type];
    if (!type) return res.sendStatus(400);
    Promise.all(sender.getQueues().map(q => { return q[type]().then(jobs => Object.assign({name:q.name, list: jobs.filter(j => j.data.from && (req.user.isSuper || j.data.from.email == req.user.email)).map(j => Object.assign({from: j.data.from.email, subject: j.data.message.subject, timestamp: j.timestamp, to: j.data.to, id: j.id})) } )); })).then(list => res.json(list));
  });

  return router;
})();