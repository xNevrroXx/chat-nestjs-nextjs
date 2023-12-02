-- AlterTable
ALTER TABLE `file` MODIFY `created_at` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `friendship` MODIFY `created_at` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `message` MODIFY `created_at` VARCHAR(191) NOT NULL,
    MODIFY `updated_at` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `refresh_token` MODIFY `updated_at` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `room` MODIFY `created_at` VARCHAR(191) NOT NULL,
    MODIFY `updated_at` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `created_at` VARCHAR(191) NOT NULL,
    MODIFY `updated_at` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user_online` MODIFY `updated_at` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user_typing` MODIFY `updated_at` VARCHAR(191) NOT NULL;
