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

/**
 * FIRESTORE SCHEMAS (for Calendly + Appointment lifecycle)
 * These are NOT Drizzle tables — they live in Firestore only
 * Use these types throughout the codebase for Firestore documents
 */

// Firestore: Users collection (for tracking who has booked)
export const firestoreUserSchema = z.object({
  userId: z.string().describe("Firebase Auth UID or email identifier"),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});
export type FirestoreUser = z.infer<typeof firestoreUserSchema>;

// Firestore: Appointments collection (single source of truth for bookings)
export const firestoreAppointmentSchema = z.object({
  appointmentId: z.string().describe("Unique Firestore document ID"),
  userId: z.string().describe("Linked to users collection, if user is authenticated"),
  email: z.string().email().describe("Invitee email from Calendly"),
  calendlyEventId: z.string().describe("Calendly event UUID"),
  calendlyInviteeId: z.string().describe("Calendly invitee UUID"),
  serviceType: z.enum(["Discovery Call", "Strategy Call", "Custom"]).default("Discovery Call"),
  duration: z.number().int().describe("Minutes"),
  status: z.enum(["upcoming", "completed", "cancelled"]).default("upcoming"),
  startTime: z.string().describe("ISO 8601 timestamp"),
  endTime: z.string().describe("ISO 8601 timestamp"),
  timezone: z.string().describe("IANA timezone"),
  lead_source: z.enum(["website", "audit", "referral"]).default("website"),
  createdAt: z.string().describe("When the appointment was created in Firestore"),
  updatedAt: z.string().describe("Last updated timestamp"),
  cancelledAt: z.string().optional().describe("Timestamp when cancelled (if status=cancelled)"),
});
export type FirestoreAppointment = z.infer<typeof firestoreAppointmentSchema>;

// Firestore: Webhook logs (for audit trail and debugging)
export const firestoreWebhookLogSchema = z.object({
  webhookLogId: z.string(),
  event_type: z.string(),
  calendly_event_id: z.string().optional(),
  status: z.enum(["success", "error", "skipped"]),
  error_message: z.string().optional(),
  raw_payload: z.record(z.unknown()).optional(),
  processedAt: z.string(),
});
export type FirestoreWebhookLog = z.infer<typeof firestoreWebhookLogSchema>;

