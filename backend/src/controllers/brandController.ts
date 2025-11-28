// src/controllers/brandController.ts
import { Request, Response } from "express";
import * as BrandService from "../services/brandService";

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await BrandService.listBrands();
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Brand name is required" });

    const brand = await BrandService.createBrand(name);
    res.status(201).json(brand);
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(400).json({ error: err.message || "Bad request" }); // ← ADD THIS LINE
    } // ← ADD THIS CLOSING BRACE
  } // ← AND THIS ONE
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await BrandService.deleteBrand(Number(id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Brand not found" });
    res.status(500).json({ error: err.message || "Server error" });
  }
};