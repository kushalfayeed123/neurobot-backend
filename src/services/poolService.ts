import { TradingPool, PoolInvestment, Transaction, ProfitDistribution, User, Wallet } from '../models';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

/**
 * Service for managing trading pool operations
 */
class PoolService {
  /**
   * Create a new trading pool
   * @param poolData Pool creation data
   * @returns Created pool
   */
  async createPool(poolData: {
    name: string;
    description: string;
    minInvestment: number;
    maxInvestment?: number;
    maxUsers?: number;
    managementFeePercentage: number;
    performanceFeePercentage: number;
    createdBy: string;
    managedBy: string;
  }) {
    const pool = new TradingPool({
      ...poolData,
      poolId: uuidv4(),
      isActive: true,
      totalCapital: 0,
      activeCapital: 0,
      totalPnL: 0,
      totalTrades: 0,
      winRate: 0,
      totalInvestors: 0
    });

    await pool.save();
    return pool;
  }

  /**
   * Get pool details
   * @param poolId Pool ID
   * @returns Pool details
   */
  async getPoolDetails(poolId: string) {
    const pool = await TradingPool.findById(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }
    return pool;
  }

  /**
   * Find an existing pool with space or create a new one
   * @param userId User ID to assign to pool
   * @returns Pool ID
   */
  async findOrCreatePoolForUser(userId: string): Promise<string> {
    // Find a pool with less than 50 users
    const pool = await TradingPool.findOne({
      $expr: { $lt: [{ $size: "$users" }, 50] }
    });

    if (pool) {
      // Add user to existing pool
      pool.users.push(new mongoose.Types.ObjectId(userId));
      await pool.save();
      return pool._id.toString();
    }

    // Create new pool if none found
    const newPool = await this.createPool({
      name: `Trading Pool ${Date.now()}`,
      description: 'Auto-created trading pool',
      minInvestment: 100,
      maxUsers: 50,
      managementFeePercentage: 2,
      performanceFeePercentage: 20,
      createdBy: userId,
      managedBy: userId
    });

    // Add user to new pool
    newPool.users.push(new mongoose.Types.ObjectId(userId));
    await newPool.save();

    // Update user with pool ID
    await User.findByIdAndUpdate(userId, { poolId: newPool._id });

    return newPool._id.toString();
  }

