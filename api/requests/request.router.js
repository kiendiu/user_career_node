const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const { 
    getRequestsGeneral,
    getRequestsMine,
    getListBids,
    addRequest,
    cancelRequest,
    createBooking,
    createPayment,
    updateBookingStatus,
    deleteBooking,
    getBookingById
} = require("./request.controller");

router.get('/getListRequestsGeneral', getRequestsGeneral);
router.get('/getListRequestsMine', getRequestsMine);
router.get('/getListBids', checkToken, getListBids);

router.post('/addRequest', checkToken, addRequest);
router.post('/cancelRequest/:id', checkToken, cancelRequest);

router.post("/booking", checkToken, createBooking);
router.post("/payment", checkToken, createPayment);
router.put("/booking/status", checkToken, updateBookingStatus);
router.delete("/booking/:id", checkToken, deleteBooking);
router.get('/booking/:id', checkToken, getBookingById);

module.exports = router;