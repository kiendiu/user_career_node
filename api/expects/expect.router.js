const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const {
    addExperience,
    updateExperience,
    deleteExperience,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    addSkill,
    updateSkill,
    deleteSkill
} = require("./expect.controller");

router.post('/experience', checkToken, addExperience);
router.put('/experience', checkToken, updateExperience);
router.delete('/experience/:id', checkToken, deleteExperience);

router.post('/certificate', checkToken, addCertificate);
router.put('/certificate', checkToken, updateCertificate);
router.delete('/certificate/:id', checkToken, deleteCertificate);

router.post('/skill', checkToken, addSkill);
router.put('/skill', checkToken, updateSkill);
router.delete('/skill/:id', checkToken, deleteSkill);

module.exports = router;