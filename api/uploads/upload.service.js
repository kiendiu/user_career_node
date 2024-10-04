const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');
const pool = require('../../config/database');

// Firebase Admin SDK configuration
const serviceAccount = require('../../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'user-career-94c07.appspot.com'
});
const bucket = admin.storage().bucket();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToFirebase = async (file) => {
    return new Promise((resolve, reject) => {
      const blob = bucket.file(`avatars/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
  
      blobStream.on('error', (err) => {
        reject(err);
      });
  
      blobStream.on('finish', async () => {
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(publicUrl);
        } catch (err) {
          reject(err);
        }
      });
  
      blobStream.end(file.buffer);
    });
  };

// Upload avatar service function
const uploadAvatar = async (file, userId) => {
  try {
    const publicUrl = await uploadToFirebase(file);
    return new Promise((resolve, reject) => {
      pool.query(
        'UPDATE users SET avatar = ? WHERE user_id = ?',
        [publicUrl, userId],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(publicUrl);
          }
        }
      );
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  upload,
  uploadToFirebase,
  uploadAvatar
};