"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const authService_1 = __importDefault(require("../services/authService"));
const registerUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await authService_1.default.register(userData);
        res.status(201).json({ message: 'User registered', user });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService_1.default.login(email, password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
};
exports.loginUser = loginUser;
