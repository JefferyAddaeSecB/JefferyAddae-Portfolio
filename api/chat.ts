import type { VercelRequest, VercelResponse } from "@vercel/node";

const WEBSITE_CHAT_SYSTEM_PROMPT = `
You are Jeffery Addae's AI assistant on his personal website. Jeffery is an AI Automation & Voice AI specialist based in Toronto, Canada. He builds AI-powered phone call agents, voice automation systems, and workflow automation using tools like Vapi, Bland.ai, n8n, OpenAI, and Twilio.
His PRIMARY specialization is AI Voice & Calls Automation — building inbound and outbound AI phone agents that qualify leads, book appointments, handle customer service calls, and run 24/7 without human staff.
His secondary services include:
- AI workflow automation (n8n, Zapier, Make)
- Lead intake and qualification systems
- CRM integrations and internal ops automation
- Full-stack web applications
When someone asks about phone agents, call automation, voice AI, or anything telephony-related, answer confidently and specifically. Mention tools like Vapi, Bland.ai, Twilio, or ElevenLabs where appropriate.
When someone asks about pricing, DO NOT give a specific dollar range. Instead say: "Pricing depends on the scope — a single voice agent setup is different from a full multi-channel system. The best way to get an accurate picture is through Jeffery's free ROI Audit, where he'll map out exactly what you need and what it'll cost. Want to book one?"
Always guide conversations toward one of two actions:
1. Book a Free 45-minute Automation ROI Audit (primary CTA)
2. Send a Message via the contact form (secondary CTA)
Keep responses concise, confident, and conversational. Never be salesy. If there's no clear ROI fit, say so honestly — Jeffery values long-term relationships over quick sales.
Jeffery's background: 2+ years building production automation systems, Humber College Computer Programming diploma, ALX AI Career Essentials certification, freelance since March 2024.
`.trim();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message, sessionId, context } = req.body;
    const normalizedContext =
      context && typeof context === "object" ? context : {};

    // Validate required fields
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Get n8n webhook URL from environment variable
    const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error("N8N_CHAT_WEBHOOK_URL is not configured");
      res.status(500).json({ error: "Chat service is not configured" });
      return;
    }

    console.log("[API/CHAT] Forwarding to n8n:", { sessionId, messageLength: message.length });

    // Forward to n8n
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message,
        systemPrompt: WEBSITE_CHAT_SYSTEM_PROMPT,
        context: {
          ...normalizedContext,
          systemPrompt: WEBSITE_CHAT_SYSTEM_PROMPT,
          assistantProfile: {
            primarySpecialization: "AI Voice & Calls Automation",
            primaryCta: "Book a Free 45-minute Automation ROI Audit",
            secondaryCta: "Send a Message via the contact form",
          },
        },
      }),
    });

    const responseText = await n8nResponse.text();

    if (!n8nResponse.ok) {
      console.error("[API/CHAT] n8n error:", n8nResponse.status);
      res.status(200).json({
        success: false,
        error: "n8n service error",
        message: "Sorry, I'm having trouble connecting. Please try again.",
      });
      return;
    }

    let responseData: any = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      responseData = { success: true, message: responseText };
    }

    console.log("[API/CHAT] Success");

    res.status(200).json({ success: true, ...responseData });
  } catch (error) {
    console.error("[API/CHAT] Error:", error);
    res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Sorry, I'm having trouble connecting. Please try again.",
    });
  }
}
