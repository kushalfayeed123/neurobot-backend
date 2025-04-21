import { User } from '../models';

class UserService {
  /**
   * Get user profile with wallet and pool data
   * @param userId User ID
   * @returns User profile with populated wallet and pool data
   */
  async getUserProfile(userId: string) {
    const user = await User.findById(userId)
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
    return User.find().select('-passwordHash');
  }

  /**
   * Update user's Deriv API token
   * @param userId User ID
   * @param derivApiToken Deriv API token
   * @param derivAppId Deriv App ID
   */
  async updateDerivToken(userId: string, derivApiToken: string, derivAppId: string) {
    await User.findByIdAndUpdate(userId, { 
      derivApiToken,
      derivAppId
    });
  }
}

export default new UserService(); 