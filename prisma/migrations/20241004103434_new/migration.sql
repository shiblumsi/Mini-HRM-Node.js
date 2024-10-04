/*
  Warnings:

  - Made the column `departmentId` on table `employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `designationId` on table `employee` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_designationId_fkey`;

-- AlterTable
ALTER TABLE `employee` MODIFY `imageUrl` VARCHAR(191) NULL,
    MODIFY `departmentId` INTEGER NOT NULL,
    MODIFY `designationId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_designationId_fkey` FOREIGN KEY (`designationId`) REFERENCES `Designation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
