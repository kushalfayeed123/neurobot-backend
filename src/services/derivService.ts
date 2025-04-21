import axios from 'axios';
import { User, Trade, BotSettings } from '../models';

/**
 * Service for managing Deriv API connections and trading operations
 */
class DerivService {
  private readonly DERIV_API_URL = 'https://api.deriv.com';

  /**
   * Validate Deriv API token
   * @param token Deriv API token
   * @returns Validation result
   */
  async validateToken(token: string) {
    try {
      const response = await axios.post(this.DERIV_API_URL, {
        authorize: token
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data;
    } catch (error) {
      throw new Error('Failed to validate Deriv API token');
    }
  }

  /**
   * Connect user's Deriv account
   * @param userId User ID
   * @param token Deriv API token
   * @param appId Deriv app ID
   * @returns Updated user data
   */
  async connectDerivAccount(userId: string, token: string, appId: string) {
    // Validate token
    await this.validateToken(token);

    // Update user's Deriv credentials
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.derivApiToken = token;
    user.derivAppId = appId;
    await user.save();

    return { message: 'Deriv account connected successfully' };
  }

  /**
   * Disconnect user's Deriv account
   * @param userId User ID
   * @returns Success message
   */
  async disconnectDerivAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.derivApiToken = undefined;
    user.derivAppId = undefined;
    await user.save();

    return { message: 'Deriv account disconnected successfully' };
  }

  /**
   * Place a trade on Deriv
   * @param userId User ID or pool ID
   * @param tradeParams Trade parameters
   * @returns Trade result
   */
  async placeTrade(userId: string, tradeParams: {
    symbol: string;
    contractType: 'CALL' | 'PUT';
    stake: number;
    duration: number;
  }) {
    // Get user's Deriv credentials
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.derivApiToken) {
      throw new Error('Deriv account not connected');
    }

    try {
      // Create trade in database
      const trade = new Trade({
        userId,
        symbol: tradeParams.symbol,
        contractType: tradeParams.contractType,
        stake: tradeParams.stake,
        contractDuration: tradeParams.duration,
        status: 'PENDING',
        entryTime: new Date()
      });

      // Place trade on Deriv
      const response = await axios.post(this.DERIV_API_URL, {
        authorize: user.derivApiToken,
        buy: 1,
        parameters: {
          contract_type: tradeParams.contractType,
          symbol: tradeParams.symbol,
          amount: tradeParams.stake,
          duration: tradeParams.duration,
          duration_unit: 's'
        }
      });

      if (response.data.error) {
        trade.status = 'FAILED';
        await trade.save();
        throw new Error(response.data.error.message);
      }

      // Update trade with Deriv contract details
      trade.derivContractId = response.data.buy.contract_id;
      trade.derivTransactionId = response.data.buy.transaction_id;
      trade.status = 'OPEN';
      await trade.save();

      return trade;
    } catch (error) {
      throw new Error('Failed to place trade');
    }
  }

  /**
   * Get account balance from Deriv
   * @param userId User ID
   * @returns Account balance
   */
  async getAccountBalance(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.derivApiToken) {
      throw new Error('Deriv account not connected');
    }

    try {
      const response = await axios.post(this.DERIV_API_URL, {
        authorize: user.derivApiToken,
        balance: 1
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.balance;
    } catch (error) {
      throw new Error('Failed to get account balance');
    }
  }

  /**
   * Get trade history from Deriv
   * @param userId User ID
   * @param startTime Start time
   * @param endTime End time
   * @returns Trade history
   */
  async getTradeHistory(userId: string, startTime: Date, endTime: Date) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.derivApiToken) {
      throw new Error('Deriv account not connected');
    }

    try {
      const response = await axios.post(this.DERIV_API_URL, {
        authorize: user.derivApiToken,
        statement: 1,
        description: 1,
        limit: 100,
        date_from: startTime.getTime() / 1000,
        date_to: endTime.getTime() / 1000
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.statement.transactions;
    } catch (error) {
      throw new Error('Failed to get trade history');
    }
  }
}

export default new DerivService(); 