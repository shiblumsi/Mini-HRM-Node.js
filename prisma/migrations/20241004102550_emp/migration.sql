-- AlterTable
ALTER TABLE `employee` MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL,
    MODIFY `contact` VARCHAR(191) NULL,
    MODIFY `hireDate` DATETIME(3) NULL,
    MODIFY `dob` DATETIME(3) NULL,
    MODIFY `address` VARCHAR(191) NULL;
