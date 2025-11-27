-- AlterTable
ALTER TABLE `assets` ADD COLUMN `barcodeGeneratedAt` DATETIME(3) NULL,
    ADD COLUMN `barcodePath` VARCHAR(191) NULL;
