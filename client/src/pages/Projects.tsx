import { motion } from "framer-motion";
import { PROJECTS } from "../lib/constants";
import { FaGithub } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "wouter";

type ProjectCategory =
  | "All"
  | "Revenue Ops"
  | "Lead Automation"
  | "Internal Ops"
  | "AI Assistant"
  | "Backend Automation"
  | "Client Intake System";

const Projects = () => {
  const [filter, setFilter] = useState<ProjectCategory>("All");
  const [filteredProjects, setFilteredProjects] = useState(PROJECTS);
  const [activeUseCase, setActiveUseCase] = useState<string | null>(null);

  useEffect(() => {
    if (filter === "All") {
      setFilteredProjects(PROJECTS);
    } else {
      setFilteredProjects(PROJECTS.filter(project => project.category === filter));
    }
  }, [filter]);

  // Handle hash-based scrolling
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  const useCases = [
    {
      slug: "ai-powered-lead-intake-qualification-system",
      title: "AI-Powered Lead Intake & Qualification System",
      category: "Lead Automation",
      oneSentence: "Automatically capture, qualify, and route inbound leads so no opportunities fall through the cracks.",
      problem: "Businesses lose leads and time due to manual follow-ups and unstructured inquiries. Teams spend hours sorting through form submissions, emails, and chat messages to identify qualified prospects.",
      systemBuilt: "Built with n8n workflows that integrate AI qualification, automated routing, and structured follow-ups. The system processes leads 24/7 without human intervention.",
      outcome: "Faster response times, higher lead conversion rates, and scalable lead handling as business grows.",
      tools: ["n8n", "OpenAI", "Supabase", "React", "Node.js"],
      integrations: ["HubSpot", "Zapier", "Google Forms", "Slack"]
    },
    {
      slug: "internal-ops-request-routing-approvals",
      title: "Internal Ops Request Routing & Approvals",
      category: "Internal Ops",
      oneSentence: "Centralize internal requests and automate routing based on type, priority, and team capacity.",
      problem: "Teams lose time routing internal requests through email and spreadsheets. Managers spend hours tracking approvals and status updates across multiple channels.",
      systemBuilt: "Centralized request intake with intelligent routing based on request type, priority, and team capacity. Automated approval workflows with real-time status tracking.",
      outcome: "Less email back-and-forth, faster internal delivery, and clear visibility into request status and bottlenecks.",
      tools: ["n8n", "Notion", "Slack", "PostgreSQL", "Node.js"],
      integrations: ["Google Workspace", "Microsoft Teams", "Jira", "Trello"]
    },
    {
      slug: "ai-support-assistant-ticket-triage",
      title: "AI Support Assistant & Ticket Triage",
      category: "AI Assistant",
      oneSentence: "AI-powered knowledge base with instant answers and intelligent ticket routing.",
      problem: "Support teams drown in repetitive questions and slow response times. Customers wait hours for answers to common questions while support staff handles complex issues.",
      systemBuilt: "AI-powered knowledge base with natural language processing, intelligent escalation rules, and seamless CRM integration for complete ticket lifecycle management.",
      outcome: "Faster first response, reduced support team workload, and consistent responses from knowledge base.",
      tools: ["OpenAI", "n8n", "Zendesk", "Supabase"],
      integrations: ["Intercom", "Freshdesk", "Salesforce", "HubSpot"]
    },
    {
      slug: "automated-reporting-executive-dashboards",
      title: "Automated Reporting & Executive Dashboards",
      category: "Backend Automation",
      oneSentence: "Data pipeline that aggregates from multiple sources and generates executive-ready dashboards.",
      problem: "Reporting takes days because data lives in siloed tools. Executives lack real-time visibility into key metrics and trends.",
      systemBuilt: "Data pipeline that aggregates from multiple sources, transforms data automatically, and generates executive-ready dashboards with alerting capabilities.",
      outcome: "Always-on reporting without manual data exports, real-time business intelligence, and data-driven decisions.",
      tools: ["n8n", "PostgreSQL", "Metabase", "Node.js"],
      integrations: ["Google Analytics", "Stripe", "QuickBooks", "Tableau"]
    },
    {
      slug: "client-intake-onboarding-automation",
      title: "Client Intake & Onboarding Automation",
      category: "Client Intake System",
      oneSentence: "Document collection workflow with automated task creation and triggered communication sequences.",
      problem: "New clients slip through the cracks without consistent onboarding. Teams struggle to collect required documents and maintain consistent communication.",
      systemBuilt: "Document collection workflow with automated task creation, timeline management, and triggered communication sequences for smooth client onboarding.",
      outcome: "Smoother onboarding, fewer dropped handoffs, standardized process for all clients, and consistent client experience.",
      tools: ["n8n", "Google Workspace", "Notion", "Slack"],
      integrations: ["DocuSign", "Dropbox", "Calendly", "Zoom"]
    },
    {
      slug: "revenue-ops-crm-sync-enrichment-pipeline",
      title: "Revenue Ops CRM Sync & Enrichment Pipeline",
      category: "Revenue Ops",
      oneSentence: "Lead enrichment pipeline with automated CRM updates and intelligent deal tracking.",
      problem: "Revenue teams lose pipeline visibility when CRM data is incomplete or stale. Sales reps struggle with inconsistent lead information and deal tracking.",
      systemBuilt: "Lead enrichment pipeline with firmographic data, automated CRM updates, deal stage tracking, and intelligent alerting for sales team action.",
      outcome: "Cleaner CRM data, faster pipeline decisions, proactive alerts for stalled deals, and complete lead lifecycle tracking.",
      tools: ["n8n", "HubSpot", "Clearbit", "Slack", "PostgreSQL"],
      integrations: ["Salesforce", "Pipedrive", "ZoomInfo", "LinkedIn Sales Navigator"]
    }
  ];

  const categories: ProjectCategory[] = [
    "All",
    "Revenue Ops",
    "Lead Automation",
    "Internal Ops",
    "AI Assistant",
    "Backend Automation",
    "Client Intake System",
  ];

  const badgeClasses: Record<Exclude<ProjectCategory, "All">, string> = {
    "Revenue Ops": "bg-emerald-500/15 text-emerald-400",
    "Lead Automation": "bg-primary/15 text-primary",
    "Internal Ops": "bg-sky-500/15 text-sky-400",
    "AI Assistant": "bg-violet-500/15 text-violet-400",
    "Backend Automation": "bg-amber-500/15 text-amber-500",
    "Client Intake System": "bg-rose-500/15 text-rose-400",
  };

  const patterns = [
    { title: "Lead Intake & Qualification", slug: "ai-powered-lead-intake-qualification-system" },
    { title: "Internal Ops Request Routing", slug: "internal-ops-request-routing-approvals" },
    { title: "AI Support Assistant", slug: "ai-support-assistant-ticket-triage" },
    { title: "Automated Reporting", slug: "automated-reporting-executive-dashboards" },
    { title: "Client Intake Automation", slug: "client-intake-onboarding-automation" },
    { title: "Revenue Ops CRM Sync", slug: "revenue-ops-crm-sync-enrichment-pipeline" },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-gradient-1 absolute w-[600px] h-[600px] top-0 right-0 opacity-10"></div>
        <div className="bg-gradient-2 absolute w-[500px] h-[500px] bottom-0 left-0 opacity-10"></div>
      </div>

      {/* Hero Section */}
      <section className="flex items-center justify-center relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            <span className="text-primary">Automation</span> Systems That Save{" "}
            <span className="text-primary">Time</span> &{" "}
            <span className="text-primary">Scale</span>
          </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
              Real automation systems built to eliminate manual work across lead intake, internal ops, reporting, and follow-ups — the same repeatable patterns I deploy for client businesses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <Link href="/contact?tab=booking">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Book Automation ROI Audit
                </motion.button>
              </Link>
              <Link href="#automation-patterns">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-card border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  View Use Cases
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 pb-20 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filter === category
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => {
            const projectSlug = project.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                id={`project-${projectSlug}`}
                className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[project.category as Exclude<ProjectCategory, "All">]}`}
                    >
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {project.title === "AI-Powered Lead Intake & Qualification System" && "Best for: Agencies handling 20+ inbound leads/week"}
                      {project.title === "Internal Ops Request Routing & Approvals" && "Best for: Operations teams managing multi-step approvals"}
                      {project.title === "AI Support Assistant & Ticket Triage" && "Best for: SaaS teams with growing support volume"}
                      {project.title === "Automated Reporting & Executive Dashboards" && "Best for: Leaders needing weekly performance visibility"}
                      {project.title === "Client Intake & Onboarding Automation" && "Best for: Service businesses onboarding new clients weekly"}
                      {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Best for: Revenue teams tracking fast-moving pipelines"}
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">What was broken:</span>{" "}
                        {project.title === "AI-Powered Lead Intake & Qualification System" && "Businesses lose leads and time due to manual follow-ups and unstructured inquiries."}
                        {project.title === "Internal Ops Request Routing & Approvals" && "Teams lose time routing internal requests through email and spreadsheets."}
                        {project.title === "AI Support Assistant & Ticket Triage" && "Support teams drown in repetitive questions and slow response times."}
                        {project.title === "Automated Reporting & Executive Dashboards" && "Reporting takes days because data lives in siloed tools."}
                        {project.title === "Client Intake & Onboarding Automation" && "New clients slip through the cracks without consistent onboarding."}
                        {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Revenue teams lose pipeline visibility when CRM data is incomplete or stale."}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">System built:</span>{" "}
                        {project.title === "AI-Powered Lead Intake & Qualification System" && "Automatically captures and qualifies inbound leads, routes leads to the right workflow or response, reduces response time from hours to seconds."}
                        {project.title === "Internal Ops Request Routing & Approvals" && "Centralizes requests into a single intake flow, auto-routes approvals based on rules and priority, creates clear status updates for every request."}
                        {project.title === "AI Support Assistant & Ticket Triage" && "Drafts instant answers from a knowledge base, escalates complex tickets to humans, keeps CRM and ticket status in sync."}
                        {project.title === "Automated Reporting & Executive Dashboards" && "Syncs data from spreadsheets and apps nightly, creates dashboards and alerts automatically, delivers weekly summaries to stakeholders."}
                        {project.title === "Client Intake & Onboarding Automation" && "Collects intake data and required documents, creates tasks and timelines automatically, triggers onboarding emails and updates."}
                        {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Enriches inbound leads with firmographic data, keeps CRM stages and owners accurate automatically, triggers alerts for stalled or high-value deals."}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Outcome:</span>{" "}
                        {project.title === "AI-Powered Lead Intake & Qualification System" && "Faster response times, higher lead conversion."}
                        {project.title === "Internal Ops Request Routing & Approvals" && "Less email back-and-forth, faster internal delivery."}
                        {project.title === "AI Support Assistant & Ticket Triage" && "Faster first response, lighter support load."}
                        {project.title === "Automated Reporting & Executive Dashboards" && "Always-on reporting without manual exports."}
                        {project.title === "Client Intake & Onboarding Automation" && "Smoother onboarding, fewer dropped handoffs."}
                        {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Cleaner CRM data, faster pipeline decisions."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 border-l-4 border-l-primary">
                    <p className="text-sm text-primary">
                      <span className="font-semibold">Category:</span> {project.category}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground opacity-75">
                    {project.technologies.join(" · ")}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/projects/${projectSlug}`}>
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                        View System
                      </span>
                    </Link>
                    {project.link ? (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
                      >
                        Live Demo
                      </a>
                    ) : (
                      <Link href={`/projects/${projectSlug}#system-flow`}>
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                          View System Flow
                        </span>
                      </Link>
                    )}
                </div>

                {project.github ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                  >
                    <FaGithub className="text-sm" />
                    <span>Code</span>
                  </a>
                ) : null}
              </div>
            </motion.div>
          );
          })}
        </div>

        <section id="automation-patterns" className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Automation Patterns I Build for Clients
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              These are proven, repeatable automation systems I deploy to remove manual work and keep businesses running smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => {
              const isActive = activeUseCase === pattern.slug;
              return (
                <div
                  key={pattern.title}
                  onClick={() => {
                    setActiveUseCase(pattern.slug);
                    setTimeout(() => {
                      const element = document.getElementById("use-case-details");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }, 100);
                  }}
                  className={`bg-card border rounded-xl p-5 transition-all cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {pattern.title}
                    </h3>
                    <span className={`text-sm ${isActive ? "text-primary font-semibold" : "text-primary"}`}>
                      View
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {activeUseCase && (
            <motion.div
              id="use-case-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12 bg-card border border-border rounded-2xl p-6 sm:p-8"
            >
              {(() => {
                const useCase = useCases.find(uc => uc.slug === activeUseCase);
                if (!useCase) return null;

                return (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {useCase.category}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        {useCase.oneSentence}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-3">Problem</h4>
                        <p className="text-muted-foreground">{useCase.problem}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-3">System Built</h4>
                        <p className="text-muted-foreground">{useCase.systemBuilt}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-foreground mb-3">Outcome</h4>
                      <p className="text-muted-foreground">{useCase.outcome}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                          Tools
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {useCase.tools.map((tool) => (
                            <span
                              key={tool}
                              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                          Integrations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {useCase.integrations.map((integration) => (
                            <span
                              key={integration}
                              className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                            >
                              {integration}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/contact?tab=booking">
                        <span className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer">
                          Book Automation ROI Audit
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          setActiveUseCase(null);
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }, 100);
                        }}
                        className="inline-flex items-center justify-center px-6 py-3 bg-card border border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
                      >
                        Back to Systems
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="bg-gradient-to-br from-primary/90 to-blue-600 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Want These Systems Built for Your Business?
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
                I’ll identify one high-friction workflow and show you exactly how to automate it — no obligation.
              </p>
              <Link href="/contact?tab=booking">
                <span className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                  Book a Free Automation ROI Audit
                </span>
              </Link>
              <p className="text-sm opacity-90 mt-4">
                No sales pitch. Just systems thinking.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
