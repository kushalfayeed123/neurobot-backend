"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Service for managing trading pool operations
 */
class PoolService {
    /**
     * Create a new trading pool
     * @param poolData Pool creation data
     * @returns Created pool
     */
    async createPool(poolData) {
        const pool = new models_1.TradingPool({
            ...poolData,
            poolId: (0, uuid_1.v4)(),
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
    async getPoolDetails(poolId) {
        const pool = await models_1.TradingPool.findById(poolId);
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
    async findOrCreatePoolForUser(userId) {
        // Find a pool with less than 50 users
        const pool = await models_1.TradingPool.findOne({
            $expr: { $lt: [{ $size: "$users" }, 50] }
        });
        if (pool) {
            // Add user to existing pool
            pool.users.push(new mongoose_1.default.Types.ObjectId(userId));
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
        newPool.users.push(new mongoose_1.default.Types.ObjectId(userId));
        await newPool.save();
        // Update user with pool ID
        await models_1.User.findByIdAndUpdate(userId, { poolId: newPool._id });
        return newPool._id.toString();
    }
    /**
     * Invest in pool
     * @param userId User ID
     * @param poolId Pool ID
     * @param amount Investment amount
     * @returns Investment details
     */
    async investInPool(userId, poolId, amount) {
        // Get pool details
        const pool = await models_1.TradingPool.findById(poolId);
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
        let investment = await models_1.PoolInvestment.findOne({ userId, poolId });
        const isNewInvestor = !investment;
        // Calculate share percentage
        const newTotalCapital = pool.totalCapital + amount;
        const sharePercentage = (amount / newTotalCapital) * 100;
        // Create or update investment
        if (isNewInvestor) {
            investment = new models_1.PoolInvestment({
                userId,
                poolId,
                amount,
                sharePercentage,
                isActive: true,
                totalPnL: 0,
                totalFees: 0
            });
            pool.totalInvestors += 1;
        }
        else {
            investment.amount += amount;
            investment.sharePercentage = sharePercentage;
        }
        // Create transaction
        const transaction = new models_1.Transaction({
            transactionId: (0, uuid_1.v4)(),
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
        const user = await models_1.User.findById(userId);
        await models_1.User.findByIdAndUpdate(userId, {
            poolInvestment: (isNewInvestor ? amount : (user?.poolInvestment || 0) + amount),
            poolSharePercentage: sharePercentage
        });
        // Update or create wallet
        let wallet = await models_1.Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new models_1.Wallet({
                userId,
                balance: amount,
                poolId: poolId
            });
        }
        else {
            wallet.balance += amount;
            wallet.poolId = poolId;
        }
        // Save all changes
        await Promise.all([
            investment.save(),
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
    async withdrawFromPool(userId, poolId, amount) {
        // Get investment details
        const investment = await models_1.PoolInvestment.findOne({ userId, poolId });
        if (!investment) {
            throw new Error('No investment found in this pool');
        }
        // Validate withdrawal amount
        if (amount > investment.amount) {
            throw new Error('Insufficient investment balance');
        }
        // Get pool details
        const pool = await models_1.TradingPool.findById(poolId);
        if (!pool) {
            throw new Error('Pool not found');
        }
        // Calculate new share percentage
        const newInvestmentAmount = investment.amount - amount;
        const newTotalCapital = pool.totalCapital - amount;
        const newSharePercentage = newInvestmentAmount > 0 ? (newInvestmentAmount / newTotalCapital) * 100 : 0;
        // Create transaction
        const transaction = new models_1.Transaction({
            transactionId: (0, uuid_1.v4)(),
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
        const user = await models_1.User.findById(userId);
        await models_1.User.findByIdAndUpdate(userId, {
            poolInvestment: newInvestmentAmount,
            poolSharePercentage: newSharePercentage
        });
        // Update wallet
        const wallet = await models_1.Wallet.findOne({ userId });
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
    async distributeProfits(poolId, profitData) {
        // Get pool details
        const pool = await models_1.TradingPool.findById(poolId);
        if (!pool) {
            throw new Error('Pool not found');
        }
        // Calculate fees
        const managementFee = (pool.totalCapital * pool.managementFeePercentage) / 100;
        const performanceFee = (profitData.totalProfit * pool.performanceFeePercentage) / 100;
        const totalFees = managementFee + performanceFee;
        const netProfit = profitData.totalProfit - totalFees;
        // Get all active investments
        const investments = await models_1.PoolInvestment.find({
            poolId,
            isActive: true
        });
        // Create distribution
        const distribution = new models_1.ProfitDistribution({
            distributionId: (0, uuid_1.v4)(),
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
            const transaction = new models_1.Transaction({
                transactionId: (0, uuid_1.v4)(),
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
            const user = await models_1.User.findById(investment.userId);
            await models_1.User.findByIdAndUpdate(investment.userId, {
                poolInvestment: investment.amount + profitShare
            });
            // Update wallet
            const wallet = await models_1.Wallet.findOne({ userId: investment.userId });
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
    async getPoolPerformance(poolId) {
        const pool = await models_1.TradingPool.findById(poolId);
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
exports.default = new PoolService();
