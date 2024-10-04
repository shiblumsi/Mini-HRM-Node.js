/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee` DROP COLUMN `imageUrl`,
    ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `hr` ADD COLUMN `image` VARCHAR(191) NULL;
