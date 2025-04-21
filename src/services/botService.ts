import { Trade, BotSettings, BotLog, User, TradingPool, Notification } from '../models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing bot operations and logging
 */
class BotService {
  /**
   * Log bot activity
   * @param logData Log data
   * @returns Created log entry
   */
  async logActivity(logData: {
    userId?: string;
    poolId?: string;
    level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    message: string;
    botId: string;
    tradeId?: string;
    metadata?: Record<string, any>;
    stackTrace?: string;
  }) {
    const log = new BotLog({
      logId: uuidv4(),
      ...logData
    });

    await log.save();

    // If error or critical, create notification
    if (logData.level === 'ERROR' || logData.level === 'CRITICAL') {
      const notification = new Notification({
        notificationId: uuidv4(),
        userId: logData.userId,
        type: 'BOT_STATUS_CHANGE',
        title: `Bot ${logData.level.toLowerCase()} alert`,
        message: logData.message,
        priority: logData.level === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        metadata: logData.metadata
      });

      await notification.save();
    }

    return log;
  }

  /**
   * Update bot settings
   * @param settingsData Bot settings data
   * @returns Updated settings
   */
  async updateSettings(settingsData: {
    userId?: string;
    poolId?: string;
    botId: string;
    settings: Partial<{
      symbol: string;
      stake: number;
      contractDuration: number;
      contractType: 'CALL' | 'PUT';
      maxDailyLoss: number;
      maxConsecutiveLosses: number;
      riskPercentage: number;
      isActive: boolean;
      autoRestart: boolean;
      tradingHours: {
        start: string;
        end: string;
        timezone: string;
      };
      strategy: string;
      strategyParams: Record<string, any>;
    }>;
  }) {
    const { userId, poolId, botId, settings } = settingsData;

    // Find existing settings
    let botSettings = await BotSettings.findOne({
      $or: [
        { userId, botId },
        { poolId, botId }
      ]
    });

    if (!botSettings) {
      // Create new settings if not found
      botSettings = new BotSettings({
        userId,
        poolId,
        botId,
        ...settings
      });
    } else {
      // Update existing settings
      Object.assign(botSettings, settings);
    }

    await botSettings.save();
    return botSettings;
  }

  /**
   * Log trade execution
   * @param tradeData Trade data
   * @returns Created trade record
   */
  async logTrade(tradeData: {
    userId?: string;
    poolId?: string;
    symbol: string;
    contractType: 'CALL' | 'PUT';
    stake: number;
    entryPrice: number;
    contractDuration: number;
    botId: string;
    strategy: string;
    metadata?: Record<string, any>;
  }) {
    const trade = new Trade({
      tradeId: uuidv4(),
      ...tradeData,
      status: 'OPEN',
      entryTime: new Date()
    });

    await trade.save();

    // Log trade execution
    await this.logActivity({
      userId: tradeData.userId,
      poolId: tradeData.poolId,
      level: 'INFO',
      message: `Trade executed: ${tradeData.contractType} ${tradeData.symbol} at ${tradeData.entryPrice}`,
      botId: tradeData.botId,
      tradeId: trade.tradeId,
      metadata: tradeData.metadata
    });

    return trade;
  }

  /**
   * Update trade result
   * @param tradeData Trade update data
   * @returns Updated trade
   */
  async updateTradeResult(tradeData: {
    tradeId: string;
    exitPrice: number;
    profit: number;
    result: 'WIN' | 'LOSS' | 'DRAW';
    metadata?: Record<string, any>;
  }) {
    const trade = await Trade.findOne({ tradeId: tradeData.tradeId });
    if (!trade) {
      throw new Error('Trade not found');
    }

    trade.exitPrice = tradeData.exitPrice;
    trade.profit = tradeData.profit;
    trade.result = tradeData.result;
    trade.status = 'CLOSED';
    trade.exitTime = new Date();
    if (tradeData.metadata) {
      trade.metadata = tradeData.metadata;
    }

    await trade.save();

    // Log trade result
    await this.logActivity({
      userId: trade.userId?.toString(),
      poolId: trade.poolId?.toString(),
      level: 'INFO',
      message: `Trade closed: ${trade.contractType} ${trade.symbol} with ${tradeData.result}, profit: ${tradeData.profit}`,
      botId: trade.botId,
      tradeId: trade.tradeId,
      metadata: tradeData.metadata
    });

    return trade;
  }

  /**
   * Get bot performance metrics
   * @param queryParams Query parameters
   * @returns Performance metrics
   */
  async getBotPerformance(queryParams: {
    userId?: string;
    poolId?: string;
    botId: string;
    startTime?: Date;
    endTime?: Date;
  }) {
    const { userId, poolId, botId, startTime, endTime } = queryParams;

    // Build query
    const query: any = {
      botId,
      status: 'CLOSED'
    };

    if (userId) query.userId = userId;
    if (poolId) query.poolId = poolId;
    if (startTime || endTime) {
      query.exitTime = {};
      if (startTime) query.exitTime.$gte = startTime;
      if (endTime) query.exitTime.$lte = endTime;
    }

    // Get trades
    const trades = await Trade.find(query);

    // Calculate metrics
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.result === 'WIN').length;
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const profitableTrades = trades.filter(t => (t.profit || 0) > 0).length;

    return {
      totalTrades,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalProfit,
      profitableTrades,
      averageProfit: totalTrades > 0 ? totalProfit / totalTrades : 0,
      profitFactor: totalTrades > 0 ? profitableTrades / totalTrades : 0
    };
  }
}

export default new BotService(); 