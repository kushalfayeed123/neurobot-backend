"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const poolInvestmentSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TradingPool', required: true },
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
exports.default = mongoose_1.default.model('PoolInvestment', poolInvestmentSchema);
