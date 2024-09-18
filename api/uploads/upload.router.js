const express = require('express');
const router = express.Router();
const { upload } = require('./upload.service');
const { uploadAvatarController } = require('./upload.controller');

router.post('/upload-avatar', upload.single('avatar'), uploadAvatarController);

module.exports = router;