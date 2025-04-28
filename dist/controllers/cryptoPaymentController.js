"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectTransaction = exports.approveTransaction = exports.getPendingTransactions = exports.getUserTransactions = exports.createTransaction = void 0;
const cryptoPaymentService_1 = require("../services/cryptoPaymentService");
/**
 * Create a new crypto transaction
 */
const createTransaction = async (req, res) => {
    try {
        const { walletId, amount, txHash } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const transaction = await cryptoPaymentService_1.cryptoPaymentService.createTransaction(userId, walletId, amount, txHash);
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create transaction" });
    }
};
exports.createTransaction = createTransaction;
/**
 * Get user's crypto transactions
 */
const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const transactions = await cryptoPaymentService_1.cryptoPaymentService.getUserTransactions(userId.toString());
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user transactions" });
    }
};
exports.getUserTransactions = getUserTransactions;
/**
 * Get all pending transactions (admin only)
 */
const getPendingTransactions = async (req, res) => {
    try {
        const transactions = await cryptoPaymentService_1.cryptoPaymentService.getPendingTransactions();
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch pending transactions" });
    }
};
exports.getPendingTransactions = getPendingTransactions;
/**
 * Approve a crypto transaction (admin only)
 */
const approveTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await cryptoPaymentService_1.cryptoPaymentService.approveTransaction(transactionId);
        res.json(transaction);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to approve transaction" });
    }
};
exports.approveTransaction = approveTransaction;
/**
 * Reject a crypto transaction (admin only)
 */
const rejectTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { notes } = req.body;
        const transaction = await cryptoPaymentService_1.cryptoPaymentService.rejectTransaction(transactionId, notes);
        res.json(transaction);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to reject transaction" });
    }
};
exports.rejectTransaction = rejectTransaction;
