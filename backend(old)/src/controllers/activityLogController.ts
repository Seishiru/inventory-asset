import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activityLogService';

const activityLogService = new ActivityLogService();

export const getAllActivityLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await activityLogService.getAllActivityLogs(page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getActivityLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = await activityLogService.getActivityLogById(parseInt(id));

    if (!log) {
      return res.status(404).json({ error: 'Activity log not found' });
    }

    res.json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getActivityLogsByUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await activityLogService.getActivityLogsByUser(
      username,
      page,
      limit
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getActivityLogsByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await activityLogService.getActivityLogsByType(
      type,
      page,
      limit
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const createActivityLog = async (req: Request, res: Response) => {
  try {
    const { type, username, action, details } = req.body;

    if (!type || !username || !action) {
      return res
        .status(400)
        .json({ error: 'Type, username, and action are required' });
    }

    const log = await activityLogService.createActivityLog({
      type,
      username,
      action,
      details,
    });

    res.status(201).json(log);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Bad request' });
  }
};

export const deleteActivityLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await activityLogService.deleteActivityLog(parseInt(id));
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const deleteActivityLogsByUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    await activityLogService.deleteActivityLogsByUser(username);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const clearOldActivityLogs = async (req: Request, res: Response) => {
  try {
    const { daysOld } = req.body || {};
    const result = await activityLogService.clearOldActivityLogs(
      daysOld || 30
    );
    res.json({
      message: `Deleted ${result.count} activity logs older than ${daysOld || 30} days`,
      count: result.count,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
