import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  // Key identification
  keyId: { type: String, required: true, unique: true },
  // User reference
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Key details
  name: { type: String, required: true },
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  // Key status
  isActive: { type: Boolean, default: true },
  // Key permissions
  permissions: [{ type: String, enum: ['read', 'trade', 'admin'] }],
  // Usage tracking
  lastUsed: { type: Date },
  usageCount: { type: Number, default: 0 },
  // Security
  ipWhitelist: [{ type: String }],
  // Expiration
  expiresAt: { type: Date },
  // Additional information
  description: { type: String },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Create indexes for efficient querying
apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ apiKey: 1 }, { unique: true });
apiKeySchema.index({ expiresAt: 1 });

export default mongoose.model('ApiKey', apiKeySchema); 