-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 20, 2023 at 05:34 PM
-- Server version: 10.3.37-MariaDB-0ubuntu0.20.04.1
-- PHP Version: 7.2.34-9+ubuntu20.04.1+deb.sury.org+1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dev_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `generalManagers`
--

CREATE TABLE `generalManagers` (
  `league` varchar(8) NOT NULL,
  `teamID` int(4) NOT NULL,
  `gmID` int(8) NOT NULL,
  `cogmID` int(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goalieAttributes`
--

CREATE TABLE `goalieAttributes` (
  `playerUpdateID` int(11) NOT NULL,
  `blocker` int(11) NOT NULL,
  `glove` int(11) NOT NULL,
  `passing` int(11) NOT NULL,
  `pokeCheck` int(11) NOT NULL,
  `positioning` int(11) NOT NULL,
  `rebound` int(11) NOT NULL,
  `recovery` int(11) NOT NULL,
  `puckhandling` int(11) NOT NULL,
  `lowShots` int(11) NOT NULL,
  `reflexes` int(11) NOT NULL,
  `skating` int(11) NOT NULL,
  `aggression` int(11) NOT NULL DEFAULT 8,
  `mentalToughness` int(11) NOT NULL,
  `determination` int(11) NOT NULL DEFAULT 15,
  `teamPlayer` int(11) NOT NULL DEFAULT 15,
  `leadership` int(11) NOT NULL DEFAULT 15,
  `goaltenderStamina` int(11) NOT NULL,
  `professionalism` int(11) NOT NULL DEFAULT 15
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dump of table migrations

DROP TABLE IF EXISTS `migrations`;

CREATE TABLE `migrations` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `migration` varchar(20) DEFAULT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;

INSERT INTO `migrations` (`id`, `migration`)
VALUES
    (1,'2023-01-15-000000'),(2,'2023-01-20-000000');;

/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Stand-in structure for view `goalieTPECounts`
-- (See below for the actual view)
--
CREATE TABLE `goalieTPECounts` (
`playerUpdateID` int(11)
,`appliedTPE` bigint(23)
,`bankedTPE` bigint(24)
);

-- --------------------------------------------------------

--
-- Table structure for table `lookup_goalieUpdateScale`
--

CREATE TABLE `lookup_goalieUpdateScale` (
  `attributeValue` int(11) NOT NULL,
  `pointCost` int(11) NOT NULL,
  `totalCost` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lookup_regression`
--

CREATE TABLE `lookup_regression` (
  `totalSeasons` int(11) NOT NULL,
  `regressionPct` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lookup_skaterUpdateScale`
--

CREATE TABLE `lookup_skaterUpdateScale` (
  `attributeValue` int(11) NOT NULL,
  `pointCost` int(11) NOT NULL,
  `totalCost` int(11) NOT NULL,
  `stamCost` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `playerInfo`
--

CREATE TABLE `playerInfo` (
  `userID` int(11) NOT NULL,
  `playerUpdateID` int(11) NOT NULL,
  `creationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `status` varchar(16) NOT NULL DEFAULT 'pending',
  `name` varchar(80) NOT NULL,
  `position` varchar(16) NOT NULL,
  `handedness` varchar(8) NOT NULL,
  `recruiter` varchar(80) DEFAULT NULL,
  `render` varchar(80) DEFAULT NULL,
  `jerseyNumber` int(3) DEFAULT NULL,
  `height` varchar(10) DEFAULT NULL,
  `weight` int(3) DEFAULT NULL,
  `birthplace` varchar(80) DEFAULT NULL,
  `totalTPE` int(5) NOT NULL DEFAULT 155,
  `season` int(11) DEFAULT NULL,
  `currentLeague` varchar(8) DEFAULT NULL,
  `currentTeamID` int(11) DEFAULT NULL,
  `shlRightsTeamID` int(11) DEFAULT NULL,
  `iihfNation` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refreshTokens`
--

CREATE TABLE `refreshTokens` (
  `uid` int(8) NOT NULL,
  `invalid` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `token` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seasons`
--

CREATE TABLE `seasons` (
  `season` int(4) NOT NULL,
  `startDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skaterAttributes`
--

CREATE TABLE `skaterAttributes` (
  `playerUpdateID` int(11) NOT NULL,
  `screening` int(11) NOT NULL,
  `gettingOpen` int(11) NOT NULL,
  `passing` int(11) NOT NULL,
  `puckhandling` int(11) NOT NULL,
  `shootingAccuracy` int(11) NOT NULL,
  `shootingRange` int(11) NOT NULL,
  `offensiveRead` int(11) NOT NULL,
  `checking` int(11) NOT NULL,
  `hitting` int(11) NOT NULL,
  `positioning` int(11) NOT NULL,
  `stickchecking` int(11) NOT NULL,
  `shotBlocking` int(11) NOT NULL,
  `faceoffs` int(11) NOT NULL,
  `defensiveRead` int(11) NOT NULL,
  `acceleration` int(11) NOT NULL,
  `agility` int(11) NOT NULL,
  `balance` int(11) NOT NULL,
  `speed` int(11) NOT NULL,
  `stamina` int(11) NOT NULL,
  `strength` int(11) NOT NULL,
  `fighting` int(11) NOT NULL,
  `aggression` int(11) NOT NULL,
  `bravery` int(11) NOT NULL,
  `determination` int(11) NOT NULL DEFAULT 15,
  `teamPlayer` int(11) NOT NULL DEFAULT 15,
  `leadership` int(11) NOT NULL DEFAULT 15,
  `temperament` int(11) NOT NULL DEFAULT 15,
  `professionalism` int(11) NOT NULL DEFAULT 15
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `skaterTPECounts`
-- (See below for the actual view)
--
CREATE TABLE `skaterTPECounts` (
`playerUpdateID` int(11)
,`appliedTPE` bigint(33)
,`bankedTPE` bigint(34)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `TPECounts`
-- (See below for the actual view)
--
CREATE TABLE `TPECounts` (
`playerUpdateID` int(11)
,`appliedTPE` bigint(33)
,`bankedTPE` bigint(34)
);

-- --------------------------------------------------------

--
-- Table structure for table `TPEEvents`
--

CREATE TABLE `TPEEvents` (
  `userID` int(11) NOT NULL,
  `playerUpdateID` int(11) NOT NULL,
  `TPEChange` int(11) NOT NULL,
  `taskType` varchar(80) NOT NULL,
  `taskID` int(11) NOT NULL,
  `taskDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `updateEvents`
--

CREATE TABLE `updateEvents` (
  `eventID` int(11) NOT NULL,
  `playerUpdateID` int(11) NOT NULL,
  `attributeChanged` varchar(80) NOT NULL,
  `oldValue` varchar(80) NOT NULL,
  `newValue` varchar(80) NOT NULL,
  `eventDate` datetime NOT NULL DEFAULT current_timestamp(),
  `performedByID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `goalieTPECounts`
--
DROP TABLE IF EXISTS `goalieTPECounts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`shl`@`localhost` SQL SECURITY DEFINER VIEW `goalieTPECounts`  AS  select `att`.`playerUpdateID` AS `playerUpdateID`,`blcost`.`totalCost` + `glcost`.`totalCost` + `pacost`.`totalCost` + `pccost`.`totalCost` + `pocost`.`totalCost` + `rbcost`.`totalCost` + `recost`.`totalCost` + `phcost`.`totalCost` + `lscost`.`totalCost` + `rfcost`.`totalCost` + `skcost`.`totalCost` + `mtcost`.`totalCost` + `gscost`.`totalCost` AS `appliedTPE`,`pi`.`totalTPE` - (`blcost`.`totalCost` + `glcost`.`totalCost` + `pacost`.`totalCost` + `pccost`.`totalCost` + `pocost`.`totalCost` + `rbcost`.`totalCost` + `recost`.`totalCost` + `phcost`.`totalCost` + `lscost`.`totalCost` + `rfcost`.`totalCost` + `skcost`.`totalCost` + `mtcost`.`totalCost` + `gscost`.`totalCost`) AS `bankedTPE` from ((((((((((((((`goalieAttributes` `att` left join `lookup_goalieUpdateScale` `blcost` on(`att`.`blocker` = `blcost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `glcost` on(`att`.`glove` = `glcost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `pacost` on(`att`.`passing` = `pacost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `pccost` on(`att`.`pokeCheck` = `pccost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `pocost` on(`att`.`positioning` = `pocost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `rbcost` on(`att`.`rebound` = `rbcost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `recost` on(`att`.`recovery` = `recost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `phcost` on(`att`.`puckhandling` = `phcost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `lscost` on(`att`.`lowShots` = `lscost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `rfcost` on(`att`.`reflexes` = `rfcost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `skcost` on(`att`.`skating` = `skcost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `mtcost` on(`att`.`mentalToughness` = `mtcost`.`attributeValue`)) left join `lookup_goalieUpdateScale` `gscost` on(`att`.`goaltenderStamina` = `gscost`.`attributeValue`)) join `playerInfo` `pi` on(`att`.`playerUpdateID` = `pi`.`playerUpdateID`)) ;

-- --------------------------------------------------------

--
-- Structure for view `skaterTPECounts`
--
DROP TABLE IF EXISTS `skaterTPECounts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`shl`@`localhost` SQL SECURITY DEFINER VIEW `skaterTPECounts`  AS  select `att`.`playerUpdateID` AS `playerUpdateID`,`sccost`.`totalCost` + `gocost`.`totalCost` + `pacost`.`totalCost` + `phcost`.`totalCost` + `shacost`.`totalCost` + `shrcost`.`totalCost` + `orcost`.`totalCost` + `chcost`.`totalCost` + `hicost`.`totalCost` + `pocost`.`totalCost` + `stcost`.`totalCost` + `sbcost`.`totalCost` + `focost`.`totalCost` + `drcost`.`totalCost` + `accost`.`totalCost` + `agcost`.`totalCost` + `bacost`.`totalCost` + `spcost`.`totalCost` + `stacost`.`stamCost` + `strcost`.`totalCost` + `ficost`.`totalCost` + `aggcost`.`totalCost` + `brcost`.`totalCost` AS `appliedTPE`,`pi`.`totalTPE` - (`sccost`.`totalCost` + `gocost`.`totalCost` + `pacost`.`totalCost` + `phcost`.`totalCost` + `shacost`.`totalCost` + `shrcost`.`totalCost` + `orcost`.`totalCost` + `chcost`.`totalCost` + `hicost`.`totalCost` + `pocost`.`totalCost` + `stcost`.`totalCost` + `sbcost`.`totalCost` + `focost`.`totalCost` + `drcost`.`totalCost` + `accost`.`totalCost` + `agcost`.`totalCost` + `bacost`.`totalCost` + `spcost`.`totalCost` + `stacost`.`stamCost` + `strcost`.`totalCost` + `ficost`.`totalCost` + `aggcost`.`totalCost` + `brcost`.`totalCost`) AS `bankedTPE` from ((((((((((((((((((((((((`skaterAttributes` `att` left join `lookup_skaterUpdateScale` `sccost` on(`att`.`screening` = `sccost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `gocost` on(`att`.`gettingOpen` = `gocost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `pacost` on(`att`.`passing` = `pacost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `phcost` on(`att`.`puckhandling` = `phcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `shacost` on(`att`.`shootingAccuracy` = `shacost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `shrcost` on(`att`.`shootingRange` = `shrcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `orcost` on(`att`.`offensiveRead` = `orcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `chcost` on(`att`.`checking` = `chcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `hicost` on(`att`.`hitting` = `hicost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `pocost` on(`att`.`positioning` = `pocost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `stcost` on(`att`.`stickchecking` = `stcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `sbcost` on(`att`.`shotBlocking` = `sbcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `focost` on(`att`.`faceoffs` = `focost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `drcost` on(`att`.`defensiveRead` = `drcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `accost` on(`att`.`acceleration` = `accost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `agcost` on(`att`.`agility` = `agcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `bacost` on(`att`.`balance` = `bacost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `spcost` on(`att`.`speed` = `spcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `stacost` on(`att`.`stamina` = `stacost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `strcost` on(`att`.`strength` = `strcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `ficost` on(`att`.`fighting` = `ficost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `aggcost` on(`att`.`aggression` = `aggcost`.`attributeValue`)) left join `lookup_skaterUpdateScale` `brcost` on(`att`.`bravery` = `brcost`.`attributeValue`)) join `playerInfo` `pi` on(`att`.`playerUpdateID` = `pi`.`playerUpdateID`)) ;

-- --------------------------------------------------------

--
-- Structure for view `TPECounts`
--
DROP TABLE IF EXISTS `TPECounts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`shl`@`localhost` SQL SECURITY DEFINER VIEW `TPECounts`  AS  select `skaterTPECounts`.`playerUpdateID` AS `playerUpdateID`,`skaterTPECounts`.`appliedTPE` AS `appliedTPE`,`skaterTPECounts`.`bankedTPE` AS `bankedTPE` from `skaterTPECounts` union select `goalieTPECounts`.`playerUpdateID` AS `playerUpdateID`,`goalieTPECounts`.`appliedTPE` AS `appliedTPE`,`goalieTPECounts`.`bankedTPE` AS `bankedTPE` from `goalieTPECounts` order by `appliedTPE` desc ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `generalManagers`
--
ALTER TABLE `generalManagers`
  ADD PRIMARY KEY (`league`,`teamID`);

--
-- Indexes for table `goalieAttributes`
--
ALTER TABLE `goalieAttributes`
  ADD PRIMARY KEY (`playerUpdateID`) USING BTREE;

--
-- Indexes for table `lookup_goalieUpdateScale`
--
ALTER TABLE `lookup_goalieUpdateScale`
  ADD PRIMARY KEY (`attributeValue`);

--
-- Indexes for table `lookup_skaterUpdateScale`
--
ALTER TABLE `lookup_skaterUpdateScale`
  ADD PRIMARY KEY (`attributeValue`);

--
-- Indexes for table `playerInfo`
--
ALTER TABLE `playerInfo`
  ADD PRIMARY KEY (`playerUpdateID`) USING BTREE;

--
-- Indexes for table `refreshTokens`
--
ALTER TABLE `refreshTokens`
  ADD PRIMARY KEY (`uid`) USING BTREE;

--
-- Indexes for table `seasons`
--
ALTER TABLE `seasons`
  ADD PRIMARY KEY (`season`);

--
-- Indexes for table `skaterAttributes`
--
ALTER TABLE `skaterAttributes`
  ADD PRIMARY KEY (`playerUpdateID`) USING BTREE;

--
-- Indexes for table `TPEEvents`
--
ALTER TABLE `TPEEvents`
  ADD PRIMARY KEY (`taskID`) USING BTREE;

--
-- Indexes for table `updateEvents`
--
ALTER TABLE `updateEvents`
  ADD PRIMARY KEY (`eventID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `playerInfo`
--
ALTER TABLE `playerInfo`
  MODIFY `playerUpdateID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TPEEvents`
--
ALTER TABLE `TPEEvents`
  MODIFY `taskID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `updateEvents`
--
ALTER TABLE `updateEvents`
  MODIFY `eventID` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
