import mongoose from 'mongoose';

// Define permission types
export enum Permission {
  // User permissions
  VIEW_OWN_PROFILE = 'VIEW_OWN_PROFILE',
  EDIT_OWN_PROFILE = 'EDIT_OWN_PROFILE',
  VIEW_OWN_WALLET = 'VIEW_OWN_WALLET',
  VIEW_OWN_TRADES = 'VIEW_OWN_TRADES',
  VIEW_OWN_BOT_SETTINGS = 'VIEW_OWN_BOT_SETTINGS',
  EDIT_OWN_BOT_SETTINGS = 'EDIT_OWN_BOT_SETTINGS',
  CONNECT_DERIV_ACCOUNT = 'CONNECT_DERIV_ACCOUNT',
  DISCONNECT_DERIV_ACCOUNT = 'DISCONNECT_DERIV_ACCOUNT',
  
  // Pool investment permissions
  VIEW_POOLS = 'VIEW_POOLS',
  INVEST_IN_POOL = 'INVEST_IN_POOL',
  WITHDRAW_FROM_POOL = 'WITHDRAW_FROM_POOL',
  VIEW_POOL_PERFORMANCE = 'VIEW_POOL_PERFORMANCE',
  VIEW_POOL_INVESTMENT = 'VIEW_POOL_INVESTMENT',
  
  // Admin permissions
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',
  EDIT_ALL_USERS = 'EDIT_ALL_USERS',
  VIEW_ALL_WALLETS = 'VIEW_ALL_WALLETS',
  VIEW_ALL_TRADES = 'VIEW_ALL_TRADES',
  VIEW_ALL_BOT_SETTINGS = 'VIEW_ALL_BOT_SETTINGS',
  EDIT_ALL_BOT_SETTINGS = 'EDIT_ALL_BOT_SETTINGS',
  MANAGE_POOLS = 'MANAGE_POOLS',
  MANAGE_PROFIT_DISTRIBUTIONS = 'MANAGE_PROFIT_DISTRIBUTIONS',
  MANAGE_TRANSACTIONS = 'MANAGE_TRANSACTIONS',
  VIEW_SYSTEM_LOGS = 'VIEW_SYSTEM_LOGS',
  MANAGE_API_KEYS = 'MANAGE_API_KEYS',
  
  // Superadmin permissions
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_ADMINS = 'MANAGE_ADMINS',
  VIEW_SYSTEM_METRICS = 'VIEW_SYSTEM_METRICS',
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS'
}

// Define role types
export enum RoleType {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

const roleSchema = new mongoose.Schema({
  // Role identification
  roleId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: Object.values(RoleType), 
    required: true 
  },
  description: { type: String },
  // Permissions
  permissions: [{ 
    type: String, 
    enum: Object.values(Permission) 
  }],
  // Role status
  isActive: { type: Boolean, default: true },
  // Additional information
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Create indexes for efficient querying
roleSchema.index({ type: 1, isActive: 1 });
roleSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Role', roleSchema); 