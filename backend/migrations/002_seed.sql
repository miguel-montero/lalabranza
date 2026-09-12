INSERT INTO restaurants (slug, name, address, phone, hours, default_locale)
VALUES (
  'la-labranza',
  'La Labranza',
  '[ADDRESS — REPLACE BEFORE LAUNCH]',
  '+56 [PHONE — REPLACE BEFORE LAUNCH]',
  'Seatings Thursday-Sunday, 1:00 PM and 8:00 PM',
  'en'
);

INSERT INTO admin_users (restaurant_id, username, password_hash)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'la-labranza'),
  'staff',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

INSERT INTO capacity_rules (restaurant_id, day_of_week, time_slot, max_covers, slot_length_minutes)
SELECT id, dow, slot, 24, 120
FROM restaurants
CROSS JOIN (SELECT 4 AS dow UNION SELECT 5 UNION SELECT 6 UNION SELECT 0) days
CROSS JOIN (SELECT '13:00:00' AS slot UNION SELECT '20:00:00') slots
WHERE slug = 'la-labranza';
