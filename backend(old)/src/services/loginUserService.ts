import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

export class LoginUserService {
  async getAllLoginUsers() {
    return prisma.loginUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getLoginUserById(id: number) {
    return prisma.loginUser.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getLoginUserByUsername(username: string) {
    return prisma.loginUser.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createLoginUser(data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const existingUser = await prisma.loginUser.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.loginUser.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || 'IT/OJT',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateLoginUser(
    id: number,
    data: {
      username?: string;
      email?: string;
      password?: string;
      role?: string;
    }
  ) {
    const user = await prisma.loginUser.findUnique({ where: { id } });
    if (!user) {
      throw new Error('Login user not found');
    }

    const updateData: any = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Check for duplicate email/username
    if (data.email || data.username) {
      const duplicate = await prisma.loginUser.findFirst({
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

    return prisma.loginUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteLoginUser(id: number) {
    const user = await prisma.loginUser.findUnique({ where: { id } });
    if (!user) {
      throw new Error('Login user not found');
    }

    return prisma.loginUser.delete({ where: { id } });
  }

  async validatePassword(username: string, password: string) {
    const user = await prisma.loginUser.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
