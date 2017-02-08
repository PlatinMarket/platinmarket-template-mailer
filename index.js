// Requirements
var express = require('express');
var app = express();
var fs = require('fs');

// Public folder
app.use(express.static('public'));

// Template Engine
app.engine('tpl', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(err)
        // this is an extremely simple template engine
        var rendered = content.toString().replace('#title#', '<title>' + options.title + '</title>')
            .replace('#message#', '<h1>' + options.message + '</h1>')
        return callback(null, rendered)
    })
});
app.set('views', './views') // specify the views directory
app.set('view engine', 'tpl') // register the template engine

// Main page
app.get('/', (req, res) => {
    res.render('index', { title: 'Hey', message: 'Hello there!' })
});

// Start server
app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port " + (process.env.PORT || 3000).toString());
});