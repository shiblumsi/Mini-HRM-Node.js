/*
  Warnings:

  - You are about to alter the column `checkIn` on the `attendance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `checkOut` on the `attendance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `attendance` MODIFY `checkIn` DATETIME(3) NOT NULL,
    MODIFY `checkOut` DATETIME(3) NULL;
