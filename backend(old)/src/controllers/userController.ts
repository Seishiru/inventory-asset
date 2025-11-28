// backend/src/controllers/userController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true
      }
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true
      }
    });
    
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name, position, status = "active", role = "user" } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: "User with this email or username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        position,
        status,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true
      }
    });

    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password, name, position, status, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for duplicate email/username
    if (email || username) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            {
              OR: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : [])
              ]
            }
          ]
        }
      });

      if (duplicateUser) {
        return res.status(409).json({ error: "User with this email or username already exists" });
      }
    }

    const updateData: any = {
      ...(username && { username }),
      ...(email && { email }),
      ...(name && { name }),
      ...(position && { position }),
      ...(status && { status }),
      ...(role && { role })
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true
      }
    });

    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true
      }
    });

    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
};