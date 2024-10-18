const pool = require("../../config/database");

module.exports = {
  // 
  getRequestsGeneral: (size, page, excludeUserId, callBack) => {
    const offset = (page - 1) * size;

    const excludeUserCondition = excludeUserId ? `WHERE ur.user_id != ?` : '';

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
        ${excludeUserCondition}
        GROUP BY ur.request_id
        ORDER BY ur.created_at DESC
        LIMIT ? OFFSET ?;
    `;

    const queryParams = excludeUserId ? [excludeUserId, size, offset] : [size, offset];

    pool.query(query, queryParams, (error, results) => {
        if (error) {
            return callBack(error);
        }

        const totalQuery = `
            SELECT COUNT(*) AS total
            FROM user_requests ur
            ${excludeUserCondition};
        `;

        const totalQueryParams = excludeUserId ? [excludeUserId] : [];

        pool.query(totalQuery, totalQueryParams, (error, totalResults) => {
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
  }
};
