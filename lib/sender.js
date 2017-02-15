var config = require('../config/config'),
    Queue = require('bull');

// Redis config
config.redis = Object.assign({
  host: process.env.redis || "localhost",
  port: 6379,
  password: null
}, config.redis || {});

// Sender config
config.sender = Object.assign({
  email: '../sender/email'
}, config.sender || {});

// Call all sender
config.sender = Object.keys(config.sender).map(s => {return { name: s, func: require(config.sender[s]) }; });

// Queue Builder
function createQueue(sender) {
  var _queue = new Queue(sender.name, config.redis.port, config.redis.host, { password: config.redis.password });

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
      this.queues = config.sender.map(s => createQueue(s));
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

// Return job
Sender.prototype.getJob = function (type, id) {
  return new Promise((resolve, reject) => {
    try {
      var q = this.queues.find(q => q.name == type);
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
Sender.prototype.addQueue = function(name, message, from, to){
  return new Promise((resolve, reject) => {
    try {
      var q = this.queues.find(q => q.name == name);
      q.clean(36000000)
        .then(() => q.clean(172800000, 'failed'))
        .then(() => q.add({message, from, to}))
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