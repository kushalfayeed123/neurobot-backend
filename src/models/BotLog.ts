import mongoose from 'mongoose';

const botLogSchema = new mongoose.Schema({
  // Log identification
  logId: { type: String, required: true, unique: true },
  // User or pool reference
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingPool' },
  // Log details
  level: { 
    type: String, 
    enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'], 
    required: true 
  },
  message: { type: String, required: true },
  // Bot information
  botId: { type: String, required: true },
  // Trade reference (if applicable)
  tradeId: { type: String },
  // Additional data
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  // Stack trace for errors
  stackTrace: { type: String }
}, { timestamps: true });

// Create indexes for efficient querying
botLogSchema.index({ userId: 1, createdAt: -1 });
botLogSchema.index({ poolId: 1, createdAt: -1 });
botLogSchema.index({ level: 1, createdAt: -1 });
botLogSchema.index({ botId: 1, createdAt: -1 });
botLogSchema.index({ tradeId: 1 });

export default mongoose.model('BotLog', botLogSchema); 