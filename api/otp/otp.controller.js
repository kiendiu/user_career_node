const otpService = require('./otp.service');

exports.sendOtp = (req, res) => {
    const email = req.params.email;

    otpService.userExists(email, (error, exists) => {
        if (error) return res.status(500).json({ success: 0, message: 'Database error' });

        if (!exists) {
            return res.status(400).json({
                success: 0,
                message: 'User does not exist'
            });
        }

        const otp = otpService.generateOtp();
        otpService.saveOtpToDatabase(email, otp, (error) => {
            if (error) return res.status(500).json({ success: 0, message: 'Database error' });

            otpService.sendEmail(email, otp)
                .then(() => res.status(200).json({ success: 1, message: 'OTP sent to email' }))
                .catch(() => res.status(500).json({ success: 0, message: 'Failed to send email' }));
        });
    });
};

exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    otpService.getOtpFromDatabase(email, (error, result) => {
        if (error) return res.status(500).json({ success: 0, message: 'Database error' });

        if (!result || result.otp !== otp) {
            return res.status(400).json({ success: 0, message: 'Invalid OTP' });
        }

        const currentTime = new Date();
        if (currentTime > new Date(result.otp_expiry)) {
            return res.status(400).json({ success: 0, message: 'OTP has expired' });
        }

        return res.status(200).json({ success: 1, message: 'OTP verified successfully' });
    });
};

exports.updatePassword = (req, res) => {
    const { email, newPassword } = req.body;

    otpService.userExists(email, (error, exists) => {
        if (error) return res.status(500).json({ success: 0, message: 'Database error' });

        if (!exists) {
            return res.status(400).json({
                success: 0,
                message: 'User does not exist'
            });
        }

        otpService.updateUserPassword(email, newPassword, (error) => {
            if (error) return res.status(500).json({ success: 0, message: 'Failed to update password' });

            return res.status(200).json({
                success: 1,
                message: 'Password updated successfully'
            });
        });
    });
};
