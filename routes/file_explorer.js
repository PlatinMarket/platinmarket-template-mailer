'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();
  const Multer = require('multer');

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
  var multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
      fileSize: parseInt((process.env.MAX_UPLOAD || 10), 10) * 1024 * 1024 // 10 MB for standart
    }
  });
  router.post('/files/upload', multer.array('files[]'), function (req, res) {
    return storage.directUpload(req, req.body.path)
      .then(files => Promise.all(files.map(f => storage.makePublic(f.name))).then(() => res.json(files)))
      .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
  });

  return router;
})();