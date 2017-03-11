'use strict';

// Routes
module.exports = (function() {
  const router = require('express').Router();
  const multer = require('multer');
  const mime = require('mime');

  // File Explorer
  router.get('/explorer*', function (req, res) {
    res.render('file_explorer', { user: req.user });
  });

  // Get files
  router.post('/files', function (req, res) {
    storage.readdir
    return res.json([]);
    files.getFiles(req.body)
      .then(files => res.json(files))
      .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
  });

  // Get file thumbnail
  router.post('/files/thumbnail', function (req, res) {
    return res.sendStatus(404);
    if (mime.lookup(req.body.path).indexOf('image') !== 0) return res.sendStatus(404);

    files.getThumbnail(req.body)
      .then(files => res.json(files))
      .catch(err => {
        res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" });
      });
  });

  // Delete file / folder
  router.post('/files/delete', function (req, res) {
    return res.sendStatus(404);
    files.deleteFile(req.body)
      .then(r => res.json(r))
      .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
  });

  // Create folder
  router.post('/files/create_folder', function (req, res) {
    return res.sendStatus(404);
    files.createFolder(req.body)
      .then(r => res.json(r))
      .catch(err => res.status(500).json({message: err.error || err.message || "Bilinmeyen bir hata", success: "error" }));
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