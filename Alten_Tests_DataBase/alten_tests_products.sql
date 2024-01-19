-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: alten_tests
-- ------------------------------------------------------
-- Server version	8.0.29

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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `price` int NOT NULL,
  `quantity` int NOT NULL,
  `inventoryStatus` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1059 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1000,'f230fh0g3','Bamboo Watch','Product Description',65,24,'INSTOCK','Accessories','bamboo-watch.jpg',5,'2024-01-17 14:13:59','2024-01-17 14:13:59'),(1001,'nvklal433','Black Watch','Product Description',72,61,'INSTOCK','Accessories','black-watch.jpg',4,'2024-01-17 14:14:26','2024-01-17 14:14:26'),(1002,'zz21cz3c1','Blue Band','Product Description',79,2,'LOWSTOCK','Fitness','blue-band.jpg',3,'2024-01-17 14:14:39','2024-01-17 14:14:39'),(1003,'244wgerg2','Blue T-Shirt','Product Description',29,25,'INSTOCK','Clothing','blue-t-shirt.jpg',5,'2024-01-17 14:14:50','2024-01-17 14:14:50'),(1004,'h456wer53','Bracelet','Product Description',15,73,'INSTOCK','Accessories','bracelet.jpg',4,'2024-01-17 14:15:04','2024-01-17 14:15:04'),(1005,'av2231fwg','Brown Purse','Product Description',120,0,'OUTOFSTOCK','Accessories','brown-purse.jpg',4,'2024-01-17 14:15:28','2024-01-17 14:15:28'),(1006,'bib36pfvm','Chakra Bracelet','Product Description',32,5,'LOWSTOCK','Accessories','chakra-bracelet.jpg',3,'2024-01-17 14:15:44','2024-01-17 14:15:44'),(1007,'mbvjkgip5','Galaxy Earrings','Product Description',34,23,'INSTOCK','Accessories','galaxy-earrings.jpg',5,'2024-01-17 14:15:58','2024-01-17 14:15:58'),(1008,'vbb124btr','Game Controller','Product Description',99,2,'LOWSTOCK','Electronics','game-controller.jpg',4,'2024-01-17 14:16:15','2024-01-17 14:16:15'),(1009,'cm230f032','Gaming Set','Product Description',299,63,'INSTOCK','Electronics','gaming-set.jpg',3,'2024-01-17 14:16:27','2024-01-17 14:16:27'),(1010,'plb34234v','Gold Phone Case','Product Description',24,0,'OUTOFSTOCK','Accessories','gold-phone-case.jpg',4,'2024-01-17 14:16:43','2024-01-17 14:16:43'),(1011,'4920nnc2d','Green Earbuds','Product Description',89,23,'INSTOCK','Electronics','green-earbuds.jpg',4,'2024-01-17 14:16:52','2024-01-17 14:16:52'),(1012,'250vm23cc','Green T-Shirt','Product Description',49,74,'INSTOCK','Clothing','green-t-shirt.jpg',5,'2024-01-17 14:17:01','2024-01-17 14:17:01'),(1013,'fldsmn31b','Grey T-Shirt','Product Description',48,0,'OUTOFSTOCK','Clothing','grey-t-shirt.jpg',3,'2024-01-17 14:17:19','2024-01-17 14:17:19'),(1014,'waas1x2as','Headphones','Product Description',175,8,'LOWSTOCK','Electronics','headphones.jpg',5,'2024-01-17 14:17:30','2024-01-17 14:17:30'),(1015,'vb34btbg5','Light Green T-Shirt','Product Description',49,34,'INSTOCK','Clothing','light-green-t-shirt.jpg',4,'2024-01-17 14:17:38','2024-01-17 14:17:38'),(1016,'k8l6j58jl','Lime Band','Product Description',79,12,'INSTOCK','Fitness','lime-band.jpg',3,'2024-01-17 14:17:46','2024-01-17 14:17:46'),(1017,'v435nn85n','Mini Speakers','Product Description',85,42,'INSTOCK','Clothing','mini-speakers.jpg',4,'2024-01-17 14:17:52','2024-01-17 14:17:52'),(1018,'09zx9c0zc','Painted Phone Case','Product Description',56,41,'INSTOCK','Accessories','painted-phone-case.jpg',5,'2024-01-17 14:18:00','2024-01-17 14:18:00'),(1019,'mnb5mb2m5','Pink Band','Product Description',79,63,'INSTOCK','Fitness','pink-band.jpg',4,'2024-01-17 14:18:08','2024-01-17 14:18:08'),(1020,'r23fwf2w3','Pink Purse','Product Description',110,0,'OUTOFSTOCK','Accessories','pink-purse.jpg',4,'2024-01-17 14:18:19','2024-01-17 14:18:19'),(1021,'pxpzczo23','Purple Band','Product Description',79,6,'LOWSTOCK','Fitness','purple-band.jpg',3,'2024-01-17 14:18:27','2024-01-17 14:18:27'),(1022,'2c42cb5cb','Purple Gemstone Necklace','Product Description',45,62,'INSTOCK','Accessories','purple-gemstone-necklace.jpg',4,'2024-01-17 14:48:39','2024-01-17 14:48:39'),(1023,'5k43kkk23','Purple T-Shirt','Product Description',49,2,'LOWSTOCK','Clothing','purple-t-shirt.jpg',5,'2024-01-17 14:48:50','2024-01-17 14:48:50'),(1024,'lm2tny2k4','Shoes','Product Description',64,0,'INSTOCK','Clothing','shoes.jpg',4,'2024-01-17 14:48:59','2024-01-17 14:48:59'),(1025,'nbm5mv45n','Sneakers','Product Description',78,52,'INSTOCK','Clothing','sneakers.jpg',4,'2024-01-17 14:49:13','2024-01-17 14:49:13'),(1026,'zx23zc42c','Teal T-Shirt','Product Description',49,3,'LOWSTOCK','Clothing','teal-t-shirt.jpg',3,'2024-01-17 14:49:23','2024-01-17 14:49:23'),(1027,'acvx872gc','Yellow Earbuds','Product Description',89,35,'INSTOCK','Electronics','yellow-earbuds.jpg',3,'2024-01-17 14:49:31','2024-01-17 14:49:31'),(1028,'tx125ck42','Yoga Mat','Product Description',20,15,'INSTOCK','Fitness','yoga-mat.jpg',5,'2024-01-17 14:49:40','2024-01-17 14:49:40'),(1029,'gwuby345v','Yoga Set','Product Description',20,25,'INSTOCK','Fitness','yoga-set.jpg',5,'2024-01-17 14:50:26','2024-01-18 17:57:49'),(1058,'845956871','Product modifié','Product modifié',2147483647,2147483647,'INSTOCK','Accessories','http://localhost:3000/images/kevin-hikari-rV_Qd1l-VXg-unsplash_jpg1705664203886.jpg',5,'2024-01-19 11:22:26','2024-01-19 11:36:43');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-19 12:44:33
