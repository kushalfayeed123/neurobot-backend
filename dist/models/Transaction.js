"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    // Transaction identification
    transactionId: { type: String, required: true, unique: true },
    // User reference
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    // Pool reference (if applicable)
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TradingPool' },
    // Transaction details
    type: {
        type: String,
        enum: ['DEPOSIT', 'WITHDRAWAL', 'PROFIT_DISTRIBUTION', 'FEE', 'REFUND'],
        required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    // Transaction status
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
        default: 'PENDING'
    },
    // Payment details
    paymentMethod: { type: String },
    paymentDetails: { type: Map, of: mongoose_1.default.Schema.Types.Mixed },
    // Deriv API information (if applicable)
    derivTransactionId: { type: String },
    // Additional information
    description: { type: String },
    metadata: { type: Map, of: mongoose_1.default.Schema.Types.Mixed },
    // Admin information
    processedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date }
}, { timestamps: true });
// Create indexes for efficient querying
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ poolId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ status: 1 });
exports.default = mongoose_1.default.model('Transaction', transactionSchema);
