import { Request, Response } from 'express';
import userService from '../services/userService';
import { AuthRequest } from '../types/auth';



export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
     
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await userService.getUserProfile(userId);
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const updateDerivToken = async (req: any, res: Response) => {
  try {
    const { derivApiToken, derivAppId } = req.body;
    await userService.updateDerivToken(req.user.id, derivApiToken, derivAppId);
    res.json({ message: 'Deriv token updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req: any, res: Response) => {
  const user = req.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }

  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
