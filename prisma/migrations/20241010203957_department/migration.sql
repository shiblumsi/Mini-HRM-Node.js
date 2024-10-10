/*
  Warnings:

  - You are about to drop the `emailnotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `emailnotification` DROP FOREIGN KEY `EmailNotification_notificationId_fkey`;

-- AlterTable
ALTER TABLE `systemannouncement` ADD COLUMN `departmentId` INTEGER NULL;

-- DropTable
DROP TABLE `emailnotification`;

-- AddForeignKey
ALTER TABLE `SystemAnnouncement` ADD CONSTRAINT `SystemAnnouncement_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
