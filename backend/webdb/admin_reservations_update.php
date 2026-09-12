<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Db;
use Labranza\Session;

header('Content-Type: application/json');

$session = Session::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$id = isset($body['id']) ? (int) $body['id'] : null;
$status = $body['status'] ?? null;

if (!$id || !in_array($status, ['confirmed', 'cancelled'], true)) {
    http_response_code(422);
    echo json_encode(['error' => 'id and a valid status (confirmed|cancelled) are required']);
    exit;
}

try {
    $pdo = Db::connect();
    $stmt = $pdo->prepare(
        'UPDATE reservations SET status = :status WHERE id = :id AND restaurant_id = :restaurant_id',
    );
    $stmt->execute([
        'status' => $status,
        'id' => $id,
        'restaurant_id' => $session['restaurant_id'],
    ]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Reservation not found']);
        exit;
    }

    echo json_encode(['status' => 'ok']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
