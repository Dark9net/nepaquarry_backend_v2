-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 05, 2026 at 03:40 PM
-- Server version: 11.4.13-MariaDB
-- PHP Version: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nepaquar_query`
--

-- --------------------------------------------------------

--
-- Table structure for table `Advance`
--

CREATE TABLE `Advance` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `staffId` varchar(191) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `advanceMonth` int(11) NOT NULL,
  `advanceYear` int(11) NOT NULL,
  `advanceTakenDate` date DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `paymentMethod` enum('CASH','CHEQUE') NOT NULL DEFAULT 'CASH',
  `chequeDetails` text DEFAULT NULL,
  `chequeamount` decimal(10,2) DEFAULT NULL,
  `approvedById` varchar(191) DEFAULT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `paymentSlipUrl` varchar(191) DEFAULT NULL,
  `additionalAmount` decimal(10,2) DEFAULT NULL,
  `additionalReason` text DEFAULT NULL,
  `additionalStatus` enum('PENDING','APPROVED','REJECTED') DEFAULT NULL,
  `additionalPaymentMethod` enum('CASH','CHEQUE') DEFAULT 'CASH',
  `additionalChequeDetails` text DEFAULT NULL,
  `additionalChequeamount` decimal(10,2) DEFAULT NULL,
  `additionalApprovedById` varchar(191) DEFAULT NULL,
  `additionalApprovedAt` datetime(3) DEFAULT NULL,
  `additionalRequestedAt` datetime(3) DEFAULT NULL,
  `additionalAdvanceTakenDate` date DEFAULT NULL,
  `additionalPaymentSlipUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `Advance`
--

