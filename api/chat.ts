import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
const envProductionPath = path.join(process.cwd(), ".env.production");
if (fs.existsSync(envProductionPath)) {
  dotenv.config({ path: envProductionPath });
}
dotenv.config();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, sessionId, context } = req.body;

    // Validate required fields
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get n8n webhook URL
    const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error("N8N_CHAT_WEBHOOK_URL is not configured");
      return res.status(500).json({ error: "Chat service is not configured" });
    }

    console.log("🔗 Forwarding chat request to n8n:", { sessionId, messageLength: message.length });

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
      console.error("❌ n8n webhook error:", n8nResponse.status, responseText);
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

    console.log("✅ n8n response received:", responseData);

    return res.status(200).json({ success: true, ...responseData });
  } catch (error) {
    console.error("❌ Chat endpoint error:", error);
    return res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Sorry, I'm having trouble connecting. Please try again.",
    });
  }
}
