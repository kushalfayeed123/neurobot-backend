import express from 'express';
import botRoutes from './botRoutes';
import poolRoutes from './poolRoutes';
import cryptoWalletRoutes from './cryptoWalletRoutes';
import cryptoPaymentRoutes from './cryptoPaymentRoutes';
const router = express.Router();

// Bot routes
router.use('/api/bot', botRoutes);

// Pool routes
router.use('/api/pools', poolRoutes);

// Crypto wallet routes
router.use('/api/crypto', cryptoWalletRoutes);

// Crypto payment routes    
router.use('/api/crypto', cryptoPaymentRoutes);

export default router; 