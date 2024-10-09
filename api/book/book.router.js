const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const {
    addServiceGeneral,
    getServiceGeneral,
    updateServiceGeneral,
    createServiceFrame,
    modifyServiceFrame,
    removeServiceFrame,
    getSkillsByUser
} = require("./book.controller");


router.post("/service_general", checkToken, addServiceGeneral);
router.get("/service_general", checkToken, getServiceGeneral);
router.put("/service_general", checkToken, updateServiceGeneral);
router.post("/service_frame", checkToken, createServiceFrame);
router.put("/service_frame", checkToken, modifyServiceFrame);
router.delete("/service_frame/:service_frame_id", checkToken, removeServiceFrame);
router.get('/skills',checkToken, getSkillsByUser);

module.exports = router;