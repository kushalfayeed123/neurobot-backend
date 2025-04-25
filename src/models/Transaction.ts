import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Transaction identification
  transactionId: { type: String, required: true, unique: true },
  // User reference
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Pool reference (if applicable)
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingPool' },
  // Crypto wallet reference (if applicable)
  cryptoWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'CryptoWallet' },
  // Transaction details
  type: { 
    type: String, 
    enum: ['DEPOSIT', 'WITHDRAWAL', 'PROFIT_DISTRIBUTION', 'FEE', 'REFUND', 'CRYPTO_DEPOSIT', 'CRYPTO_WITHDRAWAL'], 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { 
    type: String, 
    enum: ['USD', 'BTC', 'ETH', 'USDT', 'USDC'], 
    required: true 
  },
  // Transaction status
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'CONFIRMED', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  // Payment details
  paymentMethod: { type: String },
  paymentDetails: { type: Map, of: mongoose.Schema.Types.Mixed },
  // Crypto-specific fields
  senderAddress: { type: String },
  txHash: { type: String },
  usdValue: { type: Number },
  // Deriv API information (if applicable)
  derivTransactionId: { type: String },
  // Additional information
  description: { type: String },
  notes: { type: String },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  // Admin information
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date }
}, { timestamps: true });

// Create indexes for efficient querying
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ poolId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ txHash: 1 }, { unique: true, sparse: true });

export default mongoose.model('Transaction', transactionSchema); 