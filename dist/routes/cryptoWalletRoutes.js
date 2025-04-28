"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cryptoWalletController_1 = require("../controllers/cryptoWalletController");
const router = express_1.default.Router();
// All routes require authentication
// router.use(authenticateJWT);
// User routes
router.post('/wallets', cryptoWalletController_1.createWallet);
router.get('/wallets/:walletId', cryptoWalletController_1.getWalletById);
router.get('/wallets', cryptoWalletController_1.getAvailableWallets);
router.get('/wallets/:currency/:network', cryptoWalletController_1.getWalletByCurrencyAndNetwork);
// Admin routes
router.post('/wallets/:walletId/deactivate', cryptoWalletController_1.deactivateWallet);
exports.default = router;
