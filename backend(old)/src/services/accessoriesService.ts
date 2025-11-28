// src/services/accessoriesService.ts
import prisma from "../prisma";

export interface CreateAccessoryPayload {
  assetType: string;
  modelNumber?: string;
  brandMake?: string;
  barcode?: string;
  serialNumber?: string;
  quantity?: number;
  status?: string;
  userName?: string;
  location?: string;
  comments?: any;
  originalId?: string;
  auditLog?: any[];
}

export interface UpdateAccessoryPayload extends Partial<CreateAccessoryPayload> {}

export const listAccessories = async (query = "", page = 1, limit = 50, filters: any = {}) => {
  console.log('🔍 Listing accessories - Query:', query, 'Page:', page, 'Limit:', limit, 'Filters:', filters);
  
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

  if (filters.status) where.status = filters.status;

  try {
    const [items, total] = await Promise.all([
      prisma.accessory.findMany({
        where,
        orderBy: { dateCreated: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accessory.count({ where }),
    ]);

    console.log(`✅ Found ${items.length} accessories out of ${total} total`);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('❌ Error listing accessories:', error);
    throw error;
  }
};

export const findAccessoryById = async (id: string) => {
  console.log('🔍 Finding accessory by ID:', id);
  
  try {
    const accessory = await prisma.accessory.findUnique({ where: { id } });
    console.log(accessory ? `✅ Found accessory: ${accessory.assetType}` : '❌ Accessory not found');
    return accessory;
  } catch (error) {
    console.error('❌ Error finding accessory by ID:', error);
    throw error;
  }
};

export const createAccessory = async (payload: CreateAccessoryPayload) => {
  console.log('📦 Creating accessory with payload:', JSON.stringify(payload, null, 2));
  
  if (!payload.assetType) {
    console.error('❌ Validation failed: assetType is required');
    throw new Error("Asset type is required");
  }

  try {
    const created = await prisma.accessory.create({
      data: {
        assetType: payload.assetType,
        modelNumber: payload.modelNumber,
        brandMake: payload.brandMake,
        barcode: payload.barcode,
        serialNumber: payload.serialNumber,
        quantity: payload.quantity ?? 0,
        status: payload.status ?? "On-Stock",
        userName: payload.userName,
        location: payload.location,
        comments: payload.comments ?? [],
        originalId: payload.originalId,
        auditLog: payload.auditLog ?? [],
      },
    });

    console.log('✅ Accessory created successfully:', {
      id: created.id,
      assetType: created.assetType,
      quantity: created.quantity,
      status: created.status
    });
    
    return created;
  } catch (error) {
    console.error('❌ Error creating accessory:', error);
    throw error;
  }
};

export const updateAccessory = async (id: string, payload: UpdateAccessoryPayload) => {
  console.log('✏️ Updating accessory:', id, 'with payload:', JSON.stringify(payload, null, 2));
  
  try {
    const existing = await prisma.accessory.findUnique({ where: { id } });
    if (!existing) {
      console.error('❌ Accessory not found for update:', id);
      return null;
    }

    console.log('📋 Existing accessory:', {
      assetType: existing.assetType,
      quantity: existing.quantity,
      status: existing.status
    });

    const updated = await prisma.accessory.update({
      where: { id },
      data: {
        assetType: payload.assetType ?? existing.assetType,
        modelNumber: payload.modelNumber ?? existing.modelNumber,
        brandMake: payload.brandMake ?? existing.brandMake,
        barcode: payload.barcode ?? existing.barcode,
        serialNumber: payload.serialNumber ?? existing.serialNumber,
        quantity: payload.quantity ?? existing.quantity,
        status: payload.status ?? existing.status,
        userName: payload.userName ?? existing.userName,
        location: payload.location ?? existing.location,
        comments: payload.comments ?? existing.comments,
        originalId: payload.originalId ?? existing.originalId,
        auditLog: payload.auditLog ?? existing.auditLog,
      },
    });

    console.log('✅ Accessory updated successfully:', {
      id: updated.id,
      assetType: updated.assetType,
      quantity: updated.quantity,
      status: updated.status
    });
    
    return updated;
  } catch (error) {
    console.error('❌ Error updating accessory:', error);
    throw error;
  }
};

export const deleteAccessory = async (id: string) => {
  console.log('🗑️ Deleting accessory:', id);
  
  try {
    const existing = await prisma.accessory.findUnique({ where: { id } });
    if (!existing) {
      console.error('❌ Accessory not found for deletion:', id);
      throw new Error("NOT_FOUND");
    }

    console.log('📋 Deleting accessory:', {
      id: existing.id,
      assetType: existing.assetType,
      quantity: existing.quantity
    });

    await prisma.accessory.delete({ where: { id } });
    
    console.log('✅ Accessory deleted successfully:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting accessory:', error);
    throw error;
  }
};

export const splitAccessoryForAction = async (
  originalId: string,
  quantity: number,
  status: string,
  borrowerName?: string
) => {
  console.log('🔄 Splitting accessory - Original ID:', originalId, 'Quantity:', quantity, 'Status:', status, 'Borrower:', borrowerName);
  
  try {
    const orig = await prisma.accessory.findUnique({ where: { id: originalId } });
    if (!orig) {
      console.error('❌ Original accessory not found:', originalId);
      throw new Error("NOT_FOUND");
    }
    
    if (orig.quantity < quantity) {
      console.error('❌ Insufficient quantity:', { available: orig.quantity, requested: quantity });
      throw new Error("INSUFFICIENT_QUANTITY");
    }

    console.log('📋 Original accessory before split:', {
      id: orig.id,
      assetType: orig.assetType,
      currentQuantity: orig.quantity
    });

    await prisma.accessory.update({ 
      where: { id: originalId }, 
      data: { quantity: orig.quantity - quantity } 
    });

    console.log('✅ Reduced original quantity from', orig.quantity, 'to', orig.quantity - quantity);

    const suffix = status.toUpperCase().replace(/[^A-Z]/g, '');
    const newBarcode = orig.barcode ? `${orig.barcode}-${suffix}-${Date.now()}` : undefined;

    const created = await prisma.accessory.create({
      data: {
        assetType: orig.assetType,
        modelNumber: orig.modelNumber,
        brandMake: orig.brandMake,
        barcode: newBarcode,
        serialNumber: orig.serialNumber,
        quantity: quantity,
        status,
        userName: borrowerName,
        location: orig.location,
        comments: [{ note: `${status} from ${orig.barcode}` }],
        originalId: originalId,
        auditLog: [{ action: status, timestamp: new Date().toISOString(), user: borrowerName ?? 'system' }],
      },
    });

    console.log('✅ Split accessory created:', {
      id: created.id,
      assetType: created.assetType,
      quantity: created.quantity,
      status: created.status,
      newBarcode: created.barcode
    });

    return created;
  } catch (error) {
    console.error('❌ Error splitting accessory:', error);
    throw error;
  }
};