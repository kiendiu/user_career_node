const {
    createUser,
    getUserByEmail,
    getUserById,
    updateUser,
    //update expects information
    getLanguages,
    updateUserDetails,
    getUserDetails,
    getTop10Experts,
    getExpertDetailsById,
    searchExperts,
    getAppointmentsWithCustomers,
    getAppointmentsWithExperts
} = require("./user.service");
const { sign } = require("jsonwebtoken");
//const { compareSync, genSaltSync, hashSync } = require("bcrypt");

module.exports = {
    getTop10Experts: (req, res) => {
        getTop10Experts((err, results) => {
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
    getAppointmentsWithCustomers: (req, res) => {
        const userId = req.decoded.result.user_id;

        getAppointmentsWithCustomers(userId, (err, results) => {
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
    getAppointmentsWithExperts: (req, res) => {
        const userId = req.decoded.result.user_id;

        getAppointmentsWithExperts(userId, (err, results) => {
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
    searchExperts: (req, res) => {
        const { query, fieldId, size = 20, page = 1 } = req.body;

        searchExperts({ query, fieldId, size, page }, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Search error"
                });
            }
            return res.status(200).json({
                success: 1,
                ...results
            });
        });
    },
    getExpertDetailsById: (req, res) => {
        const expertId = req.params.id;

        getExpertDetailsById(expertId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (results) {
                return res.status(200).json({
                    success: 1,
                    data: results
                });
            } else {
                return res.status(404).json({
                    success: 0,
                    message: "Expert not found"
                });
            }
        });
    },
    createUser: (req, res) => {
        const body = req.body;
        // const salt = genSaltSync(10);
        // body.password = hashSync(body.password, salt);
        body.role = 'user';
        body.operator_status = 1;
        body.balance_wallet = 0;
        
        createUser(body, (err, results) => {
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
                    data: "Invalid email or password"
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
                    data: "Invalid email or password"
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
    
            const isPasswordValid = compareSync(old_password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: 0,
                    message: "Old password is incorrect"
                });
            }
    
            const salt = genSaltSync(10);
            const hashedPassword = hashSync(new_password, salt);
    
            updateUser(userId, { password: hashedPassword }, (err, results) => {
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
    }
};