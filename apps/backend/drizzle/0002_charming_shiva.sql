CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_product_id_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `recipe_ingredients_recipe_id_idx` ON `recipe_ingredients` (`recipe_id`);--> statement-breakpoint
CREATE INDEX `recipe_ingredients_product_id_idx` ON `recipe_ingredients` (`product_id`);--> statement-breakpoint
CREATE INDEX `user_waste_logs_user_id_idx` ON `user_waste_logs` (`user_id`);
--> statement-breakpoint
-- Perbaiki baris lama yang menyimpan literal 'CURRENT_TIMESTAMP' (bukan hasil fungsi)
UPDATE "orders" SET "created_at" = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE "created_at" = 'CURRENT_TIMESTAMP';
--> statement-breakpoint
UPDATE "users" SET "created_at" = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE "created_at" = 'CURRENT_TIMESTAMP';