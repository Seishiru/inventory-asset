// src/controllers/assetsController.ts
import { Request, Response } from "express";
import * as AssetService from "../services/assetsService";

export const getAssets = async (req: Request, res: Response) => {
  try {
    const { q, page = "1", limit = "50", status, location } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    
    const filters = {
      ...(status && { status: String(status) }),
      ...(location && { location: String(location) }),
    };
    
    const result = await AssetService.listAssets(String(q || ""), pageNum, limitNum, filters);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await AssetService.findAssetById(id);
    if (!asset) return res.status(404).json({ error: "Asset not found" });
    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const newAsset = await AssetService.createAsset(payload);
    res.status(201).json(newAsset);
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(400).json({ error: err.message || "Bad request" });
    }
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await AssetService.updateAsset(id, payload);
    if (!updated) return res.status(404).json({ error: "Asset not found" });
    res.json(updated);
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(400).json({ error: err.message || "Bad request" });
    }
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AssetService.deleteAsset(id);
    res.status(204).send();
  } catch (err: any) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Asset not found" });
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const duplicateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { createdBy } = req.body;
    
    if (!createdBy) {
      return res.status(400).json({ error: "createdBy is required" });
    }
    
    const duplicated = await AssetService.duplicateAsset(id, createdBy);
    res.status(201).json(duplicated);
  } catch (err: any) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Asset not found" });
    res.status(500).json({ error: err.message || "Server error" });
  }
};