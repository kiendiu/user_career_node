const pool = require("../../config/database");

module.exports = {
    getUserByEmailOrPhone: (email, phone, callback) => {
        pool.query(
            `SELECT * FROM users WHERE email = ? OR phone = ?`,
            [email, phone],
            (error, results) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, results[0]);
            }
        );
    },
    createUser: (data, callBack) => {
        pool.query(
            `INSERT INTO users (username, phone, email, password, operator_status, balance_wallet) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.username,
                data.phone,
                data.email,
                data.password,
                data.operator_status,
                data.balance_wallet
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    
    //sử dụng để lấy thông tin để kiểm tratrong hàm login.
    getUserByEmail: (email, callBack) => {
        pool.query(
            `SELECT * FROM users WHERE email = ?`,
            [email],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },
    getUserById: (id, callBack) => {
        pool.query(
            `SELECT u.* FROM users u WHERE user_id = ?`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },
    updateUser: (id, data, callBack) => {
        let fields = [];
        let values = [];

        for (let key in data) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }

        values.push(id);

        const query = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;

        pool.query(query, values, (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        });
    },
    //update expect's information
    getLanguages: (callBack) => {
        pool.query(
            `SELECT * FROM languages`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    updateUserDetails: (id, data, callBack) => {
        pool.query(
            `UPDATE users SET experience_years = ?, skill_description = ? WHERE user_id = ?`,
            [
                data.experience_years,
                data.skill_description,
                id
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }

                const newLanguages = data.languages;
                pool.query(
                    `SELECT language_id FROM user_languages WHERE user_id = ?`,
                    [id],
                    (error, results) => {
                        if (error) {
                            return callBack(error);
                        }

                        const existingLanguages = results.map(row => row.language_id);
                        const languagesToAdd = newLanguages.filter(lang => !existingLanguages.includes(lang));
                        const languagesToDelete = existingLanguages.filter(lang => !newLanguages.includes(lang));

                        if (languagesToAdd.length > 0) {
                            const values = languagesToAdd.map(language => [id, language]);
                            pool.query(
                                `INSERT INTO user_languages (user_id, language_id) VALUES ?`,
                                [values],
                                (error, results) => {
                                    if (error) {
                                        return callBack(error);
                                    }
                                }
                            );
                        }
                        if (languagesToDelete.length > 0) {
                            pool.query(
                                `DELETE FROM user_languages WHERE user_id = ? AND language_id IN (?)`,
                                [id, languagesToDelete],
                                (error, results) => {
                                    if (error) {
                                        return callBack(error);
                                    }
                                }
                            );
                        }

                        return callBack(null, results);
                    }
                );
            }
        );
    },
    getUserDetails: (userId, callBack) => {
        pool.query(
            `SELECT u.user_id, u.experience_years, u.skill_description,
                GROUP_CONCAT(JSON_OBJECT('language_id', l.language_id, 'name_language', l.name_language)) AS languages
            FROM users u
            LEFT JOIN user_languages ul ON u.user_id = ul.user_id
            LEFT JOIN languages l ON ul.language_id = l.language_id
            WHERE u.user_id = ?
            GROUP BY u.user_id`,
            [userId],
            (error, results) => {
                if (error) {
                    console.error("Database query error:", error);
                    return callBack(error);
                }
    
                if (results.length > 0) {
                    if (results[0].languages) {
                        let languages = JSON.parse(`[${results[0].languages}]`);
                        if (languages.length === 1 && languages[0].language_id === null && languages[0].name_language === null) {
                            results[0].languages = [];
                        } else {
                            results[0].languages = languages;
                        }
                    } else {
                        results[0].languages = [];
                    }
                    return callBack(null, results[0]);
                } else {
                    return callBack(null, {
                        success: 0,
                        message: "User not found"
                    });
                }
            }
        );
    }
};