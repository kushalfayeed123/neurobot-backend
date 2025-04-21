"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const registerUser = async (req, res) => {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = new User_1.default({ email, passwordHash, firstName, lastName, phoneNumber });
    await user.save();
    res.status(201).json({ message: 'User registered' });
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user || !(await bcrypt_1.default.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || '', { expiresIn: '7d' });
    res.json({ token });
};
exports.loginUser = loginUser;
