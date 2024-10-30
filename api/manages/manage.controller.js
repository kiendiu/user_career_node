const {
    getBookedServices,
    getConsultationSchedule,
    updateServiceStatus,
    addReview
} = require("./manage.service");

module.exports = {
    getBookedServicesController: (req, res) => {
        const { type = "all", status, start_date, end_date, page = 1, size = 10 } = req.query;
        const userId = req.decoded.result.user_id;

        const params = {
            type,
            status,
            start_date,
            end_date,
            page: parseInt(page, 10),
            size: parseInt(size, 10),
            userId
        };

        getBookedServices(params, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.json({
                success: 1,
                data: result.data,
                metadata: result.metadata
            });
        });
    },
    getConsultationScheduleController: (req, res) => {
        const { type = "all", status, start_date, end_date, page = 1, size = 10 } = req.query;
        const userId = req.decoded.result.user_id;

        const params = {
            userId,
            type,
            status,
            start_date,
            end_date,
            page: parseInt(page, 10),
            size: parseInt(size, 10),
        };

        getConsultationSchedule(params, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.json({
                success: 1,
                data: result.data,
                metadata: result.metadata
            });
        });
    },
    updateServiceStatusController : (req, res) => {
        const bookId = req.params.id;
        const newStatus = req.params.status;
      
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
          return res.status(400).json({ error: "Invalid status provided." });
        }
      
        updateServiceStatus(bookId, newStatus, (error, result) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          res.json({ message: result.message });
        });
    },
    addReviewController: (req, res) => {
        const { bookId } = req.params;
        const { rating, comments } = req.body;
        const userId = req.decoded.result.user_id;
    
        const params = {
            bookId: parseInt(bookId, 10),
            userId,
            rating,
            comments
        };
    
        addReview(params, (error, result) => {
            if (error) {
                return res.status(500).json({ success: 0, message: error.message });
            }
            return res.json({ success: 1, data: result });
        });
    }
}