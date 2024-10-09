const pool = require("../../config/database");

module.exports = {
    addServiceGeneral: (user_id, time_online, price_online, time_offline, price_offline, callback) => {
        pool.query(
            `INSERT INTO service_user (user_id, time_online, price_online, time_offline, price_offline, service_general) VALUES (?, ?, ?, ?, ?, 1)`,
            [user_id, time_online, price_online, time_offline, price_offline],
            (error, results) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, results);
            }
        );
    },
    getServiceGeneral: (user_id, callback) => {
        pool.query(
            `SELECT su.service_id, su.time_online, su.price_online, su.time_offline, su.price_offline,sf.service_frame_id, sf.week_day, sf.start_time, sf.end_time
           FROM service_user su
           LEFT JOIN service_frame sf ON su.user_id = sf.user_id
           WHERE su.user_id = ? AND su.service_general = 1`,
            [user_id],
            (error, results) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, results);
            }
        );
    },
    updateServiceGeneral: (service_id, time_online, price_online, time_offline, price_offline, callback) => {
        pool.query(
            `UPDATE service_user SET time_online = ?, price_online = ?, time_offline = ?, price_offline = ? WHERE service_id = ?`,
            [time_online, price_online, time_offline, price_offline, service_id],
            (error, results) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, results);
            }
        );
    },
    addServiceFrame: (user_id, week_day, start_time, end_time, callback) => {
        pool.query(
            `INSERT INTO service_frame (user_id, week_day, start_time, end_time) VALUES (?, ?, ?, ?)`,
            [user_id, week_day, start_time, end_time],
            (error, results) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, results);
            }
        );
    },
    updateServiceFrame : (service_frame_id, week_day, start_time, end_time, callback) => {
        pool.query(
            `UPDATE service_frame SET week_day = ?, start_time = ?, end_time = ? WHERE service_frame_id = ?`,
            [week_day, start_time, end_time, service_frame_id],
            (error, results) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, results);
            }
        );
    },
    deleteServiceFrame : (service_frame_id, callback) => {
        pool.query(
            `DELETE FROM service_frame WHERE service_frame_id = ?`,
            [service_frame_id],
            (error, results) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, results);
            }
        );
    },
    getFramesByUserId(user_id, callback) {
        const query = "SELECT * FROM service_frame WHERE user_id = ?";
    
        pool.query(query, [user_id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    }

};