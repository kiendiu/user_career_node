const { uploadAvatar } = require('./upload.service');

const uploadAvatarController = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.userId;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const avatar = await uploadAvatar(file, userId);
    res.status(200).send({ avatar });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  uploadAvatarController
};
