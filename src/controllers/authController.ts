import { Request, Response } from 'express';
import authService from '../services/authService';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const user = await authService.register(userData);
    res.status(201).json({ message: 'User registered', user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
