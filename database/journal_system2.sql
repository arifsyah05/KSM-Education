-- database.sql

-- Set mode SQL untuk kompatibilitas dan handling error
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `journal_system2`
--

-- --------------------------------------------------------
-- 1. Tabel: drafts
-- Fungsinya: Menyimpan draft tulisan pengguna sebelum dipublish
-- --------------------------------------------------------
CREATE TABLE `drafts` (
  `id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `draft_type` enum('journal','opinion') NOT NULL,
  `draft_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 2. Tabel: journals
-- Fungsinya: Tabel utama data jurnal (Create & Get Journal API)
-- --------------------------------------------------------
CREATE TABLE `journals` (
  `id` int(11) NOT NULL,
  `title` varchar(512) NOT NULL,
  `abstract` text DEFAULT NULL,
  `file_upload_id` int(11) DEFAULT NULL, -- Relasi ke tabel uploads
  `cover_upload_id` int(11) DEFAULT NULL, -- Relasi ke tabel uploads
  `authors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `pengurus` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `volume` varchar(100) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `client_temp_id` varchar(255) DEFAULT NULL,
  `client_updated_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data untuk tabel journals
INSERT INTO `journals` (`id`, `title`, `abstract`, `file_upload_id`, `cover_upload_id`, `authors`, `tags`, `pengurus`, `email`, `contact`, `volume`, `views`, `client_temp_id`, `client_updated_at`, `created_at`, `updated_at`) VALUES
(8, 'Jurnal Agama baru edisi 3', 'wfewefewefew', 13, NULL, '[\"wgewgge\",\"q3r3r\"]', '[\"wewewe\"]', '[\"wgwgwge\"]', 'syahudhsdfnnf@gmail.com', '085712187668', 'Vol. 18 No. 102 (2024)', 1, 'upload_1764475423081', '2025-11-30 11:03:43', '2025-11-30 04:03:43', '2025-11-30 04:33:36'),
(11, 'Komputer grafk', 'feewwfew', 17, NULL, '[\"wefewf\"]', '[\"fqefwe\"]', '[\"wefwef\"]', 'syahudhsdfnnf@gmail.com', '085712187668', 'Vol. 18 No. 102 (2024)', 2, 'upload_1764514836984', '2025-11-30 22:00:36', '2025-11-30 15:00:36', NULL),
(12, 'jurnal agama 1', 'fwfewfwweef', 18, NULL, '[\"fewweffwe\"]', '[\"cffefwef\"]', '[\"ewfewew\"]', 'syahudhsdfnnf@gmail.com', '085712187668', 'Vol. 18 No. 102 (2024)', 6, 'upload_1764517436868', '2025-11-30 22:43:56', '2025-11-30 15:43:56', '2025-11-30 16:16:59'),
(14, 'testing nih bos', 'wgeeggewegge', 39, 22, '[\"wegweweg\"]', '[\"wgewgewge\"]', '[\"weegweggwewg\"]', 'syahudhsdfnnf@gmail.com', '085712187668', 'Vol. 18 No. 102 (2024)', 9, 'upload_1764519475900', '2025-11-30 23:17:55', '2025-11-30 16:17:55', '2025-12-01 12:25:12'),
(16, 'Komputer grafk', 'fefew', 38, 42, '[\"efeef\"]', '[\"pendidikan agama\"]', '[\"dfef\"]', 'syahudhsdfnnf@gmail.com', '085712187668', 'Vol. 18 No. 102 (2024)', 26, 'upload_1764584415127', '2025-12-01 17:20:15', '2025-12-01 10:20:15', '2025-12-01 14:58:38'),
(18, 'artikel aaaaa', 'ewfweffewf', 40, NULL, '[\"ewfefwe\"]', '[\"efwef\"]', '[\"ewefwef\"]', 'syahudhsdfnnf@gmail.com', '085712187668', 'Vol. 18 No. 102 (2024)', 9, 'upload_1764592899080', '2025-12-01 19:41:39', '2025-12-01 12:41:39', NULL),
(19, 'jurnal agama', 'efefewfwefwe', 41, NULL, '[\"effewef\"]', '[\"pendidikan agama\"]', '[\"arif\"]', 'syahudhsdfnnf@gmail.com', '085712187668', 'Vol. 18 No. 102 (2024)', 25, 'upload_1764599272384', '2025-12-01 21:27:52', '2025-12-01 14:27:52', NULL);

-- --------------------------------------------------------
-- 3. Tabel: opinions
-- Fungsinya: Tabel data opini/berita (Get Opinions API)
-- --------------------------------------------------------
CREATE TABLE `opinions` (
  `id` int(11) NOT NULL,
  `title` varchar(512) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT 'opini',
  `author_name` varchar(255) NOT NULL DEFAULT 'Anonymous',
  `file_upload_id` int(11) DEFAULT NULL,
  `cover_upload_id` int(11) DEFAULT NULL,
  `authors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `client_temp_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `views` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 4. Tabel: sync_queue
-- Fungsinya: Antrean data untuk fitur sinkronisasi offline-online
-- --------------------------------------------------------
CREATE TABLE `sync_queue` (
  `id` int(11) NOT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 5. Tabel: uploads
-- Fungsinya: Menyimpan path URL file dan metadata (Upload API)
-- --------------------------------------------------------
CREATE TABLE `uploads` (
  `id` int(11) NOT NULL,
  `filename` varchar(512) NOT NULL,
  `original_name` varchar(512) DEFAULT NULL,
  `mime` varchar(100) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `url` varchar(1024) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data untuk tabel uploads
INSERT INTO `uploads` (`id`, `filename`, `original_name`, `mime`, `size`, `url`, `created_at`) VALUES
(12, '703ff59f2bf01e934e29e217.pdf', 'DOC-20251025-WA0002. (1).pdf', 'application/pdf', 2512502, '/uploads/703ff59f2bf01e934e29e217.pdf', '2025-11-29 09:20:51'),
(13, '22e791336afbd82b21888b49.pdf', 'DOC-20251025-WA0002..pdf', 'application/pdf', 2512502, '/uploads/22e791336afbd82b21888b49.pdf', '2025-11-30 04:03:43'),
(14, 'd2c61d263abcf08626504344.pdf', 'M_Arif Syahrudin_241011400651.pdf', 'application/pdf', 85761, '/uploads/d2c61d263abcf08626504344.pdf', '2025-11-30 04:34:56'),
(15, '02a17f3eecead6296c0f03c9.pdf', 'KUIS_STRUKDAT_MUHMMAD_ARIF_SYAHRUDIN_03TPLP016.pdf', 'application/pdf', 240891, '/uploads/02a17f3eecead6296c0f03c9.pdf', '2025-11-30 04:37:21'),
(16, '391e81994f8e5ebb2443d057.png', 'jour.png', 'image/png', 502665, '/uploads/391e81994f8e5ebb2443d057.png', '2025-11-30 04:37:21'),
(17, 'e3b7d4f344e65dbc3b4a98a3.pdf', 'DOC-20251025-WA0002. (1).pdf', 'application/pdf', 2512502, '/uploads/e3b7d4f344e65dbc3b4a98a3.pdf', '2025-11-30 15:00:36'),
(18, 'cab2fe0fdb7f54d29f32492d.pdf', 'DOKUMENTAIS PERTEMUAN 14 - M ARIF SYAHRUDIN.pdf', 'application/pdf', 440819, '/uploads/cab2fe0fdb7f54d29f32492d.pdf', '2025-11-30 15:43:56'),
(19, 'd85971a8ba8a27b29cc6fb9e.pdf', 'TUGAS P14 STRUKT DATA ARIF 016.pdf', 'application/pdf', 216969, '/uploads/d85971a8ba8a27b29cc6fb9e.pdf', '2025-11-30 16:17:26'),
(20, 'a9e95f5e8396f30567d65ff3.pdf', 'TUGAS STRUKTUR PERTEMUAN 8-9 Arif.pdf', 'application/pdf', 387792, '/uploads/a9e95f5e8396f30567d65ff3.pdf', '2025-11-30 16:17:55'),
(21, 'efc04b3d27ce09394f42da2d.pdf', 'TUGAS P16 STRUKT DATA ARIF 016.pdf', 'application/pdf', 203140, '/uploads/efc04b3d27ce09394f42da2d.pdf', '2025-11-30 16:18:21'),
(22, '692d3a7220ffe_692d39b646c59_jour.png', NULL, NULL, NULL, '/ksmaja/uploads/692d3a7220ffe_692d39b646c59_jour.png', '2025-12-01 06:49:22'),
(23, '692d3a7dad5f1_692d3650cbdbe_TUGAS P13 STRUKT DATA ARIF 016 MUSIC PLAYER.pdf', NULL, NULL, NULL, '/ksmaja/uploads/692d3a7dad5f1_692d3650cbdbe_TUGAS P13 STRUKT DATA ARIF 016 MUSIC PLAYER.pdf', '2025-12-01 06:49:33'),
(24, '692d3cd37cc63_692d3a7dad5f1_692d3650cbdbe_TUGAS P13 STRUKT DATA ARIF 016 MUSIC PLAYER.pdf', NULL, NULL, NULL, '/ksmaja/uploads/692d3cd37cc63_692d3a7dad5f1_692d3650cbdbe_TUGAS P13 STRUKT DATA ARIF 016 MUSIC PLAYER.pdf', '2025-12-01 06:59:31'),
(25, '692d3f46eb685_TUGAS_STRUKTUR_PERTEMUAN_8-9_Arif.pdf', NULL, NULL, NULL, '/ksmaja/uploads/692d3f46eb685_TUGAS_STRUKTUR_PERTEMUAN_8-9_Arif.pdf', '2025-12-01 07:09:58'),
(26, '692d3f46ef477_9c9e902b-1a24-4992-b5ff-1ba793f64ac0__1_.jpeg', NULL, NULL, NULL, '/ksmaja/uploads/692d3f46ef477_9c9e902b-1a24-4992-b5ff-1ba793f64ac0__1_.jpeg', '2025-12-01 07:09:58'),
(27, '692d402332be6_TUGAS_STRUKTUR_PERTEMUAN_8-9_Arif.pdf', NULL, NULL, NULL, '/ksmaja/uploads/692d402332be6_TUGAS_STRUKTUR_PERTEMUAN_8-9_Arif.pdf', '2025-12-01 07:13:39'),
(28, '692d402339ef4_9c9e902b-1a24-4992-b5ff-1ba793f64ac0__1_.jpeg', NULL, NULL, NULL, '/ksmaja/uploads/692d402339ef4_9c9e902b-1a24-4992-b5ff-1ba793f64ac0__1_.jpeg', '2025-12-01 07:13:39'),
(29, '692d45a040757_m_arif_syahrudin.png', NULL, NULL, NULL, '/ksmaja/uploads/692d45a040757_m_arif_syahrudin.png', '2025-12-01 07:37:04'),
(30, '9fb530eec4e12020712b0472.pdf', 'TUGAS STRUKTUR PERTEMUAN 8-9 Arif.pdf', 'application/pdf', 387792, '/uploads/9fb530eec4e12020712b0472.pdf', '2025-12-01 10:20:15'),
(31, '416aaea3738cdc2c508a0e72.pdf', 'KELOMPOK 1 BINARY SEARCH.pdf', 'application/pdf', 1029844, '/uploads/416aaea3738cdc2c508a0e72.pdf', '2025-12-01 10:21:12'),
(32, 'cf34a15c345d3e4e452268cd.jpeg', '9c9e902b-1a24-4992-b5ff-1ba793f64ac0 (1).jpeg', 'image/jpeg', 62676, '/uploads/cf34a15c345d3e4e452268cd.jpeg', '2025-12-01 10:21:12'),
(33, '692d6cf1cf76e_jour.png', NULL, NULL, NULL, '/ksmaja/uploads/692d6cf1cf76e_jour.png', '2025-12-01 10:24:49'),
(34, '692d6d1ee67b7_DOKUMENTAIS_PERTEMUAN_14_-_M_ARIF_SYAHRUDIN.pdf', NULL, NULL, NULL, '/ksmaja/uploads/692d6d1ee67b7_DOKUMENTAIS_PERTEMUAN_14_-_M_ARIF_SYAHRUDIN.pdf', '2025-12-01 10:25:34'),
(35, '692d7af13ca06_jour.png', NULL, NULL, NULL, '/ksmaja/uploads/692d7af13ca06_jour.png', '2025-12-01 11:24:33'),
(38, '692d86c5da928_M_ARIF_SYAHRUDIN_241011400651.pdf', NULL, NULL, NULL, '/ksmaja/api/serve_pdf.php?file=%2Fksmaja%2Fuploads%2F692d86c5da928_M_ARIF_SYAHRUDIN_241011400651.pdf', '2025-12-01 12:15:01'),
(39, '692d8928b567b_MuhammadArifSyahrudin.pdf', NULL, NULL, NULL, '/ksmaja/api/serve_pdf.php?file=%2Fksmaja%2Fuploads%2F692d8928b567b_MuhammadArifSyahrudin.pdf', '2025-12-01 12:25:12'),
(40, '976464ab988726bc9386aa48.pdf', 'DOC-20251025-WA0002. (1).pdf', 'application/pdf', 2512502, '/uploads/976464ab988726bc9386aa48.pdf', '2025-12-01 12:41:39'),
(41, 'ac4ab23dd7a0a40ba36ca04c.pdf', 'DOC-20251025-WA0002..pdf', 'application/pdf', 2512502, '/uploads/ac4ab23dd7a0a40ba36ca04c.pdf', '2025-12-01 14:27:52'),
(42, '692dad1e28677_9c9e902b-1a24-4992-b5ff-1ba793f64ac0__1_.jpeg', NULL, NULL, NULL, '/ksmaja/uploads/692dad1e28677_9c9e902b-1a24-4992-b5ff-1ba793f64ac0__1_.jpeg', '2025-12-01 14:58:38'),
(43, 'e54506579674fdaeef8f7d5a.pdf', 'DOC-20251025-WA0002..pdf', 'application/pdf', 2512502, '/uploads/e54506579674fdaeef8f7d5a.pdf', '2025-12-01 14:59:13');

-- --------------------------------------------------------
-- 6. Tabel: users
-- Fungsinya: Data pengguna dan otentikasi login
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 7. Tabel: user_preferences
-- Fungsinya: Menyimpan preferensi khusus per pengguna
-- --------------------------------------------------------
CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `preference_key` varchar(100) NOT NULL,
  `preference_value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 8. Tabel: visitors
-- Fungsinya: Mencatat statistik pengunjung unik (Track Visitor API)
-- --------------------------------------------------------
CREATE TABLE `visitors` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `page_url` varchar(255) DEFAULT NULL,
  `visited_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data untuk tabel visitors
INSERT INTO `visitors` (`id`, `ip_address`, `user_agent`, `page_url`, `visited_at`) VALUES
(1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '/ksmaja/api/track_visitor.php', '2025-11-28 14:50:07'),
(2, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '/ksmaja/dashboard_admin.html', '2025-11-29 04:49:13'),
(3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '/ksmaja/', '2025-11-30 01:18:41'),
(4, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '/ksmaja/', '2025-11-30 01:18:41'),
(5, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '/ksmaja/dashboard_admin.html', '2025-12-01 04:43:38'),
(6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '/ksmaja/dashboard_admin.html', '2025-12-02 00:41:12'),
(7, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/ksmaja/dashboard_admin.html', '2025-12-06 11:50:58'),
(8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/ksmaja/dashboard_admin.html', '2025-12-06 11:50:58');

-- --------------------------------------------------------
-- Konfigurasi Index dan Key
-- --------------------------------------------------------

-- Indexes for table `drafts`
ALTER TABLE `drafts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`user_email`,`draft_type`);

-- Indexes for table `journals`
ALTER TABLE `journals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `file_upload_id` (`file_upload_id`),
  ADD KEY `cover_upload_id` (`cover_upload_id`);

-- Indexes for table `opinions`
ALTER TABLE `opinions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `file_upload_id` (`file_upload_id`),
  ADD KEY `cover_upload_id` (`cover_upload_id`),
  ADD KEY `idx_category` (`category`);

-- Indexes for table `sync_queue`
ALTER TABLE `sync_queue`
  ADD PRIMARY KEY (`id`);

-- Indexes for table `uploads`
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`id`);

-- Indexes for table `users`
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

-- Indexes for table `user_preferences`
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_pref` (`user_email`,`preference_key`);

-- Indexes for table `visitors`
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ip_date` (`ip_address`,`visited_at`);

-- --------------------------------------------------------
-- Konfigurasi Auto Increment
-- --------------------------------------------------------

ALTER TABLE `drafts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `journals` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
ALTER TABLE `opinions` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `sync_queue` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `uploads` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;
ALTER TABLE `users` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `user_preferences` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `visitors` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

-- --------------------------------------------------------
-- Konfigurasi Foreign Key (Constraints)
-- --------------------------------------------------------

-- Constraints for table `journals`
ALTER TABLE `journals`
  ADD CONSTRAINT `journals_ibfk_1` FOREIGN KEY (`file_upload_id`) REFERENCES `uploads` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `journals_ibfk_2` FOREIGN KEY (`cover_upload_id`) REFERENCES `uploads` (`id`) ON DELETE SET NULL;

-- Constraints for table `opinions`
ALTER TABLE `opinions`
  ADD CONSTRAINT `opinions_ibfk_1` FOREIGN KEY (`file_upload_id`) REFERENCES `uploads` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `opinions_ibfk_2` FOREIGN KEY (`cover_upload_id`) REFERENCES `uploads` (`id`) ON DELETE SET NULL;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;