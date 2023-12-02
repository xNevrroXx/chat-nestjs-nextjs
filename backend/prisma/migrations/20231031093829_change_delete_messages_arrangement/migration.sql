/*
  Warnings:

  - You are about to drop the `delete_message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `delete_message` DROP FOREIGN KEY `delete_message_message_id_fkey`;

-- AlterTable
ALTER TABLE `message` ADD COLUMN `isDeleteForEveryone` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `delete_message`;

-- CreateTable
CREATE TABLE `_deleted_messages` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_deleted_messages_AB_unique`(`A`, `B`),
    INDEX `_deleted_messages_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_deleted_messages` ADD CONSTRAINT `_deleted_messages_A_fkey` FOREIGN KEY (`A`) REFERENCES `message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_deleted_messages` ADD CONSTRAINT `_deleted_messages_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
