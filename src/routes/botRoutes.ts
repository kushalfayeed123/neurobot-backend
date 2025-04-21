import express from 'express';
import botService from '../services/botService';
import { authenticateApiKey } from '../middlewares/auth';

const router = express.Router();

/**
 * @route POST /api/bot/log
 * @desc Log bot activity
 * @access Private (API Key)
 */
router.post('/log', authenticateApiKey, async (req, res) => {
  try {
    const log = await botService.logActivity(req.body);
    res.json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/bot/settings
 * @desc Update bot settings
 * @access Private (API Key)
 */
router.post('/settings', authenticateApiKey, async (req, res) => {
  try {
    const settings = await botService.updateSettings(req.body);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/bot/settings/:botId
 * @desc Get bot settings
 * @access Private (API Key)
 */
router.get('/settings/:botId', authenticateApiKey, async (req, res) => {
  try {
    const { userId, poolId } = req.query;
    const settings = await botService.updateSettings({
      userId: userId as string,
      poolId: poolId as string,
      botId: req.params.botId,
      settings: {}
    });
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/bot/trade
 * @desc Log trade execution
 * @access Private (API Key)
 */
router.post('/trade', authenticateApiKey, async (req, res) => {
  try {
    const trade = await botService.logTrade(req.body);
    res.json(trade);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/bot/trade/:tradeId
 * @desc Update trade result
 * @access Private (API Key)
 */
router.put('/trade/:tradeId', authenticateApiKey, async (req, res) => {
  try {
    const trade = await botService.updateTradeResult({
      tradeId: req.params.tradeId,
      ...req.body
    });
    res.json(trade);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/bot/performance/:botId
 * @desc Get bot performance metrics
 * @access Private (API Key)
 */
router.get('/performance/:botId', authenticateApiKey, async (req, res) => {
  try {
    const { userId, poolId, startTime, endTime } = req.query;
    const metrics = await botService.getBotPerformance({
      userId: userId as string,
      poolId: poolId as string,
      botId: req.params.botId,
      startTime: startTime ? new Date(startTime as string) : undefined,
      endTime: endTime ? new Date(endTime as string) : undefined
    });
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 