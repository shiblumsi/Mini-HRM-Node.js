-- AlterTable
ALTER TABLE `leave` MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELED') NOT NULL DEFAULT 'PENDING';
