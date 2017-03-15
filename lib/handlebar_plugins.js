const path = require('path');

// Template Tools
const surl = require('speakingurl');
const moment = require('moment');
moment.locale('tr');

module.exports = function (handlebars) {

  // Attach files
  handlebars.registerHelper('attach', (_path, f) => {
    if (f.data.root.forPreview) return storage.publicUrl(_path);
    const filename = path.basename(_path);
    const cid = surl(filename, { separator: '_', lang: 'tr' });
    if (!f.data.root.attachments.find(a => a.path == _path)) f.data.root.attachments.push({ cid, path: _path, filename });
    return Promise.resolve("cid:" + cid);
  });

  // File address
  handlebars.registerHelper('link', (path) => storage.publicUrl(path));

  // Moment date format
  handlebars.registerHelper('date', (format) => moment().format(format).toString());

  // Embed file content
  handlebars.registerHelper('embed', (_path) => storage.readFile(_path));

  // Render file content
  handlebars.registerHelper('render', (_path, f) => storage.readFile(_path).then(data => handlebars.compile(data)(f.data.root)));

  // User parameters
  handlebars.registerHelper('user_variable', (name, f) => {
    const email = f.data.root.user.email;
    if (!email) return null;
    const vars = f.data.root.variables ? Promise.resolve(f.data.root.variables) : settings.getVariables(f.data.root.user.email);
    return vars.then(_vars => Promise.resolve(_vars.find(_v => _v.name == name))).then(_var => Promise.resolve(_var ? _var.value : null));
  });

  return handlebars;
};