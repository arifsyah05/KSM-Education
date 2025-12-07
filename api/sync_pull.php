<?php
// Mengatur tipe konten respon menjadi JSON
header('Content-Type: application/json');

// Memanggil file konfigurasi koneksi database
require_once __DIR__ . '/db.php';

// Mengambil parameter waktu 'since' dari URL jika ada
// Format yang diharapkan adalah YYYY-mm-dd HH:MM:SS
$since = isset($_GET['since']) ? $_GET['since'] : null;

// Cek kondisi apakah parameter waktu tersedia
if ($since) {
    // Jika ada parameter since, ambil data yang diperbarui setelah waktu tersebut
    // Menggunakan LEFT JOIN untuk mengambil URL file dan cover
    $stmt = $pdo->prepare("
        SELECT 
            j.*, 
            u.url as file_url, 
            c.url as cover_url 
        FROM journals j 
        LEFT JOIN uploads u ON u.id = j.file_upload_id 
        LEFT JOIN uploads c ON c.id = j.cover_upload_id 
        WHERE j.updated_at IS NOT NULL 
        AND j.updated_at > ? 
        ORDER BY j.updated_at ASC
    ");

    // Eksekusi query dengan parameter waktu
    $stmt->execute([$since]);
} else {
    // Jika tidak ada parameter since, ambil 200 data terbaru (initial sync)
    // Tetap menggunakan LEFT JOIN untuk kelengkapan data
    $stmt = $pdo->query("
        SELECT 
            j.*, 
            u.url as file_url, 
            c.url as cover_url 
        FROM journals j 
        LEFT JOIN uploads u ON u.id = j.file_upload_id 
        LEFT JOIN uploads c ON c.id = j.cover_upload_id 
        ORDER BY j.created_at DESC 
        LIMIT 200
    ");
}

// Mengambil seluruh hasil data sebagai array asosiatif
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mengirimkan respon data perubahan dalam format JSON
echo json_encode(['ok' => true, 'changes' => $rows]);
