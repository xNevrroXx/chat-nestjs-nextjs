/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `user` table. All the data in the column will be lost.
  - Added the required column `display_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `given_name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    DROP COLUMN `surname`,
    ADD COLUMN `display_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `family_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `given_name` VARCHAR(191) NOT NULL,
    MODIFY `age` INTEGER NULL,
    MODIFY `sex` ENUM('MALE', 'FEMALE') NULL;
