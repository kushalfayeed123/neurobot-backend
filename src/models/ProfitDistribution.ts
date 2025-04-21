import mongoose from 'mongoose';

const profitDistributionSchema = new mongoose.Schema({
  // Distribution identification
  distributionId: { type: String, required: true, unique: true },
  // Pool reference
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingPool', required: true },
  // Distribution details
  totalProfit: { type: Number, required: true },
  totalFees: { type: Number, required: true },
  netProfit: { type: Number, required: true },
  // Time period
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  // Distribution status
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  // Distribution details
  distributionDetails: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharePercentage: { type: Number, required: true },
    profitAmount: { type: Number, required: true },
    feeAmount: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'COMPLETED', 'FAILED'], 
      default: 'PENDING' 
    },
    transactionId: { type: String }
  }],
  // Admin information
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  processedAt: { type: Date }
}, { timestamps: true });

// Create indexes for efficient querying
profitDistributionSchema.index({ poolId: 1, createdAt: -1 });
profitDistributionSchema.index({ status: 1 });
profitDistributionSchema.index({ 'distributionDetails.userId': 1 });

export default mongoose.model('ProfitDistribution', profitDistributionSchema); 