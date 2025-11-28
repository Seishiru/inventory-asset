import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true,
      },
    });
  }

  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true,
      },
    });
  }

  async getUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true,
      },
    });
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    name: string;
    position?: string;
    status?: string;
    role?: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        position: data.position || 'Agent',
        status: data.status || 'active',
        role: data.role || 'user',
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true,
      },
    });
  }

  async updateUser(
    id: number,
    data: {
      username?: string;
      email?: string;
      password?: string;
      name?: string;
      position?: string;
      status?: string;
      role?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    const updateData: any = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Check for duplicate email/username
    if (data.email || data.username) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.email ? [{ email: data.email }] : []),
                ...(data.username ? [{ username: data.username }] : []),
              ],
            },
          ],
        },
      });

      if (duplicate) {
        throw new Error('User with this email or username already exists');
      }
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true,
      },
    });
  }

  async deleteUser(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    return prisma.user.delete({ where: { id } });
  }

  async updateUserStatus(id: number, status: string) {
    if (!['active', 'inactive'].includes(status)) {
      throw new Error("Status must be 'active' or 'inactive'");
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    return prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        status: true,
        position: true,
        role: true,
      },
    });
  }
}
