const pool = require("../../config/database");

module.exports = {
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