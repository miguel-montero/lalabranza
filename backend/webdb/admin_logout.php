<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Session;

header('Content-Type: application/json');

try {
    Session::logout();
    echo json_encode(['status' => 'ok']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
