<?php
// Mengatur tipe konten respon menjadi JSON
header('Content-Type: application/json');

// Mengizinkan akses dari semua domain atau origin
header('Access-Control-Allow-Origin: *');

// Menentukan metode HTTP yang diizinkan
header('Access-Control-Allow-Methods: POST, OPTIONS');

// Menentukan header request yang diizinkan
header('Access-Control-Allow-Headers: Content-Type');

// Menangani request preflight OPTIONS untuk CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Memanggil file konfigurasi koneksi database
require_once 'db.php';

// Memulai blok penanganan error
try {
    // Mengambil data JSON dari body request
    $data = json_decode(file_get_contents('php://input'), true);

    // Mengambil ID dan tipe konten, default tipe adalah journal
    $id = $data['id'] ?? null;
    $type = $data['type'] ?? 'journal';

    // Validasi keberadaan ID
    if (!$id) {
        throw new Exception('ID required');
    }

    // Menentukan nama tabel target (journals atau opinions)
    // Menggunakan ternary operator untuk keamanan dari SQL Injection
    $table = $type === 'journal' ? 'journals' : 'opinions';

    // Menyiapkan query update jumlah views
    // Nama tabel aman karena hasil validasi di atas
    $stmt = $pdo->prepare("UPDATE $table SET views = views + 1 WHERE id = ?");

    // Menjalankan query dengan parameter ID
    $stmt->execute([$id]);

    // Mengirimkan respon sukses
    echo json_encode(['ok' => true, 'message' => 'Views updated']);
} catch (Exception $e) {
    // Mengatur kode respon menjadi 500 jika terjadi error
    http_response_code(500);

    // Mengirimkan pesan error dalam format JSON
    echo json_encode(['ok' => false, 'message' => $e->getMessage()]);
}
