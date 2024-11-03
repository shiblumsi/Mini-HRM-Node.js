/*
  Warnings:

  - Added the required column `roleId` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `roleId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
