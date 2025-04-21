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
        const user = await models_1.User.findById(userId)
            .select('-password')
            .populate('wallet')
            .populate('poolId');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
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
