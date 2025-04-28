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



  
  
  
}

export const cryptoWalletService = new CryptoWalletService(); 