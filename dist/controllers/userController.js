"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateDerivToken = exports.getUserProfile = void 0;
const userService_1 = __importDefault(require("../services/userService"));
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await userService_1.default.getUserProfile(userId);
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserProfile = getUserProfile;
const updateDerivToken = async (req, res) => {
    try {
        const { derivApiToken, derivAppId } = req.body;
        await userService_1.default.updateDerivToken(req.user.id, derivApiToken, derivAppId);
        res.json({ message: 'Deriv token updated' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateDerivToken = updateDerivToken;
const getAllUsers = async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    try {
        const users = await userService_1.default.getAllUsers();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
