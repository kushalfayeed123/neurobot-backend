import Transaction from '../models/Transaction';
import CryptoWallet from '../models/CryptoWallet';
import User from '../models/User';
import { Types } from 'mongoose';
import { Wallet } from '../models';
import { v4 as uuidv4 } from 'uuid';


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
  async createTransaction(userId: string, walletId: string, amount: number, txHash: string) {
    
      try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
  
        // Get wallet details
        const wallet = await CryptoWallet.findById(walletId);
        if (!wallet) {
          throw new Error('Wallet not found');
        }
  
        // Validate deposit amount
        if (wallet.minDeposit && amount < wallet.minDeposit) {
          throw new Error(`Minimum deposit amount is ${wallet.minDeposit} ${wallet.currency}`);
        }
        
        if (wallet.maxDeposit && amount > wallet.maxDeposit) {
          throw new Error(`Maximum deposit amount is ${wallet.maxDeposit} ${wallet.currency}`);
        }
  
        // Check if transaction hash already exists
        const existingTx = await Transaction.findOne({ txHash });
        if (existingTx) {
          throw new Error('Transaction hash already exists');
        }
  
        // Create transaction record
        const transaction = new Transaction({
          transactionId: uuidv4(),
          userId: new Types.ObjectId(userId),
          cryptoWalletId: wallet._id,
          type: 'CRYPTO_DEPOSIT',
          amount,
          currency: wallet.currency,
          status: 'PENDING',
          txHash,
          description: `Deposit of ${amount} ${wallet.currency} to ${wallet.network} address`,
          paymentMethod: 'CRYPTO',
          paymentDetails: {
            network: wallet.network,
            address: wallet.address
          }
        });
  
        await transaction.save();
        return transaction;
      } catch (error: any) {
        console.log(error)
        throw new Error(`Failed to create deposit transaction: ${error}`);
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
      const transaction = await Transaction.findOne({transactionId});
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

      const wallet = await Wallet.findOne({
        userId: transaction.userId,
      });

      if (!wallet) {
        throw new Error('User wallet not found');
      }

      wallet.balance += transaction.amount;
      await wallet.save();

      return transaction;
    } catch (error) {
      console.log(error)
      throw new Error('Failed to approve transaction');
    }
  }

  /**
   * Reject a crypto transaction
   */
  async rejectTransaction(transactionId: string, notes: string) {
    try {
      const transaction = await Transaction.findOne({transactionId});
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


