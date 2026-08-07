-- MySQL dump for bimbel database (Updated Schema for Revisions)
CREATE DATABASE IF NOT EXISTS `bimbel` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bimbel`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'guru',
  `phone` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `les_categories`;
CREATE TABLE `les_categories` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `default_duration` int(11) NOT NULL DEFAULT 90,
  `fee_per_session` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `les_categories_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tutors`;
CREATE TABLE `tutors` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nip_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `rate_per_session` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tutors_nip_code_unique` (`nip_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_name` varchar(255) NOT NULL,
  `parent_phone` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_student_code_unique` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tutor_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `les_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 90,
  `subject` varchar(255) DEFAULT NULL,
  `fee_per_session` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendances_tutor_id_foreign` (`tutor_id`),
  KEY `attendances_student_id_foreign` (`student_id`),
  KEY `attendances_les_category_id_foreign` (`les_category_id`),
  CONSTRAINT `attendances_tutor_id_foreign` FOREIGN KEY (`tutor_id`) REFERENCES `tutors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_les_category_id_foreign` FOREIGN KEY (`les_category_id`) REFERENCES `les_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `total_sessions` int(11) NOT NULL DEFAULT 0,
  `fee_per_session` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `final_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('unpaid','paid') NOT NULL DEFAULT 'unpaid',
  `paid_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  KEY `invoices_student_id_foreign` (`student_id`),
  CONSTRAINT `invoices_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data Inserts
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin Bimbel', 'admin@bimbel.com', '$2y$12$xLncXjXjIUKbdbYdY2OfwumrAHTcsogB/k7FUw/Lfdharb7mk6ghu', 'admin', '081234567890', 'active', NOW(), NOW()),
(2, 'Guru Bimbel', 'guru@bimbel.com', '$2y$12$xLncXjXjIUKbdbYdY2OfwumrAHTcsogB/k7FUw/Lfdharb7mk6ghu', 'guru', '081299990000', 'active', NOW(), NOW());

INSERT INTO `les_categories` (`id`, `code`, `name`, `default_duration`, `fee_per_session`, `created_at`, `updated_at`) VALUES
(1, 'REG', 'Les Reguler', 90, 75000.00, NOW(), NOW()),
(2, 'PIH', 'Privat In House', 90, 150000.00, NOW(), NOW()),
(3, 'PIB', 'Privat In Bimbel', 60, 90000.00, NOW(), NOW());

INSERT INTO `tutors` (`id`, `nip_code`, `name`, `phone`, `specialization`, `rate_per_session`, `created_at`, `updated_at`) VALUES
(1, 'G2026001', 'Budi Santoso, S.Pd', '081299990001', 'Matematika & IPA', 100000.00, NOW(), NOW()),
(2, 'G2026002', 'Siti Aminah, M.Pd', '081299990002', 'Bahasa Inggris', 120000.00, NOW(), NOW());

INSERT INTO `students` (`id`, `student_code`, `name`, `parent_name`, `parent_phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'M2026001', 'Andi Wijaya', 'Bambang Wijaya', '08111111111', 'Jl. Mawar No. 12, Jakarta', NOW(), NOW()),
(2, 'M2026002', 'Citra Dewi', 'Hendra Dewi', '08122222222', 'Jl. Melati No. 45, Jakarta', NOW(), NOW()),
(3, 'M2026003', 'Doni Pratama', 'Eko Pratama', '08133333333', 'Jl. Anggrek No. 8, Jakarta', NOW(), NOW()),
(4, 'M2026004', 'Elisa Fitri', 'Gunawan Fitri', '08144444444', 'Jl. Flamboyan No. 20, Jakarta', NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
