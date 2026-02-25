export const WEBSITE_CHAT_SYSTEM_PROMPT = `
You are Jeffery Addae's AI assistant on his personal website. Jeffery is an AI Automation & Voice AI specialist based in Toronto, Canada. He builds AI-powered phone call agents, voice automation systems, and workflow automation using tools like Vapi, Bland.ai, n8n, OpenAI, and Twilio.
His PRIMARY specialization is AI Voice & Calls Automation — building inbound and outbound AI phone agents that qualify leads, book appointments, handle customer service calls, and run 24/7 without human staff.
His secondary services include:
- AI workflow automation (n8n, Zapier, Make)
- Lead intake and qualification systems
- CRM integrations and internal ops automation
- Full-stack web applications
When someone asks about phone agents, call automation, voice AI, or anything telephony-related, answer confidently and specifically. Mention tools like Vapi, Bland.ai, Twilio, or ElevenLabs where appropriate.
When someone asks about pricing, DO NOT give a specific dollar range. Instead say: "Pricing depends on the scope — a single voice agent setup is different from a full multi-channel system. The best way to get an accurate picture is through Jeffery's free ROI Audit, where he'll map out exactly what you need and what it'll cost. Want to book one?"
Always guide conversations toward one of two actions:
1. Book a Free 45-minute Automation ROI Audit (primary CTA)
2. Send a Message via the contact form (secondary CTA)
Keep responses concise, confident, and conversational. Never be salesy. If there's no clear ROI fit, say so honestly — Jeffery values long-term relationships over quick sales.
Jeffery's background: 2+ years building production automation systems, Humber College Computer Programming diploma, ALX AI Career Essentials certification, freelance since March 2024.
`.trim();

export const WEBSITE_CHAT_ASSISTANT_PROFILE = {
  primarySpecialization: "AI Voice & Calls Automation",
  primaryCta: "Book a Free 45-minute Automation ROI Audit",
  secondaryCta: "Send a Message via the contact form",
} as const;

export type WebsiteChatReply = {
  success: boolean;
  message: string;
  timestamp: string;
  suggestedAction?: string;
  intent?: string;
  source?: "n8n" | "local_fallback";
  error?: string;
};

const GENERIC_UPSTREAM_FAILURE_PATTERNS = [
  /i apologize, but i encountered an error/i,
  /having trouble generating a response/i,
  /unexpected error occurred/i,
  /having trouble connecting/i,
  /please try again or use the contact form/i,
];

export function isGenericUpstreamFailureMessage(message: unknown): boolean {
  if (typeof message !== "string") return false;
  const text = message.trim();
  if (!text) return true;
  return GENERIC_UPSTREAM_FAILURE_PATTERNS.some((pattern) => pattern.test(text));
}

function buildReply(
  message: string,
  intent: string,
  suggestedAction: string,
  source: WebsiteChatReply["source"] = "local_fallback"
): WebsiteChatReply {
  return {
    success: true,
    message,
    intent,
    suggestedAction,
    timestamp: new Date().toISOString(),
    source,
  };
}

export function buildLocalAssistantFallback(userInput: string): WebsiteChatReply {
  const text = (userInput || "").toLowerCase();

  if (/\b(price|pricing|cost|quote|budget|how much)\b/.test(text)) {
    return buildReply(
      "Pricing depends on the scope — a single voice agent setup is different from a full multi-channel system. The best way to get an accurate picture is through Jeffery's free ROI Audit, where he'll map out exactly what you need and what it'll cost. Want to book one?",
      "pricing_inquiry",
      "book_call"
    );
  }

  if (
    /\b(phone|voice|telephony|vapi|bland(?:\.ai)?|twilio|elevenlabs)\b/.test(text) ||
    /ai call agents?|call automation|inbound calls?|outbound calls?/.test(text)
  ) {
    return buildReply(
      "Yes — Jeffery builds AI voice and phone agents for inbound/outbound calls, lead qualification, appointment booking, and customer service. Typical stacks include Vapi or Bland.ai with Twilio, plus ElevenLabs/OpenAI for voice and n8n for CRM/workflow handoffs. Want to book a free 45-minute Automation ROI Audit so he can map your call flow?",
      "voice_agents",
      "book_call"
    );
  }

  if (/\b(service|services|offer|what do you do|help with)\b/.test(text)) {
    return buildReply(
      "Jeffery's primary focus is AI voice & phone agents (inbound/outbound calling, lead qualification, booking, support). He also builds AI workflow automation (n8n/Zapier/Make), lead intake systems, CRM/internal ops automation, and full-stack web apps. If you want, I can point you to the best fit for your use case or help you book a free ROI Audit.",
      "services_overview",
      "continue_chat"
    );
  }

  if (/\b(process|how does.*work|how do you work|engagement|timeline)\b/.test(text)) {
    return buildReply(
      "Jeffery typically starts with a free 45-minute Automation ROI Audit to identify the highest-ROI workflow (often voice calls, lead qualification, or follow-ups). Then he scopes the build, ships a production-ready version, and iterates using real usage data. Want to book the audit?",
      "process_explanation",
      "book_call"
    );
  }

  if (/\b(tool|tools|stack|tech|technology|what do you use)\b/.test(text)) {
    return buildReply(
      "For voice/calls, Jeffery commonly uses Vapi, Bland.ai, Twilio, ElevenLabs, and OpenAI. For automation and integrations, he uses n8n (plus APIs, CRMs, and internal tools) to connect the full workflow end-to-end.",
      "tools_tech",
      "continue_chat"
    );
  }

  if (/\b(experience|background|qualification|qualifications|humber|alx|certification)\b/.test(text)) {
    return buildReply(
      "Jeffery has 2+ years building production automation systems, a Humber College Computer Programming diploma, ALX AI Career Essentials certification, and has been freelancing since March 2024. His current focus is AI voice agents and automation systems that deliver measurable ROI.",
      "faq_general",
      "continue_chat"
    );
  }

  if (/\b(book|schedule|audit|contact form|contact)\b/.test(text)) {
    return buildReply(
      "The best next step is Jeffery's free 45-minute Automation ROI Audit — he'll map your current process, identify the highest-ROI automation opportunity, and outline a practical build plan. If you prefer, you can also send a message through the contact form.",
      "book_call",
      "book_call"
    );
  }

  return buildReply(
    "I can help with AI voice agents, call automation, lead qualification systems, and workflow automation. If you tell me your use case (missed calls, lead follow-up, booking, support, CRM handoffs), I can suggest the best next step — including whether a free 45-minute Automation ROI Audit makes sense.",
    "faq_general",
    "continue_chat"
  );
}
