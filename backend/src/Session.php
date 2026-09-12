<?php

namespace Labranza;

final class Session
{
    public static function start(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            // TODO: set 'secure' => true once served over HTTPS in production —
            // omitted here since local dev uses plain HTTP.
            session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
            session_start();
        }
    }

    public static function login(int $adminUserId, int $restaurantId): void
    {
        self::start();
        $_SESSION['admin_user_id'] = $adminUserId;
        $_SESSION['restaurant_id'] = $restaurantId;
    }

    public static function logout(): void
    {
        self::start();
        $_SESSION = [];
        session_destroy();
    }

    /**
     * @return array{admin_user_id: int, restaurant_id: int}
     */
    public static function requireAdmin(): array
    {
        self::start();
        if (!isset($_SESSION['admin_user_id'], $_SESSION['restaurant_id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Not authenticated']);
            exit;
        }

        return [
            'admin_user_id' => $_SESSION['admin_user_id'],
            'restaurant_id' => $_SESSION['restaurant_id'],
        ];
    }
}
