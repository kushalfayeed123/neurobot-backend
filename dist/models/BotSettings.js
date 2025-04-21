"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const botSettingsSchema = new mongoose_1.default.Schema({
    // User or pool reference
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TradingPool' },
    // Trading parameters
    symbol: { type: String, required: true },
    stake: { type: Number, required: true },
    contractDuration: { type: Number, required: true }, // in seconds
    contractType: { type: String, enum: ['CALL', 'PUT'], required: true },
    // Risk management
    maxDailyLoss: { type: Number },
    maxConsecutiveLosses: { type: Number },
    riskPercentage: { type: Number, default: 1 }, // percentage of capital per trade
    // Bot behavior
    isActive: { type: Boolean, default: true },
    autoRestart: { type: Boolean, default: true },
    // Trading schedule
    tradingHours: {
        start: { type: String }, // format: "HH:MM"
        end: { type: String }, // format: "HH:MM"
        timezone: { type: String, default: 'UTC' }
    },
    // Advanced settings
    strategy: { type: String, required: true },
    strategyParams: { type: Map, of: mongoose_1.default.Schema.Types.Mixed },
    // Performance tracking
    totalTrades: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    profitFactor: { type: Number, default: 0 }
}, { timestamps: true });
// Ensure either userId or poolId is provided, but not both
botSettingsSchema.pre('save', function (next) {
    if ((!this.userId && !this.poolId) || (this.userId && this.poolId)) {
        next(new Error('Either userId or poolId must be provided, but not both'));
    }
    next();
});
exports.default = mongoose_1.default.model('BotSettings', botSettingsSchema);
