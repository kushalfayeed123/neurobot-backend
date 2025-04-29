import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
// import {
//   getAvailableWallets,
//   getWalletByCurrencyAndNetwork,
//   createDepositTransaction,
//   getUserDeposits,
//   getPendingDeposits,
// } from "../controllers/cryptoWalletController";
import {
  createTransaction,
  approveTransaction,
  rejectTransaction,
  getPendingTransactions,
  getUserTransactions,
} from "../controllers/cryptoPaymentController";

const router = Router();

// Public routes

// Protected routes
router.post("/deposits", authenticateJWT, createTransaction);
router.post("/withdraw", authenticateJWT, createTransaction);
router.get("/deposits/user", authenticateJWT, getUserTransactions);
router.get("/deposits/pending", authenticateJWT, getPendingTransactions);
router.post(
  "/deposits/:transactionId/approve",
  authenticateJWT,
  approveTransaction
);
router.post(
  "/deposits/:transactionId/reject",
  authenticateJWT,
  rejectTransaction
);

export default router;
