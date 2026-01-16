import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
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

// Contact messages schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const contactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export type InsertContactMessage = z.infer<typeof contactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Leads schema (automation inquiries)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  role: text("role"),
  inquiryType: text("inquiry_type").notNull(),
  primaryGoal: text("primary_goal").notNull(),
  tools: text("tools"),
  volumeRange: text("volume_range"),
  timeline: text("timeline"),
  budgetRange: text("budget_range"),
  dataSensitivity: text("data_sensitivity"),
  message: text("message").notNull(),
  preferredContact: text("preferred_contact"),
  consent: text("consent").notNull(),
  tracking: text("tracking"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  name: true,
  email: true,
  phone: true,
  company: true,
  role: true,
  inquiryType: true,
  primaryGoal: true,
  tools: true,
  volumeRange: true,
  timeline: true,
  budgetRange: true,
  dataSensitivity: true,
  message: true,
  preferredContact: true,
  consent: true,
  tracking: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const leadEvents = pgTable("lead_events", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  eventType: text("event_type").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertLeadEventSchema = createInsertSchema(leadEvents).pick({
  leadId: true,
  eventType: true,
  metadata: true,
});

export type InsertLeadEvent = z.infer<typeof insertLeadEventSchema>;
export type LeadEvent = typeof leadEvents.$inferSelect;
