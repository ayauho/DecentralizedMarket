-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Хост: localhost:3306
-- Час створення: Трв 05 2022 р., 10:31
-- Версія сервера: 8.0.29-0ubuntu0.20.04.2
-- Версія PHP: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База даних: `fundariatest`
--

-- --------------------------------------------------------

--
-- Структура таблиці `marketevents`
--

CREATE TABLE `marketevents` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v1` varchar(42) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v2` varchar(42) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v3` varchar(42) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v4` varchar(42) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v5` varchar(42) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v6` varchar(42) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v7` varchar(42) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `v8` varchar(42) COLLATE utf8_unicode_ci NOT NULL,
  `v9` varchar(42) COLLATE utf8_unicode_ci NOT NULL,
  `block` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблиці `marketorders`
--

CREATE TABLE `marketorders` (
  `id` bigint UNSIGNED NOT NULL,
  `orderId` bigint UNSIGNED NOT NULL,
  `pId` int UNSIGNED NOT NULL,
  `byAddress` int UNSIGNED NOT NULL,
  `action` enum('0','1') CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `targetAsset` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `assetFor` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8_unicode_ci NOT NULL,
  `amount` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `targetAssetAmount` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `price` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `status` tinyint UNSIGNED NOT NULL,
  `time` int UNSIGNED NOT NULL,
  `executed` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблиці `useraddresses`
--

CREATE TABLE `useraddresses` (
  `id` bigint UNSIGNED NOT NULL,
  `address` varchar(42) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;

--
-- Індекси збережених таблиць
--

--
-- Індекси таблиці `marketevents`
--
ALTER TABLE `marketevents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`),
  ADD KEY `name_2` (`name`,`v3`,`v4`),
  ADD KEY `name_3` (`name`,`v4`,`v5`);

--
-- Індекси таблиці `marketorders`
--
ALTER TABLE `marketorders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`) USING BTREE,
  ADD KEY `time` (`time`),
  ADD KEY `pId` (`pId`,`byAddress`,`status`) USING BTREE,
  ADD KEY `pId_2` (`pId`,`status`,`orderId`);

--
-- Індекси таблиці `useraddresses`
--
ALTER TABLE `useraddresses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `address` (`address`);

--
-- AUTO_INCREMENT для збережених таблиць
--

--
-- AUTO_INCREMENT для таблиці `marketevents`
--
ALTER TABLE `marketevents`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблиці `marketorders`
--
ALTER TABLE `marketorders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблиці `useraddresses`
--
ALTER TABLE `useraddresses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
