// src/routes/brands.ts
import { Router } from "express";
import * as BrandController from "../controllers/brandController";

const router = Router();

router.get("/", BrandController.getBrands);
router.post("/", BrandController.createBrand);
router.delete("/:id", BrandController.deleteBrand);

export default router;