-- CreateTable
CREATE TABLE `attribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `attribute_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmark` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL,
    `videoID` INTEGER NOT NULL,
    `categoryID` INTEGER NOT NULL,

    UNIQUE INDEX `bookmark_videoID_start_key`(`videoID`, `start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `location_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `videoID` INTEGER NOT NULL,

    UNIQUE INDEX `plays_videoID_time_key`(`videoID`, `time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `websiteID` INTEGER NOT NULL,

    UNIQUE INDEX `site_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staralias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `starID` INTEGER NOT NULL,

    UNIQUE INDEX `staralias_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `haircolor` (
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `starhaircolors` (
    `hair` VARCHAR(191) NOT NULL,
    `starId` INTEGER NOT NULL,

    PRIMARY KEY (`starId`, `hair`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `star` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `breast` VARCHAR(191) NULL,
    `ethnicity` VARCHAR(191) NULL,
    `birthdate` DATE NULL,
    `height` INTEGER NULL,
    `weight` INTEGER NULL,
    `autoTaggerIgnore` BOOLEAN NOT NULL DEFAULT false,
    `api` VARCHAR(36) NULL,

    UNIQUE INDEX `star_name_key`(`name`),
    UNIQUE INDEX `star_image_key`(`image`),
    UNIQUE INDEX `star_api_key`(`api`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `videoattributes` (
    `attributeID` INTEGER NOT NULL,
    `videoID` INTEGER NOT NULL,

    PRIMARY KEY (`attributeID`, `videoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `videolocations` (
    `locationID` INTEGER NOT NULL,
    `videoID` INTEGER NOT NULL,

    PRIMARY KEY (`locationID`, `videoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `video` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `apiDate` CHAR(10) NULL,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `height` INTEGER NOT NULL DEFAULT 0,
    `width` INTEGER NOT NULL DEFAULT 0,
    `starAge` INTEGER NULL,
    `siteID` INTEGER NULL,
    `websiteID` INTEGER NOT NULL,
    `starID` INTEGER NULL,
    `thumbnail` INTEGER NOT NULL DEFAULT 100,
    `added` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `api` VARCHAR(36) NULL,
    `cover` VARCHAR(191) NULL,
    `ignoreMeta` BOOLEAN NOT NULL DEFAULT false,
    `validated` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `video_path_key`(`path`),
    UNIQUE INDEX `video_api_key`(`api`),
    UNIQUE INDEX `video_cover_key`(`cover`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `website_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_videoID_fkey` FOREIGN KEY (`videoID`) REFERENCES `video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_categoryID_fkey` FOREIGN KEY (`categoryID`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plays` ADD CONSTRAINT `plays_videoID_fkey` FOREIGN KEY (`videoID`) REFERENCES `video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `site` ADD CONSTRAINT `site_websiteID_fkey` FOREIGN KEY (`websiteID`) REFERENCES `website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staralias` ADD CONSTRAINT `staralias_starID_fkey` FOREIGN KEY (`starID`) REFERENCES `star`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `starhaircolors` ADD CONSTRAINT `starhaircolors_hair_fkey` FOREIGN KEY (`hair`) REFERENCES `haircolor`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `starhaircolors` ADD CONSTRAINT `starhaircolors_starId_fkey` FOREIGN KEY (`starId`) REFERENCES `star`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `videoattributes` ADD CONSTRAINT `videoattributes_attributeID_fkey` FOREIGN KEY (`attributeID`) REFERENCES `attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `videoattributes` ADD CONSTRAINT `videoattributes_videoID_fkey` FOREIGN KEY (`videoID`) REFERENCES `video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `videolocations` ADD CONSTRAINT `videolocations_locationID_fkey` FOREIGN KEY (`locationID`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `videolocations` ADD CONSTRAINT `videolocations_videoID_fkey` FOREIGN KEY (`videoID`) REFERENCES `video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video` ADD CONSTRAINT `video_siteID_fkey` FOREIGN KEY (`siteID`) REFERENCES `site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video` ADD CONSTRAINT `video_websiteID_fkey` FOREIGN KEY (`websiteID`) REFERENCES `website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video` ADD CONSTRAINT `video_starID_fkey` FOREIGN KEY (`starID`) REFERENCES `star`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
