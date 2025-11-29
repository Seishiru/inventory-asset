import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET all brand/make options
router.get('/', async (_req, res) => {
  try {
    const brands = await prisma.brandMakeOption.findMany({ orderBy: { id: 'asc' } });
    // map to a simple shape to keep compatibility with frontend
    res.json(brands.map((b: any) => ({ id: b.id, name: b.brandMake })));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Create a new brand option
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const created = await prisma.brandMakeOption.create({ data: { brandMake: name } });
    res.status(201).json({ id: created.id, name: created.brandMake });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Delete brand option by id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.brandMakeOption.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
