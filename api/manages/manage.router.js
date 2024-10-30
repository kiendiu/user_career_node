const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const {
    getBookedServicesController,
    getConsultationScheduleController,
    updateServiceStatusController,
    addReviewController
} = require("./manage.controller");

router.get("/booked_services", checkToken, getBookedServicesController);

router.get("/consultation_schedule", checkToken, getConsultationScheduleController);

router.put('/updateStatusService/:id/:status', checkToken, updateServiceStatusController);

router.post("/booked_services/:bookId", checkToken, addReviewController);

module.exports = router;