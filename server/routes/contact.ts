import { Router } from "express";
import { z } from "zod";
import { sendContactEmail } from "../services/email.js";

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

    // 1) Email as backup (optional but smart)
    await sendContactEmail({
      name: lead.name,
      email: lead.email,
      subject: `New Lead: ${lead.goal} (${lead.budget})`,
      message: `Company: ${lead.company}\nTools: ${lead.tools}\nTimeline: ${lead.timeline}\n\nDetails:\n${lead.details}`,
    });

    // 2) Forward to n8n (optional if env is set)
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    const secret = process.env.N8N_WEBHOOK_SECRET;

    if (n8nUrl && secret) {
      await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portfolio-secret": secret,
        },
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