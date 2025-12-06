<?php
// Mengatur pelaporan error untuk keperluan debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Mengizinkan akses resource dari semua domain
header('Access-Control-Allow-Origin: *');

// Mengambil parameter path file dari URL
$file = isset($_GET['file']) ? $_GET['file'] : '';

// Validasi keamanan dasar untuk mencegah akses direktori yang tidak sah
if (!$file || strpos($file, '..') !== false) {
    http_response_code(403);
    echo 'Invalid file path';
    exit;
}

// Memastikan path file selalu mengarah ke struktur direktori yang benar
if (strpos($file, '/ksmaja/') !== 0) {
    // Menambahkan prefix direktori uploads jika input hanya nama file
    $file = '/ksmaja/uploads/' . ltrim($file, '/');
}

// Menentukan path lengkap lokasi file fisik di server
$filepath = $_SERVER['DOCUMENT_ROOT'] . $file;

// Cek apakah file fisik tersedia di server sebelum diproses
if (!file_exists($filepath)) {
    http_response_code(404);
    echo 'File not found: ' . htmlspecialchars($file);
    exit;
}

// Menghapus header tipe konten default jika ada
header_remove('Content-Type');

// Mengatur header tipe konten menjadi aplikasi PDF
header('Content-Type: application/pdf');

// Mengatur disposisi konten agar file tampil di browser dan tidak otomatis unduh
header('Content-Disposition: inline; filename="' . basename($filepath) . '"');

// Mengatur encoding transfer data menjadi biner
header('Content-Transfer-Encoding: binary');

// Mengizinkan browser meminta rentang byte tertentu untuk performa
header('Accept-Ranges: bytes');

// Mengirimkan informasi ukuran file ke browser
header('Content-Length: ' . filesize($filepath));

// Mencegah browser menebak tipe konten yang berbeda dari header
header('X-Content-Type-Options: nosniff');

// Membaca isi file dan mengirimkannya langsung ke output buffer
readfile($filepath);

// Menghentikan eksekusi script setelah file terkirim
exit;
