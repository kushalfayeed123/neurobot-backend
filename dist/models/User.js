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
    derivToken: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    mode: { type: String, enum: ['managed', 'user-controlled'], default: 'managed' },
    isSubscribed: { type: Boolean, default: false }
}, { timestamps: true });
exports.default = mongoose_1.default.model('User', userSchema);
