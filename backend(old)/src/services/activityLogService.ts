import { prisma } from '../prisma';

export class ActivityLogService {
  async getAllActivityLogs(page = 1, limit = 50) {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count(),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getActivityLogById(id: number) {
    return prisma.activityLog.findUnique({ where: { id } });
  }

  async getActivityLogsByUser(username: string, page = 1, limit = 50) {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { username },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where: { username } }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getActivityLogsByType(type: string, page = 1, limit = 50) {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { type },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where: { type } }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createActivityLog(data: {
    type: string;
    username: string;
    action: string;
    details?: string;
  }) {
    if (!data.type || !data.username || !data.action) {
      throw new Error('Type, username, and action are required');
    }

    return prisma.activityLog.create({
      data: {
        type: data.type,
        username: data.username,
        action: data.action,
        details: data.details,
      },
    });
  }

  async deleteActivityLog(id: number) {
    const log = await prisma.activityLog.findUnique({ where: { id } });
    if (!log) {
      throw new Error('Activity log not found');
    }

    return prisma.activityLog.delete({ where: { id } });
  }

  async deleteActivityLogsByUser(username: string) {
    return prisma.activityLog.deleteMany({
      where: { username },
    });
  }

  async clearOldActivityLogs(daysOld = 30) {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    return prisma.activityLog.deleteMany({
      where: {
        timestamp: {
          lt: date,
        },
      },
    });
  }
}
