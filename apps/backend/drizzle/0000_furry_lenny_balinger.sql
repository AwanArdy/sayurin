CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_at_purchase` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`total_price` integer NOT NULL,
	`substitution_policy` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`food_waste_saved_kg` real,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`price` integer NOT NULL,
	`unit` text NOT NULL,
	`stock` integer DEFAULT 0,
	`shelf_life_room_days` integer,
	`shelf_life_chiller_days` integer,
	`nutrition_tags` text,
	`storage_tips` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`product_id` text NOT NULL,
	`amount_per_serving` real NOT NULL,
	`unit` text,
	`is_pantry_staple` integer DEFAULT false,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`base_servings` integer DEFAULT 2,
	`cooking_time_mins` integer,
	`instructions` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipes_slug_unique` ON `recipes` (`slug`);--> statement-breakpoint
CREATE TABLE `user_waste_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`food_waste_saved_kg` real DEFAULT 0,
	`plastic_saved_pcs` integer DEFAULT 0,
	`money_saved_idr` integer DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);