/*
  Warnings:

  - Added the required column `month` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `month` DATETIME(3) NOT NULL;
