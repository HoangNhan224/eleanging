-- Run this after importing an older elearningphase2 dump that does not yet
-- contain the banner feature schema.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `banner` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` enum('course','group') NOT NULL,
  `examId` bigint NOT NULL,
  `topNumber` int NOT NULL,
  `isActive` tinyint DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Optional seed for environments that want an initial active banner.
-- Replace examId/topNumber as needed before executing.
-- INSERT INTO `banner` (`type`, `examId`, `topNumber`, `isActive`)
-- SELECT 'course', 3, 3, 1
-- WHERE NOT EXISTS (SELECT 1 FROM `banner`);