const path = require('path');
const fs = require('fs');
const promisedHandlebars = require('promised-handlebars');
const handlebars = promisedHandlebars(require('handlebars'));
const surl = require('speakingurl');
const Datastore = require('@google-cloud/datastore');

// Template Tools
const moment = require('moment');
moment.locale('tr');

// Create datastore
const datastore = Datastore({
  projectId: options.datastore.project
});

// Const kind
const kind = 'MARS_Template';

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

// Default Skel
function Template() {}

// Enum Types
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
    textFallback: data.textFallback,
    html: data.html || null,
    text: (data.textFallback ? (data.text || null) : null)
  };
}

/*
  Returns groups
 */
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

/*
  Returns departments
 */
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

/*
  Delete Template
 */
Template.prototype.delete = function (id) {
  id = parseInt(id, 10);
  return datastore.delete(datastore.key([kind, id]));
};

/*
  Create template
 */
Template.prototype.create = function(data) {
  data = generateTemplateFile(data);
  let key = datastore.key([kind]);
  return datastore.save({ key: key, method: 'insert', data: data })
    .then(() => Promise.resolve(Object.assign(data, { id: key.id })))
    .catch(err => Promise.reject(err));
};

/*
  Save template to the store
 */
Template.prototype.save = function(id, data) {
  id = parseInt(id, 10);
  data = generateTemplateFile(data);
  return datastore.save({ key: datastore.key([kind, id]), method: 'update', data: data })
    .then(() => Promise.resolve(Object.assign(data, { id: id })))
    .catch(err => Promise.reject(err));
};

/*
  Return single template by given name
 */
Template.prototype.get = function(id) {
  id = parseInt(id, 10);
  return datastore.get(datastore.key([kind, id]))
    .then(entity => {
      if (!entity[0]) return Promise.reject(new Error('Template ' + id + ' not found'));
      return Promise.resolve(entity[0]);
    })
    .catch(err => Promise.reject(err));
};

/*
  Returns template list
 */
Template.prototype.list = function () {
  const query = datastore.createQuery(kind).limit(300);
  return datastore.runQuery(query)
    .then(entities => Promise.resolve(entities && entities.length > 0 ? entities[0] : []))
    .catch(err => Promise.reject(err));
};

/*
 Render given template
 */
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

// Exports module
var t = new Template();
module.exports = t;