"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const botLogSchema = new mongoose_1.default.Schema({
    // Log identification
    logId: { type: String, required: true, unique: true },
    // User or pool reference
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TradingPool' },
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
    metadata: { type: Map, of: mongoose_1.default.Schema.Types.Mixed },
    // Stack trace for errors
    stackTrace: { type: String }
}, { timestamps: true });
// Create indexes for efficient querying
botLogSchema.index({ userId: 1, createdAt: -1 });
botLogSchema.index({ poolId: 1, createdAt: -1 });
botLogSchema.index({ level: 1, createdAt: -1 });
botLogSchema.index({ botId: 1, createdAt: -1 });
botLogSchema.index({ tradeId: 1 });
exports.default = mongoose_1.default.model('BotLog', botLogSchema);
