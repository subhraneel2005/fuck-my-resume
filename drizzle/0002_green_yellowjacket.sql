CREATE TABLE "interview_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job_title" text,
	"company" text,
	"job_description" text NOT NULL,
	"difficulty" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"seed" text NOT NULL,
	"config" jsonb NOT NULL,
	"voice_engine" text NOT NULL,
	"model" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"transcript_markdown" text,
	"feedback" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_settings" ADD COLUMN "voice_engine" text;--> statement-breakpoint
ALTER TABLE "ai_settings" ADD COLUMN "interviewer_model" text;--> statement-breakpoint
ALTER TABLE "ai_settings" ADD COLUMN "stt_model" text;--> statement-breakpoint
ALTER TABLE "ai_settings" ADD COLUMN "tts_model" text;--> statement-breakpoint
ALTER TABLE "ai_settings" ADD COLUMN "tts_voice" text;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;