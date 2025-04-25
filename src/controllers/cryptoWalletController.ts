import { Request, Response } from 'express';
import { cryptoWalletService } from '../services/cryptoWalletService';
import { AuthRequest } from '../types/auth';

/**
 * Create a new crypto wallet
 */
export const createWallet = async (req: AuthRequest, res: Response) => {
  try {
  

    const wallet = await cryptoWalletService.createWallet( req.body);
    res.status(201).json(wallet);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create wallet' });
  }
};



/**
 * Get wallet by ID
 */
export const getWalletById = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params;
    const wallet = await cryptoWalletService.getWalletById(walletId);
    res.json(wallet);
  } catch (error) {
    res.status(404).json({ error: 'Wallet not found' });
  }
};



/**
 * Deactivate wallet (admin only)
 */
export const deactivateWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params;

    if (!req.user?.role || !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const wallet = await cryptoWalletService.deactivateWallet(walletId);
    res.json(wallet);
  } catch (error) {
    res.status(400).json({ error: 'Failed to deactivate wallet' });
  }
};

/**
 * Get available deposit wallets
 */
export const getAvailableWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await cryptoWalletService.getAvailableWallets();
    res.json(wallets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get wallet by currency and network
 */
export const getWalletByCurrencyAndNetwork = async (req: Request, res: Response) => {
  try {
    const { currency, network } = req.params;
    const wallet = await cryptoWalletService.getWalletByCurrencyAndNetwork(currency, network);
    res.json(wallet);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * Create a deposit transaction
 */
export const createDepositTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId, amount, txHash } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transaction = await cryptoWalletService.createDepositTransaction(
      userId,
      walletId,
      amount,
      txHash
    );

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get user's deposit transactions
 */
export const getUserDeposits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await cryptoWalletService.getUserDeposits(userId);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending deposits (admin only)
 */
export const getPendingDeposits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await cryptoWalletService.getPendingDeposits();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve a deposit (admin only)
 */
export const approveDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transaction = await cryptoWalletService.approveDeposit(transactionId, adminId);
    res.json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reject a deposit (admin only)
 */
export const rejectDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { notes } = req.body;
    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transaction = await cryptoWalletService.rejectDeposit(transactionId, adminId, notes);
    res.json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}; 