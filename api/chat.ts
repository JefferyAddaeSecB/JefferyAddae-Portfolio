export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required' });
    }

    type OpenRouterResponse = {
      choices?: Array<{
        message?: { content?: string }
      }>
    };

    const fallbackPortfolioSummary = `I'm Jeffery's portfolio assistant. Here's a quick overview so you still get a helpful answer even if the live AI is unavailable:
- Role: Full-Stack Developer & Tech Problem Solver (2+ years), based in Canada
- Strengths: React, Next.js, TypeScript, Tailwind, Node.js/Express, Supabase, Firebase, MongoDB, Git/GitHub, cloud integrations
- Recent work: data-driven web apps, AI-powered SaaS, e-commerce MVPs, real-time dashboards
- Services: full-stack builds, API design/integration, cloud/database setup, UI/UX optimization, automation/AI systems, MVP delivery
- Hire/contact: use the Contact page or footer links to reach out.`;

    const systemPrompt = `You are an expert AI assistant for Jeffery Addae's professional portfolio. Your role is to provide detailed, insightful analysis and answer questions about his work.

## JEFFERY'S PROFILE
**Name:** Jeffery Addae  
**Title:** Full-Stack Developer  
**Location:** Canada  
**Experience:** 2+ years professional experience

## TECHNICAL EXPERTISE
**Primary Stack:**
- Frontend: React, Next.js, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Databases: Supabase, Firebase, MongoDB, PostgreSQL
- Cloud: Vercel, Cloudinary
- Tools: Git/GitHub, Figma

## SERVICES OFFERED
- Full-Stack Development (React, Next.js, Node.js)
- Cloud & Database Integration (Supabase, Firebase)
- API Design & Integration (RESTful, GraphQL)
- UI/UX Optimization & Design Systems
- Automation & AI-Driven Systems
- MVP Building & Product Management

Respond naturally and helpfully to questions about Jeffery's skills, projects, experience, availability, or technical expertise.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const apiKey = process.env.OPENROUTER_API_KEY || '';

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
        'HTTP-Referer': process.env.APP_URL || 'https://jeffery-portfolio.vercel.app',
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

    const data = (await aiResponse.json()) as OpenRouterResponse;
    const reply = data?.choices?.[0]?.message?.content || fallbackPortfolioSummary;

    return res.status(200).json({ 
      response: reply,
      conversationId: Date.now().toString()
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(200).json({ 
      message: 'Fallback response',
      response: fallbackPortfolioSummary
    });
  }
}
