CREATE TABLE `day_log_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`day_log_id` text NOT NULL,
	`source_task_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`done` integer,
	`target` real,
	`value` real,
	`unit` text,
	`weight` real,
	`reps` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`day_log_id`) REFERENCES `day_logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `day_log_tasks_log_sort` ON `day_log_tasks` (`day_log_id`,`sort`);--> statement-breakpoint
CREATE INDEX `day_log_tasks_type_name` ON `day_log_tasks` (`type`,`name`);--> statement-breakpoint
CREATE TABLE `day_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`template_id` text,
	`locked_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `day_logs_user_day` ON `day_logs` (`user_id`,`day`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`op` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `template_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`target` real,
	`unit` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `template_tasks_template_sort` ON `template_tasks` (`template_id`,`sort`);--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`is_seed` integer DEFAULT false NOT NULL,
	`copied_from` text,
	`last_used_on` text,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `templates_user_sort` ON `templates` (`user_id`,`sort`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`streak_threshold` integer DEFAULT 80 NOT NULL,
	`plan_lock_hour` integer DEFAULT 8 NOT NULL,
	`unit_system` text DEFAULT 'kg' NOT NULL,
	`updated_at` integer NOT NULL
);
