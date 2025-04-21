import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { User, Wallet } from '../models';
import { RoleType } from '../models/Role';
import poolService from './poolService';
import mongoose from 'mongoose';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Authentication service for user registration, login, and token management
 */
class AuthService {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Created user object (without password)
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    tradingMode?: 'self-managed' | 'pooled';
    role?: string;
  }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create new user
    const newUser = new User({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      tradingMode: userData.tradingMode || 'pooled',
      isActive: true
    });

    // Save user to database
    await newUser.save();

    // Create wallet for the user
    const wallet = new Wallet({
      userId: newUser._id,
      balance: 0,
      currency: 'USD',
      isActive: true
    });
    await wallet.save();

    // Update user with wallet reference
    newUser.wallet = wallet._id;
    await newUser.save();

    // If user is in pooled mode, assign to a pool
    if (newUser.tradingMode === 'pooled') {
      const poolId = await poolService.findOrCreatePoolForUser(newUser._id.toString());
      // Update user with pool reference
      newUser.poolId = new mongoose.Types.ObjectId(poolId);
      await newUser.save();
    }

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
  }

  /**
   * Authenticate user and generate JWT token
   * @param email User email
   * @param password User password
   * @returns JWT token and user data
   */
  async login(email: string, password: string) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = this.generateToken(user);

    // Return token and user data
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();
    return {
      token,
      user: userWithoutPassword
    };
  }

  /**
   * Generate JWT token for user
   * @param user User object
   * @returns JWT token
   */
  generateToken(user: any) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '7d' });

    return token;
  }

  /**
   * Verify JWT token
   * @param token JWT token
   * @returns Decoded token payload
   */
  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Change user password
   * @param userId User ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success message
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.passwordHash = passwordHash;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Request password reset
   * @param email User email
   * @returns Success message
   */
  async requestPasswordReset(email: string) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist (security)
      return { message: 'If your email is registered, you will receive a password reset link' };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send password reset email with token

    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  /**
   * Reset password with token
   * @param token Reset token
   * @param newPassword New password
   * @returns Success message
   */
  async resetPassword(token: string, newPassword: string) {
    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }
}

export default new AuthService(); 