<?php
// Mengatur pelaporan error untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Mengatur tipe konten respon menjadi JSON
header('Content-Type: application/json');

// Mengizinkan akses dari semua domain
header('Access-Control-Allow-Origin: *');

// Memanggil file koneksi database
require_once __DIR__ . '/db.php';

// Validasi metode request harus POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Only POST allowed']);
    exit;
}

// Mengambil dan memvalidasi ID dari input
$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;

// Hentikan proses jika ID tidak valid
if (!$id) {
    echo json_encode(['ok' => false, 'message' => 'id required']);
    exit;
}

// Memulai blok try-catch untuk penanganan error
try {
    // Inisialisasi array untuk query update dan parameternya
    $updates = [];
    $params  = [];

    // Cek dan tambahkan field title jika ada
    if (!empty($_POST['title'])) {
        $updates[] = "title = ?";
        $params[]  = $_POST['title'];
    }

    // Cek dan tambahkan field abstract jika ada
    if (!empty($_POST['abstract'])) {
        $updates[] = "abstract = ?";
        $params[]  = $_POST['abstract'];
    }

    // Cek dan tambahkan field email jika ada
    if (!empty($_POST['email'])) {
        $updates[] = "email = ?";
        $params[]  = $_POST['email'];
    }

    // Cek dan tambahkan field contact jika ada
    if (!empty($_POST['contact'])) {
        $updates[] = "contact = ?";
        $params[]  = $_POST['contact'];
    }

    // Cek dan tambahkan field volume jika ada
    if (!empty($_POST['volume'])) {
        $updates[] = "volume = ?";
        $params[]  = $_POST['volume'];
    }

    // Proses field authors, decode jika string lalu encode kembali ke JSON
    if (isset($_POST['authors'])) {
        $authors = is_string($_POST['authors'])
            ? json_decode($_POST['authors'], true)
            : $_POST['authors'];

        if ($authors && is_array($authors)) {
            $updates[] = "authors = ?";
            $params[]  = json_encode($authors);
        }
    }

    // Proses field tags, decode jika string lalu encode kembali ke JSON
    if (isset($_POST['tags'])) {
        $tags = is_string($_POST['tags'])
            ? json_decode($_POST['tags'], true)
            : $_POST['tags'];

        if ($tags && is_array($tags)) {
            $updates[] = "tags = ?";
            $params[]  = json_encode($tags);
        }
    }

    // Proses field pengurus, decode jika string lalu encode kembali ke JSON
    if (isset($_POST['pengurus'])) {
        $pengurus = is_string($_POST['pengurus'])
            ? json_decode($_POST['pengurus'], true)
            : $_POST['pengurus'];

        if ($pengurus && is_array($pengurus)) {
            $updates[] = "pengurus = ?";
            $params[]  = json_encode($pengurus);
        }
    }

    // Proses upload file PDF jika ada file yang dikirim
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        // Tentukan direktori upload
        $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/ksmaja/uploads/';

        // Buat direktori jika belum ada
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // Sanitasi nama file agar aman dan unik
        $original_name = basename($_FILES['file']['name']);
        $file_name     = uniqid() . '_' . $original_name;
        $file_name     = str_replace(' ', '_', $file_name);
        $file_name     = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $file_name);

        // Path lengkap tujuan file
        $file_path = $upload_dir . $file_name;

        // Pindahkan file dari temp ke direktori tujuan
        if (move_uploaded_file($_FILES['file']['tmp_name'], $file_path)) {
            // Path relatif fisik file
            $file_url   = '/ksmaja/uploads/' . $file_name;
            // URL publik yang mengarah ke script serve_pdf.php
            $public_url = '/ksmaja/api/serve_pdf.php?file=' . urlencode($file_url);

            // Simpan data file baru ke tabel uploads
            $stmt = $pdo->prepare("INSERT INTO uploads (filename, url, created_at) VALUES (?, ?, NOW())");
            $stmt->execute([$file_name, $public_url]);

            // Ambil ID dari file yang baru diupload
            $file_upload_id = $pdo->lastInsertId();

            // Tambahkan ke array update
            $updates[] = "file_upload_id = ?";
            $params[]  = $file_upload_id;

            // Proses penghapusan file PDF lama
            $old = $pdo->prepare("SELECT file_upload_id FROM journals WHERE id = ?");
            $old->execute([$id]);
            $oldData = $old->fetch(PDO::FETCH_ASSOC);

            if ($oldData && $oldData['file_upload_id']) {
                $oldFile = $pdo->prepare("SELECT url FROM uploads WHERE id = ?");
                $oldFile->execute([$oldData['file_upload_id']]);
                $oldFileData = $oldFile->fetch(PDO::FETCH_ASSOC);

                if ($oldFileData && !empty($oldFileData['url'])) {
                    // Parsing URL lama untuk mengambil parameter file path fisik
                    $parts = parse_url($oldFileData['url']);
                    parse_str($parts['query'] ?? '', $q);
                    $oldRel = $q['file'] ?? null;

                    if ($oldRel) {
                        $oldFilePath = $_SERVER['DOCUMENT_ROOT'] . $oldRel;
                        // Hapus file fisik lama jika ada
                        if (file_exists($oldFilePath)) {
                            @unlink($oldFilePath);
                        }
                    }
                }
            }
        }
    }

    // Proses upload cover image jika ada file yang dikirim
    if (isset($_FILES['cover']) && $_FILES['cover']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/ksmaja/uploads/';

        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // Sanitasi nama file cover
        $original_cover = basename($_FILES['cover']['name']);
        $cover_name     = uniqid() . '_' . $original_cover;
        $cover_name     = str_replace(' ', '_', $cover_name);
        $cover_name     = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $cover_name);

        $cover_path = $upload_dir . $cover_name;

        // Pindahkan file cover
        if (move_uploaded_file($_FILES['cover']['tmp_name'], $cover_path)) {
            // Simpan data cover ke tabel uploads dengan URL langsung
            $stmt = $pdo->prepare(
                "INSERT INTO uploads (filename, url, created_at) VALUES (?, ?, NOW())"
            );
            $stmt->execute([$cover_name, '/ksmaja/uploads/' . $cover_name]);
            $cover_upload_id = $pdo->lastInsertId();

            // Tambahkan ke array update
            $updates[] = "cover_upload_id = ?";
            $params[]  = $cover_upload_id;

            // Proses penghapusan cover lama
            $old = $pdo->prepare("SELECT cover_upload_id FROM journals WHERE id = ?");
            $old->execute([$id]);
            $oldData = $old->fetch(PDO::FETCH_ASSOC);

            if ($oldData && $oldData['cover_upload_id']) {
                $oldCover = $pdo->prepare("SELECT url FROM uploads WHERE id = ?");
                $oldCover->execute([$oldData['cover_upload_id']]);
                $oldCoverData = $oldCover->fetch(PDO::FETCH_ASSOC);

                if ($oldCoverData && !empty($oldCoverData['url'])) {
                    $oldCoverPath = $_SERVER['DOCUMENT_ROOT'] . $oldCoverData['url'];
                    // Hapus file fisik cover lama
                    if (file_exists($oldCoverPath)) {
                        @unlink($oldCoverPath);
                    }
                }
            }
        }
    }

    // Eksekusi update database jika ada perubahan data
    if (!empty($updates)) {
        // Tambahkan waktu update
        $updates[] = "updated_at = NOW()";
        $params[]  = $id;

        // Susun dan jalankan query update
        $sql  = "UPDATE journals SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'ok'      => true,
            'id'      => $id,
            'message' => 'Journal updated successfully',
        ]);
    } else {
        // Kirim pesan jika tidak ada data yang diubah
        echo json_encode(['ok' => false, 'message' => 'No changes detected']);
    }
} catch (Exception $e) {
    // Tangani error server dan kirim respon 500
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => $e->getMessage()]);
}
