const pool = require('../../config/database');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

async function sendEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'yugioh4y@gmail.com',
            pass: 'jrom cipd ilko qqeu'
        }
    });

    const mailOptions = {
        from: 'yugioh4y@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    await transporter.sendMail(mailOptions);
}

function saveOtpToDatabase(email, otp, callBack) {
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    pool.query(
        `UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?`,
        [otp, expirationTime, email],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
}

function getOtpFromDatabase(email, callBack) {
    pool.query(
        `SELECT otp, otp_expiry FROM users WHERE email = ?`,
        [email],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results[0]);
        }
    );
}

function userExists(email, callBack) {
    pool.query(
        `SELECT COUNT(*) AS count FROM users WHERE email = ?`,
        [email],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results[0].count > 0);
        }
    );
}

function updateUserPassword(email, newPassword, callBack) {
    pool.query(
        `UPDATE users SET password = ? WHERE email = ?`,
        [newPassword, email],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
}

module.exports = {
    generateOtp,
    sendEmail,
    saveOtpToDatabase,
    getOtpFromDatabase,
    userExists,
    updateUserPassword
};
