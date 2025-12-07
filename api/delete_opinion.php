<?php
// delete_opinion.php

// Hubungkan ke file konfigurasi database
require_once __DIR__ . '/db.php';

// Set header agar browser membaca output sebagai JSON
header('Content-Type: application/json');

// Cek method request, hanya izinkan method DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(['ok' => false, 'message' => 'Only DELETE allowed']);
    exit;
}

// Ambil data dari body request dan parse string-nya ke variabel array
parse_str(file_get_contents('php://input'), $del);

// Pastikan ID ada, lalu ubah tipe datanya menjadi integer
$id = isset($del['id']) ? (int)$del['id'] : 0;

// Validasi jika ID kosong atau nol
if (!$id) {
    echo json_encode(['ok' => false, 'message' => 'id required']);
    exit;
}

try {
    // Siapkan query untuk menghapus data opini berdasarkan ID
    $stmt = $pdo->prepare("DELETE FROM opinions WHERE id = ?");
    $stmt->execute([$id]);

    // Berikan respon sukses
    echo json_encode(['ok' => true, 'id' => $id]);
} catch (Exception $e) {
    // Tangani error jika terjadi masalah server atau database
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => $e->getMessage()]);
}
