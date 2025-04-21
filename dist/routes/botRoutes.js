"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const botService_1 = __importDefault(require("../services/botService"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route POST /api/bot/log
 * @desc Log bot activity
 * @access Private (API Key)
 */
router.post('/log', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const log = await botService_1.default.logActivity(req.body);
        res.json(log);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * @route POST /api/bot/settings
 * @desc Update bot settings
 * @access Private (API Key)
 */
router.post('/settings', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const settings = await botService_1.default.updateSettings(req.body);
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * @route GET /api/bot/settings/:botId
 * @desc Get bot settings
 * @access Private (API Key)
 */
router.get('/settings/:botId', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const { userId, poolId } = req.query;
        const settings = await botService_1.default.updateSettings({
            userId: userId,
            poolId: poolId,
            botId: req.params.botId,
            settings: {}
        });
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * @route POST /api/bot/trade
 * @desc Log trade execution
 * @access Private (API Key)
 */
router.post('/trade', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const trade = await botService_1.default.logTrade(req.body);
        res.json(trade);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * @route PUT /api/bot/trade/:tradeId
 * @desc Update trade result
 * @access Private (API Key)
 */
router.put('/trade/:tradeId', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const trade = await botService_1.default.updateTradeResult({
            tradeId: req.params.tradeId,
            ...req.body
        });
        res.json(trade);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * @route GET /api/bot/performance/:botId
 * @desc Get bot performance metrics
 * @access Private (API Key)
 */
router.get('/performance/:botId', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const { userId, poolId, startTime, endTime } = req.query;
        const metrics = await botService_1.default.getBotPerformance({
            userId: userId,
            poolId: poolId,
            botId: req.params.botId,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined
        });
        res.json(metrics);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
