"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDerivToken = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const getProfile = async (req, res) => {
    const user = await User_1.default.findById(req.user.id).select('-passwordHash');
    res.json(user);
};
exports.getProfile = getProfile;
const updateDerivToken = async (req, res) => {
    const { derivToken } = req.body;
    await User_1.default.findByIdAndUpdate(req.user.id, { derivToken });
    res.json({ message: 'Deriv token updated' });
};
exports.updateDerivToken = updateDerivToken;
