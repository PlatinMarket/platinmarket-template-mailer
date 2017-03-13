'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();
  const multer = require('multer');
  const storage = require('../lib/storage');

  // File Explorer
  router.get('/explorer*', function (req, res) {
    res.render('file_explorer', { user: req.user });
  });

  // Get files
  router.post('/files', function (req, res) {
    storage.readdir(req.body.path)
      .then(files => res.json(files))
      .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
  });

  // Get file thumbnail
  router.post('/files/link', function (req, res) {
    return storage.publicUrl(req.body.path)
      .then((url) => res.json({ url }))
      .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
  });

  // Delete file / folder
  router.post('/files/delete', function (req, res) {
    storage.rmdir(req.body.path)
      .then(a => res.json(a))
      .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
  });

  // Create folder
  router.post('/files/create_folder', function (req, res) {
    storage.mkdir(req.body.path).then(d => res.json(d)).catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
  });

  // File upload
  var upload = multer({ dest: 'uploads/' });
  router.post('/files/upload', upload.array('files[]'), function (req, res) {
    Promise.all(req.files.map(f => files.uploadFile({ path: req.body.path + '/' + f.originalname, contents: fs.readFileSync(f.path)}))).then(r => {
      if (req.files && req.files instanceof Array) req.files.forEach(f => fs.unlinkSync(f.path));
      res.json(r);
    }).catch(err => {
      if (req.files && req.files instanceof Array) req.files.forEach(f => fs.unlinkSync(f.path));
      res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" });
    });
  });

  return router;
})();