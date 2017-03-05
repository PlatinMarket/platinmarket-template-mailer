var path = require('path');
var fs = require('fs');
var promisedHandlebars = require('promised-handlebars');
var handlebars = promisedHandlebars(require('handlebars'));
var surl = require('speakingurl');

// For Template Rendering
var moment = require('moment');
moment.locale('tr');

var config = Object.assign({
    path: 'template',
    host: 'http://localhost:3000',
    params: {}
}, options.template || {});

// Build image address
function buildImageAddress(forPreview, path) {
  return ((!forPreview ? config.host : "") + "/s" + path);
}

// Handlebars helpers
function registerHelpers(forPreview, attachments) {
  // Attach files
  handlebars.registerHelper('attach', (_path) => {
    if (forPreview) return buildImageAddress(true, _path);
    var filename = path.basename(_path);
    var cid = surl(filename, {separator: '_', lang: 'tr'});
    if (!attachments.find(a => a.path == _path)) attachments.push({ cid, path: _path, filename });
    return "cid:" + cid;
  });

  // File address
  handlebars.registerHelper('link', (path) => {
    return buildImageAddress(forPreview, path);
  });

  // Moment date format
  handlebars.registerHelper('date', (format, d) => {
    return moment().format(format).toString();
  });

  // Embed file content
  handlebars.registerHelper('embed', (_path) => {
    return new Promise((resolve, reject) => {
      files.downloadFile({ path: _path }).then(localPath => {
        fs.readFile(localPath, (err, data) => {
          if (err) return reject(err);
          resolve(data.toString());
        });
      }).catch(err => reject(err));
    });
  });

  // Render file content
  handlebars.registerHelper('render', (_path, f) => {
    return new Promise((resolve, reject) => {
      files.downloadFile({ path: _path }).then(localPath => {
        fs.readFile(localPath, (err, data) => {
          if (err) return reject(err);
          try {
            handlebars.compile(data.toString())(f.data.root).then(compiledData => resolve(compiledData)).catch(err => reject(err));
          } catch (err) {
            return reject(err, localPath);
          }
        });
      }).catch(err => reject(err));
    });
  });
}

function Template() {
    this.templateBaseFolder = config.path;
}

Template.prototype.EMAIL = 'email';
Template.prototype.SMS = 'sms';

// Generate default user config
function generateTemplateFile(data) {
  data = data || {};
  return {
    name: data.name,
    type: data.type || Template.prototype.EMAIL,
    description: data.description,
    group: data.group || [],
    department: data.department || [],
    parameter: data.parameter || [],
    subject: data.subject,
    textFallback: data.textFallback
  };
}

Template.prototype.resolve = function(name){
  var folder = storage.joinPath(this.templateBaseFolder, name);
  return {
    folder: folder,
    file: storage.joinPath(folder, name + '.json'),
    templateFile: storage.joinPath(folder, name + '.tpl'),
    templateTextFile: storage.joinPath(folder, name + '_text.tpl'),
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
  var resolved = this.resolve(name);
  return Promise.all([resolved.file, resolved.templateFile, resolved.templateTextFile].map(f => storage.exists(f).then((result) => Promise.resolve({folder: f, exists: result}))))
    .then(folders => Promise.all(folders.filter(f => f.exists).map(f => storage.unlink(f.folder))))
    .then(() => storage.rmdir(resolved.folder));
};

Template.prototype.render = function (template, params, extendData, forPreview) {
  extendData = extendData || {};
  forPreview = forPreview || false;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      params = typeof params == "object" ? params : {};
      var parameters = template.parameter || [];
      var templateParams = {};
      Object.keys(params).filter(k => parameters.find(p => p.name == k)).forEach((k) => {
        var param = parameters.find(p => p.name == k);
        var value = param.type == "boolean" ? (params[k] ? true : false) : params[k].toString();
        templateParams[k] = value || param.default;
      });
      try {
        var attachments = [];
        registerHelpers(forPreview, attachments);
        var subject, html, text;
        handlebars.compile(template.subject || "")(Object.assign(templateParams, extendData))
          .then(_subject => {
            subject = _subject;
            return handlebars.compile(template.html || "")(Object.assign(templateParams, extendData));
          })
          .then(_html => {
            html = _html;
            return handlebars.compile(template.text || "")(Object.assign(templateParams, extendData));
          })
          .then(_text => {
            text = template.textFallback ? _text : false;
            resolve({ subject, html, text, template_id: template.folder, attachments });
          })
          .catch(_err => reject(_err));
      } catch (err) {
        reject(err);
      }

    }, 0);
  });
};

