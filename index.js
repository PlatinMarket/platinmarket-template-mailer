// Requirements
var express = require('express');
var app = express();
var fs = require('fs');
var expressHandlebars  = require('express-handlebars');

// Public folder
app.use(express.static('public'));

// Template Engine
app.engine('tpl', expressHandlebars({defaultLayout: 'default'}));
app.set('views', './views');
app.set('view engine', 'tpl');

// Main page
app.get('/', (req, res) => {
    res.render('index');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', {layout: 'login'});
});

// Start server
app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port " + (process.env.PORT || 3000).toString());
});