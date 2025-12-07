<?php

// Paksa browser untuk tidak menyimpan cache agar data selalu baru
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");

// Set header konten json
header('Content-Type: application/json');

// Konfigurasi error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    require_once __DIR__ . '/db.php';

    // Tentukan batas jumlah data dan offset halaman
    $limit = isset($_GET['limit']) ? min(100, (int)$_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    // Siapkan query untuk mengambil data jurnal pastikan volume terpilih
    $stmt = $pdo->prepare("
        SELECT 
            id, title, abstract, authors, email, contact, pengurus, volume, tags, views, created_at,
            file_upload_id, cover_upload_id
        FROM journals
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");

    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Loop setiap baris data untuk melengkapi URL file dan cover
    foreach ($rows as &$row) {
        // Ambil URL file dokumen jika ID tersedia
        if (!empty($row['file_upload_id'])) {
            $fileStmt = $pdo->prepare("SELECT url FROM uploads WHERE id = ?");
            $fileStmt->execute([$row['file_upload_id']]);
            $file = $fileStmt->fetch(PDO::FETCH_ASSOC);
            $row['file_url'] = $file ? $file['url'] : '';
        } else {
            $row['file_url'] = '';
        }

        // Ambil URL cover gambar jika ID tersedia
        if (!empty($row['cover_upload_id'])) {
            $coverStmt = $pdo->prepare("SELECT url FROM uploads WHERE id = ?");
            $coverStmt->execute([$row['cover_upload_id']]);
            $cover = $coverStmt->fetch(PDO::FETCH_ASSOC);
            $row['cover_url'] = $cover ? $cover['url'] : '';
        } else {
            $row['cover_url'] = '';
        }

        // Decode data JSON pengurus set array kosong jika null
        $row['pengurus'] = $row['pengurus'] ? json_decode($row['pengurus'], true) : [];

        // Hapus ID upload dari hasil akhir agar lebih bersih
        unset($row['file_upload_id']);
        unset($row['cover_upload_id']);
    }

    // Kirim respon sukses
    echo json_encode(['ok' => true, 'results' => $rows]);
} catch (Exception $e) {
    // Tangani error server
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage(),
        'error' => 'Database error'
    ]);
}
