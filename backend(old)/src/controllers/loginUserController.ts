import { Request, Response } from 'express';
import { LoginUserService } from '../services/loginUserService';

const loginUserService = new LoginUserService();

export const getAllLoginUsers = async (req: Request, res: Response) => {
  try {
    const users = await loginUserService.getAllLoginUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getLoginUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await loginUserService.getLoginUserById(parseInt(id));

    if (!user) {
      return res.status(404).json({ error: 'Login user not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const createLoginUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Username, email, and password are required' });
    }

    const user = await loginUserService.createLoginUser({
      username,
      email,
      password,
      role: role || 'IT/OJT',
    });

    res.status(201).json(user);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Bad request' });
  }
};

export const updateLoginUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    const user = await loginUserService.updateLoginUser(parseInt(id), {
      username,
      email,
      password,
      role,
    });

    res.json(user);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Bad request' });
  }
};

export const deleteLoginUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await loginUserService.deleteLoginUser(parseInt(id));
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    const user = await loginUserService.validatePassword(username, password);
    res.json({ user });
  } catch (error: any) {
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
