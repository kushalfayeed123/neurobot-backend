"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class UserService {
    /**
     * Get user profile with wallet and pool data
     * @param userId User ID
     * @returns User profile with populated wallet and pool data
     */
    async getUserProfile(userId) {
        try {
            const user = await models_1.User.findById(userId)
                .select('-passwordHash')
                .populate({
                path: 'wallet',
                select: 'balance currency isActive poolContribution poolSharePercentage totalPnL'
            })
                .populate({
                path: 'poolId',
                select: 'name totalCapital activeCapital totalPnL totalTrades winRate isActive'
            });
            if (!user) {
                throw new Error('User not found');
            }
            // Transform the user object to ensure consistent response format
            const userProfile = user.toObject();
            // Ensure wallet and pool data are properly structured even if null
            userProfile.wallet = userProfile.wallet || {
                balance: 0,
                currency: 'USD',
                isActive: true,
                poolContribution: 0,
                poolSharePercentage: 0,
                totalPnL: 0
            };
            userProfile.pool = userProfile.poolId || null;
            delete userProfile.poolId; // Remove the old poolId field
            return userProfile;
        }
        catch (error) {
            console.error('Error in getUserProfile:', error);
            throw error;
        }
    }
    /**
     * Get all users (admin only)
     * @returns List of users without sensitive data
     */
    async getAllUsers() {
        return models_1.User.find().select('-passwordHash');
    }
    /**
     * Update user's Deriv API token
     * @param userId User ID
     * @param derivApiToken Deriv API token
     * @param derivAppId Deriv App ID
     */
    async updateDerivToken(userId, derivApiToken, derivAppId) {
        await models_1.User.findByIdAndUpdate(userId, {
            derivApiToken,
            derivAppId
        });
    }
}
exports.default = new UserService();
