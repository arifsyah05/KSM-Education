<?php
// auth_login.php
session_start();
require_once __DIR__ . '/db.php';

// Ambil data mentah dari input stream
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validasi input pastikan email dan password tidak kosong
if (!$data || empty($data['email']) || empty($data['password'])) {
    echo json_encode(['ok' => false, 'message' => 'Invalid']);
    exit;
}

// Cari data user di database berdasarkan email
$stmt = $pdo->prepare("SELECT id, password_hash, name, role FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$data['email']]);
$user = $stmt->fetch();

// Jika user tidak ditemukan, kirim respon error
if (!$user) {
    echo json_encode(['ok' => false, 'message' => 'User not found']);
    exit;
}

// Verifikasi password input dengan hash yang tersimpan
if (!password_verify($data['password'], $user['password_hash'])) {
    echo json_encode(['ok' => false, 'message' => 'Wrong password']);
    exit;
}

// Simpan ID user ke dalam sesi
$_SESSION['user_id'] = $user['id'];

// Kirim respon sukses beserta data user
echo json_encode(['ok' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']]]);
