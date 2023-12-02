-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_forwarded_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_reply_to_message_id_fkey`;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_reply_to_message_id_fkey` FOREIGN KEY (`reply_to_message_id`) REFERENCES `message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_forwarded_message_id_fkey` FOREIGN KEY (`forwarded_message_id`) REFERENCES `message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
