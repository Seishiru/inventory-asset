// src/routes/assets.ts
import { Router } from "express";
import * as AssetsController from "../controllers/assetsController";

const router = Router();

// CRUD + Additional routes
router.get("/", AssetsController.getAssets);
router.get("/:id", AssetsController.getAssetById);
router.post("/", AssetsController.createAsset);
router.put("/:id", AssetsController.updateAsset);
router.delete("/:id", AssetsController.deleteAsset);
router.post("/:id/duplicate", AssetsController.duplicateAsset);

// NEW: Barcode routes
router.post("/:id/generate-barcode", AssetsController.generateBarcode);
router.get("/:id/barcode", AssetsController.getBarcode);

export default router;