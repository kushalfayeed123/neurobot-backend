import express from 'express';
import botRoutes from './botRoutes';
import poolRoutes from './poolRoutes';

const router = express.Router();

// Bot routes
router.use('/api/bot', botRoutes);

// Pool routes
router.use('/api/pools', poolRoutes);

export default router; 