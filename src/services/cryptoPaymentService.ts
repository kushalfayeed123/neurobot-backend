import Transaction from '../models/Transaction';
import CryptoWallet from '../models/CryptoWallet';
import User from '../models/User';
import { Types } from 'mongoose';

class CryptoPaymentService {
  /**
   * Get available crypto wallets for deposits
   */
  async getAvailableWallets() {
    try {
      const wallets = await CryptoWallet.find({ isActive: true })
        .select('currency address network')
        .lean();
      return wallets;
    } catch (error) {
      throw new Error('Failed to fetch available wallets');
    }
  }

  /**
   * Create a new crypto transaction
   */
  async createTransaction(userId: string, transactionData: {
    amount: number;
    currency: string;
    senderAddress: string;
    transactionHash: string;
  }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const wallet = await CryptoWallet.findOne({
        currency: transactionData.currency,
        isActive: true
      });

      if (!wallet) {
        throw new Error('Invalid currency or wallet not available');
      }

      const transaction = new Transaction({
        userId: new Types.ObjectId(userId),
        amount: transactionData.amount,
        currency: transactionData.currency,
        senderAddress: transactionData.senderAddress,
        type: 'CRYPTO_DEPOSIT',
        status: 'PENDING',
        txHash: transactionData.transactionHash,
        paymentMethod: 'CRYPTO',
        paymentDetails: {
          network: wallet.network,
          receiverAddress: wallet.address
        }
      });

      await transaction.save();
      return transaction;
    } catch (error) {
      throw new Error('Failed to create transaction');
    }
  }

  /**
   * Get user's crypto transactions
   */
  async getUserTransactions(userId: string) {
    try {
      const transactions = await Transaction.find({ 
        userId: new Types.ObjectId(userId),
        type: { $in: ['CRYPTO_DEPOSIT', 'CRYPTO_WITHDRAWAL'] }
      })
        .sort({ createdAt: -1 })
        .lean();
      return transactions;
    } catch (error) {
      throw new Error('Failed to fetch user transactions');
    }
  }

  /**
   * Get all pending transactions (for admin)
   */
  async getPendingTransactions() {
    try {
      const transactions = await Transaction.find({ 
        status: 'PENDING',
        type: { $in: ['CRYPTO_DEPOSIT', 'CRYPTO_WITHDRAWAL'] }
      })
        .sort({ createdAt: -1 })
        .lean();
      return transactions;
    } catch (error) {
      throw new Error('Failed to fetch pending transactions');
    }
  }

  /**
   * Approve a crypto transaction
   */
  async approveTransaction(transactionId: string) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'PENDING') {
        throw new Error('Transaction is not pending');
      }

      transaction.status = 'APPROVED';
      await transaction.save();

      // Update user's wallet balance
      const user = await User.findById(transaction.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const wallet = await CryptoWallet.findOne({
        userId: user._id,
        currency: transaction.currency
      });

      if (!wallet) {
        throw new Error('User wallet not found');
      }

      wallet.balance += transaction.amount;
      await wallet.save();

      return transaction;
    } catch (error) {
      throw new Error('Failed to approve transaction');
    }
  }

  /**
   * Reject a crypto transaction
   */
  async rejectTransaction(transactionId: string, notes: string) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'PENDING') {
        throw new Error('Transaction is not pending');
      }

      transaction.status = 'REJECTED';
      transaction.notes = notes;
      await transaction.save();

      return transaction;
    } catch (error) {
      throw new Error('Failed to reject transaction');
    }
  }
}

export const cryptoPaymentService = new CryptoPaymentService(); 