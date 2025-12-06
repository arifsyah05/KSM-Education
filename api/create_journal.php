<?php
// create_journal.php

// 1. Konfigurasi & Koneksi Database
require_once __DIR__ . '/db.php';

// Atur konfigurasi error reporting (sembunyikan error dari output JSON)
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', '0');

// Set header konten agar browser tahu ini adalah respon JSON
header('Content-Type: application/json');

// 2. Validasi Method Request
// Pastikan endpoint ini hanya diakses via method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Only POST allowed']);
    exit;
}

try {
    // 3. Parsing & Validasi Input Data
    // Ambil raw data dari body request
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    // Cek validitas data, judul (title) wajib ada
    if (!$data || empty($data['title'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Invalid payload: title is required']);
        exit;
    }

    // Ekstrak variabel data sederhana
    $title = trim($data['title']);
    $abstract = $data['abstract'] ?? null;
    $fileUrl = $data['fileUrl'] ?? null;
    $coverUrl = $data['coverUrl'] ?? null;
    $email = $data['email'] ?? null;
    $contact = $data['contact'] ?? null;
    $volume = $data['volume'] ?? null;
    $client_temp_id = $data['client_temp_id'] ?? null;

    // Encode data array ke format JSON untuk disimpan di database
    $authors = isset($data['authors']) && is_array($data['authors']) ? json_encode($data['authors']) : null;
    $tags = isset($data['tags']) && is_array($data['tags']) ? json_encode($data['tags']) : null;
    $pengurus = isset($data['pengurus']) && is_array($data['pengurus']) ? json_encode($data['pengurus']) : null;

    // 4. Konversi Format Tanggal
    // Konversi tanggal dari format ISO 8601 (JS) ke MySQL DATETIME
    $client_updated_at = null;
    if (isset($data['client_updated_at'])) {
        try {
            $dt = new DateTime($data['client_updated_at']);
            $client_updated_at = $dt->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            // Jika gagal parse, gunakan waktu server saat ini dan catat error
            error_log("DateTime conversion error: " . $e->getMessage());
            $client_updated_at = date('Y-m-d H:i:s');
        }
    }

    // 5. Helper & Lookup ID Upload
    // Fungsi internal untuk mencari ID dari tabel uploads berdasarkan URL
    function find_upload_id($pdo, $url)
    {
        if (!$url) return null;
        try {
            $stmt = $pdo->prepare("SELECT id FROM uploads WHERE url = ? LIMIT 1");
            $stmt->execute([$url]);
            $r = $stmt->fetch();
            return $r ? (int)$r['id'] : null;
        } catch (Exception $e) {
            error_log("find_upload_id error: " . $e->getMessage());
            return null;
        }
    }

    // Cari ID untuk file PDF dan Cover image
    $file_upload_id = find_upload_id($pdo, $fileUrl);
    $cover_upload_id = find_upload_id($pdo, $coverUrl);

    // Validasi kritis: File utama harus sudah terupload dan ada di DB
    if (!$file_upload_id) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'message' => 'File upload not found in database',
            'debug' => ['fileUrl' => $fileUrl]
        ]);
        exit;
    }

    // 6. Eksekusi Database (Insert)
    // Siapkan query INSERT
    $stmt = $pdo->prepare("
        INSERT INTO journals (
            title, 
            abstract, 
            file_upload_id, 
            cover_upload_id, 
            authors, 
            tags, 
            pengurus,
            volume,
            email, 
            contact, 
            client_temp_id, 
            client_updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    // Jalankan query dengan parameter yang sudah disiapkan
    $result = $stmt->execute([
        $title,
        $abstract,
        $file_upload_id,
        $cover_upload_id,
        $authors,
        $tags,
        $pengurus,
        $volume,
        $email,
        $contact,
        $client_temp_id,
        $client_updated_at
    ]);

    if (!$result) {
        throw new Exception("Failed to insert journal into database");
    }

    // 7. Respon Sukses
    // Ambil ID dari data yang baru saja dimasukkan
    $id = $pdo->lastInsertId();

    echo json_encode([
        'ok' => true,
        'id' => (int)$id,
        'message' => 'Journal created successfully',
        'mapped' => [
            'client_temp_id' => $client_temp_id,
            'server_id' => (int)$id
        ]
    ]);
} catch (PDOException $e) {
    // 8. Error Handling Database
    error_log("Database error in create_journal.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
} catch (Exception $e) {
    // 9. Error Handling Umum
    error_log("Error in create_journal.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
