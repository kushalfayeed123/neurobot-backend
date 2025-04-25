import express from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import {
  createWallet,
  getWalletById,
  deactivateWallet,
  getAvailableWallets,
  getWalletByCurrencyAndNetwork
} from '../controllers/cryptoWalletController';

const router = express.Router();

// All routes require authentication
// router.use(authenticateJWT);

// User routes
router.post('/wallets', createWallet);
router.get('/wallets/:walletId', getWalletById);
router.get('/wallets', getAvailableWallets);
router.get('/wallets/:currency/:network', getWalletByCurrencyAndNetwork);


// Admin routes
router.post('/wallets/:walletId/deactivate', deactivateWallet);

export default router; 