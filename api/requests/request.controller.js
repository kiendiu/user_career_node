const {
  getRequestsGeneral,
  getRequestsMine,
  getListBids,
  addRequest,
  cancelRequest,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingById,
  createTransaction,
  createPaymentService,
  updateWalletBalances
} = require("./request.service");

const pool = require("../../config/database");

module.exports = {
  createBooking: (req, res) => {
    const body = req.body;
    const userId = req.decoded.result.user_id;

    const bookingData = {
        ...body,
        user_id: userId
    };

    createBooking(bookingData, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: 0,
                message: "Database connection error",
                book_id: null
            });
        }
        return res.status(200).json({
            success: 1,
            message: "Booking created successfully",
            book_id: results.book_id
        });
    });
  },
  createPayment: (req, res) => {
    const body = req.body;
    const userId = req.decoded.result.user_id; // Lấy user_id từ token

    // Lấy số dư ví của khách hàng
    const getUserWalletQuery = `
        SELECT full_name, balance_wallet FROM users WHERE user_id = ?
    `;

    pool.query(getUserWalletQuery, [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            return res.status(500).json({
                success: 0,
                message: "Failed to find user",
                error: err || 'User not found'
            });
        }

        const customerName = userResults[0].full_name;
        const customerWallet = userResults[0].balance_wallet;

        // Kiểm tra xem số dư ví của khách hàng có đủ không
        if (customerWallet < body.cost) {
            return res.status(400).json({
                success: 0,
                message: "Bạn không đủ tài khoản trong ví!"
            });
        }

        // Lấy tên chuyên gia từ bảng users
        pool.query(getUserWalletQuery, [body.expert_id], (err, expertResults) => {
            if (err || expertResults.length === 0) {
                return res.status(500).json({
                    success: 0,
                    message: "Failed to find expert",
                    error: err || 'Expert not found'
                });
            }

            const expertName = expertResults[0].full_name;

            // Nội dung với %% bao quanh tên khách hàng và chuyên gia
            const content = `Thanh toán cho đặt lịch từ %${customerName}% tới chuyên gia %%${expertName}%%`;

            // Tạo giao dịch trong bảng transactions
            const transactionData = {
                user_id: userId,
                amount: body.cost,
                content: content
            };

            createTransaction(transactionData, (err, transactionId) => {
                if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: "Failed to create transaction",
                        error: err
                    });
                }

                // Cập nhật số dư ví của khách hàng và chuyên gia
                updateWalletBalances(userId, body.expert_id, body.cost, (err, walletResult) => {
                    if (err) {
                        return res.status(500).json({
                            success: 0,
                            message: "Failed to update wallet balances",
                            error: err
                        });
                    }

                    // Sau khi có transaction_id, chèn vào bảng payment_service
                    createPaymentService(body, transactionId, (err, paymentResult) => {
                        if (err) {
                            return res.status(500).json({
                                success: 0,
                                message: "Failed to create payment",
                                error: err
                            });
                        }

                        // Cập nhật trạng thái booking thành 'confirmed'
                        updateBookingStatus(body.book_id, 'confirmed', (err, statusResult) => {
                            if (err) {
                                return res.status(500).json({
                                    success: 0,
                                    message: "Failed to update booking status",
                                    error: err
                                });
                            }

                            return res.status(200).json({
                                success: 1,
                                message: "Payment successful, wallet updated, and booking confirmed",
                                data: paymentResult
                            });
                        });
                    });
                });
            });
        });
    });
},
  updateBookingStatus: (req, res) => {
    const { book_id, status } = req.body;

    if (!book_id || !status) {
        return res.status(400).json({
            success: 0,
            message: "Missing required fields"
        });
    }

    updateBookingStatus(book_id, status, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: 0,
                message: "Failed to update booking status",
                error: err
            });
        }

        return res.status(200).json({
            success: 1,
            message: "Booking status updated successfully",
            data: results
        });
    });
  },
  deleteBooking: (req, res) => {
    const { book_id } = req.body;

    if (!book_id) {
      return res.status(400).json({
        success: 0,
        message: "Missing required book_id"
      });
    }

    deleteBooking(book_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Failed to delete booking",
          error: err
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: 0,
          message: "Booking not found"
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Booking deleted successfully",
      });
    });
  },

  getBookingById: (req, res) => {
    const { book_id } = req.params;

    if (!book_id) {
      return res.status(400).json({
        success: 0,
        message: "Missing required book_id"
      });
    }

    getBookingById(book_id, (err, booking) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Failed to get booking",
          error: err
        });
      }

      if (!booking) {
        return res.status(404).json({
          success: 0,
          message: "Booking not found"
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Booking retrieved successfully",
        data: booking
      });
    });
  },
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