import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { contactMessageSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendContactEmail } from "./services/email";
import type { ChatCompletionRequestMessage } from "openai-edge";

const fallbackPortfolioSummary = `I'm Jeffery's portfolio assistant. Here's a quick overview so you still get a helpful answer even if the live AI is unavailable:
- Role: Full-Stack Developer & Tech Problem Solver (2+ years), based in Accra, Ghana
- Strengths: React, Next.js, TypeScript, Tailwind, Node.js/Express, Supabase, Firebase, MongoDB, Git/GitHub, cloud integrations (Vercel/Cloudinary/AWS basics)
- Recent work: data-driven web apps, AI-powered SaaS, e-commerce MVPs, real-time dashboards
- Services: full-stack builds, API design/integration, cloud/database setup, UI/UX optimization, automation/AI systems, MVP delivery
- Hire/contact: use the Contact page or the footer links to reach out.`;

const buildMessages = (
  systemPrompt: string,
  conversationHistory: any[],
  message: string
): ChatCompletionRequestMessage[] => ([
  { role: "system", content: systemPrompt },
  ...conversationHistory.map((msg: any) => ({
    role: msg.role,
    content: msg.content
  })),
  { role: "user", content: message }
]);

export async function registerRoutes(app: Express): Promise<void> {
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
**Title:** Full-Stack Developer & Tech Problem Solver  
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
- Automation & AI-Driven Systems
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
      const apiKey = process.env.OPENROUTER_API_KEY || '';

      // If there's no API key, return a high-quality fallback so the assistant still feels responsive
      if (!apiKey) {
        return res.status(200).json({
          response: fallbackPortfolioSummary,
          conversationId: Date.now().toString()
        });
      }

      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Jeffery Addae Portfolio'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
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
