// src/services/assetsService.ts
import prisma from "../prisma";

export interface CreateAssetPayload {
  image?: string;
  assetType: string;
  brandMake: string;
  modelNumber: string;
  serialNumber: string;
  barcode?: string;
  description?: string;
  status: string;
  location: string;
  userName: string;
  createdBy: string;
  modifiedBy: string;
  customFields?: any;
  auditLog?: any[];
  attachments?: any[];
  comments?: any[];
}

export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {}

export const listAssets = async (query = "", page = 1, limit = 50, filters: any = {}) => {
  const where: any = {};
  
  if (query) {
    where.OR = [
      { assetType: { contains: query } },
      { brandMake: { contains: query } },
      { modelNumber: { contains: query } },
      { serialNumber: { contains: query } },
      { location: { contains: query } },
      { userName: { contains: query } },
    ];
  }

  // Add status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Add location filter
  if (filters.location) {
    where.location = { contains: filters.location };
  }

  const [items, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findAssetById = async (id: string) => {
  return prisma.asset.findUnique({ where: { id } });
};

export const findAssetBySerialNumber = async (serialNumber: string) => {
  return prisma.asset.findUnique({ where: { serialNumber } });
};

export const createAsset = async (payload: CreateAssetPayload) => {
  if (!payload.assetType || !payload.brandMake || !payload.modelNumber || !payload.serialNumber) {
    throw new Error("Asset type, brand, model number, and serial number are required");
  }

  // Check if serial number already exists
  const existing = await prisma.asset.findUnique({
    where: { serialNumber: payload.serialNumber }
  });
  
  if (existing) {
    throw new Error("Asset with this serial number already exists");
  }

  // Generate barcode if not provided
  const barcode = payload.barcode || `BC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const created = await prisma.asset.create({
    data: {
      image: payload.image,
      assetType: payload.assetType,
      brandMake: payload.brandMake,
      modelNumber: payload.modelNumber,
      serialNumber: payload.serialNumber,
      barcode,
      description: payload.description,
      status: payload.status || "Active",
      location: payload.location,
      userName: payload.userName,
      createdBy: payload.createdBy,
      modifiedBy: payload.modifiedBy,
      customFields: payload.customFields || {},
      auditLog: payload.auditLog || [],
      attachments: payload.attachments || [],
      comments: payload.comments || [],
    },
  });
  
  return created;
};

export const updateAsset = async (id: string, payload: UpdateAssetPayload) => {
  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) return null;

  // Check if serial number is being changed and if it conflicts
  if (payload.serialNumber && payload.serialNumber !== existing.serialNumber) {
    const serialExists = await prisma.asset.findUnique({
      where: { serialNumber: payload.serialNumber }
    });
    
    if (serialExists) {
      throw new Error("Another asset with this serial number already exists");
    }
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      image: payload.image ?? existing.image,
      assetType: payload.assetType ?? existing.assetType,
      brandMake: payload.brandMake ?? existing.brandMake,
      modelNumber: payload.modelNumber ?? existing.modelNumber,
      serialNumber: payload.serialNumber ?? existing.serialNumber,
      barcode: payload.barcode ?? existing.barcode,
      description: payload.description ?? existing.description,
      status: payload.status ?? existing.status,
      location: payload.location ?? existing.location,
      userName: payload.userName ?? existing.userName,
      modifiedBy: payload.modifiedBy ?? existing.modifiedBy,
      customFields: payload.customFields ?? existing.customFields,
      auditLog: payload.auditLog ?? existing.auditLog,
      attachments: payload.attachments ?? existing.attachments,
      comments: payload.comments ?? existing.comments,
    },
  });
  
  return updated;
};

export const deleteAsset = async (id: string) => {
  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  
  await prisma.asset.delete({ where: { id } });
  return true;
};

export const duplicateAsset = async (id: string, createdBy: string) => {
  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  // Create new serial number for duplicate
  const newSerialNumber = `${existing.serialNumber}-COPY-${Date.now()}`;
  
  const duplicated = await prisma.asset.create({
    data: {
      image: existing.image,
      assetType: existing.assetType,
      brandMake: existing.brandMake,
      modelNumber: existing.modelNumber,
      serialNumber: newSerialNumber,
      barcode: `BC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: existing.description,
      status: "Active", // Reset status for duplicate
      location: existing.location,
      userName: existing.userName,
      createdBy,
      modifiedBy: createdBy,
      customFields: existing.customFields,
      auditLog: [],
      attachments: [],
      comments: [],
    },
  });
  
  return duplicated;
};