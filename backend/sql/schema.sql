CREATE DATABASE IF NOT EXISTS sneakers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sneakers_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(100),
  name VARCHAR(200),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  color VARCHAR(64),
  size VARCHAR(16),
  price INT,
  image_url VARCHAR(512),
  stock INT DEFAULT 10,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  variant_id INT,
  qty INT DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- ⭐⭐ SUPPRIMÉ LES 3 PREMIÈRES CHAUSSURES - SEULEMENT VOS JORDAN ⭐⭐
INSERT INTO products (brand, name, slug, description) VALUES
('Nike', 'Air Jordan 1 Low', 'air-jordan-1-low-green', 'Nike Air Jordan 1 Low - Édition Green'),
('Nike', 'Air Jordan 1 Low', 'air-jordan-1-low-black', 'Nike Air Jordan 1 Low - Édition Noir'),
('Nike', 'Air Jordan 1 Low', 'air-jordan-1-low-blue', 'Nike Air Jordan 1 Low - Édition Bleu');

INSERT INTO product_variants (product_id, color, size, price, image_url, stock) VALUES
(1, 'Green', '44', 22400, '/images/air-jordan-1-low-green.jpg', 5),
(1, 'Green', '45', 22400, '/images/air-jordan-1-low-green.jpg', 3),
(2, 'Black', '44', 22400, '/images/air-jordan-1-low-black.jpg', 4),
(2, 'Black', '45', 22400, '/images/air-jordan-1-low-black.jpg', 2),
(3, 'Blue', '46', 22400, '/images/air-jordan-1-low-blue.jpg', 3);