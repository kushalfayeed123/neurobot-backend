"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const poolController_1 = require("../controllers/poolController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authenticateJWT);
// Create a new pool (admin only)
router.post('/', poolController_1.createPool);
// Find or create a pool for the current user
router.post('/find-or-create', poolController_1.findOrCreatePool);
// Get pool details
router.get('/:poolId', poolController_1.getPoolDetails);
// Invest in a pool
router.post('/:poolId/invest', poolController_1.investInPool);
// Withdraw from a pool
router.post('/:poolId/withdraw', poolController_1.withdrawFromPool);
// Distribute profits
router.post('/:poolId/distribute', poolController_1.distributeProfits);
// Get pool performance
router.get('/:poolId/performance', poolController_1.getPoolPerformance);
exports.default = router;
