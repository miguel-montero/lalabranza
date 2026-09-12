INSERT INTO restaurants (slug, name, address, phone, hours, default_locale)
VALUES (
  'la-labranza',
  'La Labranza',
  'Sector D 431, Los Muñoces, Isla de Maipo, Región Metropolitana, Chile',
  '+56 [PHONE — REPLACE BEFORE LAUNCH]',
  'Seatings Monday-Friday, 11:00 AM and 2:00 PM',
  'en'
);

INSERT INTO admin_users (restaurant_id, username, password_hash)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'la-labranza'),
  'staff',
  '$2y$12$WXjf.0XcQYHDsuadIy/7uOeG9A2jCsM8h1/gj/1BEOE5MZcBnP3Ge'
);

-- Monday-Friday (day_of_week 1-5), two placeholder seatings (11:00/14:00)
-- within the confirmed 10:00-17:00 window — exact seating times pending
-- confirmation. Keep in sync with frontend TIME_SLOTS in
-- reservation-form.tsx if these change.
INSERT INTO capacity_rules (restaurant_id, day_of_week, time_slot, max_covers, slot_length_minutes)
SELECT id, dow, slot, 24, 120
FROM restaurants
CROSS JOIN (SELECT 1 AS dow UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) days
CROSS JOIN (SELECT '11:00:00' AS slot UNION SELECT '14:00:00') slots
WHERE slug = 'la-labranza';
