const {
    registerUser,
    getUserByEmail,
    getUserById,
    updateUser,
    //update expects information
    getLanguages,
    updateUserDetails,
    getUserDetails,
    getUserByEmailOrPhone,
    updateApproval,
    approvalExpert
} = require("./user.service");
const { sign } = require("jsonwebtoken");
//const { compareSync, genSaltSync, hashSync } = require("bcrypt");

module.exports = {
    createUser: (req, res) => {
        const body = req.body;

        // Check if email or phone already exists
        getUserByEmailOrPhone(body.email, body.phone, (err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (user) {
                if (user.email === body.email) {
                    return res.status(400).json({
                        success: 0,
                        message: "Email đã tồn tại!"
                    });
                }
                if (user.phone === body.phone) {
                    return res.status(400).json({
                        success: 0,
                        message: "Số điện thoại đã tồn tại!"
                    });
                }
            }

            // const salt = genSaltSync(10);
            // body.password = hashSync(body.password, salt);
            body.operator_status = 1;
            body.balance_wallet = 0;

            registerUser(body, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: 0,
                        message: "Database connection error"
                    });
                }
                return res.status(200).json({
                    success: 1,
                    data: results
                });
            });
        });
    },
    login: (req, res) => {
        const body = req.body;
        getUserByEmail(body.email, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results) {
                return res.status(401).json({
                    success: 0,
                    message: "Nhập sai mật khẩu hoặc email !"
                });
            }
            //const result = compareSync(body.password, results.password);
            if (body.password === results.password) {
                results.password = undefined;
                const accessToken = sign({ result: results }, process.env.JWT_KEY, {
                    expiresIn: "31d"
                });
                const refreshToken = sign({ result: results }, process.env.JWT_REFRESH_KEY, {
                    expiresIn: "31d"
                });
    
                return res.json({
                    success: 1,
                    message: "Login successfully",
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
            } else {
                return res.status(401).json({
                    success: 0,
                    message: "Nhập sai mật khẩu hoặc email !"
                });
            }
        });
    },
    getUserById: (req, res) => {
        const id = req.decoded.result.user_id;
        getUserById(id, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results) {
                return res.status(404).json({
                    success: 0,
                    message: "Record not found"
                });
            }
            results.password = undefined;
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    updateUser: (req, res) => {
        const body = req.body;
        const id = req.decoded.result.user_id;
        if (Object.keys(body).length === 0) {
            return res.status(400).json({
                success: 0,
                message: "No fields to update"
            });
        }

        updateUser(id, body, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results.affectedRows) {
                return res.status(404).json({
                    success: 0,
                    message: "Failed to update user"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "User updated successfully"
            });
        });
    },
    changePassword: (req, res) => {
        const { old_password, new_password, confirm_new_password } = req.body;
        const userId = req.decoded.result.user_id;
    
        if (new_password !== confirm_new_password) {
            return res.status(400).json({
                success: 0,
                message: "New password and confirm password do not match"
            });
        }
    
        getUserById(userId, (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!user) {
                return res.status(404).json({
                    success: 0,
                    message: "User not found"
                });
            }
    
            if (old_password !== user.password) {
                return res.status(400).json({
                    success: 0,
                    message: "Old password is incorrect"
                });
            }
    
            updateUser(userId, { password: new_password }, (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: "Database connection error"
                    });
                }
                return res.status(200).json({
                    success: 1,
                    message: "Password updated successfully"
                });
            });
        });
    }, 
    //update expect's information
    getLanguages: (req, res) => {
        getLanguages((err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },

    updateUserDetails: (req, res) => {
        const userId = req.decoded.result.user_id;
        const { experience_years, skill_description, languages } = req.body;

        updateUserDetails(userId, { experience_years, skill_description, languages }, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "User details updated successfully"
            });
        });
    },
    getUserDetails: (req, res) => {
        const userId = req.decoded.result.user_id;

        getUserDetails(userId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    updateApproval: (req, res) => {
        const { status } = req.params;
        const userId = req.decoded.result.user_id;
    
        const validStatuses = ["user", "pending", "rejected", "accepted"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: 0,
                message: "Invalid approval status"
            });
        }
    
        updateApproval(userId, status, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results.affectedRows) {
                return res.status(404).json({
                    success: 0,
                    message: "User not found"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Approval updated successfully"
            });
        });
    },
    approvalExpert: (req, res) => {
        const { userId } = req.body;
        const { status } = req.body;
        const { reason } = req.body;
    
        const validStatuses = ["user", "pending", "rejected", "accepted"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: 0,
                message: "Invalid approval status"
            });
        }
    
        approvalExpert(userId, status, reason, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results.affectedRows) {
                return res.status(404).json({
                    success: 0,
                    message: "User not found"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Approval updated successfully"
            });
        });
    },
};