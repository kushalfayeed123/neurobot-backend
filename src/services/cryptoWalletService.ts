import { v4 as uuidv4 } from 'uuid';
import CryptoWallet from '../models/CryptoWallet';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { Types } from 'mongoose';
import { Wallet } from '../models';

class CryptoWalletService {
  /**
   * Create a new crypto wallet for a user
   */
  async createWallet( walletData: {
    currency: 'BTC' | 'ETH' | 'USDT' | 'USDC';
    network: 'Bitcoin' | 'Ethereum' | 'Tron' | 'Binance Smart Chain';
    address: string;
    description?: string;
  }) {
    try {
      

      // Check if wallet with same address exists
      const existingWallet = await CryptoWallet.findOne({ address: walletData.address });
      if (existingWallet) {
        throw new Error('Wallet address already exists');
      }

      // Create new wallet
      const wallet = new CryptoWallet({
        walletId: uuidv4(),
        currency: walletData.currency,
        network: walletData.network,
        address: walletData.address,
        description: walletData.description,
        isActive: true
      });

      await wallet.save();

   

      return wallet;
    } catch (error) {
      throw new Error(`Failed to create crypto wallet: ${(error as Error).message}`);
    }
  }


  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string) {
    try {
      const wallet = await CryptoWallet.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      return wallet;
    } catch (error) {
      throw new Error('Failed to fetch wallet');
    }
  }



  /**
   * Deactivate wallet
   */
  async deactivateWallet(walletId: string) {
    try {
      const wallet = await CryptoWallet.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      wallet.isActive = false;
      await wallet.save();

      return wallet;
    } catch (error) {
      throw new Error('Failed to deactivate wallet');
    }
  }

  /**
   * Get available deposit wallets
   */
  async getAvailableWallets() {
    try {
      const wallets = await CryptoWallet.find({ isActive: true })
        .select('currency network address qrCode instructions minDeposit maxDeposit')
        .sort({ currency: 1, network: 1 })
        .lean();
      
      return wallets;
    } catch (error: any) {
      throw new Error(`Failed to fetch available wallets: ${error.message}`);
    }
  }

  /**
   * Get wallet by currency and network
   */
  async getWalletByCurrencyAndNetwork(currency: string, network: string) {
    try {
      const wallet = await CryptoWallet.findOne({ 
        currency, 
        network, 
        isActive: true 
      });
      
      if (!wallet) {
        throw new Error(`No active wallet found for ${currency} on ${network}`);
      }
      
      return wallet;
    } catch (error: any) {
      throw new Error(`Failed to fetch wallet: ${error.message}`);
    }
  }

  /**
   * Create a transaction record for a deposit
   */
  async createDepositTransaction(userId: string, walletId: string, amount: number, txHash: string) {
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
      throw new Error(`Failed to create deposit transaction: ${error.message}`);
    }
  }

  /**
   * Get user's deposit transactions
   */
  async getUserDeposits(userId: string) {
    try {
      const transactions = await Transaction.find({ 
        userId: new Types.ObjectId(userId),
        type: 'CRYPTO_DEPOSIT'
      })
        .sort({ createdAt: -1 })
        .lean();
      
      return transactions;
    } catch (error: any) {
      throw new Error(`Failed to fetch user deposits: ${error.message}`);
    }
  }

  /**
   * Get pending deposits (admin only)
   */
  async getPendingDeposits() {
    try {
      const transactions = await Transaction.find({ 
        type: 'CRYPTO_DEPOSIT',
        status: 'PENDING'
      })
        .sort({ createdAt: -1 })
        .lean();
      
      return transactions;
    } catch (error: any) {
      throw new Error(`Failed to fetch pending deposits: ${error.message}`);
    }
  }

  /**
   * Approve a deposit (admin only)
   */
  async approveDeposit(transactionId: string, adminId: string) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'PENDING') {
        throw new Error('Transaction is not pending');
      }

      // Update transaction status
      transaction.status = 'APPROVED';
      transaction.processedBy = new Types.ObjectId(adminId);
      transaction.processedAt = new Date();
      await transaction.save();

      // Update wallet balance
      const wallet = await Wallet.findById(transaction.userId);
      if (wallet) {
        wallet.balance += transaction.amount;
        await wallet.save();
      }

      return transaction;
    } catch (error: any) {
      throw new Error(`Failed to approve deposit: ${error.message}`);
    }
  }

  /**
   * Reject a deposit (admin only)
   */
  async rejectDeposit(transactionId: string, adminId: string, notes: string) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'PENDING') {
        throw new Error('Transaction is not pending');
      }

      // Update transaction status
      transaction.status = 'REJECTED';
      transaction.processedBy = new Types.ObjectId(adminId);
      transaction.processedAt = new Date();
      transaction.notes = notes;
      await transaction.save();

      return transaction;
    } catch (error: any) {
      throw new Error(`Failed to reject deposit: ${error.message}`);
    }
  }
}

export const cryptoWalletService = new CryptoWalletService(); 