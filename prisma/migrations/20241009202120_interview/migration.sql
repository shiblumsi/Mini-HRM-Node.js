/*
  Warnings:

  - You are about to drop the column `date` on the `interview` table. All the data in the column will be lost.
  - Added the required column `interviewDate` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `interview` DROP COLUMN `date`,
    ADD COLUMN `interviewDate` DATETIME(3) NOT NULL,
    ADD COLUMN `interviewTime` VARCHAR(191) NULL;
