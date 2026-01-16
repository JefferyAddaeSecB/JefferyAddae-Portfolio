import { z } from "zod";

export const leadPayloadSchema = z.object({
  lead_source: z.enum(["audit", "message"]),
  full_name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
  consent: z.boolean(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  inquiry_type: z.string().optional(),
  primary_goal: z.string().optional(),
  tools_in_use: z.array(z.string()).optional(),
  other_tools: z.string().optional(),
  estimated_monthly_volume: z.string().optional(),
  timeline: z.string().optional(),
  budget_range: z.string().optional(),
  data_sensitivity: z.string().optional(),
  attachment_url: z.string().optional(),
  preferred_contact_method: z.string().optional(),
  source_page: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  client_meta: z.record(z.any()).optional(),
});

export type LeadPayload = z.infer<typeof leadPayloadSchema>;
