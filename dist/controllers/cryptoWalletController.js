"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletByCurrencyAndNetwork = exports.getAvailableWallets = exports.deactivateWallet = exports.getWalletById = exports.createWallet = void 0;
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
        res.status(400).json({ error: error.message || "Failed to create wallet" });
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
        res.status(404).json({ error: "Wallet not found" });
    }
};
exports.getWalletById = getWalletById;
/**
 * Deactivate wallet (admin only)
 */
const deactivateWallet = async (req, res) => {
    try {
        const { walletId } = req.params;
        if (!req.user?.role || !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const wallet = await cryptoWalletService_1.cryptoWalletService.deactivateWallet(walletId);
        res.json(wallet);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to deactivate wallet" });
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
