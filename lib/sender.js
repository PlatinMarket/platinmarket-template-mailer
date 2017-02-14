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
  this.queues = config.sender.map(s => createQueue(s));
}

// Add to queue
Sender.prototype.addQueue = function(name, message, from, to){
  var _queue;
  if (_queue = this.queues.find(q => q.name == name)) _queue.clean(5000).then(() => _queue.clean(100000, 'failed')).then(() => _queue.add({message, from, to}));
  return null;
};

// Module Exports
var s = new Sender();
module.exports = s;