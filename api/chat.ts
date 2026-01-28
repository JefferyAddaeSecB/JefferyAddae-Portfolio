import type { VercelRequest, VercelResponse } from "@vercel/node";

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
        context,
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
