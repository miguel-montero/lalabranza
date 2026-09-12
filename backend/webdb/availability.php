<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Capacity;
use Labranza\Db;

header('Content-Type: application/json');

$date = $_GET['date'] ?? null;
$timeSlot = $_GET['time_slot'] ?? null;

if (!$date || !$timeSlot || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(['error' => 'date (YYYY-MM-DD) and time_slot are required']);
    exit;
}

$pdo = Db::connect();

// v1 has exactly one restaurant, but every query is still scoped by
// restaurant_id per the spec's tenant-isolation rule.
$restaurantId = (int) $pdo->query("SELECT id FROM restaurants WHERE slug = 'la-labranza'")->fetchColumn();

$dayOfWeek = (int) date('w', strtotime($date));

$ruleStmt = $pdo->prepare(
    'SELECT max_covers FROM capacity_rules
     WHERE restaurant_id = :restaurant_id
       AND time_slot = :time_slot
       AND (date_override = :date OR (date_override IS NULL AND day_of_week = :day_of_week))
     ORDER BY date_override IS NULL ASC
     LIMIT 1',
);
$ruleStmt->execute([
    'restaurant_id' => $restaurantId,
    'time_slot' => $timeSlot,
    'date' => $date,
    'day_of_week' => $dayOfWeek,
]);
$maxCovers = $ruleStmt->fetchColumn();

if ($maxCovers === false) {
    echo json_encode(['remaining' => 0]);
    exit;
}

$reservationsStmt = $pdo->prepare(
    "SELECT party_size FROM reservations
     WHERE restaurant_id = :restaurant_id
       AND reservation_date = :date
       AND time_slot = :time_slot
       AND status != 'cancelled'",
);
$reservationsStmt->execute([
    'restaurant_id' => $restaurantId,
    'date' => $date,
    'time_slot' => $timeSlot,
]);
$existingPartySizes = array_map('intval', $reservationsStmt->fetchAll(\PDO::FETCH_COLUMN));

echo json_encode(['remaining' => Capacity::remaining((int) $maxCovers, $existingPartySizes)]);
