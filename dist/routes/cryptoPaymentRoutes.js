"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
// import {
//   getAvailableWallets,
//   getWalletByCurrencyAndNetwork,
//   createDepositTransaction,
//   getUserDeposits,
//   getPendingDeposits,
// } from "../controllers/cryptoWalletController";
const cryptoPaymentController_1 = require("../controllers/cryptoPaymentController");
const router = (0, express_1.Router)();
// Public routes
// Protected routes
router.post("/deposits", authMiddleware_1.authenticateJWT, cryptoPaymentController_1.createTransaction);
router.post("/withdraw", authMiddleware_1.authenticateJWT, cryptoPaymentController_1.createTransaction);
router.get("/deposits/user", authMiddleware_1.authenticateJWT, cryptoPaymentController_1.getUserTransactions);
router.get("/deposits/pending", authMiddleware_1.authenticateJWT, cryptoPaymentController_1.getPendingTransactions);
router.post("/deposits/:transactionId/approve", authMiddleware_1.authenticateJWT, cryptoPaymentController_1.approveTransaction);
router.post("/deposits/:transactionId/reject", authMiddleware_1.authenticateJWT, cryptoPaymentController_1.rejectTransaction);
exports.default = router;
