"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    tradingMode: { type: String, enum: ['self-managed', 'pooled'], default: 'pooled' },
    isActive: { type: Boolean, default: true },
    isSubscribed: { type: Boolean, default: false },
    lastLogin: { type: Date },
    // Pool reference
    poolId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TradingPool' },
    // Wallet reference
    wallet: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Wallet' },
    // For self-managed mode
    derivApiToken: { type: String },
    derivAppId: { type: String },
    // For pooled mode
    poolInvestment: { type: Number, default: 0 },
    poolSharePercentage: { type: Number, default: 0 },
    // Security
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });
// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.default = mongoose_1.default.model('User', userSchema);
