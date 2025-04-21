"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const capitalSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    pnl: { type: Number, default: 0 }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Capital', capitalSchema);
