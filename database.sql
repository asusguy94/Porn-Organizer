-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: 27. Feb, 2019 22:07 PM
-- Tjener-versjon: 10.3.7-MariaDB
-- PHP Version: 5.6.39

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `porn`
--
CREATE DATABASE IF NOT EXISTS `porn` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `porn`;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `attributes`
--

CREATE TABLE IF NOT EXISTS `attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `bookmarks`
--

CREATE TABLE IF NOT EXISTS `bookmarks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `videoID` int(11) NOT NULL,
  `categoryID` int(11) NOT NULL,
  `start` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `videoID` (`videoID`),
  KEY `start` (`start`),
  KEY `categoryID` (`categoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `country`
--

CREATE TABLE IF NOT EXISTS `country` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` char(2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `settings`
--

CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `similar_def` int(11) NOT NULL DEFAULT 8,
  `similar_max` int(11) NOT NULL DEFAULT 60,
  `similar_text` tinyint(1) NOT NULL DEFAULT 0,
  `cdn_max` tinyint(1) NOT NULL DEFAULT 2,
  `thumbnail_res` int(11) NOT NULL DEFAULT 290,
  `thumbnail_start` int(11) NOT NULL DEFAULT 100,
  `parser` tinyint(1) NOT NULL DEFAULT 0,
  `enable_webm` tinyint(1) NOT NULL DEFAULT 0,
  `enable_mkv` tinyint(1) NOT NULL DEFAULT 0,
  `enable_fa` tinyint(1) NOT NULL DEFAULT 0,
  `video_sql` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `sites`
--

CREATE TABLE IF NOT EXISTS `sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `websiteID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `websiteID` (`websiteID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `staralias`
--

CREATE TABLE IF NOT EXISTS `staralias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `starID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `starID` (`starID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `stars`
--

CREATE TABLE IF NOT EXISTS `stars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `haircolor` varchar(255) DEFAULT NULL,
  `eyecolor` varchar(255) DEFAULT NULL,
  `breast` varchar(255) DEFAULT NULL,
  `ethnicity` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `start` year(4) DEFAULT NULL,
  `end` year(4) DEFAULT NULL,
  `autoTaggerIgnore` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`) USING BTREE,
  UNIQUE KEY `image` (`image`),
  KEY `breast` (`breast`),
  KEY `haircolor` (`haircolor`) USING BTREE,
  KEY `eyecolor` (`eyecolor`) USING BTREE,
  KEY `ethnicity` (`ethnicity`),
  KEY `country` (`country`),
  KEY `birthdate` (`birthdate`),
  KEY `height` (`height`),
  KEY `weight` (`weight`),
  KEY `start` (`start`),
  KEY `end` (`end`),
  KEY `autoTaggerIgnore` (`autoTaggerIgnore`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `videoattributes`
--

CREATE TABLE IF NOT EXISTS `videoattributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `videoID` int(11) NOT NULL,
  `attributeID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `videoID` (`videoID`),
  KEY `attributeID` (`attributeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `videocategories`
--

CREATE TABLE IF NOT EXISTS `videocategories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `videoID` int(11) NOT NULL,
  `categoryID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `videoID` (`videoID`),
  KEY `categoryID` (`categoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `videos`
--

CREATE TABLE IF NOT EXISTS `videos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  `duration` int(11) NOT NULL DEFAULT 0,
  `starAge` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `path` (`path`),
  KEY `name` (`name`),
  KEY `date` (`date`),
  KEY `duration` (`duration`),
  KEY `starAge` (`starAge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `videosites`
--

CREATE TABLE IF NOT EXISTS `videosites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `videoID` int(11) NOT NULL,
  `siteID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `siteID` (`siteID`),
  KEY `videoID` (`videoID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `videostars`
--

CREATE TABLE IF NOT EXISTS `videostars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `starID` int(11) NOT NULL,
  `videoID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `starID` (`starID`),
  KEY `videoID` (`videoID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `videowebsites`
--

CREATE TABLE IF NOT EXISTS `videowebsites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `videoID` int(11) NOT NULL,
  `websiteID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `websiteID` (`websiteID`),
  KEY `videoID` (`videoID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `websites`
--

CREATE TABLE IF NOT EXISTS `websites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellstruktur for tabell `websitesites`
--

CREATE TABLE IF NOT EXISTS `websitesites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `websiteID` int(11) NOT NULL,
  `siteID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `websiteID` (`websiteID`),
  KEY `siteID` (`siteID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
