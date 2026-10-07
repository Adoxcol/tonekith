CREATE TYPE "public"."chain_item_type" AS ENUM('GUITAR', 'AMP', 'PEDAL', 'PLUGIN', 'CABINET', 'MIC', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."equipment_category" AS ENUM('GUITAR', 'AMP', 'AMP_SIM', 'CABINET', 'PEDAL', 'MULTI_EFFECT', 'PLUGIN', 'AUDIO_INTERFACE', 'MICROPHONE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."parameter_data_type" AS ENUM('NUMBER', 'BOOLEAN', 'ENUM', 'TEXT');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."report_target_type" AS ENUM('TONE', 'COMMENT', 'USER', 'EQUIPMENT');--> statement-breakpoint
CREATE TYPE "public"."song_section" AS ENUM('FULL_SONG', 'INTRO', 'VERSE', 'CHORUS', 'BRIDGE', 'RHYTHM', 'LEAD', 'SOLO', 'OUTRO', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."tone_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."tone_type" AS ENUM('STUDIO', 'LIVE', 'RECREATION', 'INSPIRED_BY', 'COVER', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."tone_visibility" AS ENUM('PUBLIC', 'UNLISTED', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"image_key" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "effect_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_model_id" uuid,
	"name" text NOT NULL,
	"category" text,
	"default_params" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_manufacturers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"website" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "equipment_manufacturers_normalized_name_unique" UNIQUE("normalized_name")
);
--> statement-breakpoint
CREATE TABLE "equipment_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"manufacturer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"category" "equipment_category" NOT NULL,
	"description" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"submitted_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parameter_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_model_id" uuid,
	"effect_model_id" uuid,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"data_type" "parameter_data_type" NOT NULL,
	"unit" text,
	"min" integer,
	"max" integer,
	"step" integer,
	"options" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"default_value" text
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_key" text,
	"location" text,
	"website" text,
	"allow_dataset_use" boolean DEFAULT true NOT NULL,
	"allow_audio_training_use" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"album" text,
	"release_year" integer,
	"artwork_key" text,
	"default_tuning" text DEFAULT 'EADGBE',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_gear" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"equipment_model_id" uuid NOT NULL,
	"nickname" text,
	"notes" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"acquired_year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_demos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tone_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"duration_ms" integer,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parameter_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signal_chain_item_id" uuid NOT NULL,
	"parameter_definition_id" uuid,
	"key" text NOT NULL,
	"data_type" "parameter_data_type" DEFAULT 'NUMBER' NOT NULL,
	"value_number" double precision,
	"value_boolean" boolean,
	"value_text" text,
	"value_enum" text
);
--> statement-breakpoint
CREATE TABLE "preset_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tone_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"platform" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signal_chain_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signal_chain_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"equipment_model_id" uuid,
	"label" text NOT NULL,
	"item_type" "chain_item_type" DEFAULT 'OTHER' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_software" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "signal_chains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tone_id" uuid NOT NULL,
	"name" text DEFAULT 'Main' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signal_chains_tone_id_unique" UNIQUE("tone_id")
);
--> statement-breakpoint
CREATE TABLE "tone_screenshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tone_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tone_tags" (
	"tone_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tone_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tone_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"change_summary" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"song_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"tone_type" "tone_type" DEFAULT 'RECREATION' NOT NULL,
	"song_section" "song_section" DEFAULT 'FULL_SONG' NOT NULL,
	"status" "tone_status" DEFAULT 'DRAFT' NOT NULL,
	"visibility" "tone_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"difficulty" integer,
	"tuning" text DEFAULT 'EADGBE',
	"capo" integer DEFAULT 0,
	"bpm" integer,
	"notes" text,
	"platform" text,
	"guitar_equipment_id" uuid,
	"amp_equipment_id" uuid,
	"forked_from_tone_id" uuid,
	"avg_rating" double precision DEFAULT 0,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"try_count" integer DEFAULT 0 NOT NULL,
	"favorite_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"user_id" text,
	"tone_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tone_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tone_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tone_id" uuid NOT NULL,
	"overall" integer NOT NULL,
	"accuracy" integer NOT NULL,
	"sound_quality" integer NOT NULL,
	"usefulness" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text NOT NULL,
	"target_type" "report_target_type" NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tone_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tone_id" uuid NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tone_tries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tone_id" uuid NOT NULL,
	"tried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "effect_models" ADD CONSTRAINT "effect_models_equipment_model_id_equipment_models_id_fk" FOREIGN KEY ("equipment_model_id") REFERENCES "public"."equipment_models"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_models" ADD CONSTRAINT "equipment_models_manufacturer_id_equipment_manufacturers_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."equipment_manufacturers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_models" ADD CONSTRAINT "equipment_models_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parameter_definitions" ADD CONSTRAINT "parameter_definitions_equipment_model_id_equipment_models_id_fk" FOREIGN KEY ("equipment_model_id") REFERENCES "public"."equipment_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parameter_definitions" ADD CONSTRAINT "parameter_definitions_effect_model_id_effect_models_id_fk" FOREIGN KEY ("effect_model_id") REFERENCES "public"."effect_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gear" ADD CONSTRAINT "user_gear_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gear" ADD CONSTRAINT "user_gear_equipment_model_id_equipment_models_id_fk" FOREIGN KEY ("equipment_model_id") REFERENCES "public"."equipment_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_demos" ADD CONSTRAINT "audio_demos_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parameter_values" ADD CONSTRAINT "parameter_values_signal_chain_item_id_signal_chain_items_id_fk" FOREIGN KEY ("signal_chain_item_id") REFERENCES "public"."signal_chain_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preset_files" ADD CONSTRAINT "preset_files_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_chain_items" ADD CONSTRAINT "signal_chain_items_signal_chain_id_signal_chains_id_fk" FOREIGN KEY ("signal_chain_id") REFERENCES "public"."signal_chains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_chain_items" ADD CONSTRAINT "signal_chain_items_equipment_model_id_equipment_models_id_fk" FOREIGN KEY ("equipment_model_id") REFERENCES "public"."equipment_models"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_chains" ADD CONSTRAINT "signal_chains_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_screenshots" ADD CONSTRAINT "tone_screenshots_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_tags" ADD CONSTRAINT "tone_tags_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_tags" ADD CONSTRAINT "tone_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_versions" ADD CONSTRAINT "tone_versions_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_versions" ADD CONSTRAINT "tone_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tones" ADD CONSTRAINT "tones_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tones" ADD CONSTRAINT "tones_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tones" ADD CONSTRAINT "tones_guitar_equipment_id_equipment_models_id_fk" FOREIGN KEY ("guitar_equipment_id") REFERENCES "public"."equipment_models"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tones" ADD CONSTRAINT "tones_amp_equipment_id_equipment_models_id_fk" FOREIGN KEY ("amp_equipment_id") REFERENCES "public"."equipment_models"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_feedback" ADD CONSTRAINT "tone_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_feedback" ADD CONSTRAINT "tone_feedback_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_tries" ADD CONSTRAINT "tone_tries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tone_tries" ADD CONSTRAINT "tone_tries_tone_id_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_models_unique_idx" ON "equipment_models" USING btree ("manufacturer_id","category","normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "songs_artist_slug_idx" ON "songs" USING btree ("artist_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tone_tags_pk" ON "tone_tags" USING btree ("tone_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tones_creator_slug_idx" ON "tones" USING btree ("creator_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_tone_idx" ON "favorites" USING btree ("user_id","tone_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_user_tone_idx" ON "ratings" USING btree ("user_id","tone_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tone_tries_user_tone_idx" ON "tone_tries" USING btree ("user_id","tone_id");