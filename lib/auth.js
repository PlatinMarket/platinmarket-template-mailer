const request = require('request');
const parseXml = require('xml2js').parseString;
const encoding = require("encoding");

module.exports = function (email, password) {
    return new Promise((resolve, reject) => {
        settings.read('default')
          .then(settings => {
            if (!settings) return Promise.reject(new Error('Missing settings'));
            var payload = new Buffer(email + settings.auth_secret.toString() + password).toString('base64');
            var url = settings.auth_url.toString().replace('#payload#', payload);
            return Promise.resolve(url);
          })
          .then(url => {
            request(url, { encoding: null }, (err, response, body) => {
              if (err || (response && response.statusCode != 200)) return reject(err);
              parseXml(encoding.convert(body, 'UTF-8', 'ISO-8859-9'), function (err, result) {
                if (err) return reject(err);
                try {
                  var params = result.PlatinBOX.ReformAdminAuth[0];
                  var status = params.Status[0];
                  if (status == 'Fail') return reject(new Error('E-Posta ve(ya) şifre hatalı'));
                  resolve({
                    'name': params['Name'][0],
                    'email': params['Email'][0],
                    'department': params['Departman'][0]
                  });
                } catch (err) {
                  reject(err);
                }
              });
            });
          }).catch(err => reject(err));
    });
};