INSERT INTO `Advance` (`id`, `orgId`, `staffId`, `createdById`, `advanceMonth`, `advanceYear`, `advanceTakenDate`, `amount`, `reason`, `status`, `paymentMethod`, `chequeDetails`, `chequeamount`, `approvedById`, `approvedAt`, `paymentSlipUrl`, `additionalAmount`, `additionalReason`, `additionalStatus`, `additionalPaymentMethod`, `additionalChequeDetails`, `additionalChequeamount`, `additionalApprovedById`, `additionalApprovedAt`, `additionalRequestedAt`, `additionalAdvanceTakenDate`, `additionalPaymentSlipUrl`, `createdAt`, `updatedAt`) VALUES
('cmtkcovdm000yug6oth2ebem4', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkae6td00090g6oe9ubpr6b', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 9, 2026, '2026-09-02', 6000.00, 'hh', 'APPROVED', 'CASH', NULL, NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 17:08:59.532', NULL, 600.00, 'no', 'APPROVED', 'CASH', NULL, NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-03 03:04:33.705', '2026-09-02 17:09:10.464', '2026-09-03', NULL, '2026-09-02 17:08:57.178', '2026-09-03 03:04:39.941');

-- --------------------------------------------------------

--
-- Table structure for table `BillSequence`
--

CREATE TABLE `BillSequence` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `lastBillNumber` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CreditParty`
--

CREATE TABLE `CreditParty` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `panNo` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `contactPerson` varchar(191) DEFAULT NULL,
  `contactNo` varchar(191) DEFAULT NULL,
  `balanceType` enum('CREDIT','ADVANCE') NOT NULL DEFAULT 'CREDIT',
  `creditBalance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CreditParty`
--

INSERT INTO `CreditParty` (`id`, `orgId`, `name`, `panNo`, `address`, `contactPerson`, `contactNo`, `balanceType`, `creditBalance`, `isActive`, `notes`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkczgdb0011ug6oqdnvls5w', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'rama shah', 'adsad', 'kathmandu', 'Ram kumar', '9899999999', 'CREDIT', 13000.00, 1, 'notes', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 17:17:10.943', '2026-09-04 06:16:36.070');

-- --------------------------------------------------------

--
-- Table structure for table `CreditPartyRate`
--

CREATE TABLE `CreditPartyRate` (
  `id` varchar(191) NOT NULL,
  `creditPartyId` varchar(191) NOT NULL,
  `tripVehicleId` varchar(191) NOT NULL,
  `materialId` varchar(191) NOT NULL,
  `ratePerTrip` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CreditPartyRate`
--

INSERT INTO `CreditPartyRate` (`id`, `creditPartyId`, `tripVehicleId`, `materialId`, `ratePerTrip`, `createdAt`, `updatedAt`) VALUES
('cmtkd02ue0012ug6oop0h0ptz', 'cmtkczgdb0011ug6oqdnvls5w', 'cmtkcacz3000tug6omcx7a7zy', 'cmtkbt4nd0008ug6oe0kc3ekr', 7000.00, '2026-09-02 17:17:40.070', '2026-09-02 17:17:40.070'),
('cmtmka71x001xug6ohbkof8bj', 'cmtkczgdb0011ug6oqdnvls5w', 'cmtkc9dw0000qug6ovy1atmjh', 'cmtkbudrf0009ug6oye6270bw', 8500.00, '2026-09-04 06:17:01.749', '2026-09-04 06:17:01.749');

-- --------------------------------------------------------

--
-- Table structure for table `CreditTransaction`
--

CREATE TABLE `CreditTransaction` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `creditPartyId` varchar(191) NOT NULL,
  `reportId` varchar(191) DEFAULT NULL,
  `date` date NOT NULL,
  `tripVehicleId` varchar(191) NOT NULL,
  `materialId` varchar(191) NOT NULL,
  `trips` int(11) NOT NULL,
  `rateUsed` decimal(10,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `billNo` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CreditTransaction`
--

INSERT INTO `CreditTransaction` (`id`, `orgId`, `creditPartyId`, `reportId`, `date`, `tripVehicleId`, `materialId`, `trips`, `rateUsed`, `amount`, `billNo`, `notes`, `createdById`, `createdAt`) VALUES
('cmtmkf4we001yug6o31hcfkwo', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkczgdb0011ug6oqdnvls5w', 'cmtmkhp37001zug6ou3m23gaw', '2026-09-03', 'cmtkc9dw0000qug6ovy1atmjh', 'cmtkbudrf0009ug6oye6270bw', 1, 8500.00, 8500.00, NULL, NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-04 06:20:52.238');

-- --------------------------------------------------------

--
-- Table structure for table `DailyBankDeposit`
--

CREATE TABLE `DailyBankDeposit` (
  `id` varchar(191) NOT NULL,
  `reportId` varchar(191) NOT NULL,
  `party` varchar(191) NOT NULL,
  `amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailyBankDeposit`
--

INSERT INTO `DailyBankDeposit` (`id`, `reportId`, `party`, `amount`) VALUES
('cmtmkhp3g0025ug6oecqzwanc', 'cmtmkhp37001zug6ou3m23gaw', 'mpis', 200000.00),
('cmtmkhp3g0026ug6ozuz9mqkn', 'cmtmkhp37001zug6ou3m23gaw', 'ramesh', 100000.00);

-- --------------------------------------------------------

--
-- Table structure for table `DailyCreditSale`
--

CREATE TABLE `DailyCreditSale` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `reportId` varchar(191) DEFAULT NULL,
  `date` date NOT NULL,
  `partyName` varchar(191) NOT NULL,
  `billNo` varchar(191) DEFAULT NULL,
  `goodsName` varchar(191) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DailyExpense`
--

CREATE TABLE `DailyExpense` (
  `id` varchar(191) NOT NULL,
  `reportId` varchar(191) NOT NULL,
  `type` enum('MAINTENANCE','ADVANCE','PURCHASE','PT_CASH','DONATION','MISC','DISCOUNT') NOT NULL,
  `particular` varchar(191) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `partyName` varchar(191) DEFAULT NULL,
  `maintenanceId` varchar(191) DEFAULT NULL,
  `advanceId` varchar(191) DEFAULT NULL,
  `purchaseId` varchar(191) DEFAULT NULL,
  `staffId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailyExpense`
--

INSERT INTO `DailyExpense` (`id`, `reportId`, `type`, `particular`, `amount`, `partyName`, `maintenanceId`, `advanceId`, `purchaseId`, `staffId`) VALUES
('cmtky8ozk001jug6odl91r40b', 'cmtky8ozf001iug6ola4ru4zn', 'MAINTENANCE', 'Maintenance - Tipper 400 (BA 3 CHA 8888) (Guru Repair shop)', 1000.00, 'Guru Repair shop', 'cmtkarznk0000ug6otm0xx2fz', NULL, NULL, NULL),
('cmtky8ozk001kug6o6vtup921', 'cmtky8ozf001iug6ola4ru4zn', 'MAINTENANCE', 'Maintenance - Tipper 400 (BA 3 CHA 8888) (Guru Repair shop)', 1000.00, 'Guru Repair shop', 'cmtkarznk0000ug6otm0xx2fz', NULL, NULL, NULL),
('cmtky8ozk001lug6o1fvf7uqk', 'cmtky8ozf001iug6ola4ru4zn', 'MAINTENANCE', 'Maintenance - Tipper 400 (BA 3 CHA 8888) (Guru Repair shop)', 2000.00, 'Guru Repair shop', 'cmtkarznk0000ug6otm0xx2fz', NULL, NULL, NULL),
('cmtky8ozk001mug6opukc74om', 'cmtky8ozf001iug6ola4ru4zn', 'ADVANCE', 'Advance — Avishek', 6000.00, NULL, NULL, 'cmtkcovdm000yug6oth2ebem4', NULL, 'cmtkae6td00090g6oe9ubpr6b'),
('cmtky8ozk001nug6o9ffmk38z', 'cmtky8ozf001iug6ola4ru4zn', 'PURCHASE', 'Purchase payment - aloo and other (PUR-001, Bill 100)', 1000.00, 'tarkari pasal', NULL, NULL, 'cmtkc5htq000hug6os9nrjb0s', NULL),
('cmtmkhp3b0020ug6o14hanvfn', 'cmtmkhp37001zug6ou3m23gaw', 'ADVANCE', 'Additional Advance — Avishek', 600.00, NULL, NULL, 'cmtkcovdm000yug6oth2ebem4', NULL, 'cmtkae6td00090g6oe9ubpr6b'),
('cmtmkhp3b0021ug6o03wrq6ji', 'cmtmkhp37001zug6ou3m23gaw', 'PT_CASH', 'water', 200.00, NULL, NULL, NULL, NULL, NULL),
('cmtmkhp3b0022ug6oybg71y6h', 'cmtmkhp37001zug6ou3m23gaw', 'DONATION', 'donation', 2000.00, NULL, NULL, NULL, NULL, NULL),
('cmtmkhp3b0023ug6o42of3u0n', 'cmtmkhp37001zug6ou3m23gaw', 'MISC', 'wages', 500.00, NULL, NULL, NULL, NULL, NULL),
('cmtmkhp3b0024ug6op05fosm4', 'cmtmkhp37001zug6ou3m23gaw', 'DISCOUNT', 'sand', 1000.00, 'ramesh', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `DailyPlantReport`
--

CREATE TABLE `DailyPlantReport` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `plantId` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `status` enum('RUNNING','MAINTENANCE','RUNNING_AND_MAINTENANCE') NOT NULL,
  `plantStartTime` datetime(3) DEFAULT NULL,
  `plantStopTime` datetime(3) DEFAULT NULL,
  `plantWorkingHours` decimal(5,2) DEFAULT NULL,
  `maintenanceDescription` text DEFAULT NULL,
  `maintenanceStartTime` datetime(3) DEFAULT NULL,
  `maintenanceEndTime` datetime(3) DEFAULT NULL,
  `maintenanceHours` decimal(5,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `checkedById` varchar(191) DEFAULT NULL,
  `checkedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailyPlantReport`
--

INSERT INTO `DailyPlantReport` (`id`, `orgId`, `plantId`, `date`, `status`, `plantStartTime`, `plantStopTime`, `plantWorkingHours`, `maintenanceDescription`, `maintenanceStartTime`, `maintenanceEndTime`, `maintenanceHours`, `remarks`, `createdById`, `checkedById`, `checkedAt`, `createdAt`, `updatedAt`) VALUES
('cmtkc7sjo000oug6ohwo1tljf', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkbrfpg0006ug6olgnzmqd8', '2026-09-02', 'RUNNING', '2026-09-02 10:00:00.000', '2026-09-02 18:00:00.000', 8.00, NULL, NULL, NULL, 0.00, 'runnning', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-05 04:41:19.400', '2026-09-02 16:55:40.356', '2026-09-05 04:41:19.403');

-- --------------------------------------------------------

--
-- Table structure for table `DailySaleEntry`
--

CREATE TABLE `DailySaleEntry` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `reportId` varchar(191) DEFAULT NULL,
  `date` date NOT NULL,
  `materialId` varchar(191) NOT NULL,
  `tripVehicleId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `rateUsed` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailySaleEntry`
--

INSERT INTO `DailySaleEntry` (`id`, `orgId`, `reportId`, `date`, `materialId`, `tripVehicleId`, `quantity`, `rateUsed`, `amount`, `createdById`, `createdAt`) VALUES
('cmtmk86eo001vug6oo9l8jq4x', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtmkhp37001zug6ou3m23gaw', '2026-09-03', 'cmtkbudrf0009ug6oye6270bw', 'cmtkc9dw0000qug6ovy1atmjh', 50, 9000.00, 450000.00, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-04 06:15:27.600'),
('cmtmk87p2001wug6okarsr4y3', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtmkhp37001zug6ou3m23gaw', '2026-09-03', 'cmtkbudrf0009ug6oye6270bw', 'cmtkcacz3000tug6omcx7a7zy', 50, 5800.00, 290000.00, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-04 06:15:29.270');

-- --------------------------------------------------------

--
-- Table structure for table `DailySaleItem`
--

CREATE TABLE `DailySaleItem` (
  `id` varchar(191) NOT NULL,
  `reportId` varchar(191) NOT NULL,
  `materialId` varchar(191) NOT NULL,
  `tripVehicleId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `rateUsed` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `billNumber` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailySaleItem`
--

INSERT INTO `DailySaleItem` (`id`, `reportId`, `materialId`, `tripVehicleId`, `quantity`, `rateUsed`, `amount`, `billNumber`) VALUES
('cmtmkhp3l0027ug6oks9lz3tb', 'cmtmkhp37001zug6ou3m23gaw', 'cmtkbudrf0009ug6oye6270bw', 'cmtkc9dw0000qug6ovy1atmjh', 50, 9000.00, 450000.00, NULL),
('cmtmkhp3l0028ug6ol7iiuf1h', 'cmtmkhp37001zug6ou3m23gaw', 'cmtkbudrf0009ug6oye6270bw', 'cmtkcacz3000tug6omcx7a7zy', 50, 5800.00, 290000.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `DailySalesReport`
--

CREATE TABLE `DailySalesReport` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `lastClosingAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bankDepositParty` varchar(191) DEFAULT NULL,
  `bankDepositAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `customerDeposit` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cashParticular` varchar(191) DEFAULT NULL,
  `cash` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cashReceiveExtraParticular` varchar(191) DEFAULT NULL,
  `cashReceiveExtra` decimal(10,2) NOT NULL DEFAULT 0.00,
  `onlineTransfer` decimal(10,2) NOT NULL DEFAULT 0.00,
  `voidCount` int(11) NOT NULL DEFAULT 0,
  `closingBillNumber` int(11) DEFAULT NULL,
  `totalExpenses` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalCashReceive` decimal(10,2) NOT NULL DEFAULT 0.00,
  `todaysSales` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalCreditSales` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cashInCounter` decimal(10,2) NOT NULL DEFAULT 0.00,
  `billNumber` varchar(191) DEFAULT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED') NOT NULL DEFAULT 'DRAFT',
  `submittedAt` datetime(3) DEFAULT NULL,
  `approvedById` varchar(191) DEFAULT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailySalesReport`
--

INSERT INTO `DailySalesReport` (`id`, `orgId`, `date`, `lastClosingAmount`, `bankDepositParty`, `bankDepositAmount`, `customerDeposit`, `cashParticular`, `cash`, `cashReceiveExtraParticular`, `cashReceiveExtra`, `onlineTransfer`, `voidCount`, `closingBillNumber`, `totalExpenses`, `totalCashReceive`, `todaysSales`, `totalCreditSales`, `cashInCounter`, `billNumber`, `status`, `submittedAt`, `approvedById`, `approvedAt`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtky8ozf001iug6ola4ru4zn', '8a27055b-15d1-499f-ab2d-d9218c72a528', '2026-09-02', 0.00, NULL, 0.00, 0.00, NULL, 0.00, NULL, 0.00, 0.00, 0, NULL, 11000.00, 0.00, 0.00, 0.00, -11000.00, '20260902-3JT7', 'APPROVED', NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-03 03:12:30.968', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-03 03:12:13.947', '2026-09-03 03:12:30.973'),
('cmtmkhp37001zug6ou3m23gaw', '8a27055b-15d1-499f-ab2d-d9218c72a528', '2026-09-03', -11000.00, 'mpis', 300000.00, 0.00, 'kawadi', 10000.00, 'hari', 10000.00, 100000.00, 0, NULL, 4300.00, 20000.00, 748500.00, 8500.00, 304700.00, '20260903-VLDT', 'APPROVED', NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-04 06:24:49.737', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-04 06:22:51.715', '2026-09-04 06:24:49.738');

-- --------------------------------------------------------

--
-- Table structure for table `DailySalesReturns`
--

CREATE TABLE `DailySalesReturns` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `reportId` varchar(191) DEFAULT NULL,
  `date` date NOT NULL,
  `partyName` varchar(191) NOT NULL,
  `billNo` varchar(191) DEFAULT NULL,
  `particular` varchar(191) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `deductionBy` enum('BANK','QR','CASH') NOT NULL,
  `remarks` text DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailySalesReturns`
--

INSERT INTO `DailySalesReturns` (`id`, `orgId`, `reportId`, `date`, `partyName`, `billNo`, `particular`, `amount`, `deductionBy`, `remarks`, `createdById`, `createdAt`) VALUES
('cmtmkhp3q0029ug6ogi9ijn9x', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtmkhp37001zug6ou3m23gaw', '2026-09-03', 'ramesh', NULL, 'No Sand', 40000.00, 'CASH', 'deposit return in bank', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-04 06:22:51.715');

-- --------------------------------------------------------

--
-- Table structure for table `DailyTripRecord`
--

CREATE TABLE `DailyTripRecord` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `staffId` varchar(191) NOT NULL,
  `materialId` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `updatedById` varchar(191) DEFAULT NULL,
  `dailyTotal` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailyTripRecord`
--

INSERT INTO `DailyTripRecord` (`id`, `orgId`, `date`, `staffId`, `materialId`, `createdById`, `updatedById`, `dailyTotal`, `createdAt`, `updatedAt`) VALUES
('cmtkc6x3a000kug6op2be68ai', '8a27055b-15d1-499f-ab2d-d9218c72a528', '2026-09-02', 'cmtkae6td00090g6oe9ubpr6b', 'cmtkbujkj000aug6oibrhk8rt', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 8, '2026-09-02 16:54:59.590', '2026-09-02 17:15:19.392'),
('cmtky1ajo0014ug6ovoy2blb4', '8a27055b-15d1-499f-ab2d-d9218c72a528', '2026-09-03', 'cmtkae6td00090g6oe9ubpr6b', 'cmtkbt4nd0008ug6oe0kc3ekr', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 9, '2026-09-03 03:06:28.644', '2026-09-03 03:09:34.821');

-- --------------------------------------------------------

--
-- Table structure for table `Department`
--

CREATE TABLE `Department` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Department`
--

INSERT INTO `Department` (`id`, `orgId`, `name`, `code`, `isActive`, `createdAt`, `updatedAt`) VALUES
('016c52ed-2818-450f-91ff-f30c88921f09', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Production', 'PROD', 1, '2026-09-02 18:03:53.762', '2026-09-02 18:03:53.762'),
('0ffa7ce1-a4ea-453d-8cc3-c5064dd7f5d2', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Administration', 'ADMIN', 1, '2026-09-05 14:40:44.146', '2026-09-05 14:40:44.146'),
('12faaeae-5481-4d82-a8ba-84eb4232956d', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Truck Operation', 'TRKOP', 1, '2026-09-05 09:37:31.044', '2026-09-05 09:37:31.044'),
('149cf7a4-319e-4655-8852-ceb9d07a9b3d', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Production', 'PROD', 1, '2026-09-05 09:01:06.104', '2026-09-05 09:01:06.104'),
('15de613e-dd93-4b9b-bf20-4c10cb7ab95e', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Operations Department', 'OPDEP', 1, '2026-09-05 14:40:43.852', '2026-09-05 14:40:43.852'),
('183abcc4-604f-4542-8bdf-4f11eb8d5f69', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Excavator Operation', 'EXOPE', 1, '2026-09-05 09:37:31.044', '2026-09-05 09:37:31.044'),
('1aafe644-61cb-4da9-9555-f1f10bc77213', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Loader Operation', 'LOPE', 1, '2026-09-05 14:40:44.151', '2026-09-05 14:40:44.151'),
('1ca0e447-9900-4e9b-957b-efc613742217', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Store', 'STORE', 1, '2026-09-05 09:37:31.041', '2026-09-05 09:37:31.041'),
('1fe48456-c58e-4091-bf6f-f2538374a6c1', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Human Resources', 'HR', 1, '2026-09-05 14:40:44.147', '2026-09-05 14:40:44.147'),
('262fc277-6f6d-4a4b-bb10-a842e3dc599a', '7148d149-3de9-4fb8-9b0b-003788657636', 'Accounts', 'ACC', 1, '2026-09-05 09:35:46.333', '2026-09-05 09:35:46.333'),
('26879898-2dfc-48e9-8ed4-05ff605ee2f8', '7148d149-3de9-4fb8-9b0b-003788657636', 'Plant Department', 'PLDEP', 1, '2026-09-05 09:35:46.336', '2026-09-05 09:35:46.336'),
('2b3c9751-1432-49f6-9e39-c33dcddfcbb9', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Management', 'MGMT', 1, '2026-09-05 09:37:31.043', '2026-09-05 09:37:31.043'),
('2b4c7256-e125-439c-a713-0f987f540023', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Truck Operation', 'TRKOP', 1, '2026-09-05 14:40:44.151', '2026-09-05 14:40:44.151'),
('2c6f8849-265b-4440-a80c-c34591da0c80', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Administration', 'ADMIN', 1, '2026-09-05 09:37:31.039', '2026-09-05 09:37:31.039'),
('38dffdd9-02df-424c-8a33-4c50d44cbb6f', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Administration', 'ADMIN', 1, '2026-09-02 18:03:53.752', '2026-09-02 18:03:53.752'),
('41c3da18-25cc-4e9b-b6f8-32b1ee05f0ea', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Workshop', 'WORK', 1, '2026-09-05 09:01:06.104', '2026-09-05 09:01:06.104'),
('45a2ae1e-ed44-4c70-ae6f-95c73a9a334d', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Store', 'STORE', 1, '2026-09-05 09:01:06.103', '2026-09-05 09:01:06.103'),
('494f5757-c47a-4fb8-86cf-f318ac692327', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Operations Department', 'OPDEP', 1, '2026-09-05 14:40:43.851', '2026-09-05 14:40:43.851'),
('535c2edc-4a8c-44e3-ac2a-4d237c72e528', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Management', 'MGMT', 1, '2026-09-05 14:40:44.149', '2026-09-05 14:40:44.149'),
('55326b06-0a17-4d6f-bfc9-67129453438d', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Administration', 'ADMIN', 1, '2026-09-05 09:01:06.098', '2026-09-05 09:01:06.098'),
('57ef65c5-58de-424e-9501-1339b2fb56d7', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Loader Operation', 'LOPE', 1, '2026-09-05 09:11:58.350', '2026-09-05 09:11:58.350'),
('5dd21f76-a79a-42f0-bc41-4d9d1e4106d7', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Procurement', 'PROC', 1, '2026-09-05 09:01:06.103', '2026-09-05 09:01:06.103'),
('6097ba35-e681-4dd7-8cc0-c5672825f871', '7148d149-3de9-4fb8-9b0b-003788657636', 'Workshop', 'WORK', 1, '2026-09-05 09:35:46.334', '2026-09-05 09:35:46.334'),
('64db6f6b-9f7d-443a-947a-86e07ef9c5c8', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Plant Department', 'PLDEP', 1, '2026-09-05 14:40:44.149', '2026-09-05 14:40:44.149'),
('6d88909d-1f75-4fa5-b2f9-9324f48ab0de', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Loader Operation', 'LOPE', 1, '2026-09-05 09:37:31.044', '2026-09-05 09:37:31.044'),
('6f1377cd-4b89-4ee2-9b53-0743ea0e5108', '7148d149-3de9-4fb8-9b0b-003788657636', 'Kitchen Department', 'KITDE', 1, '2026-09-05 09:35:46.337', '2026-09-05 09:35:46.337'),
('6f74777f-784c-421c-9550-91d3466d358f', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Plant Department', 'PLDEP', 1, '2026-09-05 09:09:42.047', '2026-09-05 09:09:42.047'),
('72dbb1ac-fc20-4a5c-8164-2749be838a02', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Plant Department', 'PLDEP', 1, '2026-09-05 09:09:42.047', '2026-09-05 09:09:42.047'),
('73b33742-f130-4415-84c1-13c822545bbb', '7148d149-3de9-4fb8-9b0b-003788657636', 'Loader Operation', 'LOPE', 1, '2026-09-05 09:35:46.337', '2026-09-05 09:35:46.337'),
('7aa89ee1-d67f-4ac6-9a6d-7deb001f5122', '7148d149-3de9-4fb8-9b0b-003788657636', 'Human Resources', 'HR', 1, '2026-09-05 09:35:46.333', '2026-09-05 09:35:46.333'),
('802b2644-c09e-4ab8-a66b-4cdcdad52bd3', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Operations Department', 'OPDEP', 1, '2026-09-05 14:40:43.848', '2026-09-05 14:40:43.848'),
('81e6c2a0-3d84-4862-9a09-c26c1b8fd403', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Accounts', 'ACC', 1, '2026-09-05 14:40:44.146', '2026-09-05 14:40:44.146'),
('822e5aad-b886-413d-bc3f-b425d89cac9f', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Excavator Operation', 'EXOPE', 1, '2026-09-05 09:11:01.215', '2026-09-05 09:11:01.215'),
('8441ca2e-fa37-4f3c-b039-45460d0152c3', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Kitchen Department', 'KITDE', 1, '2026-09-05 09:13:45.318', '2026-09-05 09:13:45.318'),
('8458294d-7eb0-49bd-be81-701e58672ac0', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Procurement', 'PROC', 1, '2026-09-05 09:37:31.041', '2026-09-05 09:37:31.041'),
('88d20087-1416-43ce-9e32-d782059fc9bb', '7148d149-3de9-4fb8-9b0b-003788657636', 'Store', 'STORE', 1, '2026-09-05 09:35:46.334', '2026-09-05 09:35:46.334'),
('8998ea8b-23bf-4155-a1ca-8d7c79b12e5f', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Human Resources', 'HR', 1, '2026-09-05 09:37:31.041', '2026-09-05 09:37:31.041'),
('8e564749-1474-42fb-b8a5-f44dde72e320', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Production', 'PROD', 1, '2026-09-05 14:40:44.148', '2026-09-05 14:40:44.148'),
('91019e36-272f-4a09-b890-8c5fc4a42627', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Workshop', 'WORK', 1, '2026-09-05 14:40:44.148', '2026-09-05 14:40:44.148'),
('985de63e-f63d-4485-9550-e5a3cafb905e', '7148d149-3de9-4fb8-9b0b-003788657636', 'Administration', 'ADMIN', 1, '2026-09-05 09:35:46.329', '2026-09-05 09:35:46.329'),
('9aa60002-950c-45ab-83ab-69f622d61286', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Loader Operation', 'LOPE', 1, '2026-09-05 09:11:58.346', '2026-09-05 09:11:58.346'),
('9c5bc6b2-23ec-4460-9831-1cee590841fb', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Kitchen Department', 'KITDE', 1, '2026-09-05 09:37:31.045', '2026-09-05 09:37:31.045'),
('9c9313b1-2133-4860-a3c3-f6a7c97ad651', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Accounts', 'ACC', 1, '2026-09-05 09:01:06.099', '2026-09-05 09:01:06.099'),
('9f254309-d1f5-4c47-8283-c12977b09643', '7148d149-3de9-4fb8-9b0b-003788657636', 'Production', 'PROD', 1, '2026-09-05 09:35:46.335', '2026-09-05 09:35:46.335'),
('a80a0d04-30f7-4e87-80f0-f1d52a62690a', '7148d149-3de9-4fb8-9b0b-003788657636', 'Excavator Operation', 'EXOPE', 1, '2026-09-05 09:35:46.336', '2026-09-05 09:35:46.336'),
('ae84c819-ca14-499f-a105-28a1dd91f61f', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Sales', 'SALES', 1, '2026-09-05 14:40:44.149', '2026-09-05 14:40:44.149'),
('b440862e-c6b2-4054-820f-e1bb3974efdd', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Workshop', 'WORK', 1, '2026-09-05 09:37:31.042', '2026-09-05 09:37:31.042'),
('b4c2a981-4e5a-417e-9cd5-e449d8bc2f49', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Store', 'STORE', 1, '2026-09-05 14:40:44.148', '2026-09-05 14:40:44.148'),
('b6d0edb0-2fc7-42e5-94b5-3aaa15877987', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Management', 'MGMT', 1, '2026-09-02 18:03:53.763', '2026-09-02 18:03:53.763'),
('bbebcca4-0680-4d78-a13d-57b1babed007', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Procurement', 'PROC', 1, '2026-09-02 18:03:53.756', '2026-09-02 18:03:53.756'),
('bcbcec05-cbff-47b3-88e4-1ee8a79ea5cd', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Kitchen Department', 'KITDE', 1, '2026-09-05 14:40:44.152', '2026-09-05 14:40:44.152'),
('bd2867f8-82ad-47cb-b65c-d84e318c691b', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Store', 'STORE', 1, '2026-09-02 18:03:53.761', '2026-09-02 18:03:53.761'),
('c037541b-ce13-4319-b8c6-37f94a0c4bfe', '7148d149-3de9-4fb8-9b0b-003788657636', 'Sales', 'SALES', 1, '2026-09-05 09:35:46.335', '2026-09-05 09:35:46.335'),
('c72cad79-9061-4b3e-909c-d60a3d058efd', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Sales', 'SALES', 1, '2026-09-02 18:03:53.763', '2026-09-02 18:03:53.763'),
('c8db9c0d-0452-43a6-ba3f-a6e8c44093b6', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Management', 'MGMT', 1, '2026-09-05 09:01:06.105', '2026-09-05 09:01:06.105'),
('cd15f01c-8b59-4ba7-bf6f-c7d186e11dcb', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Production', 'PROD', 1, '2026-09-05 09:37:31.042', '2026-09-05 09:37:31.042'),
('cmtkzy0pk001qug6oijp0bkba', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Excavator Operation', 'EXOP', 1, '2026-09-03 03:59:55.161', '2026-09-03 03:59:55.161'),
('d17b47a0-e958-4cd6-84cd-16fc7b29e9cb', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Excavator Operation', 'EXOPE', 1, '2026-09-05 14:40:44.150', '2026-09-05 14:40:44.150'),
('d490261e-fe48-4c10-9b69-3b55f9d80bb7', '7148d149-3de9-4fb8-9b0b-003788657636', 'Procurement', 'PROC', 1, '2026-09-05 09:35:46.333', '2026-09-05 09:35:46.333'),
('d4a820dc-5489-4409-8f27-81346ef57523', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Sales', 'SALES', 1, '2026-09-05 09:37:31.043', '2026-09-05 09:37:31.043'),
('d8b8813d-22ba-4712-aad9-2d0a17f5fe5a', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Human Resources', 'HR', 1, '2026-09-05 09:01:06.100', '2026-09-05 09:01:06.100'),
('de4465c9-12e9-4203-97ad-0c73d8769d47', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Kitchen Department', 'KITDE', 1, '2026-09-05 09:13:45.316', '2026-09-05 09:13:45.316'),
('e4a9891f-d2b7-4e04-8c65-e3c3dc1223e9', '7148d149-3de9-4fb8-9b0b-003788657636', 'Truck Operation', 'TRKOP', 1, '2026-09-05 09:35:46.337', '2026-09-05 09:35:46.337'),
('e4c20b1e-6ce9-4c28-93e5-86a61ee569d3', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Truck Operation', 'TRKOP', 1, '2026-09-05 09:12:48.875', '2026-09-05 09:12:48.875'),
('e5f0f168-6a3c-4789-9e2f-172bdc9fdb88', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Procurement', 'PROC', 1, '2026-09-05 14:40:44.147', '2026-09-05 14:40:44.147'),
('e62e7a5a-b7a3-4fd6-ae03-70649f2d14b8', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Accounts', 'ACC', 1, '2026-09-05 09:37:31.040', '2026-09-05 09:37:31.040'),
('e63667fc-ad16-4a60-a354-d28aa0a46864', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Plant Department', 'PLDEP', 1, '2026-09-05 09:37:31.043', '2026-09-05 09:37:31.043'),
('e7b87c86-db25-4625-aa94-50c6594ba493', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Human Resources', 'HR', 1, '2026-09-02 18:03:53.756', '2026-09-02 18:03:53.756'),
('ece0c090-93f9-4ffd-bf10-804a4163610a', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Workshop', 'WORK', 1, '2026-09-02 18:03:53.762', '2026-09-02 18:03:53.762'),
('ed8989c6-a322-47d8-ac98-46aa24165271', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Excavator Operation', 'EXOPE', 1, '2026-09-05 09:11:01.214', '2026-09-05 09:11:01.214'),
('ee66b919-716e-4238-953d-3c490caa7065', '7148d149-3de9-4fb8-9b0b-003788657636', 'Management', 'MGMT', 1, '2026-09-05 09:35:46.336', '2026-09-05 09:35:46.336'),
('efb6f9c5-5f01-44e5-a87c-260ca209b9e7', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Accounts', 'ACC', 1, '2026-09-02 18:03:53.755', '2026-09-02 18:03:53.755'),
('f65efbec-7607-4cbb-8919-04bfa831287b', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Sales', 'SALES', 1, '2026-09-05 09:01:06.105', '2026-09-05 09:01:06.105'),
('f8f6d520-d888-4f5f-a187-f2c6d90c5ade', '7148d149-3de9-4fb8-9b0b-003788657636', 'Operations Department', 'OPDEP', 1, '2026-09-05 14:40:43.852', '2026-09-05 14:40:43.852'),
('ff1fbaed-ee08-4eec-958b-9cc7e19f62cc', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Truck Operation', 'TRKOP', 1, '2026-09-05 09:12:48.873', '2026-09-05 09:12:48.873');

-- --------------------------------------------------------

--
-- Table structure for table `InventoryTransaction`
--

CREATE TABLE `InventoryTransaction` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `type` enum('IN','OUT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `date` date NOT NULL,
  `remarks` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `InventoryTransaction`
--

INSERT INTO `InventoryTransaction` (`id`, `orgId`, `productId`, `type`, `quantity`, `date`, `remarks`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkbz5j3000dug6o3k5us0jd', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkbs9z50007ug6olqxqqocj', 'IN', 10, '2026-09-02', NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:48:57.279', '2026-09-02 16:48:57.279');

-- --------------------------------------------------------

--
-- Table structure for table `LeaveRequest`
--

CREATE TABLE `LeaveRequest` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `staffId` varchar(191) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `reviewedById` varchar(191) DEFAULT NULL,
  `leaveFrom` date NOT NULL,
  `leaveTo` date NOT NULL,
  `numberOfDays` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `leaveSlipUrl` varchar(191) DEFAULT NULL,
  `reviewedAt` datetime(3) DEFAULT NULL,
  `reviewNote` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `LeaveRequest`
--

INSERT INTO `LeaveRequest` (`id`, `orgId`, `staffId`, `createdById`, `reviewedById`, `leaveFrom`, `leaveTo`, `numberOfDays`, `reason`, `status`, `leaveSlipUrl`, `reviewedAt`, `reviewNote`, `createdAt`, `updatedAt`) VALUES
('cmtkbv2y3000bug6ovdgke9he', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkae6td00090g6oe9ubpr6b', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-03', '2026-09-03', 1, 'sick', 'APPROVED', '/uploads/leave-slips/1788367589651-0c348f7f-1017-4e87-8706-e764f7a5efc3.pdf', '2026-09-02 16:46:16.151', 'ok', '2026-09-02 16:45:47.307', '2026-09-02 16:46:29.668'),
('cmtkcomsa000xug6o9d0cz61q', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkae6td00090g6oe9ubpr6b', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-03', '2026-09-03', 1, 'jj', 'REJECTED', NULL, '2026-09-03 03:14:34.755', 'no', '2026-09-02 17:08:46.042', '2026-09-03 03:14:34.757'),
('cmtnvuj5g002aug6ohyg76w3a', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkae6td00090g6oe9ubpr6b', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', NULL, '2026-09-12', '2026-09-12', 1, 'ghar ko puja', 'PENDING', NULL, NULL, NULL, '2026-09-05 04:28:32.500', '2026-09-05 04:28:32.500');

-- --------------------------------------------------------

--
-- Table structure for table `LoginAttempt`
--

CREATE TABLE `LoginAttempt` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `status` enum('SUCCESS','FAILED','BLOCKED') NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `LoginAttempt`
--

INSERT INTO `LoginAttempt` (`id`, `userId`, `ipAddress`, `userAgent`, `status`, `createdAt`) VALUES
('cmto4vocn003bug6o8l4e5kz3', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'SUCCESS', '2026-09-05 08:41:22.439'),
('cmto4vpqp003dug6o0mb0snci', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0', 'SUCCESS', '2026-09-05 08:41:24.241'),
('cmtoedsbb003nug6omof14ard', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'FAILED', '2026-09-05 13:07:23.927'),
('cmtoee21e003oug6o6vm69n7w', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'FAILED', '2026-09-05 13:07:36.530'),
('cmtoehx7z003rug6otslp8ngo', '4f5467dd-a9b8-4cac-b825-3255e4485adf', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'SUCCESS', '2026-09-05 13:10:36.911'),
('cmtoembmk003vug6o0hs8q9ou', 'cmtoelojn003sug6oo1rgh6yp', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'SUCCESS', '2026-09-05 13:14:02.204');

-- --------------------------------------------------------

--
-- Table structure for table `MaintenanceItem`
--

CREATE TABLE `MaintenanceItem` (
  `id` varchar(191) NOT NULL,
  `maintenanceId` varchar(191) NOT NULL,
  `itemName` varchar(191) NOT NULL,
  `partSerialNo` varchar(191) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unitCost` decimal(10,2) DEFAULT NULL,
  `totalCost` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MaintenanceItem`
--

INSERT INTO `MaintenanceItem` (`id`, `maintenanceId`, `itemName`, `partSerialNo`, `quantity`, `unitCost`, `totalCost`) VALUES
('cmtkarznt0001ug6o4s13o87w', 'cmtkarznk0000ug6otm0xx2fz', 'kkk', 'jhjkj', 8, 800.00, 6400.00);

-- --------------------------------------------------------

--
-- Table structure for table `MaintenanceShop`
--

CREATE TABLE `MaintenanceShop` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `contactNo` varchar(191) DEFAULT NULL,
  `panNo` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MaintenanceShop`
--

INSERT INTO `MaintenanceShop` (`id`, `orgId`, `name`, `contactNo`, `panNo`, `address`, `isActive`, `notes`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkaj3mw000a0g6ogsgs2n21', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Guru Repair shop', '9800000000', 'ADSASD9999', 'kathmandu-01', 1, 'remarks', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:08:28.712', '2026-09-02 16:39:21.213');

-- --------------------------------------------------------

--
-- Table structure for table `MaintenanceShopPayment`
--

CREATE TABLE `MaintenanceShopPayment` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `shopId` varchar(191) NOT NULL,
  `maintenanceId` varchar(191) DEFAULT NULL,
  `paymentDate` date NOT NULL,
  `paidamount` decimal(10,2) NOT NULL,
  `remainingamount` decimal(10,2) NOT NULL,
  `paymentMethod` enum('CASH','CHEQUE','ESEWA','KHALTI','FONEPAY','BANK_TRANSFER') NOT NULL DEFAULT 'CASH',
  `chequedetail` text DEFAULT NULL,
  `chequeamount` decimal(10,2) DEFAULT NULL,
  `voucherPath` text DEFAULT NULL,
  `voucherPaths` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MaintenanceShopPayment`
--

INSERT INTO `MaintenanceShopPayment` (`id`, `orgId`, `shopId`, `maintenanceId`, `paymentDate`, `paidamount`, `remainingamount`, `paymentMethod`, `chequedetail`, `chequeamount`, `voucherPath`, `voucherPaths`, `remarks`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkbot8u0004ug6ordw49qwn', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkaj3mw000a0g6ogsgs2n21', 'cmtkarznk0000ug6otm0xx2fz', '2026-09-02', 1000.00, 5400.00, 'CASH', NULL, NULL, NULL, '[\"/uploads/maintenance-shop-payment-vouchers/1788367254752-e54b0b92-357b-419a-8843-9fdc419f8698.pdf\"]', NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:40:54.798', '2026-09-02 16:40:54.798'),
('cmtkbq6qf0005ug6ojmgww0cl', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkaj3mw000a0g6ogsgs2n21', 'cmtkarznk0000ug6otm0xx2fz', '2026-09-02', 1000.00, 4400.00, 'CASH', NULL, NULL, NULL, '[\"/uploads/maintenance-shop-payment-vouchers/1788367318925-1a365ea9-5024-4127-aa73-eb4a1f6bffb9.pdf\"]', NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:41:58.935', '2026-09-02 16:41:58.935'),
('cmtkc8kj3000pug6o3xw2m982', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkaj3mw000a0g6ogsgs2n21', 'cmtkarznk0000ug6otm0xx2fz', '2026-09-02', 2000.00, 2400.00, 'CASH', NULL, NULL, NULL, '[\"/uploads/maintenance-shop-payment-vouchers/1788368176613-9549475a-121a-4519-92ea-98ab15f2352c.pdf\"]', NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:56:16.623', '2026-09-02 16:56:16.623');

-- --------------------------------------------------------

--
-- Table structure for table `MasterProduct`
--

CREATE TABLE `MasterProduct` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `productCode` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `serialNo` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `reorderLevel` int(11) NOT NULL DEFAULT 0,
  `supplierAName` varchar(191) DEFAULT NULL,
  `supplierARate` decimal(10,2) DEFAULT NULL,
  `supplierBName` varchar(191) DEFAULT NULL,
  `supplierBRate` decimal(10,2) DEFAULT NULL,
  `supplierCName` varchar(191) DEFAULT NULL,
  `supplierCRate` decimal(10,2) DEFAULT NULL,
  `photo1` varchar(191) DEFAULT NULL,
  `photo2` varchar(191) DEFAULT NULL,
  `photo3` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MasterProduct`
--

INSERT INTO `MasterProduct` (`id`, `orgId`, `productCode`, `name`, `category`, `size`, `serialNo`, `location`, `reorderLevel`, `supplierAName`, `supplierARate`, `supplierBName`, `supplierBRate`, `supplierCName`, `supplierCRate`, `photo1`, `photo2`, `photo3`, `isActive`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkbs9z50007ug6olqxqqocj', '8a27055b-15d1-499f-ab2d-d9218c72a528', '001', 'xyz', 'Batteries', 'sad', NULL, NULL, 0, 'ram', 100.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:43:36.449', '2026-09-02 16:43:36.449');

-- --------------------------------------------------------

--
-- Table structure for table `MaterialRate`
--

CREATE TABLE `MaterialRate` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `materialId` varchar(191) NOT NULL,
  `referenceVehicleId` varchar(191) NOT NULL,
  `basePrice` decimal(10,2) NOT NULL,
  `setById` varchar(191) NOT NULL,
  `setAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MaterialRate`
--

INSERT INTO `MaterialRate` (`id`, `orgId`, `materialId`, `referenceVehicleId`, `basePrice`, `setById`, `setAt`, `createdAt`, `updatedAt`) VALUES
('cmtkc9vk8000rug6o6l3a1mr8', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkbudrf0009ug6oye6270bw', 'cmtkc9dw0000qug6ovy1atmjh', 9000.00, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:57:17.573', '2026-09-02 16:57:17.576', '2026-09-02 16:57:17.576');

-- --------------------------------------------------------

--
-- Table structure for table `MaterialRateDetail`
--

CREATE TABLE `MaterialRateDetail` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `rateId` varchar(191) NOT NULL,
  `tripVehicleId` varchar(191) NOT NULL,
  `calculatedRate` decimal(10,2) NOT NULL,
  `internalTotal` decimal(10,2) NOT NULL,
  `internalTaxable` decimal(10,2) NOT NULL,
  `internalVat` decimal(10,2) NOT NULL,
  `externalRate` decimal(10,2) NOT NULL,
  `snapshotVolume` decimal(10,3) NOT NULL,
  `snapshotBasePrice` decimal(10,2) NOT NULL,
  `snapshotRefVolume` decimal(10,3) NOT NULL,
  `calculatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MaterialRateDetail`
--

INSERT INTO `MaterialRateDetail` (`id`, `orgId`, `rateId`, `tripVehicleId`, `calculatedRate`, `internalTotal`, `internalTaxable`, `internalVat`, `externalRate`, `snapshotVolume`, `snapshotBasePrice`, `snapshotRefVolume`, `calculatedAt`, `updatedAt`) VALUES
('cmtkc9vkd000sug6ohqajmgpq', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkc9vk8000rug6o6l3a1mr8', 'cmtkc9dw0000qug6ovy1atmjh', 9000.00, 9000.00, 7964.60, 1035.40, 9000.00, 265.000, 9000.00, 265.000, '2026-09-02 16:57:17.578', '2026-09-02 16:57:17.581'),
('cmtkcasso000uug6oo7kvtce4', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkc9vk8000rug6o6l3a1mr8', 'cmtkcacz3000tug6omcx7a7zy', 5800.00, 5800.00, 5132.74, 667.26, 5800.00, 170.000, 9000.00, 265.000, '2026-09-02 16:58:00.646', '2026-09-02 16:58:00.648');

-- --------------------------------------------------------

--
-- Table structure for table `Orders`
--

CREATE TABLE `Orders` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `productCode` varchar(191) NOT NULL,
  `productName` varchar(191) NOT NULL,
  `size` varchar(191) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `details` text DEFAULT NULL,
  `usedFor` varchar(191) DEFAULT NULL,
  `statusRemark` text DEFAULT NULL,
  `orderByStaffId` varchar(191) NOT NULL,
  `orderToMemberId` varchar(191) NOT NULL,
  `status` enum('PENDING','SENT','RECEIVED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `informed` tinyint(1) NOT NULL DEFAULT 0,
  `checkedById` varchar(191) DEFAULT NULL,
  `orderSentDate` date DEFAULT NULL,
  `goodsReceivedDate` date DEFAULT NULL,
  `verifiedById` varchar(191) DEFAULT NULL,
  `verifiedAt` datetime(3) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `Orders`
--

INSERT INTO `Orders` (`id`, `orgId`, `productId`, `date`, `productCode`, `productName`, `size`, `quantity`, `details`, `usedFor`, `statusRemark`, `orderByStaffId`, `orderToMemberId`, `status`, `informed`, `checkedById`, `orderSentDate`, `goodsReceivedDate`, `verifiedById`, `verifiedAt`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkcu81w000zug6ojuwhhw3j', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkbs9z50007ug6olqxqqocj', '2026-09-02', '001', 'xyz', '80*20', 80, 'no det', 'used', NULL, 'cmtkae6td00090g6oe9ubpr6b', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'PENDING', 0, NULL, NULL, NULL, NULL, NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 17:13:06.884', '2026-09-02 17:13:06.884'),
('cmtkxzl310013ug6op46flrh8', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkbs9z50007ug6olqxqqocj', '2026-09-03', '001', 'xyz', NULL, 12, NULL, NULL, NULL, 'cmtkae6td00090g6oe9ubpr6b', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'PENDING', 0, NULL, NULL, NULL, NULL, NULL, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-03 03:05:08.989', '2026-09-03 03:05:08.989');

-- --------------------------------------------------------

--
-- Table structure for table `Organization`
--

CREATE TABLE `Organization` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `advanceRequestLimit` int(11) DEFAULT NULL,
  `additionalAdvanceLimit` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Organization`
--

INSERT INTO `Organization` (`id`, `name`, `slug`, `isActive`, `advanceRequestLimit`, `additionalAdvanceLimit`, `createdAt`, `updatedAt`) VALUES
('7148d149-3de9-4fb8-9b0b-003788657636', 'trial', 'trial', 1, NULL, NULL, '2026-09-05 09:35:46.309', '2026-09-05 09:35:46.309'),
('8a27055b-15d1-499f-ab2d-d9218c72a528', 'Everest', 'everest', 1, 5000, 5000, '2026-09-02 18:03:53.740', '2026-09-05 04:33:04.229'),
('a0271c37-aaf9-474c-b010-62ae96686777', 'ppis', 'ppis', 1, NULL, NULL, '2026-09-05 13:10:35.000', '2026-09-05 09:36:58.507'),
('d577b71d-5580-43b1-8443-8c7133747b55', 'mpis', 'mpis', 1, 5000, 5000, '2026-09-05 09:37:31.005', '2026-09-05 13:18:15.587');

-- --------------------------------------------------------

--
-- Table structure for table `OrganizationMember`
--

CREATE TABLE `OrganizationMember` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `role` enum('ADMIN','SUPERVISOR','PROCUREMENT','EMPLOYEE','GUEST', 'PURCHASE_STAFF') NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `OrganizationMember`
--

INSERT INTO `OrganizationMember` (`id`, `userId`, `orgId`, `role`, `isActive`) VALUES
('a0271c37-aaf9-474c-b010-62ae96686888', 'a0271c37-aaf9-474c-b010-62ae96686666', 'a0271c37-aaf9-474c-b010-62ae96686777', 'ADMIN', 1),
('cmtnvvliw002cug6oq1fmj7tr', 'cmtnvvlis002bug6obbzq5lf9', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'PROCUREMENT', 1),
('cmtnvwxr5002eug6ooro9gtrf', 'cmtnvwxr3002dug6o13xvzhvv', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'EMPLOYEE', 1),
('cmtnvximf002gug6oy5tg5hux', 'cmtnvximb002fug6o2csix78r', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'SUPERVISOR', 1),
('cmtod0uog003fug6oq084dh3j', 'cmtod0uod003eug6o8uflrjct', 'd577b71d-5580-43b1-8443-8c7133747b55', 'PROCUREMENT', 1),
('cmtod3du7003hug6oyfh03pth', 'cmtod3du4003gug6orh6r9phk', 'd577b71d-5580-43b1-8443-8c7133747b55', 'SUPERVISOR', 1),
('cmtoelok4003tug6oovhht7s0', 'cmtoelojn003sug6oo1rgh6yp', '7148d149-3de9-4fb8-9b0b-003788657636', 'EMPLOYEE', 1),
('d4b5442c-b7ac-4579-9a8d-a48be5140527', '4f5467dd-a9b8-4cac-b825-3255e4485adf', '7148d149-3de9-4fb8-9b0b-003788657636', 'ADMIN', 1),
('f1125955-aa71-4d63-a94f-be26a9a49ca1', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', 'd577b71d-5580-43b1-8443-8c7133747b55', 'ADMIN', 1),
('fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'a0271c37-aaf9-474c-b010-62ae96686559', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'ADMIN', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Otp`
--

CREATE TABLE `Otp` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `otpHash` varchar(191) NOT NULL,
  `purpose` enum('EMAIL_VERIFICATION','PASSWORD_RESET','PHONE_VERIFICATION','LOGIN_VERIFICATION') NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `verifiedAt` datetime(3) DEFAULT NULL,
  `used` enum('USED','NOT_USED') NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Plant`
--

CREATE TABLE `Plant` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Plant`
--

INSERT INTO `Plant` (`id`, `orgId`, `name`, `description`, `location`, `isActive`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkbrfpg0006ug6olgnzmqd8', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'crusher plant', NULL, 'melamchi', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:42:57.220', '2026-09-02 16:42:57.220');

-- --------------------------------------------------------

--
-- Table structure for table `PlantMaintenanceComponent`
--

CREATE TABLE `PlantMaintenanceComponent` (
  `id` varchar(191) NOT NULL,
  `reportId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `serialNo` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ProductCategory`
--

CREATE TABLE `ProductCategory` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ProductCategory`
--

INSERT INTO `ProductCategory` (`id`, `orgId`, `name`, `isActive`, `createdById`, `createdAt`, `updatedAt`) VALUES
('00feef88-0b97-4e4c-873d-bf2bc53adacd', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Brake Parts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.114', '2026-09-05 09:01:06.114'),
('02dab0b2-d2c4-4ca7-988c-1ac664737f9f', '7148d149-3de9-4fb8-9b0b-003788657636', 'Gearbox Parts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.353', '2026-09-05 09:35:46.353'),
('03c49ba7-3ccf-4bc5-a606-db67edb2e613', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Main Shaft', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:35:36.465', '2026-09-05 15:35:36.465'),
('03ce2bed-f26b-4d3c-9874-dbca02cf408c', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Wear Plates', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.175', '2026-09-05 14:40:44.175'),
('057072d7-ea07-4503-98e8-5b1925ef503a', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Toggle Plate', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:32:44.085', '2026-09-05 15:32:44.085'),
('074de53c-60a3-44ec-a01a-6de97274aca9', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Lubricants', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.781', '2026-09-02 18:03:53.781'),
('078c2618-7e00-489f-824c-9bf4514bd618', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Pipes', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.782', '2026-09-02 18:03:53.782'),
('080c827a-c82e-4ad0-9475-5c3566c1e7e1', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Couplings', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.095', '2026-09-05 09:37:31.095'),
('09442016-acf5-43ed-9782-245f89c66176', '7148d149-3de9-4fb8-9b0b-003788657636', 'Screen Media/Mesh', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:37:13.666', '2026-09-05 15:37:13.666'),
('099832aa-e43c-48ed-9f6c-3dbe8194efe3', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Switches', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.104', '2026-09-05 09:37:31.104'),
('0c43dccf-32f6-401c-88c2-04daa0404ee6', '7148d149-3de9-4fb8-9b0b-003788657636', 'Hydraulic Parts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.354', '2026-09-05 09:35:46.354'),
('0c9e94b0-4bc8-4d47-86ce-f7f1bd0a6286', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Vibrating Springs', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:37:26.919', '2026-09-05 15:37:26.919'),
('0dfa4fdb-e335-43bc-9b7a-b57bdbc331e0', '7148d149-3de9-4fb8-9b0b-003788657636', 'Toggle Seat', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:33:02.604', '2026-09-05 15:33:02.604'),
('0e100af9-dd26-4da9-b8b0-b5dd8d17491b', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Clamp Bars & Tension Bolts', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:38:00.633', '2026-09-05 15:38:00.633'),
('0e65ebb8-ca9e-4c8b-b921-8620ac6c9585', '7148d149-3de9-4fb8-9b0b-003788657636', 'Spray Nozzles', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:38:14.171', '2026-09-05 15:38:14.171'),
('101d1e75-6d34-4738-81c6-2684fcacef25', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Cheek Plates (Side Liners)', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:33:18.675', '2026-09-05 15:33:18.675'),
('104c8a76-7491-4f69-ad42-643d5e615411', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Batteries', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.106', '2026-09-05 09:01:06.106'),
('108798b4-f072-4a7f-8bd2-6f3515d15652', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Jaw Plates', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.099', '2026-09-05 09:37:31.099'),
('11482176-7ea4-4c03-9dd8-e0c13f009ff4', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Main Shaft', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:35:36.465', '2026-09-05 15:35:36.465'),
('115d2bc9-e8ec-462c-bfb4-f2ce39afc152', '7148d149-3de9-4fb8-9b0b-003788657636', 'Main Shaft', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:35:36.466', '2026-09-05 15:35:36.466'),
('118a1046-c366-48d7-ada3-fc8292db6caa', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Fasteners', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.158', '2026-09-05 14:40:44.158'),
('1416224e-9c21-4b6d-b617-e39148ae6058', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Fasteners', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.097', '2026-09-05 09:37:31.097'),
('147e00ef-c7ce-453f-a022-970ed50a710f', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Engine Parts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.158', '2026-09-05 14:40:44.158'),
('1593d7bc-1a90-4a1d-8c47-ff49430988e3', '7148d149-3de9-4fb8-9b0b-003788657636', 'Socket Liner', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:35:07.188', '2026-09-05 15:35:07.188'),
('15ddadd3-ac8e-4b60-8e88-99707a962e25', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Cutting Tools', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.096', '2026-09-05 09:37:31.096'),
('1662f890-4007-4a43-b4ed-c3031bb8045b', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Drive pulleys', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:40:20.514', '2026-09-05 15:40:20.514'),
('16b5bbf3-ed39-40ef-b0d2-1b20dc8d202a', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Carrying rollers', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:39:07.124', '2026-09-05 15:39:07.124'),
('17e1e8f9-c86b-4fef-9153-19d626466e6d', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Screen Media/Mesh', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:37:13.664', '2026-09-05 15:37:13.664'),
('18e5d702-b480-4b05-ae79-b2186560554f', '7148d149-3de9-4fb8-9b0b-003788657636', 'Pitman', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:33:31.412', '2026-09-05 15:33:31.412'),
('19762f97-c20e-45ea-a730-e59862a06a86', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Hoses', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.778', '2026-09-02 18:03:53.778'),
('19d2b173-1d22-40ae-a125-25e5d65e3cc8', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Crusher Parts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.095', '2026-09-05 09:37:31.095'),
('1c5bb517-30b9-4ebf-a3b0-2b82ed3b0913', '7148d149-3de9-4fb8-9b0b-003788657636', 'Electrical Parts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.344', '2026-09-05 09:35:46.344'),
('1c7697f8-b8b4-4d39-bc98-2a172cdb1f15', '7148d149-3de9-4fb8-9b0b-003788657636', 'Tyres', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.359', '2026-09-05 09:35:46.359'),
('1cf2316e-c49c-4c56-bde9-90cb84756471', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Torch Ring & Locking Bolt', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:36:23.480', '2026-09-05 15:36:23.480'),
('1da82548-cab8-47f6-9774-b088ba94c791', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Hoses', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.160', '2026-09-05 14:40:44.160'),
('1f6960b1-b039-4583-9104-f5e223cbe0ee', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Eccentric Shaft & Vibrator Unit', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:37:46.330', '2026-09-05 15:37:46.330'),
('1fb8eac7-a545-43d5-b81c-808a09c5aadf', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Torch Ring & Locking Bolt', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:36:23.481', '2026-09-05 15:36:23.481'),
('1fdd867d-ec64-40b9-9217-516de56ae328', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Welding Materials', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.133', '2026-09-05 09:01:06.133'),
('20be65ee-8658-4a8a-8d08-c557839fb374', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Conveyor Parts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.155', '2026-09-05 14:40:44.155'),
('276a709b-0518-46ed-949e-3165045b3421', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Pitman', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:33:31.400', '2026-09-05 15:33:31.400'),
('277fe44f-1060-44c6-a26e-c20df153baf1', '7148d149-3de9-4fb8-9b0b-003788657636', 'Cutting Tools', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.342', '2026-09-05 09:35:46.342'),
('290445fb-2b7f-401d-95f8-f37ab98acdcf', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Pumps', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.128', '2026-09-05 09:01:06.128'),
('2d62a2e2-5c7b-4597-a28a-3bf4cd17c731', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Electrical Parts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.776', '2026-09-02 18:03:53.776'),
('2dbb2f94-fb39-44ba-89f9-51f8978e377b', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Lights', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.126', '2026-09-05 09:01:06.126'),
('2f469645-5fbe-4296-a856-36c2b295a7bb', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Valves', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.805', '2026-09-02 18:03:53.805'),
('2f4768a6-e5f3-4ea2-8fb4-93b7ac896c6b', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Eccentric Bushing', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:34:56.546', '2026-09-05 15:34:56.546'),
('2f9a270d-f163-44f8-ae19-a0684680f578', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Bearings', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.153', '2026-09-05 14:40:44.153'),
('2fbf460e-9454-485e-a324-b970443ef00b', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Valves', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.132', '2026-09-05 09:01:06.132'),
('2fe38daf-54c1-4b48-8bac-21844d02dacd', '7148d149-3de9-4fb8-9b0b-003788657636', 'Eccentric Bushing', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:34:56.546', '2026-09-05 15:34:56.546'),
('2fe5c67a-0eb0-4f89-9f1c-0b847a227349', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Electrical Parts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.157', '2026-09-05 14:40:44.157'),
('3010ca3d-f7d9-4599-bab6-4ec06871334f', '7148d149-3de9-4fb8-9b0b-003788657636', 'Drive pulleys', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:40:20.532', '2026-09-05 15:40:20.532'),
('31650ee6-5930-4efe-b181-34e7c823d402', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Switches', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.803', '2026-09-02 18:03:53.803'),
('318c3c4d-8cac-4200-97e4-bf218d9490d2', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Pumps', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.164', '2026-09-05 14:40:44.164'),
('32516107-525c-4626-bdbe-c75429e87f61', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Safety Items', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.101', '2026-09-05 09:37:31.101'),
('32beb25d-dfed-49ab-9528-ae6c45b61e45', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Miscellaneous', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.162', '2026-09-05 14:40:44.162'),
('35e90b16-679c-446f-9a3a-ac9b3d3eed92', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Screen Media/Mesh', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:37:13.666', '2026-09-05 15:37:13.666'),
('37e44206-b8aa-426a-a17b-cdacacd3dd3d', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Gaskets', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.124', '2026-09-05 09:01:06.124'),
('3941de1a-df17-49dc-ba87-ca26cec7435e', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Blow Bars', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.114', '2026-09-05 09:01:06.114'),
('3a0dcadf-83fa-43e0-8a4d-e4bd49649391', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Brake Parts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.154', '2026-09-05 14:40:44.154'),
('3bcdb8fc-e202-4988-a4ac-2ad25e6b8602', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Miscellaneous', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.781', '2026-09-02 18:03:53.781'),
('3ca554b6-1996-4bdd-b24c-5c7ffdb8ca3f', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Brake Parts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.074', '2026-09-05 09:37:31.074'),
('3d01bcbe-f82b-40ed-af0a-e5c7999c853a', '7148d149-3de9-4fb8-9b0b-003788657636', 'Filters', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.352', '2026-09-05 09:35:46.352'),
('3e01a27a-e199-479f-a8f0-5611e1293145', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Spray Nozzles', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:38:14.170', '2026-09-05 15:38:14.170'),
('3e4a9147-161d-4df4-b98c-2ac54d2f2092', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Tyres', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.805', '2026-09-02 18:03:53.805'),
('3e9da626-add1-4204-b9f7-8f5701022f39', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Toggle Seat', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:33:02.575', '2026-09-05 15:33:02.575'),
('3f1b9322-48bf-4f38-a26b-4fb45698394c', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Filters', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.124', '2026-09-05 09:01:06.124'),
('3f478651-cd0a-4b19-b5cf-08afea0a61b3', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Couplings', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.156', '2026-09-05 14:40:44.156'),
('3fd1a189-8e1f-41f2-99a4-212a1d62159b', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Return rollers', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:39:20.923', '2026-09-05 15:39:20.923'),
('40c87c0b-916f-4810-a6a3-95fc3d1b2c4e', '7148d149-3de9-4fb8-9b0b-003788657636', 'Wear Plates', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.359', '2026-09-05 09:35:46.359'),
('40f3dd97-e2ba-4121-a532-89a874ee3cd9', '7148d149-3de9-4fb8-9b0b-003788657636', 'Brake Parts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.340', '2026-09-05 09:35:46.340'),
('41163e6a-7c5a-4439-bded-769d7541d56e', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Frame Liners', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:35:49.920', '2026-09-05 15:35:49.920'),
('434f1866-4382-42be-a334-93c856167127', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Eccentric Shaft & Bearings', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:33:47.758', '2026-09-05 15:33:47.758'),
('438f1cbf-6872-419c-8ce3-3833ce001532', '7148d149-3de9-4fb8-9b0b-003788657636', 'Belts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.340', '2026-09-05 09:35:46.340'),
('43a1426e-824d-4b10-8a87-18b42bcd5d05', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Frame Liners', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:35:49.922', '2026-09-05 15:35:49.922'),
('44033d2c-fd9b-4497-b278-ee18ab35ebb9', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Clamp Bars & Tension Bolts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:38:00.651', '2026-09-05 15:38:00.651'),
('45856205-4ab4-4f90-b675-1db008442cd1', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Lights', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.779', '2026-09-02 18:03:53.779'),
('459798de-1c39-467a-aeac-d78dc63d98bb', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Screen Mesh', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.165', '2026-09-05 14:40:44.165'),
('46feaa5f-a18b-4bbe-9038-09b86df2bb33', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Batteries', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.152', '2026-09-05 14:40:44.152'),
('47537873-2347-4454-afb2-35cb6b33836c', '7148d149-3de9-4fb8-9b0b-003788657636', 'Pumps', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.356', '2026-09-05 09:35:46.356'),
('4779fbf0-9974-4da0-8222-080a778d2e6a', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Gaskets', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.777', '2026-09-02 18:03:53.777'),
('48e0e01c-aece-425d-b84d-8468efca40b3', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Cables', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.075', '2026-09-05 09:37:31.075'),
('4b2e659b-fd38-460f-a541-e6ae6b3869de', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Batteries', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.053', '2026-09-05 09:37:31.053'),
('4bf2ef0e-9371-4d74-a73b-b533514ba5fa', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Pipes', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.127', '2026-09-05 09:01:06.127'),
('4d62c2ce-d203-437b-9472-f614ca3e945e', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Socket Liner', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:35:07.187', '2026-09-05 15:35:07.187'),
('4df1f8fd-47db-40b3-88ab-cd2c06eae72f', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Valves', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.173', '2026-09-05 14:40:44.173'),
('4e724f94-fe9e-434d-b082-955d2c09f9b8', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Bearings', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.113', '2026-09-05 09:01:06.113'),
('4f66f047-96ba-4a4d-bf92-32ed1cb8f4fc', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Seals', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.165', '2026-09-05 14:40:44.165'),
('5047a3a2-7793-4c65-b1ae-f5efeec943bf', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Miscellaneous', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.127', '2026-09-05 09:01:06.127'),
('50640055-2434-4448-8ec8-93a9e3c93b84', '7148d149-3de9-4fb8-9b0b-003788657636', 'Pipes', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.356', '2026-09-05 09:35:46.356'),
('52032c1f-9819-4396-9b2e-9e49af65ecfe', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Screen Mesh', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.102', '2026-09-05 09:37:31.102'),
('528e3337-9ab8-4971-8e13-83c1ce62bc90', '7148d149-3de9-4fb8-9b0b-003788657636', 'Cheek Plates (Side Liners)', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:33:18.676', '2026-09-05 15:33:18.676'),
('546660dd-8f16-4ee4-9b0f-d8be290472af', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Sensors', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.130', '2026-09-05 09:01:06.130'),
('54d16f36-a347-417e-9e7f-0680bb490e08', '7148d149-3de9-4fb8-9b0b-003788657636', 'Sensors', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.358', '2026-09-05 09:35:46.358'),
('55774fe0-e8db-4906-ac7c-1d6e98ae79ee', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Socket Liner', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:35:07.188', '2026-09-05 15:35:07.188'),
('56b3b800-0253-4188-b9ef-19b2b2a03796', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Blow Bars', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.772', '2026-09-02 18:03:53.772'),
('56c46dbb-5718-4b98-a023-32e544fc6a63', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Flywheels', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:34:00.982', '2026-09-05 15:34:00.982'),
('57294908-4a6a-47ea-a59f-c95338dbb782', '7148d149-3de9-4fb8-9b0b-003788657636', 'Torch Ring & Locking Bolt', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:36:23.481', '2026-09-05 15:36:23.481'),
('58290c5c-f54f-49ec-a864-fdf8e76f30c8', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Welding Materials', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.175', '2026-09-05 14:40:44.175'),
('59419adf-5d5f-48de-90ce-7149bd9d47ed', '7148d149-3de9-4fb8-9b0b-003788657636', 'Seals', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.357', '2026-09-05 09:35:46.357'),
('59d74df2-8ebe-41b9-8a08-8f3e4f6a092f', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Impact idlers', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:39:39.274', '2026-09-05 15:39:39.274'),
('5a34527a-1742-4dd0-bc22-d4cfe19bb5b6', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Eccentric Shaft & Bearings', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:33:47.758', '2026-09-05 15:33:47.758'),
('5b6bfe46-1078-407d-89f4-a8ff7c854c3e', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Jaw Plates', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.125', '2026-09-05 09:01:06.125'),
('5c12f90d-eb45-43d9-857f-bf0d30931b1d', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Filters', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.097', '2026-09-05 09:37:31.097'),
('5cba6863-42c2-43e5-a10a-3de06fc76a2e', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Wear Plates', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.107', '2026-09-05 09:37:31.107'),
('5cc2b4e7-0d45-41ca-81c2-c7b68a9b992d', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Couplings', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.120', '2026-09-05 09:01:06.120'),
('5e28c413-a378-4cea-8511-12cf0c2f4221', '7148d149-3de9-4fb8-9b0b-003788657636', 'Welding Materials', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.359', '2026-09-05 09:35:46.359'),
('5e59714a-2abe-4bef-9358-b7168b42389d', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Filters', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.777', '2026-09-02 18:03:53.777'),
('5e8fc0f9-0b4d-49c3-95e7-1e9a411b7a4c', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Pinion Gear & Bevel Gear', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:36:44.495', '2026-09-05 15:36:44.495'),
('5ef411df-ad76-4a28-a57f-79de22a663db', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Drive pulleys', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:40:20.524', '2026-09-05 15:40:20.524'),
('5f41935c-c021-4f98-bda6-8232f5f18183', '7148d149-3de9-4fb8-9b0b-003788657636', 'Clamp Bars & Tension Bolts', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:38:00.652', '2026-09-05 15:38:00.652'),
('60abfd0a-fd66-4b4f-a11e-55f742ae7f1d', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Pumps', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.101', '2026-09-05 09:37:31.101'),
('60af42a3-689d-4c05-89f4-a37c3f25aaa7', '7148d149-3de9-4fb8-9b0b-003788657636', 'Jaw Plates', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.354', '2026-09-05 09:35:46.354'),
('60b7716c-3d72-49fe-bf36-75e77039fbd4', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Flywheels', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:34:00.982', '2026-09-05 15:34:00.982'),
('61148466-16a2-459b-8b29-603706071d9e', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Fasteners', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.123', '2026-09-05 09:01:06.123'),
('61ea1edb-ae7e-4fda-98c0-81518c50ce2b', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Mantle', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:34:16.127', '2026-09-05 15:34:16.127'),
('6340d0d8-c268-43b1-bd62-64bc1b32dd97', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Conveyor Belts', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:38:29.826', '2026-09-05 15:38:29.826'),
('6386d38e-fd12-4c88-ba47-fa551b9c8816', '7148d149-3de9-4fb8-9b0b-003788657636', 'Crusher Parts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.341', '2026-09-05 09:35:46.341'),
('64354367-fd28-42b2-94b3-000dc00d9b6c', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Crusher Parts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.122', '2026-09-05 09:01:06.122'),
('66559d7f-f824-44ea-884e-c86166af8434', '7148d149-3de9-4fb8-9b0b-003788657636', 'Fasteners', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.352', '2026-09-05 09:35:46.352'),
('67425eb6-70f8-42b5-9729-dd8c2fe8792a', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Spray Nozzles', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:38:14.170', '2026-09-05 15:38:14.170'),
('69b4366b-8cda-4253-bbad-833ee8d90376', '7148d149-3de9-4fb8-9b0b-003788657636', 'Gaskets', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.353', '2026-09-05 09:35:46.353'),
('6a4ff82d-01df-4206-8fd5-3152881e5b43', '7148d149-3de9-4fb8-9b0b-003788657636', 'Carrying rollers', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:39:07.127', '2026-09-05 15:39:07.127'),
('6a7fad36-5112-4c9f-97b6-2e8ea17b4224', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Eccentric Shaft & Bearings', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:33:47.758', '2026-09-05 15:33:47.758'),
('6c6220fe-65fb-45c2-92b1-d4842eeb5806', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Vibrating Springs', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:37:26.924', '2026-09-05 15:37:26.924'),
('6dcf1c0e-8d88-4361-a8cd-01a8c61782f5', '7148d149-3de9-4fb8-9b0b-003788657636', 'Frame Liners', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:35:49.922', '2026-09-05 15:35:49.922'),
('6eb9e9db-0a40-4e04-9bf8-d6ec99d95f19', '7148d149-3de9-4fb8-9b0b-003788657636', 'Switches', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.358', '2026-09-05 09:35:46.358'),
('702e7192-2eb8-46a9-a41f-c0f7a919e022', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Jaw Plates', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.778', '2026-09-02 18:03:53.778'),
('71956407-d491-4add-aa3a-2c0e80adbb18', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Wear Plates', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.806', '2026-09-02 18:03:53.806'),
('7214f568-1cc5-4e62-bc5d-6ba4c57af61b', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Toggle Seat', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:33:02.603', '2026-09-05 15:33:02.603'),
('73e476c6-e800-48a4-a4da-af1fe5478d6b', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Welding Materials', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.107', '2026-09-05 09:37:31.107'),
('747a4790-0475-429f-8f67-5dd1b8050ea7', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Pinion Gear & Bevel Gear', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:36:44.492', '2026-09-05 15:36:44.492'),
('7514b190-5969-4719-8136-0aad09bf6095', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Gaskets', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.097', '2026-09-05 09:37:31.097'),
('7632dd8b-df5d-47cf-8a9d-bda77fcacd8f', '7148d149-3de9-4fb8-9b0b-003788657636', 'Valves', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.359', '2026-09-05 09:35:46.359'),
('7664f49f-231a-400d-a80c-2a0bf743d840', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Gaskets', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.159', '2026-09-05 14:40:44.159'),
('77b38d3f-84c8-433b-9189-56ec2d0f2b5c', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Cheek Plates (Side Liners)', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:33:18.675', '2026-09-05 15:33:18.675'),
('7d260609-e786-4805-930e-2b7fda440c17', '7148d149-3de9-4fb8-9b0b-003788657636', 'Conveyor Parts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.341', '2026-09-05 09:35:46.341'),
('7d41f5e8-67b1-4b4a-ba9e-c1572ce56f1d', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Sensors', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.792', '2026-09-02 18:03:53.792'),
('7d534b26-a2cb-468f-a82a-d47a4d1bafcb', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Safety Items', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.164', '2026-09-05 14:40:44.164'),
('7f2f1701-6538-4121-b226-bc85199e28e9', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Engine Parts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.096', '2026-09-05 09:37:31.096'),
('7f810993-b73d-4c65-a76c-9e67f90a59f5', '7148d149-3de9-4fb8-9b0b-003788657636', 'Lights', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.355', '2026-09-05 09:35:46.355'),
('805b2381-79f8-45b8-97ad-dcd5108e9044', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Cutting Tools', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.775', '2026-09-02 18:03:53.775'),
('8090f108-4700-4979-98c0-1281e5b93141', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Socket Liner', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:35:07.187', '2026-09-05 15:35:07.187'),
('83e6334c-0eb0-4968-bbd2-acbfd894ba7a', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Belts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.062', '2026-09-05 09:37:31.062'),
('84fa1932-a7b8-41d0-ac88-4d1cd7455240', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Mantle', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:34:16.127', '2026-09-05 15:34:16.127'),
('85cfb04e-b933-43c1-8bfd-58bd9e31af1f', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Clamp Bars & Tension Bolts', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:38:00.650', '2026-09-05 15:38:00.650'),
('88bdedf4-e3ef-4081-aca8-25a11dc1ac46', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Electrical Parts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.096', '2026-09-05 09:37:31.096'),
('89b9e843-df29-4999-aca2-94c8c7698682', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Sensors', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.103', '2026-09-05 09:37:31.103'),
('8a4f5b7a-d592-4ab4-b4c0-2480711e0c18', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Gearbox Parts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.777', '2026-09-02 18:03:53.777'),
('8aa5fd1e-9614-4661-8753-5659217e77d5', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Conveyor Parts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.094', '2026-09-05 09:37:31.094'),
('8b3f70b6-4211-402f-9587-fae93896cb99', '7148d149-3de9-4fb8-9b0b-003788657636', 'Eccentric Shaft & Bearings', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:33:47.759', '2026-09-05 15:33:47.759'),
('8b65a127-b202-466e-841e-f1e2c92c9a6c', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Bowl Liner (Concave)', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:34:33.165', '2026-09-05 15:34:33.165'),
('8bceceb3-f251-4026-a1bc-6496620a910e', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Eccentric Bushing', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:34:56.545', '2026-09-05 15:34:56.545'),
('8cd7a4d0-fd82-4188-a850-5b833cbafa02', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Conveyor Belts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:38:29.827', '2026-09-05 15:38:29.827'),
('90c07412-95d1-4a5a-bc16-69c34418f6dd', '7148d149-3de9-4fb8-9b0b-003788657636', 'Couplings', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.341', '2026-09-05 09:35:46.341'),
('90cd724b-7116-4dd5-92d1-9c54c8c0ae04', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Crusher Parts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.774', '2026-09-02 18:03:53.774'),
('913aec03-2a85-4071-ae2d-bec848f8c8fb', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Mantle', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:34:16.127', '2026-09-05 15:34:16.127'),
('92ab6005-6ead-4b9e-86a9-a86c1243d932', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Gearbox Parts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.159', '2026-09-05 14:40:44.159'),
('92fa0eaa-bcbe-49a4-860f-9f99aa17fb59', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Pitman', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:33:31.400', '2026-09-05 15:33:31.400'),
('9355e4a2-875a-4a6d-8d1e-0e481a61cede', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Cheek Plates (Side Liners)', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:33:18.675', '2026-09-05 15:33:18.675'),
('942ab9dc-45dc-4f27-9558-200bc9262fe2', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Wear Plates', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.132', '2026-09-05 09:01:06.132'),
('94727061-79bc-439f-9834-f04a8dcfbe36', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Vibrating Springs', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:37:26.924', '2026-09-05 15:37:26.924'),
('95778396-9289-4bd1-9a17-5f8122175d76', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Engine Parts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.123', '2026-09-05 09:01:06.123'),
('9ae510bc-598e-4dd7-8453-1599efa6d41f', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Cutting Tools', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.157', '2026-09-05 14:40:44.157'),
('9b229d6b-e887-40ee-9515-c3e99ff3f6c8', '7148d149-3de9-4fb8-9b0b-003788657636', 'Flywheels', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:34:00.983', '2026-09-05 15:34:00.983'),
('9c28ddd2-e51d-4306-94ae-9b1872f891e6', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Gearbox Parts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.098', '2026-09-05 09:37:31.098'),
('9ca2a44c-5b56-4841-a673-a4d495a2352f', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Hoses', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.098', '2026-09-05 09:37:31.098'),
('9f22a547-1f50-43ac-8db9-8ffc47bd5f4d', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Cables', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.773', '2026-09-02 18:03:53.773'),
('9fc42f28-8bec-4d8b-a844-3847c2015015', '7148d149-3de9-4fb8-9b0b-003788657636', 'Hoses', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.353', '2026-09-05 09:35:46.353'),
('a6a66663-dc25-489a-ae98-048c32ac4fd7', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Cables', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.114', '2026-09-05 09:01:06.114'),
('a6f90ffc-2ed0-423c-add0-6e0e4b5ebda5', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Belts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.153', '2026-09-05 14:40:44.153'),
('a7c34122-81b1-4419-85da-e12a62c20d81', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Eccentric Bushing', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:34:56.545', '2026-09-05 15:34:56.545'),
('a81542fe-4241-4356-b6ae-c3511e0c1ec2', '7148d149-3de9-4fb8-9b0b-003788657636', 'Toggle Plate', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:32:44.089', '2026-09-05 15:32:44.089'),
('ab6cb839-47ac-4f7e-8011-ac8e206cae8f', '7148d149-3de9-4fb8-9b0b-003788657636', 'Lubricants', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.355', '2026-09-05 09:35:46.355'),
('ab7b1302-922c-4f23-9ea1-b79b77da117d', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Safety Items', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.128', '2026-09-05 09:01:06.128'),
('ab860661-51b1-4c35-a315-b14975a2c7ce', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Toggle Plate', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:32:44.078', '2026-09-05 15:32:44.078'),
('aca289de-2621-49c7-bd2d-2480d0b22f55', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Return rollers', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:39:20.931', '2026-09-05 15:39:20.931'),
('aded7c24-37b9-4b16-b113-6096edb371b3', '7148d149-3de9-4fb8-9b0b-003788657636', 'Eccentric Shaft & Vibrator Unit', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:37:46.330', '2026-09-05 15:37:46.330'),
('ae019724-b35f-4e96-afe3-44a75e6705a2', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Jaw Plates', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.161', '2026-09-05 14:40:44.161'),
('ae9360ed-f609-4f65-bdb9-e87583a44681', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Belts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.767', '2026-09-02 18:03:53.767'),
('b155b2c0-fda0-4fd9-bb4e-630e7d76f351', '7148d149-3de9-4fb8-9b0b-003788657636', 'Miscellaneous', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.355', '2026-09-05 09:35:46.355'),
('b233962c-be20-4802-b358-ceb5031aa73b', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Bowl Liner (Concave)', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:34:33.165', '2026-09-05 15:34:33.165'),
('b2531e4f-e895-4039-abe9-7e72f7a1d2f2', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Hydraulic Parts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.778', '2026-09-02 18:03:53.778'),
('b2cc532d-1a20-423f-8079-8f01e9149056', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Cables', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.154', '2026-09-05 14:40:44.154'),
('b2e8969b-75f0-44fe-b33d-27505b01f3f2', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Bowl Liner (Concave)', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:34:33.164', '2026-09-05 15:34:33.164'),
('b382820d-92c9-4f75-855e-d4bb267a3ff9', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Cutting Tools', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.122', '2026-09-05 09:01:06.122'),
('b78412e8-8e82-4181-bb40-d100cf63b8a5', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Blow Bars', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.074', '2026-09-05 09:37:31.074'),
('bac5f7d9-0c61-42bf-a231-24528ddc1237', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Torch Ring & Locking Bolt', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:36:23.479', '2026-09-05 15:36:23.479'),
('bb0bfd0e-e3d5-4fe3-93d1-89bec89a95bd', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Conveyor Parts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.119', '2026-09-05 09:01:06.119'),
('bf1c5fed-c1b6-4dd3-b44c-d29f09211a1f', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Seals', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.785', '2026-09-02 18:03:53.785'),
('c0486d94-8e41-4070-b75f-f6b74fd129a8', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Impact idlers', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:39:39.273', '2026-09-05 15:39:39.273'),
('c1a59487-7015-4ce8-87ae-4549c738df93', '7148d149-3de9-4fb8-9b0b-003788657636', 'Return rollers', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:39:20.931', '2026-09-05 15:39:20.931'),
('c2916f19-92d3-4349-8982-8b418fe9079a', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Lights', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.099', '2026-09-05 09:37:31.099'),
('c2a68a7f-df37-4804-924e-0364d9470b28', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Hydraulic Parts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.125', '2026-09-05 09:01:06.125'),
('c2fe20bf-919a-4f0e-b7d8-4d873f42eed7', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Return rollers', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:39:20.930', '2026-09-05 15:39:20.930'),
('c6c1f79a-0197-4432-ad96-a963d3b0e2fc', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Tyres', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.106', '2026-09-05 09:37:31.106'),
('c7677ee1-4107-4693-86c6-6c6f81d862da', '7148d149-3de9-4fb8-9b0b-003788657636', 'Cables', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.340', '2026-09-05 09:35:46.340'),
('ca56baea-9a89-425c-b068-f8f963b89a3e', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Pipes', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.100', '2026-09-05 09:37:31.100'),
('caed8706-ec04-43cc-95d3-b9d5fadade90', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Screen Mesh', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.129', '2026-09-05 09:01:06.129'),
('cba2a6c4-353b-45b0-9f97-8a70f7e4319c', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Bearings', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.056', '2026-09-05 09:37:31.056'),
('cdd2df16-37e0-486b-af7b-ecab3c14258d', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Spray Nozzles', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:38:14.171', '2026-09-05 15:38:14.171'),
('ce2a8460-9626-4440-b36a-a8a7ccf640c4', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Bearings', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.766', '2026-09-02 18:03:53.766'),
('ce67df16-c54f-4326-8132-efed225e5e9d', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Couplings', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.774', '2026-09-02 18:03:53.774'),
('cf0077ae-21e5-4399-b5c0-d701a01cad97', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Lubricants', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.126', '2026-09-05 09:01:06.126'),
('d03e564b-fa7c-47b5-a1a5-48e570fc4103', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Hydraulic Parts', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.099', '2026-09-05 09:37:31.099'),
('d0b0b898-672c-40af-9462-2f44275bbfe4', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Flywheels', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:34:00.982', '2026-09-05 15:34:00.982'),
('d0eeed38-f8da-4cc8-8deb-fedee42c0107', '7148d149-3de9-4fb8-9b0b-003788657636', 'Blow Bars', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.340', '2026-09-05 09:35:46.340'),
('d1601ba2-2983-4e9c-8345-783586c49464', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Gearbox Parts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.124', '2026-09-05 09:01:06.124'),
('d33b9299-dc1d-4acc-b7ca-d96e5719ada9', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Frame Liners', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:35:49.921', '2026-09-05 15:35:49.921'),
('d44ab694-87d2-4846-b5e4-88d4ac212118', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Lubricants', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.100', '2026-09-05 09:37:31.100'),
('d469f226-ff23-4443-85e3-389b3ea1fc59', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Screen Mesh', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.783', '2026-09-02 18:03:53.783'),
('d4d6ccad-0fad-4bb6-9140-f27f70f9822c', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Screen Media/Mesh', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:37:13.666', '2026-09-05 15:37:13.666'),
('d50b4c87-5d99-4523-9661-a9360444be6e', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Switches', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.131', '2026-09-05 09:01:06.131'),
('d511fc1f-c3b8-420f-bdfe-19dc1a33562f', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Conveyor Belts', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:38:29.826', '2026-09-05 15:38:29.826'),
('d5921dfd-f9b1-47ca-bc52-63353bb37284', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Hoses', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.125', '2026-09-05 09:01:06.125'),
('d5b27549-f617-4161-a1d3-13d548e6b1bb', '7148d149-3de9-4fb8-9b0b-003788657636', 'Mantle', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:34:16.128', '2026-09-05 15:34:16.128'),
('d64ca375-617e-495a-93b9-6ce12468c99d', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Filters', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.159', '2026-09-05 14:40:44.159'),
('d802b2e2-7d0f-4111-b17d-f1054974c934', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Tyres', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.131', '2026-09-05 09:01:06.131'),
('d978c544-89a3-4426-b6da-c240fa8d523f', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Carrying rollers', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:39:07.117', '2026-09-05 15:39:07.117'),
('d9eaea31-4a47-4405-ae4b-2ffc43bd509e', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Carrying rollers', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:39:07.121', '2026-09-05 15:39:07.121'),
('da70068f-2312-415e-b609-9a26ea950ab9', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Brake Parts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.773', '2026-09-02 18:03:53.773'),
('daf1f3bb-a94f-49ef-96e8-7288731cb0ff', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Seals', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.103', '2026-09-05 09:37:31.103'),
('db5b5fdb-1b6f-42ab-b471-37f107e0870e', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Belts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.113', '2026-09-05 09:01:06.113'),
('dbc94236-04da-468f-9e48-1fdf44bce325', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Pinion Gear & Bevel Gear', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:36:44.490', '2026-09-05 15:36:44.490'),
('ddc5386a-dce5-40d4-8e07-5004ebec99bf', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Lubricants', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.162', '2026-09-05 14:40:44.162'),
('de71893c-a14b-4255-9952-3f5b58abe5b6', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Hydraulic Parts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.160', '2026-09-05 14:40:44.160'),
('de8b82f4-a513-4a65-b5b1-22fda7a5bfae', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Electrical Parts', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.123', '2026-09-05 09:01:06.123'),
('dff9ed69-fbf8-49d8-ab6d-1e77da55f753', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Impact idlers', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:39:39.274', '2026-09-05 15:39:39.274'),
('e3feab9f-55af-44ca-90f3-f5241a2800ac', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Tyres', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.166', '2026-09-05 14:40:44.166'),
('e5b11d47-c1fc-43de-8782-b48d31af37da', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Lights', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.161', '2026-09-05 14:40:44.161'),
('e6482113-c718-4ed6-b939-5b2f715f1fb5', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Welding Materials', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.806', '2026-09-02 18:03:53.806'),
('e7678cbb-368e-4735-8ba1-6d7564ed1104', '7148d149-3de9-4fb8-9b0b-003788657636', 'Engine Parts', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.351', '2026-09-05 09:35:46.351'),
('e77e74c2-cf52-4543-b07a-09b39851019f', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Pitman', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:33:31.397', '2026-09-05 15:33:31.397'),
('e8c2ccc8-df74-4454-9872-f0eac3f6aefb', '7148d149-3de9-4fb8-9b0b-003788657636', 'Pinion Gear & Bevel Gear', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:36:44.496', '2026-09-05 15:36:44.496'),
('e8edff2f-2105-494b-ab09-bd37570db968', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Eccentric Shaft & Vibrator Unit', 1, 'cmtnvvliw002cug6oq1fmj7tr', '2026-09-05 15:37:46.329', '2026-09-05 15:37:46.329'),
('ed9e432d-1303-4dd6-a92c-de49ad85887f', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Fasteners', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.776', '2026-09-02 18:03:53.776'),
('edc52bbc-b83a-453a-b5dc-9e67c2d55ebb', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Crusher Parts', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.156', '2026-09-05 14:40:44.156'),
('eddc9406-0ff4-465f-af47-14f8a4f0618c', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Blow Bars', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.153', '2026-09-05 14:40:44.153'),
('ee056da9-c5be-4c21-b0e3-a86249270b65', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Drive pulleys', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:40:20.519', '2026-09-05 15:40:20.519'),
('ee975398-2477-40e4-852e-43aef12f9776', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Pumps', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.782', '2026-09-02 18:03:53.782'),
('eeadc7fb-192f-4f5d-93df-b11aad31558b', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Miscellaneous', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.100', '2026-09-05 09:37:31.100'),
('ef04bbe7-bbb8-4f19-94d8-b08a902303e0', '7148d149-3de9-4fb8-9b0b-003788657636', 'Batteries', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.338', '2026-09-05 09:35:46.338'),
('efaa0e6d-5aa1-48a3-8501-68c54870fbc1', '7148d149-3de9-4fb8-9b0b-003788657636', 'Impact idlers', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:39:39.274', '2026-09-05 15:39:39.274'),
('efb22bd5-488d-42ff-a5ff-42e37fd663b7', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Sensors', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.165', '2026-09-05 14:40:44.165'),
('f208cf3d-3438-4eaa-a6f7-3e9257041136', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Main Shaft', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:35:36.466', '2026-09-05 15:35:36.466'),
('f21cff24-45c8-4c54-be70-ab2241cf674c', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Engine Parts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.776', '2026-09-02 18:03:53.776'),
('f222abee-18aa-4c75-92d9-8ec826169675', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Toggle Plate', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:32:44.079', '2026-09-05 15:32:44.079'),
('f2344b0a-29a2-4fdd-9bfc-10117362fccf', '7148d149-3de9-4fb8-9b0b-003788657636', 'Bowl Liner (Concave)', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:34:33.165', '2026-09-05 15:34:33.165'),
('f246b759-da37-405b-a61e-eeffaca7c518', '7148d149-3de9-4fb8-9b0b-003788657636', 'Conveyor Belts', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:38:29.827', '2026-09-05 15:38:29.827'),
('f31e03be-588e-4df4-8930-a307109fab18', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Switches', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.166', '2026-09-05 14:40:44.166'),
('f40f178f-d286-4482-bca9-b58631c7a43f', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Valves', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 09:37:31.106', '2026-09-05 09:37:31.106'),
('f51a021f-4d42-4acc-9e40-b92f753b6c71', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Safety Items', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.783', '2026-09-02 18:03:53.783'),
('f663af6f-02ca-45cb-af27-4ba49da4a1d9', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'Seals', 1, '8bae8fd6-1697-4dda-899e-12584ce09ec0', '2026-09-05 09:01:06.130', '2026-09-05 09:01:06.130'),
('f66960a6-70b5-4bda-857a-a82459ec7a14', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Conveyor Parts', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.774', '2026-09-02 18:03:53.774'),
('f68e005b-68fd-448a-ad12-826d8d682c75', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Eccentric Shaft & Vibrator Unit', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 15:37:46.330', '2026-09-05 15:37:46.330'),
('f89ee12a-8cb4-41b7-bba1-7bdd269a890c', 'a0271c37-aaf9-474c-b010-62ae96686777', 'Pipes', 1, 'a0271c37-aaf9-474c-b010-62ae96686888', '2026-09-05 14:40:44.162', '2026-09-05 14:40:44.162'),
('fa4c8090-a598-4de0-afbc-89b88215fc64', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Batteries', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 18:03:53.763', '2026-09-02 18:03:53.763'),
('faa9b22c-809b-426b-9ca5-b02771f3539d', '7148d149-3de9-4fb8-9b0b-003788657636', 'Safety Items', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.357', '2026-09-05 09:35:46.357'),
('fafb7042-bd95-41e7-b8ab-2ec0cab81040', '7148d149-3de9-4fb8-9b0b-003788657636', 'Bearings', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.339', '2026-09-05 09:35:46.339'),
('fb24096b-9b8d-4d7b-99b2-c27652ea2189', '7148d149-3de9-4fb8-9b0b-003788657636', 'Screen Mesh', 1, 'd4b5442c-b7ac-4579-9a8d-a48be5140527', '2026-09-05 09:35:46.357', '2026-09-05 09:35:46.357'),
('fd09d877-1173-42dc-a6b7-6f8b98d9e564', '7148d149-3de9-4fb8-9b0b-003788657636', 'Vibrating Springs', 1, 'cmtoelok4003tug6oovhht7s0', '2026-09-05 15:37:26.924', '2026-09-05 15:37:26.924'),
('fea7ab9c-85df-48a6-90fe-6c2b3781cafd', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Toggle Seat', 1, 'cmtod0uog003fug6oq084dh3j', '2026-09-05 15:33:02.600', '2026-09-05 15:33:02.600');

-- --------------------------------------------------------

--
-- Table structure for table `Purchase`
--

CREATE TABLE `Purchase` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `supplierId` varchar(191) DEFAULT NULL,
  `serialNo` varchar(191) NOT NULL,
  `purchaseDate` date NOT NULL,
  `partyName` varchar(191) NOT NULL,
  `contactNo` varchar(191) NOT NULL,
  `panNo` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `particular` varchar(191) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `billNo` varchar(191) NOT NULL,
  `billFilePath` varchar(191) NOT NULL,
  `paymentMethod` enum('CREDIT','CHEQUE','CASH_IN_COUNTER') NOT NULL,
  `paymentDate` date DEFAULT NULL,
  `paymentAmount` decimal(10,2) DEFAULT NULL,
  `voucherPath` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','REVIEWED') NOT NULL DEFAULT 'PENDING',
  `reviewedById` varchar(30) DEFAULT NULL,
  `reviewedAt` datetime(3) DEFAULT NULL,
  `reviewNote` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Purchase`
--

INSERT INTO `Purchase` (`id`, `orgId`, `createdById`, `supplierId`, `serialNo`, `purchaseDate`, `partyName`, `contactNo`, `panNo`, `address`, `particular`, `amount`, `billNo`, `billFilePath`, `paymentMethod`, `paymentDate`, `paymentAmount`, `voucherPath`, `status`, `reviewedById`, `reviewedAt`, `reviewNote`, `createdAt`, `updatedAt`) VALUES
('cmtkc5htq000hug6os9nrjb0s', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'cmtkc2yum000gug6oe9euorup', 'PUR-001', '2026-09-02', 'tarkari pasal', '123', '2131', 'kathmandu', 'aloo and other', 2500.00, '100', '/uploads/purchase/1788368033125-634f4bae-c1e0-46e5-b4a2-b8c4b9617704.pdf', 'CHEQUE', '2026-09-03', 1000.00, '/uploads/purchase/1788368033126-5572bcaa-7fec-4dda-b88a-fdfa879fe34f.pdf', 'PENDING', NULL, NULL, NULL, '2026-09-02 16:53:53.150', '2026-09-02 16:53:53.150');

-- --------------------------------------------------------

--
-- Table structure for table `PurchaseSupplier`
--

CREATE TABLE `PurchaseSupplier` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `contactNo` varchar(191) DEFAULT NULL,
  `panNo` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `PurchaseSupplier`
--

INSERT INTO `PurchaseSupplier` (`id`, `orgId`, `name`, `contactNo`, `panNo`, `address`, `notes`, `isActive`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkc2yum000gug6oe9euorup', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'tarkari pasal', '123', '2131', 'kathmandu', 'contact person name .....ram', 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:51:55.247', '2026-09-02 16:51:55.247');

-- --------------------------------------------------------

--
-- Table structure for table `PurchaseSupplierPayment`
--

CREATE TABLE `PurchaseSupplierPayment` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `purchaseId` varchar(191) DEFAULT NULL,
  `paymentDate` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paymentMethod` enum('CREDIT','CHEQUE','CASH_IN_COUNTER') NOT NULL DEFAULT 'CASH_IN_COUNTER',
  `voucherPath` text DEFAULT NULL,
  `billPaths` text DEFAULT NULL,
  `voucherPaths` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `PurchaseSupplierPayment`
--

INSERT INTO `PurchaseSupplierPayment` (`id`, `orgId`, `supplierId`, `purchaseId`, `paymentDate`, `amount`, `paymentMethod`, `voucherPath`, `billPaths`, `voucherPaths`, `notes`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkc5hty000iug6otrwk7h0w', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkc2yum000gug6oe9euorup', 'cmtkc5htq000hug6os9nrjb0s', '2026-09-03', 1000.00, 'CHEQUE', '/uploads/purchase/1788368033126-5572bcaa-7fec-4dda-b88a-fdfa879fe34f.pdf', '[\"/uploads/purchase/1788368033125-634f4bae-c1e0-46e5-b4a2-b8c4b9617704.pdf\"]', '[\"/uploads/purchase/1788368033126-5572bcaa-7fec-4dda-b88a-fdfa879fe34f.pdf\"]', 'baki pachi', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:53:53.158', '2026-09-02 16:53:53.158'),
('cmtkc6fnf000jug6ochuak7xx', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkc2yum000gug6oe9euorup', 'cmtkc5htq000hug6os9nrjb0s', '2026-09-02', 1000.00, 'CASH_IN_COUNTER', NULL, NULL, '[\"/uploads/purchase/1788368076975-b8429ec2-7012-4c4c-8df2-986f189604e4.pdf\"]', 'baki 500', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:54:36.987', '2026-09-02 16:54:36.987');

-- --------------------------------------------------------

--
-- Table structure for table `RawMaterial`
--

CREATE TABLE `RawMaterial` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RawMaterial`
--

INSERT INTO `RawMaterial` (`id`, `orgId`, `name`, `description`, `isActive`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkbt4nd0008ug6oe0kc3ekr', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'river bed gravel', NULL, 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:44:16.201', '2026-09-02 16:44:16.201'),
('cmtkbudrf0009ug6oye6270bw', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'sand', NULL, 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:45:14.667', '2026-09-02 16:45:14.667'),
('cmtkbujkj000aug6oibrhk8rt', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'roda', NULL, 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:45:22.195', '2026-09-02 16:45:22.195'),
('cmtodrjow003jug6omcz6klk5', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Riverbed Materials', 'Collection and Mixture of Boulders, Cobbles, Gravel and Sand.', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 12:50:06.320', '2026-09-05 12:50:06.320'),
('cmtoe3ewf003kug6o4cqj4f74', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Sand', 'Mixture of Natural River sand and M-sand', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 12:59:19.983', '2026-09-05 12:59:19.983'),
('cmtoecf8a003lug6o7fgcqfvh', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Aggregate 20', 'Cone crushed aggregate of size 10 to 20 mm stone', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 13:06:20.314', '2026-09-05 13:06:20.314'),
('cmtoed3ck003mug6oni17r9e9', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Aggregate 25', 'Cone crushed aggregate of size 10 to 25 mm stone', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 13:06:51.572', '2026-09-05 13:06:51.572'),
('cmtoeehv5003pug6oon9r7pok', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Aggregate 30', 'Cone crushed aggregate of size 20 to 30 mm stone', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 13:07:57.041', '2026-09-05 13:07:57.041'),
('cmtoepfec003wug6o2owdx7pb', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Base', 'Crushed stone mix (usually 0 to 40 mm in size) that forms a rock-solid foundation.', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 13:16:27.060', '2026-09-05 13:16:27.060'),
('cmtoeqnng003xug6ox9h9bssw', 'd577b71d-5580-43b1-8443-8c7133747b55', 'Sub-Base', 'Crushed stone mix (usually 0 to 60 mm in size) that forms a rock-solid foundation.', 1, 'f1125955-aa71-4d63-a94f-be26a9a49ca1', '2026-09-05 13:17:24.412', '2026-09-05 13:17:24.412');

-- --------------------------------------------------------

--
-- Table structure for table `RawMaterialTrip`
--

CREATE TABLE `RawMaterialTrip` (
  `id` varchar(191) NOT NULL,
  `tripRecordId` varchar(191) NOT NULL,
  `hour` int(11) NOT NULL,
  `tripCount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RawMaterialTrip`
--

INSERT INTO `RawMaterialTrip` (`id`, `tripRecordId`, `hour`, `tripCount`) VALUES
('cmtkcx2au0010ug6obs7722w0', 'cmtkc6x3a000kug6op2be68ai', 2, 8),
('cmtky5a7c001hug6o7xelzwjb', 'cmtky1ajo0014ug6ovoy2blb4', 12, 9);

-- --------------------------------------------------------

--
-- Table structure for table `RefreshToken`
--

CREATE TABLE `RefreshToken` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `tokenHash` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RefreshToken`
--

INSERT INTO `RefreshToken` (`id`, `userId`, `tokenHash`, `expiresAt`, `revokedAt`, `createdAt`, `updatedAt`) VALUES
('14ec57ed-8c9e-4e87-a325-020c15f7858a', '4f5467dd-a9b8-4cac-b825-3255e4485adf', '3b236840508b7275607f6486b112085fdc16a3f1e454d187b9f6117905a34555', '2026-09-05 13:40:36.000', NULL, '2026-09-05 13:10:36.901', '2026-09-05 13:10:36.901'),
('173e0e1c-8aaf-466f-88f3-0ea5dbba2895', 'a0271c37-aaf9-474c-b010-62ae96686559', 'd8448457d7ec50e73100a7c19e0866e7f7b0b6269440d87f891b2b4ce24830f6', '2026-09-03 09:36:41.000', NULL, '2026-09-03 09:06:41.416', '2026-09-03 09:06:41.416'),
('3cc1658c-809c-4b91-a38c-f9d1c25ce771', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', '23bf95fade991a28aac76169a2bf23f079df87b95caa532ae6d9b58e6a62244f', '2026-09-05 09:11:22.000', NULL, '2026-09-05 08:41:22.435', '2026-09-05 08:41:22.435'),
('5c908f11-d910-4d05-8a6c-acd1f2bb7e87', 'a0271c37-aaf9-474c-b010-62ae96686559', '3865c20db1bd965daedecd21859a9d2b0e4cb54f6e4d569090a71bbb0915a7bd', '2026-09-05 08:03:55.000', '2026-09-05 07:34:35.008', '2026-09-05 07:33:55.804', '2026-09-05 07:34:35.009'),
('77e57c8b-b63f-43d2-ac42-587d6d0b6d81', 'a0271c37-aaf9-474c-b010-62ae96686559', 'c9dca5a6ba623f37cdf324fcae4901b4a79bd332e4f238b701981d45eac01aa2', '2026-09-05 08:02:33.000', '2026-09-05 07:33:28.211', '2026-09-05 07:32:33.191', '2026-09-05 07:33:28.213'),
('7d65db36-6f61-4185-9a9a-8d124d11116e', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', '868bb1ae1a8803ef3b56fce0a1721a7883d0293fa92037f978b0e95d0f961578', '2026-09-05 09:11:24.000', '2026-09-05 08:41:48.775', '2026-09-05 08:41:24.232', '2026-09-05 08:41:48.775'),
('85223a3c-83a1-4db3-89d2-401659b1c766', 'a0271c37-aaf9-474c-b010-62ae96686559', '545fd84a70043c300c562d27f0e9b61356de1098d02faf9170dab8630e215b43', '2026-09-02 16:34:07.000', NULL, '2026-09-02 16:04:07.027', '2026-09-02 16:04:07.027'),
('a1b11c0e-35fe-4184-90b8-20f3708abe71', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', 'f11aab5462ce9a5042a31e0940ae7692674d5860125fd4421226fc731b885e5e', '2026-09-05 08:07:45.000', '2026-09-05 07:38:48.658', '2026-09-05 07:37:45.654', '2026-09-05 07:38:48.658'),
('cd4d14ce-d69e-4588-b0ef-38f581c079cf', '4f5467dd-a9b8-4cac-b825-3255e4485adf', '6ef523a9a874a0fa26928aad140d3ad9c9d9769359b415ad9b8c8597a818fb93', '2026-09-05 08:06:02.000', '2026-09-05 07:37:37.071', '2026-09-05 07:36:02.824', '2026-09-05 07:37:37.072'),
('e22b0a4f-1f1d-4938-a60a-d545df55322a', 'a0271c37-aaf9-474c-b010-62ae96686559', '13980cfdc398f05b512bdfcb700ccf536c0a677dddf2a9f147d575ea98e7a070', '2026-09-02 17:02:26.000', NULL, '2026-09-02 16:32:26.651', '2026-09-02 16:32:26.651'),
('e7919dd0-e642-46c0-b5c6-a20081f77ec4', 'a0271c37-aaf9-474c-b010-62ae96686559', '0957ff49fb065ea8f05a7159105d3666475f3da1fc437d3adcdd90e19d2006d9', '2026-09-03 08:24:10.000', NULL, '2026-09-03 07:54:10.483', '2026-09-03 07:54:10.483'),
('edc436ee-5cfa-4304-b1f8-621229d981d8', 'cmtoelojn003sug6oo1rgh6yp', '7fd1627dcce218930148976c861eda39c71b9983d7676897df15caeab531c19a', '2026-09-05 13:44:02.000', NULL, '2026-09-05 13:14:02.184', '2026-09-05 13:14:02.184');

-- --------------------------------------------------------

--
-- Table structure for table `RegistryDefaultItem`
--

CREATE TABLE `RegistryDefaultItem` (
  `id` varchar(191) NOT NULL,
  `type` enum('STAFF_DEPARTMENT','SPARE_PART_CATEGORY') NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RegistryDefaultItem`
--

INSERT INTO `RegistryDefaultItem` (`id`, `type`, `name`, `code`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
('cmtkad7e000026okb6uafvlw4', 'STAFF_DEPARTMENT', 'Administration', 'ADMIN', 1, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e000036okbayixoxny', 'STAFF_DEPARTMENT', 'Accounts', 'ACC', 2, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e000046okbbbqhpiu1', 'STAFF_DEPARTMENT', 'Human Resources', 'HR', 3, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e000056okbdackbod0', 'STAFF_DEPARTMENT', 'Procurement', 'PROC', 4, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e000066okbm2ovzeb4', 'STAFF_DEPARTMENT', 'Store', 'STORE', 5, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e000076okb51dqhw9i', 'STAFF_DEPARTMENT', 'Workshop', 'WORK', 6, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e000086okbafyzmbek', 'STAFF_DEPARTMENT', 'Production', 'PROD', 7, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e000096okbnnk9mist', 'STAFF_DEPARTMENT', 'Sales', 'SALES', 8, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000a6okbla2ios5v', 'STAFF_DEPARTMENT', 'Management', 'MGMT', 9, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000b6okbadqgnh6k', 'SPARE_PART_CATEGORY', 'Batteries', NULL, 1, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000c6okbap1upffu', 'SPARE_PART_CATEGORY', 'Bearings', NULL, 2, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000d6okb3iyrihfu', 'SPARE_PART_CATEGORY', 'Belts', NULL, 3, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000e6okbhyoqolx0', 'SPARE_PART_CATEGORY', 'Blow Bars', NULL, 4, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000f6okbsbjyiv2r', 'SPARE_PART_CATEGORY', 'Brake Parts', NULL, 5, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000g6okb8ozn9ifb', 'SPARE_PART_CATEGORY', 'Cables', NULL, 6, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000h6okbeo6fyrte', 'SPARE_PART_CATEGORY', 'Conveyor Parts', NULL, 7, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000i6okbyglhpue0', 'SPARE_PART_CATEGORY', 'Couplings', NULL, 8, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000j6okbxejhv11m', 'SPARE_PART_CATEGORY', 'Crusher Parts', NULL, 9, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000k6okb2e9cgzk7', 'SPARE_PART_CATEGORY', 'Cutting Tools', NULL, 10, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000l6okbwwtsovbq', 'SPARE_PART_CATEGORY', 'Electrical Parts', NULL, 11, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e0000m6okbb3f8u4ax', 'SPARE_PART_CATEGORY', 'Engine Parts', NULL, 12, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000n6okbl3khhr7q', 'SPARE_PART_CATEGORY', 'Fasteners', NULL, 13, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000o6okb2e231c3q', 'SPARE_PART_CATEGORY', 'Filters', NULL, 14, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000p6okbfeaygmvt', 'SPARE_PART_CATEGORY', 'Gaskets', NULL, 15, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000q6okbut2easpp', 'SPARE_PART_CATEGORY', 'Gearbox Parts', NULL, 16, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000r6okbmtxaddd6', 'SPARE_PART_CATEGORY', 'Hoses', NULL, 17, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000s6okb42mafcel', 'SPARE_PART_CATEGORY', 'Hydraulic Parts', NULL, 18, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000t6okbqwya7k2j', 'SPARE_PART_CATEGORY', 'Jaw Plates', NULL, 19, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000u6okbnv1bmtkl', 'SPARE_PART_CATEGORY', 'Lights', NULL, 20, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000v6okbc35boj4b', 'SPARE_PART_CATEGORY', 'Lubricants', NULL, 21, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000w6okbq3sgf8c5', 'SPARE_PART_CATEGORY', 'Miscellaneous', NULL, 22, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000x6okbc2hdisn7', 'SPARE_PART_CATEGORY', 'Pipes', NULL, 23, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000y6okbffohdx2t', 'SPARE_PART_CATEGORY', 'Pumps', NULL, 24, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e1000z6okb9fbwnsnp', 'SPARE_PART_CATEGORY', 'Safety Items', NULL, 25, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100106okbll0s4h3d', 'SPARE_PART_CATEGORY', 'Screen Mesh', NULL, 26, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100116okbtpu38ugd', 'SPARE_PART_CATEGORY', 'Seals', NULL, 27, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100126okbc4pkuhu2', 'SPARE_PART_CATEGORY', 'Sensors', NULL, 28, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100136okbdk70yzm5', 'SPARE_PART_CATEGORY', 'Switches', NULL, 29, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100146okbhxprouds', 'SPARE_PART_CATEGORY', 'Tyres', NULL, 30, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100156okbtnumph8p', 'SPARE_PART_CATEGORY', 'Valves', NULL, 31, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100166okb0idppnu2', 'SPARE_PART_CATEGORY', 'Wear Plates', NULL, 32, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmtkad7e100176okbjkihgc75', 'SPARE_PART_CATEGORY', 'Welding Materials', NULL, 33, '2026-09-02 16:03:53.641', '2026-09-02 16:03:53.641'),
('cmto1ls7w001f6okbjbk13mh3', 'STAFF_DEPARTMENT', 'Plant Department', 'PLDEP', 10, '2026-09-05 07:09:42.044', '2026-09-05 07:09:42.044'),
('cmto1nhb0001g6okbno66qhsq', 'STAFF_DEPARTMENT', 'Excavator Operation', 'EXOPE', 11, '2026-09-05 07:11:01.213', '2026-09-05 07:11:01.213'),
('cmto1ope0001h6okbxl397v4d', 'STAFF_DEPARTMENT', 'Loader Operation', 'LOPE', 12, '2026-09-05 07:11:58.344', '2026-09-05 07:11:58.344'),
('cmto1psdk001i6okbtnrnk7g1', 'STAFF_DEPARTMENT', 'Truck Operation', 'TRKOP', 13, '2026-09-05 07:12:48.872', '2026-09-05 07:12:48.872'),
('cmto1qzxc001j6okbldip3tv4', 'STAFF_DEPARTMENT', 'Kitchen Department', 'KITDE', 14, '2026-09-05 07:13:45.313', '2026-09-05 07:13:45.313'),
('cmtodfhol001m6okbg8wktit9', 'STAFF_DEPARTMENT', 'Operations Department', 'OPDEP', 15, '2026-09-05 12:40:43.845', '2026-09-05 12:40:43.845'),
('cmtofad9l001n6okbwi48az2y', 'SPARE_PART_CATEGORY', 'Toggle Plate', NULL, 34, '2026-09-05 13:32:44.073', '2026-09-05 13:32:44.073'),
('cmtofarin001o6okb0zplyvrd', 'SPARE_PART_CATEGORY', 'Toggle Seat', NULL, 35, '2026-09-05 13:33:02.543', '2026-09-05 13:33:02.543'),
('cmtofb3yp001p6okbnc62wbet', 'SPARE_PART_CATEGORY', 'Cheek Plates (Side Liners)', NULL, 36, '2026-09-05 13:33:18.673', '2026-09-05 13:33:18.673'),
('cmtofbds0001q6okb1kr5b42h', 'SPARE_PART_CATEGORY', 'Pitman', NULL, 37, '2026-09-05 13:33:31.393', '2026-09-05 13:33:31.393'),
('cmtofbqeh001r6okbnesbmgi6', 'SPARE_PART_CATEGORY', 'Eccentric Shaft & Bearings', NULL, 38, '2026-09-05 13:33:47.754', '2026-09-05 13:33:47.754'),
('cmtofc0lu001s6okb9n4lbsdh', 'SPARE_PART_CATEGORY', 'Flywheels', NULL, 39, '2026-09-05 13:34:00.978', '2026-09-05 13:34:00.978'),
('cmtofcca8001t6okbbvzdnmuu', 'SPARE_PART_CATEGORY', 'Mantle', NULL, 40, '2026-09-05 13:34:16.113', '2026-09-05 13:34:16.113'),
('cmtofcpfv001u6okbiilr3kqz', 'SPARE_PART_CATEGORY', 'Bowl Liner (Concave)', NULL, 41, '2026-09-05 13:34:33.163', '2026-09-05 13:34:33.163'),
('cmtofd7hb001v6okb29bbim5c', 'SPARE_PART_CATEGORY', 'Eccentric Bushing', NULL, 42, '2026-09-05 13:34:56.543', '2026-09-05 13:34:56.543'),
('cmtofdfox001w6okb0b2osy5o', 'SPARE_PART_CATEGORY', 'Socket Liner', NULL, 43, '2026-09-05 13:35:07.185', '2026-09-05 13:35:07.185'),
('cmtofe2a6001x6okbbtv7iblt', 'SPARE_PART_CATEGORY', 'Main Shaft', NULL, 44, '2026-09-05 13:35:36.463', '2026-09-05 13:35:36.463'),
('cmtofecnv001y6okbqlfhtxh0', 'SPARE_PART_CATEGORY', 'Frame Liners', NULL, 45, '2026-09-05 13:35:49.915', '2026-09-05 13:35:49.915'),
('cmtoff2k5001z6okb2ualn7ks', 'SPARE_PART_CATEGORY', 'Torch Ring & Locking Bolt', NULL, 46, '2026-09-05 13:36:23.477', '2026-09-05 13:36:23.477'),
('cmtoffirk00206okbynskbeyn', 'SPARE_PART_CATEGORY', 'Pinion Gear & Bevel Gear', NULL, 47, '2026-09-05 13:36:44.481', '2026-09-05 13:36:44.481'),
('cmtofg5a700216okbs7zkn47x', 'SPARE_PART_CATEGORY', 'Screen Media/Mesh', NULL, 48, '2026-09-05 13:37:13.663', '2026-09-05 13:37:13.663'),
('cmtofgfie00226okb0ym11bx6', 'SPARE_PART_CATEGORY', 'Vibrating Springs', NULL, 49, '2026-09-05 13:37:26.918', '2026-09-05 13:37:26.918'),
('cmtofguhe00236okborcwi0pz', 'SPARE_PART_CATEGORY', 'Eccentric Shaft & Vibrator Unit', NULL, 50, '2026-09-05 13:37:46.323', '2026-09-05 13:37:46.323'),
('cmtofh5id00246okb89q4ii5k', 'SPARE_PART_CATEGORY', 'Clamp Bars & Tension Bolts', NULL, 51, '2026-09-05 13:38:00.613', '2026-09-05 13:38:00.613'),
('cmtofhfyv00256okbl0hc6086', 'SPARE_PART_CATEGORY', 'Spray Nozzles', NULL, 52, '2026-09-05 13:38:14.167', '2026-09-05 13:38:14.167'),
('cmtofhs1r00266okbj783il1o', 'SPARE_PART_CATEGORY', 'Conveyor Belts', NULL, 53, '2026-09-05 13:38:29.823', '2026-09-05 13:38:29.823'),
('cmtofiktn00276okb8olkj4tk', 'SPARE_PART_CATEGORY', 'Carrying rollers', NULL, 54, '2026-09-05 13:39:07.115', '2026-09-05 13:39:07.115'),
('cmtofivh100286okb0wrjpmga', 'SPARE_PART_CATEGORY', 'Return rollers', NULL, 55, '2026-09-05 13:39:20.917', '2026-09-05 13:39:20.917'),
('cmtofj9ms00296okbnqeldngd', 'SPARE_PART_CATEGORY', 'Impact idlers', NULL, 56, '2026-09-05 13:39:39.268', '2026-09-05 13:39:39.268'),
('cmtofk5gd002a6okbef4b717f', 'SPARE_PART_CATEGORY', 'Drive pulleys', NULL, 57, '2026-09-05 13:40:20.509', '2026-09-05 13:40:20.509');

-- --------------------------------------------------------

--
-- Table structure for table `RegistryDefaultSeed`
--

CREATE TABLE `RegistryDefaultSeed` (
  `id` varchar(191) NOT NULL,
  `seededAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RegistryDefaultSeed`
--

INSERT INTO `RegistryDefaultSeed` (`id`, `seededAt`) VALUES
('asset-registry-defaults-v1', '2026-09-02 16:03:53.646');

-- --------------------------------------------------------

--
-- Table structure for table `Staff`
--

CREATE TABLE `Staff` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `deptId` varchar(191) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `employeeCode` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `designation` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `licensePhotoUrl` varchar(191) DEFAULT NULL,
  `citizenshipphotoUrl` varchar(191) DEFAULT NULL,
  `profilephotoUrl` varchar(191) DEFAULT NULL,
  `familyContactName` varchar(191) DEFAULT NULL,
  `familyContactPhone` varchar(191) DEFAULT NULL,
  `familyContactRelation` varchar(191) DEFAULT NULL,
  `joinDate` date NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Staff`
--

INSERT INTO `Staff` (`id`, `orgId`, `deptId`, `createdById`, `employeeCode`, `fullName`, `designation`, `phone`, `email`, `address`, `licensePhotoUrl`, `citizenshipphotoUrl`, `profilephotoUrl`, `familyContactName`, `familyContactPhone`, `familyContactRelation`, `joinDate`, `isActive`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
('cmtkae6td00090g6oe9ubpr6b', '8a27055b-15d1-499f-ab2d-d9218c72a528', '38dffdd9-02df-424c-8a33-4c50d44cbb6f', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'EMP-001', 'Avishek', 'OPERATOR', NULL, NULL, NULL, '/uploads/staff-liscence/1788365079530-340d534a-236a-4de0-9090-6d35382f7650.png', NULL, NULL, NULL, NULL, NULL, '2026-09-02', 1, NULL, '2026-09-02 16:04:39.553', '2026-09-02 16:04:39.553'),
('cmtodkxzq003iug6ouv6je1vu', 'd577b71d-5580-43b1-8443-8c7133747b55', '494f5757-c47a-4fb8-86cf-f318ac692327', 'f1125955-aa71-4d63-a94f-be26a9a49ca1', 'EMP-001', 'Rakesh Shrestha', 'Manager', '98419220454', NULL, 'Banepa', NULL, NULL, NULL, 'Grishma Shrestha', NULL, 'Spouse', '2026-09-01', 1, NULL, '2026-09-05 12:44:58.262', '2026-09-05 12:44:58.262');

-- --------------------------------------------------------

--
-- Table structure for table `Subscription`
--

CREATE TABLE `Subscription` (
  `id` varchar(191) NOT NULL,
  `organizationId` varchar(191) NOT NULL,
  `planId` varchar(191) NOT NULL,
  `subscribedByUserId` varchar(191) NOT NULL,
  `status` enum('INCOMPLETE','ACTIVE','PAST_DUE','CANCELED','UNPAID') NOT NULL DEFAULT 'INCOMPLETE',
  `unitPrice` decimal(12,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'NPR',
  `billingInterval` enum('MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY') NOT NULL,
  `trialStartsAt` datetime(3) DEFAULT NULL,
  `trialEndsAt` datetime(3) DEFAULT NULL,
  `SubscriptionStartsAt` datetime(3) DEFAULT NULL,
  `SubscriptionEndsAt` datetime(3) DEFAULT NULL,
  `nextBillingAt` datetime(3) DEFAULT NULL,
  `autoRenew` tinyint(1) NOT NULL DEFAULT 0,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `cancellationReason` varchar(191) DEFAULT NULL,
  `provider` enum('ESEWA','KHALTI','FONEPAY','CASH','BANK_TRANSFER','OTHERS') DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Subscription`
--

INSERT INTO `Subscription` (`id`, `organizationId`, `planId`, `subscribedByUserId`, `status`, `unitPrice`, `currency`, `billingInterval`, `trialStartsAt`, `trialEndsAt`, `SubscriptionStartsAt`, `SubscriptionEndsAt`, `nextBillingAt`, `autoRenew`, `cancelledAt`, `cancellationReason`, `provider`, `createdAt`, `updatedAt`) VALUES
('0b499123-7ad6-4b4a-917b-34420225cf12', 'd577b71d-5580-43b1-8443-8c7133747b55', 'cmtl1t24z00186okbsm1c75xp', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', 'ACTIVE', 998.99, 'NPR', 'MONTHLY', NULL, NULL, '2026-09-05 00:00:00.000', '2027-09-05 00:00:00.000', '2027-09-05 00:00:00.000', 0, NULL, NULL, NULL, '2026-09-05 09:37:31.025', '2026-09-05 09:37:31.025'),
('3e80534a-dc17-4907-a16a-5640cf605971', 'f52cc1b7-0c97-42d2-8ab2-3a63e5b47924', 'cmtl1t24z00186okbsm1c75xp', 'df9b0bae-e331-421a-9347-85f2bc6396d0', 'ACTIVE', 998.99, 'NPR', 'MONTHLY', NULL, NULL, '2026-09-05 00:00:00.000', '2027-09-05 00:00:00.000', '2027-09-05 00:00:00.000', 0, NULL, NULL, NULL, '2026-09-05 09:01:06.085', '2026-09-05 09:01:06.085'),
('9f65c767-71bd-447c-9687-324e9a60d380', '7148d149-3de9-4fb8-9b0b-003788657636', 'cmtl1t24z00186okbsm1c75xp', '4f5467dd-a9b8-4cac-b825-3255e4485adf', 'ACTIVE', 998.99, 'NPR', 'MONTHLY', NULL, NULL, '2026-09-05 00:00:00.000', '2026-10-05 00:00:00.000', '2026-10-05 00:00:00.000', 0, NULL, NULL, NULL, '2026-09-05 09:35:46.322', '2026-09-05 09:35:46.322'),
('dc991d26-ed37-4d62-bc25-5750d2a660e3', 'a0271c37-aaf9-474c-b010-62ae96686777', 'cmtl1t24z00186okbsm1c75xp', 'a0271c37-aaf9-474c-b010-62ae96686666', 'ACTIVE', 998.99, 'NPR', 'MONTHLY', NULL, NULL, '2026-09-05 07:29:48.898', '2027-09-05 07:29:48.898', '2027-09-05 07:29:48.898', 0, NULL, NULL, NULL, '2026-09-05 09:29:48.910', '2026-09-05 09:29:48.910');

-- --------------------------------------------------------

--
-- Table structure for table `SubscriptionPayment`
--

CREATE TABLE `SubscriptionPayment` (
  `id` varchar(191) NOT NULL,
  `organizationId` varchar(191) NOT NULL,
  `subscriptionId` varchar(191) NOT NULL,
  `invoiceId` varchar(191) DEFAULT NULL,
  `provider` enum('ESEWA','KHALTI','FONEPAY','CASH','BANK_TRANSFER','OTHERS') NOT NULL,
  `status` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `amount` decimal(12,2) NOT NULL,
  `refundedAmount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(3) NOT NULL DEFAULT 'NPR',
  `transactionId` varchar(191) DEFAULT NULL,
  `paymentMethodLabel` varchar(191) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `refundedAt` datetime(3) DEFAULT NULL,
  `recordedByUserId` varchar(30) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SubscriptionPlan`
--

CREATE TABLE `SubscriptionPlan` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'NPR',
  `membercount` int(11) NOT NULL DEFAULT 0,
  `packagestatus` enum('BASIC','PREMIUM','ENTERPRISE','CUSTOM') NOT NULL DEFAULT 'BASIC',
  `billingInterval` enum('MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY') NOT NULL,
  `trialDays` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `SubscriptionPlan`
--

INSERT INTO `SubscriptionPlan` (`id`, `name`, `code`, `description`, `price`, `currency`, `membercount`, `packagestatus`, `billingInterval`, `trialDays`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cmtl1t24z00186okbsm1c75xp', 'Basic', 'Basic-001', 'This is Basic Package', 998.99, 'NPR', 3, 'BASIC', 'MONTHLY', 0, 1, '2026-09-03 04:52:02.964', '2026-09-03 04:52:02.964'),
('cmtnxngl5001d6okbfbq2fj98', 'Premium', 'Premium-001', 'Premium', 3000.00, 'NPR', 10, 'PREMIUM', 'MONTHLY', 0, 1, '2026-09-05 05:19:01.817', '2026-09-05 05:19:01.817'),
('cmtnxnwvy001e6okbdv99q43i', 'Enterprise', 'Enterprise-001', NULL, 4000.00, 'NPR', 50, 'ENTERPRISE', 'MONTHLY', 0, 1, '2026-09-05 05:19:22.942', '2026-09-05 05:19:22.942');

-- --------------------------------------------------------

--
-- Table structure for table `SuperLoginAttempt`
--

CREATE TABLE `SuperLoginAttempt` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `failedCount` int(11) NOT NULL DEFAULT 0,
  `lockedUntil` datetime(3) DEFAULT NULL,
  `lastAttemptAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `lastSuccessAt` datetime(3) DEFAULT NULL,
  `lastIp` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `SuperLoginAttempt`
--

INSERT INTO `SuperLoginAttempt` (`id`, `userId`, `failedCount`, `lockedUntil`, `lastAttemptAt`, `lastSuccessAt`, `lastIp`, `userAgent`, `createdAt`, `updatedAt`) VALUES
('cmto4o2hz001l6okbv2quiw4e', 'KJJHKJKHJKHJKHKH', 0, NULL, '2026-09-05 13:09:51.893', '2026-09-05 13:09:51.604', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-05 08:35:27.527', '2026-09-05 13:09:51.894');

-- --------------------------------------------------------

--
-- Table structure for table `SuperUser`
--

CREATE TABLE `SuperUser` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `secret` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `SuperUser`
--

INSERT INTO `SuperUser` (`id`, `email`, `password`, `secret`, `createdAt`, `updatedAt`) VALUES
('KJJHKJKHJKHJKHKH', 'super@gmail.com', '$2a$12$mbGH7yDfZGxeeD4Gj3wbLODUB06fAdiQpS43huckZbqd9DvvOhQZe', 'superadmin', '2026-09-02 21:47:29.000', '2026-09-02 21:47:29.000');

-- --------------------------------------------------------

--
-- Table structure for table `TripVehicle`
--

CREATE TABLE `TripVehicle` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `vehicleModel` varchar(191) NOT NULL,
  `volume` decimal(10,3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `TripVehicle`
--

INSERT INTO `TripVehicle` (`id`, `orgId`, `vehicleModel`, `volume`, `isActive`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkc9dw0000qug6ovy1atmjh', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'truck 6 wheeler', 265.000, 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:56:54.672', '2026-09-02 16:56:54.672'),
('cmtkcacz3000tug6omcx7a7zy', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'eicher', 170.000, 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:57:40.143', '2026-09-02 16:57:40.143');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `mustChangePassword` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`id`, `email`, `password`, `name`, `mustChangePassword`, `createdAt`, `updatedAt`) VALUES
('3bb3e85c-e5b8-4817-8b00-a2a546f59461', 'prabinsktm07@gmail.com', '$2a$10$dW3npzexfivPzx2B4oUR1uz7aUPgco.V1UmkE2nDK7Y8aJZPjHd9m', 'prabin shrestha', 0, '2026-09-05 09:37:31.008', '2026-09-05 10:37:03.920'),
('4f5467dd-a9b8-4cac-b825-3255e4485adf', 'avi@gmail.com', '$2a$10$zcgId4I7/YQxnuke3aw.5.n0Pn2akYMUUmAAToMTq1RkWiYuYPa1y', 'avishek', 0, '2026-09-05 09:35:46.314', '2026-09-05 09:35:46.314'),
('a0271c37-aaf9-474c-b010-62ae96686559', 'admin@gmail.com', '$2a$10$wrw3cjZKe//JxmVN/fikxuW/.XpECqp6IbX1UkxvppjUsr7kELTXu', 'Prabin', 0, '2026-09-02 18:03:53.743', '2026-09-02 18:03:53.743'),
('a0271c37-aaf9-474c-b010-62ae96686666', 'test@gamil.com', '$2a$10$vKzkhIopnTsceehOQwEbDuB7vbEcnj0.VU/xPfCgO06m9ZzDifU/2', 'Prabin Shrestha', 0, '2026-09-05 13:09:41.000', '2026-09-05 09:34:29.543'),
('cmtnvvlis002bug6obbzq5lf9', 'rj@asdf.com', '$2b$12$3DlhyZJqCSW0tDvppBvt1.jsHhhKF2BCsMjauI9hludkoiFdmYob6', 'rajesh shrestha', 1, '2026-09-05 04:29:22.228', '2026-09-05 04:29:22.228'),
('cmtnvwxr3002dug6o13xvzhvv', 'am@asdf.com', '$2b$12$5hlOCCUMrWKFV5iW8WQ0nepFSzacH3SYuWORwdODMxRVvcZ5d4Pj6', 'amar', 1, '2026-09-05 04:30:24.735', '2026-09-05 04:30:24.735'),
('cmtnvximb002fug6o2csix78r', 'si@asdf.com', '$2b$12$K3q0ZenCW8VaTZF4w4qv1.7mZPmpRuoRcNhmUKsJbnts3niAkeumK', 'sita', 1, '2026-09-05 04:30:51.779', '2026-09-05 04:30:51.779'),
('cmtod0uod003eug6o8uflrjct', 'lalshrestha006@gmail.com', '$2b$12$iKEDnK/qfm7kLPyjm13kfO2/oVnKvEppw6R2HhHY/JjEhRLojT6MC', 'Rajesh Shrestha', 1, '2026-09-05 12:29:20.845', '2026-09-05 12:29:20.845'),
('cmtod3du4003gug6orh6r9phk', 'sitashrestha9801@gmail.com', '$2b$12$tQNz9hso3kuy4jerAS7Gq.RxBcjfYFV/CzTooX7tXKlO8S.rj19pe', 'Sita Shrestha', 1, '2026-09-05 12:31:18.988', '2026-09-05 12:31:18.988'),
('cmtoelojn003sug6oo1rgh6yp', 'employee@gmail.com', '$2b$12$68/ahQXmS/WRykog5htouuL60G9x22dF.99XFpMnO4e/xGVhlvXbm', 'employee', 0, '2026-09-05 13:13:32.291', '2026-09-05 13:14:17.031');

-- --------------------------------------------------------

--
-- Table structure for table `UserSession`
--

CREATE TABLE `UserSession` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `deviceId` varchar(191) NOT NULL,
  `deviceType` enum('WEB','ANDROID','IOS','DESKTOP','OTHER') NOT NULL DEFAULT 'WEB',
  `deviceLabel` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `lastActiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserSession`
--

INSERT INTO `UserSession` (`id`, `orgId`, `userId`, `deviceId`, `deviceType`, `deviceLabel`, `ipAddress`, `userAgent`, `revokedAt`, `lastActiveAt`, `createdAt`, `updatedAt`) VALUES
('cmtkadhpo00070g6o3psvn4og', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'a0271c37-aaf9-474c-b010-62ae96686559', '14b8b1b5-409a-4838-bd2c-27d7c1e337b9', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-05 07:34:35.002', '2026-09-05 07:33:55.799', '2026-09-02 16:04:07.020', '2026-09-05 07:34:35.003'),
('cmtkbdx5h0002ug6o5kwgspk8', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'a0271c37-aaf9-474c-b010-62ae96686559', 'db3823b7-a886-43c0-9d03-7831d18a1d9b', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', NULL, '2026-09-02 16:32:26.645', '2026-09-02 16:32:26.645', '2026-09-02 16:32:26.645'),
('cmtl8b9v5001rug6oj74bqvs7', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'a0271c37-aaf9-474c-b010-62ae96686559', 'f10c8278-4028-4039-bd2a-8088cc66faaf', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', NULL, '2026-09-03 07:54:10.481', '2026-09-03 07:54:10.481', '2026-09-03 07:54:10.481'),
('cmtlawj2c001tug6o5pm5pcgq', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'a0271c37-aaf9-474c-b010-62ae96686559', 'b31c093a-69b6-4ee7-9236-30e9626799b6', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/152.0.7977.64 Mobile/15E148 Safari/604.1', NULL, '2026-09-03 09:06:41.412', '2026-09-03 09:06:41.412', '2026-09-03 09:06:41.412'),
('cmto2jnyc002wug6ofduj4fqo', '7148d149-3de9-4fb8-9b0b-003788657636', '4f5467dd-a9b8-4cac-b825-3255e4485adf', '14b8b1b5-409a-4838-bd2c-27d7c1e337b9', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-05 07:37:37.064', '2026-09-05 07:36:02.820', '2026-09-05 07:36:02.820', '2026-09-05 07:37:37.064'),
('cmto2lvaq002yug6oxtw27ipk', 'd577b71d-5580-43b1-8443-8c7133747b55', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', '14b8b1b5-409a-4838-bd2c-27d7c1e337b9', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-05 07:38:48.646', '2026-09-05 07:37:45.650', '2026-09-05 07:37:45.650', '2026-09-05 07:38:48.647'),
('cmto4voci003aug6ohwg1zqzq', 'd577b71d-5580-43b1-8443-8c7133747b55', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', 'db3823b7-a886-43c0-9d03-7831d18a1d9b', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', NULL, '2026-09-05 08:41:22.434', '2026-09-05 08:41:22.434', '2026-09-05 08:41:22.434'),
('cmto4vpqe003cug6o7yxyh5yf', 'd577b71d-5580-43b1-8443-8c7133747b55', '3bb3e85c-e5b8-4817-8b00-a2a546f59461', 'c6f2f4ea-f36a-415a-90a6-573784fad93d', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0', '2026-09-05 08:41:48.770', '2026-09-05 08:41:24.230', '2026-09-05 08:41:24.230', '2026-09-05 08:41:48.771'),
('cmtoehx7n003qug6oku462byp', '7148d149-3de9-4fb8-9b0b-003788657636', '4f5467dd-a9b8-4cac-b825-3255e4485adf', '167a67ba-d3b4-4514-855f-4761a36dc3d1', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', NULL, '2026-09-05 13:10:36.899', '2026-09-05 13:10:36.899', '2026-09-05 13:10:36.899'),
('cmtoembli003uug6onngi5qa4', '7148d149-3de9-4fb8-9b0b-003788657636', 'cmtoelojn003sug6oo1rgh6yp', '0cde55d0-6c55-4047-9d59-230af8092d20', 'WEB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', NULL, '2026-09-05 13:14:02.166', '2026-09-05 13:14:02.166', '2026-09-05 13:14:02.166');

-- --------------------------------------------------------

--
-- Table structure for table `Vehicle`
--

CREATE TABLE `Vehicle` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `VehicleModel` varchar(191) NOT NULL,
  `vehicleNo` varchar(191) NOT NULL,
  `vehicleType` varchar(191) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Vehicle`
--

INSERT INTO `Vehicle` (`id`, `orgId`, `VehicleModel`, `vehicleNo`, `vehicleType`, `year`, `isActive`, `createdById`, `createdAt`, `updatedAt`) VALUES
('cmtkak06w000b0g6oyko2fpyc', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'Tipper 400', 'BA 3 CHA 8888', 'Tipper', 2022, 1, 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02 16:09:10.904', '2026-09-02 16:09:10.904');

-- --------------------------------------------------------

--
-- Table structure for table `VehicleDriver`
--

CREATE TABLE `VehicleDriver` (
  `id` varchar(191) NOT NULL,
  `vehicleId` varchar(191) NOT NULL,
  `staffId` varchar(191) NOT NULL,
  `isPrimary` tinyint(1) NOT NULL DEFAULT 0,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `VehicleDriver`
--

INSERT INTO `VehicleDriver` (`id`, `vehicleId`, `staffId`, `isPrimary`, `assignedAt`) VALUES
('cmtkak06z000c0g6odi8i981m', 'cmtkak06w000b0g6oyko2fpyc', 'cmtkae6td00090g6oe9ubpr6b', 1, '2026-09-02 16:09:10.904');

-- --------------------------------------------------------

--
-- Table structure for table `VehicleMaintenance`
--

CREATE TABLE `VehicleMaintenance` (
  `id` varchar(191) NOT NULL,
  `orgId` varchar(191) NOT NULL,
  `vehicleId` varchar(191) DEFAULT NULL,
  `plantId` varchar(191) DEFAULT NULL,
  `driverStaffId` varchar(191) DEFAULT NULL,
  `shopId` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `reviewedById` varchar(191) DEFAULT NULL,
  `maintenanceDate` date NOT NULL,
  `paymentDate` date DEFAULT NULL,
  `paymentMethod` enum('CREDIT','CHEQUE','CASH_IN_COUNTER') DEFAULT NULL,
  `odometer` int(11) DEFAULT NULL,
  `nextServiceDate` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `billPath` text DEFAULT NULL,
  `voucherPhotos` text DEFAULT NULL,
  `totalCost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('PENDING','REVIEWED') NOT NULL DEFAULT 'PENDING',
  `reviewedAt` datetime(3) DEFAULT NULL,
  `reviewNote` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `VehicleMaintenance`
--

INSERT INTO `VehicleMaintenance` (`id`, `orgId`, `vehicleId`, `plantId`, `driverStaffId`, `shopId`, `createdById`, `reviewedById`, `maintenanceDate`, `paymentDate`, `paymentMethod`, `odometer`, `nextServiceDate`, `notes`, `billPath`, `voucherPhotos`, `totalCost`, `status`, `reviewedAt`, `reviewNote`, `createdAt`, `updatedAt`) VALUES
('cmtkarznk0000ug6otm0xx2fz', '8a27055b-15d1-499f-ab2d-d9218c72a528', 'cmtkak06w000b0g6oyko2fpyc', NULL, 'cmtkae6td00090g6oe9ubpr6b', 'cmtkaj3mw000a0g6ogsgs2n21', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', 'fc42b9e7-bfb2-48f4-870f-a031de0cb5af', '2026-09-02', NULL, 'CASH_IN_COUNTER', 88888, '2026-09-18', 'kk', '/uploads/maintenance-bills/1788365723253-f8c4821f-8342-4ae6-b8a7-16cbdd54746d.png', NULL, 6400.00, 'REVIEWED', '2026-09-02 16:39:38.921', 'ok', '2026-09-02 16:15:23.457', '2026-09-02 16:39:38.925');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Advance`
--
ALTER TABLE `Advance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Advance_orgId_staffId_advanceMonth_advanceYear_key` (`orgId`,`staffId`,`advanceMonth`,`advanceYear`),
  ADD KEY `Advance_orgId_idx` (`orgId`),
  ADD KEY `Advance_orgId_staffId_idx` (`orgId`,`staffId`),
  ADD KEY `Advance_orgId_advanceYear_advanceMonth_idx` (`orgId`,`advanceYear`,`advanceMonth`),
  ADD KEY `Advance_staffId_idx` (`staffId`),
  ADD KEY `Advance_createdById_idx` (`createdById`),
  ADD KEY `Advance_approvedById_idx` (`approvedById`),
  ADD KEY `Advance_additionalApprovedById_idx` (`additionalApprovedById`);

--
-- Indexes for table `BillSequence`
--
ALTER TABLE `BillSequence`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `BillSequence_orgId_key` (`orgId`);

--
-- Indexes for table `CreditParty`
--
ALTER TABLE `CreditParty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CreditParty_orgId_name_key` (`orgId`,`name`),
  ADD KEY `CreditParty_orgId_idx` (`orgId`),
  ADD KEY `CreditParty_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `CreditParty_createdById_idx` (`createdById`);

--
-- Indexes for table `CreditPartyRate`
--
ALTER TABLE `CreditPartyRate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CreditPartyRate_creditPartyId_tripVehicleId_materialId_key` (`creditPartyId`,`tripVehicleId`,`materialId`),
  ADD KEY `CreditPartyRate_creditPartyId_idx` (`creditPartyId`),
  ADD KEY `CreditPartyRate_tripVehicleId_idx` (`tripVehicleId`),
  ADD KEY `CreditPartyRate_materialId_idx` (`materialId`);

--
-- Indexes for table `CreditTransaction`
--
ALTER TABLE `CreditTransaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CreditTransaction_orgId_idx` (`orgId`),
  ADD KEY `CreditTransaction_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `CreditTransaction_orgId_creditPartyId_idx` (`orgId`,`creditPartyId`),
  ADD KEY `CreditTransaction_reportId_idx` (`reportId`),
  ADD KEY `CreditTransaction_creditPartyId_idx` (`creditPartyId`),
  ADD KEY `CreditTransaction_tripVehicleId_idx` (`tripVehicleId`),
  ADD KEY `CreditTransaction_materialId_idx` (`materialId`),
  ADD KEY `CreditTransaction_createdById_idx` (`createdById`);

--
-- Indexes for table `DailyBankDeposit`
--
ALTER TABLE `DailyBankDeposit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DailyBankDeposit_reportId_idx` (`reportId`);

--
-- Indexes for table `DailyCreditSale`
--
ALTER TABLE `DailyCreditSale`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DailyCreditSale_reportId_idx` (`reportId`),
  ADD KEY `DailyCreditSale_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `DailyCreditSale_createdById_idx` (`createdById`);

--
-- Indexes for table `DailyExpense`
--
ALTER TABLE `DailyExpense`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DailyExpense_reportId_idx` (`reportId`),
  ADD KEY `DailyExpense_purchaseId_idx` (`purchaseId`),
  ADD KEY `DailyExpense_maintenanceId_idx` (`maintenanceId`),
  ADD KEY `DailyExpense_advanceId_idx` (`advanceId`),
  ADD KEY `DailyExpense_staffId_idx` (`staffId`);

--
-- Indexes for table `DailyPlantReport`
--
ALTER TABLE `DailyPlantReport`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `DailyPlantReport_orgId_plantId_date_key` (`orgId`,`plantId`,`date`),
  ADD KEY `DailyPlantReport_orgId_idx` (`orgId`),
  ADD KEY `DailyPlantReport_orgId_plantId_idx` (`orgId`,`plantId`),
  ADD KEY `DailyPlantReport_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `DailyPlantReport_orgId_plantId_date_idx` (`orgId`,`plantId`,`date`),
  ADD KEY `DailyPlantReport_orgId_status_idx` (`orgId`,`status`),
  ADD KEY `DailyPlantReport_plantId_idx` (`plantId`),
  ADD KEY `DailyPlantReport_createdById_idx` (`createdById`),
  ADD KEY `DailyPlantReport_checkedById_idx` (`checkedById`);

--
-- Indexes for table `DailySaleEntry`
--
ALTER TABLE `DailySaleEntry`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DailySaleEntry_reportId_idx` (`reportId`),
  ADD KEY `DailySaleEntry_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `DailySaleEntry_materialId_idx` (`materialId`),
  ADD KEY `DailySaleEntry_tripVehicleId_idx` (`tripVehicleId`),
  ADD KEY `DailySaleEntry_createdById_idx` (`createdById`);

--
-- Indexes for table `DailySaleItem`
--
ALTER TABLE `DailySaleItem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DailySaleItem_reportId_idx` (`reportId`),
  ADD KEY `DailySaleItem_materialId_idx` (`materialId`),
  ADD KEY `DailySaleItem_tripVehicleId_idx` (`tripVehicleId`);

--
-- Indexes for table `DailySalesReport`
--
ALTER TABLE `DailySalesReport`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `DailySalesReport_orgId_date_key` (`orgId`,`date`),
  ADD UNIQUE KEY `DailySalesReport_billNumber_key` (`billNumber`),
  ADD KEY `DailySalesReport_orgId_idx` (`orgId`),
  ADD KEY `DailySalesReport_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `DailySalesReport_orgId_status_idx` (`orgId`,`status`),
  ADD KEY `DailySalesReport_createdById_idx` (`createdById`),
  ADD KEY `DailySalesReport_approvedById_idx` (`approvedById`);

--
-- Indexes for table `DailySalesReturns`
--
ALTER TABLE `DailySalesReturns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DailySalesReturns_reportId_idx` (`reportId`),
  ADD KEY `DailySalesReturns_orgId_idx` (`orgId`),
  ADD KEY `DailySalesReturns_createdById_idx` (`createdById`);

--
-- Indexes for table `DailyTripRecord`
--
ALTER TABLE `DailyTripRecord`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DailyTripRecord_orgId_idx` (`orgId`),
  ADD KEY `DailyTripRecord_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `DailyTripRecord_orgId_staffId_idx` (`orgId`,`staffId`),
  ADD KEY `DailyTripRecord_orgId_materialId_idx` (`orgId`,`materialId`),
  ADD KEY `DailyTripRecord_orgId_date_staffId_idx` (`orgId`,`date`,`staffId`),
  ADD KEY `DailyTripRecord_staffId_idx` (`staffId`),
  ADD KEY `DailyTripRecord_materialId_idx` (`materialId`),
  ADD KEY `DailyTripRecord_createdById_idx` (`createdById`),
  ADD KEY `DailyTripRecord_updatedById_idx` (`updatedById`);

--
-- Indexes for table `Department`
--
ALTER TABLE `Department`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Department_orgId_code_key` (`orgId`,`code`),
  ADD KEY `Department_orgId_idx` (`orgId`);

--
-- Indexes for table `InventoryTransaction`
--
ALTER TABLE `InventoryTransaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `InventoryTransaction_orgId_idx` (`orgId`),
  ADD KEY `InventoryTransaction_orgId_productId_idx` (`orgId`,`productId`),
  ADD KEY `InventoryTransaction_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `InventoryTransaction_orgId_productId_date_idx` (`orgId`,`productId`,`date`),
  ADD KEY `InventoryTransaction_orgId_type_idx` (`orgId`,`type`),
  ADD KEY `InventoryTransaction_productId_idx` (`productId`),
  ADD KEY `InventoryTransaction_createdById_idx` (`createdById`);

--
-- Indexes for table `LeaveRequest`
--
ALTER TABLE `LeaveRequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `LeaveRequest_orgId_idx` (`orgId`),
  ADD KEY `LeaveRequest_orgId_staffId_idx` (`orgId`,`staffId`),
  ADD KEY `LeaveRequest_orgId_status_idx` (`orgId`,`status`),
  ADD KEY `LeaveRequest_orgId_leaveFrom_idx` (`orgId`,`leaveFrom`),
  ADD KEY `LeaveRequest_staffId_idx` (`staffId`),
  ADD KEY `LeaveRequest_createdById_idx` (`createdById`),
  ADD KEY `LeaveRequest_reviewedById_idx` (`reviewedById`);

--
-- Indexes for table `LoginAttempt`
--
ALTER TABLE `LoginAttempt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `LoginAttempt_userId_idx` (`userId`),
  ADD KEY `LoginAttempt_ipAddress_idx` (`ipAddress`),
  ADD KEY `LoginAttempt_createdAt_idx` (`createdAt`);

--
-- Indexes for table `MaintenanceItem`
--
ALTER TABLE `MaintenanceItem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MaintenanceItem_maintenanceId_idx` (`maintenanceId`);

--
-- Indexes for table `MaintenanceShop`
--
ALTER TABLE `MaintenanceShop`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `MaintenanceShop_orgId_name_key` (`orgId`,`name`),
  ADD KEY `MaintenanceShop_orgId_idx` (`orgId`),
  ADD KEY `MaintenanceShop_createdById_idx` (`createdById`);

--
-- Indexes for table `MaintenanceShopPayment`
--
ALTER TABLE `MaintenanceShopPayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MaintenanceShopPayment_orgId_idx` (`orgId`),
  ADD KEY `MaintenanceShopPayment_orgId_shopId_idx` (`orgId`,`shopId`),
  ADD KEY `MaintenanceShopPayment_orgId_maintenanceId_idx` (`orgId`,`maintenanceId`),
  ADD KEY `MaintenanceShopPayment_shopId_fkey` (`shopId`),
  ADD KEY `MaintenanceShopPayment_maintenanceId_fkey` (`maintenanceId`),
  ADD KEY `MaintenanceShopPayment_createdById_fkey` (`createdById`);

--
-- Indexes for table `MasterProduct`
--
ALTER TABLE `MasterProduct`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `MasterProduct_orgId_productCode_key` (`orgId`,`productCode`),
  ADD KEY `MasterProduct_orgId_idx` (`orgId`),
  ADD KEY `MasterProduct_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `MasterProduct_orgId_category_idx` (`orgId`,`category`),
  ADD KEY `MasterProduct_orgId_name_idx` (`orgId`,`name`),
  ADD KEY `MasterProduct_orgId_productCode_idx` (`orgId`,`productCode`),
  ADD KEY `MasterProduct_createdById_idx` (`createdById`);

--
-- Indexes for table `MaterialRate`
--
ALTER TABLE `MaterialRate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `MaterialRate_orgId_materialId_referenceVehicleId_key` (`orgId`,`materialId`,`referenceVehicleId`),
  ADD KEY `MaterialRate_orgId_idx` (`orgId`),
  ADD KEY `MaterialRate_orgId_materialId_idx` (`orgId`,`materialId`),
  ADD KEY `MaterialRate_materialId_idx` (`materialId`),
  ADD KEY `MaterialRate_referenceVehicleId_idx` (`referenceVehicleId`),
  ADD KEY `MaterialRate_setById_idx` (`setById`);

--
-- Indexes for table `MaterialRateDetail`
--
ALTER TABLE `MaterialRateDetail`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `MaterialRateDetail_rateId_tripVehicleId_key` (`rateId`,`tripVehicleId`),
  ADD KEY `MaterialRateDetail_orgId_idx` (`orgId`),
  ADD KEY `MaterialRateDetail_orgId_rateId_idx` (`orgId`,`rateId`),
  ADD KEY `MaterialRateDetail_orgId_tripVehicleId_idx` (`orgId`,`tripVehicleId`),
  ADD KEY `MaterialRateDetail_tripVehicleId_idx` (`tripVehicleId`);

--
-- Indexes for table `Orders`
--
ALTER TABLE `Orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Orders_orgId_idx` (`orgId`),
  ADD KEY `Orders_orgId_date_idx` (`orgId`,`date`),
  ADD KEY `Orders_orgId_status_idx` (`orgId`,`status`),
  ADD KEY `Orders_orgId_productId_idx` (`orgId`,`productId`),
  ADD KEY `Orders_productId_fkey` (`productId`),
  ADD KEY `Orders_orderByStaffId_fkey` (`orderByStaffId`),
  ADD KEY `Orders_orderToMemberId_fkey` (`orderToMemberId`),
  ADD KEY `Orders_createdById_fkey` (`createdById`),
  ADD KEY `Orders_checkedById_fkey` (`checkedById`),
  ADD KEY `Orders_verifiedById_fkey` (`verifiedById`);

--
-- Indexes for table `Organization`
--
ALTER TABLE `Organization`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Organization_slug_key` (`slug`),
  ADD KEY `Organization_slug_idx` (`slug`),
  ADD KEY `Organization_name_idx` (`name`);

--
-- Indexes for table `OrganizationMember`
--
ALTER TABLE `OrganizationMember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `OrganizationMember_userId_orgId_key` (`userId`,`orgId`),
  ADD KEY `OrganizationMember_orgId_idx` (`orgId`),
  ADD KEY `OrganizationMember_orgId_role_idx` (`orgId`,`role`);

--
-- Indexes for table `Otp`
--
ALTER TABLE `Otp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Otp_userId_idx` (`userId`),
  ADD KEY `Otp_purpose_idx` (`purpose`),
  ADD KEY `Otp_expiresAt_idx` (`expiresAt`);

--
-- Indexes for table `Plant`
--
ALTER TABLE `Plant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Plant_orgId_name_key` (`orgId`,`name`),
  ADD KEY `Plant_orgId_idx` (`orgId`),
  ADD KEY `Plant_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `Plant_createdById_idx` (`createdById`);

--
-- Indexes for table `PlantMaintenanceComponent`
--
ALTER TABLE `PlantMaintenanceComponent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `PlantMaintenanceComponent_reportId_idx` (`reportId`);

--
-- Indexes for table `ProductCategory`
--
ALTER TABLE `ProductCategory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ProductCategory_orgId_name_key` (`orgId`,`name`),
  ADD KEY `ProductCategory_orgId_idx` (`orgId`),
  ADD KEY `ProductCategory_createdById_idx` (`createdById`);

--
-- Indexes for table `Purchase`
--
ALTER TABLE `Purchase`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Purchase_orgId_serialNo_key` (`orgId`,`serialNo`),
  ADD KEY `Purchase_orgId_idx` (`orgId`),
  ADD KEY `Purchase_orgId_purchaseDate_idx` (`orgId`,`purchaseDate`),
  ADD KEY `Purchase_orgId_paymentDate_idx` (`orgId`,`paymentDate`),
  ADD KEY `Purchase_orgId_status_idx` (`orgId`,`status`),
  ADD KEY `Purchase_supplierId_idx` (`supplierId`),
  ADD KEY `Purchase_createdById_idx` (`createdById`),
  ADD KEY `Purchase_reviewedById_idx` (`reviewedById`);

--
-- Indexes for table `PurchaseSupplier`
--
ALTER TABLE `PurchaseSupplier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PurchaseSupplier_orgId_name_key` (`orgId`,`name`),
  ADD KEY `PurchaseSupplier_orgId_idx` (`orgId`),
  ADD KEY `PurchaseSupplier_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `PurchaseSupplier_createdById_idx` (`createdById`);

--
-- Indexes for table `PurchaseSupplierPayment`
--
ALTER TABLE `PurchaseSupplierPayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `PurchaseSupplierPayment_orgId_idx` (`orgId`),
  ADD KEY `PurchaseSupplierPayment_supplierId_idx` (`supplierId`),
  ADD KEY `PurchaseSupplierPayment_purchaseId_idx` (`purchaseId`),
  ADD KEY `PurchaseSupplierPayment_createdById_idx` (`createdById`);

--
-- Indexes for table `RawMaterial`
--
ALTER TABLE `RawMaterial`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RawMaterial_orgId_name_key` (`orgId`,`name`),
  ADD KEY `RawMaterial_orgId_idx` (`orgId`),
  ADD KEY `RawMaterial_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `RawMaterial_createdById_idx` (`createdById`);

--
-- Indexes for table `RawMaterialTrip`
--
ALTER TABLE `RawMaterialTrip`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RawMaterialTrip_tripRecordId_hour_key` (`tripRecordId`,`hour`),
  ADD KEY `RawMaterialTrip_tripRecordId_idx` (`tripRecordId`);

--
-- Indexes for table `RefreshToken`
--
ALTER TABLE `RefreshToken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RefreshToken_tokenHash_key` (`tokenHash`),
  ADD KEY `RefreshToken_userId_idx` (`userId`);

--
-- Indexes for table `RegistryDefaultItem`
--
ALTER TABLE `RegistryDefaultItem`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RegistryDefaultItem_type_name_key` (`type`,`name`),
  ADD KEY `RegistryDefaultItem_type_sortOrder_idx` (`type`,`sortOrder`);

--
-- Indexes for table `RegistryDefaultSeed`
--
ALTER TABLE `RegistryDefaultSeed`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Staff`
--
ALTER TABLE `Staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Staff_orgId_employeeCode_key` (`orgId`,`employeeCode`),
  ADD KEY `Staff_orgId_idx` (`orgId`),
  ADD KEY `Staff_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `Staff_orgId_deptId_idx` (`orgId`,`deptId`),
  ADD KEY `Staff_deptId_idx` (`deptId`),
  ADD KEY `Staff_createdById_idx` (`createdById`);

--
-- Indexes for table `Subscription`
--
ALTER TABLE `Subscription`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Subscription_organizationId_status_idx` (`organizationId`,`status`),
  ADD KEY `Subscription_planId_idx` (`planId`),
  ADD KEY `Subscription_subscribedByUserId_idx` (`subscribedByUserId`),
  ADD KEY `Subscription_status_SubscriptionEndsAt_idx` (`status`,`SubscriptionEndsAt`);

--
-- Indexes for table `SubscriptionPayment`
--
ALTER TABLE `SubscriptionPayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SubscriptionPayment_subscriptionId_idx` (`subscriptionId`),
  ADD KEY `SubscriptionPayment_invoiceId_idx` (`invoiceId`),
  ADD KEY `SubscriptionPayment_provider_transactionId_idx` (`provider`,`transactionId`),
  ADD KEY `SubscriptionPayment_organizationId_idx` (`organizationId`),
  ADD KEY `SubscriptionPayment_recordedByUserId_idx` (`recordedByUserId`);

--
-- Indexes for table `SubscriptionPlan`
--
ALTER TABLE `SubscriptionPlan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SubscriptionPlan_code_key` (`code`),
  ADD KEY `SubscriptionPlan_name_description_idx` (`name`,`description`);

--
-- Indexes for table `SuperLoginAttempt`
--
ALTER TABLE `SuperLoginAttempt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SuperLoginAttempt_userId_idx` (`userId`);

--
-- Indexes for table `SuperUser`
--
ALTER TABLE `SuperUser`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SuperUser_email_key` (`email`),
  ADD UNIQUE KEY `SuperUser_secret_key` (`secret`);

--
-- Indexes for table `TripVehicle`
--
ALTER TABLE `TripVehicle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TripVehicle_orgId_vehicleModel_key` (`orgId`,`vehicleModel`),
  ADD KEY `TripVehicle_orgId_idx` (`orgId`),
  ADD KEY `TripVehicle_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `TripVehicle_createdById_idx` (`createdById`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `UserSession`
--
ALTER TABLE `UserSession`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserSession_orgId_deviceId_key` (`orgId`,`deviceId`),
  ADD KEY `UserSession_orgId_revokedAt_idx` (`orgId`,`revokedAt`),
  ADD KEY `UserSession_userId_revokedAt_idx` (`userId`,`revokedAt`);

--
-- Indexes for table `Vehicle`
--
ALTER TABLE `Vehicle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Vehicle_orgId_vehicleNo_key` (`orgId`,`vehicleNo`),
  ADD KEY `Vehicle_orgId_idx` (`orgId`),
  ADD KEY `Vehicle_orgId_isActive_idx` (`orgId`,`isActive`),
  ADD KEY `Vehicle_createdById_idx` (`createdById`);

--
-- Indexes for table `VehicleDriver`
--
ALTER TABLE `VehicleDriver`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `VehicleDriver_vehicleId_staffId_key` (`vehicleId`,`staffId`),
  ADD KEY `VehicleDriver_vehicleId_idx` (`vehicleId`),
  ADD KEY `VehicleDriver_staffId_idx` (`staffId`);

--
-- Indexes for table `VehicleMaintenance`
--
ALTER TABLE `VehicleMaintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `VehicleMaintenance_orgId_idx` (`orgId`),
  ADD KEY `VehicleMaintenance_orgId_vehicleId_idx` (`orgId`,`vehicleId`),
  ADD KEY `VehicleMaintenance_orgId_plantId_idx` (`orgId`,`plantId`),
  ADD KEY `VehicleMaintenance_orgId_shopId_idx` (`orgId`,`shopId`),
  ADD KEY `VehicleMaintenance_orgId_maintenanceDate_idx` (`orgId`,`maintenanceDate`),
  ADD KEY `VehicleMaintenance_orgId_paymentDate_idx` (`orgId`,`paymentDate`),
  ADD KEY `VehicleMaintenance_orgId_status_idx` (`orgId`,`status`),
  ADD KEY `VehicleMaintenance_orgId_vehicleId_maintenanceDate_idx` (`orgId`,`vehicleId`,`maintenanceDate`),
  ADD KEY `VehicleMaintenance_orgId_plantId_maintenanceDate_idx` (`orgId`,`plantId`,`maintenanceDate`),
  ADD KEY `VehicleMaintenance_vehicleId_fkey` (`vehicleId`),
  ADD KEY `VehicleMaintenance_plantId_fkey` (`plantId`),
  ADD KEY `VehicleMaintenance_shopId_fkey` (`shopId`),
  ADD KEY `VehicleMaintenance_driverStaffId_fkey` (`driverStaffId`),
  ADD KEY `VehicleMaintenance_createdById_fkey` (`createdById`),
  ADD KEY `VehicleMaintenance_reviewedById_fkey` (`reviewedById`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Advance`
--
ALTER TABLE `Advance`
  ADD CONSTRAINT `Advance_additionalApprovedById_fkey` FOREIGN KEY (`additionalApprovedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Advance_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Advance_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Advance_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Advance_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `BillSequence`
--
ALTER TABLE `BillSequence`
  ADD CONSTRAINT `BillSequence_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `CreditParty`
--
ALTER TABLE `CreditParty`
  ADD CONSTRAINT `CreditParty_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditParty_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `CreditPartyRate`
--
ALTER TABLE `CreditPartyRate`
  ADD CONSTRAINT `CreditPartyRate_creditPartyId_fkey` FOREIGN KEY (`creditPartyId`) REFERENCES `CreditParty` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditPartyRate_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `RawMaterial` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditPartyRate_tripVehicleId_fkey` FOREIGN KEY (`tripVehicleId`) REFERENCES `TripVehicle` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `CreditTransaction`
--
ALTER TABLE `CreditTransaction`
  ADD CONSTRAINT `CreditTransaction_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditTransaction_creditPartyId_fkey` FOREIGN KEY (`creditPartyId`) REFERENCES `CreditParty` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditTransaction_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `RawMaterial` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditTransaction_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditTransaction_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailySalesReport` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `CreditTransaction_tripVehicleId_fkey` FOREIGN KEY (`tripVehicleId`) REFERENCES `TripVehicle` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `DailyBankDeposit`
--
ALTER TABLE `DailyBankDeposit`
  ADD CONSTRAINT `DailyBankDeposit_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailySalesReport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DailyCreditSale`
--
ALTER TABLE `DailyCreditSale`
  ADD CONSTRAINT `DailyCreditSale_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyCreditSale_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyCreditSale_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailySalesReport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DailyExpense`
--
ALTER TABLE `DailyExpense`
  ADD CONSTRAINT `DailyExpense_advanceId_fkey` FOREIGN KEY (`advanceId`) REFERENCES `Advance` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyExpense_maintenanceId_fkey` FOREIGN KEY (`maintenanceId`) REFERENCES `VehicleMaintenance` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyExpense_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyExpense_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailySalesReport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyExpense_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `DailyPlantReport`
--
ALTER TABLE `DailyPlantReport`
  ADD CONSTRAINT `DailyPlantReport_checkedById_fkey` FOREIGN KEY (`checkedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyPlantReport_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyPlantReport_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyPlantReport_plantId_fkey` FOREIGN KEY (`plantId`) REFERENCES `Plant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `DailySaleEntry`
--
ALTER TABLE `DailySaleEntry`
  ADD CONSTRAINT `DailySaleEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySaleEntry_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `RawMaterial` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySaleEntry_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySaleEntry_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailySalesReport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySaleEntry_tripVehicleId_fkey` FOREIGN KEY (`tripVehicleId`) REFERENCES `TripVehicle` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `DailySaleItem`
--
ALTER TABLE `DailySaleItem`
  ADD CONSTRAINT `DailySaleItem_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `RawMaterial` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySaleItem_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailySalesReport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySaleItem_tripVehicleId_fkey` FOREIGN KEY (`tripVehicleId`) REFERENCES `TripVehicle` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `DailySalesReport`
--
ALTER TABLE `DailySalesReport`
  ADD CONSTRAINT `DailySalesReport_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySalesReport_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySalesReport_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `DailySalesReturns`
--
ALTER TABLE `DailySalesReturns`
  ADD CONSTRAINT `DailySalesReturns_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySalesReturns_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailySalesReturns_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailySalesReport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DailyTripRecord`
--
ALTER TABLE `DailyTripRecord`
  ADD CONSTRAINT `DailyTripRecord_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyTripRecord_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `RawMaterial` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyTripRecord_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyTripRecord_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `DailyTripRecord_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Department`
--
ALTER TABLE `Department`
  ADD CONSTRAINT `Department_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `InventoryTransaction`
--
ALTER TABLE `InventoryTransaction`
  ADD CONSTRAINT `InventoryTransaction_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryTransaction_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryTransaction_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `MasterProduct` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `LeaveRequest`
--
ALTER TABLE `LeaveRequest`
  ADD CONSTRAINT `LeaveRequest_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `LeaveRequest_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `LeaveRequest_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `LeaveRequest_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `LoginAttempt`
--
ALTER TABLE `LoginAttempt`
  ADD CONSTRAINT `LoginAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `MaintenanceItem`
--
ALTER TABLE `MaintenanceItem`
  ADD CONSTRAINT `MaintenanceItem_maintenanceId_fkey` FOREIGN KEY (`maintenanceId`) REFERENCES `VehicleMaintenance` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `MaintenanceShop`
--
ALTER TABLE `MaintenanceShop`
  ADD CONSTRAINT `MaintenanceShop_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaintenanceShop_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `MaintenanceShopPayment`
--
ALTER TABLE `MaintenanceShopPayment`
  ADD CONSTRAINT `MaintenanceShopPayment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaintenanceShopPayment_maintenanceId_fkey` FOREIGN KEY (`maintenanceId`) REFERENCES `VehicleMaintenance` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `MaintenanceShopPayment_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaintenanceShopPayment_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `MaintenanceShop` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `MasterProduct`
--
ALTER TABLE `MasterProduct`
  ADD CONSTRAINT `MasterProduct_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MasterProduct_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `MaterialRate`
--
ALTER TABLE `MaterialRate`
  ADD CONSTRAINT `MaterialRate_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `RawMaterial` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaterialRate_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaterialRate_referenceVehicleId_fkey` FOREIGN KEY (`referenceVehicleId`) REFERENCES `TripVehicle` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaterialRate_setById_fkey` FOREIGN KEY (`setById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `MaterialRateDetail`
--
ALTER TABLE `MaterialRateDetail`
  ADD CONSTRAINT `MaterialRateDetail_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaterialRateDetail_rateId_fkey` FOREIGN KEY (`rateId`) REFERENCES `MaterialRate` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MaterialRateDetail_tripVehicleId_fkey` FOREIGN KEY (`tripVehicleId`) REFERENCES `TripVehicle` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Orders`
--
ALTER TABLE `Orders`
  ADD CONSTRAINT `Orders_checkedById_fkey` FOREIGN KEY (`checkedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Orders_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Orders_orderByStaffId_fkey` FOREIGN KEY (`orderByStaffId`) REFERENCES `Staff` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Orders_orderToMemberId_fkey` FOREIGN KEY (`orderToMemberId`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Orders_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Orders_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `MasterProduct` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Orders_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `OrganizationMember`
--
ALTER TABLE `OrganizationMember`
  ADD CONSTRAINT `OrganizationMember_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `OrganizationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Otp`
--
ALTER TABLE `Otp`
  ADD CONSTRAINT `Otp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Plant`
--
ALTER TABLE `Plant`
  ADD CONSTRAINT `Plant_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Plant_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `PlantMaintenanceComponent`
--
ALTER TABLE `PlantMaintenanceComponent`
  ADD CONSTRAINT `PlantMaintenanceComponent_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `DailyPlantReport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ProductCategory`
--
ALTER TABLE `ProductCategory`
  ADD CONSTRAINT `ProductCategory_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductCategory_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Purchase`
--
ALTER TABLE `Purchase`
  ADD CONSTRAINT `Purchase_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Purchase_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Purchase_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Purchase_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `PurchaseSupplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `PurchaseSupplier`
--
ALTER TABLE `PurchaseSupplier`
  ADD CONSTRAINT `PurchaseSupplier_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseSupplier_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `PurchaseSupplierPayment`
--
ALTER TABLE `PurchaseSupplierPayment`
  ADD CONSTRAINT `PurchaseSupplierPayment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseSupplierPayment_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseSupplierPayment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseSupplierPayment_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `PurchaseSupplier` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `RawMaterial`
--
ALTER TABLE `RawMaterial`
  ADD CONSTRAINT `RawMaterial_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `RawMaterial_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `RawMaterialTrip`
--
ALTER TABLE `RawMaterialTrip`
  ADD CONSTRAINT `RawMaterialTrip_tripRecordId_fkey` FOREIGN KEY (`tripRecordId`) REFERENCES `DailyTripRecord` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `RefreshToken`
--
ALTER TABLE `RefreshToken`
  ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Staff`
--
ALTER TABLE `Staff`
  ADD CONSTRAINT `Staff_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Staff_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Staff_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Subscription`
--
ALTER TABLE `Subscription`
  ADD CONSTRAINT `Subscription_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Subscription_subscribedByUserId_fkey` FOREIGN KEY (`subscribedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `SubscriptionPayment`
--
ALTER TABLE `SubscriptionPayment`
  ADD CONSTRAINT `SubscriptionPayment_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `SubscriptionPayment_recordedByUserId_fkey` FOREIGN KEY (`recordedByUserId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `SubscriptionPayment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `SuperLoginAttempt`
--
ALTER TABLE `SuperLoginAttempt`
  ADD CONSTRAINT `SuperLoginAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `SuperUser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `TripVehicle`
--
ALTER TABLE `TripVehicle`
  ADD CONSTRAINT `TripVehicle_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `TripVehicle_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `UserSession`
--
ALTER TABLE `UserSession`
  ADD CONSTRAINT `UserSession_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Vehicle`
--
ALTER TABLE `Vehicle`
  ADD CONSTRAINT `Vehicle_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Vehicle_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `VehicleDriver`
--
ALTER TABLE `VehicleDriver`
  ADD CONSTRAINT `VehicleDriver_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleDriver_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `VehicleMaintenance`
--
ALTER TABLE `VehicleMaintenance`
  ADD CONSTRAINT `VehicleMaintenance_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `OrganizationMember` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleMaintenance_driverStaffId_fkey` FOREIGN KEY (`driverStaffId`) REFERENCES `Staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleMaintenance_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleMaintenance_plantId_fkey` FOREIGN KEY (`plantId`) REFERENCES `Plant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleMaintenance_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `OrganizationMember` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleMaintenance_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `MaintenanceShop` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `VehicleMaintenance_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
