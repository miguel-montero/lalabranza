<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Db;
use Labranza\Session;

header('Content-Type: application/json');

$session = Session::requireAdmin();

try {
    $pdo = Db::connect();

    $stmt = $pdo->prepare(
        'SELECT id, name, email, phone, party_size, reservation_date, time_slot, status, notes
         FROM reservations
         WHERE restaurant_id = :restaurant_id
           AND reservation_date >= CURDATE()
         ORDER BY reservation_date ASC, time_slot ASC',
    );
    $stmt->execute(['restaurant_id' => $session['restaurant_id']]);

    echo json_encode(['reservations' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
