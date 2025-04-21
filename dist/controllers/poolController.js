"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolPerformance = exports.distributeProfits = exports.withdrawFromPool = exports.investInPool = exports.getPoolDetails = exports.findOrCreatePool = exports.createPool = void 0;
const poolService_1 = __importDefault(require("../services/poolService"));
const createPool = async (req, res) => {
    try {
        const poolData = {
            ...req.body,
            createdBy: req.user.id,
            managedBy: req.user.id
        };
        const pool = await poolService_1.default.createPool(poolData);
        res.status(201).json(pool);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createPool = createPool;
const findOrCreatePool = async (req, res) => {
    try {
        const poolId = await poolService_1.default.findOrCreatePoolForUser(req.user.id);
        res.json({ poolId });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.findOrCreatePool = findOrCreatePool;
const getPoolDetails = async (req, res) => {
    try {
        const { poolId } = req.params;
        const pool = await poolService_1.default.getPoolDetails(poolId);
        res.json(pool);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.getPoolDetails = getPoolDetails;
const investInPool = async (req, res) => {
    try {
        const { poolId } = req.params;
        const { amount } = req.body;
        const result = await poolService_1.default.investInPool(req.user.id, poolId, amount);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.investInPool = investInPool;
const withdrawFromPool = async (req, res) => {
    try {
        const { poolId } = req.params;
        const { amount } = req.body;
        const result = await poolService_1.default.withdrawFromPool(req.user.id, poolId, amount);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.withdrawFromPool = withdrawFromPool;
const distributeProfits = async (req, res) => {
    try {
        const { poolId } = req.params;
        const profitData = {
            ...req.body,
            createdBy: req.user.id
        };
        const result = await poolService_1.default.distributeProfits(poolId, profitData);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.distributeProfits = distributeProfits;
const getPoolPerformance = async (req, res) => {
    try {
        const { poolId } = req.params;
        const metrics = await poolService_1.default.getPoolPerformance(poolId);
        res.json(metrics);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.getPoolPerformance = getPoolPerformance;
