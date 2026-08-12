-- Hapus data lama jika ada (agar aman dijalankan ulang)
DELETE FROM recipe_ingredients;
DELETE FROM recipes;
DELETE FROM products;
DELETE FROM user_waste_logs;
DELETE FROM users;

-- 1. Seed Users
INSERT INTO users (id, email, password_hash, name) 
VALUES ('user-1', 'test@mail.com', 'hash123', 'Eco User Dummy');

-- 2. Seed Products (Minimal 8 SKU)[cite: 3]
INSERT INTO products (id, name, slug, price, unit, nutrition_tags) VALUES
('prod-1', 'Bayam Hijau', 'bayam-hijau', 5000, 'ikat', '["fiber", "iron"]'),
('prod-2', 'Kangkung', 'kangkung', 4000, 'ikat', '["fiber"]'),
('prod-3', 'Bawang Putih', 'bawang-putih', 12000, '250 gram', '[]'),
('prod-4', 'Bawang Merah', 'bawang-merah', 15000, '250 gram', '[]'),
('prod-5', 'Daging Ayam Fillet', 'daging-ayam-fillet', 38500, '500 gram', '["low_carb"]'),
('prod-6', 'Wortel Lokal', 'wortel-lokal', 8000, '500 gram', '["fiber"]'),
('prod-7', 'Tomat Merah', 'tomat-merah', 7000, '500 gram', '[]'),
('prod-8', 'Tempe Daun', 'tempe-daun', 6000, 'pcs', '["uric_acid_safe"]');

-- 3. Seed Recipes (Minimal 2 Resep)[cite: 3]
INSERT INTO recipes (id, title, slug, base_servings, cooking_time_mins) VALUES
('rec-1', 'Sayur Bening Bayam', 'sayur-bening-bayam', 2, 15),
('rec-2', 'Ayam Tumis Bawang', 'ayam-tumis-bawang', 4, 30);

-- 4. Seed Recipe Ingredients[cite: 3]
INSERT INTO recipe_ingredients (id, recipe_id, product_id, amount_per_serving, unit, is_pantry_staple) VALUES
('ri-1', 'rec-1', 'prod-1', 0.5, 'ikat', 0),
('ri-2', 'rec-1', 'prod-3', 1, 'siung', 1), -- Bawang putih (pantry)
('ri-3', 'rec-1', 'prod-4', 2, 'siung', 1), -- Bawang merah (pantry)
('ri-4', 'rec-2', 'prod-5', 125, 'gram', 0),
('ri-5', 'rec-2', 'prod-3', 2, 'siung', 1);

-- 5. Seed User Waste Log[cite: 3]
INSERT INTO user_waste_logs (id, user_id, food_waste_saved_kg, plastic_saved_pcs, money_saved_idr) 
VALUES ('log-1', 'user-1', 4.2, 18, 125000);
