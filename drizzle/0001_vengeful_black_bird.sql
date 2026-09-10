CREATE TABLE `weekly_schedule` (
	`user_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`template_id` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `weekday`)
);
