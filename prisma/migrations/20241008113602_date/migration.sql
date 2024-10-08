-- CreateTable
CREATE TABLE `MonthlyAttendanceReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `totalWorkingDays` INTEGER NOT NULL,
    `daysPresent` INTEGER NOT NULL,
    `daysAbsent` INTEGER NOT NULL,
    `leaveDays` INTEGER NOT NULL,
    `lateArrivals` INTEGER NOT NULL,
    `earlyDepartures` INTEGER NOT NULL,
    `averageWorkHours` DOUBLE NULL,
    `overtimeHours` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MonthlyAttendanceReport_employeeId_month_year_key`(`employeeId`, `month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MonthlyAttendanceReport` ADD CONSTRAINT `MonthlyAttendanceReport_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
