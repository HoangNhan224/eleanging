CREATE DATABASE  IF NOT EXISTS `quizz` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `quizz`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: quizz
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category_course`
--

DROP TABLE IF EXISTS `category_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_course` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_course`
--

LOCK TABLES `category_course` WRITE;
/*!40000 ALTER TABLE `category_course` DISABLE KEYS */;
INSERT INTO `category_course` VALUES (1,'Programming','Programming courses teach fundamental concepts and skills required to develop software applications.','2023-12-02 17:56:11','2024-03-12 02:24:55'),(2,'Networking','Networking courses focus on the design, implementation, and management of computer networks.','2024-03-02 15:14:38','2024-03-12 00:35:02'),(3,'Cybersecurity','Cybersecurity courses cover techniques and practices to protect computer systems, networks, and data from cyber threats.','2024-01-03 08:23:59','2024-03-11 10:48:51'),(4,'Database Management','Database management courses explore the principles and techniques for organizing, storing, and retrieving data efficiently.','2023-08-23 16:48:53','2024-03-12 07:28:56'),(5,'Web Development','Web development courses focus on building and maintaining websites and web applications.','2023-08-14 16:56:56','2024-03-11 09:01:05');
/*!40000 ALTER TABLE `category_course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_exam`
--

DROP TABLE IF EXISTS `category_exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_exam` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_exam`
--

LOCK TABLES `category_exam` WRITE;
/*!40000 ALTER TABLE `category_exam` DISABLE KEYS */;
INSERT INTO `category_exam` VALUES (1,'Basic Exam','A basic exam covering the knowledge learned in the curriculum.','2023-05-29 23:26:12','2024-03-12 01:20:13'),(2,'Practical Exercise','A practical exercise to apply knowledge into practice.','2024-02-18 15:06:11','2024-03-11 23:05:52'),(3,'Final Exam','A final exam evaluating all the knowledge learned in a semester.','2023-10-15 09:15:11','2024-03-12 05:51:15'),(4,'Midterm Exam','A midterm exam assessing the learned knowledge after a certain period of time.','2023-04-25 00:24:21','2024-03-11 12:06:52'),(5,'Essay Exam','An essay exam requiring students to present opinions, viewpoints, or solve problems.','2024-01-08 01:39:01','2024-03-12 05:31:23');
/*!40000 ALTER TABLE `category_exam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_progress`
--

DROP TABLE IF EXISTS `course_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` bigint NOT NULL,
  `courseId` bigint NOT NULL,
  `completionStatus` tinyint(1) DEFAULT NULL,
  `progressPercentage` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `course_progress_courseId_userId_unique` (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `course_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `course_progress_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_progress`
--

LOCK TABLES `course_progress` WRITE;
/*!40000 ALTER TABLE `course_progress` DISABLE KEYS */;
INSERT INTO `course_progress` VALUES (1,1,1,0,6.02,'2023-04-29 06:56:25','2024-03-11 09:08:36'),(2,4,8,0,93.96,'2024-02-07 16:22:45','2024-03-11 23:39:08'),(3,4,4,0,77.15,'2023-05-08 07:02:48','2024-03-11 17:24:01'),(4,9,4,0,52.69,'2023-05-12 17:54:19','2024-03-11 09:33:52'),(5,10,4,0,42.8,'2023-03-24 17:51:49','2024-03-12 00:51:01'),(6,1,7,0,98.18,'2024-01-22 15:33:46','2024-03-11 10:45:24'),(7,1,5,0,71.89,'2023-06-12 11:40:55','2024-03-11 09:05:04'),(8,8,5,0,77.22,'2023-12-12 00:16:36','2024-03-11 14:03:03'),(9,2,2,0,86.32,'2023-05-16 10:54:22','2024-03-11 16:13:49'),(10,6,7,0,59.58,'2024-01-19 10:38:28','2024-03-12 02:36:14');
/*!40000 ALTER TABLE `course_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `categoryCourseId` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `summary` text,
  `assignedBy` bigint DEFAULT NULL,
  `durationInMinute` int DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `description` text,
  `locationPath` varchar(255) DEFAULT NULL,
  `prepare` text,
  `price` decimal(15,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `categoryCourseId` (`categoryCourseId`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`categoryCourseId`) REFERENCES `category_course` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,2,'Introduction to Programming','A comprehensive introduction to programming concepts and practices for beginners.',9,31,'2024-08-05 16:58:08','2024-06-26 13:44:02','This course provides a comprehensive introduction to programming concepts and practices for beginners. Topics covered include variables, data types, control structures, functions, and more.','/Applications','Cupio currus cerno vobis turba tredecim bibo tyrannus. Atque aeternus certus allatus taceo nulla ante architecto bos. Validus aut adeptio.',207.40,'2024-03-12 08:09:36','2024-03-12 06:34:16'),(2,2,'Web Development Basics','Learn the basics of web development including HTML, CSS, and JavaScript.',10,91,'2024-05-29 07:04:26','2024-10-19 19:02:27','Learn the basics of web development including HTML, CSS, and JavaScript. This course covers essential concepts for building static and interactive web pages.','/boot','Cupiditas terminatio adhuc vix pecus stabilis alter vix. Fugit dolorum textor aut tremo conor. Tibi cruciamentum vicissitudo amita ustilo totam hic.',476.42,'2024-03-12 08:09:36','2024-03-12 00:33:11'),(3,5,'Data Science Fundamentals','Explore the fundamentals of data science and analysis with real-world datasets.',8,108,'2024-07-28 15:50:49','2024-08-01 21:01:08','Explore the fundamentals of data science and analysis with real-world datasets. Learn how to clean, manipulate, and visualize data, as well as basic statistical analysis techniques.','/opt/share','Subvenio tamisium civis taceo. Ut avarus adipisci adsum via voluntarius. Casus turpis defendo.',111.41,'2024-03-12 08:09:36','2024-03-12 03:53:37'),(4,1,'Machine Learning Essentials','Discover essential concepts and techniques of machine learning algorithms.',5,31,'2024-12-04 22:06:43','2024-03-21 12:33:52','Discover essential concepts and techniques of machine learning algorithms. This course covers supervised and unsupervised learning, classification, regression, clustering, and more.','/usr','Aliquam asporto tutis absconditus admoneo ex verbera vulnero maiores. Viduo vulariter bos abutor. Decens clamo vulgaris.',575.53,'2024-03-12 08:09:36','2024-03-11 10:57:44'),(5,3,'JavaScript for Beginners','An introductory course covering the fundamentals of JavaScript programming language.',4,92,'2025-02-28 01:00:56','2025-01-02 17:26:31','An introductory course covering the fundamentals of JavaScript programming language. Topics include syntax, data types, functions, arrays, objects, and DOM manipulation.','/usr/local/bin','Cernuus cibo distinctio tristis baiulus totus appono audeo adamo tum. Amo calco cognatus veritatis nihil bene argentum error numquam. Cuius cado campana spargo atrocitas conservo adhuc appono.',227.74,'2024-03-12 08:09:36','2024-03-12 00:46:03'),(6,3,'Python Crash Course','Crash course in Python programming language for beginners.',4,109,'2024-11-10 13:56:13','2024-05-03 03:00:47','Crash course in Python programming language for beginners. Learn basic syntax, data structures, control flow, functions, and more. Suitable for those new to programming.','/opt','Suffoco conscendo conservo admoveo benigne tergeo. Vicinus creta vicissitudo. Colo arto tamquam tracto autus curriculum.',919.49,'2024-03-12 08:09:36','2024-03-11 19:55:14'),(7,3,'UX/UI Design Principles','Learn the principles and techniques of user experience (UX) and user interface (UI) design.',10,54,'2024-08-30 10:55:42','2024-03-17 15:55:17','Learn the principles and techniques of user experience (UX) and user interface (UI) design. Topics include usability principles, wireframing, prototyping, and user testing.','/usr/local/bin','Avaritia nisi tener tametsi. Valetudo audacia ultio assentator vigor crur quis ascisco. Centum corroboro conicio thymbra depereo asper tamquam at aperio.',842.95,'2024-03-12 08:09:36','2024-03-11 20:49:33'),(8,4,'Digital Marketing Fundamentals','Get started with the basics of digital marketing strategies and tools.',8,113,'2024-07-14 05:43:41','2024-06-15 23:46:56','Get started with the basics of digital marketing strategies and tools. Learn about SEO, SEM, social media marketing, email marketing, and analytics.','/etc/periodic','Bene ad illo fugiat sodalitas tabula pecto capto. Sperno advoco cribro arma aequitas damno succedo. Aptus villa abduco decretum aliqua valeo suggero quos trucido.',587.38,'2024-03-12 08:09:36','2024-03-12 01:59:07'),(9,5,'Project Management Basics','Introduction to project management methodologies and best practices.',9,77,'2024-07-08 21:50:21','2024-04-10 16:40:21','Introduction to project management methodologies and best practices. This course covers project planning, scheduling, budgeting, risk management, and stakeholder communication.','/etc/defaults','Urbanus quis veritatis dens vindico truculenter usus teneo cubicularis adinventitias. Cohaero decimus candidus adhuc eius exercitationem utrimque thema. Accedo terebro aspernatur.',245.65,'2024-03-12 08:09:36','2024-03-12 00:20:16'),(10,2,'Cybersecurity Fundamentals','Explore the fundamentals of cybersecurity and learn how to protect digital assets.',10,57,'2024-12-05 04:19:51','2024-08-20 11:17:37','Explore the fundamentals of cybersecurity and learn how to protect digital assets. Topics include threat assessment, encryption, network security, and incident response.','/opt/include','Appono careo vinculum sunt arcus suppono abscido vorago acsi. Terga pariatur termes commemoro torqueo stabilis. Cruciamentum cupressus tabernus angulus vorax vinco cernuus verbum socius.',580.43,'2024-03-12 08:09:36','2024-03-12 02:57:51');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `categoryExamId` bigint NOT NULL,
  `lessionId` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `durationInMinute` int DEFAULT NULL,
  `pointToPass` int DEFAULT NULL,
  `createrId` bigint DEFAULT NULL,
  `numberOfAttempt` tinyint DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `categoryExamId` (`categoryExamId`),
  KEY `lessionId` (`lessionId`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`categoryExamId`) REFERENCES `category_exam` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`lessionId`) REFERENCES `lessions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES (1,3,2,'Practice Exam','A mock exam designed to give students practice in preparation for the actual exam.',69,67,5,3,'2023-11-24 23:55:56','2024-03-12 07:28:10'),(2,5,9,'Take-Home Exam','An exam that students can complete outside of class, often with an extended time frame, allowing them to use resources and materials.',81,70,6,1,'2023-12-24 16:26:29','2024-03-11 20:45:13'),(3,2,2,'Practice Exam','A mock exam designed to give students practice in preparation for the actual exam.',57,51,7,2,'2023-10-27 06:13:04','2024-03-11 20:35:50'),(4,4,3,'Diagnostic Exam','An exam administered at the beginning of a course to assess the student\'s baseline knowledge and skills.',64,71,8,1,'2023-09-29 14:47:34','2024-03-11 12:22:12'),(5,1,10,'Diagnostic Exam','An exam administered at the beginning of a course to assess the student\'s baseline knowledge and skills.',53,51,9,1,'2023-03-24 10:13:31','2024-03-11 18:30:37'),(6,1,4,'Open-Book Exam','An exam where students are allowed to refer to their textbooks, notes, or other materials during the test.',99,68,9,3,'2024-02-01 18:48:31','2024-03-11 11:46:16');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams_questions`
--

DROP TABLE IF EXISTS `exams_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams_questions` (
  `examId` bigint NOT NULL,
  `questionId` bigint NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`examId`,`questionId`),
  UNIQUE KEY `exams_questions_questionId_examId_unique` (`examId`,`questionId`),
  KEY `questionId` (`questionId`),
  CONSTRAINT `exams_questions_ibfk_1` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `exams_questions_ibfk_2` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams_questions`
--

LOCK TABLES `exams_questions` WRITE;
/*!40000 ALTER TABLE `exams_questions` DISABLE KEYS */;
INSERT INTO `exams_questions` VALUES (1,14,'2023-05-22 14:11:17','2024-03-11 13:01:33'),(5,4,'2023-03-15 02:07:57','2024-03-12 07:26:19'),(5,12,'2024-02-06 10:52:29','2024-03-11 17:06:51'),(5,24,'2023-09-01 03:31:20','2024-03-11 14:32:11'),(5,29,'2023-03-15 01:09:11','2024-03-11 22:10:10'),(6,15,'2024-01-06 08:14:25','2024-03-11 12:00:37');
/*!40000 ALTER TABLE `exams_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lession_document`
--

DROP TABLE IF EXISTS `lession_document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lession_document` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lessionId` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` varchar(255) DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `order` bigint NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `locationPath` varchar(255) NOT NULL,
  `createdBy` bigint NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `lessionId` (`lessionId`),
  CONSTRAINT `lession_document_ibfk_1` FOREIGN KEY (`lessionId`) REFERENCES `lessions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lession_document`
--

LOCK TABLES `lession_document` WRITE;
/*!40000 ALTER TABLE `lession_document` DISABLE KEYS */;
INSERT INTO `lession_document` VALUES (1,9,'Introduction to Programming','This document provides an introduction to programming concepts and practices for beginners.',0,9,'An introductory document to programming for beginners.','/usr/libdata/phew.deploy',1,'2023-06-29 14:01:01','2024-03-12 00:53:46'),(2,4,'Web Development Basics','This document covers the basics of web development including HTML, CSS, and JavaScript.',0,7,'A document covering the basics of web development.','/opt/sbin/negligible.mp3',8,'2023-10-12 10:19:14','2024-03-11 08:10:09'),(3,2,'Data Science Fundamentals','This document explores the fundamentals of data science and analysis with real-world datasets.',0,2,'An overview document of data science fundamentals.','/srv/valiantly.list',2,'2024-03-08 10:16:53','2024-03-12 03:10:43'),(4,6,'Machine Learning Essentials','This document covers essential concepts and techniques of machine learning algorithms.',0,5,'A comprehensive guide to machine learning essentials.','/private/tmp/what_gently.png',8,'2023-11-22 15:58:21','2024-03-12 07:09:28'),(5,6,'JavaScript for Beginners','This document is an introductory guide to JavaScript programming language for beginners.',0,1,'An introductory document to JavaScript programming.','/etc/periodic/yuck.exe',4,'2023-03-27 03:24:44','2024-03-12 03:38:20'),(6,6,'Python Crash Course','This document provides a crash course in Python programming language for beginners.',0,6,'A crash course document on Python programming.','/bin/plaintive_greedily.jpeg',1,'2023-05-06 21:08:19','2024-03-11 19:01:16'),(7,5,'UX/UI Design Principles','This document covers the principles and techniques of user experience (UX) and user interface (UI) design.',0,9,'A document covering UX/UI design principles.','/usr/local/src/uh_huh_agonise_demanding.gif',6,'2023-09-03 09:14:45','2024-03-12 05:56:57'),(8,1,'Digital Marketing Fundamentals','This document introduces the basics of digital marketing strategies and tools.',1,6,'An overview document of digital marketing fundamentals.','/var/yp/monthly_quaintly.aac',9,'2023-10-10 16:17:30','2024-03-11 10:48:20'),(9,3,'Project Management Basics','This document provides an overview of project management methodologies and best practices.',1,4,'A document introducing project management basics.','/proc/midst.mjs',6,'2023-07-28 10:25:29','2024-03-11 20:40:04'),(10,1,'Cybersecurity Fundamentals','This document explores the fundamentals of cybersecurity and best practices for protecting digital assets.',0,4,'An overview document of cybersecurity fundamentals.','/System/oh_extremely.ts',6,'2023-03-31 16:19:34','2024-03-11 09:30:45');
/*!40000 ALTER TABLE `lession_document` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lession_pdf`
--

DROP TABLE IF EXISTS `lession_pdf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lession_pdf` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lessionId` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `order` bigint NOT NULL,
  `locationPath` varchar(255) NOT NULL,
  `uploadedBy` bigint NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `lessionId` (`lessionId`),
  CONSTRAINT `lession_pdf_ibfk_1` FOREIGN KEY (`lessionId`) REFERENCES `lessions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lession_pdf`
--

LOCK TABLES `lession_pdf` WRITE;
/*!40000 ALTER TABLE `lession_pdf` DISABLE KEYS */;
INSERT INTO `lession_pdf` VALUES (1,2,'Programming Basics Handbook','A comprehensive handbook on programming for beginners.','This handbook provides a comprehensive introduction to programming concepts and practices for beginners.',0,6,'/home/gah_snorkel.pdf',10,'2024-02-03 11:10:47','2024-03-11 22:12:07'),(2,5,'Web Development Guidebook','A guidebook covering the essentials of web development.','This guidebook covers essential concepts and techniques of web development including HTML, CSS, and JavaScript.',0,9,'/boot/defaults/bitterly_costly_rigidly.log',8,'2024-01-29 19:48:51','2024-03-11 15:10:27'),(3,3,'Data Science Primer','A primer document on data science fundamentals.','This primer explores the fundamentals of data science and analysis with real-world datasets.',1,8,'/rescue/reduce.list',8,'2024-03-11 13:55:38','2024-03-11 12:27:25'),(4,1,'Machine Learning Handbook','A comprehensive handbook on machine learning essentials.','This handbook covers essential concepts and techniques of machine learning algorithms.',1,7,'/sys/negligible_even_fervently.ini',7,'2023-10-26 01:24:25','2024-03-11 22:10:58'),(5,9,'JavaScript Essentials Manual','An introductory manual to JavaScript programming.','This manual is an introductory guide to JavaScript programming language for beginners.',1,9,'/media/yum_among.svg',4,'2024-02-22 21:40:15','2024-03-11 10:34:34'),(6,3,'Python Crash Course Guide','A crash course guide on Python programming.','This guide provides a crash course in Python programming language for beginners.',1,4,'/opt/above_ill_informed_although.mp3',2,'2023-12-09 19:23:00','2024-03-11 17:44:08'),(7,7,'UX/UI Design Principles Handbook','A handbook covering UX/UI design principles.','This handbook covers the principles and techniques of user experience (UX) and user interface (UI) design.',0,5,'/Network/separately_circa_besides.msi',1,'2023-11-05 16:54:51','2024-03-11 19:41:52'),(8,6,'Digital Marketing Fundamentals Guide','An overview guidebook of digital marketing fundamentals.','This guidebook introduces the basics of digital marketing strategies and tools.',1,2,'/var/spool/at_nor_circa.eot',5,'2023-09-12 22:56:20','2024-03-11 22:28:29'),(9,8,'Project Management Basics Manual','A manual introducing project management basics.','This manual provides an overview of project management methodologies and best practices.',1,8,'/proc/more_bottle.xlt',8,'2023-08-25 22:02:02','2024-03-11 08:55:41'),(10,7,'Cybersecurity Fundamentals Handbook','An overview handbook of cybersecurity fundamentals.','This handbook explores the fundamentals of cybersecurity and best practices for protecting digital assets.',0,3,'/usr/include/by_retrench_sick.bmp',1,'2023-03-25 05:36:03','2024-03-11 18:02:36');
/*!40000 ALTER TABLE `lession_pdf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lession_video`
--

DROP TABLE IF EXISTS `lession_video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lession_video` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lessionId` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `order` bigint NOT NULL,
  `locationPath` varchar(255) NOT NULL,
  `uploadedBy` bigint NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `lessionId` (`lessionId`),
  CONSTRAINT `lession_video_ibfk_1` FOREIGN KEY (`lessionId`) REFERENCES `lessions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lession_video`
--

LOCK TABLES `lession_video` WRITE;
/*!40000 ALTER TABLE `lession_video` DISABLE KEYS */;
INSERT INTO `lession_video` VALUES (1,7,'Programming Basics Handbook','A comprehensive handbook on programming for beginners.','This handbook provides a comprehensive introduction to programming concepts and practices for beginners.',0,1,'/home/user/while.img',7,'2023-03-13 13:23:59','2024-03-11 15:34:31'),(2,6,'Web Development Guidebook','A guidebook covering the essentials of web development.','This guidebook covers essential concepts and techniques of web development including HTML, CSS, and JavaScript.',1,1,'/var/loathsome_unhand.xls',9,'2023-09-17 09:11:25','2024-03-11 19:38:47'),(3,2,'Data Science Primer','A primer document on data science fundamentals.','This primer explores the fundamentals of data science and analysis with real-world datasets.',0,10,'/opt/include/incise_lecture_which.xht',9,'2023-05-02 06:40:08','2024-03-11 13:22:54'),(4,8,'Machine Learning Handbook','A comprehensive handbook on machine learning essentials.','This handbook covers essential concepts and techniques of machine learning algorithms.',1,9,'/lost+found/dimly_pro.list',7,'2023-05-21 18:10:53','2024-03-11 15:39:10'),(5,6,'JavaScript Essentials Manual','An introductory manual to JavaScript programming.','This manual is an introductory guide to JavaScript programming language for beginners.',0,6,'/var/weekend.m3a',7,'2023-05-31 19:11:14','2024-03-11 15:38:49'),(6,3,'Python Crash Course Guide','A crash course guide on Python programming.','This guide provides a crash course in Python programming language for beginners.',0,9,'/usr/libexec/down.shtml',2,'2023-09-18 04:37:43','2024-03-11 10:18:47'),(7,6,'UX/UI Design Principles Handbook','A handbook covering UX/UI design principles.','This handbook covers the principles and techniques of user experience (UX) and user interface (UI) design.',1,3,'/usr/libdata/actually_atomise.bin',2,'2023-04-14 12:32:14','2024-03-11 12:32:41'),(8,1,'Digital Marketing Fundamentals Guide','An overview guidebook of digital marketing fundamentals.','This guidebook introduces the basics of digital marketing strategies and tools.',1,10,'/lost+found/midst.mar',4,'2023-09-16 10:43:31','2024-03-12 00:23:36'),(9,9,'Project Management Basics Manual','A manual introducing project management basics.','This manual provides an overview of project management methodologies and best practices.',1,4,'/proc/before_nor.abw',5,'2023-09-10 17:41:03','2024-03-11 23:33:55'),(10,9,'Cybersecurity Fundamentals Handbook','An overview handbook of cybersecurity fundamentals.','This handbook explores the fundamentals of cybersecurity and best practices for protecting digital assets.',1,2,'/rescue/occupation_boo.mpga',2,'2023-12-24 00:53:08','2024-03-11 11:39:37');
/*!40000 ALTER TABLE `lession_video` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessions`
--

DROP TABLE IF EXISTS `lessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `courseId` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `lessions_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessions`
--

LOCK TABLES `lessions` WRITE;
/*!40000 ALTER TABLE `lessions` DISABLE KEYS */;
INSERT INTO `lessions` VALUES (1,3,'Introduction to Programming Basics','An introductory lession covering the basics of programming for beginners.','2023-08-28 02:47:31','2024-03-11 15:27:36'),(2,5,'Understanding Web Development Fundamentals','A lession aimed at providing understanding of essential concepts and techniques in web development.','2024-01-02 07:52:57','2024-03-11 08:36:38'),(3,1,'Exploring Data Science Essentials','A lession exploring the fundamentals of data science with real-world datasets.','2024-03-02 06:04:47','2024-03-11 18:55:07'),(4,8,'Mastering Machine Learning Techniques','A lession aimed at mastering essential concepts and techniques of machine learning algorithms.','2023-07-27 19:42:16','2024-03-11 10:27:09'),(5,5,'Essential Concepts of JavaScript Programming','A lession introducing essential concepts of JavaScript programming language.','2023-08-19 08:50:06','2024-03-11 19:03:27'),(6,6,'Python Programming Crash Course','A lession providing a crash course in Python programming language.','2023-07-30 09:58:17','2024-03-12 05:56:34'),(7,9,'Principles of UX/UI Design','A lession covering the principles and techniques of user experience (UX) and user interface (UI) design.','2023-10-27 08:27:28','2024-03-12 01:17:45'),(8,4,'Foundations of Digital Marketing Strategies','A lession introducing the foundations of digital marketing strategies and tools.','2023-07-16 05:32:07','2024-03-11 16:18:49'),(9,6,'Project Management Basics and Best Practices','A lession providing an overview of project management methodologies and best practices.','2023-12-30 03:51:00','2024-03-12 05:19:33'),(10,7,'Fundamentals of Cybersecurity','A lession covering the fundamentals of cybersecurity and best practices for protecting digital assets.','2023-06-09 09:31:43','2024-03-11 14:14:52');
/*!40000 ALTER TABLE `lessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES (1,'P1','Delete User','2023-11-25 11:16:05','2024-03-11 23:13:19'),(2,'P2','View Dashboard','2023-12-09 21:34:14','2024-03-12 03:01:41'),(3,'P3','Edit Profile','2023-06-07 23:54:35','2024-03-11 10:50:26');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_discussion`
--

DROP TABLE IF EXISTS `question_discussion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_discussion` (
  `userId` bigint NOT NULL,
  `questionId` bigint NOT NULL,
  `comment` text NOT NULL,
  `like` int DEFAULT NULL,
  `unlike` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`userId`,`questionId`),
  UNIQUE KEY `question_discussion_questionId_userId_unique` (`userId`,`questionId`),
  KEY `questionId` (`questionId`),
  CONSTRAINT `question_discussion_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `question_discussion_ibfk_2` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_discussion`
--

LOCK TABLES `question_discussion` WRITE;
/*!40000 ALTER TABLE `question_discussion` DISABLE KEYS */;
INSERT INTO `question_discussion` VALUES (1,27,'Let\'s brainstorm ideas to improve the clarity of the question stem.',NULL,NULL,'2023-05-18 21:24:35','2024-03-11 15:38:43'),(2,13,'There is a debate regarding the correctness of option C. We need clarification from subject matter experts.',NULL,NULL,'2023-10-11 14:20:33','2024-03-11 18:08:00'),(3,6,'It would be helpful to provide references supporting the explanation.',NULL,NULL,'2023-05-26 23:33:00','2024-03-11 16:20:27'),(3,18,'The discussion on this question has diverged from the main topic. Can we refocus?',NULL,NULL,'2023-05-01 21:36:16','2024-03-11 17:56:29'),(5,26,'Is there any alternative approach to solving this question?',NULL,NULL,'2023-05-28 08:13:10','2024-03-11 19:26:31'),(5,29,'I suggest adding more distractors to make the multiple-choice options more challenging.',NULL,NULL,'2023-10-11 14:05:55','2024-03-11 15:37:14'),(8,10,'There seems to be a mistake in the explanation provided for option B.',NULL,NULL,'2024-02-10 10:52:34','2024-03-11 17:58:57'),(9,8,'The discussion thread for this question needs moderation due to inappropriate comments.',NULL,NULL,'2024-02-14 03:07:18','2024-03-11 17:37:21'),(9,25,'The difficulty level of this question is too high for beginners.',NULL,NULL,'2023-04-26 00:10:09','2024-03-11 12:25:06'),(10,15,'Can we add more context to the discussion thread for better understanding?',NULL,NULL,'2023-07-24 04:26:16','2024-03-11 19:09:49');
/*!40000 ALTER TABLE `question_discussion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `instruction` text,
  `content` text,
  `type` varchar(255) DEFAULT NULL,
  `a` text,
  `b` text,
  `c` text,
  `d` text,
  `e` text,
  `f` text,
  `g` text,
  `h` text,
  `i` text,
  `j` text,
  `k` text,
  `l` text,
  `m` text,
  `n` text,
  `o` text,
  `p` text,
  `answer` text,
  `explanation` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'Select the right response:','What is the capital of France?','MULTIPLE_CHOICE','Conor adamo conicio eos iure.','Deorsum utroque tunc vulnus deduco ea.','Talio supra tempus adduco.','Clibanus delicate depraedor cometes patior.','Tergo decipio adiuvo quae velum timidus currus virtus.','Decipio ante consequuntur volva curso patruus deduco.','Balbus verbera turbo facere trucido depopulo caries voluptas trucido.','Degusto ex acquiro vesica comis ultra solitudo ipsum adeptio.','Tenus tenax verto.','Comis voro stabilis cursim tantum tremo solio administratio.','Virgo voluptatum apostolus agnosco.','Arbustum averto alo atrox.','Carus patruus cohibeo viduo adipisci cogo comprehendo confugo sursum curto.','Paens est excepturi commodo.','Audio infit consectetur pariatur sodalitas culpo crustulum tolero appono conservo.','Tabula nobis dolor ipsa.','p','Paris is the capital of France.','2024-01-14 04:32:10','2024-03-12 00:40:06'),(2,'Choose the correct answer:','What is the sum of 2 + 2?','SINGLE_CHOICE','Undique vox defluo acidus trado textor.','Vulpes nostrum testimonium deinde subseco demonstro vulariter arceo varietas studio.','Alias uberrime trucido illum natus allatus.','Summopere tyrannus voveo allatus ut sopor voluptate verumtamen.','Subvenio adipisci aequus desino ullus varietas corrigo suasoria aliqua.','Canonicus vorago adulatio audeo thesaurus occaecati verto porro tergo.','Copia cuius solutio nihil conturbo aspicio summa.','Delibero dens validus utpote attonbitus conicio.','Defaeco angustus cometes deludo.','Adulatio venio defleo appono synagoga ustilo tribuo.','Possimus porro tantum tricesimus varius tamisium deludo conforto.','Curriculum deripio explicabo aduro avaritia.','Iure occaecati ex apud quo.','Thalassinus tego possimus coadunatio aeger utrimque textilis eaque defetiscor.','Confero debeo tui bellicus teneo.','Sopor deprecator absens.','h','The sum of 2 + 2 is 4.','2023-06-26 03:49:40','2024-03-11 20:42:23'),(3,'Indicate the correct choice:','Who wrote \'Romeo and Juliet\'?','SINGLE_CHOICE','Illo adipiscor attonbitus conculco.','Cavus hic quam vergo debilito suffragium thymum vociferor.','Cursim bonus cotidie soleo cibus denego chirographum agnitio demo.','Aspernatur ver comprehendo volup voluptas ater.','Suppellex copiose brevis animadverto numquam tempus.','Voluptas credo summa bardus.','Dicta vester blandior undique defessus callide minus abscido accusator.','Vigilo vulticulus totam ventosus tergiversatio aegrus.','Ager vitium veritatis cauda caelestis abundans volva.','Cogito amita curiositas amissio ubi aptus.','Audentia combibo ulterius adaugeo sui autem cunae celer.','Demonstro voluntarius vado viriliter ut adhuc dedico.','Solio quisquam desipio tribuo placeat valde.','Suscipit cuius alioqui civis addo carpo.','Eligendi illo aperiam delectus vesica.','At caveo utor canis capto aurum cohaero asper.','b','\'Romeo and Juliet\' was written by William Shakespeare.','2023-10-29 21:22:24','2024-03-12 05:35:05'),(4,'Indicate the correct choice:','What is the chemical symbol for water?','TRUE_FALSE','Comprehendo candidus comparo.','Atque deficio vicinus solus artificiose cumque amita.','Et aufero cur supra vulgaris cursus caelestis universe vigilo conventus.','Demergo carmen ait tondeo molestiae ab tenax aliquam admoneo.','Adimpleo consuasor usitas crastinus.','Vitium tibi quod nemo ulciscor aeneus angulus vetus.','Vado adulescens suppellex allatus.','Thorax deleniti ceno currus.','Sunt conitor thermae summopere vulpes aureus aegre bonus temptatio nulla.','Aedificium sustineo defessus.','Tempus deduco curtus cenaculum tero cibus.','Via succurro dolorum tredecim adicio aggero unus.','Corroboro solum acquiro sublime cursim attero dedico beatae.','Tenus denuo peior victus audio tabula.','Callide vobis ulterius ustulo.','Atavus sperno terra teres.','l','The chemical symbol for water is H2O.','2023-07-30 15:16:32','2024-03-12 05:34:08'),(5,'Select the appropriate option:','What is the largest mammal on Earth?','TRUE_FALSE','Defungo appono apto vesica.','Repellendus acies suppono tabella cedo exercitationem uxor illum tantillus.','Bellicus volubilis tertius denique tabernus appositus spes cubitum advoco nemo.','Stips candidus deduco viduo repudiandae comitatus clibanus.','Nobis delectus thymbra curtus voluptatem delibero appello defessus demitto.','Causa virgo triduana tego tergiversatio derelinquo celo ut.','Quis ago cervus.','Tredecim officiis vulticulus adopto vulgus thema subseco astrum.','Paens delinquo vos.','Similique aer comes sub.','Delinquo in delectatio dicta absconditus caelestis debeo coaegresco cubitum.','Repellat cilicium ascit illo absconditus aperte provident.','Vita corpus talus curatio terminatio ubi abduco absens clibanus ubi.','Utor uberrime optio non conscendo vomica nulla abeo cibus.','Rem delectus corroboro.','Veniam cohibeo dignissimos sophismata admiratio corrumpo coma quod atqui.','f','The Blue Whale is the largest mammal on Earth.','2023-08-01 02:21:03','2024-03-11 22:03:24'),(6,'Indicate the correct choice:','What is the boiling point of water?','MULTIPLE_CHOICE','Celer doloribus anser cenaculum cubitum verbera tabella distinctio.','Soleo necessitatibus viridis torrens artificiose stabilis callide.','Constans vergo vaco fugit curis adulatio color acerbitas arcesso thymum.','Defleo ter totus adinventitias volva.','Patruus facilis aliqua degusto cavus assentator sto sumptus coaegresco.','Cilicium amicitia tantum spiculum impedit corroboro.','Nisi coniuratio amita conscendo deficio.','Subiungo depromo consequatur adulatio tersus sui succurro uberrime deporto carcer.','Magnam accusantium aufero venustas advenio.','Victoria casso trado animus volup aqua benigne.','Terra creo tumultus arbor amo tabernus itaque sufficio.','Virgo coerceo non nobis abbas tamen decor pecco thymum calco.','Ulterius dolore caecus nostrum sustineo.','Asperiores aeneus animadverto absque magni denuo allatus.','Succedo ratione decerno at.','Debilito arguo strenuus cursus aeternus pax statim cetera desolo.','f','The boiling point of water is 100°C.','2023-04-05 20:31:38','2024-03-12 05:46:12'),(7,'Select the right response:','Which planet is known as the Red Planet?','SINGLE_CHOICE','Desipio tum amplitudo cunctatio corroboro textilis facere cubo.','Despecto canto summa blandior adnuo stipes.','Voluptatem maxime ulterius territo aegrus abbas.','Bestia uredo ulciscor sulum xiphias vox.','Clarus animus video adulescens celer.','Alveus tantum ubi coepi canis tergiversatio claudeo.','Animadverto varietas conscendo aegre spiritus dignissimos cruciamentum.','Teneo certus deinde inflammatio nostrum beatae quos distinctio cui.','Cruentus crepusculum cibo summopere cruciamentum.','Clarus damnatio vitium.','Tempora harum tergeo tres altus venio crebro.','Bis basium vilicus coerceo summisse reiciendis clibanus vaco acervus spectaculum.','Recusandae bis aperio.','Alioqui arx voluntarius succedo vae.','Somnus clibanus velit canto.','Cedo nemo acies.','n','Mars is known as the Red Planet.','2024-01-11 22:53:26','2024-03-12 00:15:32'),(8,'Choose the most suitable option:','Who painted the Mona Lisa?','MULTIPLE_CHOICE','Tamen temeritas utique cunae claustrum varius cilicium ex adsuesco.','Tenetur voveo contego defessus fugit aggero cultura.','Somniculosus arguo tempora acceptus.','Iure cumque sperno degenero ullus.','Absens casso adeptio chirographum culpo vergo audentia statim creator amitto.','Similique subseco amaritudo confido.','Suppellex vorax vitae commemoro urbs.','Vespillo versus beneficium.','Avarus casus arbustum.','Cenaculum adflicto curto despecto cubicularis cohors aperiam est avarus.','Corona tenax vestigium.','Cornu dolore vespillo similique.','Convoco arca defetiscor.','Comitatus auctor recusandae.','Una vos uxor vita cribro denique maiores.','Conicio subvenio tamdiu contra arca.','b','The Mona Lisa was painted by Leonardo da Vinci.','2023-04-07 23:16:00','2024-03-11 08:45:51'),(9,'Choose the correct answer:','What is the primary ingredient in guacamole?','MULTIPLE_CHOICE','Vesper barba spiculum laudantium degero acquiro cribro.','Acies infit curtus acquiro voluntarius laborum absum.','Artificiose adulatio spiculum ipsa termes supellex alveus tabula cetera attonbitus.','Defetiscor ter sum cursus bis angustus.','Verecundia tam sono auditor sortitus subiungo.','Cunabula amo ventito vulnero.','Aperio certe patria.','Annus callide thorax angulus pecus deleniti.','Arca ater appello civitas coadunatio spargo autem cena.','Suffoco vos aduro bonus amplitudo aestivus.','Comedo repellat titulus voluptate calamitas.','Odit creptio sordeo.','Vis statua tepesco crinis succurro iusto quis crastinus.','Suggero apud ad.','Subnecto recusandae compono tenus depromo crebro enim audio.','Vitiosus crustulum alius aegrotatio arto synagoga consequatur amaritudo demens.','m','The primary ingredient in guacamole is avocado.','2024-01-25 12:01:19','2024-03-11 15:43:39'),(10,'Choose the most suitable option:','Who was the first president of the United States?','MULTIPLE_CHOICE','Aveho aggero eaque peccatus thalassinus acies.','Curo claudeo vitae vae testimonium coma cupiditate cauda.','Sodalitas acidus assentator testimonium quaerat tristis antiquus.','Tantillus solutio commodo pariatur acidus debeo vester architecto.','Animus summisse cornu universe adsum coerceo debitis comparo corpus argentum.','Annus ipsa vulgus aqua quia crebro collum acervus cupiditate approbo.','Comitatus voluptates territo cur appositus arbitro pauper annus temeritas.','Claro illo hic peccatus concedo voluptate solitudo.','Acerbitas baiulus carmen adimpleo peccatus.','Eum vulticulus exercitationem deduco tripudio.','Harum degusto via maxime harum peccatus culpo.','Vox nihil vespillo tracto alter vespillo blanditiis vos peior.','Chirographum uberrime cedo sperno deorsum statua.','Adficio arbitro aedificium aestivus adopto subseco demo adfero vae admoneo.','Volo rem versus undique aspicio brevis altus alioqui adversus.','Unde contigo spargo patria pauci ad suspendo ter arceo crustulum.','l','George Washington was the first president of the United States.','2023-08-05 09:19:59','2024-03-11 14:30:07'),(11,'Select the appropriate option:','What is the square root of 64?','SINGLE_CHOICE','Totidem adeptio quasi.','Eos cohors ambulo attonbitus sustineo astrum vinco.','Defero deduco aurum adipisci caritas vomer.','Tepesco solutio adaugeo voluntarius ratione contigo.','Pel valde utilis amo totam vesper video amitto.','Apto cedo beatae contigo.','Solio spero decens virtus.','Tergeo testimonium cras.','Depopulo decet vomito vociferor demonstro teneo ambitus.','Tunc cetera combibo.','Necessitatibus suscipio virtus adnuo cogito bardus soluta.','Auctor coepi tepidus non desipio unde uterque sto coepi ceno.','Aliquid dignissimos sum trado succurro cohibeo uterque vereor viridis custodia.','Clamo thymbra aperte capio certe.','Valens eum claustrum victus defungo atavus terminatio.','Vulgo bestia civitas deprimo utique.','l','The square root of 64 is 8.','2024-02-16 16:40:15','2024-03-12 03:45:53'),(12,'Select the appropriate option:','Who is known as the \'Father of Modern Physics\'?','SINGLE_CHOICE','Adversus voveo suscipit amicitia nulla adsuesco fugiat.','Virtus suus templum annus abscido consequuntur arcesso sumo eius sublime.','Aestus curiositas dapifer volutabrum.','Consequatur sursum socius degero.','Tamen terebro vigilo suspendo mollitia acidus arto debilito abbas.','Vitiosus supra vigilo vilitas uter vallum cohibeo magni.','Aspicio demulceo tutamen vesco animadverto molestias contigo cupiditas tamquam abundans.','Tyrannus soleo comitatus.','Libero carbo antea ullam cimentarius cotidie.','Curo voluntarius abutor depromo.','Convoco pauper carbo vado adamo deficio coadunatio argumentum tabgo colo.','Demoror angulus conatus odio.','Utpote sollers vorax suspendo umbra succedo adaugeo agnitio harum.','Sursum convoco consequatur arca apostolus adipisci cultellus.','Currus amoveo adsum thorax ipsum tempora cerno.','Consequuntur ubi acceptus nulla conitor tracto ea clibanus.','e','Albert Einstein is known as the \'Father of Modern Physics\'.','2023-07-04 01:15:23','2024-03-11 14:29:06'),(13,'Select the right response:','What is the largest organ in the human body?','TRUE_FALSE','Illum talio depromo ara.','Nam in velociter provident similique cogito tubineus casus.','Consuasor paens denuo volo.','Tepesco canto solio.','Coma surgo audio varietas explicabo.','Antepono supra utpote solio delectus tergeo ullam ars nulla ipsa.','Tabella amoveo utpote sit anser capillus fuga cultura absens.','Cedo vorax contigo cotidie pecus apto tener colligo concedo.','Turba aestivus usus animadverto comminor acies pauper correptius aveho.','Adsuesco aperio vestrum absum tripudio succurro adeptio vis.','Traho bonus balbus quae aptus deporto tepesco spiculum ante.','Decumbo viridis concedo tabernus versus admoveo.','Decor corrupti crux vel succedo succedo alioqui eveniet suscipit.','Deputo capillus delinquo adduco ex crebro.','Rem tantillus alius.','Baiulus explicabo perspiciatis viscus creptio ambitus vinum arx assumenda.','k','Skin is the largest organ in the human body.','2023-10-25 22:45:41','2024-03-12 07:49:59'),(14,'Indicate the correct choice:','Who developed the theory of relativity?','MULTIPLE_CHOICE','Pax curso adsuesco tunc laboriosam clamo vacuus.','Taedium candidus odit venustas cito quasi.','Arbustum amitto laborum denuncio capio coepi credo cuius aranea approbo.','Saepe ducimus vulariter.','Color esse coruscus.','Conqueror ratione eum a.','Veritatis demitto provident turpis degenero stella volutabrum asperiores verbum auxilium.','Eum a ago.','Varietas amor utrimque tenax substantia quos conor articulus accusantium.','Arbor bis auditor voluptate subito cohors crustulum cavus eos.','Admiratio rerum inflammatio cibo vergo.','Laborum sollicito officiis cupiditas.','Adopto amoveo aperio attero acceptus calculus cattus usus amitto.','Versus colo tero videlicet magni beatae.','Appositus possimus corrumpo.','Vacuus amissio volup ventus combibo decumbo desolo iure.','k','Albert Einstein developed the theory of relativity.','2023-12-05 08:03:01','2024-03-11 18:26:26'),(15,'Choose the correct answer:','What is the capital of Japan?','MULTIPLE_CHOICE','Uredo cedo aptus texo.','Clibanus comptus supra claro synagoga error.','Soleo correptius vereor demens cavus.','Accusator varius corporis peccatus.','Occaecati vere curo acerbitas peccatus vae trucido impedit.','Constans claustrum vitiosus adsidue combibo alias.','Tero vir centum damno adamo suffoco causa.','Aveho supellex arca molestiae aliquid perspiciatis vallum decimus crux tepesco.','Vindico subiungo absorbeo color.','Speculum demitto amissio suppono.','Eius deludo combibo repellat testimonium textilis chirographum testimonium taceo aeternus.','Ciminatio cursim supplanto cur.','Accusantium uxor adversus animus aegrus explicabo.','Accedo tepidus stultus clamo decretum vix id derideo stillicidium.','Tabella deludo denego ara decretum amitto apto thema solium tamisium.','Caecus virga uter.','m','Tokyo is the capital of Japan.','2023-09-03 04:19:41','2024-03-11 19:18:31'),(16,'Choose the correct answer:','What is the chemical formula for table salt?','MULTIPLE_CHOICE','Acquiro creta civis laborum.','Ambitus cum cena acerbitas ter.','Agnosco tendo earum velum vociferor bibo porro deduco totus.','Callide patior utpote confido.','Talio valde una adversus dapifer undique.','Cur caries vesica suus stabilis animi.','Ulciscor absorbeo cito supra consuasor contego undique eligendi quas.','Adeo subiungo desparatus curvo.','Desino sollicito perferendis creber delectus.','Accendo vita arto crastinus cultellus theca numquam corrupti caritas via.','Calamitas trepide antepono arbitro amor advoco cuppedia placeat basium depopulo.','Sursum itaque blandior vobis adopto adeptio ea.','Apud atqui caste canis.','Adinventitias amoveo thorax arbor.','Amet vergo porro suffoco curtus umerus tamdiu aliqua quisquam aurum.','Aestivus arcesso arto cicuta cornu cena.','p','The chemical formula for table salt is NaCl.','2023-04-06 07:25:47','2024-03-11 14:01:57'),(17,'Choose the most suitable option:','Who wrote \'To Kill a Mockingbird\'?','TRUE_FALSE','Cursim ipsa delectatio.','Arbitro optio eum circumvenio aeneus tollo cariosus.','Possimus blanditiis catena optio angustus pauper universe vae tempore sunt.','Velit vinco voluptates.','Thorax recusandae ad annus carcer.','Sapiente impedit comminor demens cibo inflammatio attero caritas.','Charisma odio ambitus eligendi verbum conventus.','Admoveo sulum calamitas.','Curriculum deprecator cruentus tristis adulescens strues desolo.','Texo blanditiis eum vitae combibo deduco.','Commodi statua cenaculum amplexus aliquid crebro circumvenio vilis.','Demulceo contego soluta stips cohaero urbs deprecator thermae vomica certus.','Varietas admoneo acidus comprehendo turba cito surculus voco sufficio.','Debeo agnitio occaecati adfero sufficio.','Laudantium cruciamentum ambitus tabella porro appono tametsi urbanus quaerat vos.','Supra tabgo absque agnitio aro unde terminatio sustineo.','d','\'To Kill a Mockingbird\' was written by Harper Lee.','2023-10-04 21:14:24','2024-03-11 15:55:00'),(18,'Select the right response:','What is the symbol for the element gold?','SINGLE_CHOICE','Decens color temporibus quidem.','Cultellus aperio allatus aegrotatio contra sophismata angelus.','Abstergo vilitas annus defessus averto statua caute amplexus despecto terminatio.','Condico iste vicinus vergo vulnero.','In dolores cras umerus coadunatio delego collum adulatio alter.','Cohors exercitationem voluntarius administratio earum cupiditate adulatio curiositas.','Usus temeritas thesis decretum coerceo decens blanditiis utrimque.','Decens summopere ratione adaugeo.','Vulpes solvo deficio defendo cultellus deorsum accedo video voluptatum.','Dolor patior quas ademptio.','Deorsum pecto socius voluptatibus thorax vicinus cibus ait.','Aureus admoveo depromo aequus sursum ulterius aequitas verus combibo.','Caste tondeo auctus inflammatio adversus adnuo voluntarius socius.','Ubi decens tremo suscipit caelestis tener sol absconditus quos.','Suus turbo defero versus eveniet vero accusator canonicus.','Denuo dicta accendo solium confugo trado saepe vix casso.','b','The symbol for the element gold is Au.','2023-07-10 22:59:55','2024-03-12 07:05:02'),(19,'Pick the best answer:','What is the largest planet in our solar system?','SINGLE_CHOICE','Patruus calculus iusto.','Explicabo thorax peccatus cursim in aggero asper solvo vaco.','Apud virga cito explicabo surgo viscus rerum admitto vinum utrimque.','Sodalitas tergeo tyrannus.','Molestias tunc laborum verbera defessus curatio theatrum ullam.','Adsidue animadverto abundans vehemens allatus corrigo caecus corpus totam.','Arbustum caelum decretum somniculosus utroque supra.','Suus volaticus credo.','Somniculosus vito sumo tabernus.','Capitulus voluptatum perferendis templum cribro adnuo.','Admoveo colo caritas verecundia videlicet animi vehemens tres.','Cura vinculum arcesso suasoria suppono basium.','Volaticus curiositas socius debilito.','Balbus soluta dedecor carus amissio comedo ambitus id.','Tantum synagoga ab nulla vester voluptates suppono derelinquo spiritus ater.','Carcer voco villa sustineo contego surculus id sodalitas.','m','Jupiter is the largest planet in our solar system.','2023-04-30 08:16:24','2024-03-11 08:31:23'),(20,'Choose the most suitable option:','Who discovered penicillin?','MULTIPLE_CHOICE','Vomito sordeo stultus.','Delego est depopulo.','Arbor pauper stips.','Solum compello termes videlicet.','Cohaero at curtus sustineo corrumpo volup stultus addo tribuo.','Vicinus sufficio repellat sequi deprecator tutamen commodo.','Ancilla usus beatus valde tam venio non consequuntur cito.','Tollo vulariter utpote usitas.','Strenuus chirographum video auctus bellicus subvenio tonsor curso usque creator.','Calcar civis adflicto conor ad deripio voluptate.','Adstringo summa assentator necessitatibus.','Consuasor cimentarius tergeo cum alias cresco corroboro a impedit.','Tumultus alioqui tempus voluptate comparo abscido.','Saepe admoneo dapifer turba.','Dens velut impedit stipes minima.','Veritas officiis tunc vobis.','b','Penicillin was discovered by Alexander Fleming.','2024-03-08 19:25:09','2024-03-12 02:35:19'),(21,'Choose the most suitable option:','What is the national animal of Australia?','TRUE_FALSE','Ulterius deduco nulla conscendo.','Quaerat iste arguo valetudo defetiscor spiritus.','Debilito distinctio ademptio adulescens quidem adaugeo auctus.','Copiose ager tendo vado amitto carpo blandior tripudio nesciunt voluptatibus.','Talis strenuus tum cursus.','Voluptas dedico beatae clementia.','Tempora conduco amitto corrumpo solitudo ventito solutio adulescens usus caelestis.','Defendo absorbeo socius absconditus arto universe calco.','Admiratio arbor pecus ascit careo textilis.','Amplitudo vindico capio degusto.','Thalassinus desidero officia minus aspicio.','Suffoco commodi pectus deludo cognomen statim ipsa.','Vulnero claudeo spiculum delectatio magnam derelinquo complectus asper audentia.','Annus bis sit cupressus crastinus voluptatem consectetur.','Crebro arto tantillus videlicet.','Umerus triumphus cenaculum vito adipiscor desipio turbo comitatus.','o','The national animal of Australia is the Kangaroo.','2023-07-25 03:16:30','2024-03-12 06:32:33'),(22,'Select the right response:','What is the currency of Brazil?','MULTIPLE_CHOICE','Voro copia demitto.','Id aiunt harum.','Crapula viscus canto tabesco absorbeo solum tutamen verto.','Conculco ex verumtamen terga.','Culpo culpa vesco aiunt.','Dolorum valetudo adipiscor.','Advenio cibo ancilla defetiscor defaeco attonbitus.','Deinde veritatis tergo cimentarius.','Balbus studio tantum cometes cubitum veniam tersus.','Tantillus usitas tonsor tametsi charisma abstergo catena.','Consectetur summopere illo comis collum acer.','Territo centum vigor curriculum deserunt.','Umbra corrigo vere reprehenderit carmen desipio cui vobis utique culpa.','Quas animi quam substantia aegrotatio caste.','Absens calamitas labore crastinus aurum circumvenio.','Adeo compello deleniti curriculum ademptio adulatio.','d','The currency of Brazil is the Brazilian real.','2023-10-13 22:31:42','2024-03-11 23:45:10'),(23,'Pick the best answer:','Who composed \'Für Elise\'?','MULTIPLE_CHOICE','Armarium civitas despecto urbanus sint absens verbum comptus.','Illo caveo caecus.','Conforto depromo possimus adeo comminor talio vomer minima.','Cornu itaque carus coaegresco traho paulatim vae.','Armarium decretum turbo celo succurro vetus sumptus cultellus tergeo.','Volo auctus cauda viduo vicissitudo tres theologus similique creo cibus.','Aveho dedico thema attollo depereo adstringo cras angelus addo quo.','Velum creo voluptatum tum odio alter capio verbera.','Doloribus universe dignissimos synagoga cruciamentum voco vel cernuus tricesimus.','Paens beatus animus tempus adnuo sollicito beneficium quidem caput tracto.','Aliquam crux molestias solum.','Aestas abundans aedificium suggero virga circumvenio tricesimus.','Summopere exercitationem vilicus aegrus demulceo delectus decipio ubi veritas depopulo.','Socius ciminatio verecundia collum clarus dignissimos calamitas sumo beatus suscipio.','Ver aureus iure suffoco adinventitias.','Creo cuppedia ubi.','i','\'Für Elise\' was composed by Ludwig van Beethoven.','2023-03-23 13:17:29','2024-03-12 00:50:22'),(24,'Select the appropriate option:','What is the speed of light in a vacuum?','SINGLE_CHOICE','Addo beneficium tricesimus valetudo.','Desipio vomica ad.','Sono tricesimus appositus denique decretum succedo doloremque accedo quasi ager.','Crepusculum unde pecus voluntarius verbum.','Culpo aeneus delinquo summopere quaerat credo titulus voluptas stultus deporto.','Tenax tamdiu vulnero coma appono vester derelinquo fugit sufficio.','Verbum adsuesco tantillus amoveo.','Cohors cado aegrotatio video verecundia deficio laudantium.','Amet tero arceo addo suffragium credo officiis sono spiculum.','Audentia denuo astrum vallum explicabo laboriosam.','Socius varietas vindico sulum defetiscor tondeo sumo asporto.','Concedo degero spero.','Natus vix vulgaris sumo beatae.','Provident adflicto tremo theologus delectus bardus communis comedo.','Anser sollers ut vado.','Defleo tondeo auditor sulum surgo abutor aspicio absum acer.','g','The speed of light in a vacuum is 299,792,458 meters per second.','2023-05-25 13:49:49','2024-03-11 18:01:18'),(25,'Indicate the correct choice:','Who directed the movie \'Jurassic Park\'?','MULTIPLE_CHOICE','Capto laborum vis tollo omnis ulciscor corroboro.','Audax vitiosus dens paulatim.','Debeo acies inflammatio adhuc aeger quae quas coerceo similique.','Cunctatio arcesso aliquam censura.','Tabula adulescens sopor neque.','Cito combibo territo nihil tempora textus comitatus auctus paens claudeo.','Tardus ut sed temptatio utilis articulus verecundia delicate clamo.','Acquiro demulceo umbra saepe addo vis commodo aequitas artificiose.','Voluptate eveniet odit cubitum.','Ex bis tricesimus illum theatrum depopulo debeo desidero tantum.','Porro tricesimus traho cura abduco spoliatio cicuta defessus adversus aiunt.','Sortitus volaticus terminatio suscipio cavus victoria attollo eius averto.','Teneo copia dolor adhaero sordeo curiositas summisse textor benigne sit.','Vitae via somniculosus bene pecco tertius antea.','Aetas explicabo amoveo deprecator coaegresco defero.','Adficio clam velut conservo argumentum brevis vapulus arma ars speciosus.','i','Jurassic Park was directed by Steven Spielberg.','2023-08-19 08:24:00','2024-03-11 22:54:42'),(26,'Choose the most suitable option:','How many bones are in the human body?','SINGLE_CHOICE','Advoco suasoria theologus combibo.','Amoveo angelus quia volaticus angustus cupiditate spiculum acervus.','Delinquo capio adimpleo traho summa.','Confugo ambulo approbo curiositas tredecim amo videlicet cerno virgo trepide.','Corona alias clibanus causa velit pauper.','Defero quo beatae color.','Sub stella casso coma sodalitas architecto degusto.','Veniam theca viscus vesper animus.','Subvenio in arma avaritia coaegresco tabernus.','Vergo urbs demergo corrigo vero.','Canto non carbo.','Catena cibus laudantium ab texo vomito theologus aggredior laboriosam.','Tumultus stips curo adstringo adiuvo cupio adsuesco certe caelestis amissio.','Repellat atavus vita conicio alioqui sufficio conduco virga soluta sono.','Denego sub theatrum.','Thalassinus viridis auctus bonus suppellex cunabula usus.','o','There are 206 bones in the human body.','2023-04-03 02:40:52','2024-03-11 22:27:11'),(27,'Choose the correct answer:','Who founded Microsoft?','SINGLE_CHOICE','Bellum omnis officia sum provident supra.','Tabesco benigne cito cavus.','Sto velociter cum suasoria agnosco aliquam.','Demo somnus commodo colo cum advenio addo.','Adsuesco capto adimpleo.','Tam caute bos cupiditas solvo temperantia decens sint.','Stabilis thymum suadeo calcar eveniet aspernatur carbo sufficio celebrer.','Adipiscor vos decipio commodo voco sunt.','Ipsum thermae tenus cursus confido admoveo.','Teneo arca dens asper statim qui strenuus.','Accedo molestiae trans urbs.','Corporis talis vergo qui suppellex earum.','Catena vae creptio apostolus.','Catena degenero condico sonitus acidus velociter eveniet bardus.','Conculco utrum deleniti cui ex ventosus tergiversatio quisquam.','Solitudo comminor numquam voluptates defetiscor inventore.','l','Microsoft was founded by Bill Gates.','2024-01-19 12:04:17','2024-03-12 01:21:43'),(28,'Select the appropriate option:','What is the largest ocean on Earth?','MULTIPLE_CHOICE','Amet cometes excepturi decipio comminor debitis cui vester.','Autus clam caterva templum.','Fuga enim tum vitae corrigo impedit vix super vulgivagus volutabrum.','Ea crudelis altus cariosus.','Sulum adfero degenero acceptus verecundia avarus attollo.','Verus tabesco quia super ratione perferendis video compello succedo defero.','Absque culpa cursim culpo denique possimus.','Video vigor dedico.','Coerceo truculenter aufero vivo clamo denuncio deludo bos.','Aliquam addo adeo vitae commemoro dolorem soleo texo alius unus.','Unde ea vinculum tenuis creator attero copiose tracto celebrer triumphus.','Accedo cerno voro campana audentia casso.','Vulariter arx coruscus.','Provident theca sustineo collum.','Cedo demo impedit cultellus vomer.','Unus cui aequus paens.','a','The largest ocean on Earth is the Pacific Ocean.','2023-06-16 20:44:07','2024-03-12 02:43:39'),(29,'Choose the most suitable option:','What is the chemical formula for methane?','SINGLE_CHOICE','Adiuvo decet adsum earum amicitia tutamen aiunt spoliatio adsum comes.','Synagoga contigo demoror urbanus victoria nobis absconditus vulgivagus teres solium.','Cavus considero sumptus necessitatibus.','Cui vinitor solio defessus sperno voluptatum vigilo.','Conicio acerbitas candidus urbs cura appositus dicta admoneo surgo.','Repudiandae creta minus libero defungo.','Aurum amet tubineus.','Advoco sperno voro altus demergo dedico.','Utilis tollo aiunt vero depulso apud nobis solium abbas terga.','Defluo deinde vetus triumphus delibero cubo comis tolero alter trucido.','At ulciscor tersus autus strues.','Trans addo comes vinitor adinventitias.','Recusandae defleo depereo stella adipisci statua degero vitiosus tantillus.','Alter tenus allatus super voluptas benevolentia terreo deleo compono.','Depono deprecator pax tardus assumenda.','Velociter quasi defluo cum adeptio absum canonicus cotidie.','j','The chemical formula for methane is CH4.','2023-08-29 03:57:45','2024-03-11 21:40:36');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_to_permission`
--

DROP TABLE IF EXISTS `role_to_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_to_permission` (
  `roleId` bigint NOT NULL,
  `permissionId` bigint NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`roleId`,`permissionId`),
  UNIQUE KEY `role_to_permission_permissionId_roleId_unique` (`roleId`,`permissionId`),
  UNIQUE KEY `role_to_permission_role_id_permission_id` (`roleId`,`permissionId`),
  KEY `permissionId` (`permissionId`),
  CONSTRAINT `role_to_permission_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `role_to_permission_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_to_permission`
--

LOCK TABLES `role_to_permission` WRITE;
/*!40000 ALTER TABLE `role_to_permission` DISABLE KEYS */;
INSERT INTO `role_to_permission` VALUES (1,1,'2023-05-01 04:46:31','2024-03-12 06:11:11'),(1,2,'2024-03-09 03:23:24','2024-03-11 20:10:36'),(1,3,'2023-08-01 05:37:55','2024-03-11 16:33:08'),(2,3,'2023-07-28 09:20:22','2024-03-11 15:24:36'),(3,2,'2023-09-05 04:29:25','2024-03-11 23:27:32'),(3,3,'2023-03-18 20:50:02','2024-03-12 00:42:25');
/*!40000 ALTER TABLE `role_to_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'R1','ADMIN','2023-08-15 14:08:01','2024-03-11 19:03:41'),(2,'R2','MANAGER','2023-11-19 12:47:26','2024-03-11 12:51:56'),(3,'R3','USER','2024-01-22 12:55:59','2024-03-11 12:19:01');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_users_answer`
--

DROP TABLE IF EXISTS `temp_users_answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_users_answer` (
  `userId` bigint NOT NULL,
  `examId` bigint NOT NULL,
  `questionId` bigint NOT NULL,
  `userAnswer` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`userId`,`examId`,`questionId`),
  KEY `examId` (`examId`),
  KEY `questionId` (`questionId`),
  CONSTRAINT `temp_users_answer_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `temp_users_answer_ibfk_2` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `temp_users_answer_ibfk_3` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_users_answer`
--

LOCK TABLES `temp_users_answer` WRITE;
/*!40000 ALTER TABLE `temp_users_answer` DISABLE KEYS */;
INSERT INTO `temp_users_answer` VALUES (1,1,24,'traffic light is green','2024-02-01 05:48:14','2024-03-11 13:20:51'),(1,6,17,'traffic light is red','2024-02-17 10:32:19','2024-03-12 05:44:33'),(3,2,2,'road is too crowded','2023-03-19 18:49:07','2024-03-12 06:53:18'),(4,2,3,'slippery road','2023-09-11 03:58:17','2024-03-11 10:44:55'),(4,6,27,'speeding','2023-11-14 12:06:29','2024-03-11 10:56:39'),(5,6,4,'traffic light is yellow','2023-08-07 03:28:08','2024-03-11 11:53:42'),(7,5,11,'cannot see the license plate','2023-12-31 00:02:36','2024-03-11 13:40:14'),(8,2,13,'insufficient light source','2023-07-27 10:57:38','2024-03-12 02:09:40'),(8,6,8,'street light is not bright','2023-11-27 05:43:43','2024-03-11 22:14:03'),(10,4,21,'broken','2023-09-18 17:34:13','2024-03-12 02:02:06');
/*!40000 ALTER TABLE `temp_users_answer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_enter_exit_exam_room`
--

DROP TABLE IF EXISTS `user_enter_exit_exam_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_enter_exit_exam_room` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` bigint NOT NULL,
  `examId` bigint NOT NULL,
  `enterTime` datetime NOT NULL,
  `exitTime` datetime DEFAULT NULL,
  `attempt` tinyint DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `user_enter_exit_exam_room_examId_userId_unique` (`userId`,`examId`),
  KEY `examId` (`examId`),
  CONSTRAINT `user_enter_exit_exam_room_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_enter_exit_exam_room_ibfk_2` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_enter_exit_exam_room`
--

LOCK TABLES `user_enter_exit_exam_room` WRITE;
/*!40000 ALTER TABLE `user_enter_exit_exam_room` DISABLE KEYS */;
INSERT INTO `user_enter_exit_exam_room` VALUES (1,1,3,'2023-11-20 12:29:02','2024-03-11 09:58:56',1,'2023-08-21 22:43:47','2024-03-12 06:49:10'),(2,5,6,'2023-03-26 15:33:01','2024-03-11 21:57:37',1,'2023-10-25 03:42:10','2024-03-12 07:04:07'),(3,8,4,'2023-10-23 04:47:38','2024-03-12 07:00:23',3,'2023-10-20 05:26:52','2024-03-11 21:12:41'),(4,6,6,'2024-01-27 19:42:52','2024-03-11 20:15:31',3,'2023-11-03 14:39:03','2024-03-11 15:16:46'),(5,9,6,'2023-09-03 21:25:44','2024-03-11 09:38:42',3,'2023-09-14 13:20:24','2024-03-11 21:20:08'),(6,5,3,'2023-04-16 02:49:47','2024-03-11 15:53:03',1,'2023-10-13 03:24:07','2024-03-12 05:00:48');
/*!40000 ALTER TABLE `user_enter_exit_exam_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `refreshToken` varchar(255) DEFAULT NULL,
  `roleId` bigint NOT NULL DEFAULT '3',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Demario','Gutkowski','Global','Emmalee.Johns@yahoo.com','0',51,'6PXQv5J8Tm2n7ic','Ernestina_Yost8','CfcTFY1OoMS6ly3BuguA6TK8YB9Gv5KE',1,'2023-10-01 01:13:55','2024-03-12 07:08:54'),(2,'Yoshiko','Beatty','Human','Olaf9@hotmail.com','1',56,'2yqmAWn3UPjhFMw','Wyman11','GAerJ5ZoWhuRnifXDh8kmbCSMpddPp0f',1,'2023-05-07 06:54:35','2024-03-11 14:57:19'),(3,'Maiya','Abbott','Senior','Yasmin_Hauck76@yahoo.com','1',37,'jXgKmkDyFeZuRj8','Carleton95','0POdFazEpCvG9fDjELZLtoXMHdxsNuiB',3,'2023-04-09 13:47:21','2024-03-11 17:17:20'),(4,'Thad','Balistreri','Senior','Elmer.Toy72@hotmail.com','0',46,'ezzQkZm5esky5NQ','Zelma55','r3TrlGQTK0q7E1HoWMi7tKW9xSM1kacI',2,'2023-03-29 14:58:07','2024-03-12 03:41:04'),(5,'Quinton','Hahn','Internal','Fae62@gmail.com','0',51,'DgdbsgFrQYVuDHk','Myah46','BntHC1RJiSctMIIUFdPkuRYAC8lOW7mc',3,'2023-11-01 07:34:19','2024-03-11 16:26:59'),(6,'Jayne','Mann-Becker','Senior','Americo.Mann-Marquardt@gmail.com','1',58,'zDyBU_whWzB_G8P','Oran_Gerhold42','qW2Wg4l6oQy59S58zz2B6SijIyPihSql',2,'2024-01-21 02:41:08','2024-03-11 10:00:44'),(7,'Gilberto','Cartwright','Human','Elta77@gmail.com','0',53,'1UbWeKCl2SkhVxI','Lucius_Bergnaum35','XhUOgGBFsVv7V111GHO1qtHVtPBXtJGa',3,'2023-04-25 21:50:51','2024-03-11 22:37:14'),(8,'Dolly','Hilll','Lead','Amiya.Hettinger@yahoo.com','1',60,'QJrkNXm3zr8smlA','Talia45','kfFwlksnmwX9DaslsO8QK8C3tJi1VXuS',1,'2023-08-26 01:56:18','2024-03-11 13:51:38'),(9,'Bennie','Upton','Lead','Leanna_Osinski@gmail.com','0',40,'k3zBdNyPfLOpVKc','Hans_Johnson93','4EpDc6ubY11bMt4aizs2zTlUMjewQYcK',3,'2023-11-28 11:43:11','2024-03-11 09:45:26'),(10,'Brant','Gerlach','Internal','Dannie.Stoltenberg81@hotmail.com','0',44,'g5EBin9Jwr0l8z7','Brent_Little84','a3PW5EpUU7LfrqmXzWNjSUpBgP1cEgY2',2,'2023-05-24 21:25:50','2024-03-11 19:25:52'),(11,NULL,NULL,NULL,NULL,NULL,NULL,'$2b$07$Wqibm4ixSWE.icyi/DiSEudMDBGX5ONMk4c759DtNSkR6NhtfAyOG','canh','HOvqRGuxOIYS2WJeB13nR8QHG3Rh5C7JIOJQAQTfRaSzOfoptcvidK6gJgNZIDARhbocObFaZ9UUPf8Ygw5MmZtTeO09RKDZ3MQq',3,'2024-03-12 08:09:55','2024-03-12 08:09:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_answer_history`
--

DROP TABLE IF EXISTS `users_answer_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_answer_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempt` tinyint NOT NULL,
  `userId` bigint NOT NULL,
  `examId` bigint NOT NULL,
  `questionId` bigint NOT NULL,
  `userAnswer` text,
  `score` tinyint DEFAULT NULL,
  `isCorrect` tinyint(1) DEFAULT NULL,
  `overAllScore` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `userId` (`userId`),
  KEY `examId` (`examId`),
  KEY `questionId` (`questionId`),
  CONSTRAINT `users_answer_history_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `users_answer_history_ibfk_2` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `users_answer_history_ibfk_3` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_answer_history`
--

LOCK TABLES `users_answer_history` WRITE;
/*!40000 ALTER TABLE `users_answer_history` DISABLE KEYS */;
INSERT INTO `users_answer_history` VALUES (1,1,6,5,12,'insufficient light source',4,1,'33','2024-03-05 23:11:24','2024-03-11 19:39:22'),(2,1,10,3,18,'cannot see the license plate',13,1,'40','2024-02-01 12:26:10','2024-03-11 20:43:49'),(3,2,5,1,28,'traffic light is red',74,1,'33','2023-09-16 10:52:52','2024-03-11 09:14:36'),(4,2,1,6,12,'traffic light is green',25,0,'14','2024-02-20 17:02:57','2024-03-11 09:55:28'),(5,3,5,2,13,'speeding',44,1,'26','2023-04-20 15:08:31','2024-03-11 15:43:30'),(6,2,1,4,25,'broken',24,0,'81','2023-09-17 21:00:39','2024-03-11 16:15:32'),(7,2,1,6,24,'slippery road',82,0,'12','2024-02-01 05:59:06','2024-03-12 01:04:36'),(8,1,3,6,18,'road is too crowded',11,0,'23','2023-07-13 18:06:36','2024-03-12 06:10:51'),(9,1,10,4,19,'street light is not bright',81,1,'8','2023-06-10 18:51:10','2024-03-11 15:22:47'),(10,3,9,5,26,'traffic light is yellow',83,1,'62','2024-01-29 14:42:06','2024-03-12 07:49:25');
/*!40000 ALTER TABLE `users_answer_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-12 15:20:02
