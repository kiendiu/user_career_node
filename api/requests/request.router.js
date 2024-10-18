const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const { 
    getRequestsGeneral,
    getRequestsMine,
    getListBids,
    addRequest,
    cancelRequest
} = require("./request.controller");

router.get('/getListRequestsGeneral', getRequestsGeneral);
router.get('/getListRequestsMine', getRequestsMine);
router.get('/getListBids', checkToken, getListBids);

router.post('/addRequest', checkToken, addRequest);
router.post('/cancelRequest/:id', checkToken, cancelRequest);

module.exports = router;