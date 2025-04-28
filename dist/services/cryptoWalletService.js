"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoWalletService = void 0;
const uuid_1 = require("uuid");
const CryptoWallet_1 = __importDefault(require("../models/CryptoWallet"));
class CryptoWalletService {
    /**
     * Create a new crypto wallet for a user
     */
    async createWallet(walletData) {
        try {
            // Check if wallet with same address exists
            const existingWallet = await CryptoWallet_1.default.findOne({ address: walletData.address });
            if (existingWallet) {
                throw new Error('Wallet address already exists');
            }
            // Create new wallet
            const wallet = new CryptoWallet_1.default({
                walletId: (0, uuid_1.v4)(),
                currency: walletData.currency,
                network: walletData.network,
                address: walletData.address,
                description: walletData.description,
                isActive: true
            });
            await wallet.save();
            return wallet;
        }
        catch (error) {
            throw new Error(`Failed to create crypto wallet: ${error.message}`);
        }
    }
    /**
     * Get wallet by ID
     */
    async getWalletById(walletId) {
        try {
            const wallet = await CryptoWallet_1.default.findById(walletId);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            return wallet;
        }
        catch (error) {
            throw new Error('Failed to fetch wallet');
        }
    }
    /**
     * Deactivate wallet
     */
    async deactivateWallet(walletId) {
        try {
            const wallet = await CryptoWallet_1.default.findById(walletId);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            wallet.isActive = false;
            await wallet.save();
            return wallet;
        }
        catch (error) {
            throw new Error('Failed to deactivate wallet');
        }
    }
    /**
     * Get available deposit wallets
     */
    async getAvailableWallets() {
        try {
            const wallets = await CryptoWallet_1.default.find({ isActive: true })
                .select('currency network address qrCode instructions minDeposit maxDeposit')
                .sort({ currency: 1, network: 1 })
                .lean();
            return wallets;
        }
        catch (error) {
            throw new Error(`Failed to fetch available wallets: ${error.message}`);
        }
    }
    /**
     * Get wallet by currency and network
     */
    async getWalletByCurrencyAndNetwork(currency, network) {
        try {
            const wallet = await CryptoWallet_1.default.findOne({
                currency,
                network,
                isActive: true
            });
            if (!wallet) {
                throw new Error(`No active wallet found for ${currency} on ${network}`);
            }
            return wallet;
        }
        catch (error) {
            throw new Error(`Failed to fetch wallet: ${error.message}`);
        }
    }
}
exports.cryptoWalletService = new CryptoWalletService();
