<?php
// update_journal.php
require_once __DIR__ . '/db.php';
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(['ok'=>false,'message'=>'Only PUT allowed']); exit;
}

parse_str(file_get_contents('php://input'), $put);
$data = $put; 
// If JSON body:
$raw = file_get_contents('php://input');
$json = json_decode($raw, true);
if ($json) $data = $json;

$id = isset($data['id']) ? (int)$data['id'] : 0;
if (!$id) { echo json_encode(['ok'=>false,'message'=>'id required']); exit; }

$title = $data['title'] ?? null;
$abstract = $data['abstract'] ?? null;
$fileUrl = $data['fileUrl'] ?? null;
$coverUrl = $data['coverUrl'] ?? null;
$authors = isset($data['authors']) ? json_encode($data['authors']) : null;
$tags = isset($data['tags']) ? json_encode($data['tags']) : null;

function find_upload_id_local($pdo,$url){ if(!$url) return null; $s=$pdo->prepare("SELECT id FROM uploads WHERE url=? LIMIT 1"); $s->execute([$url]); $r=$s->fetch(); return $r?$r['id']:null; }

$file_upload_id = find_upload_id_local($pdo,$fileUrl);
$cover_upload_id = find_upload_id_local($pdo,$coverUrl);

$stmt = $pdo->prepare("UPDATE journals SET title = COALESCE(?, title), abstract = COALESCE(?, abstract), file_upload_id = COALESCE(?, file_upload_id), cover_upload_id = COALESCE(?, cover_upload_id), authors = COALESCE(?, authors), tags = COALESCE(?, tags), updated_at = NOW() WHERE id = ?");
$stmt->execute([$title, $abstract, $file_upload_id, $cover_upload_id, $authors, $tags, $id]);

echo json_encode(['ok'=>true,'id'=>$id]);
