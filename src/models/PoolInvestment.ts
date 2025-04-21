import mongoose from 'mongoose';

const poolInvestmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingPool', required: true },
  amount: { type: Number, required: true },
  sharePercentage: { type: Number, required: true },
  // Investment status
  isActive: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  // Performance tracking
  totalPnL: { type: Number, default: 0 },
  totalFees: { type: Number, default: 0 },
  // Investment history
  depositHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    transactionId: { type: String }
  }],
  withdrawalHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    transactionId: { type: String }
  }],
  // Last profit distribution
  lastProfitDistribution: { type: Date },
  lastProfitAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Create compound index for unique user-pool combination
poolInvestmentSchema.index({ userId: 1, poolId: 1 }, { unique: true });

export default mongoose.model('PoolInvestment', poolInvestmentSchema); 