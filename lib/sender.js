var Queue = require('bull');

// Sender options
var sender = {
  email: '../sender/email'
};

// Call all sender
sender = Object.keys(sender).map(s => {return { name: s, func: require(sender[s]) }; });

// Queue Builder
function createQueue(sender) {
  var _queue = new Queue(sender.name, {redis: { port: redisConfig.port, host: redisConfig.host, password: redisConfig.pass }});

  // Queue processor
  _queue.process((job, done) => {
    try {
      sender.func.process(job.data.message, job.data.from, job.data.to).then(r => done(null, r)).catch(err => done(err));
    } catch (err) {
      done(err);
    }
  });

  return _queue;
}

function Sender() {
  this.queues = [];
}

// Get Ready All Queues
Sender.prototype.getReady = function () {
  return new Promise((resolve, reject) => {
    try {
      this.queues = sender.map(s => createQueue(s));
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

// Return queues
Sender.prototype.getQueues = function () {
  return this.queues;
};

// Return jobs
Sender.prototype.getJobFromGUID = function (guid) {
  var methods = ['getCompleted', 'getFailed', 'getActive', 'getWaiting'];
  return new Promise((resolve, reject) => {
    var _results = [];
    Promise.all(this.queues.map(q => {
      return Promise.all(methods.map(m => {
        return new Promise((res, rej) => {
          q[m]().then(jobs => {
            jobs.filter(j => j.data.guid === guid).forEach(j => _results.push(j));
            res();
          }).catch(err => rej(err));
        });
      }));
    })).then(() => {
      resolve(_results);
    }).catch(err => reject(err));
  });
};

// Return job
Sender.prototype.getJob = function (type, id) {
  return new Promise((resolve, reject) => {
    try {
      var q = this.queues.find(q => q.name === type);
      q.getJob(id).then(job => {
        delete(job.data.from.smtp);
        delete(job.data.from.imap);
        resolve(job);
      }).catch(err => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

// Add to queue
Sender.prototype.addQueue = function(name, message, from, to, guid){
  return new Promise((resolve, reject) => {
    try {
      var q = this.queues.find(q => q.name === name);
      q.clean(36000000)
        .then(() => q.clean(172800000, 'failed'))
        .then(() => q.add({message, from, to, guid}))
        .then((job) => resolve(job))
        .catch(err => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

// Module Exports
var s = new Sender();
module.exports = s;