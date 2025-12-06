<?php
// sync_push.php
require_once __DIR__ . '/db.php';

// Ambil data mentah dari body request
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validasi input pastikan data memiliki key changes
if (!$data || !isset($data['changes'])) {
    echo json_encode(['ok' => false, 'message' => 'Invalid']);
    exit;
}

$applied = [];

// Loop setiap item perubahan yang dikirim
foreach ($data['changes'] as $chg) {
    // Cek struktur data minimal tipe journal dan aksi create
    if ($chg['type'] === 'journal' && $chg['action'] === 'create') {
        $p = $chg['payload'];

        // Siapkan query insert menggunakan logika create journal
        $stmt = $pdo->prepare("INSERT INTO journals (title, abstract, file_upload_id, cover_upload_id, authors, tags, client_temp_id, client_updated_at) VALUES (?,?,?,?,?,?,?,?)");

        $file_upload_id = null;
        $cover_upload_id = null;

        // Cari ID upload untuk file dokumen jika ada URL
        if (!empty($p['fileUrl'])) {
            $s = $pdo->prepare("SELECT id FROM uploads WHERE url = ? LIMIT 1");
            $s->execute([$p['fileUrl']]);
            $r = $s->fetch();
            if ($r) $file_upload_id = $r['id'];
        }

        // Cari ID upload untuk cover gambar jika ada URL
        if (!empty($p['coverUrl'])) {
            $s = $pdo->prepare("SELECT id FROM uploads WHERE url = ? LIMIT 1");
            $s->execute([$p['coverUrl']]);
            $r = $s->fetch();
            if ($r) $cover_upload_id = $r['id'];
        }

        // Encode data array ke format JSON string
        $authors = isset($p['authors']) ? json_encode($p['authors']) : null;
        $tags = isset($p['tags']) ? json_encode($p['tags']) : null;

        // Eksekusi query insert dengan parameter yang disiapkan
        $stmt->execute([
            $p['title'] ?? '',
            $p['abstract'] ?? null,
            $file_upload_id,
            $cover_upload_id,
            $authors,
            $tags,
            $chg['client_id'] ?? null,
            $p['client_updated_at'] ?? null
        ]);

        // Ambil ID server yang baru saja dibuat
        $server_id = $pdo->lastInsertId();

        // Tambahkan ke daftar sukses
        $applied[] = [
            'client_id' => $chg['client_id'] ?? null,
            'status' => 'ok',
            'server_id' => $server_id
        ];
    } else {
        // Jika tipe atau aksi tidak dikenali
        $applied[] = [
            'client_id' => $chg['client_id'] ?? null,
            'status' => 'unsupported'
        ];
    }
}

// Kirim hasil sinkronisasi
echo json_encode(['ok' => true, 'applied' => $applied]);
