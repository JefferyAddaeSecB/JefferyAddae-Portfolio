// ================================
// CORE SKILLS (CLIENT-FOCUSED)
// ================================
export const CORE_SKILLS = [
  {
    name: "Lead Automation",
    description: "Capture, qualify, route. Never lose a lead again.",
    percentage: 92,
  },
  {
    name: "Observable Systems",
    description: "Logging, monitoring, alerts, recovery. Built-in.",
    percentage: 90,
  },
  {
    name: "Workflow Integration",
    description: "n8n, APIs, custom code. Reliable, together.",
    percentage: 90,
  },
  {
    name: "Production Engineering",
    description: "React, TypeScript, Node.js. Scales reliably.",
    percentage: 95,
  },
  {
    name: "AI Decision Making",
    description: "OpenAI, LangChain. Learns from real data.",
    percentage: 88,
  },
];

// ================================
// TOOLS & TECHNOLOGIES
// ================================
export const TOOLS = [
  { name: "React", percentage: 95, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "TypeScript", percentage: 92, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "Node.js", percentage: 92, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Supabase", percentage: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
  { name: "PostgreSQL", percentage: 88, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "OpenAI", percentage: 90, icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/openai.svg" },
  { name: "LangChain", percentage: 85, icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/langchain.svg" },
  { name: "n8n", percentage: 88, icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/n8n.svg" },
  { name: "Git & GitHub", percentage: 95, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "Vercel", percentage: 92, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" },
];

// ================================
// BIO (POSITIONING STATEMENT)
// ================================
export const BIO = {
  name: "Jeffery Addae",
  tagline: "AI Automation Specialist & Full-Stack Engineer",
  intro:
    "I help businesses eliminate manual work by building AI-powered automation systems and scalable web platforms. My focus is simple: reduce operational friction, save time, and increase ROI through smart engineering.",
  philosophy: [
    "Automate before you hire",
    "Build systems that scale without human bottlenecks",
    "Deliver fast, iterate faster, and optimize continuously",
  ],
};

// ================================
// PROJECTS (PROOF, NOT FANTASY)
// ================================
export const PROJECTS = [
  {
    title: "AI-Powered Lead Intake & Qualification System",
    description:
      "Businesses lose leads and time due to manual follow-ups and unstructured inquiries. Automatically captures and qualifies inbound leads, routes leads to the right workflow or response, and reduces response time from hours to seconds.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    category: "Lead Automation",
    categoryColor: "primary",
    technologies: ["n8n", "OpenAI", "Supabase", "React", "Node.js"],
    link: "https://jeffery-addae-portfolio-web.vercel.app/",
    github: "https://github.com/JefferyAddaeSecB",
  },
  {
    title: "Internal Ops Request Routing & Approvals",
    description:
      "Teams lose time routing internal requests through email and spreadsheets. Centralizes requests into a single intake flow, auto-routes approvals based on rules and priority, and creates clear status updates for every request.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    category: "Internal Ops",
    categoryColor: "sky",
    technologies: ["n8n", "Notion", "Slack", "PostgreSQL", "Node.js"],
    link: "https://example.com/internal-ops-demo",
    github: "https://github.com/JefferyAddaeSecB/internal-ops-system",
  },
  {
    title: "AI Support Assistant & Ticket Triage",
    description:
      "Support teams drown in repetitive questions and slow response times. Drafts instant answers from a knowledge base, escalates complex tickets to humans, and keeps CRM and ticket status in sync.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    category: "AI Assistant",
    categoryColor: "violet",
    technologies: ["OpenAI", "n8n", "Zendesk", "Supabase"],
    link: null,
    github: "https://github.com/JefferyAddaeSecB/ai-support-assistant",
  },
  {
    title: "Automated Reporting & Executive Dashboards",
    description:
      "Reporting takes days because data lives in siloed tools. Syncs data from spreadsheets and apps nightly, creates dashboards and alerts automatically, and delivers weekly summaries to stakeholders.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    category: "Backend Automation",
    categoryColor: "amber",
    technologies: ["n8n", "PostgreSQL", "Metabase", "Node.js"],
    link: null,
    github: "https://github.com/JefferyAddaeSecB/automated-reporting",
  },
  {
    title: "Client Intake & Onboarding Automation",
    description:
      "New clients slip through the cracks without consistent onboarding. Collects intake data and required documents, creates tasks and timelines automatically, and triggers onboarding emails and updates.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    category: "Client Intake System",
    categoryColor: "rose",
    technologies: ["n8n", "Google Workspace", "Notion", "Slack"],
    link: null,
    github: "https://github.com/JefferyAddaeSecB/client-intake-automation",
  },
  {
    title: "Revenue Ops CRM Sync & Enrichment Pipeline",
    description:
      "Revenue teams lose pipeline visibility when CRM data is incomplete or stale. Enriches inbound leads with firmographic data, keeps CRM stages and owners accurate automatically, and triggers alerts for stalled or high-value deals.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    category: "Revenue Ops",
    categoryColor: "emerald",
    technologies: ["n8n", "HubSpot", "Clearbit", "Slack", "PostgreSQL"],
    link: null,
    github: "https://github.com/JefferyAddaeSecB/revenue-ops-crm",
  },
];

// ================================
// SERVICES (SELL OUTCOMES)
// ================================
export const SERVICES = [
  {
    title: "AI Automation for Businesses",
    description:
      "I design AI-powered systems that automate repetitive tasks, internal workflows, and customer interactions.",
    features: [
      "Workflow automation with n8n",
      "AI agents & assistants",
      "CRM & form automation",
      "Email & notification systems",
    ],
  },
  {
    title: "Custom Web Platforms",
    description:
      "High-performance web applications built for speed, scalability, and conversion.",
    features: [
      "React & TypeScript frontends",
      "Secure backend APIs",
      "Authentication & databases",
      "Deployment & monitoring",
    ],
  },
  {
    title: "MVP & Startup Engineering",
    description:
      "Helping founders and teams go from idea to functional product fast.",
    features: [
      "Lean MVP builds",
      "Scalable architecture",
      "Iterative delivery",
      "Technical decision support",
    ],
  },
];

// ================================
// TESTIMONIALS (KEEP REALISTIC)
// ================================
export const TESTIMONIALS = [
  {
    quote:
      "Jeffery approaches development with a systems mindset. His ability to simplify complex workflows is impressive.",
    name: "Client Feedback",
    title: "Early-stage Founder",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
  },
  {
    quote:
      "Leads were lost in email. Now they're routed instantly. System runs quiet.",
    name: "Client Feedback",
    title: "Service Business Owner",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
  },
  {
    quote:
      "Before: spreadsheets, no visibility. After: logged, monitored, clear.",
    name: "Client Feedback",
    title: "Ops Director",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
  },
  {
    quote:
      "Requests scattered everywhere. Now captured, routed, tracked. No firefighting.",
    name: "Client Feedback",
    title: "SaaS Founder",
    avatar:
      "https://images.unsplash.com/photo-1507539066556-6812c9d1c72e?w=120&h=120&fit=crop",
  },
  {
    quote:
      "System owns the problem. We own the oversight. Alerts work. Runbooks exist.",
    name: "Client Feedback",
    title: "Operations Manager",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
  },
];


export const SOCIAL_LINKS = [
  {
    name: "GitHub",
    url: "https://github.com/JefferyAddaeSecB",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/jeffery-addae-297214398/",
  },
  {
    name: "Email",
    url: "mailto:jeffaddai40@gmail.com",
  },
];