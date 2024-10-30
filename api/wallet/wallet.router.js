const router = require("express").Router();
const { checkToken } = require("../../Auth/token_validation");
const {
    depositToWallet,
    getWalletBalance,
    getTransactionHistory
} = require("./wallet.controller");

router.post("/deposit", checkToken, depositToWallet);

router.get("/wallet-balance", checkToken, getWalletBalance);

router.get("/transaction-history", checkToken, getTransactionHistory);

module.exports = router;