  /**
   * Invest in pool
   * @param userId User ID
   * @param poolId Pool ID
   * @param amount Investment amount
   * @returns Investment details
   */
  async investInPool(userId: string, poolId: string, amount: number) {
    // Get pool details
    const pool = await TradingPool.findById(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    // Validate investment amount
    if (amount < pool.minInvestment) {
      throw new Error(`Minimum investment amount is ${pool.minInvestment}`);
    }
    if (pool.maxInvestment && amount > pool.maxInvestment) {
      throw new Error(`Maximum investment amount is ${pool.maxInvestment}`);
    }

    // Check if user already has an investment
    let investment = await PoolInvestment.findOne({ userId, poolId });
    const isNewInvestor = !investment;

    // Calculate share percentage
    const newTotalCapital = pool.totalCapital + amount;
    const sharePercentage = (amount / newTotalCapital) * 100;

    // Create or update investment
    if (isNewInvestor) {
      investment = new PoolInvestment({
        userId,
        poolId,
        amount,
        sharePercentage,
        isActive: true,
        totalPnL: 0,
        totalFees: 0
      });
      pool.totalInvestors += 1;
    } else {
      investment!.amount += amount;
      investment!.sharePercentage = sharePercentage;
    }

    // Create transaction
    const transaction = new Transaction({
      transactionId: uuidv4(),
      userId,
      poolId,
      type: 'DEPOSIT',
      amount,
      status: 'COMPLETED',
      description: `Investment in pool ${pool.name}`
    });

    // Update pool
    pool.totalCapital = newTotalCapital;
    pool.activeCapital = newTotalCapital;

    // Update user's pool investment
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(userId, {
      poolInvestment: (isNewInvestor ? amount : (user?.poolInvestment || 0) + amount),
      poolSharePercentage: sharePercentage
    });

    // Update or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: amount,
        poolId: poolId as any
      });
    } else {
      wallet.balance += amount;
      wallet.poolId = poolId as any;
    }

    // Save all changes
    await Promise.all([
      investment!.save(),
      transaction.save(),
      pool.save(),
      wallet.save()
    ]);

    return {
      investment,
      transaction,
      wallet
    };
  }

  /**
   * Withdraw from pool
   * @param userId User ID
   * @param poolId Pool ID
   * @param amount Withdrawal amount
   * @returns Withdrawal details
   */
  async withdrawFromPool(userId: string, poolId: string, amount: number) {
    // Get investment details
    const investment = await PoolInvestment.findOne({ userId, poolId });
    if (!investment) {
      throw new Error('No investment found in this pool');
    }

    // Validate withdrawal amount
    if (amount > investment.amount) {
      throw new Error('Insufficient investment balance');
    }

    // Get pool details
    const pool = await TradingPool.findById(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    // Calculate new share percentage
    const newInvestmentAmount = investment.amount - amount;
    const newTotalCapital = pool.totalCapital - amount;
    const newSharePercentage = newInvestmentAmount > 0 ? (newInvestmentAmount / newTotalCapital) * 100 : 0;

    // Create transaction
    const transaction = new Transaction({
      transactionId: uuidv4(),
      userId,
      poolId,
      type: 'WITHDRAWAL',
      amount,
      status: 'PENDING',
      description: `Withdrawal from pool ${pool.name}`
    });

    // Update investment
    investment.amount = newInvestmentAmount;
    investment.sharePercentage = newSharePercentage;
    if (newInvestmentAmount === 0) {
      investment.isActive = false;
      pool.totalInvestors -= 1;
    }

    // Update pool
    pool.totalCapital = newTotalCapital;
    pool.activeCapital = newTotalCapital;

    // Update user's pool investment
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(userId, {
      poolInvestment: newInvestmentAmount,
      poolSharePercentage: newSharePercentage
    });

    // Update wallet
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      wallet.balance -= amount;
      if (newInvestmentAmount === 0) {
        wallet.poolId = undefined;
      }
      await wallet.save();
    }

    // Save all changes
    await Promise.all([
      investment.save(),
      transaction.save(),
      pool.save()
    ]);

    return {
      investment,
      transaction,
      wallet
    };
  }

  /**
   * Distribute profits
   * @param poolId Pool ID
   * @param profitData Profit distribution data
   * @returns Distribution details
   */
  async distributeProfits(poolId: string, profitData: {
    totalProfit: number;
    startDate: Date;
    endDate: Date;
    createdBy: string;
  }) {
    // Get pool details
    const pool = await TradingPool.findById(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    // Calculate fees
    const managementFee = (pool.totalCapital * pool.managementFeePercentage) / 100;
    const performanceFee = (profitData.totalProfit * pool.performanceFeePercentage) / 100;
    const totalFees = managementFee + performanceFee;
    const netProfit = profitData.totalProfit - totalFees;

    // Get all active investments
    const investments = await PoolInvestment.find({
      poolId,
      isActive: true
    });

    // Create distribution
    const distribution = new ProfitDistribution({
      distributionId: uuidv4(),
      poolId,
      totalProfit: profitData.totalProfit,
      totalFees,
      netProfit,
      startDate: profitData.startDate,
      endDate: profitData.endDate,
      status: 'PENDING',
      createdBy: profitData.createdBy,
      distributionDetails: []
    });

    // Calculate and distribute profits
    for (const investment of investments) {
      const profitShare = (netProfit * investment.sharePercentage) / 100;
      const feeShare = (totalFees * investment.sharePercentage) / 100;

      // Create transaction for profit distribution
      const transaction = new Transaction({
        transactionId: uuidv4(),
        userId: investment.userId,
        poolId,
        type: 'PROFIT_DISTRIBUTION',
        amount: profitShare,
        status: 'PENDING',
        description: `Profit distribution from pool ${pool.name}`
      });

      await transaction.save();

      // Add to distribution details
      distribution.distributionDetails.push({
        userId: investment.userId,
        sharePercentage: investment.sharePercentage,
        profitAmount: profitShare,
        feeAmount: feeShare,
        netAmount: profitShare,
        status: 'PENDING',
        transactionId: transaction.transactionId
      });

      // Update investment
      investment.totalPnL += profitShare;
      investment.totalFees += feeShare;
      await investment.save();

      // Update user's pool investment
      const user = await User.findById(investment.userId);
      await User.findByIdAndUpdate(investment.userId, {
        poolInvestment: investment.amount + profitShare
      });

      // Update wallet
      const wallet = await Wallet.findOne({ userId: investment.userId });
      if (wallet) {
        wallet.balance += profitShare;
        await wallet.save();
      }
    }

    // Update pool
    pool.totalPnL += profitData.totalProfit;
    await pool.save();

    // Save distribution
    await distribution.save();

    return distribution;
  }

  /**
   * Get pool performance metrics
   * @param poolId Pool ID
   * @returns Performance metrics
   */
  async getPoolPerformance(poolId: string) {
    const pool = await TradingPool.findById(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    const metrics = {
      totalCapital: pool.totalCapital,
      activeCapital: pool.activeCapital,
      totalPnL: pool.totalPnL,
      totalTrades: pool.totalTrades,
      winRate: pool.winRate,
      totalInvestors: pool.totalInvestors,
      roi: (pool.totalPnL / pool.totalCapital) * 100
    };

    return metrics;
  }
}

export default new PoolService(); 