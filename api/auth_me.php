<?php
// auth_me.php

// Mulai atau lanjutkan sesi yang ada untuk membaca data session
session_start();

// Hubungkan ke file koneksi database
require_once __DIR__ . '/db.php';

// Cek apakah user_id tersedia di session (tandanya user sudah login)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['ok' => false, 'message' => 'not authenticated']);
    exit;
}

// Ambil data user terkini dari database berdasarkan ID yang ada di session
$stmt = $pdo->prepare("SELECT id, email, name, role FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

// Kirim respon sukses beserta data user yang ditemukan
echo json_encode(['ok' => true, 'user' => $user]);
