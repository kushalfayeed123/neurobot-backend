import express from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import {
  createPool,
  findOrCreatePool,
  getPoolDetails,
  investInPool,
  withdrawFromPool,
  distributeProfits,
  getPoolPerformance
} from '../controllers/poolController';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Create a new pool (admin only)
router.post('/', createPool);

// Find or create a pool for the current user
router.post('/find-or-create', findOrCreatePool);

// Get pool details
router.get('/:poolId', getPoolDetails);

// Invest in a pool
router.post('/:poolId/invest', investInPool);

// Withdraw from a pool
router.post('/:poolId/withdraw', withdrawFromPool);

// Distribute profits
router.post('/:poolId/distribute', distributeProfits);

// Get pool performance
router.get('/:poolId/performance', getPoolPerformance);

export default router; 