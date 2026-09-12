<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Capacity;
use Labranza\Db;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];

$date = $body['date'] ?? null;
$timeSlot = $body['time_slot'] ?? null;
$partySize = isset($body['party_size']) ? (int) $body['party_size'] : null;
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$phone = trim($body['phone'] ?? '');
$notes = trim($body['notes'] ?? '');

if (
    !$date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)
    || !$timeSlot
    || !$partySize || $partySize < 1
    || !$name
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || !$phone
) {
    http_response_code(422);
    echo json_encode(['error' => 'Missing or invalid reservation fields']);
    exit;
}

$pdo = Db::connect();
$restaurantId = (int) $pdo->query("SELECT id FROM restaurants WHERE slug = 'la-labranza'")->fetchColumn();

$pdo->beginTransaction();

try {
    // Re-check capacity inside the transaction with a row lock on the
    // capacity rule, so two concurrent requests can't both succeed past
    // the limit.
    $dayOfWeek = (int) date('w', strtotime($date));
    $ruleStmt = $pdo->prepare(
        'SELECT max_covers FROM capacity_rules
         WHERE restaurant_id = :restaurant_id
           AND time_slot = :time_slot
           AND (date_override = :date OR (date_override IS NULL AND day_of_week = :day_of_week))
         ORDER BY date_override IS NULL ASC
         LIMIT 1 FOR UPDATE',
    );
    $ruleStmt->execute([
        'restaurant_id' => $restaurantId,
        'time_slot' => $timeSlot,
        'date' => $date,
        'day_of_week' => $dayOfWeek,
    ]);
    $maxCovers = $ruleStmt->fetchColumn();

    if ($maxCovers === false) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'No availability for that date/time']);
        exit;
    }

    $existingStmt = $pdo->prepare(
        "SELECT party_size FROM reservations
         WHERE restaurant_id = :restaurant_id
           AND reservation_date = :date
           AND time_slot = :time_slot
           AND status != 'cancelled'
         FOR UPDATE",
    );
    $existingStmt->execute([
        'restaurant_id' => $restaurantId,
        'date' => $date,
        'time_slot' => $timeSlot,
    ]);
    $existingPartySizes = array_map('intval', $existingStmt->fetchAll(\PDO::FETCH_COLUMN));

    $remaining = Capacity::remaining((int) $maxCovers, $existingPartySizes);

    if ($remaining < $partySize) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'Not enough remaining capacity for that party size']);
        exit;
    }

    $insertStmt = $pdo->prepare(
        "INSERT INTO reservations
            (restaurant_id, name, email, phone, party_size, reservation_date, time_slot, status, notes)
         VALUES
            (:restaurant_id, :name, :email, :phone, :party_size, :date, :time_slot, 'pending', :notes)",
    );
    $insertStmt->execute([
        'restaurant_id' => $restaurantId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'party_size' => $partySize,
        'date' => $date,
        'time_slot' => $timeSlot,
        'notes' => $notes ?: null,
    ]);

    $id = (int) $pdo->lastInsertId();
    $pdo->commit();

    echo json_encode(['status' => 'pending', 'id' => $id]);
} catch (\Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not create reservation']);
}
