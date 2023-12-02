/*
  Warnings:

  - You are about to drop the column `forward_message_id` on the `message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_forward_message_id_fkey`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `forward_message_id`,
    ADD COLUMN `forwarded_message_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_forwarded_message_id_fkey` FOREIGN KEY (`forwarded_message_id`) REFERENCES `message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
