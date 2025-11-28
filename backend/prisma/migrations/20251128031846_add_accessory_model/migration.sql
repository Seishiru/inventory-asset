/*
  Warnings:

  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `assets` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'On-Stock';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `position` VARCHAR(191) NOT NULL DEFAULT 'Agent',
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE `accessories` (
    `id` VARCHAR(191) NOT NULL,
    `index` INTEGER NOT NULL AUTO_INCREMENT,
    `assetType` VARCHAR(191) NOT NULL,
    `modelNumber` VARCHAR(191) NULL,
    `brandMake` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'On-Stock',
    `userName` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `comments` JSON NULL,
    `originalId` VARCHAR(191) NULL,
    `auditLog` JSON NULL,
    `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUpdated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `accessories_index_key`(`index`),
    UNIQUE INDEX `accessories_barcode_key`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
