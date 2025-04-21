"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleType = exports.Permission = exports.Role = exports.Notification = exports.ApiKey = exports.BotLog = exports.ProfitDistribution = exports.Transaction = exports.Trade = exports.BotSettings = exports.PoolInvestment = exports.TradingPool = exports.GlobalState = exports.Wallet = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Wallet_1 = __importDefault(require("./Wallet"));
exports.Wallet = Wallet_1.default;
const GlobalState_1 = __importDefault(require("./GlobalState"));
exports.GlobalState = GlobalState_1.default;
const TradingPool_1 = __importDefault(require("./TradingPool"));
exports.TradingPool = TradingPool_1.default;
const PoolInvestment_1 = __importDefault(require("./PoolInvestment"));
exports.PoolInvestment = PoolInvestment_1.default;
const BotSettings_1 = __importDefault(require("./BotSettings"));
exports.BotSettings = BotSettings_1.default;
const Trade_1 = __importDefault(require("./Trade"));
exports.Trade = Trade_1.default;
const Transaction_1 = __importDefault(require("./Transaction"));
exports.Transaction = Transaction_1.default;
const ProfitDistribution_1 = __importDefault(require("./ProfitDistribution"));
exports.ProfitDistribution = ProfitDistribution_1.default;
const BotLog_1 = __importDefault(require("./BotLog"));
exports.BotLog = BotLog_1.default;
const ApiKey_1 = __importDefault(require("./ApiKey"));
exports.ApiKey = ApiKey_1.default;
const Notification_1 = __importDefault(require("./Notification"));
exports.Notification = Notification_1.default;
const Role_1 = __importStar(require("./Role"));
exports.Role = Role_1.default;
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return Role_1.Permission; } });
Object.defineProperty(exports, "RoleType", { enumerable: true, get: function () { return Role_1.RoleType; } });
