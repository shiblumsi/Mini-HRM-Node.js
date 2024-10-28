/*
  Warnings:

  - A unique constraint covering the columns `[date,month,year]` on the table `Holiday` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `month` to the `Holiday` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Holiday` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `date` on the `holiday` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX `Holiday_date_key` ON `holiday`;

-- AlterTable
ALTER TABLE `holiday` ADD COLUMN `month` INTEGER NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL,
    DROP COLUMN `date`,
    ADD COLUMN `date` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Holiday_date_month_year_key` ON `Holiday`(`date`, `month`, `year`);
