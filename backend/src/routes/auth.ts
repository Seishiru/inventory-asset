import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) return res.status(400).json({ message: 'Username or email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { username, email, password: hashedPassword, role },
  });

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ user: userWithoutPassword });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

export default router;
