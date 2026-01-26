import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const PROOF_STATS = [
  { label: "Automations shipped", value: "8+" },
  { label: "Tools integrated", value: "15+" },
  { label: "Availability", value: "Open for projects" },
];

type TimelineType = "work" | "education";

type TimelineLink = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

type TimelineItem = {
  title: string;
  problem: string;
  organization: string;
  context: string;
  location: string;
  period: string;
  engagement: string;
  type: TimelineType;
  impact: string;
  built: string[];
  outcomes: string[];
  stack: string[];
  links?: TimelineLink[];
  why: string;
  flowPreview?: string;
};

const WORK_ITEMS: TimelineItem[] = [
  {
    title: "AI Automation Engineer (n8n) & Full-Stack Developer",
    problem: "Automate lead intake and internal workflows without adding headcount.",
    organization: "Freelance / Contract",
    context: "Built for startups, agencies, and internal ops teams",
    location: "Remote",
    period: "2024 - Present",
    engagement: "Contract",
    type: "work",
    impact: "Built automation-first systems that reduced manual work and kept teams moving faster.",
    built: [
      "Designed AI-powered workflows for lead intake, internal ops, and reporting",
      "Connected CRM, email, and spreadsheets into one pipeline with alerts",
      "Shipped dashboards + weekly summaries for decision-makers",
    ],
    outcomes: [
      "Reduced operational overhead by automating repeatable workflows",
      "Improved response times and system reliability",
      "Enabled teams to scale without adding headcount",
    ],
    stack: ["n8n", "OpenAI", "Supabase", "PostgreSQL", "Slack"],
    links: [
      { label: "See Lead Intake System", href: "/projects/lead-intake-qualification-system", variant: "primary" },
      { label: "View System Flow", href: "/projects/lead-intake-qualification-system#system-flow", variant: "secondary" },
    ],
    why: "These are the same system patterns I now deploy for clients to eliminate manual work and improve efficiency.",
    flowPreview: "Flow: Form → Qualification → CRM → Slack alerts → Follow-ups",
  },
  {
    title: "Automation & Integrations Developer",
    problem: "Unify tools and approvals so internal requests stop stalling.",
    organization: "Independent",
    context: "Automation for internal operations and revenue teams",
    location: "Remote",
    period: "2023 - 2024",
    engagement: "Freelance",
    type: "work",
    impact: "Delivered connected systems that removed data silos and simplified operations.",
    built: [
      "Automated internal ops routing + approvals to cut coordination delays",
      "Built CRM sync and enrichment pipelines for cleaner revenue data",
      "Implemented reporting automation to keep leadership updated weekly",
    ],
    outcomes: [
      "Fewer handoffs and faster internal delivery",
      "Cleaner CRM data and better pipeline visibility",
      "Less manual reporting for leadership teams",
    ],
    stack: ["n8n", "Notion", "HubSpot", "PostgreSQL", "Slack"],
    links: [
      { label: "See Reporting Automation", href: "/projects/internal-ops-request-routing", variant: "primary" },
      { label: "View System Flow", href: "/projects/internal-ops-request-routing#system-flow", variant: "secondary" },
    ],
    why: "These workflows map directly to the systems I build for clients who need reliable ops at scale.",
    flowPreview: "Flow: Request → Classification → Approvals → Status → Summary",
  },
  {
    title: "Full-Stack Developer (Automation + Systems)",
    problem: "Reduce support load while keeping response quality high.",
    organization: "Contract",
    context: "Support automation and backend workflows",
    location: "Remote",
    period: "2022 - 2023",
    engagement: "Part-time",
    type: "work",
    impact: "Shipped support automation that kept teams responsive without growing headcount.",
    built: [
      "Built AI-assisted support triage to reduce repetitive tickets",
      "Delivered secure backend workflows for automated notifications",
      "Improved system reliability with logging and monitoring hooks",
    ],
    outcomes: [
      "Lowered repetitive workload on support teams",
      "Faster customer response times",
      "More reliable system operations",
    ],
    stack: ["OpenAI", "Node.js", "Supabase", "Vercel"],
    links: [
      { label: "See Support Triage Flow", href: "/projects/ai-support-assistant-triage", variant: "primary" },
      { label: "View System Flow", href: "/projects/ai-support-assistant-triage#system-flow", variant: "secondary" },
    ],
    why: "This is the same approach I use to automate support and ops for client teams.",
    flowPreview: "Flow: Ticket → AI response → Escalation → CRM sync",
  },
];

