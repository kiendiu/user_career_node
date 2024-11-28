const router = require("express").Router();
const { 
    getBookingStatusStatistics, 
    getMonthlyStatistics ,
    getTotalCompletedBookingStatistics
} = require("./controller");

router.get("/status", getBookingStatusStatistics);

router.get("/month/:year", getMonthlyStatistics);

router.get("/total-completed", getTotalCompletedBookingStatistics);

module.exports = router;
