<?php
// delete_journal.php

// Konfigurasi header untuk format JSON dan izin akses CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tangani request pre-flight dari browser (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

try {
    // Variabel inisialisasi untuk menampung ID
    $id = null;

    // Metode 1: Ambil ID dari query string URL (contoh: ?id=123)
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    }

    // Metode 2: Ambil ID dari body request jika method POST
    if (!$id && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $postData = json_decode(file_get_contents('php://input'), true);
        if (isset($postData['id'])) {
            $id = $postData['id'];
        }
    }

    // Metode 3: Ambil ID dari body request jika method DELETE
    if (!$id && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $deleteData = json_decode(file_get_contents('php://input'), true);
        if (isset($deleteData['id'])) {
            $id = $deleteData['id'];
        }
    }

    // Validasi apakah ID berhasil ditemukan dari salah satu metode di atas
    if (!$id) {
        error_log('Delete journal error: No ID provided');
        error_log('GET params: ' . print_r($_GET, true));
        error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
        throw new Exception('ID required');
    }

    error_log('Attempting to delete journal with ID: ' . $id);

    // Cek dulu apakah data jurnal dengan ID tersebut ada di database
    $checkStmt = $pdo->prepare("SELECT id FROM journals WHERE id = ?");
    $checkStmt->execute([$id]);

    if ($checkStmt->rowCount() === 0) {
        throw new Exception('Journal not found');
    }

    // Eksekusi penghapusan data jurnal dari database
    $stmt = $pdo->prepare("DELETE FROM journals WHERE id = ?");
    $stmt->execute([$id]);

    // Cek apakah ada baris yang terpengaruh (terhapus)
    if ($stmt->rowCount() > 0) {
        error_log('Journal deleted successfully: ID ' . $id);
        echo json_encode([
            'ok' => true,
            'message' => 'Journal deleted successfully',
            'id' => $id
        ]);
    } else {
        throw new Exception('Failed to delete journal');
    }
} catch (Exception $e) {
    // Tangani error server atau database
    error_log('Delete journal error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage()
    ]);
}
