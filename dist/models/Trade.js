"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tradeSchema = new mongoose_1.default.Schema({
    // Trade identification
    tradeId: { type: String, required: true, unique: true },
    // User or pool reference
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TradingPool' },
    // Trade details
    symbol: { type: String, required: true },
    contractType: { type: String, enum: ['CALL', 'PUT'], required: true },
    stake: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    contractDuration: { type: Number, required: true }, // in seconds
    // Trade timing
    entryTime: { type: Date, required: true },
    exitTime: { type: Date },
    // Trade result
    status: {
        type: String,
        enum: ['PENDING', 'OPEN', 'CLOSED', 'CANCELLED', 'EXPIRED', 'FAILED'],
        default: 'PENDING'
    },
    result: {
        type: String,
        enum: ['WIN', 'LOSS', 'DRAW', null],
        default: null
    },
    profit: { type: Number, default: 0 },
    // Bot information
    botId: { type: String, required: true },
    strategy: { type: String, required: true },
    // Deriv API information
    derivTransactionId: { type: String },
    derivContractId: { type: String },
    // Additional data
    metadata: { type: Object, default: {} }
}, { timestamps: true });
// Create indexes for efficient querying
tradeSchema.index({ userId: 1, entryTime: -1 });
tradeSchema.index({ poolId: 1, entryTime: -1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ entryTime: -1 });
exports.default = mongoose_1.default.model('Trade', tradeSchema);
