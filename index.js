// Requirements
var express = require('express');
var app = express();
var fs = require('fs');
var expressHandlebars  = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var loginRequire = require('./lib/isLogged');
var templateStore = require('./lib/templates');

// Session middleware
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: false }
}));

// Set body parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Public folder
app.use(express.static('public'));

// Template Engine
app.engine('tpl', expressHandlebars({defaultLayout: 'default'}));
app.set('views', './views');
app.set('view engine', 'tpl');

// Main page
app.get('/', loginRequire, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/template', loginRequire, (req, res) => {
    templateStore.list().then(list => res.json(list.map(l => Object.assign({folder: l.folder, name: l.name})))).catch(err => res.statusCode(500));
});

// Template edit
app.get('/template/:name/edit', (req, res) => {
    res.render('edit_template');
});

// Template render
app.get('/template/:name/render', (req, res) => {
    res.render('view_template');
});

// Template create
app.get('/template/create', (req, res) => {
    res.render('create_template');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', {layout: 'login'});
});

// Logout page
app.get('/logout', loginRequire, (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Login post
app.post('/login', (req, res) => {
    if (!req.body.email || !req.body.password) return res.sendStatus(400);
    var auth = require('./lib/auth');
    auth(req.body.email, req.body.password)
        .then(user => {
            req.session.user = user;
            return res.sendStatus(200);
        })
        .catch(e => {
            res.statusCode = 400;
            res.send(e.message);
            res.end();
        });
});

// Start server
app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port " + (process.env.PORT || 3000).toString());
});