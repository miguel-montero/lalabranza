<?php

namespace Labranza;

use PDO;
use PDOException;

final class Db
{
    private static ?PDO $connection = null;

    public static function connect(): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $configPath = __DIR__ . '/../config.php';
        if (!file_exists($configPath)) {
            throw new \RuntimeException(
                'backend/config.php not found. Copy config.example.php to config.php and fill in real credentials.',
            );
        }

        $config = require $configPath;

        try {
            self::$connection = new PDO(
                sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']),
                $config['db_user'],
                $config['db_pass'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
            );
        } catch (PDOException $e) {
            throw new \RuntimeException('Database connection failed: ' . $e->getMessage(), 0, $e);
        }

        return self::$connection;
    }
}
