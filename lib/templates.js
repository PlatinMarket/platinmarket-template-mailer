var config = require('../config/config');
var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');

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
    group: data.group || [],
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

Template.prototype.groups = function(templates) {
  function getGroups(templates) {
    var groups = [];
    templates.filter(t => t.group).forEach(t => t.group.filter(g => groups.indexOf(g) == -1).forEach(g => groups.push(g)));
    return groups;
  }
  if (templates) return getGroups(templates);
  return new Promise((resolve, reject) => {
    this.list().then(templates => resolve(getGroups(templates))).catch(err => reject(err));
  });
};

Template.prototype.departments = function(templates) {
  function getDepartments(templates) {
    var departments = [];
    templates.filter(t => t.group).forEach(t => t.department.filter(d => departments.indexOf(d) == -1).forEach(d => departments.push(d)));
    return departments;
  }
  if (templates) return getDepartments(templates);
  return new Promise((resolve, reject) => {
    this.list().then(templates => resolve(getDepartments(templates))).catch(err => reject(err));
  });
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

Template.prototype.render = function (template, params, extendData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      params = typeof params == "object" ? params : {};
      var parameters = template.parameter || [];
      var templateParams = {};
      Object.keys(params).filter(k => parameters.find(p => p.name == k)).forEach((k) => {
        var param = parameters.find(p => p.name == k);
        var value = param.type == "boolean" ? (params[k] ? true : false) : params[k].toString();
        templateParams[k] = value || param.default;
      });
      var subject = template.subject ? handlebars.compile(template.subject)(Object.assign(templateParams, extendData)) : "";
      var html = template.html ? handlebars.compile(template.html)(Object.assign(templateParams, extendData)) : "";
      var text = template.textFallback && template.text ? handlebars.compile(template.text)(Object.assign(templateParams, extendData)) : false;
      resolve({ subject, html, text});
    }, 0);
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
        fs.writeFile(resolved.file, JSON.stringify(Object.assign(generateTemplateFile(oldData), generateTemplateFile(data), { name: oldData.name })), (err) => {
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
            resolve(Object.assign({ id: name }, templateConfig, this.getTemplate(name, templateConfig.textFallback), {folder: name}));
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
    if (!name) return null;
    var file = path.join(this.templateBaseFolder, name, name + '.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file));
};

// Exports module
var t = new Template();
module.exports = t;