const EDUCATION_ITEMS: TimelineItem[] = [
  {
    title: "Computer Programming",
    problem: "Technical foundation for automation-first systems and software delivery.",
    organization: "Humber College",
    context: "Diploma program focused on software, systems, and automation",
    location: "Toronto, Canada",
    period: "2021 - 2023",
    engagement: "Diploma",
    type: "education",
    impact: "Built a strong engineering base for automation, systems, and scalable web apps.",
    built: [
      "Focused on software engineering fundamentals and applied systems design",
      "Built automation-ready web apps and integration projects",
    ],
    outcomes: [
      "Clear grounding in system architecture and APIs",
      "Strong full-stack fundamentals with real projects",
    ],
    stack: ["JavaScript", "APIs", "Databases"],
    why: "This foundation supports the reliability and structure I bring to client systems.",
  },
  {
    title: "Automation & Integrations (Self-Directed)",
    problem: "Ongoing upskilling in automation platforms and AI workflows.",
    organization: "Independent",
    context: "Hands-on certification and self-directed training",
    location: "Remote",
    period: "2023 - Present",
    engagement: "Certification (in progress)",
    type: "education",
    impact: "Expanded automation expertise with applied AI and workflow delivery.",
    built: [
      "Hands-on projects with automation platforms and AI workflows",
      "Focus on reliability, monitoring, and scalable system design",
    ],
    outcomes: [
      "Faster delivery of automation systems",
      "Better monitoring and error handling practices",
    ],
    stack: ["n8n", "OpenAI", "Webhooks"],
    why: "Continual training keeps my client systems modern and reliable.",
  },
];

const PATTERNS = [
  {
    title: "Lead Intake & Qualification",
    description: "Capture, qualify, and route leads instantly.",
    stack: "n8n · OpenAI · Supabase",
    href: "/projects#use-cases",
  },
  {
    title: "CRM Sync & Enrichment",
    description: "Keep CRM data clean and always up to date.",
    stack: "n8n · HubSpot · Postgres",
    href: "/projects#use-cases",
  },
  {
    title: "AI Email Follow-Ups",
    description: "Automate response sequences with context.",
    stack: "n8n · OpenAI · Gmail",
    href: "/projects#use-cases",
  },
  {
    title: "Support Assistant & Triage",
    description: "Reduce ticket volume with AI routing.",
    stack: "OpenAI · n8n · Zendesk",
    href: "/projects#use-cases",
  },
  {
    title: "Reporting & Dashboards",
    description: "Ship weekly updates without manual exports.",
    stack: "Postgres · Metabase · n8n",
    href: "/projects#use-cases",
  },
  {
    title: "Client Onboarding Automation",
    description: "Collect docs and trigger onboarding workflows.",
    stack: "Notion · n8n · Slack",
    href: "/projects#use-cases",
  },
  {
    title: "Internal Ops Routing",
    description: "Route approvals and requests with clarity.",
    stack: "n8n · Notion · Slack",
    href: "/projects#use-cases",
  },
  {
    title: "Payments + Invoicing",
    description: "Automate billing notifications and updates.",
    stack: "Stripe · n8n · Postgres",
    href: "/projects#use-cases",
  },
];

