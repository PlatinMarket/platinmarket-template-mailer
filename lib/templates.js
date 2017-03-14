const promisedHandlebars = require('promised-handlebars');
const handlebarPlugins = require('./handlebar_plugins');
const handlebars = handlebarPlugins(promisedHandlebars(require('handlebars')));
const Datastore = require('@google-cloud/datastore');


// Template Tools
const moment = require('moment');
moment.locale('tr');

// Create datastore
const datastore = Datastore({
  projectId: process.env.PROJECT_ID,
  namespace: process.env.DATASTORE_NAMESPACE || 'Mars'
});

// Const kind
const kind = 'Template';

// Set Id from datastore entity
function setId(entity){
  entity['id'] = entity[datastore.KEY].id;
  return entity;
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
      entity[0] = setId(entity[0]);
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
    .then((entities) => {
      entities = entities && entities.length > 0 ? entities[0] : [];
      entities.forEach(e => e = setId(e));
      return Promise.resolve(entities)
    })
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
        templateParams = Object.assign(templateParams, extendData, { attachments: [], forPreview });
        var subject, html, text;
        handlebars.compile(template.subject || "")(templateParams)
          .then(_subject => {
            subject = _subject;
            return handlebars.compile(template.html || "")(templateParams);
          })
          .then(_html => {
            html = _html;
            return handlebars.compile(template.text || "")(templateParams);
          })
          .then(_text => {
            text = template.textFallback ? _text : false;
            resolve({ subject, html, text, attachments: templateParams.attachments, id: template.id });
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