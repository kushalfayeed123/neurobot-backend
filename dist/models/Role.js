"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleType = exports.Permission = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Define permission types
var Permission;
(function (Permission) {
    // User permissions
    Permission["VIEW_OWN_PROFILE"] = "VIEW_OWN_PROFILE";
    Permission["EDIT_OWN_PROFILE"] = "EDIT_OWN_PROFILE";
    Permission["VIEW_OWN_WALLET"] = "VIEW_OWN_WALLET";
    Permission["VIEW_OWN_TRADES"] = "VIEW_OWN_TRADES";
    Permission["VIEW_OWN_BOT_SETTINGS"] = "VIEW_OWN_BOT_SETTINGS";
    Permission["EDIT_OWN_BOT_SETTINGS"] = "EDIT_OWN_BOT_SETTINGS";
    Permission["CONNECT_DERIV_ACCOUNT"] = "CONNECT_DERIV_ACCOUNT";
    Permission["DISCONNECT_DERIV_ACCOUNT"] = "DISCONNECT_DERIV_ACCOUNT";
    // Pool investment permissions
    Permission["VIEW_POOLS"] = "VIEW_POOLS";
    Permission["INVEST_IN_POOL"] = "INVEST_IN_POOL";
    Permission["WITHDRAW_FROM_POOL"] = "WITHDRAW_FROM_POOL";
    Permission["VIEW_POOL_PERFORMANCE"] = "VIEW_POOL_PERFORMANCE";
    Permission["VIEW_POOL_INVESTMENT"] = "VIEW_POOL_INVESTMENT";
    // Admin permissions
    Permission["VIEW_ALL_USERS"] = "VIEW_ALL_USERS";
    Permission["EDIT_ALL_USERS"] = "EDIT_ALL_USERS";
    Permission["VIEW_ALL_WALLETS"] = "VIEW_ALL_WALLETS";
    Permission["VIEW_ALL_TRADES"] = "VIEW_ALL_TRADES";
    Permission["VIEW_ALL_BOT_SETTINGS"] = "VIEW_ALL_BOT_SETTINGS";
    Permission["EDIT_ALL_BOT_SETTINGS"] = "EDIT_ALL_BOT_SETTINGS";
    Permission["MANAGE_POOLS"] = "MANAGE_POOLS";
    Permission["MANAGE_PROFIT_DISTRIBUTIONS"] = "MANAGE_PROFIT_DISTRIBUTIONS";
    Permission["MANAGE_TRANSACTIONS"] = "MANAGE_TRANSACTIONS";
    Permission["VIEW_SYSTEM_LOGS"] = "VIEW_SYSTEM_LOGS";
    Permission["MANAGE_API_KEYS"] = "MANAGE_API_KEYS";
    // Superadmin permissions
    Permission["MANAGE_ROLES"] = "MANAGE_ROLES";
    Permission["MANAGE_ADMINS"] = "MANAGE_ADMINS";
    Permission["VIEW_SYSTEM_METRICS"] = "VIEW_SYSTEM_METRICS";
    Permission["MANAGE_SYSTEM_SETTINGS"] = "MANAGE_SYSTEM_SETTINGS";
})(Permission || (exports.Permission = Permission = {}));
// Define role types
var RoleType;
(function (RoleType) {
    RoleType["USER"] = "user";
    RoleType["ADMIN"] = "admin";
    RoleType["SUPERADMIN"] = "superadmin";
})(RoleType || (exports.RoleType = RoleType = {}));
const roleSchema = new mongoose_1.default.Schema({
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
    metadata: { type: Map, of: mongoose_1.default.Schema.Types.Mixed }
}, { timestamps: true });
// Create indexes for efficient querying
roleSchema.index({ type: 1, isActive: 1 });
roleSchema.index({ name: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Role', roleSchema);
