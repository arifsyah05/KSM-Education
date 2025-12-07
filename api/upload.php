<?php
// upload.php
require_once __DIR__ . '/db.php';

// Tentukan direktori penyimpanan file fisik
$uploadDir = __DIR__ . '/../../uploads';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

// Pastikan hanya method POST yang diizinkan
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Only POST allowed']);
    exit;
}

// Cek apakah file dikirim dalam request
if (!isset($_FILES['file'])) {
    echo json_encode(['ok' => false, 'message' => 'file not provided']);
    exit;
}

$file = $_FILES['file'];
$maxSize = 20 * 1024 * 1024; // Limit ukuran 20MB

// Validasi ukuran file
if ($file['size'] > $maxSize) {
    echo json_encode(['ok' => false, 'message' => 'File too large']);
    exit;
}

// Ambil ekstensi dan buat nama file baru yang aman
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$safeName = bin2hex(random_bytes(12)) . ($ext ? '.' . $ext : '');
$target = $uploadDir . '/' . $safeName;

// Pindahkan file dari folder sementara ke folder tujuan
if (!move_uploaded_file($file['tmp_name'], $target)) {
    echo json_encode(['ok' => false, 'message' => 'Cannot move uploaded file']);
    exit;
}

// Buat path URL publik sesuaikan jika proyek ada di subfolder
$publicUrl = '/uploads/' . $safeName;

// Ambil tipe mime dan ukuran file
$mime = $file['type'] ?? mime_content_type($target);
$size = (int)$file['size'];

// Simpan metadata file ke database
$stmt = $pdo->prepare("INSERT INTO uploads (filename, original_name, mime, size, url) VALUES (?,?,?,?,?)");
$stmt->execute([$safeName, $file['name'], $mime, $size, $publicUrl]);
$uploadId = $pdo->lastInsertId();

// Kirim respon sukses
echo json_encode(['ok' => true, 'id' => $uploadId, 'url' => $publicUrl]);
