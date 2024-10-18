const {
  getRequestsGeneral,
  getRequestsMine,
  getListBids,
  addRequest,
  cancelRequest
} = require("./request.service");

const pool = require("../../config/database");

module.exports = {
  getRequestsGeneral: (req, res) => {
    const size = parseInt(req.query.size) || 20;
    const page = parseInt(req.query.page) || 1;
    const excludeUserId = req.query.exclude_user_id || null;

    getRequestsGeneral(size, page, excludeUserId, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const metadata = {
            size,
            page,
            total_page: Math.ceil(result.total / size),
            total: result.total,
            exclude_user_id: excludeUserId
        };
        res.json({ data: result.requests, metadata });
    });
  },

  getRequestsMine: (req, res) => {
    const size = parseInt(req.query.size) || 20;
    const page = parseInt(req.query.page) || 1;
    const excludeUserId = req.query.exclude_user_id;
    const status = req.query.status || 'open';

    getRequestsMine(size, page, excludeUserId, status, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const metadata = {
            size,
            page,
            total_page: Math.ceil(result.total / size),
            total: result.total,
            exclude_user_id: excludeUserId,
            status
        };
        res.json({ data: result.requests, metadata });
    });
  },

  getListBids: (req, res) => {
    const size = parseInt(req.query.size) || 20;
    const page = parseInt(req.query.page) || 1;
    const excludeUserId = req.decoded.result.user_id;
    const status = req.query.status;

    getListBids(excludeUserId, size, page, status, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const metadata = {
            size,
            page,
            total_page: Math.ceil(result.total / size),
            total: result.total,
            status
        };
        res.json({ data: result.bids, metadata });
    });
  },
  addRequest: (req, res) => {
    const body = req.body;

    addRequest(body, (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(201).json({ message: "Request added successfully.", request_id: result.insertId });
    });
  },
  cancelRequest: (req, res) => {
    const requestId = req.params.id;
    const userId = req.decoded.result.user_id;

    cancelRequest(requestId, userId, (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json({ message: result.message });
    });
  }
};