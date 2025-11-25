// src/services/brandService.ts
import prisma from "../prisma";

export const listBrands = async () => {
  return prisma.brand.findMany({
    orderBy: { name: "asc" }
  });
};

export const createBrand = async (name: string) => {
  const existing = await prisma.brand.findUnique({
    where: { name }
  });
  
  if (existing) {
    throw new Error("Brand already exists");
  }
  
  return prisma.brand.create({
    data: { name }
  });
};

export const deleteBrand = async (id: number) => {
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  
  await prisma.brand.delete({ where: { id } });
  return true;
};