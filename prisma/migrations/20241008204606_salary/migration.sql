/*
  Warnings:

  - You are about to drop the column `basicSalary` on the `salarystructure` table. All the data in the column will be lost.
  - Added the required column `basicSalaryId` to the `SalaryStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `salarystructure` DROP COLUMN `basicSalary`,
    ADD COLUMN `basicSalaryId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `BasicSalary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BasicSalary` ADD CONSTRAINT `BasicSalary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryStructure` ADD CONSTRAINT `SalaryStructure_basicSalaryId_fkey` FOREIGN KEY (`basicSalaryId`) REFERENCES `BasicSalary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
