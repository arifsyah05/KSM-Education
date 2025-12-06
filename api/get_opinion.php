<?php
// Mengatur tipe konten respon menjadi JSON
header('Content-Type: application/json');

// Mengizinkan akses dari semua domain atau origin
header('Access-Control-Allow-Origin: *');

// Menentukan metode HTTP yang diizinkan
header('Access-Control-Allow-Methods: GET, OPTIONS');

// Menentukan header request yang diizinkan
header('Access-Control-Allow-Headers: Content-Type');

// Menangani request preflight OPTIONS untuk CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Memanggil file konfigurasi koneksi database
require_once 'db.php';

// Memulai blok penanganan error utama
try {
    // Mengambil parameter ID dari URL dan memastikan tipe datanya integer
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    // Validasi jika ID tidak ditemukan atau bernilai 0
    if (!$id) {
        throw new Exception('Opinion ID is required');
    }

    // Mencatat log debug proses pengambilan data dimulai
    error_log("=== GET OPINION API ===");
    error_log("Opinion ID: $id");

    // Menyiapkan query untuk mengambil data opini digabung dengan tabel uploads
    // Menggunakan LEFT JOIN agar data tetap muncul meski tidak ada file atau cover
    $stmt = $pdo->prepare("
        SELECT 
            o.*,
            uf.url AS file_url,
            uc.url AS cover_url
        FROM opinions o
        LEFT JOIN uploads uf ON o.file_upload_id = uf.id
        LEFT JOIN uploads uc ON o.cover_upload_id = uc.id
        WHERE o.id = ?
    ");

    // Menjalankan query dengan parameter ID
    $stmt->execute([$id]);

    // Mengambil hasil data sebagai array asosiatif
    $opinion = $stmt->fetch(PDO::FETCH_ASSOC);

    // Cek jika data opini tidak ditemukan di database
    if (!$opinion) {
        error_log("Opinion not found with ID: $id");
        http_response_code(404);
        echo json_encode([
            'ok' => false,
            'message' => 'Opinion not found',
            'id' => $id
        ]);
        exit;
    }

    // Blok try catch terpisah untuk proses increment views agar tidak mengganggu flow utama
    try {
        // Query untuk menambah jumlah view sebanyak 1
        $updateStmt = $pdo->prepare("UPDATE opinions SET views = views + 1 WHERE id = ?");
        $updateStmt->execute([$id]);

        // Memperbarui nilai view di variabel array lokal
        $opinion['views'] = ($opinion['views'] ?? 0) + 1;
    } catch (Exception $e) {
        // Hanya mencatat log jika gagal update views tanpa menghentikan eksekusi
        error_log("Warning: Could not increment views: " . $e->getMessage());
    }

    // Mencatat log debug data berhasil ditemukan
    error_log("Opinion found: " . $opinion['title']);
    error_log("File URL: " . ($opinion['file_url'] ?? 'null'));
    error_log("Cover URL: " . ($opinion['cover_url'] ?? 'null'));

    // Mengirimkan respon sukses beserta data opini
    echo json_encode([
        'ok' => true,
        'result' => $opinion,
        'message' => 'Opinion retrieved successfully'
    ]);
} catch (Exception $e) {
    // Menangkap error global dan mencatat ke log server
    error_log('Get opinion error: ' . $e->getMessage());

    // Mengatur kode respon menjadi 500 Internal Server Error
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage(),
        'error' => $e->getMessage()
    ]);
}
