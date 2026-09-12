<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Db;
use Labranza\Session;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($body['username'] ?? '');
$password = $body['password'] ?? '';

if (!$username || !$password) {
    http_response_code(422);
    echo json_encode(['error' => 'username and password are required']);
    exit;
}

$pdo = Db::connect();
$stmt = $pdo->prepare('SELECT id, restaurant_id, password_hash FROM admin_users WHERE username = :username');
$stmt->execute(['username' => $username]);
$admin = $stmt->fetch(\PDO::FETCH_ASSOC);

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

Session::login((int) $admin['id'], (int) $admin['restaurant_id']);
echo json_encode(['status' => 'ok']);
