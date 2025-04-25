import { Request, Response } from 'express';
import { cryptoPaymentService } from '../services/cryptoPaymentService';
import { AuthRequest } from '../types/auth';



/**
 * Create a new crypto transaction
 */
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transaction = await cryptoPaymentService.createTransaction(userId.toString(), req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create transaction' });
  }
};

/**
 * Get user's crypto transactions
 */
export const getUserTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await cryptoPaymentService.getUserTransactions(userId.toString());
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
};

/**
 * Get all pending transactions (admin only)
 */
export const getPendingTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await cryptoPaymentService.getPendingTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending transactions' });
  }
};

/**
 * Approve a crypto transaction (admin only)
 */
export const approveTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const transaction = await cryptoPaymentService.approveTransaction(transactionId);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: 'Failed to approve transaction' });
  }
};

/**
 * Reject a crypto transaction (admin only)
 */
export const rejectTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { notes } = req.body;
    const transaction = await cryptoPaymentService.rejectTransaction(transactionId, notes);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: 'Failed to reject transaction' });
  }
}; 