const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // loginuser (fixed login)
    await prisma.loginuser.upsert({
      where: { email: 'diph.it-ojt@taukdial.com' },
      update: { username: 'DIPH-IT', password: 'DIPH@2025', role: 'IT_OJT' },
      create: { username: 'DIPH-IT', email: 'diph.it-ojt@taukdial.com', password: 'DIPH@2025', role: 'IT_OJT' },
    });

    // AssetTypeOption
    await prisma.assetTypeOption.upsert({
      where: { assetType: 'Laptop' },
      update: {},
      create: { assetType: 'Laptop' },
    });

    // BrandMakeOption
    await prisma.brandMakeOption.upsert({
      where: { brandMake: 'Dell' },
      update: {},
      create: { brandMake: 'Dell' },
    });

    // EquipmentAsset
    await prisma.equipmentAsset.create({
      data: {
        assetType: 'Laptop',
        brandMake: 'Dell',
        modelNumber: 'Latitude-7420',
        serialNumber: 'SN123456',
        barcode: '',
        description: 'Company laptop for testing',
        status: 'On_Stock',
        location: 'Head Office',
        username: 'DIPH-IT',
      },
    });

    // AccessoryAsset
    await prisma.accessoryAsset.create({
      data: {
        assetType: 'Mouse',
        modelNumber: 'MX-100',
        brandMake: 'Logitech',
        serialNumber: 'AS123',
        quantity: 5,
        status: 'On_Stock',
        location: 'Storage Room',
      },
    });

    // UserManagement
    await prisma.userManagement.upsert({
      where: { Email: 'jane.doe@example.com' },
      update: {},
      create: {
        Email: 'jane.doe@example.com',
        Name: 'Jane Doe',
        Password: 'changeme',
        Status: 'Active',
        Position: 'ITech',
      },
    });

    // ActivityLog
    await prisma.activityLog.create({
      data: {
        type: 'seed',
        username: 'DIPH-IT',
        action: 'seeded database',
        details: 'Inserted initial sample records',
      },
    });

    // MonthlyReport
    await prisma.monthlyReport.create({
      data: {
        totalAssetTypes: 2,
        totalOnStock: 2,
        totalIssued: 0,
        underMaintenance: 0,
        totalRetired: 0,
        totalAssets: 2,
        assetDistributionByType: { Laptop: 1, Mouse: 1 },
      },
    });

    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
