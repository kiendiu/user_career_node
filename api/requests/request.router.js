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
    getBookingById,
    addBidController,
    updateBidStatusController
} = require("./request.controller");

router.get('/getListRequestsGeneral', getRequestsGeneral);
router.get('/getListRequestsMine', checkToken, getRequestsMine);
router.get('/getListBids', checkToken, getListBids);

router.post('/addRequest', checkToken, addRequest);
router.post('/cancelRequest/:id', checkToken, cancelRequest);

router.post("/booking", checkToken, createBooking);
router.post("/payment", checkToken, createPayment);
router.put("/booking/status", checkToken, updateBookingStatus);
router.delete("/booking/:id", checkToken, deleteBooking);
router.get('/booking/:id', checkToken, getBookingById);

router.post('/addBid', checkToken, addBidController);
router.put('/updateStatusBid/:id/:status', checkToken, updateBidStatusController);

module.exports = router;