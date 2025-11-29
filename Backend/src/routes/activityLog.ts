import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET all activity logs
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ error: String(err) });
  }
});

// POST create activity log
router.post('/', async (req, res) => {
  try {
    const { type, username, action, details, equipmentAssetId, accessoryAssetId } = req.body;

    console.log('Activity log request:', req.body);

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const log = await prisma.activityLog.create({
      data: {
        type: type || 'other',
        username: username || 'System',
        action,
        details: details || undefined,
        equipmentAssetId: equipmentAssetId ? Number(equipmentAssetId) : undefined,
        accessoryAssetId: accessoryAssetId ? Number(accessoryAssetId) : undefined,
      },
    });

    res.status(201).json(log);
  } catch (err) {
    console.error('Error creating activity log:', err);
    console.error('Error details:', err);
    res.status(400).json({ error: String(err) });
  }
});

// GET activity log by ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const log = await prisma.activityLog.findUnique({ where: { id } });
    if (!log) return res.status(404).json({ error: 'Activity log not found' });
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// DELETE activity log
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.activityLog.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
