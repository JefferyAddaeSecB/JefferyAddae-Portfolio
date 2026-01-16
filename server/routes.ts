import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { contactMessageSchema } from "@shared/schema";
import { leadPayloadSchema } from "@shared/lead";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendContactEmail } from "./services/email";
// openai-edge types are optional; define a minimal ChatMessage type here
type ChatMessage = { role: string; content: string };

const fallbackPortfolioSummary = `I'm Jeffery's portfolio assistant. Here's a quick overview so you still get a helpful answer even if the live AI is unavailable:
- Role: Full-Stack Developer & AI Automation Specialist (2+ years), based in Accra, Ghana
- Strengths: React, Next.js, TypeScript, Tailwind, Node.js/Express, Supabase, Firebase, MongoDB, Git/GitHub, cloud integrations (Vercel/Cloudinary/AWS basics)
- Recent work: data-driven web apps, AI-powered SaaS, e-commerce MVPs, real-time dashboards
- Services: full-stack builds, AI automation systems, API design/integration, cloud/database setup, UI/UX optimization, MVP delivery
- Hire/contact: use the Contact page or the footer links to reach out.`;

const buildMessages = (
  systemPrompt: string,
  conversationHistory: any[],
  message: string
): ChatMessage[] => ([
  { role: "system", content: systemPrompt },
  ...conversationHistory.map((msg: any) => ({
    role: msg.role,
    content: msg.content
  })),
  { role: "user", content: message }
]);

