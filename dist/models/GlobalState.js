"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const globalStateSchema = new mongoose_1.default.Schema({
    totalCapital: { type: Number, default: 0 },
    totalPnL: { type: Number, default: 0 },
    lastTradeTime: { type: Date, default: Date.now }
}, { timestamps: true });
exports.default = mongoose_1.default.model('GlobalState', globalStateSchema);
