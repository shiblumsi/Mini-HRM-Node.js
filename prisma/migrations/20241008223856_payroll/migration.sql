/*
  Warnings:

  - You are about to alter the column `month` on the `payroll` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[employeeId,month,year]` on the table `Payroll` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payroll` ADD COLUMN `year` INTEGER NOT NULL,
    MODIFY `month` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payroll_employeeId_month_year_key` ON `Payroll`(`employeeId`, `month`, `year`);
