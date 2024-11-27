const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const {
    addExperience,
    updateExperience,
    deleteExperience,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    addSkillAndService,
    updateSkill,
    deleteSkill,
    getListCategories,
    getCertificatesByUser,
    getExperiencesByUser,
    getSkillsByUser,
    getDetailsExperience,
    getDetailSkill,
    getDetailCertificate,
    getExperts,
    getExpertInfo,
    getUserInAdminPage,
    getUserInfoInAdminPagge
} = require("./expect.controller");

router.post('/experience', checkToken, addExperience);
router.put('/experience', checkToken, updateExperience);
router.delete('/experience/:id', checkToken, deleteExperience);

router.post('/certificate', checkToken, addCertificate);
router.put('/certificate', checkToken, updateCertificate);
router.delete('/certificate/:id', checkToken, deleteCertificate);

router.post('/skill', checkToken, addSkillAndService);
router.put('/skill', checkToken, updateSkill);
router.delete('/skill/:id', checkToken, deleteSkill);

router.get('/categories', getListCategories);
router.get('/experiences', checkToken, getExperiencesByUser);
router.get('/certificates', checkToken, getCertificatesByUser);
router.get('/skills', checkToken, getSkillsByUser);

router.get('/experience/:id', checkToken, getDetailsExperience);
router.get('/skill/:id', checkToken, getDetailSkill);
router.get('/certificate/:id', checkToken, getDetailCertificate);

router.get('/getListExperts', getExperts);

router.get('/getExpertInfo/:id', getExpertInfo);

router.get('/getListUserInAdmin', getUserInAdminPage);
router.get('/getListUserInAdmin/:id', getUserInfoInAdminPagge);

module.exports = router;