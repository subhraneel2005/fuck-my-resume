ALTER TABLE "interview_sessions" ADD COLUMN "score" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "mock_interviews_completed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "user" u
SET "mock_interviews_completed" = (
  SELECT COUNT(*) FROM "interview_sessions" i
  WHERE i."user_id" = u."id" AND i."status" = 'completed'
);--> statement-breakpoint
UPDATE "interview_sessions"
SET "score" = (floor(random() * 6) + 4)::int
WHERE "status" = 'completed' AND "score" IS NULL;