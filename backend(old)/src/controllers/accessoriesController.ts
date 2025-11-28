// src/controllers/accessoriesController.ts
import { Request, Response } from "express";
import * as AccessoriesService from "../services/accessoriesService";

export const listAccessories = async (req: Request, res: Response) => {
  try {
    const { q, page = "1", limit = "50", status } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));

    const filters: any = {};
    if (status) filters.status = String(status);

    const result = await AccessoriesService.listAccessories(String(q || ""), pageNum, limitNum, filters);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getAccessoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accessory = await AccessoriesService.findAccessoryById(id);
    if (!accessory) return res.status(404).json({ error: "Accessory not found" });
    res.json(accessory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const createAccessory = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.assetType) return res.status(400).json({ error: "assetType is required" });

    const created = await AccessoriesService.createAccessory(payload);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
};

export const updateAccessory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await AccessoriesService.updateAccessory(id, payload);
    if (!updated) return res.status(404).json({ error: "Accessory not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
};

export const deleteAccessory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AccessoriesService.deleteAccessory(id);
    res.status(204).send();
  } catch (err: any) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Accessory not found" });
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// Request/Issue: split original accessory and create a new issued/reserved record
export const requestAccessory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // original accessory id
    const { quantity, status, borrowerName } = req.body;
    if (!quantity || !status) return res.status(400).json({ error: "quantity and status are required" });

    const created = await AccessoriesService.splitAccessoryForAction(id, Number(quantity), String(status), borrowerName);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Original accessory not found" });
    if (err.message === "INSUFFICIENT_QUANTITY") return res.status(400).json({ error: "Insufficient quantity" });
    res.status(500).json({ error: err.message || "Server error" });
  }
};
