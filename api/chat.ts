import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  WEBSITE_CHAT_ASSISTANT_PROFILE,
  WEBSITE_CHAT_SYSTEM_PROMPT,
  buildLocalAssistantFallback,
  isGenericUpstreamFailureMessage,
} from "../shared/chat-assistant";

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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.N8N_CHAT_WEBHOOK_SECRET) {
      headers["x-chat-webhook-secret"] = process.env.N8N_CHAT_WEBHOOK_SECRET;
    }

    const timeoutMs = Number(process.env.N8N_CHAT_TIMEOUT_MS || 15000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    // Forward to n8n
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        sessionId,
        message,
        systemPrompt: WEBSITE_CHAT_SYSTEM_PROMPT,
        assistantProfile: WEBSITE_CHAT_ASSISTANT_PROFILE,
        context: {
          ...normalizedContext,
          systemPrompt: WEBSITE_CHAT_SYSTEM_PROMPT,
          assistantProfile: WEBSITE_CHAT_ASSISTANT_PROFILE,
        },
      }),
    }).finally(() => clearTimeout(timeout));

    const responseText = await n8nResponse.text();

    if (!n8nResponse.ok) {
      console.error("[API/CHAT] n8n error:", n8nResponse.status, responseText);
      const fallback = buildLocalAssistantFallback(message);
      res.status(200).json({
        ...fallback,
        error: "n8n_service_error",
      });
      return;
    }

    let responseData: any = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      responseData = { success: true, message: responseText };
    }

    const upstreamMessage =
      typeof responseData?.message === "string"
        ? responseData.message
        : typeof responseText === "string"
          ? responseText
          : "";

    if (isGenericUpstreamFailureMessage(upstreamMessage)) {
      console.warn("[API/CHAT] Generic upstream failure reply detected; using local fallback");
      const fallback = buildLocalAssistantFallback(message);
      res.status(200).json({
        ...fallback,
        error: "n8n_generation_failed",
      });
      return;
    }

    console.log("[API/CHAT] Success");

    res.status(200).json({
      success: responseData?.success !== false,
      message: upstreamMessage || buildLocalAssistantFallback(message).message,
      suggestedAction: responseData?.suggestedAction,
      intent: responseData?.intent,
      timestamp: responseData?.timestamp || new Date().toISOString(),
      source: "n8n",
    });
  } catch (error) {
    console.error("[API/CHAT] Error:", error);
    const fallback = buildLocalAssistantFallback(
      typeof req.body?.message === "string" ? req.body.message : ""
    );
    res.status(200).json({
      ...fallback,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
