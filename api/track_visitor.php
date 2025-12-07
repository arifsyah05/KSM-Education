<?php
// track_visitor.php

// Matikan error reporting agar tidak merusak output JSON
error_reporting(0);
ini_set('display_errors', 0);

// Set header konten JSON dan izin akses CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/db.php';

    // Pastikan koneksi database berhasil
    if (!isset($pdo)) {
        throw new Exception('Database connection failed');
    }

    // Ambil informasi data pengunjung
    $ip = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $pageUrl = $_POST['page_url'] ?? $_SERVER['REQUEST_URI'] ?? '/';

    // Cek apakah tabel visitors ada di database
    $checkTable = $pdo->query("SHOW TABLES LIKE 'visitors'");
    if ($checkTable->rowCount() == 0) {
        echo json_encode(['ok' => false, 'message' => 'Table visitors not found']);
        exit;
    }

    // Cek apakah pengunjung sudah tercatat hari ini unik per hari
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("SELECT id FROM visitors 
                           WHERE ip_address = ? 
                           AND DATE(visited_at) = ? 
                           LIMIT 1");
    $stmt->execute([$ip, $today]);

    if ($stmt->rowCount() == 0) {
        // Pengunjung baru hari ini masukkan data ke database
        $stmtInsert = $pdo->prepare("INSERT INTO visitors (ip_address, user_agent, page_url) 
                                     VALUES (?, ?, ?)");
        $stmtInsert->execute([$ip, $userAgent, $pageUrl]);

        echo json_encode([
            'ok' => true,
            'message' => 'Visitor tracked',
            'new' => true,
            'ip' => $ip
        ]);
    } else {
        // Pengunjung sudah tercatat hari ini
        echo json_encode([
            'ok' => true,
            'message' => 'Already tracked today',
            'new' => false,
            'ip' => $ip
        ]);
    }
} catch (Exception $e) {
    // Tangani error server
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage()
    ]);
}
