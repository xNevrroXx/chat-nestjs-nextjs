/*
  Warnings:

  - You are about to drop the column `room_type` on the `room` table. All the data in the column will be lost.
  - Added the required column `type` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `room` DROP COLUMN `room_type`,
    ADD COLUMN `type` ENUM('PRIVATE', 'GROUP') NOT NULL;
