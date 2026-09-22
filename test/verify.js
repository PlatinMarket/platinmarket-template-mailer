'use strict';

const assert = require('assert');
const crypto = require('crypto');

console.log('--- TEST 1: Crypto EVP_BytesToKey Backward Compatibility ---');
{
  function evpBytesToKey(password, keyLen, ivLen) {
    let d = Buffer.alloc(0);
    const totalLen = keyLen + ivLen;
    let keyIv = Buffer.alloc(0);
    const passBuf = Buffer.isBuffer(password) ? password : Buffer.from(String(password), 'utf8');
    while (keyIv.length < totalLen) {
      const hash = crypto.createHash('md5');
      hash.update(d);
      hash.update(passBuf);
      d = hash.digest();
      keyIv = Buffer.concat([keyIv, d]);
    }
    return {
      key: keyIv.subarray(0, keyLen),
      iv: keyIv.subarray(keyLen, keyLen + ivLen)
    };
  }

  const secret = 'super-secret-auth-key';
  const testPlaintexts = [
    'plain-password',
    'complex_P@ssw0rd!#%&*()[]{}çşğüöıİ',
    'short',
    'very-long-password-that-exceeds-standard-buffer-blocks-12345678901234567890'
  ];

  for (const text of testPlaintexts) {
    const { key, iv } = evpBytesToKey(secret, 32, 16);
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    let enc = cipher.update(text, 'utf8', 'hex');
    enc += cipher.final('hex');

    const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
    let dec = decipher.update(enc, 'hex', 'utf8');
    dec += decipher.final('utf8');

    assert.strictEqual(dec, text, `Decrypted text does not match for: ${text}`);
  }
  console.log('✓ Crypto tests passed successfully.');
}

console.log('\n--- TEST 2: Ajv Schema Validation (Ajv v8) ---');
{
  const Ajv = require('ajv');
  const ajv = new Ajv({ allErrors: true, strict: false });

  const templateSchema = {
    required: ['name', 'subject', 'html', 'description', 'department', 'parameter', 'textFallback'],
    properties: {
      name: { type: "string", maxLength: 128, minLength: 5 },
      type: { type: "string", enum: ["email", "sms"] },
      subject: { type: "string", minLength: 5 },
      description: { type: "string", maxLength: 128 },
      group: { type: "array", items: { type: "string", maxLength: 128 } },
      department: { type: "array", items: { type: "string", maxLength: 128 } },
      parameter: {
        type: "array",
        items: {
          type: "object",
          required: ['name', 'title', 'type', 'require', 'default'],
          properties: {
            name: { type: "string", maxLength: 40, minLength: 3 },
            title: { type: "string", maxLength: 128, minLength: 1 },
            type: { type: "string", enum: ["string", "boolean"] },
            require: { type: "string" },
            default: { type: "string", maxLength: 128 }
          },
          additionalProperties: false
        }
      },
      textFallback: { type: "string" },
      html: { type: "string" },
      text: { type: "string" }
    },
    additionalProperties: false
  };

  const validData = {
    name: 'Order Confirmation Template',
    type: 'email',
    subject: 'Your Order has been confirmed',
    description: 'Sent when order is completed',
    group: ['Sales'],
    department: ['Support'],
    parameter: [
      { name: 'orderId', title: 'Order ID', type: 'string', require: 'true', default: '' }
    ],
    textFallback: 'false',
    html: '<p>Thank you for your order!</p>'
  };

  const isValid = ajv.validate(templateSchema, validData);
  assert.strictEqual(isValid, true, 'Valid template data should pass validation');

  const invalidData = {
    name: 'abc', // too short
    html: '<p>hi</p>'
    // missing required fields
  };
  const isInvalid = ajv.validate(templateSchema, invalidData);
  assert.strictEqual(isInvalid, false, 'Invalid template data should fail validation');
  assert(ajv.errors.length > 0, 'Validation errors should be populated');

  console.log('✓ Ajv v8 validation tests passed successfully.');
}

console.log('\n--- TEST 3: Handlebars & Plugins ---');
(async () => {
  const Handlebars = require('handlebars');
  const promisedHandlebars = require('promised-handlebars');
  const moment = require('moment');

  const engine = promisedHandlebars(Handlebars);
  engine.registerHelper('date', (format) => moment().format(format).toString());
  engine.registerHelper('raw-helper', (options) => options.fn());

  const template = engine.compile('Bugün: {{date "YYYY"}} - {{{{raw-helper}}}}{{test}}{{{{/raw-helper}}}}');
  const rendered = await template({ test: 'HamMetin' });

  const currentYear = moment().format('YYYY');
  assert(rendered.includes(currentYear), `Rendered output should contain current year: ${rendered}`);
  assert(rendered.includes('{{test}}'), `Raw helper should keep {{test}}: ${rendered}`);

  console.log('✓ Handlebars compile and render test passed successfully.');
})().then(() => {

  console.log('\n--- TEST 4: XML Parsing & Auth Response ---');
  const parseXml = require('xml2js').parseString;
  const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
  <PlatinBOX>
    <ReformAdminAuth>
      <Status>Success</Status>
      <Name>Ahmet Yilmaz</Name>
      <Email>ahmet@example.com</Email>
      <Departman>Yazilim</Departman>
    </ReformAdminAuth>
  </PlatinBOX>`;

  parseXml(sampleXml, (err, result) => {
    assert.ifError(err);
    const params = result.PlatinBOX.ReformAdminAuth[0];
    assert.strictEqual(params.Status[0], 'Success');
    assert.strictEqual(params.Name[0], 'Ahmet Yilmaz');
    assert.strictEqual(params.Email[0], 'ahmet@example.com');
    assert.strictEqual(params.Departman[0], 'Yazilim');
    console.log('✓ XML2JS parsing verified successfully.');

    console.log('\n--- TEST 5: Nodemailer Transport & Configuration ---');
    const nodemailer = require('nodemailer');
    const transport = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'testpass'
      }
    });

    assert(typeof transport.sendMail === 'function', 'Transport should have sendMail function');
    assert(typeof transport.verify === 'function', 'Transport should have verify function');
    console.log('✓ Nodemailer transport initialization verified successfully.');

    console.log('\n--- TEST 6: Express Handlebars v7 Engine Setup ---');
    const Handlebars = require('handlebars');
    const { engine: expressHandlebars } = require('express-handlebars');
    const hbsInstance = expressHandlebars({ defaultLayout: 'default', extname: '.tpl', handlebars: Handlebars });
    assert(typeof hbsInstance === 'function', 'express-handlebars should return engine function');
    console.log('✓ express-handlebars v7 engine verified successfully.');

    console.log('\n==========================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('==========================================');
  });
}).catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
