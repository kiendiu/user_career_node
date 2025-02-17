const pool = require("../../config/database");

module.exports = {
    getBookedServices: (params, callback) => {
        const { type, status, start_date, end_date, page, size, userId } = params;

        let query = `
            SELECT bs.*, 
                u.username AS user_name, 
                e.username AS expert_name, 
                IF(ps.payment_id IS NOT NULL, TRUE, FALSE) AS is_paid,
                COALESCE(
                    (SELECT s.name_skill FROM skills s
                    JOIN service_user su ON su.skill_id = s.skill_id
                    WHERE su.service_id = bs.service_id),
                    (SELECT ur.title FROM user_requests ur
                    WHERE ur.request_id = bs.request_id)
                ) AS service_name,
                IF(rr.review_id IS NOT NULL OR sr.review_id IS NOT NULL, TRUE, FALSE) AS is_reviewed,
                CASE 
                WHEN rr.review_id IS NOT NULL THEN 
                    JSON_OBJECT(
                        'rating', rr.rating, 
                        'comment', rr.review_description
                    )
                WHEN sr.review_id IS NOT NULL THEN 
                    JSON_OBJECT(
                        'rating', sr.rating, 
                        'comment', sr.review_description
                    )
                ELSE 
                    NULL
            END AS review
            FROM book_services bs
            JOIN users u ON bs.user_id = u.user_id
            JOIN users e ON bs.expert_id = e.user_id
            LEFT JOIN payment_service ps ON bs.book_id = ps.book_id
            LEFT JOIN request_review rr ON rr.request_id = bs.request_id AND rr.book_id = bs.book_id
            LEFT JOIN service_reviews sr ON sr.book_id = bs.book_id AND sr.book_id = bs.book_id
            WHERE 1=1
        `;

        if (type === "expert") {
            query += ` AND bs.expert_id = ?`;
        } else if (type === "user") {
            query += ` AND bs.user_id = ?`;
        } else if (type === "all") {
            query += ` AND (bs.expert_id = ? OR bs.user_id = ?)`;
        }

        if (status) {
            query += ` AND bs.status = ?`;
        }

        if (start_date && end_date) {
            query += ` AND bs.schedule_time BETWEEN ? AND ?`;
        }

        query += ` ORDER BY bs.schedule_time DESC LIMIT ? OFFSET ?`;

        const queryParams = [];
        if (type === "all") {
            queryParams.push(userId, userId);
        } else {
            queryParams.push(userId);
        }

        if (status) {
            queryParams.push(status);
        }

        if (start_date && end_date) {
            queryParams.push(start_date, end_date);
        }

        queryParams.push(size, (page - 1) * size);

        pool.query(query, queryParams, (error, results, fields) => {
            if (error) {
                return callback(error);
            }

            // Adjust total query to match the main query conditions for correct totals
            let totalQuery = `
            SELECT COUNT(*) AS total,
                SUM(CASE WHEN bs.status = 'pending' THEN 1 ELSE 0 END) AS total_pending,
                SUM(CASE WHEN bs.status = 'confirmed' THEN 1 ELSE 0 END) AS total_confirmed,
                SUM(CASE WHEN bs.status = 'in_progress' THEN 1 ELSE 0 END) AS total_in_progress,
                SUM(CASE WHEN bs.status = 'completed' THEN 1 ELSE 0 END) AS total_completed
            FROM book_services bs
            WHERE 1=1
        `;

            const totalQueryParams = [];

            if (type === "expert") {
                totalQuery += ` AND bs.expert_id = ?`;
                totalQueryParams.push(userId);
            } else if (type === "user") {
                totalQuery += ` AND bs.user_id = ?`;
                totalQueryParams.push(userId);
            } else if (type === "all") {
                totalQuery += ` AND (bs.expert_id = ? OR bs.user_id = ?)`;
                totalQueryParams.push(userId, userId);
            }

            if (status) {
                totalQuery += ` AND bs.status = ?`;
                totalQueryParams.push(status);
            }

            if (start_date && end_date) {
                totalQuery += ` AND bs.schedule_time BETWEEN ? AND ?`;
                totalQueryParams.push(start_date, end_date);
            }

            pool.query(totalQuery, totalQueryParams, (totalError, totalResults) => {
                if (totalError) {
                    return callback(totalError);
                }

                const metadata = {
                    total: totalResults[0].total,
                    total_pending: totalResults[0].total_pending,
                    total_confirmed: totalResults[0].total_confirmed,
                    total_in_progress: totalResults[0].total_in_progress,
                    total_completed: totalResults[0].total_completed,
                    page,
                    size,
                    total_page: Math.ceil(totalResults[0].total / size),
                };

                const formattedResults = results.map(result => {
                    if (result.is_reviewed && result.review) {
                        try {
                            const parsedReview = JSON.parse(result.review);
                            result.review = {
                                rating: parsedReview.rating || null,
                                comment: parsedReview.comment || null
                            };
                        } catch (error) {
                            result.review = null;
                        }
                    } else {
                        result.review = null;
                    }
                    return result;
                });

                return callback(null, { data: formattedResults, metadata });
            });
        });
    },
    getConsultationSchedule: (params, callback) => {
        const { userId, type, start_date, end_date, page, size } = params;

        let query = `
          SELECT cs.*, 
                 u.username AS user_name, 
                 e.username AS expert_name,
                 COALESCE(
                    (SELECT s.name_skill FROM skills s
                     JOIN service_user su ON su.skill_id = s.skill_id
                     WHERE su.service_id = cs.service_id),
                    (SELECT ur.title FROM user_requests ur
                     WHERE ur.request_id = cs.request_id)
                ) AS service_name
          FROM book_services cs
          JOIN users u ON cs.user_id = u.user_id
          JOIN users e ON cs.expert_id = e.user_id
          WHERE cs.status != 'pending'
        `;

        if (type === "expert") {
            query += ` AND cs.expert_id = ?`;
        } else if (type === "user") {
            query += ` AND cs.user_id = ?`;
        } else if (type === "all") {
            query += ` AND (cs.expert_id = ? OR cs.user_id = ?)`;
        }

        if (start_date && end_date) {
            query += ` AND cs.schedule_time BETWEEN ? AND ?`;
        }

        query += ` ORDER BY cs.schedule_time ASC LIMIT ? OFFSET ?`;

        const queryParams = [];
        if (type === "all") {
            queryParams.push(userId, userId);
        } else {
            queryParams.push(userId);
        }

        if (start_date && end_date) {
            queryParams.push(start_date, end_date);
        }
        queryParams.push(size, (page - 1) * size);

        pool.query(query, queryParams, (error, results) => {
            if (error) {
                return callback(error);
            }

            const totalQuery = `
              SELECT COUNT(*) AS total
              FROM book_services cs
              WHERE cs.status != 'pending'
              ${type === "expert" ? ` AND cs.expert_id = ?` : ""}
              ${type === "user" ? ` AND cs.user_id = ?` : ""}
              ${start_date && end_date ? ` AND cs.schedule_time BETWEEN ? AND ?` : ""}
            `;

            pool.query(totalQuery, queryParams, (totalError, totalResults) => {
                if (totalError) {
                    return callback(totalError);
                }

                const metadata = {
                    total: totalResults[0].total,
                    page,
                    size,
                    total_page: Math.ceil(totalResults[0].total / size),
                    type,
                    start_date,
                    end_date,
                };

                return callback(null, { data: results, metadata });
            });
        });
    },
    updateServiceStatus: (bookId, newStatus, callBack) => {
        const query = `
          UPDATE book_services 
          SET status = ? 
          WHERE book_id = ?;
        `;

        pool.query(query, [newStatus, bookId], (error, result) => {
            if (error) {
                return callBack(error);
            }
            if (result.affectedRows === 0) {
                return callBack(new Error("Booking not found or user not authorized."));
            }
            return callBack(null, { message: "Service status updated successfully." });
        });
    },
    addReview: (params, callback) => {
        const { bookId, userId, rating, comments } = params;
    
        const checkQuery = `
            SELECT request_id, service_id, expert_id 
            FROM book_services 
            WHERE book_id = ?;
        `;
    
        pool.query(checkQuery, [bookId], (error, results) => {
            if (error) return callback(error);
    
            if (results.length === 0) {
                return callback(new Error("Booking not found."));
            }
    
            const { request_id, service_id, expert_id } = results[0];
    
            const expertCheckQuery = `
                SELECT user_id 
                FROM users 
                WHERE user_id = ?;
            `;
    
            pool.query(expertCheckQuery, [expert_id], (expertError, expertResults) => {
                if (expertError) return callback(expertError);
    
                if (expertResults.length === 0) {
                    return callback(new Error("Expert not found for this booking."));
                }
    
                let insertQuery, insertParams;
    
                if (request_id) {
                    insertQuery = `
                        INSERT INTO request_review (book_id,request_id, user_id, rating, review_description)
                        VALUES (?, ?, ?, ?, ?);
                    `;
                    insertParams = [bookId,request_id, userId, rating, comments];
                } else if (service_id) {
                    insertQuery = `
                        INSERT INTO service_reviews (book_id, service_id, user_id, expert_id, rating, review_description)
                        VALUES (?, ?, ?, ?, ?, ?);
                    `;
                    insertParams = [bookId,service_id, userId, expert_id, rating, comments];
                } else {
                    return callback(new Error("Neither request_id nor service_id found for this booking."));
                }
    
                pool.query(insertQuery, insertParams, (insertError, result) => {
                    if (insertError) return callback(insertError);
                    return callback(null, { message: "Review added successfully" });
                });
            });
        });
    },
    updateCancelReason: (bookId, cancelReason, callback) => {
        const query = `
            UPDATE book_services 
            SET cancel_reason = ? 
            WHERE book_id = ?;
        `;
    
        pool.query(query, [cancelReason, bookId], (error, result) => {
            if (error) {
                return callback(error);
            }
            if (result.affectedRows === 0) {
                return callback(new Error("Booking not found or user not authorized."));
            }
            return callback(null, { message: "Cancel reason updated successfully." });
        });
    }
};