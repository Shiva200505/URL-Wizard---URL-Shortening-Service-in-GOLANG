import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// URL shortener schema
export const shortUrls = pgTable("short_urls", {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  slug: text("slug").notNull().unique(),
  clicks: integer("clicks").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertShortUrlSchema = createInsertSchema(shortUrls).pick({
  originalUrl: true,
  slug: true, 
  expiresAt: true
}).extend({
  originalUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  slug: z.string().min(1, "Slug is required").max(50, "Slug must be 50 characters or less").regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores"),
  expiresAt: z.string().nullable()
});

export type InsertShortUrl = z.infer<typeof insertShortUrlSchema>;
export type ShortUrl = typeof shortUrls.$inferSelect;

// Analytics schema for referrers
export const clickEvents = pgTable("click_events", {
  id: serial("id").primaryKey(),
  shortUrlId: integer("short_url_id").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  device: text("device"),
});

export const insertClickEventSchema = createInsertSchema(clickEvents).pick({
  shortUrlId: true,
  referrer: true,
  userAgent: true,
  device: true
});

export type InsertClickEvent = z.infer<typeof insertClickEventSchema>;
export type ClickEvent = typeof clickEvents.$inferSelect;
