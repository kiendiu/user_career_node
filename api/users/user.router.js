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
    updateApproval,
    approvalExpert
} = require("./user.controller");

router.post('/register', createUser);
router.post('/login', login);
router.get('/profile', checkToken, getUserById);
router.patch('/profile', checkToken, updateUser);
router.post('/changePassword', checkToken, changePassword);
router.get('/languages', getLanguages);
router.patch('/update-details', checkToken, updateUserDetails);
router.get('/details', checkToken, getUserDetails);
router.put("/approval/:status",checkToken, updateApproval);
router.put("/approval_expert", approvalExpert);

module.exports = router;