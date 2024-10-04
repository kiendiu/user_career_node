const express = require('express');
const router = express.Router();
const { upload } = require('./upload.service');
const { uploadAvatarController, uploadCertificateController } = require('./upload.controller');

router.post('/upload-avatar', upload.single('avatar'), uploadAvatarController);
router.post('/upload-certificate', upload.single('avatar'), uploadCertificateController);

module.exports = router;