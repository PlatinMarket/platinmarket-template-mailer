var config = require('../config/config');
var path = require('path');
var fs = require('fs');

config = Object.assign({
    template: {
        path: path.resolve(__dirname + '/../template'),
        params: {}
    }
}, config || {});

function Template() {
    this.templateBaseFolder = config.template.path;
}

Template.prototype.get = function (name) {

};

Template.prototype.list = function () {
    return new Promise((resolve, reject) => {
        fs.readdir(this.templateBaseFolder, (err, files) => {
            if (err) return reject(err);
            resolve(files.filter(file => fs.statSync(path.join(this.templateBaseFolder, file)).isDirectory()).map(file => Object.assign({folder: file}, this.getConfig(file))));
        });
    });
};

Template.prototype.getConfig = function(name) {
    var file = path.join(this.templateBaseFolder, name, name);
    delete require.cache[require.resolve(file)];
    return require(file);
};

// Exports module
var t = new Template();
module.exports = t;