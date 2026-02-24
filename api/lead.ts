import { z } from "zod";
import { leadPayloadSchema } from "../shared/lead.js";

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

    const createdAt = new Date().toISOString();
    const forwardTargets: { name: string; url: string }[] = [];
    const n8nLeadWebhookUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_LEAD_WEBHOOK_URL;
    if (n8nLeadWebhookUrl) {
      forwardTargets.push({ name: "n8n", url: n8nLeadWebhookUrl });
    }
    if (process.env.CALENDLY_WEBHOOK_URL) {
      forwardTargets.push({ name: "calendly", url: process.env.CALENDLY_WEBHOOK_URL });
    }

    if (forwardTargets.length === 0) {
      return res.status(503).json({
        ok: false,
        message:
          "Lead pipeline is not configured. Add N8N_WEBHOOK_URL (or N8N_LEAD_WEBHOOK_URL), and optionally CALENDLY_WEBHOOK_URL.",
      });
    }

    const forwardPayload = {
      ...payload,
      id: null,
      client_meta: {
        ...clientMetaInput,
        ip,
        user_agent: req.headers?.["user-agent"] || "",
        referrer: req.headers?.referer || clientMetaInput.referrer || "",
        timezone: clientMetaInput.timezone || "",
        timestamp: createdAt,
      },
    };

    const includeForwardBodies = String(process.env.LEAD_FORWARD_DEBUG || "").trim() === "1";
    const forwardResults: Array<{ name: string; ok: boolean; status?: number; body?: unknown }> = [];

    for (const target of forwardTargets) {
      try {
        const response = await fetch(target.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(forwardPayload),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          console.error(`${target.name} webhook error:`, response.status, errText);
          forwardResults.push({
            name: target.name,
            ok: false,
            status: response.status,
            ...(includeForwardBodies ? { body: errText } : {}),
          });
          continue;
        }

        if (includeForwardBodies) {
          const text = await response.text().catch(() => "");
          let parsed: unknown = text;
          try {
            parsed = text ? JSON.parse(text) : text;
          } catch {}

          forwardResults.push({ name: target.name, ok: true, status: response.status, body: parsed });
          continue;
        }

        forwardResults.push({ name: target.name, ok: true, status: response.status });
      } catch (fErr) {
        console.error(`Failed to forward lead to ${target.name}:`, fErr);
        forwardResults.push({ name: target.name, ok: false });
      }
    }

    const hasSuccessfulForward = forwardResults.some((result) => result.ok);
    if (!hasSuccessfulForward) {
      return res.status(502).json({
        ok: false,
        message: "Lead was received but forwarding to automation webhooks failed.",
        forwarded: forwardResults,
      });
    }

    const calendlyLink = process.env.CALENDLY_LINK || null;
    return res.status(200).json({ ok: true, calendlyLink, forwarded: forwardResults });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid lead payload", errors: error.flatten() });
    }

    console.error("Lead API error:", error);
    return res.status(500).json({ message: "Failed to submit lead" });
  }
}
