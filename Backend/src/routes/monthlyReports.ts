import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Compute totals from current assets and accessories (without saving)
router.get('/compute', async (_req, res) => {
  try {
    const equipments = await prisma.equipmentAsset.findMany();
    const accessories = await prisma.accessoryAsset.findMany();

    const summary: any = {
      totalAssetTypes: 0,
      totalOnStock: 0,
      totalIssued: 0,
      underMaintenance: 0,
      totalRetired: 0,
      totalAssets: 0,
      assetDistributionByType: {},
    };

    const typeSet = new Set<string>();

    const countStatus = (status: string, qty = 1) => {
      if (status === 'On_Stock' || status === 'On-Stock') summary.totalOnStock += qty;
      else if (status === 'Issued') summary.totalIssued += qty;
      else if (status === 'Maintenance' || status === 'Under Maintenance') summary.underMaintenance += qty;
      else if (status === 'Retired') summary.totalRetired += qty;
    };

    // Equipments count per item (each equipment is 1)
    for (const e of equipments) {
      const key = e.assetType || 'Unknown';
      typeSet.add(key);
      summary.assetDistributionByType[key] = (summary.assetDistributionByType[key] || 0) + 1;
      countStatus(e.status, 1);
      summary.totalAssets += 1;
    }

    // Accessories may have quantity
    for (const a of accessories) {
      const key = a.assetType || 'Unknown';
      typeSet.add(key);
      const qty = a.quantity || 0;
      summary.assetDistributionByType[key] = (summary.assetDistributionByType[key] || 0) + qty;
      countStatus(a.status, qty);
      summary.totalAssets += qty;
    }

    summary.totalAssetTypes = typeSet.size;

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Generate (compute and save) a monthly report snapshot
router.post('/generate', async (req, res) => {
  try {
    const computedResponse = await prisma.$transaction(async (tx) => {
      const equipments = await tx.equipmentAsset.findMany();
      const accessories = await tx.accessoryAsset.findMany();

      const summary: any = {
        totalAssetTypes: 0,
        totalOnStock: 0,
        totalIssued: 0,
        underMaintenance: 0,
        totalRetired: 0,
        totalAssets: 0,
        assetDistributionByType: {},
      };

      const typeSet = new Set<string>();

      const countStatus = (status: string, qty = 1) => {
        if (status === 'On_Stock' || status === 'On-Stock') summary.totalOnStock += qty;
        else if (status === 'Issued') summary.totalIssued += qty;
        else if (status === 'Maintenance' || status === 'Under Maintenance') summary.underMaintenance += qty;
        else if (status === 'Retired') summary.totalRetired += qty;
      };

      for (const e of equipments) {
        const key = e.assetType || 'Unknown';
        typeSet.add(key);
        summary.assetDistributionByType[key] = (summary.assetDistributionByType[key] || 0) + 1;
        countStatus(e.status, 1);
        summary.totalAssets += 1;
      }

      for (const a of accessories) {
        const key = a.assetType || 'Unknown';
        typeSet.add(key);
        const qty = a.quantity || 0;
        summary.assetDistributionByType[key] = (summary.assetDistributionByType[key] || 0) + qty;
        countStatus(a.status, qty);
        summary.totalAssets += qty;
      }

      summary.totalAssetTypes = typeSet.size;

      // Save snapshot
      const created = await tx.monthlyReport.create({
        data: {
          totalAssetTypes: summary.totalAssetTypes,
          totalOnStock: summary.totalOnStock,
          totalIssued: summary.totalIssued,
          underMaintenance: summary.underMaintenance,
          totalRetired: summary.totalRetired,
          totalAssets: summary.totalAssets,
          assetDistributionByType: summary.assetDistributionByType,
        },
      });

      return { summary, created };
    });

    res.status(201).json(computedResponse);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Get stored monthly reports (archived)
router.get('/', async (_req, res) => {
  try {
    const reports = await prisma.monthlyReport.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
