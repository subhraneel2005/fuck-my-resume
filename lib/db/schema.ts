import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Better Auth Core Tables ───

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── BYOK: AI Provider Settings ───

export const aiSettings = pgTable("ai_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  provider: text("provider").notNull(), // 'openai' | 'google'
  apiKey: text("api_key").notNull(), // encrypted
  model: text("model"), // optional: 'gpt-4o', 'gemini-3.5-flash', etc.
  // Mock interviewer voice settings
  voiceEngine: text("voice_engine"), // 'openai' | 'browser' (google voice unsupported)
  interviewerModel: text("interviewer_model"), // interviewer LLM (brain)
  sttModel: text("stt_model"), // speech-to-text model id
  ttsModel: text("tts_model"), // text-to-speech model id
  ttsVoice: text("tts_voice"), // TTS voice id
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── AI Mock Interviewer Sessions ───

export const interviewSessions = pgTable("interview_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  jobTitle: text("job_title"),
  company: text("company"),
  jobDescription: text("job_description").notNull(),
  difficulty: text("difficulty").notNull(), // 'peaceful' | 'easy' | 'normal' | 'hard'
  durationMinutes: integer("duration_minutes").notNull(),
  seed: text("seed").notNull(),
  config: jsonb("config").notNull(), // deterministic generated interview config
  voiceEngine: text("voice_engine").notNull(), // 'openai' | 'browser'
  model: text("model").notNull(), // interviewer LLM (brain) used for this session
  status: text("status").notNull().default("active"), // 'active' | 'completed' | 'aborted'
  transcriptMarkdown: text("transcript_markdown"),
  feedback: jsonb("feedback"), // { strengths, weaknesses, suggestions }
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Relations ───

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  aiSettings: many(aiSettings),
  interviewSessions: many(interviewSessions),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const aiSettingsRelations = relations(aiSettings, ({ one }) => ({
  user: one(user, {
    fields: [aiSettings.userId],
    references: [user.id],
  }),
}));

export const interviewSessionsRelations = relations(
  interviewSessions,
  ({ one }) => ({
    user: one(user, {
      fields: [interviewSessions.userId],
      references: [user.id],
    }),
  })
);
