/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,month,year,attendanceDate]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `year` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Attendance_employeeId_month_year_attendanceDate_key` ON `Attendance`(`employeeId`, `month`, `year`, `attendanceDate`);
