-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 27, 2026 at 01:21 PM
-- Server version: 9.6.0
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `CommunityShare`
--

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

CREATE TABLE `listings` (
  `listingID` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `imageURL` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `userID` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`listingID`, `title`, `description`, `category`, `imageURL`, `status`, `userID`, `createdAt`) VALUES
(1, 'Old Textbooks', 'A collection of second year business textbooks in good condition', 'Books', '/uploads/oldtextbook.png\r\n', 'active', 1, '2026-03-22 23:39:10'),
(2, 'Camping Tent', 'Large 4 person tent, used twice, good condition', 'Other', '\r\n/uploads/tent1.png\r\n\r\n', 'active', 2, '2026-03-22 23:39:10'),
(3, 'Kitchen Blender', 'Barely used blender, all attachments included', 'Kitchen', '/uploads/blender.png\r\n', 'active', 3, '2026-03-22 23:39:10'),
(4, 'Winter Jacket', 'Size M winter jacket, very warm', 'Clothes', '/uploads/jacket.png\r\n', 'active', 1, '2026-03-22 23:39:10'),
(5, 'Drill and Toolkit', 'Full toolkit with drill, used but works perfectly', 'Tools', '/uploads/toolkit.png\r\n', 'active', 2, '2026-03-22 23:39:10'),
(6, 'Bootcut jeans', 'Barely worn bootcut jeans size 27, good condition', 'Clothes', '/uploads/1774279137437.png', 'active', 6, '2026-03-23 02:25:12'),
(7, 'adidas sneaker', 'worn twice, in a good condition\r\n', 'Shoes', '/uploads/1774279052865.png', 'active', 7, '2026-03-23 13:09:11');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `messageID` int NOT NULL,
  `senderID` int NOT NULL,
  `receiverID` int NOT NULL,
  `listingID` int DEFAULT NULL,
  `content` text NOT NULL,
  `isRead` tinyint DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `reportID` int NOT NULL,
  `listingID` int NOT NULL,
  `userID` int NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','reviewed','resolved') DEFAULT 'pending',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `email`, `passwordHash`, `location`, `createdAt`) VALUES
(1, 'amritaa123', 'amm33@email.com', 'hashedpassword1', 'London', '2026-03-22 23:39:10'),
(2, 'sarah99', 'sarah@email.com', 'hashedpassword2', 'Manchester', '2026-03-22 23:39:10'),
(3, 'josh', 'josh@email.com', 'hashedpassword3', 'Birmingham', '2026-03-22 23:39:10'),
(4, 'muna42', 'muna@email.com', 'hashedpassword4', 'London', '2026-03-22 23:39:10'),
(5, 'asd222', 'asd45@gmail.com', '$2b$10$0rGpe1Xo51CCp8nwX8l6n.aRi8q26tXIY2DQYlxPa8vTbQjEl63aO', NULL, '2026-03-23 02:11:42'),
(6, 'testuser', 'test@test.com', '$2b$10$IRIYkXbGhJZ3ijvpg3IZxujX5dB3XMHKFjAKjtcA4tMtQbfb9uziq', NULL, '2026-03-23 02:14:09'),
(7, 'am12', 'am12@gmail.com', '$2b$10$gruaaTDlX19slPV1I8RQh.sr.m.tV3abo9ai3L/vFLCNjefjEPT5i', NULL, '2026-03-23 13:02:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`listingID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageID`),
  ADD KEY `senderID` (`senderID`),
  ADD KEY `receiverID` (`receiverID`),
  ADD KEY `listingID` (`listingID`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`reportID`),
  ADD KEY `listingID` (`listingID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `listings`
--
ALTER TABLE `listings`
  MODIFY `listingID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `reportID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiverID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`listingID`) REFERENCES `listings` (`listingID`) ON DELETE SET NULL;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`listingID`) REFERENCES `listings` (`listingID`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;