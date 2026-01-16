import { z } from "zod";
import { leadPayloadSchema } from "../shared/lead.js";
import { getFirestore, isFirebaseConfigured } from "../server/firebase.js";

const leadRateLimit = new Map<string, { count: number; firstAt: number }>();
const leadRateWindowMs = 10 * 60 * 1000;
const leadRateLimitMax = 6;

const getClientIp = (req: any) => {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

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
        return res.status(429).json({ message: "Too many submissions. Please try again shortly." });
      }
    }

    const clientMetaInput = payload.client_meta || {};
    const honeypot = typeof clientMetaInput.honeypot === "string" ? clientMetaInput.honeypot : "";
    if (honeypot.trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    // Try to persist the lead to Firestore if configured; otherwise just forward
    let savedLeadId: string | number | null = null;
    if (isFirebaseConfigured()) {
      try {
        const db = getFirestore();
        if (db) {
          const createdAt = new Date().toISOString();
          const docRef = db.collection('leads').doc();
          const newLead = {
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
            client_meta: {
              ...clientMetaInput,
              ip,
              user_agent: req.headers?.["user-agent"] || "",
              referrer: req.headers?.referer || clientMetaInput.referrer || "",
              timezone: clientMetaInput.timezone || "",
              timestamp: createdAt,
            },
            createdAt,
          };
          await docRef.set(newLead);
          savedLeadId = docRef.id;
        }
      } catch (storeErr) {
        console.error('Firestore save failed:', storeErr);
      }
    }

    // Forward to configured automation endpoints (n8n, Calendly) if present
    const forwardTargets: { name: string; url?: string }[] = [];
    if (process.env.N8N_WEBHOOK_URL) forwardTargets.push({ name: 'n8n', url: process.env.N8N_WEBHOOK_URL });
    if (process.env.CALENDLY_WEBHOOK_URL) forwardTargets.push({ name: 'calendly', url: process.env.CALENDLY_WEBHOOK_URL });

    const forwardPayload = {
      ...payload,
      id: savedLeadId,
      client_meta: {
        ...clientMetaInput,
        ip,
        user_agent: req.headers?.["user-agent"] || "",
        referrer: req.headers?.referer || clientMetaInput.referrer || "",
        timezone: clientMetaInput.timezone || "",
        timestamp: new Date().toISOString(),
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

    const calendlyLink = process.env.CALENDLY_LINK || null;
    return res.status(200).json({ ok: true, calendlyLink });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid lead payload", errors: error.flatten() });
    }

    console.error("Lead API error:", error);
    return res.status(500).json({ message: "Failed to submit lead" });
  }
}
