/*
  Warnings:

  - The values [FOR_ME] on the enum `message_delete_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `message` MODIFY `delete_status` ENUM('NOT', 'FOR_SENDER', 'FOR_EVERYONE') NOT NULL DEFAULT 'NOT';
