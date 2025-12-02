import { Router } from "express";
import { z } from "zod";
import { sendContactEmail, sendTestEmail } from "../services/email.js";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

router.post("/", async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);
    await sendContactEmail(data);
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(400).json({ 
      message: "Failed to send message", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

router.get("/test-email", async (req, res) => {
  try {
    await sendTestEmail();
    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ 
      message: "Failed to send test email", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router; 