import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET all asset type options
router.get('/', async (_req, res) => {
  try {
    const items = await prisma.assetTypeOption.findMany({ orderBy: { id: 'asc' } });
    res.json(items.map((i: any) => ({ id: i.id, assetType: i.assetType })));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Create a new asset type option
router.post('/', async (req, res) => {
  try {
    const { assetType } = req.body;
    if (!assetType) return res.status(400).json({ error: 'assetType is required' });
    const created = await prisma.assetTypeOption.create({ data: { assetType } });
    res.status(201).json({ id: created.id, assetType: created.assetType });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Delete by id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.assetTypeOption.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
