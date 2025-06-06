import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models';

/**
 * Middleware to authenticate API key
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get API key from header
    const apiKey = req.header('X-API-Key');
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Find API key in database
    const key = await ApiKey.findOne({ apiKey, isActive: true });
    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check if key has expired
    if (key.expiresAt && key.expiresAt < new Date()) {
      return res.status(401).json({ error: 'API key has expired' });
    }

    // Check IP whitelist if configured
    // if (key.ipWhitelist && key.ipWhitelist.length > 0) {
    //   const clientIp = req.ip || '';
    //   if (!key.ipWhitelist.includes(clientIp)) {
    //     return res.status(401).json({ error: 'IP not whitelisted' });
    //   }
    // }

    // Update usage statistics
    key.lastUsed = new Date();
    key.usageCount += 1;
    await key.save();

    // Add user ID to request
    (req as any).userId = key.userId;

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
}; 