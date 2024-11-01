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
  updateWalletBalances,
  addBid,
  updateBidStatus
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
  createPaymentNoUpdateStatusBooking : (req, res) => {
    const { expert_id, book_id, cost, content, method_payment } = req.body;
    const userId = req.decoded.result.user_id;
  
    const getUserWalletQuery = `SELECT full_name, balance_wallet FROM users WHERE user_id = ?`;
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
  
      if (customerWallet < cost) {
        return res.status(400).json({
          success: 0,
          message: "Bạn không đủ tài khoản trong ví!"
        });
      }
  
      // Fetch booking information
      getBookingById(book_id, (err, booking) => {
        if (err || !booking) {
          return res.status(500).json({
            success: 0,
            message: "Booking not found",
            error: err || "Booking ID invalid"
          });
        }
  
        const { request_id } = booking;
        const paymentContent = `Thanh toán cho đặt lịch từ %${customerName}% tới chuyên gia %%${expert_id}%%`;
  
        const transactionData = {
          user_id: userId,
          amount: cost,
          content: paymentContent
        };
  
        // Create transaction
        createTransaction(transactionData, (err, transactionId) => {
          if (err) {
            return res.status(500).json({
              success: 0,
              message: "Failed to create transaction",
              error: err
            });
          }
  
          // Update wallet balances
          updateWalletBalances(userId, expert_id, cost, (err, walletResult) => {
            if (err) {
              return res.status(500).json({
                success: 0,
                message: "Failed to update wallet balances",
                error: err
              });
            }
  
            // Prepare data for payment service creation
            const paymentServiceData = {
              transaction_id: transactionId,
              expert_id,
              request_id: request_id || null, // Null if no request_id
              book_id,
              cost,
              content: paymentContent,
              method_payment
            };
  
            // Create payment record
            createPaymentService(paymentServiceData, transactionId, (err, paymentResult) => {
              if (err) {
                return res.status(500).json({
                  success: 0,
                  message: "Failed to create payment",
                  error: err
                });
              }
  
              return res.status(200).json({
                success: 1,
                message: "Payment successful, wallet updated",
                data: paymentResult
              });
            });
          });
        });
      });
    });
  },
  createPayment: (req, res) => {
    const body = req.body;
    const userId = req.decoded.result.user_id;

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

        if (customerWallet < body.cost) {
            return res.status(400).json({
                success: 0,
            });
        }

        pool.query(getUserWalletQuery, [body.expert_id], (err, expertResults) => {
            if (err || expertResults.length === 0) {
                return res.status(500).json({
                    success: 0,
                    message: "Failed to find expert",
                    error: err || 'Expert not found'
                });
            }

            const expertName = expertResults[0].full_name;

            const content = `Thanh toán cho đặt lịch cho chuyên gia ${expertName}`;

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

                updateWalletBalances(userId, body.expert_id, body.cost, (err, walletResult) => {
                    if (err) {
                        return res.status(500).json({
                            success: 0,
                            message: "Failed to update wallet balances",
                            error: err
                        });
                    }

                    createPaymentService(body, transactionId, (err, paymentResult) => {
                        if (err) {
                            return res.status(500).json({
                                success: 0,
                                message: "Failed to create payment",
                                error: err
                            });
                        }

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
    const { id: book_id } = req.params;

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
    const excludeUserId = req.decoded.result.user_id;
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
  },

//them chao gia của chuyen gia vơi khach hang
  addBidController: (req, res) => {
    const body = req.body;
    const expertId = req.decoded.result.user_id;
  
    const bidData = {
      expert_id: expertId,
      request_id: body.request_id,
      price: body.price,
      description: body.description,
      change_reason: body.change_reason || null
    };
  
    addBid(bidData, (error, result) => {
      if (error) {
        if (error.message === "Bạn đã chào giá yêu cầu này!") {
          return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message });
      }
      return res.status(201).json({ message: "Bid added successfully.", bid_id: result.insertId });
    });
  },
  updateBidStatusController : (req, res) => {
    const bidId = req.params.id;
    const newStatus = req.params.status;

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ error: "Invalid status provided." });
    }

    updateBidStatus(bidId, newStatus, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: result.message });
    });
  }
};