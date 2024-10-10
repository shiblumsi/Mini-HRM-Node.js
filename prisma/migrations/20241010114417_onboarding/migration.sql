/*
  Warnings:

  - You are about to alter the column `month` on the `attendancereport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `month` on the `leavereport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `month` on the `payrollreport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `month` on the `performancereport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `isPresent` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `attendancereport` MODIFY `month` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `leavereport` MODIFY `month` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `payrollreport` MODIFY `month` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `performancereport` MODIFY `month` INTEGER NOT NULL;
