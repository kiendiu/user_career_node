const {
    createTransaction,
    createWalletDeposit,
    updateUserBalance,
    getTransactionHistoryService,
    getWalletBalanceService
} = require("./wallet.service");

module.exports = {
    depositToWallet: async (req, res) => {
        const userId = req.decoded.result.user_id;
        const { amount, content } = req.body;

        try {
            const transactionId = await createTransaction(userId, 'deposit', amount, content);

            await createWalletDeposit(transactionId, amount, content);

            await updateUserBalance(userId, amount);

            return res.status(200).json({
                success: 1,
                message: "Deposit successful",
                transactionId: transactionId
            });
        } catch (error) {
            console.error("Error in depositToWallet:", error);
            return res.status(500).json({
                success: 0,
                message: "Deposit failed"
            });
        }
    },
    getWalletBalance: async (req, res) => {
        const userId = req.decoded.result.user_id;
        try {
            const walletBalance = await getWalletBalanceService(userId);
            res.json({ wallet_balance: walletBalance });
        } catch (error) {
            console.error("Error in getWalletBalance:", error);
            res.status(500).json({ message: "Failed to retrieve wallet balance" });
        }
    },
    
    getTransactionHistory: async (req, res) => {
        const userId = req.decoded.result.user_id;
        const { page = 1, size = 10, type = 'all' } = req.query;
    
        try {
            const { transactions, total, totalPages } = await getTransactionHistoryService(
                userId,
                page,
                size,
                type
            );
    
            return res.status(200).json({
                success: 1,
                data: transactions,
                metadata: {
                    total: total,
                    page: parseInt(page),
                    total_page: totalPages +1,
                    size: parseInt(size),
                    type: type
                }
            });
        } catch (error) {
            console.error("Error in getTransactionHistory:", error);
            return res.status(500).json({
                success: 0,
                message: "Failed to retrieve transaction history"
            });
        }
    }
    
};