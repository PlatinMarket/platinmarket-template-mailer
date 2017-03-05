var request = require('request');
var parseXml = require('xml2js').parseString;
var encoding = require("encoding");

module.exports = function (email, password) {
    return new Promise((resolve, reject) => {
        var payload = new Buffer(email + options.auth.secret.toString() + password).toString('base64');
        var url = options.auth.endpoint.toString().replace('#payload#', payload);
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
    });
};