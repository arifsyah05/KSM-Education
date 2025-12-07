<?php
// edit_journal.php

// Konfigurasi header dan izin akses CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tangani request pre-flight dari browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Hubungkan ke file database
require_once 'db.php';

try {
    // Ambil data JSON dari body request
    $input = json_decode(file_get_contents('php://input'), true);

    // Validasi apakah ID jurnal dikirim
    if (!isset($input['id'])) {
        throw new Exception('Journal ID required');
    }

    // Ambil variabel dari input dan set default value jika kosong
    $id = intval($input['id']);
    $title = $input['title'] ?? '';
    $abstract = $input['abstract'] ?? '';
    $authors = $input['authors'] ?? [];
    $tags = $input['tags'] ?? [];
    $pengurus = $input['pengurus'] ?? [];
    $email = $input['email'] ?? '';
    $contact = $input['contact'] ?? '';
    $volume = $input['volume'] ?? '';

    // Validasi field wajib diisi
    if (empty($title) || empty($abstract)) {
        throw new Exception('Title and abstract are required');
    }

    // Ubah data array menjadi format JSON string untuk disimpan di database
    $authorsJson = json_encode($authors);
    $tagsJson = json_encode($tags);
    $pengurusJson = json_encode($pengurus);

    // Siapkan query update data jurnal
    $stmt = $pdo->prepare("
        UPDATE journals 
        SET title = ?, 
            abstract = ?, 
            authors = ?, 
            tags = ?, 
            pengurus = ?, 
            email = ?, 
            contact = ?, 
            volume = ?, 
            updated_at = NOW()
        WHERE id = ?
    ");

    // Eksekusi query dengan parameter yang sesuai
    $stmt->execute([
        $title,
        $abstract,
        $authorsJson,
        $tagsJson,
        $pengurusJson,
        $email,
        $contact,
        $volume,
        $id
    ]);

    // Kirim respon sukses
    echo json_encode([
        'ok' => true,
        'message' => 'Journal updated successfully',
        'id' => $id
    ]);
} catch (Exception $e) {
    // Tangani error validasi atau database
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage()
    ]);
}