export async function registerRoutes(app: Express): Promise<void> {
  const leadRateLimit = new Map<string, { count: number; firstAt: number }>();
  const leadRateWindowMs = 10 * 60 * 1000;
  const leadRateLimitMax = 6;

  const getClientIp = (req: Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "unknown";
  };
  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    return res.status(200).json({ status: "ok" });
  });

  // Test email endpoint
  app.get("/api/test-email", async (req: Request, res: Response) => {
    try {
      const testData = {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Email",
        message: "This is a test email from your portfolio contact form."
      };

      const emailResult = await sendContactEmail(testData);
      if (!emailResult.success) {
        return res.status(500).json({ 
          message: "Failed to send test email",
          error: emailResult.emailError || "Email configuration is missing or invalid"
        });
      }

      return res.status(200).json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error("Error sending test email:", error);
      return res.status(500).json({ 
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API route for contact form submissions
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate request body against schema
      const validatedData = contactMessageSchema.parse(req.body);
      
      // Save contact message to storage
      const savedMessage = await storage.createContactMessage(validatedData);
      
      // Send email notification
      const emailResult = await sendContactEmail(validatedData);
      if (!emailResult.success) {
        return res.status(500).json({
          message: "Failed to send email",
          error: emailResult.emailError || "Email configuration is missing or invalid"
        });
      }
      
      // Return success response
      return res.status(201).json({ 
        message: "Message received successfully", 
        id: savedMessage.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = fromZodError(error).message;
        return res.status(400).json({ 
          message: "Invalid form data", 
          errors: errorMessage
        });
      }
      
      console.error("Error processing contact message:", error);
      return res.status(500).json({ 
        message: "Server error, please try again later"
      });
    }
  });

  // Lead capture endpoint for automation inquiries
  app.post("/api/lead", async (req: Request, res: Response) => {
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
          return res.status(429).json({
            message: "Too many submissions. Please try again shortly.",
          });
        }
      }

      const clientMetaInput = payload.client_meta || {};
      const honeypot = typeof clientMetaInput.honeypot === "string" ? clientMetaInput.honeypot : "";
      if (honeypot.trim().length > 0) {
        return res.status(200).json({ ok: true });
      }

      // Persist lead to storage (Firestore or in-memory fallback)
      let savedLead: any = null;
      try {
        savedLead = await storage.createLead({
          name: payload.full_name,
          email: payload.email,
          phone: payload.phone || null,
          company: payload.company || null,
          role: payload.role || null,
          inquiryType: payload.inquiry_type || null,
          primaryGoal: payload.primary_goal || null,
          tools: (payload.tools_in_use || []).join(", ") || payload.other_tools || null,
          volumeRange: payload.estimated_monthly_volume || null,
          message: payload.message,
          createdAt: new Date().toISOString(),
        } as any);
      } catch (storeErr) {
        console.error('Error saving lead to storage:', storeErr);
      }

      // Log an event in storage when possible
      try {
        await storage.createLeadEvent({
          leadId: savedLead?.id || Date.now(),
          eventType: 'received',
          metadata: { ip, referrer: req.get('referer') || '', userAgent: req.get('user-agent') || '' },
          createdAt: new Date().toISOString(),
        } as any);
      } catch (evtErr) {
        console.error('Failed to write lead event:', evtErr);
      }

      // Forward to external automation endpoint(s) if configured
      const forwardTargets: { name: string; url?: string }[] = [];
      if (process.env.N8N_WEBHOOK_URL) forwardTargets.push({ name: 'n8n', url: process.env.N8N_WEBHOOK_URL });
      if (process.env.CALENDLY_WEBHOOK_URL) forwardTargets.push({ name: 'calendly', url: process.env.CALENDLY_WEBHOOK_URL });

      const forwardPayload = {
        ...payload,
        id: savedLead?.id || null,
        client_meta: {
          ...clientMetaInput,
          ip,
          user_agent: req.get('user-agent') || '',
          referrer: req.get('referer') || clientMetaInput.referrer || '',
          timezone: clientMetaInput.timezone || '',
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

      // If a Calendly link is configured, return it (so front-end can show a scheduling CTA)
      const calendlyLink = process.env.CALENDLY_LINK || null;

      return res.status(200).json({ ok: true, calendlyLink });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = fromZodError(error).message;
        return res.status(400).json({
          message: "Invalid lead payload",
          errors: errorMessage,
        });
      }

      console.error("Error processing lead:", error);
      return res.status(500).json({
        message: "Server error, please try again later",
      });
    }
  });

  // AI Chat endpoint with Vercel AI Gateway
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Enhanced system prompt for comprehensive portfolio analysis
      const systemPrompt = `You are an expert AI assistant for Jeffery Addae's professional portfolio. Your role is to provide detailed, insightful analysis and answer questions about his work.

## JEFFERY'S PROFILE
**Name:** Jeffery Addae  
**Title:** Full-Stack Developer & AI Automation Specialist  
**Location:** Accra, Ghana  
**Experience:** 2+ years professional experience

## TECHNICAL EXPERTISE
**Primary Stack:**
- Frontend: React, Next.js, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Databases: Supabase, Firebase, MongoDB
- Cloud: Cloudinary, Vercel, AWS basics
- Tools: Git/GitHub, Figma, VS Code

**Core Skills (90%+ proficiency):**
1. React & Next.js Development
2. TypeScript Implementation
3. Supabase & Firebase Integration
4. Git & GitHub Workflows
5. Full-Stack Architecture
6. API Design & Integration
7. UI/UX Optimization
8. Cloud Service Integration

## PROJECT PORTFOLIO
1. **Data-Driven Web Application** - Full-stack app with React, Next.js, Supabase, real-time updates
2. **AI-Powered SaaS Platform** - SaaS with AI integrations, automated workflows, OpenAI API
3. **E-Commerce MVP** - Fast e-commerce with Stripe payments, Firebase auth
4. **Real-Time Analytics Dashboard** - Dashboard with Recharts, live data sync

## SERVICES OFFERED
- Full-Stack Development (React, Next.js, Node.js)
- Cloud & Database Integration (Supabase, Firebase)
- API Design & Integration (RESTful, GraphQL)
- UI/UX Optimization & Design Systems
- Automation & AI-Driven Systems (business workflow automation)
- MVP Building & Product Management

## INTERACTION GUIDELINES
1. Be professional, conversational, and insightful
2. Provide specific examples from his portfolio when relevant
3. For hiring/collaboration inquiries, guide to the contact page
4. Highlight relevant skills based on the question context
5. Offer technical insights and real-world applications
6. Keep responses concise but comprehensive (2-4 sentences)
7. Show enthusiasm about technology and problem-solving
8. When asked about comparisons, position Jeffery's strengths authentically

Respond naturally and helpfully to questions about Jeffery's skills, projects, experience, availability, or technical expertise.`;

      const messages = buildMessages(systemPrompt, conversationHistory, message);
      const vercelGatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
      const vercelGatewayKey = process.env.VERCEL_AI_GATEWAY_KEY;
      const openRouterKey = process.env.OPENROUTER_API_KEY || '';
      const model = process.env.AI_MODEL || (vercelGatewayUrl ? 'gpt-4o-mini' : 'meta-llama/llama-3.1-8b-instruct:free');

      // If there's no key configured, return a graceful fallback so the assistant still feels responsive
      if (!vercelGatewayKey && !openRouterKey) {
        return res.status(200).json({
          response: fallbackPortfolioSummary,
          conversationId: Date.now().toString()
        });
      }

      const useGateway = Boolean(vercelGatewayUrl && vercelGatewayKey);
      const endpoint = useGateway
        ? vercelGatewayUrl!
        : 'https://openrouter.ai/api/v1/chat/completions';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (useGateway) {
        headers['Authorization'] = `Bearer ${vercelGatewayKey}`;
      } else {
        headers['Authorization'] = `Bearer ${openRouterKey}`;
        headers['HTTP-Referer'] = process.env.APP_URL || 'http://localhost:3000';
        headers['X-Title'] = 'Jeffery Addae Portfolio';
      }

      const aiResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 400,
          temperature: 0.8,
          top_p: 0.95
        })
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI Gateway error:', aiResponse.status, errorText);
        throw new Error(`AI Gateway error: ${aiResponse.status}`);
      }

      const data = await aiResponse.json();
      const reply = data.choices?.[0]?.message?.content || fallbackPortfolioSummary;

      return res.status(200).json({ 
        response: reply,
        conversationId: Date.now().toString()
      });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      // Graceful fallback so users still get value if the AI call fails
      return res.status(200).json({ 
        message: "Fallback response",
        response: fallbackPortfolioSummary
      });
    }
  });
}
