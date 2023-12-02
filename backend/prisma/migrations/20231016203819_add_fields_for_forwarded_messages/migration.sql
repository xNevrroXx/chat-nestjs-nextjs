-- AlterTable
ALTER TABLE `message` ADD COLUMN `forward_message_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_forward_message_id_fkey` FOREIGN KEY (`forward_message_id`) REFERENCES `message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
