<?php
// Mengatur header agar browser tidak menyimpan cache data ini
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");

// Mengatur tipe konten respon menjadi JSON
header('Content-Type: application/json');

// Mengizinkan akses dari semua domain atau origin
header('Access-Control-Allow-Origin: *');

// Mematikan tampilan error pada output respon
error_reporting(0);
ini_set('display_errors', 0);

// Memulai blok penanganan error utama
try {
    // Memanggil file konfigurasi koneksi database
    require_once __DIR__ . '/db.php';

    // Validasi apakah koneksi database berhasil dibuat
    if (!isset($pdo)) {
        throw new Exception('Database connection failed');
    }

    // Menghitung total jumlah data jurnal
    $stmtJournals = $pdo->query("SELECT COUNT(*) as total FROM journals");
    $totalJournals = $stmtJournals->fetch(PDO::FETCH_ASSOC)['total'];

    // Menghitung total jumlah data opini
    $stmtOpinions = $pdo->query("SELECT COUNT(*) as total FROM opinions");
    $totalOpinions = $stmtOpinions->fetch(PDO::FETCH_ASSOC)['total'];

    // Menghitung total tayangan atau views dari tabel jurnal
    // Menggunakan COALESCE agar menghasilkan 0 jika data kosong
    $stmtViewsJ = $pdo->query("SELECT COALESCE(SUM(views), 0) as total FROM journals");
    $viewsJournals = $stmtViewsJ->fetch(PDO::FETCH_ASSOC)['total'];

    // Menghitung total tayangan atau views dari tabel opini
    $stmtViewsO = $pdo->query("SELECT COALESCE(SUM(views), 0) as total FROM opinions");
    $viewsOpinions = $stmtViewsO->fetch(PDO::FETCH_ASSOC)['total'];

    // Menjumlahkan total tayangan dari jurnal dan opini
    $totalViews = $viewsJournals + $viewsOpinions;

    // Inisialisasi variabel total pengunjung
    $totalVisitors = 0;

    // Cek keberadaan tabel visitors sebelum melakukan query
    $checkTable = $pdo->query("SHOW TABLES LIKE 'visitors'");
    if ($checkTable->rowCount() > 0) {
        // Menghitung pengunjung unik berdasarkan alamat IP
        $stmtVisitors = $pdo->query("SELECT COUNT(DISTINCT ip_address) as total FROM visitors");
        $totalVisitors = $stmtVisitors->fetch(PDO::FETCH_ASSOC)['total'];
    }

    // Mengirimkan respon JSON berisi data statistik lengkap
    echo json_encode([
        'ok' => true,
        'stats' => [
            'total_journals' => (int)$totalJournals,
            'total_opinions' => (int)$totalOpinions,
            'total_articles' => (int)($totalJournals + $totalOpinions),
            'total_views' => (int)$totalViews,
            'total_visitors' => (int)$totalVisitors
        ]
    ]);
} catch (Exception $e) {
    // Mengatur kode respon menjadi 500 jika terjadi error
    http_response_code(500);

    // Mengirimkan pesan error dalam format JSON
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage()
    ]);
}
