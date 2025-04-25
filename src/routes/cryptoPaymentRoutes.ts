import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import {
  getAvailableWallets,
  getWalletByCurrencyAndNetwork,
  createDepositTransaction,
  getUserDeposits,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit
} from '../controllers/cryptoWalletController';

const router = Router();

// Public routes

// Protected routes
router.post('/deposits', authenticateJWT, createDepositTransaction);
router.get('/deposits/user', authenticateJWT, getUserDeposits);
router.get('/deposits/pending', authenticateJWT, getPendingDeposits);
router.post('/deposits/:transactionId/approve', authenticateJWT, approveDeposit);
router.post('/deposits/:transactionId/reject', authenticateJWT, rejectDeposit);

export default router; 