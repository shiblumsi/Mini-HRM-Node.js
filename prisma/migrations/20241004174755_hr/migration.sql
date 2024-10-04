/*
  Warnings:

  - You are about to drop the column `email` on the `hr` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Hr_email_key` ON `hr`;

-- AlterTable
ALTER TABLE `hr` DROP COLUMN `email`,
    MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL,
    MODIFY `contact` VARCHAR(191) NULL;
