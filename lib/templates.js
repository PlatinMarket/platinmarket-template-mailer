var config = require('../config/config');
var path = require('path');
var fs = require('fs');

config = Object.assign({
    path: path.resolve(__dirname + '/../template'),
    params: {}
}, config.template || {});

// Generate default user config
function generateTemplateFile(data) {
  data = data || {};
  return {
    name: data.name,
    description: data.description,
    department: data.department || [],
    parameter: data.parameter || [],
    subject: data.subject,
    textFallback: data.textFallback
  };
}

// Mkdir if not exists
function mkdirp (path){
    return new Promise((resolve, reject) => {
        fs.mkdir(path, (err) => {
          if(!err || (err && err.code === 'EEXIST')) return resolve(path);
          reject();
        });
    });
}

function getFilesFolders(name) {

}

function Template() {
    this.templateBaseFolder = config.path;
}

Template.prototype.resolve = function(name){
  var folder = path.join(this.templateBaseFolder, name);
  return {
    folder: folder,
    file: path.join(folder, name + '.json'),
    templateFile: path.join(folder, name + '.tpl'),
    templateTextFile: path.join(folder, name + '_text.tpl'),
  };
};

Template.prototype.delete = function (name) {
  return new Promise((resolve, reject) => {
    var resolved = this.resolve(name);
    try {
      if (fs.existsSync(resolved.file)) fs.unlinkSync(resolved.file);
      if (fs.existsSync(resolved.templateFile)) fs.unlinkSync(resolved.templateFile);
      if (fs.existsSync(resolved.templateTextFile)) fs.unlinkSync(resolved.templateTextFile);
      if (fs.existsSync(resolved.folder)) fs.rmdirSync(resolved.folder);
      resolve();
    } catch (_err) {
      reject(err);
    }
  });
};

Template.prototype.create = function(name, data) {
    var createFunc = new Promise((resolve, reject) => {
        var resolved = this.resolve(name);
        this.get(name)
            .then(r => reject(new Error('exists')))
            .catch(() => {
              mkdirp(resolved.folder)
                .then(() => {
                    fs.writeFile(resolved.file, JSON.stringify(generateTemplateFile(data)), (err) => {
                        if (err) return reject(err);
                        fs.writeFile(resolved.templateFile, data.html, (err) => {
                           if (err) return reject(err);
                           if (!data.textFallback) return resolve();
                           fs.writeFile(resolved.templateTextFile, data.text, (err) => {
                               if (err) return reject(err);
                               resolve();
                           });
                        });
                    });
                })
                .catch(err => reject(err));
            });
    });
    return new Promise((resolve, reject) => {
      var resolved = this.resolve(name);
      createFunc.then(() => resolve()).catch(err => {
          if (err && err.message == 'exists') return reject(new Error('Template `' + name + '` already created!'));
          try {
            if (fs.existsSync(resolved.file)) fs.unlinkSync(resolved.file);
            if (fs.existsSync(resolved.templateFile)) fs.unlinkSync(resolved.templateFile);
            if (fs.existsSync(resolved.templateTextFile)) fs.unlinkSync(resolved.templateTextFile);
            if (fs.existsSync(resolved.folder)) fs.rmdirSync(resolved.folder);
          } catch (_err) {}
          reject(err);
      });
    });
};

Template.prototype.save = function(name, data) {
  return new Promise((resolve, reject) => {
    var resolved = this.resolve(name);
    this.get(name)
      .then((oldData) => {
        fs.writeFile(resolved.file, JSON.stringify(Object.assign(generateTemplateFile(oldData), generateTemplateFile(data))), (err) => {
          if (err) return reject(err);
          fs.writeFile(resolved.templateFile, data.html, (err) => {
            if (err) return reject(err);
            if (!data.textFallback) return resolve();
            fs.writeFile(resolved.templateTextFile, data.text, (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      })
      .catch((err) => reject(err));
  });
};

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