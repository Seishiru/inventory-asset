/*
  Warnings:

  - You are about to drop the column `assetType` on the `accessories` table. All the data in the column will be lost.
  - You are about to drop the column `assetType` on the `assets` table. All the data in the column will be lost.
  - Added the required column `assetTypeId` to the `accessories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetTypeId` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `accessories` DROP COLUMN `assetType`,
    ADD COLUMN `assetTypeId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `assets` DROP COLUMN `assetType`,
    ADD COLUMN `assetTypeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `asset_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `asset_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_assetTypeId_fkey` FOREIGN KEY (`assetTypeId`) REFERENCES `asset_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accessories` ADD CONSTRAINT `accessories_assetTypeId_fkey` FOREIGN KEY (`assetTypeId`) REFERENCES `asset_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