const Experience: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TimelineType>("work");

  const items = useMemo(() => {
    return activeTab === "work" ? WORK_ITEMS : EDUCATION_ITEMS;
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 relative">
      {/* Background gradient effects */}
      <div className="bg-gradient-1 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -top-10 sm:-top-20 -left-10 sm:-left-20 opacity-20 z-0"></div>
      <div className="bg-gradient-2 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 opacity-20 z-0"></div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-10 relative z-10"
      >
        <div className="flex justify-center sm:justify-end mb-6">
          <a
            href="/assets/CV.pdf"
            className="text-sm text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Download Resume (PDF)
          </a>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          Proven Experience Building <span className="text-primary">Scalable Automation</span>{" "}
          & <span className="text-primary">Software Systems</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
          I’ve designed, built, and deployed production-ready systems for startups, agencies, and internal teams — focused on automation,
          efficiency, and ROI.
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-3">
          Focus areas: Lead intake • CRM sync • Internal ops • Reporting • AI assistants
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-10">
        {[
          "Automation-first systems",
          "Fast turnaround",
          "Secure by default",
          "Documented workflows",
          "Production deployment",
        ].map((label) => (
          <span
            key={label}
            className="px-4 py-2 rounded-full bg-card/60 border border-border text-xs sm:text-sm text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Proof Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 relative z-10">
        {PROOF_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-card/60 border border-border rounded-xl p-4 text-center"
          >
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10 relative z-10">
        <div className="inline-flex rounded-full bg-muted/40 border border-border p-1">
          {["work", "education"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TimelineType)}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "work" ? "Work Experience" : "Technical Foundation"}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative max-w-5xl mx-auto"
      >
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 transform md:-translate-x-1/2"></div>
        <div className="space-y-10">
          {items.map((item, index) => (
            <React.Fragment key={`${item.title}-${index}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row gap-6 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background flex items-center justify-center z-10">
                  {item.type === "work" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                  )}
                </div>

                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                  index % 2 === 0 ? "md:text-right" : "md:text-left"
                }`}>
                  <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                    <div className={`inline-flex items-center gap-2 mb-3 ${
                      index % 2 === 0 ? "md:float-right md:ml-3" : "md:float-left md:mr-3"
                    }`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.type === "work"
                          ? "bg-primary/10 text-primary"
                          : "bg-green-500/10 text-green-500"
                      }`}>
                        {item.type === "work" ? "Work" : "Technical Foundation"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted/50 text-muted-foreground">
                        {item.engagement}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-1 clear-both">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.problem}
                    </p>
                    <p className="text-primary font-semibold mb-1">
                      {item.organization}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {item.context}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                          <line x1="16" x2="16" y1="2" y2="6"></line>
                          <line x1="8" x2="8" y1="2" y2="6"></line>
                          <line x1="3" x2="21" y1="10" y2="10"></line>
                        </svg>
                        {item.period}
                      </span>
                    </div>

                    <p className={`text-sm text-muted-foreground mb-4 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}>
                      <span className="font-semibold text-foreground">Impact:</span> {item.impact}
                    </p>

                    <div className={`mb-4 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">What I Built</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {item.built.map((desc) => (
                          <li key={desc} className="flex items-start gap-2">
                            <span className={`flex-shrink-0 mt-1 ${
                              index % 2 === 0 ? "md:order-2" : ""
                            }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                            <span className="flex-1">{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`mb-4 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Business Outcomes</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {item.outcomes.map((desc) => (
                          <li key={desc} className="flex items-start gap-2">
                            <span className={`flex-shrink-0 mt-1 ${
                              index % 2 === 0 ? "md:order-2" : ""
                            }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                            <span className="flex-1">{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-full text-xs bg-muted/60 text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <p className={`text-xs text-muted-foreground mt-4 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}>
                      <span className="font-semibold text-foreground">Why this matters:</span> {item.why}
                    </p>

                    {item.links ? (
                      <div className={`mt-5 flex flex-col sm:flex-row gap-3 ${
                        index % 2 === 0 ? "md:justify-end" : "md:justify-start"
                      }`}>
                        {item.links.map((link) => (
                          <Link key={link.label} href={link.href}>
                            <span className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                              link.variant === "primary"
                                ? "bg-primary text-white hover:opacity-90"
                                : "bg-card border border-primary text-primary hover:bg-primary hover:text-white"
                            }`}>
                              {link.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {item.flowPreview ? (
                      <p className={`text-xs text-muted-foreground mt-3 ${
                        index % 2 === 0 ? "md:text-right" : "md:text-left"
                      }`}>
                        {item.flowPreview}
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.div>

              {activeTab === "work" && index === 1 ? (
                <div className="relative max-w-4xl mx-auto">
                  <div className="bg-card/60 border border-border rounded-2xl p-6 sm:p-8">
                    <p className="text-foreground font-semibold mb-2">
                      Want to see how this experience applies to your business?
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Explore the real automation systems I’ve built — or book a free audit.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/projects">
                        <span className="px-5 py-2.5 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                          View Automation Projects
                        </span>
                      </Link>
                      <Link href="/contact?tab=booking">
                        <span className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                          Book Free 45-minute Strategy Call
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Automation Patterns */}
      <section className="mt-16 sm:mt-20 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
            Automation Patterns I Deliver
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Reusable systems I deploy to remove manual work and keep ops moving.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PATTERNS.map((pattern) => (
            <a
              key={pattern.title}
              href={pattern.href}
              className="bg-card/50 border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
            >
              <h3 className="text-foreground font-semibold mb-2">{pattern.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
              <p className="text-xs text-muted-foreground">Typical stack: {pattern.stack}</p>
              <span className="text-xs text-primary mt-3 inline-flex">View Examples →</span>
            </a>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mt-16 relative z-10"
      >
        <div className="bg-gradient-to-br from-primary/90 to-blue-600 rounded-3xl p-10 md:p-14 text-white max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Want a workflow mapped for your business?
          </h2>
          <p className="text-base sm:text-lg mb-6 opacity-95">
            In 45 minutes, I’ll map your automation opportunities + next steps.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact?tab=booking">
              <span className="px-6 py-3 rounded-xl bg-white text-primary font-semibold hover:opacity-90 transition-all cursor-pointer">
                Book Free 45-minute Strategy Call
              </span>
            </Link>
            <Link href="/projects#use-cases">
              <span className="px-6 py-3 rounded-xl bg-white/10 border border-white/40 text-white font-semibold hover:bg-white/20 transition-all cursor-pointer">
                See Automation Use Cases
              </span>
            </Link>
          </div>
          <p className="text-xs sm:text-sm mt-4 opacity-90">
            Available for: Quick wins (1–2 weeks) • Monthly automation support • Full builds
          </p>
          <p className="text-xs sm:text-sm mt-4 opacity-90">
            No sales pitch — just systems thinking.
          </p>
        </div>
      </motion.div>
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40">
        <Link href="/contact?tab=booking">
          <span className="px-4 py-3 rounded-full bg-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer">
            Book Free 45-minute Strategy Call
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Experience;
