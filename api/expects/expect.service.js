const pool = require("../../config/database");

module.exports = {
    //xem chi tiet chuyen gia o home page
    getExpertDetails: (expertId, callback) => {
        const query = `
            SELECT 
                u.user_id, 
                u.username, 
                u.avatar, 
                s.name_skill AS skill_name, 
                c.name_category,
                su.service_id,
                su.price_online, 
                su.price_offline, 
                su.time_online, 
                su.time_offline, 
                AVG(sr.rating) AS average_rating,
                u.experience_years, 
                u.skill_description
            FROM users u
            JOIN skills s ON u.user_id = s.user_id
            JOIN categories c ON s.category_id = c.category_id
            JOIN service_user su ON su.skill_id = s.skill_id
            LEFT JOIN service_reviews sr ON sr.expert_id = u.user_id
            WHERE u.user_id = ?
            GROUP BY u.user_id, su.service_id;
        `;
        pool.query(query, [expertId], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results[0]);
        });
    },

    getExpertLanguagesByExpect: (userId, callback) => {
        const query = `
            SELECT GROUP_CONCAT(l.name_language SEPARATOR ', ') AS languages
            FROM user_languages ul
            JOIN languages l ON ul.language_id = l.language_id
            WHERE ul.user_id = ?
        `;
        pool.query(query, [userId], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results[0]);
        });
    },
    getExperiencesByExpect: (userId, callback) => {
        const query = `
            SELECT e.company, e.position, c.name_category AS category_name, e.start_time, e.end_time, e.job_description
            FROM experiences e
            JOIN categories c ON e.category_id = c.category_id
            WHERE e.user_id = ?
            ORDER BY e.start_time DESC;
        `;
        pool.query(query, [userId], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },
    getSkillsByExpect: (userId, callback) => {
        const query = `
            SELECT u.user_id, u.avatar, su.service_id, s.name_skill AS skill_name, c.name_category, su.price_online, su.price_offline, su.time_online, su.time_offline, AVG(sr.rating) AS average_rating
            FROM skills s
            JOIN service_user su ON su.skill_id = s.skill_id
            JOIN categories c ON s.category_id = c.category_id
            JOIN users u ON u.user_id = s.user_id
            LEFT JOIN service_reviews sr ON sr.expert_id = u.user_id
            WHERE s.user_id = ? AND su.service_general = 0
            GROUP BY su.service_id;
        `;
        pool.query(query, [userId], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },
    getReviewsByExpert: (expertId, callback) => {
        const query = `
            SELECT AVG(r.rating) AS average_rating, COUNT(r.review_id) AS total_review,
            GROUP_CONCAT(JSON_OBJECT('customer_name', u.username, 'customer_avatar', u.avatar, 'rating', r.rating, 'review_description', r.review_description, 'created_at', r.created_at) SEPARATOR ', ') AS evaluate
            FROM service_reviews r
            JOIN users u ON u.user_id = r.user_id
            WHERE r.expert_id = ?
        `;
        pool.query(query, [expertId], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results[0]);
        });
    },
    //danh sach chuyen gia o home_page
    getExperts: (size, page, searchText, categoryId, excludeUserId, callBack) => {
        const offset = (page - 1) * size;
    
        const searchCondition = searchText
            ? `AND (
                e.username LIKE '%${searchText}%' 
                OR s.name_skill LIKE '%${searchText}%'
                OR c.name_category LIKE '%${searchText}%'
                OR su.price_online LIKE '%${searchText}%'
                OR su.price_offline LIKE '%${searchText}%'
                OR su.time_online LIKE '%${searchText}%'
                OR su.time_offline LIKE '%${searchText}%'
                )`
            : '';
    
        const categoryCondition = categoryId ? `AND c.category_id = ${categoryId}` : '';

        const excludeUserCondition = excludeUserId ? `AND e.user_id != ${excludeUserId}` : '';
    
        const query = `
            SELECT e.user_id, e.username, e.avatar, s.name_skill AS skill_name, c.name_category,
                   su.price_online, su.price_offline, su.time_online, su.time_offline,
                   COALESCE(AVG(sr.rating), 0) AS average_rating
            FROM users e
            JOIN service_user su ON e.user_id = su.user_id
            JOIN skills s ON su.skill_id = s.skill_id
            JOIN categories c ON s.category_id = c.category_id
            LEFT JOIN service_reviews sr ON e.user_id = sr.expert_id
            WHERE su.service_general = 1
            ${searchCondition}
            ${categoryCondition}
            ${excludeUserCondition}
            GROUP BY e.user_id, s.name_skill, c.name_category, su.price_online, su.price_offline, su.time_online, su.time_offline
            LIMIT ? OFFSET ?`;
    
        pool.query(query, [size, offset], (error, results) => {
            if (error) {
                return callBack(error);
            }
    
            const totalQuery = `
                SELECT COUNT(*) AS total
                FROM users e
                JOIN service_user su ON e.user_id = su.user_id
                JOIN skills s ON su.skill_id = s.skill_id
                JOIN categories c ON s.category_id = c.category_id
                WHERE su.service_general = 1
                ${searchCondition}
                ${categoryCondition}
                ${excludeUserCondition}`;
    
            pool.query(totalQuery, (error, totalResults) => {
                if (error) {
                    return callBack(error);
                }
                const total = totalResults[0].total;
                return callBack(null, { experts: results, total });
            });
        });
    },  
    //crud thong tin chuyen gia o more_module       
    addExperience: (data, callBack) => {
        pool.query(
            `INSERT INTO experiences (user_id, company, category_id, start_time, end_time, currently_working, job_description, position)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.user_id,
                data.company,
                data.category_id,
                data.start_time,
                data.end_time,
                data.currently_working,
                data.job_description,
                data.position
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    updateExperience: (data, callBack) => {
        pool.query(
            `UPDATE experiences SET company = ?, category_id = ?, start_time = ?, end_time = ?, currently_working = ?, job_description = ? WHERE experience_id = ?`,
            [
                data.company,
                data.category_id,
                data.start_time,
                data.end_time,
                data.currently_working,
                data.job_description,
                data.experience_id
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    deleteExperience: (id, callBack) => {
        pool.query(
            `DELETE FROM experiences WHERE experience_id = ?`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    addCertificate: (data, callBack) => {
        pool.query(
            `INSERT INTO certificates (user_id, name_certificate, certificate_description, link_url, thumbnails) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.user_id,
                data.name_certificate,
                data.certificate_description,
                data.link_url,
                data.thumbnails
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    updateCertificate: (data, callBack) => {
        pool.query(
            `UPDATE certificates SET name_certificate=?, certificate_description=?, link_url=?, thumbnails=? WHERE certificate_id=?`,
            [
                data.name_certificate,
                data.certificate_description,
                data.link_url,
                data.thumbnails,
                data.certificate_id
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    deleteCertificate: (id, callBack) => {
        pool.query(
            `DELETE FROM certificates WHERE certificate_id = ?`,
            [id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    addSkillAndService: (data, callBack) => {
        pool.query(
            `INSERT INTO skills (user_id, category_id, name_skill, experience_year, skill_description)
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.user_id,
                data.category_id,
                data.name_skill,
                data.experience_year,
                data.skill_description
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
    
                const skill_id = results.insertId;
    
                pool.query(
                    `INSERT INTO service_user (skill_id, user_id, time_online, price_online, time_offline, price_offline)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        skill_id,
                        data.user_id,
                        data.time_online,
                        data.price_online,
                        data.time_offline,
                        data.price_offline
                    ],
                    (error, serviceResults) => {
                        if (error) {
                            return callBack(error);
                        }
                        return callBack(null, serviceResults);
                    }
                );
            }
        );
    },
    updateSkill : (data, callBack) => {
        pool.query(
            `UPDATE skills 
             SET category_id = ?, name_skill = ?, experience_year = ?, skill_description = ?
             WHERE skill_id = ? AND user_id = ?`,
            [
                data.category_id,
                data.name_skill,
                data.experience_year,
                data.skill_description,
                data.skill_id,
                data.user_id
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
    
                pool.query(
                    `UPDATE service_user 
                     SET time_online = ?, price_online = ?, time_offline = ?, price_offline = ?
                     WHERE skill_id = ? AND user_id = ?`,
                    [
                        data.time_online,
                        data.price_online,
                        data.time_offline,
                        data.price_offline,
                        data.skill_id,
                        data.user_id
                    ],
                    (error, serviceResults, fields) => {
                        if (error) {
                            return callBack(error);
                        }
                        return callBack(null, serviceResults);
                    }
                );
            }
        );
    }, 
    deleteSkill: (id, callBack) => {
        pool.query(
            `DELETE FROM skills WHERE skill_id = ?`,
            [id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getAllCategories: (callBack) => {
        pool.query(
            `SELECT * FROM categories`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getSkillsByUser: (userId, page, size, callBack) => {
        const offset = (page - 1) * size;
        pool.query(
            `SELECT skills.*, categories.name_category, service_user.time_online, service_user.price_online, 
                service_user.time_offline, service_user.price_offline
            FROM skills 
            JOIN categories ON skills.category_id = categories.category_id
            LEFT JOIN service_user ON skills.skill_id = service_user.skill_id
            WHERE skills.user_id = ? 
            LIMIT ? OFFSET ?`,
            [userId, size, offset],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                pool.query(
                    `SELECT COUNT(*) AS total FROM skills WHERE user_id = ?`,
                    [userId],
                    (error, totalResults) => {
                        if (error) {
                            return callBack(error);
                        }
                        const total = totalResults[0].total;
                        return callBack(null, { data: results, total });
                    }
                );
            }
        );
    },
    
    getExperiencesByUser: (userId, page, size, callBack) => {
        const offset = (page - 1) * size;
        pool.query(
            `SELECT experiences.*, categories.name_category
            FROM experiences 
            JOIN categories ON experiences.category_id = categories.category_id 
            WHERE experiences.user_id = ? 
            LIMIT ? OFFSET ?`,
            [userId, size, offset],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                pool.query(
                    `SELECT COUNT(*) AS total FROM experiences WHERE user_id = ?`,
                    [userId],
                    (error, totalResults) => {
                        if (error) {
                            return callBack(error);
                        }
                        const total = totalResults[0].total;
                        return callBack(null, { data: results, total });
                    }
                );
            }
        );
    },
    
    getCertificatesByUser: (userId, page, size, callBack) => {
        const offset = (page - 1) * size;
        pool.query(
            `SELECT certificates.*
            FROM certificates 
            WHERE certificates.user_id = ? 
            LIMIT ? OFFSET ?`,
            [userId, size, offset],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                pool.query(
                    `SELECT COUNT(*) AS total FROM certificates WHERE user_id = ?`,
                    [userId],
                    (error, totalResults) => {
                        if (error) {
                            return callBack(error);
                        }
                        const total = totalResults[0].total;
                        return callBack(null, { data: results, total });
                    }
                );
            }
        );
    },
    getDetailsExperienceService : (id, callBack) => {
        pool.query(
            `SELECT * FROM experiences WHERE experience_id = ?`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },
    getDetailSkillService : (id, callBack) => {
        pool.query(
            `SELECT * FROM skills WHERE skill_id = ?`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },
    getDetailCertificateService : (id, callBack) => {
        pool.query(
            `SELECT * FROM certificates WHERE certificate_id = ?`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },
};