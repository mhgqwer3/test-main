-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 22, 2026 at 03:00 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_bins_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `description`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, NULL, 'LOGIN', 'USER', 101, 'User logged in', '192.168.1.1', 'Mozilla/5.0', '2026-02-22 01:22:14');

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `alert_id` int(11) NOT NULL,
  `bin_id` int(11) DEFAULT NULL,
  `trip_id` int(11) DEFAULT NULL,
  `alert_type` enum('critical','warning','info','success') NOT NULL,
  `category` enum('battery','fill_level','maintenance','system','location','trip') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('active','acknowledged','resolved') DEFAULT 'active',
  `priority` int(11) DEFAULT 1,
  `acknowledged_by` int(11) DEFAULT NULL,
  `acknowledged_at` datetime DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`alert_id`, `bin_id`, `trip_id`, `alert_type`, `category`, `title`, `message`, `status`, `priority`, `acknowledged_by`, `acknowledged_at`, `resolved_by`, `resolved_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 5, NULL, 'critical', 'battery', 'Critical Battery Alert', 'BIN-007 battery level critically low at 15%', 'active', 10, NULL, NULL, NULL, NULL, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(2, 1, NULL, 'warning', 'fill_level', 'High Fill Level', 'BIN-001 fill level reached 95%', 'active', 7, NULL, NULL, NULL, NULL, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(3, 6, NULL, 'warning', 'battery', 'Low Battery', 'BIN-008 battery at 25%, charging required', 'acknowledged', 5, NULL, NULL, NULL, NULL, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(4, 8, NULL, 'critical', 'system', 'Bin Offline', 'BIN-010 is offline and not responding', 'active', 9, NULL, NULL, NULL, NULL, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(5, 2, 3, 'info', 'trip', 'Trip Completed', 'TRP-2024-003 completed successfully', 'resolved', 1, NULL, NULL, NULL, NULL, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(6, 1, NULL, 'warning', 'fill_level', 'Bin Almost Full', 'BIN-001 fill level reached 90%', 'active', 8, NULL, NULL, NULL, NULL, NULL, '2026-02-20 15:13:48', '2026-02-20 15:13:48'),
(7, 1, NULL, 'critical', 'fill_level', 'Bin Full', 'BIN-001 fill level reached 95%', 'active', 9, NULL, NULL, NULL, NULL, NULL, '2026-02-20 15:24:00', '2026-02-20 15:24:00');

-- --------------------------------------------------------

--
-- Table structure for table `bins`
--

CREATE TABLE `bins` (
  `bin_id` int(11) NOT NULL,
  `bin_code` varchar(20) NOT NULL,
  `bin_name` varchar(100) DEFAULT NULL,
  `status` enum('operational','maintenance','charging','offline') DEFAULT 'operational',
  `zone` varchar(50) DEFAULT NULL,
  `location_name` varchar(200) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `battery_level` int(11) DEFAULT 100,
  `fill_level` int(11) DEFAULT 0,
  `capacity` int(11) DEFAULT 100,
  `model` varchar(50) DEFAULT NULL,
  `manufacture_date` date DEFAULT NULL,
  `last_maintenance` date DEFAULT NULL,
  `next_maintenance` date DEFAULT NULL,
  `firmware_version` varchar(20) DEFAULT NULL,
  `hardware_version` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bins`
--

