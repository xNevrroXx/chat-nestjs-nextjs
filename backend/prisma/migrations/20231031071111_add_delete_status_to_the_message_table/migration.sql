-- AlterTable
ALTER TABLE `message` ADD COLUMN `delete_status` ENUM('true', 'false', 'FOR_ME') NOT NULL DEFAULT 'false';
