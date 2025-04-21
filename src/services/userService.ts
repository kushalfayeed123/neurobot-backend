import { User } from '../models';

interface WalletData {
  balance: number;
  currency: string;
  isActive: boolean;
  poolContribution: number;
  poolSharePercentage: number;
  totalPnL: number;
}

interface UserProfile {
  wallet: WalletData;
  pool: any | null;
  [key: string]: any;
}

class UserService {
  /**
   * Get user profile with wallet and pool data
   * @param userId User ID
   * @returns User profile with populated wallet and pool data
   */
  async getUserProfile(userId: string) {
    try {
      const user = await User.findById(userId)
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
      const userProfile = user.toObject() as UserProfile;
      
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
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
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