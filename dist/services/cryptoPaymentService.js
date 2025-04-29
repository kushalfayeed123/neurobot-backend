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
const models_1 = require("../models");
const uuid_1 = require("uuid");
class CryptoPaymentService {
    /**
     * Get available crypto wallets for deposits
     */
    async getAvailableWallets() {
        try {
            const wallets = await CryptoWallet_1.default.find({ isActive: true })
                .select("currency address network")
                .lean();
            return wallets;
        }
        catch (error) {
            throw new Error("Failed to fetch available wallets");
        }
    }
    /**
     * Create a new crypto transaction
     */
    async createTransaction(userId, walletId, amount, txHash, type, beneficiaryAccountNumber, beneficiaryWalletAddress) {
        try {
            // Check if user exists
            const user = await User_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            // Get wallet details
            const wallet = await CryptoWallet_1.default.findById(walletId);
            if (!wallet) {
                throw new Error("Wallet not found");
            }
            // Validate amount based on transaction type
            if (type === "DEPOSIT") {
                if (wallet.minDeposit && amount < wallet.minDeposit) {
                    throw new Error(`Minimum deposit amount is ${wallet.minDeposit} ${wallet.currency}`);
                }
                if (wallet.maxDeposit && amount > wallet.maxDeposit) {
                    throw new Error(`Maximum deposit amount is ${wallet.maxDeposit} ${wallet.currency}`);
                }
            }
            else if (type === "WITHDRAWAL") {
                if (wallet.minWithdrawal && amount < wallet.minWithdrawal) {
                    throw new Error(`Minimum withdrawal amount is ${wallet.minWithdrawal} ${wallet.currency}`);
                }
                if (wallet.maxWithdrawal && amount > wallet.maxWithdrawal) {
                    throw new Error(`Maximum withdrawal amount is ${wallet.maxWithdrawal} ${wallet.currency}`);
                }
            }
            else {
                throw new Error("Invalid transaction type");
            }
            // Check if transaction hash already exists
            // Prepare transaction fields
            const transactionType = type === "DEPOSIT" ? "CRYPTO_DEPOSIT" : "CRYPTO_WITHDRAWAL";
            const description = type === "DEPOSIT"
                ? `Deposit of ${amount} ${wallet.currency} to ${wallet.network} address`
                : `Withdrawal of ${amount} ${wallet.currency} from ${wallet.network} address`;
            // Create transaction record
            const transaction = new Transaction_1.default({
                transactionId: (0, uuid_1.v4)(),
                userId: new mongoose_1.Types.ObjectId(userId),
                cryptoWalletId: wallet._id,
                type: transactionType,
                amount,
                currency: wallet.currency,
                status: "PENDING",
                txHash,
                description,
                paymentMethod: "CRYPTO",
                beneficiaryAccountNumber: beneficiaryAccountNumber,
                beneficiaryWalletAddress: beneficiaryWalletAddress,
                paymentDetails: {
                    network: wallet.network,
                    address: wallet.address,
                },
            });
            await transaction.save();
            return transaction;
        }
        catch (error) {
            console.error(error);
            throw new Error(`Failed to create transaction: ${error}`);
        }
    }
    /**
     * Get user's crypto transactions
     */
    async getUserTransactions(userId) {
        try {
            const transactions = await Transaction_1.default.find({
                userId: new mongoose_1.Types.ObjectId(userId),
                type: { $in: ["CRYPTO_DEPOSIT", "CRYPTO_WITHDRAWAL"] },
            })
                .sort({ createdAt: -1 })
                .lean();
            return transactions;
        }
        catch (error) {
            throw new Error("Failed to fetch user transactions");
        }
    }
    /**
     * Get all pending transactions (for admin)
     */
    async getPendingTransactions() {
        try {
            const transactions = await Transaction_1.default.find({
                status: "PENDING",
                type: { $in: ["CRYPTO_DEPOSIT", "CRYPTO_WITHDRAWAL"] },
            })
                .sort({ createdAt: -1 })
                .lean();
            return transactions;
        }
        catch (error) {
            throw new Error("Failed to fetch pending transactions");
        }
    }
    /**
     * Approve a crypto transaction
     */
    async approveTransaction(transactionId) {
        try {
            const transaction = await Transaction_1.default.findOne({ transactionId });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            if (transaction.status !== "PENDING") {
                throw new Error("Transaction is not pending");
            }
            const user = await User_1.default.findById(transaction.userId);
            if (!user) {
                throw new Error("User not found");
            }
            const wallet = await models_1.Wallet.findOne({ userId: transaction.userId });
            if (!wallet) {
                throw new Error("User wallet not found");
            }
            // Apply balance update based on transaction type
            if (transaction.type.includes("DEPOSIT")) {
                wallet.balance += transaction.amount;
            }
            else if (transaction.type.includes("WITHDRAWAL")) {
                if (wallet.balance < transaction.amount) {
                    throw new Error("Insufficient balance for withdrawal");
                }
                wallet.balance -= transaction.amount;
            }
            transaction.status = "APPROVED";
            await transaction.save();
            await wallet.save();
            return transaction;
        }
        catch (error) {
            console.log(error);
            throw new Error("Failed to approve transaction");
        }
    }
    /**
     * Reject a crypto transaction
     */
    async rejectTransaction(transactionId, notes) {
        try {
            const transaction = await Transaction_1.default.findOne({ transactionId });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            if (transaction.status !== "PENDING") {
                throw new Error("Transaction is not pending");
            }
            transaction.status = "REJECTED";
            transaction.notes = notes;
            await transaction.save();
            return transaction;
        }
        catch (error) {
            throw new Error("Failed to reject transaction");
        }
    }
}
exports.cryptoPaymentService = new CryptoPaymentService();
