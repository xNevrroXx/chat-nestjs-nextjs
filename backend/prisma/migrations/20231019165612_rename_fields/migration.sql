/*
  Warnings:

  - You are about to drop the column `roomId` on the `participant` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `participant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,room_id]` on the table `participant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `room_id` to the `participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `participant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `participant` DROP FOREIGN KEY `participant_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `participant` DROP FOREIGN KEY `participant_userId_fkey`;

-- DropIndex
DROP INDEX `participant_userId_roomId_key` ON `participant`;

-- AlterTable
ALTER TABLE `participant` DROP COLUMN `roomId`,
    DROP COLUMN `userId`,
    ADD COLUMN `room_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `room` ADD COLUMN `name` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `participant_user_id_room_id_key` ON `participant`(`user_id`, `room_id`);

-- AddForeignKey
ALTER TABLE `participant` ADD CONSTRAINT `participant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participant` ADD CONSTRAINT `participant_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
