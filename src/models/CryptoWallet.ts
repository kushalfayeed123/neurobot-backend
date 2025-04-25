import mongoose from 'mongoose';

const cryptoWalletSchema = new mongoose.Schema({
  // Wallet identification
  walletId: { type: String, required: true, unique: true },
  // Cryptocurrency details
  currency: { type: String, required: true },
  // Network details
  network: { type: String, required: true },
  // Wallet address
  address: { type: String, required: true, unique: true },
  // Wallet status
  isActive: { type: Boolean, default: true },
  // Balance tracking
  balance: { type: Number, default: 0 },
  // Additional information
  description: { type: String },
  // QR code for the address (optional)
  qrCode: { type: String },
  // Instructions for sending crypto
  instructions: { type: String },
  // Minimum deposit amount
  minDeposit: { type: Number, default: 0 },
  // Maximum deposit amount
  maxDeposit: { type: Number },
  // Metadata
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Create indexes for efficient querying
cryptoWalletSchema.index({ currency: 1, network: 1 });
cryptoWalletSchema.index({ isActive: 1 });

export default mongoose.model('CryptoWallet', cryptoWalletSchema); 