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

export default router;