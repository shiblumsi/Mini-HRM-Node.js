/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `BasicSalary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId,month,year]` on the table `SalaryStructure` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `month` to the `SalaryStructure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `SalaryStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `salarystructure` ADD COLUMN `month` INTEGER NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `BasicSalary_employeeId_key` ON `BasicSalary`(`employeeId`);

-- CreateIndex
CREATE UNIQUE INDEX `SalaryStructure_employeeId_month_year_key` ON `SalaryStructure`(`employeeId`, `month`, `year`);
