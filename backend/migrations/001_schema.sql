CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  hours VARCHAR(500) NOT NULL,
  default_locale VARCHAR(5) NOT NULL DEFAULT 'en'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  UNIQUE KEY uniq_restaurant_username (restaurant_id, username),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE capacity_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  day_of_week TINYINT NULL COMMENT '0=Sunday..6=Saturday, NULL means date_override is set instead',
  date_override DATE NULL,
  time_slot TIME NOT NULL,
  max_covers INT NOT NULL,
  slot_length_minutes INT NOT NULL DEFAULT 120,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_restaurant_slot (restaurant_id, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  party_size INT NOT NULL,
  reservation_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_restaurant_date_slot (restaurant_id, reservation_date, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
