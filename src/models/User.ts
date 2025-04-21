import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  tradingMode: { type: String, enum: ['self-managed', 'pooled'], default: 'pooled' },
  isActive: { type: Boolean, default: true },
  isSubscribed: { type: Boolean, default: false },
  lastLogin: { type: Date },
  // Pool reference
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingPool' },
  // Wallet reference
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  // For self-managed mode
  derivApiToken: { type: String },
  derivAppId: { type: String },
  // For pooled mode
  poolInvestment: { type: Number, default: 0 },
  poolSharePercentage: { type: Number, default: 0 },
  // Security
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('User', userSchema);
