"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoPaymentService = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const CryptoWallet_1 = __importDefault(require("../models/CryptoWallet"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = require("mongoose");
class CryptoPaymentService {
    /**
     * Get available crypto wallets for deposits
     */
    async getAvailableWallets() {
        try {
            const wallets = await CryptoWallet_1.default.find({ isActive: true })
                .select('currency address network')
                .lean();
            return wallets;
        }
        catch (error) {
            throw new Error('Failed to fetch available wallets');
        }
    }
    /**
     * Create a new crypto transaction
     */
    async createTransaction(userId, transactionData) {
        try {
            const user = await User_1.default.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const wallet = await CryptoWallet_1.default.findOne({
                currency: transactionData.currency,
                isActive: true
            });
            if (!wallet) {
                throw new Error('Invalid currency or wallet not available');
            }
            const transaction = new Transaction_1.default({
                userId: new mongoose_1.Types.ObjectId(userId),
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
        }
        catch (error) {
            throw new Error('Failed to create transaction');
        }
    }
    /**
     * Get user's crypto transactions
     */
    async getUserTransactions(userId) {
        try {
            const transactions = await Transaction_1.default.find({
                userId: new mongoose_1.Types.ObjectId(userId),
                type: { $in: ['CRYPTO_DEPOSIT', 'CRYPTO_WITHDRAWAL'] }
            })
                .sort({ createdAt: -1 })
                .lean();
            return transactions;
        }
        catch (error) {
            throw new Error('Failed to fetch user transactions');
        }
    }
    /**
     * Get all pending transactions (for admin)
     */
    async getPendingTransactions() {
        try {
            const transactions = await Transaction_1.default.find({
                status: 'PENDING',
                type: { $in: ['CRYPTO_DEPOSIT', 'CRYPTO_WITHDRAWAL'] }
            })
                .sort({ createdAt: -1 })
                .lean();
            return transactions;
        }
        catch (error) {
            throw new Error('Failed to fetch pending transactions');
        }
    }
    /**
     * Approve a crypto transaction
     */
    async approveTransaction(transactionId) {
        try {
            const transaction = await Transaction_1.default.findById(transactionId);
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            if (transaction.status !== 'PENDING') {
                throw new Error('Transaction is not pending');
            }
            transaction.status = 'APPROVED';
            await transaction.save();
            // Update user's wallet balance
            const user = await User_1.default.findById(transaction.userId);
            if (!user) {
                throw new Error('User not found');
            }
            const wallet = await CryptoWallet_1.default.findOne({
                userId: user._id,
                currency: transaction.currency
            });
            if (!wallet) {
                throw new Error('User wallet not found');
            }
            wallet.balance += transaction.amount;
            await wallet.save();
            return transaction;
        }
        catch (error) {
            throw new Error('Failed to approve transaction');
        }
    }
    /**
     * Reject a crypto transaction
     */
    async rejectTransaction(transactionId, notes) {
        try {
            const transaction = await Transaction_1.default.findById(transactionId);
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
        }
        catch (error) {
            throw new Error('Failed to reject transaction');
        }
    }
}
exports.cryptoPaymentService = new CryptoPaymentService();
