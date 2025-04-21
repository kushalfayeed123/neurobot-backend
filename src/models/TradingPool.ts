import mongoose from 'mongoose';

const tradingPoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  // Pool configuration
  totalCapital: { type: Number, default: 0 },
  activeCapital: { type: Number, default: 0 },
  minInvestment: { type: Number, default: 100 },
  maxInvestment: { type: Number },
  maxUsers: { type: Number, default: 50 },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Performance metrics
  totalPnL: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  // Pool status
  isActive: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  // Fee structure
  managementFeePercentage: { type: Number, default: 2 },
  performanceFeePercentage: { type: Number, default: 20 },
  // Deriv account for pooled trading
  derivApiToken: { type: String },
  derivAppId: { type: String },
  // Pool statistics
  totalInvestors: { type: Number, default: 0 },
  lastProfitDistribution: { type: Date },
  // Admin settings
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('TradingPool', tradingPoolSchema); 