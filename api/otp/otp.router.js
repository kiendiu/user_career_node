const router = require('express').Router();
const otpController = require('./otp.controller');

router.post('/sendOtp/:email', otpController.sendOtp);
router.post('/verifyOtp', otpController.verifyOtp);
router.post('/updatePassword', otpController.updatePassword);

module.exports = router;
