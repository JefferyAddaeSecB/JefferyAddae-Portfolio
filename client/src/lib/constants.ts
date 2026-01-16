// ================================
// CORE SKILLS (CLIENT-FOCUSED)
// ================================
export const CORE_SKILLS = [
  {
    name: "AI Automation Systems",
    description:
      "Automating lead intake, follow-ups, reporting, and internal workflows using AI, APIs, and orchestration tools.",
  },
  {
    name: "Workflow Orchestration (n8n)",
    description:
      "Designing reliable multi-step workflows with triggers, integrations, error handling, and monitoring.",
  },
  {
    name: "Full-Stack Development",
    description:
      "Building fast, scalable web applications using React, TypeScript, Node.js, and modern architectures.",
  },
  {
    name: "Cloud & Database Systems",
    description:
      "Authentication, databases, storage, and deployment using Supabase, Firebase, PostgreSQL, and Vercel.",
  },
  {
    name: "API Design & Integrations",
    description:
      "Connecting third-party tools, webhooks, and internal systems into seamless workflows.",
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
// SKILL GROUPS (SKILLS PAGE)
// ================================
export const FRONTEND_SKILLS = [
  { name: "React.js", percentage: 94 },
  { name: "Next.js", percentage: 90 },
  { name: "TypeScript", percentage: 92 },
  { name: "Tailwind CSS", percentage: 90 },
  { name: "UI Systems & Components", percentage: 88 },
];

export const BACKEND_SKILLS = [
  { name: "Node.js", percentage: 90 },
  { name: "REST APIs", percentage: 92 },
  { name: "Supabase", percentage: 88 },
  { name: "PostgreSQL", percentage: 86 },
  { name: "Authentication & Security", percentage: 84 },
];

export const CLOUD_INTEGRATION_SKILLS = [
  { name: "n8n Workflows", percentage: 90 },
  { name: "OpenAI API", percentage: 88 },
  { name: "Webhooks & Integrations", percentage: 89 },
  { name: "Vercel Deployments", percentage: 86 },
  { name: "Monitoring & Alerts", percentage: 84 },
];

// ================================
// BIO (POSITIONING STATEMENT)
// ================================
export const BIO = {
  name: "Jeffery Addae",
  tagline: "AI Automation Specialist & Full-Stack Engineer",
  intro:
    "I work with growing businesses that are stuck doing repetitive manual work — lead intake, follow-ups, reporting, and internal operations — and turn those processes into automated systems that run quietly in the background.",
  philosophy: [
    "Automate before you hire — reduce cost before adding headcount",
    "Build systems that scale without human bottlenecks",
    "Deliver fast, iterate quickly, and optimize continuously",
  ],
};

// ================================
// PROJECTS (PROOF, NOT FANTASY)
// ================================
export const PROJECTS = [
  {
    slug: "lead-intake-qualification-system",
    category: "Lead Automation",
    title: "AI-Powered Lead Intake & Qualification System",
    problem: "Businesses lose leads and time due to manual follow-ups and unstructured inquiries.",
    bullets: [
      "Automatically captures and qualifies inbound leads",
      "Routes leads to the right workflow or response",
      "Reduces response time from hours to seconds",
    ],
    automationPattern: "Lead intake → AI qualification → CRM sync → Follow-up",
    techStack: ["n8n", "OpenAI", "Supabase", "React", "Node.js"],
    bestFor: "Agencies handling 20+ inbound leads/week",
    outcome: "Faster response times, higher lead conversion",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    link: "https://jeffery-addae-portfolio-web.vercel.app/",
    linkLabel: "Live Demo",
    github: "https://github.com/JefferyAddaeSecB",
    caseStudy: {
      problem:
        "The business needed a way to handle inbound requests without manual triage, delays, or missed opportunities.",
      solution:
        "I designed an automated system that connects forms, AI logic, and backend workflows to run silently in the background.",
      systemFlow: [
        "Form Submission",
        "AI Classification",
        "CRM Update",
        "Conditional Routing",
        "Automated Follow-Up",
      ],
      impact: ["Reduced manual handling", "Faster response time", "Scalable without hiring"],
      appliesTo: ["Agencies", "Coaches", "SaaS founders", "Service businesses"],
    },
  },
  {
    slug: "internal-ops-request-routing",
    category: "Internal Ops",
    title: "Internal Ops Request Routing & Approvals",
    problem: "Teams lose time routing internal requests through email and spreadsheets.",
    bullets: [
      "Centralizes requests into a single intake flow",
      "Auto-routes approvals based on rules and priority",
      "Creates clear status updates for every request",
    ],
    automationPattern: "Request form → AI classification → Approvals → Status tracking",
    techStack: ["n8n", "Notion", "Slack", "PostgreSQL", "Node.js"],
    bestFor: "Operations teams managing multi-step approvals",
    outcome: "Less email back-and-forth, faster internal delivery",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    link: "https://cemar-counseling-main-zip.vercel.app",
    linkLabel: "Live Demo",
    github: "https://github.com/JefferyAddaeSecB/Cemar-Counseling-Main-Zip",
    caseStudy: {
      problem:
        "The team needed to move internal requests without manual coordination or lost approvals.",
      solution:
        "I built an automated routing system that captures requests, applies logic, and keeps stakeholders in sync.",
      systemFlow: [
        "Request Intake",
        "AI Classification",
        "Approval Routing",
        "Status Update",
        "Activity Log",
      ],
      impact: ["Reduced email back-and-forth", "Clear ownership on every request", "Faster internal delivery"],
      appliesTo: ["Service businesses", "Operations teams", "Agencies", "SaaS founders"],
    },
  },
  {
    slug: "ai-support-assistant-triage",
    category: "AI Assistant",
    title: "AI Support Assistant & Ticket Triage",
    problem: "Support teams drown in repetitive questions and slow response times.",
    bullets: [
      "Drafts instant answers from a knowledge base",
      "Escalates complex tickets to humans",
      "Keeps CRM and ticket status in sync",
    ],
    automationPattern: "Ticket intake → AI response → Escalation rules → CRM update",
    techStack: ["OpenAI", "n8n", "Zendesk", "Supabase"],
    bestFor: "SaaS teams with growing support volume",
    outcome: "Faster first response, lighter support load",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop",
    linkLabel: "View System Flow",
    caseStudy: {
      problem:
        "The business needed faster support without scaling headcount or missing priority issues.",
      solution:
        "I implemented AI-assisted triage with routing rules and a clean escalation path for complex cases.",
      systemFlow: [
        "Ticket Intake",
        "AI Draft Response",
        "Priority Rules",
        "Human Escalation",
        "CRM Sync",
      ],
      impact: ["Reduced repetitive workload", "Faster response times", "Consistent support quality"],
      appliesTo: ["SaaS teams", "Customer success", "Support teams", "Service businesses"],
    },
  },
  {
    slug: "automated-reporting-dashboards",
    category: "Backend Automation",
    title: "Automated Reporting & Executive Dashboards",
    problem: "Reporting takes days because data lives in siloed tools.",
    bullets: [
      "Syncs data from spreadsheets and apps nightly",
      "Creates dashboards and alerts automatically",
      "Delivers weekly summaries to stakeholders",
    ],
    automationPattern: "Data sync → Transformation → Dashboard → Alerts",
    techStack: ["n8n", "PostgreSQL", "Metabase", "Node.js"],
    bestFor: "Leaders needing weekly performance visibility",
    outcome: "Always-on reporting without manual exports",
    image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&h=600&fit=crop",
    linkLabel: "View System Flow",
    caseStudy: {
      problem:
        "The team needed reliable reporting without manual exports or late updates.",
      solution:
        "I automated data syncs, transformations, and dashboard updates with alerting built in.",
      systemFlow: [
        "Data Sync",
        "Transformation",
        "Dashboard Update",
        "Alerting",
        "Weekly Summary",
      ],
      impact: ["Reduced manual reporting", "Faster decisions", "Always-on visibility"],
      appliesTo: ["Agencies", "Operations teams", "SaaS founders", "Finance leaders"],
    },
  },
  {
    slug: "client-intake-onboarding-flow",
    category: "Client Intake System",
    title: "Client Intake & Onboarding Automation",
    problem: "New clients slip through the cracks without consistent onboarding.",
    bullets: [
      "Collects intake data and required documents",
      "Creates tasks and timelines automatically",
      "Triggers onboarding emails and updates",
    ],
    automationPattern: "Intake form → Doc collection → Task creation → Welcome sequence",
    techStack: ["n8n", "Google Workspace", "Notion", "Slack"],
    bestFor: "Service businesses onboarding new clients weekly",
    outcome: "Smoother onboarding, fewer dropped handoffs",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
    linkLabel: "View System Flow",
    caseStudy: {
      problem:
        "Client onboarding required too many manual steps and inconsistent follow-ups.",
      solution:
        "I built an intake system that collects data, creates tasks, and triggers onboarding sequences automatically.",
      systemFlow: [
        "Client Intake",
        "Document Collection",
        "Task Creation",
        "Welcome Sequence",
        "Team Notifications",
      ],
      impact: ["Reduced onboarding delays", "Higher client satisfaction", "Less manual coordination"],
      appliesTo: ["Agencies", "Service businesses", "Consultancies", "SaaS teams"],
    },
  },
  {
    slug: "revenue-ops-crm-enrichment",
    category: "Revenue Ops",
    title: "Revenue Ops CRM Sync & Enrichment Pipeline",
    problem: "Revenue teams lose pipeline visibility when CRM data is incomplete or stale.",
    bullets: [
      "Enriches inbound leads with firmographic data",
      "Keeps CRM stages and owners accurate automatically",
      "Triggers alerts for stalled or high-value deals",
    ],
    automationPattern: "Lead enrichment → CRM update → Deal alerts → Weekly pipeline summary",
    techStack: ["n8n", "HubSpot", "Clearbit", "Slack", "PostgreSQL"],
    bestFor: "Revenue teams tracking fast-moving pipelines",
    outcome: "Cleaner CRM data, faster pipeline decisions",
    image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&h=600&fit=crop",
    linkLabel: "View System Flow",
    caseStudy: {
      problem:
        "Sales ops needed a reliable way to keep CRM data accurate without manual cleanup.",
      solution:
        "I built an enrichment and sync pipeline that updates records, assigns owners, and surfaces stalled deals.",
      systemFlow: [
        "Lead Enrichment",
        "CRM Update",
        "Owner Assignment",
        "Deal Alerts",
        "Pipeline Summary",
      ],
      impact: ["Cleaner CRM data", "Faster pipeline visibility", "Less manual upkeep"],
      appliesTo: ["SaaS founders", "Revenue teams", "Agencies", "Sales ops"],
    },
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
      "Jeffery doesn’t just build automations — he thinks in systems. He helped us map out our workflows, eliminate unnecessary manual steps, and design an automation foundation we’re now scaling on.",
    name: "Early-Stage Founder",
    title: "SaaS",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
  },
  {
    quote:
      "Before working with Jeffery, a lot of our processes lived in spreadsheets and inboxes. He helped connect everything into a single automated flow, which immediately reduced follow-ups and internal confusion.",
    name: "Operations Lead",
    title: "Service Business",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
  },
  {
    quote:
      "What stood out was Jeffery’s ability to simplify complex operations. He broke everything down clearly and built automation workflows that actually made day-to-day work easier — not more complicated.",
    name: "Startup Founder",
    title: "Early Stage",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop",
  },
  {
    quote:
      "Jeffery approaches automation with a systems mindset. He helped us identify bottlenecks we didn’t even realize were costing us time and showed how automation could fix them cleanly.",
    name: "Early-Stage Founder",
    title: "Pilot Project",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=120&h=120&fit=crop",
  },
  {
    quote:
      "Instead of over-engineering, Jeffery focused on fast, practical solutions. We automated one high-friction workflow first, saw immediate results, and now have a clear path to scale.",
    name: "Product Manager",
    title: "MVP Stage",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
  },
];

// ================================
// SOCIAL LINKS (CLIENT-FIRST)
// ================================
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
