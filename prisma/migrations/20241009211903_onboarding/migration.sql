/*
  Warnings:

  - You are about to drop the column `completed` on the `onboarding` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `onboarding` DROP COLUMN `completed`,
    ADD COLUMN `completionDate` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING';
