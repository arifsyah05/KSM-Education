<?php
// File delete_upload.php

// Panggil file koneksi database
require_once __DIR__ . '/db.php';

// Cek apakah request method bukan POST, jika ya hentikan proses
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Only POST']);
    exit;
}

// Ambil raw data input dari request body
$raw = file_get_contents('php://input');

// Decode data JSON menjadi array
$data = json_decode($raw, true);

// Validasi apakah data kosong atau ID tidak tersedia
if (!$data || !isset($data['id'])) {
    echo json_encode(['ok' => false, 'message' => 'id required']);
    exit;
}

// Casting ID menjadi integer untuk keamanan
$id = (int)$data['id'];

// Siapkan query untuk mengambil nama file berdasarkan ID
$stmt = $pdo->prepare("SELECT filename FROM uploads WHERE id = ? LIMIT 1");
$stmt->execute([$id]);
$r = $stmt->fetch();

// Cek jika data upload tidak ditemukan di database
if (!$r) {
    echo json_encode(['ok' => false, 'message' => 'upload not found']);
    exit;
}

// Simpan nama file ke variabel
$filename = $r['filename'];

// Tentukan path lengkap lokasi file fisik
$path = __DIR__ . '/../../uploads/' . $filename;

// Cek jika file fisik ada, lalu hapus file tersebut
if (is_file($path)) unlink($path);

// Hapus record data dari tabel database
$pdo->prepare("DELETE FROM uploads WHERE id = ?")->execute([$id]);

// Kirim respon JSON menandakan proses berhasil
echo json_encode(['ok' => true, 'id' => $id]);
