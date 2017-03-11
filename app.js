// Globals
global.sender = require('./lib/sender');
global.settings = require('./lib/settings');
global.templateStore = require('./lib/templates');

// Requirements
const express = require('express');
const app = express();

// Get redis options
const redisConfig = Object.assign({ port: 6379 }, (options ? options.redis : {}) || {});

// Session middleware
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  store: new RedisStore({ pass: redisConfig.password, host: redisConfig.host, port: redisConfig.port }),
  resave: false,
  saveUninitialized: true,
  maxAge: 86400000,
  cookie: {
    httpOnly: false
  }
}));

// Set body parser
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '4MB' })); // support encoded bodies

// Set Static Public folder
app.use(express.static('public'));

// Page Template Engine
const expressHandlebars  = require('express-handlebars');
app.engine('tpl', expressHandlebars({defaultLayout: 'default'}));
app.set('views', './views');
app.set('view engine', 'tpl');

// Child Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/index'));
app.use('/', require('./routes/file_explorer'));
app.use('/', require('./routes/job'));
app.use('/', require('./routes/settings'));
app.use('/', require('./routes/template'));
app.use('/', require('./routes/ajax'));
app.use('/', require('./routes/send'));

// Build queue & Start server
sender.getReady().then(() => {
  sender.getQueues().forEach(q => winston.log('info', "Queue `" + q.name + "` ready for command."));
  app.listen(process.env.PORT || 3000, function () {
    winston.log('info', "Server started on port " + (process.env.PORT || 3000).toString());
  });
}).catch(err => console.error('Redis connection error', err));

// Export App
module.exports = app;