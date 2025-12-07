<?php
// create_opinion.php

// Konfigurasi header HTTP dan CORS untuk mengizinkan akses dari frontend
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tangani pre-flight request untuk CORS (browser check)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Hubungkan ke file koneksi database
require_once 'db.php';

try {
    // Ambil dan decode data JSON dari input stream
    $input = json_decode(file_get_contents('php://input'), true);

    // Log data input untuk keperluan debugging di server log
    error_log("=== CREATE OPINION API ===");
    error_log("Input: " . json_encode($input));

    // Ekstrak data field dari input JSON dengan nilai default
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $category = $input['category'] ?? 'opini';
    // Handle berbagai kemungkinan key untuk nama penulis
    $author_name = $input['authorname'] ?? $input['author_name'] ?? $input['authorName'] ?? '';

    // Inisialisasi variabel ID upload
    $file_upload_id = null;
    $cover_upload_id = null;

    // Cari ID file dokumen di database berdasarkan URL jika ada
    if (isset($input['fileUrl'])) {
        $fileUrl = $input['fileUrl'];
        $stmt = $pdo->prepare("SELECT id FROM uploads WHERE url = ?");
        $stmt->execute([$fileUrl]);
        $fileUpload = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($fileUpload) {
            $file_upload_id = $fileUpload['id'];
        }
        error_log("File URL: $fileUrl -> Upload ID: " . ($file_upload_id ?? 'not found'));
    }

    // Cari ID cover gambar di database berdasarkan URL jika ada
    if (isset($input['coverUrl'])) {
        $coverUrl = $input['coverUrl'];
        $stmt = $pdo->prepare("SELECT id FROM uploads WHERE url = ?");
        $stmt->execute([$coverUrl]);
        $coverUpload = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($coverUpload) {
            $cover_upload_id = $coverUpload['id'];
        }
        error_log("Cover URL: $coverUrl -> Upload ID: " . ($cover_upload_id ?? 'not found'));
    }

    // Validasi field wajib diisi (Judul dan Penulis)
    if (!$title || !$author_name) {
        throw new Exception('Title and author name are required');
    }

    // Log data yang akan dimasukkan ke database
    error_log("Inserting: title=$title, author=$author_name, file_id=$file_upload_id, cover_id=$cover_upload_id");

    // Siapkan query insert ke tabel opinions
    $stmt = $pdo->prepare("
        INSERT INTO opinions (title, description, category, author_name, file_upload_id, cover_upload_id, views)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    ");

    // Eksekusi query dengan data yang sudah disiapkan
    $stmt->execute([
        $title,
        $description,
        $category,
        $author_name,
        $file_upload_id,
        $cover_upload_id
    ]);

    // Ambil ID dari data yang baru saja dibuat
    $id = $pdo->lastInsertId();

    error_log("✅ Opinion created with ID: $id");

    // Kirim respon sukses ke client
    echo json_encode([
        'ok' => true,
        'id' => (int)$id,
        'message' => 'Opinion created successfully'
    ]);
} catch (Exception $e) {
    // Tangani error, catat di log, dan kirim respon gagal
    error_log('❌ Create opinion error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage(),
        'error' => $e->getMessage()
    ]);
}
