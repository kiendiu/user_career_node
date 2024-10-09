const pool = require("../../config/database");
const { client } = require('../../config/elasticsearch');

module.exports = {
    getTop10Experts: (callBack) => {
        pool.query(
            `SELECT u.user_id, u.username, AVG(r.rating) AS average_rating, f.name_field, su.price
             FROM users u
             LEFT JOIN service_user su ON u.user_id = su.user_id
             LEFT JOIN services s ON su.service_id = s.service_id
             LEFT JOIN requests r ON r.expert_id = u.user_id
             LEFT JOIN fields f ON f.field_id = s.field_id
             WHERE u.role = 'expert'
             GROUP BY u.user_id
             ORDER BY average_rating DESC
             LIMIT 10`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getExpertDetailsById: (expertId, callBack) => {
        pool.query(
            `SELECT 
    u.user_id,
    u.full_name AS specialist_name,
    c.name_category AS field,
    AVG(r.rating) AS rating,
    su.price_online,
    su.price_offline,
    GROUP_CONCAT(DISTINCT l.name_language ORDER BY l.name_language SEPARATOR ', ') AS languages,
    u.experience_years,
    e.position,
    e.company,
    CONCAT('[', GROUP_CONCAT(
        DISTINCT JSON_OBJECT(
            'skill_id', s.skill_id,
            'name_skill', s.name_skill,
            'experience_year', s.experience_year,
            'skill_description', s.skill_description,
            'price_online', su.price_online,
            'price_offline', su.price_offline
        ) 
        ORDER BY s.skill_id
    ), ']') AS skills
FROM 
    users u
LEFT JOIN 
    user_languages ul ON ul.user_id = u.user_id
LEFT JOIN 
    languages l ON ul.language_id = l.language_id
LEFT JOIN 
    service_user su ON su.user_id = u.user_id
LEFT JOIN 
    experiences e ON e.user_id = u.user_id AND e.currently_working = 1
LEFT JOIN 
    skills s ON s.user_id = u.user_id AND s.skill_id IS NOT NULL
LEFT JOIN 
    categories c ON e.category_id = c.category_id
LEFT JOIN 
    request_review r ON r.user_id = u.user_id
WHERE 
    u.user_id = ?
GROUP BY 
    u.user_id
LIMIT 
    0, 25;`,
            [expertId],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
            
                if (results.length > 0) {
                    const expertDetails = results[0];
                    expertDetails.skills = JSON.parse(expertDetails.skills);
                    return callBack(null, expertDetails);
                } else {
                    return callBack(null, null);
                }
            }
        );
    },
    getAppointmentsWithCustomers: (userId, callBack) => {
        pool.query(
            `SELECT a.*, u.username as customer_name
             FROM appointments a
             JOIN users u ON a.customer_id = u.user_id
             WHERE a.expert_id = ?`,
            [userId],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getAppointmentsWithExperts: (userId, callBack) => {
        pool.query(
            `SELECT a.*, u.username as expert_name
             FROM appointments a
             JOIN users u ON a.expert_id = u.user_id
             WHERE a.customer_id = ?`,
            [userId],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    searchExperts: (data, callBack) => {
        const { query, fieldId, size, page } = data;

        let searchQuery = {
            index: 'experts',
            body: {
                from: (page - 1) * size,
                size: size,
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query: query,
                                    fields: ['username', 'skill_description']
                                }
                            }
                        ],
                        filter: []
                    }
                }
            }
        };

        if (fieldId) {
            searchQuery.body.query.bool.filter.push({
                term: { "field_id": fieldId }
            });
        }

        client.search(searchQuery, (error, result) => {
            if (error) {
                return callBack(error);
            }
            const experts = result.hits.hits.map(hit => hit._source);
            return callBack(null, {
                data: experts,
                metadata: {
                    size,
                    page,
                    total_page: Math.ceil(result.hits.total.value / size),
                    total: result.hits.total.value
                }
            });
        });
    },
    createUser: (data, callBack) => {
        pool.query(
            `INSERT INTO users (username, email, password, role, operator_status, balance_wallet) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.username,
                data.email,
                data.password,
                data.role,
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