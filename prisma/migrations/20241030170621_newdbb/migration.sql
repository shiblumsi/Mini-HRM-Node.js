/*
  Warnings:

  - You are about to drop the column `employeeId` on the `onboarding` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `Onboarding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `onboarding` DROP FOREIGN KEY `Onboarding_employeeId_fkey`;

-- AlterTable
ALTER TABLE `onboarding` DROP COLUMN `employeeId`,
    ADD COLUMN `departmentId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Onboarding` ADD CONSTRAINT `Onboarding_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
