<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Session;

header('Content-Type: application/json');
Session::logout();
echo json_encode(['status' => 'ok']);
