/*
  Warnings:

  - You are about to alter the column `delete_status` on the `message` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `message` MODIFY `delete_status` ENUM('NOT', 'FOR_ME', 'FOR_EVERYONE') NOT NULL DEFAULT 'NOT';
