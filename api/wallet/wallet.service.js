const pool = require("../../config/database");

module.exports = {
    createTransaction: (userId, type, amount, content) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO transactions (user_id, type, amount, content) VALUES (?, ?, ?, ?)`;
            pool.query(query, [userId, type, amount, content], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results.insertId);
            });
        });
    },

    createWalletDeposit: (transactionId, amount, content) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO wallet_deposit (transaction_id, cost, content) VALUES (?, ?, ?)`;
            pool.query(query, [transactionId, amount, content], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },

    updateUserBalance: (userId, amount) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE users SET balance_wallet = balance_wallet + ? WHERE user_id = ?`;
            pool.query(query, [amount, userId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    getWalletBalanceService: (userId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT balance_wallet FROM users WHERE user_id = ?`;
            pool.query(query, [userId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results[0]?.balance_wallet || 0);
            });
        });
    },

    getTransactionHistoryService: (userId, page, size, type) => {
        const offset = (page - 1) * size;
    
        const typeCondition = type === 'all' 
            ? '' 
            : type === 'add' 
            ? 'WHERE is_add = 1' 
            : 'WHERE is_add = 0';
    
        const query = `
            SELECT * FROM (
                SELECT t.transaction_id, t.amount, t.type, t.created_at, 
                    CASE 
                        WHEN ps.expert_id = ? THEN 
                            CONCAT("Bạn đã nhận được tiền cho tư vấn dịch vụ ", s.name_skill, " từ khách hàng ", u.username)
                        WHEN ps.expert_id != ? THEN 
                            CONCAT("Bạn đã thanh toán dịch vụ tư vấn ", s.name_skill, " cho chuyên gia ", e.username)
                        ELSE t.content
                    END AS content,
                    IF(t.type = 'service' AND ps.expert_id != ?, 0, 1) AS is_add
                FROM transactions t 
                LEFT JOIN payment_service ps ON t.transaction_id = ps.transaction_id
                LEFT JOIN users u ON t.user_id = u.user_id
                LEFT JOIN users e ON ps.expert_id = e.user_id  -- Lấy tên chuyên gia
                LEFT JOIN book_services bs ON ps.book_id = bs.book_id
                LEFT JOIN skills s ON bs.service_id = s.skill_id
                WHERE t.user_id = ?
            ) AS transaction_data
            ${typeCondition}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`;
    
        const queryParams = [
            userId,
            userId,
            userId,
            userId,
            parseInt(size, 10),
            parseInt(offset, 10)
        ];
    
        return new Promise((resolve, reject) => {
            pool.query(query, queryParams, (error, results) => {
                if (error) {
                    return reject(error);
                }
    
                const totalQuery = `
                    SELECT COUNT(*) AS total FROM (
                        SELECT IF(t.type = 'service' AND ps.expert_id != ?, 0, 1) AS is_add
                        FROM transactions t 
                        LEFT JOIN payment_service ps ON t.transaction_id = ps.transaction_id
                        WHERE t.user_id = ?
                    ) AS transaction_data
                    ${typeCondition}`;
    
                const totalParams = [userId, userId];
    
                pool.query(totalQuery, totalParams, (error, totalResults) => {
                    if (error) {
                        return reject(error);
                    }
                    const total = totalResults[0].total;
                    const totalPages = Math.ceil(total / size);
                    resolve({ transactions: results, total, totalPages });
                });
            });
        });
    }
};
