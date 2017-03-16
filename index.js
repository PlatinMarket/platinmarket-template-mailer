'use strict';

// Global lib
global.logging = require('./lib/logging');
global.sender = require('./lib/sender');
global.settings = require('./lib/settings');
global.templateStore = require('./lib/templates');
global.storage = require('./lib/storage');

// Set redis options
global.redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  pass: process.env.REDIS_PASS || undefined
};

// Requirements
const express = require('express');
const app = express();
app.set('etag', false);

// Add the request logger before anything else so that it can accurately log requests.
app.use(logging.requestLogger);

// Session middleware
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  store: new RedisStore(redisConfig),
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
app.use(express.static('public', { etag: false, lastModified: false, maxage: '7d'}));

// Page Template Engine
const Handlebars = require('handlebars');
Handlebars.registerHelper('asset_cache', (options) => settings.getDefaults().find(s => s.name == 'asset_cache').value);
Handlebars.registerHelper('raw-helper', (options) => options.fn());
const expressHandlebars  = require('express-handlebars');
app.engine('tpl', expressHandlebars({ defaultLayout: 'default', handlebars: Handlebars }));
app.set('views', './views');
app.set('view engine', 'tpl');

// Production Settings
if (process.env.NODE_ENV === "production") {
  app.enable('view cache'); // Enable view cache
}

// Child Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/index'));
app.use('/', require('./routes/file_explorer'));
app.use('/', require('./routes/job'));
app.use('/', require('./routes/settings'));
app.use('/', require('./routes/template'));
app.use('/', require('./routes/ajax'));
app.use('/', require('./routes/send'));

// Error Logging
app.use(logging.errorLogger);

// Build queue & Start server
sender.getReady().then(() => {
  sender.getQueues().forEach(q => logging.log('verbose', "Queue `" + q.name + "` ready for command."));
  app.listen(process.env.PORT || 3000, function () {
    logging.log('verbose', "Server started on port " + (process.env.PORT || 3000).toString());
  });
}).catch(err => console.error('Redis connection error', err));

// Export App
module.exports = app;