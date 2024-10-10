/*
  Warnings:

  - You are about to alter the column `month` on the `performancereport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `performancereport` MODIFY `month` INTEGER NOT NULL;
