var config = require('../config/config');
var path = require('path');
var fs = require('fs');

config = Object.assign({
    path: path.resolve(__dirname + '/../template'),
    params: {}
}, config.template || {});

function Template() {
    this.templateBaseFolder = config.path;
}

Template.prototype.getTemplate = function(name, withText){
    if (!withText) withText = false;
    var htmlFile = path.join(this.templateBaseFolder, name, name + ".tpl");
    var textFile = path.join(this.templateBaseFolder, name, name + "_text.tpl");
    return {
        html: fs.existsSync(htmlFile) ? fs.readFileSync(htmlFile, { encoding: "utf8" }) : null,
        text: withText && fs.existsSync(textFile) ? fs.readFileSync(textFile, { encoding: "utf8" }) : null
    };
};

Template.prototype.get = function(name) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            var templateConfig = this.getConfig(name);
            if (!templateConfig) return reject(templateConfig);
            resolve(Object.assign({ id: name }, templateConfig, this.getTemplate(name, templateConfig.textFallback)));
        }, 0);
    });
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
    var file = path.join(this.templateBaseFolder, name, name + '.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file));
};

// Exports module
var t = new Template();
module.exports = t;