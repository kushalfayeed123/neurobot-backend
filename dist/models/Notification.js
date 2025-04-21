"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    // Notification identification
    notificationId: { type: String, required: true, unique: true },
    // User reference
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    // Notification details
    type: {
        type: String,
        enum: [
            'TRADE_EXECUTED',
            'TRADE_CLOSED',
            'PROFIT_DISTRIBUTION',
            'DEPOSIT_RECEIVED',
            'WITHDRAWAL_PROCESSED',
            'BOT_STATUS_CHANGE',
            'SYSTEM_ALERT',
            'ACCOUNT_ALERT'
        ],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Notification status
    isRead: { type: Boolean, default: false },
    // Priority
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    // Related entities
    tradeId: { type: String },
    transactionId: { type: String },
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TradingPool' },
    // Action data
    actionUrl: { type: String },
    actionText: { type: String },
    // Additional data
    metadata: { type: Map, of: mongoose_1.default.Schema.Types.Mixed }
}, { timestamps: true });
// Create indexes for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ priority: 1, isRead: 1 });
exports.default = mongoose_1.default.model('Notification', notificationSchema);
