import type { Express, Request, Response } from "express";
import { getStorage } from "./storage";
import { contactMessageSchema } from "@shared/schema";
import { leadPayloadSchema } from "@shared/lead";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendContactEmail } from "./services/email";
import { isFirebaseConfigured, getFirestore } from "./firebase";
import { handleCalendlyWebhook } from "./webhooks/calendly";
import { getUpcomingAppointments, getPastAppointments, getAppointmentStats } from "./services/appointments";

export async function registerRoutes(app: Express): Promise<void> {
  const leadRateLimit = new Map<string, { count: number; firstAt: number }>();
  const leadRateWindowMs = 10 * 60 * 1000;
  const leadRateLimitMax = 6;

  const getClientIp = (req: Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "unknown";
  };
  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    return res.status(200).json({ status: "ok" });
  });

  // Test email endpoint
  app.get("/api/test-email", async (req: Request, res: Response) => {
    try {
      const testData = {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Email",
        message: "This is a test email from your portfolio contact form."
      };

      const emailResult = await sendContactEmail(testData);
      if (!emailResult.success) {
        return res.status(500).json({ 
          message: "Failed to send test email",
          error: emailResult.emailError || "Email configuration is missing or invalid"
        });
      }

      return res.status(200).json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error("Error sending test email:", error);
      return res.status(500).json({ 
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API route for contact form submissions
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate request body against schema
      const validatedData = contactMessageSchema.parse(req.body);
      
      // Save contact message to storage
      const savedMessage = await getStorage().createContactMessage(validatedData);
      
      // Send email notification
      const emailResult = await sendContactEmail(validatedData);
      if (!emailResult.success) {
        return res.status(500).json({
          message: "Failed to send email",
          error: emailResult.emailError || "Email configuration is missing or invalid"
        });
      }
      
      // Return success response
      return res.status(201).json({ 
        message: "Message received successfully", 
        id: savedMessage.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = fromZodError(error).message;
        return res.status(400).json({ 
          message: "Invalid form data", 
          errors: errorMessage
        });
      }
      
      console.error("Error processing contact message:", error);
      return res.status(500).json({ 
        message: "Server error, please try again later"
      });
    }
  });

  // Lead capture endpoint for automation inquiries
  app.post("/api/lead", async (req: Request, res: Response) => {
    try {
      const payload = leadPayloadSchema.parse(req.body);
      const ip = getClientIp(req);
      const now = Date.now();
      const rateState = leadRateLimit.get(ip);

      if (!rateState || now - rateState.firstAt > leadRateWindowMs) {
        leadRateLimit.set(ip, { count: 1, firstAt: now });
      } else {
        rateState.count += 1;
        if (rateState.count > leadRateLimitMax) {
          return res.status(429).json({
            message: "Too many submissions. Please try again shortly.",
          });
        }
      }

      const clientMetaInput = payload.client_meta || {};
      const honeypot = typeof clientMetaInput.honeypot === "string" ? clientMetaInput.honeypot : "";
      if (honeypot.trim().length > 0) {
        return res.status(200).json({ ok: true });
      }

      const createdAt = new Date().toISOString();
      let savedLeadId: string | null = null;

      // Try to persist the lead to Firestore if configured; this triggers Cloud Functions auto-reply
      if (isFirebaseConfigured()) {
        try {
          const db = getFirestore();
          if (db) {
            const docRef = db.collection('leads').doc();
            const newLead = {
              name: payload.full_name,
              full_name: payload.full_name,
              email: payload.email,
              phone: payload.phone || null,
              company: payload.company || null,
              role: payload.role || null,
              inquiry_type: payload.inquiry_type || null,
              primary_goal: payload.primary_goal || null,
              tools_in_use: payload.tools_in_use || [],
              message: payload.message,
              consent: payload.consent,
              goal: payload.primary_goal || null,
              timeline: payload.timeline || null,
              budget: payload.budget || null,
              client_meta: {
                ...clientMetaInput,
                ip,
                user_agent: req.get('user-agent') || '',
                referrer: req.get('referer') || clientMetaInput.referrer || '',
                timezone: clientMetaInput.timezone || '',
                timestamp: createdAt,
              },
              createdAt,
            };
            await docRef.set(newLead);
            savedLeadId = docRef.id;
            console.log(`✅ Lead saved to Firestore: ${payload.full_name} (${savedLeadId})`);
          }
        } catch (storeErr) {
          console.error('❌ Firestore save failed:', storeErr);
        }
      } else {
        console.warn('⚠️ Firebase not configured, cannot save to Firestore');
      }

      // Fallback: Persist to in-memory storage as well
      let savedLead: any = null;
      try {
        savedLead = await getStorage().createLead({
          name: payload.full_name,
          email: payload.email,
          phone: payload.phone || null,
          company: payload.company || null,
          role: payload.role || null,
          inquiryType: payload.inquiry_type || null,
          primaryGoal: payload.primary_goal || null,
          tools: (payload.tools_in_use || []).join(", ") || payload.other_tools || null,
          volumeRange: payload.estimated_monthly_volume || null,
          message: payload.message,
          createdAt,
        } as any);
      } catch (storeErr) {
        console.error('Error saving lead to storage:', storeErr);
      }

      // Log an event in storage when possible
      try {
        await getStorage().createLeadEvent({
          leadId: savedLead?.id || Date.now(),
          eventType: 'received',
          metadata: { ip, referrer: req.get('referer') || '', userAgent: req.get('user-agent') || '' },
          createdAt,
        } as any);
      } catch (evtErr) {
        console.error('Failed to write lead event:', evtErr);
      }

      // Forward to external automation endpoint(s) if configured
      const forwardTargets: { name: string; url?: string }[] = [];
      if (process.env.N8N_WEBHOOK_URL) forwardTargets.push({ name: 'n8n', url: process.env.N8N_WEBHOOK_URL });
      if (process.env.CALENDLY_WEBHOOK_URL) forwardTargets.push({ name: 'calendly', url: process.env.CALENDLY_WEBHOOK_URL });

      const forwardPayload = {
        ...payload,
        id: savedLeadId || savedLead?.id || null,
        client_meta: {
          ...clientMetaInput,
          ip,
          user_agent: req.get('user-agent') || '',
          referrer: req.get('referer') || clientMetaInput.referrer || '',
          timezone: clientMetaInput.timezone || '',
          timestamp: createdAt,
        },
      };

      for (const target of forwardTargets) {
        try {
          const response = await fetch(target.url!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(forwardPayload),
          });
          if (!response.ok) {
            const errText = await response.text().catch(() => '');
            console.error(`${target.name} webhook error:`, response.status, errText);
          }
        } catch (fErr) {
          console.error(`Failed to forward lead to ${target.name}:`, fErr);
        }
      }

      // Email notifications (owner alert + auto-reply)
      let emailResult:
        | { success: true; info?: unknown }
        | { success: false; emailError?: string } = {
          success: false,
          emailError: "Email not attempted",
        };
      try {
        const leadTopic =
          payload.primary_goal ||
          payload.inquiry_type ||
          payload.lead_source ||
          "Website Inquiry";
        emailResult = await sendContactEmail({
          name: payload.full_name,
          email: payload.email,
          subject: `New Lead: ${leadTopic}`,
          message: payload.message,
        });
      } catch (emailErr) {
        console.error("Failed to send lead emails:", emailErr);
        emailResult = {
          success: false,
          emailError: emailErr instanceof Error ? emailErr.message : String(emailErr),
        };
      }

      // If a Calendly link is configured, return it (so front-end can show a scheduling CTA)
      const calendlyLink = process.env.CALENDLY_LINK || null;
      const firebaseEnabled = isFirebaseConfigured();
      const hasWebhookTarget = forwardTargets.length > 0;
      const emailEnabled = emailResult.success;
      const hasConfiguredPipeline = firebaseEnabled || hasWebhookTarget || emailEnabled;

      if (!hasConfiguredPipeline) {
        return res.status(503).json({
          ok: false,
          message:
            "Lead pipeline is not configured on server. Add FIREBASE_* and/or N8N_WEBHOOK_URL and EMAIL_* variables.",
        });
      }

      return res.status(200).json({
        ok: true,
        calendlyLink,
        emailSent: emailEnabled,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = fromZodError(error).message;
        return res.status(400).json({
          message: "Invalid lead payload",
          errors: errorMessage,
        });
      }

      console.error("Error processing lead:", error);
      return res.status(500).json({
        message: "Server error, please try again later",
      });
    }
  });

  // ========================================
  // CALENDLY WEBHOOK & APPOINTMENTS API
  // ========================================

  /**
   * POST /api/webhooks/calendly
   * 
   * Calendly webhook handler
   * Validates signature and processes invitee events
   * 
   * Events:
   * - invitee.created
   * - invitee.cancelled
   * - invitee.rescheduled
   * 
   * Response: n8n-compatible JSON
   */
  app.post("/api/webhooks/calendly", async (req: Request, res: Response) => {
    try {
      const signature = req.headers["x-calendly-signature"] as string;
      if (!signature) {
        return res.status(400).json({ 
          error: "Missing X-Calendly-Signature header" 
        });
      }

      const result = await handleCalendlyWebhook(req.body, signature);

      // Return appropriate status code based on result
      if (result.status === "error") {
        return res.status(400).json(result);
      }

      // Success or skipped — both return 200
      return res.status(200).json(result);
    } catch (error) {
      console.error("Calendly webhook error:", error);
      return res.status(500).json({
        status: "error",
        event_type: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/appointments/upcoming
   * 
   * Fetch upcoming appointments (status = upcoming, startTime > now)
   * Optional: filter by userId query param
   * 
   * Response:
   * ```json
   * [
   *   {
   *     "appointmentId": "appt_...",
   *     "email": "user@example.com",
   *     "startTime": "2025-01-20T14:00:00Z",
   *     "endTime": "2025-01-20T14:45:00Z",
   *     "serviceType": "Discovery Call",
   *     "timezone": "America/New_York",
   *     "status": "upcoming"
   *   }
   * ]
   * ```
   */
  app.get("/api/appointments/upcoming", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const appointments = await getUpcomingAppointments(userId);

      return res.status(200).json({
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      return res.status(500).json({
        error: "Failed to fetch upcoming appointments",
      });
    }
  });

  /**
   * GET /api/appointments/past
   * 
   * Fetch past appointments (status = completed | cancelled, startTime <= now)
   * Optional: filter by userId query param
   * Ordered by startTime descending (most recent first)
   */
  app.get("/api/appointments/past", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const appointments = await getPastAppointments(userId);

      return res.status(200).json({
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      console.error("Error fetching past appointments:", error);
      return res.status(500).json({
        error: "Failed to fetch past appointments",
      });
    }
  });

  /**
   * GET /api/appointments/stats
   * 
   * Appointment statistics
   * Used for monitoring and dashboard
   */
  app.get("/api/appointments/stats", async (req: Request, res: Response) => {
    try {
      const stats = await getAppointmentStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
      return res.status(500).json({
        error: "Failed to fetch appointment stats",
      });
    }
  });

  /**
   * POST /api/chat
   * 
   * Chat endpoint - proxies messages to n8n webhook
   * Request body: { sessionId, message, context }
   * Response: { success, message, ... }
   */
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, sessionId, context } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
      if (!n8nWebhookUrl) {
        console.error("N8N_CHAT_WEBHOOK_URL is not configured");
        return res.status(500).json({ error: "Chat service is not configured" });
      }

      console.log("Forwarding chat request to n8n:", { sessionId, messageLength: message.length });
      
      // Forward to n8n
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message,
          context,
        }),
      });

      const responseText = await n8nResponse.text();
      
      if (!n8nResponse.ok) {
        console.error("n8n webhook error:", n8nResponse.status, responseText);
        return res.status(200).json({
          success: false,
          error: "n8n service error",
          message: "Sorry, I'm having trouble connecting. Please try again.",
        });
      }

      let responseData: any = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        responseData = { success: true, message: responseText };
      }

      console.log("n8n response received:", responseData);
      return res.status(200).json({ success: true, ...responseData });
    } catch (error) {
      console.error("Chat endpoint error:", error);
      return res.status(200).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Sorry, I'm having trouble connecting. Please try again.",
      });
    }
  });
}
