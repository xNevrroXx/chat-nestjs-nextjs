/*
  Warnings:

  - You are about to drop the column `roomType` on the `room` table. All the data in the column will be lost.
  - Added the required column `room_type` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `room` DROP COLUMN `roomType`,
    ADD COLUMN `room_type` ENUM('PRIVATE', 'GROUP') NOT NULL;
