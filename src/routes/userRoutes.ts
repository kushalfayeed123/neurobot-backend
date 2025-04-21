import express from 'express';
import { getAllUsers, getUserProfile, updateDerivToken } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();
router.get('/profile', authenticateJWT, getUserProfile);
router.post('/update-token', authenticateJWT, updateDerivToken);
router.get('/all', authenticateJWT, getAllUsers);

export default router;
