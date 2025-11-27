// src/controllers/assetsController.ts
import { Request, Response } from "express";
import * as AssetService from "../services/assetsService";
import { BarcodeService } from "../services/barcodeService";

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
    
    // Generate barcode if serial number is provided
    if (payload.serialNumber) {
      try {
        const barcodePath = await BarcodeService.generateBarcode(payload.serialNumber);
        // Use the new barcode fields
        payload.barcodePath = barcodePath;
        payload.barcodeGeneratedAt = new Date();
      } catch (barcodeError) {
        console.warn('Barcode generation failed:', barcodeError);
        // Continue without barcode - don't fail the entire request
      }
    }
    
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
    
    // Generate new barcode if serial number is being updated
    if (payload.serialNumber) {
      const existingAsset = await AssetService.findAssetById(id);
      if (existingAsset && existingAsset.serialNumber !== payload.serialNumber) {
        try {
          const barcodePath = await BarcodeService.generateBarcode(payload.serialNumber);
          // Use the new barcode fields
          payload.barcodePath = barcodePath;
          payload.barcodeGeneratedAt = new Date();
        } catch (barcodeError) {
          console.warn('Barcode generation failed:', barcodeError);
          // Continue without updating barcode
        }
      }
    }
    
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
    
    // Optional: Delete barcode file when asset is deleted
    const asset = await AssetService.findAssetById(id);
    if (asset?.barcodePath) {
      try {
        await BarcodeService.deleteBarcode(asset.barcodePath);
      } catch (deleteError) {
        console.warn('Failed to delete barcode file:', deleteError);
      }
    }
    
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
    
    // Generate new barcode for duplicated asset
    if (duplicated && duplicated.serialNumber) {
      try {
        const barcodePath = await BarcodeService.generateBarcode(duplicated.serialNumber);
        await AssetService.updateAsset(duplicated.id, {
          barcodePath,
          barcodeGeneratedAt: new Date()
        });
        // Update the returned object
        duplicated.barcodePath = barcodePath;
        duplicated.barcodeGeneratedAt = new Date();
      } catch (barcodeError) {
        console.warn('Barcode generation failed for duplicated asset:', barcodeError);
      }
    }
    
    res.status(201).json(duplicated);
  } catch (err: any) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Asset not found" });
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// NEW: Endpoint to generate barcode for existing asset
export const generateBarcode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const asset = await AssetService.findAssetById(id);
    if (!asset) return res.status(404).json({ error: "Asset not found" });
    
    if (!asset.serialNumber) {
      return res.status(400).json({ error: "Asset must have a serial number to generate barcode" });
    }
    
    const barcodePath = await BarcodeService.generateBarcode(asset.serialNumber);
    
    // Update asset with new barcode
    const updated = await AssetService.updateAsset(id, {
      barcodePath,
      barcodeGeneratedAt: new Date()
    });
    
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate barcode" });
  }
};

// NEW: Endpoint to get barcode image
export const getBarcode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const asset = await AssetService.findAssetById(id);
    if (!asset) return res.status(404).json({ error: "Asset not found" });
    
    if (!asset.barcodePath) {
      return res.status(404).json({ error: "Barcode not found for this asset" });
    }
    
    // Serve the barcode image file
    res.sendFile(asset.barcodePath, { root: process.cwd() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve barcode" });
  }
};