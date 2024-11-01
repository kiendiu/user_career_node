const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const {
    getBookedServicesController,
    getConsultationScheduleController,
    updateServiceStatusController,
    addReviewController,
    updateCancelReasonController
} = require("./manage.controller");

router.get("/booked_services", checkToken, getBookedServicesController);

router.get("/consultation_schedule", checkToken, getConsultationScheduleController);

router.put('/updateStatusService/:id/:status', checkToken, updateServiceStatusController);

router.post("/booked_services/:bookId", checkToken, addReviewController);

router.put("/booked_services/cancel_reason/:bookId", checkToken, updateCancelReasonController);

module.exports = router;