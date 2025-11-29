import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.loginuser.findFirst({
      where: {
        username: username,
        password: password, // In production, use bcrypt to hash/compare passwords
      },
    });

    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Map role from database enum to frontend format
    const mappedRole = user.role === 'IT_OJT' ? 'IT/OJT' : user.role;

    // Don't send password back to client
    const { password: _, role: dbRole, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      user: {
        ...userWithoutPassword,
        role: mappedRole
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: String(err) });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.loginuser.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Create new user
    const newUser = await prisma.loginuser.create({
      data: {
        username,
        email,
        password, // In production, use bcrypt to hash password
        role,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
