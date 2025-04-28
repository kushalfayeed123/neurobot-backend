"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cryptoWalletController_1 = require("../controllers/cryptoWalletController");
const router = (0, express_1.Router)();
// Public routes
// Protected routes
router.post('/deposits', authMiddleware_1.authenticateJWT, cryptoWalletController_1.createDepositTransaction);
router.get('/deposits/user', authMiddleware_1.authenticateJWT, cryptoWalletController_1.getUserDeposits);
router.get('/deposits/pending', authMiddleware_1.authenticateJWT, cryptoWalletController_1.getPendingDeposits);
router.post('/deposits/:transactionId/approve', authMiddleware_1.authenticateJWT, cryptoWalletController_1.approveDeposit);
router.post('/deposits/:transactionId/reject', authMiddleware_1.authenticateJWT, cryptoWalletController_1.rejectDeposit);
exports.default = router;
