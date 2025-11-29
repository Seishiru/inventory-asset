import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const users = await prisma.userManagement.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const user = await prisma.userManagement.create({ data });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.userManagement.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const user = await prisma.userManagement.update({ where: { id }, data });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.userManagement.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
