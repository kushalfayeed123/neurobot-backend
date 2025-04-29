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
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Pool reference (if applicable)
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "TradingPool" },
    // Crypto wallet reference (if applicable)
    cryptoWalletId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "CryptoWallet",
    },
    // Transaction details
    type: {
        type: String,
        enum: [
            "DEPOSIT",
            "WITHDRAWAL",
            "PROFIT_DISTRIBUTION",
            "FEE",
            "REFUND",
            "CRYPTO_DEPOSIT",
            "CRYPTO_WITHDRAWAL",
        ],
        required: true,
    },
    amount: { type: Number, required: true },
    currency: {
        type: String,
        enum: ["USD", "BTC", "ETH", "USDT", "USDC"],
        required: true,
    },
    // Transaction status
    status: {
        type: String,
        enum: [
            "PENDING",
            "COMPLETED",
            "FAILED",
            "CANCELLED",
            "CONFIRMED",
            "APPROVED",
            "REJECTED",
        ],
        default: "PENDING",
    },
    beneficiaryAccountNumber: { type: String },
    beneficiaryWalletAddress: { type: String },
    // Payment details
    paymentMethod: { type: String },
    paymentDetails: { type: Map, of: mongoose_1.default.Schema.Types.Mixed },
    // Crypto-specific fields
    senderAddress: { type: String },
    txHash: { type: String },
    usdValue: { type: Number },
    // Deriv API information (if applicable)
    derivTransactionId: { type: String },
    // Additional information
    description: { type: String },
    notes: { type: String },
    metadata: { type: Map, of: mongoose_1.default.Schema.Types.Mixed },
    // Admin information
    processedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
}, { timestamps: true });
// Create indexes for efficient querying
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ poolId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ txHash: 1 }, { unique: true, sparse: true });
// transactionSchema.pre("validate", function (next) {
//   if (
//     this.type?.toString().includes("WITHDRAWAL") &&
//     (!this.beneficiaryAccountNumber || !this.beneficiaryWalletAddress)
//   ) {
//     return next(
//       new Error(
//         "Withdrawal must include a beneficiary account number or wallet address"
//       )
//     );
//   }
//   next();
// });
exports.default = mongoose_1.default.model("Transaction", transactionSchema);
