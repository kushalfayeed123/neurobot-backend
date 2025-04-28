"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectDeposit = exports.approveDeposit = exports.getPendingDeposits = exports.getUserDeposits = exports.createDepositTransaction = exports.getWalletByCurrencyAndNetwork = exports.getAvailableWallets = exports.deactivateWallet = exports.getWalletById = exports.createWallet = void 0;
const cryptoWalletService_1 = require("../services/cryptoWalletService");
/**
 * Create a new crypto wallet
 */
const createWallet = async (req, res) => {
    try {
        const wallet = await cryptoWalletService_1.cryptoWalletService.createWallet(req.body);
        res.status(201).json(wallet);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create wallet' });
    }
};
exports.createWallet = createWallet;
/**
 * Get wallet by ID
 */
const getWalletById = async (req, res) => {
    try {
        const { walletId } = req.params;
        const wallet = await cryptoWalletService_1.cryptoWalletService.getWalletById(walletId);
        res.json(wallet);
    }
    catch (error) {
        res.status(404).json({ error: 'Wallet not found' });
    }
};
exports.getWalletById = getWalletById;
/**
 * Deactivate wallet (admin only)
 */
const deactivateWallet = async (req, res) => {
    try {
        const { walletId } = req.params;
        if (!req.user?.role || !['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const wallet = await cryptoWalletService_1.cryptoWalletService.deactivateWallet(walletId);
        res.json(wallet);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to deactivate wallet' });
    }
};
exports.deactivateWallet = deactivateWallet;
/**
 * Get available deposit wallets
 */
const getAvailableWallets = async (req, res) => {
    try {
        const wallets = await cryptoWalletService_1.cryptoWalletService.getAvailableWallets();
        res.json(wallets);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAvailableWallets = getAvailableWallets;
/**
 * Get wallet by currency and network
 */
const getWalletByCurrencyAndNetwork = async (req, res) => {
    try {
        const { currency, network } = req.params;
        const wallet = await cryptoWalletService_1.cryptoWalletService.getWalletByCurrencyAndNetwork(currency, network);
        res.json(wallet);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.getWalletByCurrencyAndNetwork = getWalletByCurrencyAndNetwork;
/**
 * Create a deposit transaction
 */
const createDepositTransaction = async (req, res) => {
    try {
        const { walletId, amount, txHash } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const transaction = await cryptoWalletService_1.cryptoWalletService.createDepositTransaction(userId, walletId, amount, txHash);
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createDepositTransaction = createDepositTransaction;
/**
 * Get user's deposit transactions
 */
const getUserDeposits = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const transactions = await cryptoWalletService_1.cryptoWalletService.getUserDeposits(userId);
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserDeposits = getUserDeposits;
/**
 * Get pending deposits (admin only)
 */
const getPendingDeposits = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const transactions = await cryptoWalletService_1.cryptoWalletService.getPendingDeposits();
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPendingDeposits = getPendingDeposits;
/**
 * Approve a deposit (admin only)
 */
const approveDeposit = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const adminId = req.user?.userId;
        if (!adminId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const transaction = await cryptoWalletService_1.cryptoWalletService.approveDeposit(transactionId, adminId);
        res.json(transaction);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.approveDeposit = approveDeposit;
/**
 * Reject a deposit (admin only)
 */
const rejectDeposit = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { notes } = req.body;
        const adminId = req.user?.userId;
        if (!adminId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const transaction = await cryptoWalletService_1.cryptoWalletService.rejectDeposit(transactionId, adminId, notes);
        res.json(transaction);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.rejectDeposit = rejectDeposit;
