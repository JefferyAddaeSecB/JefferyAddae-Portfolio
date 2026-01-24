import { useRoute, Link } from "wouter";
import { PROJECTS } from "@/lib/constants";
import { motion } from "framer-motion";

const ProjectCaseStudy = () => {
  const [match, params] = useRoute("/projects/:slug");

  if (!match) {
    return null;
  }

  const project = PROJECTS.find((item) => {
    const itemSlug = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return itemSlug === params?.slug;
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Case Study Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This case study doesn’t exist yet. Try another project or book an audit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/projects">
              <span className="px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                Back to Projects
              </span>
            </Link>
            <Link href="/contact">
              <span className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                Book Free 45-minute Automation ROI Audit
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link href="/projects">
            <span className="text-sm text-primary font-semibold hover:underline cursor-pointer">
              ← Back to Automation Systems
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-4">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            {project.description}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1 text-sm">
            Category: {project.category}
          </div>
        </motion.div>

        <div className="mb-10 overflow-hidden rounded-2xl border border-border">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Problem Solved</h2>
            <p className="text-muted-foreground">
              {project.title === "AI-Powered Lead Intake & Qualification System" && "Businesses lose leads and time due to manual follow-ups and unstructured inquiries. This system automatically captures and qualifies inbound leads, routes them to the right workflow, and reduces response time from hours to seconds."}
              {project.title === "Internal Ops Request Routing & Approvals" && "Teams lose time routing internal requests through email and spreadsheets. This system centralizes requests into a single intake flow, auto-routes approvals based on rules and priority, and creates clear status updates for every request."}
              {project.title === "AI Support Assistant & Ticket Triage" && "Support teams drown in repetitive questions and slow response times. This AI assistant drafts instant answers from a knowledge base, escalates complex tickets to humans, and keeps CRM and ticket status in sync."}
              {project.title === "Automated Reporting & Executive Dashboards" && "Reporting takes days because data lives in siloed tools. This system syncs data nightly, creates dashboards automatically, and delivers weekly summaries to stakeholders."}
              {project.title === "Client Intake & Onboarding Automation" && "New clients slip through the cracks without consistent onboarding. This system collects intake data and documents, creates automated task timelines, and triggers onboarding emails and updates."}
              {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Revenue teams lose pipeline visibility when CRM data is incomplete or stale. This system enriches leads with firmographic data, keeps CRM stages accurate, and triggers alerts for stalled deals."}
            </p>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Solution Architecture</h2>
            <p className="text-muted-foreground mb-4">
              {project.title === "AI-Powered Lead Intake & Qualification System" && "Built with n8n workflows that integrate AI qualification, automated routing, and structured follow-ups. The system processes leads 24/7 without human intervention."}
              {project.title === "Internal Ops Request Routing & Approvals" && "Centralized request intake with intelligent routing based on request type, priority, and team capacity. Automated approval workflows with real-time status tracking."}
              {project.title === "AI Support Assistant & Ticket Triage" && "AI-powered knowledge base with natural language processing, intelligent escalation rules, and seamless CRM integration for complete ticket lifecycle management."}
              {project.title === "Automated Reporting & Executive Dashboards" && "Data pipeline that aggregates from multiple sources, transforms data automatically, and generates executive-ready dashboards with alerting capabilities."}
              {project.title === "Client Intake & Onboarding Automation" && "Document collection workflow with automated task creation, timeline management, and triggered communication sequences for smooth client onboarding."}
              {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Lead enrichment pipeline with firmographic data, automated CRM updates, deal stage tracking, and intelligent alerting for sales team action."}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section id="system-flow" className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">System Flow</h2>
            <p className="text-muted-foreground mb-4">
              {project.title === "AI-Powered Lead Intake & Qualification System" && "Lead intake → AI qualification → CRM sync → Follow-up automation"}
              {project.title === "Internal Ops Request Routing & Approvals" && "Request form → AI classification → Approval routing → Status tracking"}
              {project.title === "AI Support Assistant & Ticket Triage" && "Ticket intake → AI response → Escalation rules → CRM update"}
              {project.title === "Automated Reporting & Executive Dashboards" && "Data sync → Transformation → Dashboard generation → Alerts"}
              {project.title === "Client Intake & Onboarding Automation" && "Intake form → Doc collection → Task creation → Welcome sequence"}
              {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Lead enrichment → CRM update → Deal alerts → Pipeline summary"}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {project.technologies.slice(0, 4).map((tech, index) => (
                <div key={tech} className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-full bg-background/60 border border-border text-sm text-foreground">
                    {tech}
                  </span>
                  {index < Math.min(project.technologies.length - 1, 3) ? (
                    <span className="text-muted-foreground">→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Business Impact</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  {project.title === "AI-Powered Lead Intake & Qualification System" && "Faster response times, higher lead conversion rates"}
                  {project.title === "Internal Ops Request Routing & Approvals" && "Less email back-and-forth, faster internal delivery"}
                  {project.title === "AI Support Assistant & Ticket Triage" && "Faster first response, reduced support team workload"}
                  {project.title === "Automated Reporting & Executive Dashboards" && "Always-on reporting without manual data exports"}
                  {project.title === "Client Intake & Onboarding Automation" && "Smoother onboarding, fewer dropped handoffs"}
                  {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Cleaner CRM data, faster pipeline decisions"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  {project.title === "AI-Powered Lead Intake & Qualification System" && "24/7 lead processing without human monitoring"}
                  {project.title === "Internal Ops Request Routing & Approvals" && "Clear visibility into request status and bottlenecks"}
                  {project.title === "AI Support Assistant & Ticket Triage" && "Consistent responses from knowledge base"}
                  {project.title === "Automated Reporting & Executive Dashboards" && "Real-time business intelligence for decision making"}
                  {project.title === "Client Intake & Onboarding Automation" && "Standardized onboarding process for all clients"}
                  {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Proactive alerts for stalled or high-value deals"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  {project.title === "AI-Powered Lead Intake & Qualification System" && "Scalable lead handling as business grows"}
                  {project.title === "Internal Ops Request Routing & Approvals" && "Reduced administrative overhead for managers"}
                  {project.title === "AI Support Assistant & Ticket Triage" && "Support team focus on complex issues only"}
                  {project.title === "Automated Reporting & Executive Dashboards" && "Data-driven decisions without manual analysis"}
                  {project.title === "Client Intake & Onboarding Automation" && "Consistent client experience across all projects"}
                  {project.title === "Revenue Ops CRM Sync & Enrichment Pipeline" && "Complete lead lifecycle tracking and insights"}
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Perfect For</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                Service Businesses
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                SaaS Companies
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                Growing Teams
              </span>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/contact">
              <span className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                Book a Free Automation ROI Audit
              </span>
            </Link>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
              >
                View Live Demo
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-card/80 transition-all"
              >
                View Source Code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCaseStudy;
