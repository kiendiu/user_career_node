const pool = require("../../config/database");

module.exports = {
  //dat lich va thanh toan tu viec tru vi chuyen tien o home_module
  createBooking: (data, callBack) => {
    const query = `
        INSERT INTO book_services 
        (service_id, request_id, user_id, expert_id, schedule_time, duration, total_price, note_message, contact_method, location_name, address, created_at, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending');
    `;
    pool.getConnection((err, connection) => {
      if (err) {
        return callBack(err);
      }
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return callBack(err);
        }

        connection.query(
          query,
          [
            data.service_id || null,
            data.request_id || null,
            data.user_id,
            data.expert_id,
            data.schedule_time,
            data.duration,
            data.total_price,
            data.note_message || null,
            data.contact_method,
            data.location_name || null,
            data.address || null
          ],
          (error, results) => {
            if (error) {
              return connection.rollback(() => {
                connection.release();
                return callBack(error);
              });
            }

            const bookIdQuery = "SELECT LAST_INSERT_ID() as book_id";
            connection.query(bookIdQuery, [], (error, result) => {
              if (error) {
                return connection.rollback(() => {
                  connection.release();
                  return callBack(error);
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    return callBack(err);
                  });
                }

                connection.release();
                return callBack(null, result[0]);
              });
            });
          }
        );
      });
    });
  },
  updateBookingStatus: (bookId, status, callBack) => {
    pool.query(
      `UPDATE book_services SET status = ? WHERE book_id = ?`,
      [status, bookId],
      (error, results) => {
          if (error) {
              return callBack(error);
          }
          return callBack(null, results);
      }
    );
  },
  deleteBooking: (bookId, callBack) => {
    const query = `DELETE FROM book_services WHERE book_id = ?`;
    pool.query(query, [bookId], (error, results) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },

  getBookingById: (bookId, callBack) => {
    const query = `SELECT * FROM book_services WHERE book_id = ?`;
    pool.query(query, [bookId], (error, results) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results[0]);
    });
  },
  createTransaction: (data, callBack) => {
    const query = `
        INSERT INTO transactions (user_id, type, amount, content, created_at) 
        VALUES (?, 'service', ?, ?, NOW());
    `;
    pool.query(
        query,
        [
            data.user_id,
            data.amount,
            data.content
        ],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results.insertId);
        }
    );
},

