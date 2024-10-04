/*
  Warnings:

  - You are about to drop the column `email` on the `employee` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Employee_email_key` ON `employee`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `email`;