Template.prototype.create = function(name, data) {
  var resolved = this.resolve(name);
  return this.getConfig(name)
    .then(conf => {
      if (conf != null) return Promise.reject(new Error('exists'))
      return storage.mkdir(resolved.folder)
        .then(() => storage.writeFile(resolved.file, JSON.stringify(generateTemplateFile(data))))
        .then(() => storage.writeFile(resolved.templateFile, data.html))
        .then(() => storage.writeFile(resolved.templateTextFile, data.text))
        .catch(err => {
          this.delete(name);
          return Promise.reject(err);
        });
    });
};

Template.prototype.save = function(name, data) {
  var resolved = this.resolve(name);
  return this.get(name)
    .then((oldData) => storage.writeFile(resolved.file, JSON.stringify(Object.assign(generateTemplateFile(oldData), generateTemplateFile(data), { name: oldData.name }))))
    .then(() => storage.writeFile(resolved.templateFile, data.html))
    .then(() => storage.writeFile(resolved.templateTextFile, data.text));
};

Template.prototype.getTemplate = function(name, withText){
    if (!withText) withText = false;
    var files = [
      { type: 'html', alive: false, data: null, file: storage.joinPath(this.templateBaseFolder, name, name + ".tpl") },
      { type: 'text', alive: false, data: null, file: storage.joinPath(this.templateBaseFolder, name, name + "_text.tpl") }
    ];
    return Promise.all(files.map(f => storage.exists(f.file).then(result => Promise.resolve(Object.assign(f, { alive: result })))))
      .then(files => Promise.all(files.filter(f => f.alive).map(f => storage.readFile(f.file, { encoding: "utf8" }).then(data => Promise.resolve(Object.assign(f, { data: data.toString() }))))))
      .then(results => {
        return Promise.resolve({
          html: (results.find(f => f.type == 'html') ? results.find(f => f.type == 'html').data : null),
          text: (withText && results.find(f => f.type == 'text') ? results.find(f => f.type == 'text').data : null)
        });
      });
};

Template.prototype.get = function(name) {
  return this.getConfig(name).then(templateConfig => {
    if (!templateConfig) return Promise.reject(templateConfig);
    return this.getTemplate(name, templateConfig.textFallback).then(data => Promise.resolve(Object.assign({ id: name, type: Template.prototype.EMAIL }, templateConfig, data, { folder: name })));
  });
};

Template.prototype.list = function () {
  return this.getTemplateDirList().then(folders => Promise.all(folders.map(f => this.getConfig(f).then(conf => Promise.resolve(Object.assign({folder: f, alive: (conf != null)}, conf)))))).then(folders => Promise.resolve(folders.filter(f => f.alive)));
};

Template.prototype.getTemplateDirList = function () {
  return storage.readdir(this.templateBaseFolder).then(folders => Promise.resolve(folders.filter(folder => folder.indexOf('.') === -1)));
};

Template.prototype.getConfig = function(name) {
    if (!name) return Promise.resolve(null);
    var file = storage.joinPath(this.templateBaseFolder, name, name + '.json');
    return storage.exists(file).then(result => {
      if (!result)
        return Promise.resolve(null);
      else
        return storage.readFile(file).then(data => Promise.resolve(JSON.parse(data)));
    });
};

// Exports module
var t = new Template();
module.exports = t;