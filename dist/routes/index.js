"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const botRoutes_1 = __importDefault(require("./botRoutes"));
const poolRoutes_1 = __importDefault(require("./poolRoutes"));
const cryptoWalletRoutes_1 = __importDefault(require("./cryptoWalletRoutes"));
const cryptoPaymentRoutes_1 = __importDefault(require("./cryptoPaymentRoutes"));
const router = express_1.default.Router();
// Bot routes
router.use('/api/bot', botRoutes_1.default);
// Pool routes
router.use('/api/pools', poolRoutes_1.default);
// Crypto wallet routes
router.use('/api/crypto', cryptoWalletRoutes_1.default);
// Crypto payment routes    
router.use('/api/crypto', cryptoPaymentRoutes_1.default);
exports.default = router;
