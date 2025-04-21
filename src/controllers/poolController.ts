import { Request, Response } from 'express';
import poolService from '../services/poolService';

export const createPool = async (req: any, res: Response) => {
  try {
    const poolData = {
      ...req.body,
      createdBy: req.user.id,
      managedBy: req.user.id
    };
    const pool = await poolService.createPool(poolData);
    res.status(201).json(pool);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const findOrCreatePool = async (req: any, res: Response) => {
  try {
    const poolId = await poolService.findOrCreatePoolForUser(req.user.id);
    res.json({ poolId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPoolDetails = async (req: any, res: Response) => {
  try {
    const { poolId } = req.params;
    const pool = await poolService.getPoolDetails(poolId);
    res.json(pool);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const investInPool = async (req: any, res: Response) => {
  try {
    const { poolId } = req.params;
    const { amount } = req.body;
    const result = await poolService.investInPool(req.user.id, poolId, amount);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const withdrawFromPool = async (req: any, res: Response) => {
  try {
    const { poolId } = req.params;
    const { amount } = req.body;
    const result = await poolService.withdrawFromPool(req.user.id, poolId, amount);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const distributeProfits = async (req: any, res: Response) => {
  try {
    const { poolId } = req.params;
    const profitData = {
      ...req.body,
      createdBy: req.user.id
    };
    const result = await poolService.distributeProfits(poolId, profitData);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPoolPerformance = async (req: any, res: Response) => {
  try {
    const { poolId } = req.params;
    const metrics = await poolService.getPoolPerformance(poolId);
    res.json(metrics);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}; 