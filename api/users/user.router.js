const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const {
    createUser,
    login,
    getUserById,
    updateUser,
    changePassword,
    getLanguages,
    updateUserDetails,
    getUserDetails,
    getTop10Experts,
    getExpertDetailsById,
    searchExperts,
    getAppointmentsWithCustomers,
    getAppointmentsWithExperts
} = require("./user.controller");

router.post('/register', createUser);
router.post('/login', login);
router.get('/profile', checkToken, getUserById);
router.patch('/profile', checkToken, updateUser);
router.post('/changePassword', checkToken, changePassword);
router.get('/languages', getLanguages);
router.patch('/update-details', checkToken, updateUserDetails);
router.get('/details', checkToken, getUserDetails);
router.get('/top-experts', getTop10Experts);
router.get('/expert/:id', getExpertDetailsById);
router.post('/search-experts', searchExperts);
router.get('/appointments-with-customers', checkToken, getAppointmentsWithCustomers);
router.get('/appointments-with-experts', checkToken, getAppointmentsWithExperts);

module.exports = router;