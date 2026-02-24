import { Router } from "express";
import { z } from "zod";

const router = Router();

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional().default(""),
  goal: z.enum([
    "Lead capture & follow-up",
    "Customer support automation",
    "Reporting / dashboards",
    "Internal ops automation",
    "Website / app build",
    "Other",
  ]),
  tools: z.string().optional().default(""),
  budget: z.enum(["$500–$1,200", "$1,500–$4,000", "$4,000–$10,000+", "Not sure"]),
  timeline: z.enum(["ASAP", "1–2 weeks", "2–4 weeks", "Flexible"]),
  details: z.string().min(10),
});

router.post("/", async (req, res) => {
  try {
    const lead = leadSchema.parse(req.body);

    // Forward to n8n when configured.
    const n8nUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_LEAD_WEBHOOK_URL;
    const secret = process.env.N8N_WEBHOOK_SECRET;

    if (n8nUrl) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (secret) {
        headers["x-portfolio-secret"] = secret;
      }

      await fetch(n8nUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          source: "portfolio",
          type: "lead",
          ...lead,
          createdAt: new Date().toISOString(),
        }),
      });
    }

    return res.json({ message: "Lead captured successfully" });
  } catch (error) {
    console.error("Lead form error:", error);
    return res.status(400).json({
      message: "Failed to submit",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
