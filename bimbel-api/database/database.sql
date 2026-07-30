-- MySQL dump for bimbel database
-- Generated automatically from database.sqlite

CREATE DATABASE IF NOT EXISTS `bimbel` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bimbel`;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for `migrations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table structure for `password_reset_tokens`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `sessions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cache`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cache_locks`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `jobs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `job_batches`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `failed_jobs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `tutors`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tutors`;
CREATE TABLE `tutors` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `nip_code` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `rate_per_session` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tutors_nip_code_unique` (`nip_code`),
  KEY `tutors_user_id_foreign` (`user_id`),
  CONSTRAINT `tutors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `students`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_name` varchar(255) NOT NULL,
  `parent_phone` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `jenis_les` enum('reguler','privat_in_house','privat_in_bimbel') NOT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 90,
  `fee_per_session` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_student_code_unique` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `attendances`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tutor_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 90,
  `subject` varchar(255) NOT NULL,
  `topic` text DEFAULT NULL,
  `status` enum('hadir','izin','sakit','alpha') NOT NULL DEFAULT 'hadir',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendances_tutor_id_foreign` (`tutor_id`),
  KEY `attendances_student_id_foreign` (`student_id`),
  CONSTRAINT `attendances_tutor_id_foreign` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `invoices`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table structure for `personal_access_tokens`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Data for table `migrations`
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_30_000001_create_tutors_table', 1),
(5, '2026_07_30_000002_create_students_table', 1),
(6, '2026_07_30_000003_create_attendances_table', 1),
(7, '2026_07_30_000004_create_invoices_table', 1),
(8, '2026_07_30_121320_create_personal_access_tokens_table', 1);

-- Data for table `users`
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `phone`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin Bimbel', 'admin@bimbel.com', NULL, '$2y$12$xLncXjXjIUKbdbYdY2OfwumrAHTcsogB/k7FUw/Lfdharb7mk6ghu', 'admin', '081234567890', 'active', NULL, '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(2, 'Budi Santoso, S.Pd', 'budi@bimbel.com', NULL, '$2y$12$o3/SZsUqD04fsMZsXhyA6.zGtgBogQviDr9lOYKeX5Ml.L1EQEC8q', 'guru', '081299990001', 'active', NULL, '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(3, 'Siti Aminah, M.Pd', 'siti@bimbel.com', NULL, '$2y$12$y4dyQpDeuaRtOoPS29ED0eNpQY7deXXQuet1SpRkd/R0AWdFMMjVu', 'guru', '081299990002', 'active', NULL, '2026-07-30 12:15:42', '2026-07-30 12:15:42');

-- Data for table `sessions`
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('RAM1467vgKxlJAGGAgtvuUnxqzJWUGfx9lhj4N2d', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibVBDMENQMkU5SkFjMmRrWGxycFRkSWV5Uk9EQjhvOFpQelhlZkczOCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1785414106);

-- Data for table `tutors`
INSERT INTO `tutors` (`id`, `user_id`, `nip_code`, `specialization`, `rate_per_session`, `created_at`, `updated_at`) VALUES
(1, 2, 'G2026001', 'Matematika & IPA', 100000, '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(2, 3, 'G2026002', 'Bahasa Inggris', 120000, '2026-07-30 12:15:42', '2026-07-30 12:15:42');

-- Data for table `students`
INSERT INTO `students` (`id`, `student_code`, `name`, `parent_name`, `parent_phone`, `address`, `jenis_les`, `duration_minutes`, `fee_per_session`, `status`, `created_at`, `updated_at`) VALUES
(1, 'M2026001', 'Andi Wijaya', 'Bambang Wijaya', '08111111111', 'Jl. Mawar No. 12, Jakarta', 'reguler', 90, 75000, 'active', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(2, 'M2026002', 'Citra Dewi', 'Hendra Dewi', '08122222222', 'Jl. Melati No. 45, Jakarta', 'reguler', 90, 75000, 'active', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(3, 'M2026003', 'Doni Pratama', 'Eko Pratama', '08133333333', 'Jl. Anggrek No. 8, Jakarta', 'privat_in_house', 60, 100000, 'active', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(4, 'M2026004', 'Elisa Fitri', 'Gunawan Fitri', '08144444444', 'Jl. Flamboyan No. 20, Jakarta', 'privat_in_house', 90, 150000, 'active', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(5, 'M2026005', 'Farhan Rizky', 'Iwan Rizky', '08155555555', 'Jl. Kamboja No. 15, Jakarta', 'privat_in_bimbel', 60, 90000, 'active', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(6, 'M2026006', 'Gita Permata', 'Joko Permata', '08166666666', 'Jl. Kenanga No. 3, Jakarta', 'privat_in_bimbel', 90, 130000, 'active', '2026-07-30 12:15:42', '2026-07-30 12:15:42');

-- Data for table `attendances`
INSERT INTO `attendances` (`id`, `tutor_id`, `student_id`, `date`, `start_time`, `end_time`, `duration_minutes`, `subject`, `topic`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2026-07-25', '15:00', '16:30', 90, 'Matematika', 'Aljabar dan Persamaan Kuadrat', 'hadir', 'Murid paham materi dengan baik.', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(2, 2, 3, '2026-07-27', '16:00', '17:00', 60, 'Fisika', 'Hukum Newton & Gerak Lurus', 'hadir', 'Tatap muka di rumah murid.', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(3, 3, 2, '2026-07-28', '14:00', '15:30', 90, 'Bahasa Inggris', 'Grammar & Reading Comprehension', 'hadir', 'Latihan percakapan lancar.', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(4, 3, 4, '2026-07-29', '18:30', '20:00', 90, 'Bahasa Inggris', 'Tenses & Writing Essay', 'hadir', 'Selesai tepat waktu.', '2026-07-30 12:15:42', '2026-07-30 12:15:42');

-- Data for table `invoices`
INSERT INTO `invoices` (`id`, `invoice_number`, `student_id`, `month`, `year`, `total_sessions`, `fee_per_session`, `total_amount`, `discount`, `final_amount`, `status`, `paid_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'INV/2026/07/001', 1, 7, 2026, 4, 75000, 300000, 0, 300000, 'paid', '2026-07-30 12:15:42', 'Lunas via Transfer Bank', '2026-07-30 12:15:42', '2026-07-30 12:15:42'),
(2, 'INV/2026/07/002', 3, 7, 2026, 4, 100000, 400000, 20000, 380000, 'unpaid', NULL, 'Menunggu konfirmasi pembayaran', '2026-07-30 12:15:42', '2026-07-30 12:15:42');

SET FOREIGN_KEY_CHECKS = 1;
