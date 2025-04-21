"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tradingPoolSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    description: { type: String },
    // Pool configuration
    totalCapital: { type: Number, default: 0 },
    activeCapital: { type: Number, default: 0 },
    minInvestment: { type: Number, default: 100 },
    maxInvestment: { type: Number },
    maxUsers: { type: Number, default: 50 },
    users: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
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
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    managedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
exports.default = mongoose_1.default.model('TradingPool', tradingPoolSchema);
