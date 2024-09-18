const pool = require("../../config/database");

module.exports = {
    addExperience: (data, callBack) => {
        pool.query(
            `INSERT INTO experiences (user_id, company, field_id, major_id, start_time, end_time, currently_working, job_description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.user_id,
                data.company,
                data.field_id,
                data.major_id,
                data.start_time,
                data.end_time,
                data.currently_working,
                data.job_description
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    updateExperience: (data, callBack) => {
        pool.query(
            `UPDATE experiences SET company=?, field_id=?, major_id=?, start_time=?, end_time=?, currently_working=?, job_description=? WHERE experience_id=?`,
            [
                data.company,
                data.field_id,
                data.major_id,
                data.start_time,
                data.end_time,
                data.currently_working,
                data.job_description,
                data.experience_id
            ],
            (error, results) => {
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
            (error, results) => {
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
    addSkill: (data, callBack) => {
        pool.query(
            `INSERT INTO skills (user_id, major_id, field_id, name_skill, experience_year, skill_description) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.user_id,
                data.major_id,
                data.field_id,
                data.name_skill,
                data.experience_year,
                data.skill_description
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    updateSkill: (data, callBack) => {
        pool.query(
            `UPDATE skills SET major_id=?, field_id=?, name_skill=?, experience_year=?, skill_description=? WHERE skill_id=?`,
            [
                data.major_id,
                data.field_id,
                data.name_skill,
                data.experience_year,
                data.skill_description,
                data.skill_id
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
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
    }
};