createPaymentService: (data, transactionId, callBack) => {
  const query = `
      INSERT INTO payment_service (transaction_id, expert_id, request_id, book_id, cost, content, method_payment, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW());
  `;
  pool.query(
      query,
      [
          transactionId,
          data.expert_id,
          data.request_id,
          data.book_id,
          data.cost,
          data.content,
          data.method_payment
      ],
      (error, results) => {
          if (error) {
              return callBack(error);
          }
          return callBack(null, results);
      }
  );
},
updateWalletBalances: (customerId, expertId, cost, callBack) => {
  const query = `
      UPDATE users AS customer, users AS expert
      SET customer.balance_wallet = customer.balance_wallet - ?,
          expert.balance_wallet = expert.balance_wallet + ?
      WHERE customer.user_id = ? AND expert.user_id = ?;
  `;

  pool.query(query, [cost, cost, customerId, expertId], (error, results) => {
      if (error) {
          return callBack(error);
      }
      return callBack(null, results);
  });
},
//lay danh sach yeu cau o request_module
getRequestsGeneral: (size, page, excludeUserId, callBack) => {
  const offset = (page - 1) * size;

  let whereConditions = `WHERE ur.status = 'open'`;
  let queryParams = [size, offset];

  if (excludeUserId) {
      whereConditions += ` AND ur.user_id != ?`;
      queryParams = [excludeUserId, size, offset];
  }

  const query = `
      SELECT ur.request_id, ur.title, ur.description, ur.category_id, c.name_category, ur.contact_method, 
             ur.bidding_end_date, ur.location_name, ur.address, ur.status, ur.created_at, ur.updated_at,
             ur.budget,
             COUNT(b.bid_id) AS total_bids,
             IFNULL(GROUP_CONCAT(
                 CONCAT(
                     '{"bid_id":', b.bid_id, ',',
                     '"expert_id":', b.expert_id, ',',
                     '"request_id":', ur.request_id, ',',
                     '"price":', b.price, ',',
                     '"description":"', b.description, '",',
                     '"change_reason":"', IFNULL(b.change_reason, ''), '",',
                     '"created_at":"', b.created_at, '",',
                     '"status":"', b.status, '",',
                     '"request_title":"', ur.title, '",',
                     '"category_id":', ur.category_id, ',',
                     '"name_category":"', c.name_category, '"}'
                 )
             ), NULL) AS expert_bids
      FROM user_requests ur
      JOIN categories c ON ur.category_id = c.category_id
      LEFT JOIN bids b ON ur.request_id = b.request_id
      ${whereConditions}
      GROUP BY ur.request_id
      ORDER BY ur.created_at DESC
      LIMIT ? OFFSET ?;
  `;

  pool.query(query, queryParams, (error, results) => {
      if (error) {
          return callBack(error);
      }

      const totalQuery = `
          SELECT COUNT(*) AS total
          FROM user_requests ur
          ${whereConditions};
      `;

      const totalQueryParams = excludeUserId ? [excludeUserId] : [];

      pool.query(totalQuery, totalQueryParams, (error, totalResults) => {
          if (error) {
              return callBack(error);
          }
          const total = totalResults[0].total;

          // Process expert_bids JSON
          results.forEach(result => {
              result.expert_bids = result.expert_bids ? JSON.parse('[' + result.expert_bids + ']') : null;
          });

          return callBack(null, { requests: results, total });
      });
  });
},
  getRequestsMine: (size, page, excludeUserId, status, callBack) => {
    const offset = (page - 1) * size;

    let conditions = [];
    let queryParams = [];

    if (excludeUserId) {
      conditions.push('ur.user_id = ?');
      queryParams.push(excludeUserId);
    }

    if (status === 'open') {
      conditions.push('ur.status = "open"');
    } else if (status === 'closed') {
      conditions.push('ur.status = "closed"');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
        SELECT ur.request_id, ur.title AS title, ur.description, ur.category_id, c.name_category, 
               ur.contact_method, ur.bidding_end_date, ur.location_name, ur.address, ur.status, 
               ur.created_at, ur.updated_at, ur.budget,
               COUNT(b.bid_id) AS total_bids,
               IFNULL(GROUP_CONCAT(
                   CONCAT(
                       '{"bid_id":', b.bid_id, ',',
                       '"expert_id":', b.expert_id, ',',
                       '"request_id":', ur.request_id, ',',
                       '"price":', b.price, ',',
                       '"description":"', b.description, '",',
                       '"change_reason":"', IFNULL(b.change_reason, ''), '",',
                       '"created_at":"', b.created_at, '",',
                       '"status":"', b.status, '",',
                       '"request_title":"', ur.title, '",',
                       '"category_id":', ur.category_id, ',',
                       '"name_category":"', c.name_category, '"}'
                   )
               ), NULL) AS expert_bids
        FROM user_requests ur
        JOIN categories c ON ur.category_id = c.category_id
        LEFT JOIN bids b ON ur.request_id = b.request_id
        ${whereClause}
        GROUP BY ur.request_id
        ORDER BY ur.created_at DESC
        LIMIT ? OFFSET ?;
    `;
    queryParams.push(size, offset);

    pool.query(query, queryParams, (error, results) => {
        if (error) {
            return callBack(error);
        }

        const totalQuery = `
            SELECT COUNT(*) AS total
            FROM user_requests ur
            JOIN categories c ON ur.category_id = c.category_id
            ${whereClause};
        `;

        pool.query(totalQuery, queryParams.slice(0, queryParams.length - 2), (error, totalResults) => {
            if (error) {
                return callBack(error);
            }
            const total = totalResults[0].total;
            results.forEach(result => {
                result.expert_bids = result.expert_bids ? JSON.parse('[' + result.expert_bids + ']') : null;
            });
            return callBack(null, { requests: results, total });
        });
    });
  },
  getListBids: (userId, size, page, status, callBack) => {
    const offset = (page - 1) * size;
  
    let conditions = [];
    let queryParams = [];
  
    let userBidsCondition = 'b.expert_id = ?'; 
    queryParams.push(userId);
  
    let excludeOwnRequestsCondition = 'r.user_id != ?';
    queryParams.push(userId);
  
    if (status === 'open') {
      conditions.push('r.status = "open"');
    } else if (status === 'closed') {
      conditions.push('r.status = "closed"');
    }
      const statusClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
      const query = `
      SELECT b.*, r.title AS request_title, r.category_id, c.name_category
      FROM bids b
      JOIN user_requests r ON b.request_id = r.request_id
      JOIN categories c ON r.category_id = c.category_id
      WHERE ${userBidsCondition} AND ${excludeOwnRequestsCondition}
      ${statusClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?;
    `;
      queryParams.push(size, offset);
  
    pool.query(query, queryParams, (error, results) => {
      if (error) {
        return callBack(error);
      }
        const totalQuery = `
        SELECT COUNT(*) AS total
        FROM bids b
        JOIN user_requests r ON b.request_id = r.request_id
        WHERE ${userBidsCondition} AND ${excludeOwnRequestsCondition}
        ${statusClause};
      `;
        pool.query(totalQuery, queryParams.slice(0, queryParams.length - 2), (error, totalResults) => {
        if (error) {
          return callBack(error);
        }
        const total = totalResults[0].total;
        return callBack(null, { bids: results, total });
      });
    });
  },

  addRequest: (data, callBack) => {
    const query = `
      INSERT INTO user_requests 
      (user_id,title, description, category_id, contact_method, bidding_end_date, location_name, address, status, budget, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, NOW());
    `;

    const queryParams = [
      data.user_id,
      data.title,
      data.description,
      data.category_id,
      data.contact_method,
      data.bidding_end_date,
      data.location_name,
      data.address,
      data.budget
    ];

    pool.query(query, queryParams, (error, result) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, result);
    });
  },
  cancelRequest: (requestId, userId, callBack) => {
    const query = `
      UPDATE user_requests 
      SET status = 'closed' 
      WHERE request_id = ? AND user_id = ?;
    `;

    pool.query(query, [requestId, userId], (error, result) => {
      if (error) {
        return callBack(error);
      }
      if (result.affectedRows === 0) {
        return callBack(new Error("Request not found or user not authorized."));
      }
      return callBack(null, { message: "Request canceled successfully." });
    });
  },
  //them va udate status của chao giá 
  addBid: (data, callBack) => {
    const checkQuery = `
      SELECT COUNT(*) AS bid_count 
      FROM bids 
      WHERE expert_id = ? AND request_id = ?;
    `;
  
    const checkParams = [data.expert_id, data.request_id];
  
    pool.query(checkQuery, checkParams, (error, results) => {
      if (error) {
        return callBack(error);
      }
        if (results[0].bid_count > 0) {
        return callBack(new Error("Bạn đã chào giá yêu cầu này!"));
      }
  
      const insertQuery = `
        INSERT INTO bids 
        (expert_id, request_id, price, description, change_reason, created_at, status) 
        VALUES (?, ?, ?, ?, ?, NOW(), 'pending');
      `;
  
      const queryParams = [
        data.expert_id,
        data.request_id,
        data.price,
        data.description,
        data.change_reason || null
      ];
  
      pool.query(insertQuery, queryParams, (error, result) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, result);
      });
    });
  },
  updateBidStatus : (bidId, newStatus, callBack) => {
    const query = `
      UPDATE bids 
      SET status = ? 
      WHERE bid_id = ?;
    `;

    pool.query(query, [newStatus, bidId], (error, result) => {
      if (error) {
        return callBack(error);
      }
      if (result.affectedRows === 0) {
        return callBack(new Error("Bid not found or expert not authorized."));
      }
      return callBack(null, { message: "Bid status updated successfully." });
    });
  }
};
