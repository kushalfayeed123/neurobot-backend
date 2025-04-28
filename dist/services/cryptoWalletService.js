"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoWalletService = void 0;
const uuid_1 = require("uuid");
const CryptoWallet_1 = __importDefault(require("../models/CryptoWallet"));
const User_1 = __importDefault(require("../models/User"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
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
    /**
     * Create a transaction record for a deposit
     */
    async createDepositTransaction(userId, walletId, amount, txHash) {
        try {
            // Check if user exists
            const user = await User_1.default.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Get wallet details
            const wallet = await CryptoWallet_1.default.findById(walletId);
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
            const existingTx = await Transaction_1.default.findOne({ txHash });
            if (existingTx) {
                throw new Error('Transaction hash already exists');
            }
            // Create transaction record
            const transaction = new Transaction_1.default({
                transactionId: (0, uuid_1.v4)(),
                userId: new mongoose_1.Types.ObjectId(userId),
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
        }
        catch (error) {
            throw new Error(`Failed to create deposit transaction: ${error.message}`);
        }
    }
    /**
     * Get user's deposit transactions
     */
    async getUserDeposits(userId) {
        try {
            const transactions = await Transaction_1.default.find({
                userId: new mongoose_1.Types.ObjectId(userId),
                type: 'CRYPTO_DEPOSIT'
            })
                .sort({ createdAt: -1 })
                .lean();
            return transactions;
        }
        catch (error) {
            throw new Error(`Failed to fetch user deposits: ${error.message}`);
        }
    }
    /**
     * Get pending deposits (admin only)
     */
    async getPendingDeposits() {
        try {
            const transactions = await Transaction_1.default.find({
                type: 'CRYPTO_DEPOSIT',
                status: 'PENDING'
            })
                .sort({ createdAt: -1 })
                .lean();
            return transactions;
        }
        catch (error) {
            throw new Error(`Failed to fetch pending deposits: ${error.message}`);
        }
    }
    /**
     * Approve a deposit (admin only)
     */
    async approveDeposit(transactionId, adminId) {
        try {
            const transaction = await Transaction_1.default.findOne({ transactionId });
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            if (transaction.status !== 'PENDING') {
                throw new Error('Transaction is not pending');
            }
            // Update transaction status
            transaction.status = 'APPROVED';
            transaction.processedBy = new mongoose_1.Types.ObjectId(adminId);
            transaction.processedAt = new Date();
            await transaction.save();
            // Update wallet balance
            const wallet = await models_1.Wallet.findById(transaction.userId);
            if (wallet) {
                wallet.balance += transaction.amount;
                await wallet.save();
            }
            return transaction;
        }
        catch (error) {
            throw new Error(`Failed to approve deposit: ${error.message}`);
        }
    }
    /**
     * Reject a deposit (admin only)
     */
    async rejectDeposit(transactionId, adminId, notes) {
        try {
            const transaction = await Transaction_1.default.findById(transactionId);
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            if (transaction.status !== 'PENDING') {
                throw new Error('Transaction is not pending');
            }
            // Update transaction status
            transaction.status = 'REJECTED';
            transaction.processedBy = new mongoose_1.Types.ObjectId(adminId);
            transaction.processedAt = new Date();
            transaction.notes = notes;
            await transaction.save();
            return transaction;
        }
        catch (error) {
            throw new Error(`Failed to reject deposit: ${error.message}`);
        }
    }
}
exports.cryptoWalletService = new CryptoWalletService();
