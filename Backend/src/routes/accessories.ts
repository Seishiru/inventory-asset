import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Map frontend /accessories to AccessoryAsset model
router.get('/', async (req, res) => {
  try {
    const accessories = await prisma.accessoryAsset.findMany();
    const parsed = accessories.map((a: any) => ({
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
      modelNumber: payload.modelNumber || undefined,
      brandMake: payload.brandMake || undefined,
      serialNumber: payload.serialNumber || undefined,
      barcode: payload.barcode || undefined,
      quantity: typeof payload.quantity === 'number' ? payload.quantity : (payload.quantity ? Number(payload.quantity) : 1),
      status: mapStatus(payload.status) as any,
      location: payload.location || undefined,
      attachment: payload.attachments ? JSON.stringify(payload.attachments) : undefined,
      comments: payload.comments ? JSON.stringify(payload.comments) : undefined,
    };

    try {
      const accessory = await prisma.accessoryAsset.create({ data });
      const resp = {
        ...accessory,
        attachments: accessory.attachment ? (() => { try { return JSON.parse(accessory.attachment); } catch { return accessory.attachment; } })() : [],
        comments: accessory.comments ? (() => { try { return JSON.parse(accessory.comments); } catch { return accessory.comments; } })() : [],
      };
      res.status(201).json(resp);
    } catch (innerErr) {
      console.error('Prisma create error for /accessories POST:', innerErr);
      res.status(400).json({ error: String(innerErr) });
    }
  } catch (err) {
    console.error('Unexpected error in /accessories POST:', err);
    res.status(400).json({ error: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const accessory = await prisma.accessoryAsset.findUnique({ where: { id } });
    if (!accessory) return res.status(404).json({ error: 'Not found' });
    const parsed = {
      ...accessory,
      attachments: accessory.attachment ? (() => { try { return JSON.parse(accessory.attachment); } catch { return accessory.attachment; } })() : [],
      comments: accessory.comments ? (() => { try { return JSON.parse(accessory.comments); } catch { return accessory.comments; } })() : [],
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
      modelNumber: payload.modelNumber || undefined,
      brandMake: payload.brandMake || undefined,
      serialNumber: payload.serialNumber || undefined,
      barcode: payload.barcode || undefined,
      quantity: typeof payload.quantity === 'number' ? payload.quantity : (payload.quantity ? Number(payload.quantity) : 1),
      status: mapStatus(payload.status) as any,
      location: payload.location || undefined,
      attachment: payload.attachments ? JSON.stringify(payload.attachments) : undefined,
      comments: payload.comments ? JSON.stringify(payload.comments) : undefined,
    };

    try {
      const accessory = await prisma.accessoryAsset.update({ where: { id }, data });
      const parsed = {
        ...accessory,
        attachments: accessory.attachment ? (() => { try { return JSON.parse(accessory.attachment); } catch { return accessory.attachment; } })() : [],
        comments: accessory.comments ? (() => { try { return JSON.parse(accessory.comments); } catch { return accessory.comments; } })() : [],
      };
      res.json(parsed);
    } catch (innerErr) {
      console.error('Prisma update error for /accessories PUT:', innerErr);
      res.status(400).json({ error: String(innerErr) });
    }
  } catch (err) {
    console.error('Unexpected error in /accessories PUT:', err);
    res.status(400).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.accessoryAsset.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
