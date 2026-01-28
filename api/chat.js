export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, sessionId, context } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: "N8N_CHAT_WEBHOOK_URL is not configured" });
    }

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message, context }),
    });

    const rawText = await n8nResponse.text();
    let data = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    if (!n8nResponse.ok) {
      return res.status(502).json({
        success: false,
        error: data?.error || "n8n service error",
        message: data?.message || rawText || "Upstream error",
      });
    }

    if (data && typeof data === "object") {
      return res.status(200).json({ success: true, ...data });
    }

    return res.status(200).json({ success: true, message: rawText });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Server error",
    });
  }
}