INSERT INTO `bins` (`bin_id`, `bin_code`, `bin_name`, `status`, `zone`, `location_name`, `latitude`, `longitude`, `battery_level`, `fill_level`, `capacity`, `model`, `manufacture_date`, `last_maintenance`, `next_maintenance`, `firmware_version`, `hardware_version`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BIN-001', 'Smart Bin 001', 'maintenance', 'zone-a', '', 31.03640000, 31.38070000, 85, 75, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-20 15:03:26'),
(2, 'BIN-002', 'Smart Bin 002', 'operational', 'zone-b', 'Al Matar Area, Mansoura', 31.04200000, 31.37500000, 65, 88, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(3, 'BIN-003', 'Smart Bin 003', 'operational', 'zone-a', 'Al Mashaya Area, Mansoura', 31.03800000, 31.38500000, 92, 68, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(4, 'BIN-005', 'Smart Bin 005', 'operational', 'zone-c', 'Toriel District, Mansoura', 31.02500000, 31.39000000, 78, 32, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(5, 'BIN-007', 'Smart Bin 007', 'maintenance', 'zone-d', 'Mit Khamis, Mansoura', 31.05000000, 31.40000000, 15, 12, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(6, 'BIN-008', 'Smart Bin 008', 'charging', 'zone-e', 'Al Sanabel District, Mansoura', 31.03000000, 31.37000000, 25, 45, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(7, 'BIN-009', 'Smart Bin 009', 'operational', 'zone-b', 'Al Naser District, Mansoura', 31.04500000, 31.38200000, 90, 55, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(8, 'BIN-010', 'Smart Bin 010', 'offline', 'zone-c', 'Al Safa District, Mansoura', 31.02800000, 31.39500000, 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `bin_commands`
--

CREATE TABLE `bin_commands` (
  `id` int(11) NOT NULL,
  `bin_code` varchar(20) NOT NULL,
  `command` varchar(100) NOT NULL,
  `params` text DEFAULT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `result` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `executed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bin_commands`
--

INSERT INTO `bin_commands` (`id`, `bin_code`, `command`, `params`, `status`, `result`, `created_at`, `executed_at`) VALUES
(1, 'BIN-001', 'collect', '{\"priority\": \"high\"}', 'completed', 'success', '2026-02-14 23:06:40', '2026-02-20 17:21:33'),
(2, 'BIN-002', 'reset_sensor', '{}', 'completed', NULL, '2026-02-14 23:06:40', NULL),
(3, 'BIN-001', 'return_to_base', '{\"speed\":\"normal\"}', 'pending', NULL, '2026-02-20 15:12:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `daily_statistics`
--

CREATE TABLE `daily_statistics` (
  `stat_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `total_trips` int(11) DEFAULT 0,
  `completed_trips` int(11) DEFAULT 0,
  `failed_trips` int(11) DEFAULT 0,
  `total_distance_km` decimal(10,2) DEFAULT 0.00,
  `avg_fill_level` decimal(5,2) DEFAULT 0.00,
  `avg_battery_level` decimal(5,2) DEFAULT 0.00,
  `critical_alerts` int(11) DEFAULT 0,
  `warning_alerts` int(11) DEFAULT 0,
  `active_bins` int(11) DEFAULT 0,
  `offline_bins` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_statistics`
--

INSERT INTO `daily_statistics` (`stat_id`, `date`, `total_trips`, `completed_trips`, `failed_trips`, `total_distance_km`, `avg_fill_level`, `avg_battery_level`, `critical_alerts`, `warning_alerts`, `active_bins`, `offline_bins`, `created_at`, `updated_at`) VALUES
(1, '2024-02-14', 28, 25, 1, 145.60, 68.50, 72.30, 2, 3, 6, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(2, '2024-02-13', 32, 30, 2, 168.20, 65.20, 75.80, 1, 2, 7, 1, '2026-02-14 23:06:38', '2026-02-14 23:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `history_readings`
--

CREATE TABLE `history_readings` (
  `id` int(11) NOT NULL,
  `bin_id` int(11) DEFAULT NULL,
  `bin_code` varchar(20) DEFAULT NULL,
  `fill_level` int(11) DEFAULT NULL,
  `battery_level` int(11) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `history_readings`
--

INSERT INTO `history_readings` (`id`, `bin_id`, `bin_code`, `fill_level`, `battery_level`, `latitude`, `longitude`, `recorded_at`) VALUES
(1, NULL, '1', 75, 85, NULL, NULL, '2026-02-15 02:54:35'),
(2, NULL, '1', 75, 85, NULL, NULL, '2026-02-17 22:19:43');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_records`
--

CREATE TABLE `maintenance_records` (
  `maintenance_id` int(11) NOT NULL,
  `bin_id` int(11) NOT NULL,
  `maintenance_type` enum('scheduled','emergency','repair','inspection') NOT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `technician_name` varchar(100) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `parts_replaced` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maintenance_records`
--

INSERT INTO `maintenance_records` (`maintenance_id`, `bin_id`, `maintenance_type`, `description`, `cost`, `technician_name`, `start_date`, `end_date`, `status`, `parts_replaced`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 5, 'emergency', 'Battery replacement and system diagnostics', NULL, 'Ahmed Hassan', '2024-02-14 14:00:00', NULL, 'in_progress', NULL, NULL, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(2, 6, 'scheduled', 'Regular maintenance check', NULL, 'Mohamed Ali', '2024-02-15 09:00:00', NULL, 'scheduled', NULL, NULL, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` enum('alert','trip','maintenance','system') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`) VALUES
(16, NULL, 'alert', 'Bin Full', 'BIN-001 fill level reached 95%', '/api_front/alerts.html', 0, '2026-02-22 01:42:16'),
(17, NULL, '', 'Low Battery', 'BIN-002 battery at 15%', '/api_front/alerts.html', 0, '2026-02-22 01:42:16'),
(18, NULL, '', 'Trip Completed', 'BIN-003 trip finished successfully', '/api_front/trips.html', 1, '2026-02-22 01:42:16'),
(19, 1, 'alert', '', 'Test notification', NULL, 0, '2026-02-22 01:46:34');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'system_name', 'Smart Bins Management System', 'string', 'general', 'System name', 0, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(2, 'max_bins_per_route', '5', 'number', 'operations', 'Maximum bins per collection route', 0, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(3, 'low_battery_threshold', '20', 'number', 'alerts', 'Battery level threshold for low battery alerts', 0, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(4, 'high_fill_threshold', '85', 'number', 'alerts', 'Fill level threshold for collection alerts', 0, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(5, 'maintenance_interval_days', '30', 'number', 'maintenance', 'Days between scheduled maintenance', 0, NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `tracking_points`
--

CREATE TABLE `tracking_points` (
  `point_id` int(11) NOT NULL,
  `trip_id` int(11) NOT NULL,
  `bin_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `speed` decimal(5,2) DEFAULT NULL,
  `battery_level` int(11) DEFAULT NULL,
  `fill_level` int(11) DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tracking_points`
--

INSERT INTO `tracking_points` (`point_id`, `trip_id`, `bin_id`, `latitude`, `longitude`, `speed`, `battery_level`, `fill_level`, `timestamp`, `created_at`) VALUES
(1, 1, 5, 24.71360000, 46.67530000, 35.50, 85, 60, '2026-02-22 03:54:42', '2026-02-22 01:54:42');

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `trip_id` int(11) NOT NULL,
  `trip_code` varchar(30) NOT NULL,
  `bin_id` int(11) NOT NULL,
  `route_name` varchar(100) DEFAULT NULL,
  `start_location` varchar(200) DEFAULT NULL,
  `end_location` varchar(200) DEFAULT NULL,
  `start_latitude` decimal(10,8) DEFAULT NULL,
  `start_longitude` decimal(11,8) DEFAULT NULL,
  `end_latitude` decimal(10,8) DEFAULT NULL,
  `end_longitude` decimal(11,8) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `fill_level_start` int(11) DEFAULT NULL,
  `fill_level_end` int(11) DEFAULT NULL,
  `battery_start` int(11) DEFAULT NULL,
  `battery_end` int(11) DEFAULT NULL,
  `status` enum('pending','active','completed','failed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`trip_id`, `trip_code`, `bin_id`, `route_name`, `start_location`, `end_location`, `start_latitude`, `start_longitude`, `end_latitude`, `end_longitude`, `start_time`, `end_time`, `duration_minutes`, `distance_km`, `fill_level_start`, `fill_level_end`, `battery_start`, `battery_end`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'TRP-2024-001', 1, 'Route A-1', 'Al Gomhoria St', 'Collection Center', NULL, NULL, NULL, NULL, '2024-02-14 08:00:00', '2024-02-14 08:45:00', 45, 5.20, 95, 10, 90, 85, 'completed', NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(2, 'TRP-2024-002', 3, 'Route A-2', 'Al Mashaya Area', 'Collection Center', NULL, NULL, NULL, NULL, '2024-02-14 09:15:00', '2024-02-14 10:00:00', 45, 6.80, 88, 15, 95, 92, 'completed', NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(3, 'TRP-2024-003', 2, 'Route B-1', 'Al Matar Area', 'Collection Center', NULL, NULL, NULL, NULL, '2024-02-14 10:30:00', '2024-02-14 11:20:00', 50, 7.50, 88, 12, 70, 65, 'completed', NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(4, 'TRP-2024-004', 4, 'Route C-1', 'Toriel District', 'Collection Center', NULL, NULL, NULL, NULL, '2024-02-14 11:45:00', NULL, NULL, NULL, 32, 32, 78, 78, 'active', NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38'),
(5, 'TRP-2024-005', 7, 'Route B-2', 'Al Naser District', 'Collection Center', NULL, NULL, NULL, NULL, '2024-02-14 13:00:00', NULL, NULL, NULL, 55, 55, 90, 90, 'active', NULL, '2026-02-14 23:06:38', '2026-02-14 23:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','super_admin','operator') DEFAULT 'admin',
  `phone` varchar(20) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password`, `full_name`, `role`, `phone`, `avatar_url`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, '', '', '', 'admin', NULL, NULL, 1, NULL, '2026-02-22 01:45:23', '2026-02-22 01:45:23'),
(4, 'Nader Elsayed@smartbins.com', '##password123', 'Admin User', 'admin', NULL, NULL, 1, '2026-02-22 02:24:20', '2026-02-15 00:01:01', '2026-02-22 00:38:26'),
(5, 'ahmed.adel@smartbins.com', 'user123', 'Ahmed Adel', 'operator', '01001234567', NULL, 1, '2026-02-22 02:51:30', '2026-02-22 00:36:11', '2026-02-22 00:51:30'),
(6, 'omar.alqeeran@smartbins.com', 'user123', 'Omar Alqeeran', 'operator', '01112345678', NULL, 1, NULL, '2026-02-22 00:36:11', '2026-02-22 00:40:58'),
(7, 'Muhamed.Magdy@smartbins.com', 'user456', 'Mohammed Magdy', 'super_admin', '01024714795', NULL, 1, '2026-02-22 03:23:56', '2026-02-22 00:36:11', '2026-02-22 01:23:56'),
(8, 'user1@autobins.com', 'user123', 'Mohamed Ahmed', '', '01001234567', NULL, 1, NULL, '2026-02-22 01:00:11', '2026-02-22 01:00:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action_type` (`action_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`alert_id`),
  ADD KEY `trip_id` (`trip_id`),
  ADD KEY `acknowledged_by` (`acknowledged_by`),
  ADD KEY `resolved_by` (`resolved_by`),
  ADD KEY `idx_alert_type` (`alert_type`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_bin_id` (`bin_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `bins`
--
ALTER TABLE `bins`
  ADD PRIMARY KEY (`bin_id`),
  ADD UNIQUE KEY `bin_code` (`bin_code`),
  ADD KEY `idx_bin_code` (`bin_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_zone` (`zone`),
  ADD KEY `idx_location` (`latitude`,`longitude`);

--
-- Indexes for table `bin_commands`
--
ALTER TABLE `bin_commands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bin_code` (`bin_code`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `daily_statistics`
--
ALTER TABLE `daily_statistics`
  ADD PRIMARY KEY (`stat_id`),
  ADD UNIQUE KEY `date` (`date`),
  ADD KEY `idx_date` (`date`);

--
-- Indexes for table `history_readings`
--
ALTER TABLE `history_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bin_id` (`bin_id`),
  ADD KEY `idx_bin_code` (`bin_code`),
  ADD KEY `idx_recorded_at` (`recorded_at`);

--
-- Indexes for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  ADD PRIMARY KEY (`maintenance_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_bin_id` (`bin_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_date` (`start_date`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_setting_key` (`setting_key`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `tracking_points`
--
ALTER TABLE `tracking_points`
  ADD PRIMARY KEY (`point_id`),
  ADD KEY `idx_trip_id` (`trip_id`),
  ADD KEY `idx_bin_id` (`bin_id`),
  ADD KEY `idx_timestamp` (`timestamp`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`trip_id`),
  ADD UNIQUE KEY `trip_code` (`trip_code`),
  ADD KEY `idx_trip_code` (`trip_code`),
  ADD KEY `idx_bin_id` (`bin_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_time` (`start_time`),
  ADD KEY `idx_end_time` (`end_time`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `alert_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `bins`
--
ALTER TABLE `bins`
  MODIFY `bin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `bin_commands`
--
ALTER TABLE `bin_commands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `daily_statistics`
--
ALTER TABLE `daily_statistics`
  MODIFY `stat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `history_readings`
--
ALTER TABLE `history_readings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  MODIFY `maintenance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tracking_points`
--
ALTER TABLE `tracking_points`
  MODIFY `point_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`bin_id`) REFERENCES `bins` (`bin_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `alerts_ibfk_3` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `alerts_ibfk_4` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `history_readings`
--
ALTER TABLE `history_readings`
  ADD CONSTRAINT `history_readings_ibfk_1` FOREIGN KEY (`bin_id`) REFERENCES `bins` (`bin_id`) ON DELETE CASCADE;

--
-- Constraints for table `maintenance_records`
--
ALTER TABLE `maintenance_records`
  ADD CONSTRAINT `maintenance_records_ibfk_1` FOREIGN KEY (`bin_id`) REFERENCES `bins` (`bin_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_records_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `tracking_points`
--
ALTER TABLE `tracking_points`
  ADD CONSTRAINT `tracking_points_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tracking_points_ibfk_2` FOREIGN KEY (`bin_id`) REFERENCES `bins` (`bin_id`) ON DELETE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`bin_id`) REFERENCES `bins` (`bin_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
