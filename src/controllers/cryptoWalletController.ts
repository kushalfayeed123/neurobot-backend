import { Request, Response } from "express";
import { cryptoWalletService } from "../services/cryptoWalletService";
import { AuthRequest } from "../types/auth";

/**
 * Create a new crypto wallet
 */
export const createWallet = async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await cryptoWalletService.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create wallet" });
  }
};

/**
 * Get wallet by ID
 */
export const getWalletById = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params;
    const wallet = await cryptoWalletService.getWalletById(walletId);
    res.json(wallet);
  } catch (error) {
    res.status(404).json({ error: "Wallet not found" });
  }
};

/**
 * Deactivate wallet (admin only)
 */
export const deactivateWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params;

    if (!req.user?.role || !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const wallet = await cryptoWalletService.deactivateWallet(walletId);
    res.json(wallet);
  } catch (error) {
    res.status(400).json({ error: "Failed to deactivate wallet" });
  }
};

/**
 * Get available deposit wallets
 */
export const getAvailableWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await cryptoWalletService.getAvailableWallets();
    res.json(wallets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get wallet by currency and network
 */
export const getWalletByCurrencyAndNetwork = async (
  req: Request,
  res: Response
) => {
  try {
    const { currency, network } = req.params;
    const wallet = await cryptoWalletService.getWalletByCurrencyAndNetwork(
      currency,
      network
    );
    res.json(wallet);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
