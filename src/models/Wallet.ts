import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  // User reference
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // Wallet details
  balance: { type: Number, default: 0 },
  currency: { type: String, required: true },
  // Pool reference (if user is in a pool)
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingPool', required: false },
  // Transaction history
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  // Wallet status
  isActive: { type: Boolean, default: true },
  // Additional data
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  // For self-managed mode
  derivBalance: { type: Number, default: 0 },
  // For pooled mode
  poolContribution: { type: Number, default: 0 },
  poolSharePercentage: { type: Number, default: 0 },
  // Performance tracking
  totalDeposits: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 },
  totalPnL: { type: Number, default: 0 },
  // Status
  isLocked: { type: Boolean, default: false },
  
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for efficient querying
walletSchema.index({ userId: 1 });
walletSchema.index({ poolId: 1 });
walletSchema.index({ balance: 1 });

export default mongoose.model('Wallet', walletSchema);
