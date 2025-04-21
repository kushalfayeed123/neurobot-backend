"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/profile', authMiddleware_1.authenticateJWT, userController_1.getUserProfile);
router.post('/update-token', authMiddleware_1.authenticateJWT, userController_1.updateDerivToken);
router.get('/all', authMiddleware_1.authenticateJWT, userController_1.getAllUsers);
exports.default = router;
