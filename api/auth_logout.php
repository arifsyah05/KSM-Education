<?php
// auth_logout.php

// Mulai sesi untuk mengakses sesi yang sedang aktif saat ini
session_start();

// hapus semua data sesi yang tersimpan di server
session_destroy();

// Kirim respon JSON yang menandakan logout berhasil
echo json_encode(['ok' => true]);
