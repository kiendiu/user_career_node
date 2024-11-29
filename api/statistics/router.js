const router = require("express").Router();
const { 
    getBookingStatusStatistics, 
    getMonthlyStatistics 
} = require("./controller");

router.get("/status", getBookingStatusStatistics);

router.get("/month/:year", getMonthlyStatistics);

module.exports = router;


