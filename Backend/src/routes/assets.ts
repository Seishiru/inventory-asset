import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Map frontend /assets to EquipmentAsset model
router.get('/', async (req, res) => {
  try {
    const assets = await prisma.equipmentAsset.findMany();
    // parse JSON fields before returning to frontend
    const parsed = assets.map((a: any) => ({
      ...a,
      attachments: a.attachment ? (() => { try { return JSON.parse(a.attachment); } catch { return a.attachment; } })() : [],
      comments: a.comments ? (() => { try { return JSON.parse(a.comments); } catch { return a.comments; } })() : [],
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};

    const mapStatus = (s: any) => {
      if (!s) return undefined;
      switch (String(s)) {
        case 'On-Stock':
        case 'On_Stock':
        case 'On Stock':
          return 'On_Stock';
        case 'Maintenance':
          return 'Maintenance';
        case 'Retired':
          return 'Retired';
        case 'Reserve':
        case 'Reserved':
          return 'Reserved';
        case 'Issued':
          return 'Issued';
        default:
          return undefined;
      }
    };

    const data = {
      assetType: payload.assetType,
      brandMake: payload.brandMake,
      modelNumber: payload.modelNumber,
      serialNumber: payload.serialNumber,
      barcode: payload.barcode || undefined,
      description: payload.description || undefined,
      status: mapStatus(payload.status) as any,
      location: payload.location || undefined,
      username: payload.userName || payload.username || undefined,
      assetImage: payload.image || undefined,
      attachment: payload.attachments ? JSON.stringify(payload.attachments) : undefined,
      comments: payload.comments ? JSON.stringify(payload.comments) : undefined,
    };

    try {
      const asset = await prisma.equipmentAsset.create({ data });
      // parse JSON fields for response
      const resp = {
        ...asset,
        attachments: asset.attachment ? (() => { try { return JSON.parse(asset.attachment); } catch { return asset.attachment; } })() : [],
        comments: asset.comments ? (() => { try { return JSON.parse(asset.comments); } catch { return asset.comments; } })() : [],
      };
      res.status(201).json(resp);
    } catch (innerErr) {
      console.error('Prisma create error for /assets POST:', innerErr);
      // return more detailed info to help debugging (keep as string)
      res.status(400).json({ error: String(innerErr) });
    }
  } catch (err) {
    console.error('Unexpected error in /assets POST:', err);
    res.status(400).json({ error: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const asset = await prisma.equipmentAsset.findUnique({ where: { id } });
    if (!asset) return res.status(404).json({ error: 'Not found' });
    const parsed = {
      ...asset,
      attachments: asset.attachment ? (() => { try { return JSON.parse(asset.attachment); } catch { return asset.attachment; } })() : [],
      comments: asset.comments ? (() => { try { return JSON.parse(asset.comments); } catch { return asset.comments; } })() : [],
    };
    res.json(parsed);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};

    const mapStatus = (s: any) => {
      if (!s) return undefined;
      switch (String(s)) {
        case 'On-Stock':
        case 'On_Stock':
        case 'On Stock':
          return 'On_Stock';
        case 'Maintenance':
          return 'Maintenance';
        case 'Retired':
          return 'Retired';
        case 'Reserve':
        case 'Reserved':
          return 'Reserved';
        case 'Issued':
          return 'Issued';
        default:
          return undefined;
      }
    };

    const data = {
      assetType: payload.assetType,
      brandMake: payload.brandMake,
      modelNumber: payload.modelNumber,
      serialNumber: payload.serialNumber,
      barcode: payload.barcode || undefined,
      description: payload.description || undefined,
      status: mapStatus(payload.status) as any,
      location: payload.location || undefined,
      username: payload.userName || payload.username || undefined,
      assetImage: payload.image || undefined,
      attachment: payload.attachments ? JSON.stringify(payload.attachments) : undefined,
      comments: payload.comments ? JSON.stringify(payload.comments) : undefined,
    };

    try {
      const asset = await prisma.equipmentAsset.update({ where: { id }, data });
      const parsed = {
        ...asset,
        attachments: asset.attachment ? (() => { try { return JSON.parse(asset.attachment); } catch { return asset.attachment; } })() : [],
        comments: asset.comments ? (() => { try { return JSON.parse(asset.comments); } catch { return asset.comments; } })() : [],
      };
      res.json(parsed);
    } catch (innerErr) {
      console.error('Prisma update error for /assets PUT:', innerErr);
      res.status(400).json({ error: String(innerErr) });
    }
  } catch (err) {
    console.error('Unexpected error in /assets PUT:', err);
    res.status(400).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.equipmentAsset.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
