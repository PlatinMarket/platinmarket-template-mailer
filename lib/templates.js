const promisedHandlebars = require('promised-handlebars');
const handlebarPlugins = require('./handlebar_plugins');
const handlebars = handlebarPlugins(promisedHandlebars(require('handlebars')));
const Datastore = require('@google-cloud/datastore');

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

function toDatastore(template) {
  return Object.keys(template).map(k => ({ name: k, value: template[k], excludeFromIndexes: ['html', 'text'].indexOf(k) > -1 }));
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
  return this.list(['group']).then(groups => Promise.resolve(groups.map(d => d.group).filter((d,i,l) => l.indexOf(d) == i)));
};

/*
  Returns departments
 */
Template.prototype.departments = function() {
  return this.list(['department']).then(departments => Promise.resolve(departments.map(d => d.department).filter((d,i,l) => l.indexOf(d) == i)));
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
  return datastore.save({ key: key, method: 'insert', data: toDatastore(data) })
    .then(() => Promise.resolve(Object.assign(data, { id: key.id })))
    .catch(err => Promise.reject(err));
};

/*
  Save template to the store
 */
Template.prototype.save = function(id, data) {
  id = parseInt(id, 10);
  data = generateTemplateFile(data);
  return datastore.save({ key: datastore.key([kind, id]), method: 'update', data: toDatastore(data) })
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
Template.prototype.list = function (select, filters) {
  let query = datastore.createQuery(kind);
  if (filters) filters.forEach(f => query = query.filter.apply(query, f));
  if (select) query = query.select(select);
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