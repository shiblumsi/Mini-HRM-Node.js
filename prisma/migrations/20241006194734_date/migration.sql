-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `attendanceDate` VARCHAR(191) NOT NULL DEFAULT '01',
    ADD COLUMN `workHoure` DOUBLE NULL,
    MODIFY `checkIn` VARCHAR(191) NOT NULL,
    MODIFY `checkOut` VARCHAR(191) NULL,
    MODIFY `month` VARCHAR(191) NOT NULL;