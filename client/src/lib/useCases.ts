export type UseCaseCategory =
  | "Revenue Ops"
  | "Lead Automation"
  | "Internal Ops"
  | "AI Assistant"
  | "Backend Automation"
  | "Client Intake System";

export interface UseCaseMetric {
  label: string;
  value: string;
  note: string;
}

export interface UseCaseSourceFile {
  label: string;
  url: string;
}

export interface UseCase {
  slug: string;
  title: string;
  category: UseCaseCategory;
  summary: string;
  oneLiner: string;
  bestFor: string;
  problem: string;
  systemBuilt: string;
  outcome: string;
  image: string;
  technologies: string[];
  integrations: string[];
  workflowSteps: string[];
  reliabilityControls: string[];
  metrics: UseCaseMetric[];
  repoUrl: string;
  sourceFiles: UseCaseSourceFile[];
  workflowJsonPath: string;
  demoUrl: string;
}

const githubBase = "https://github.com/JefferyAddaeSecB";

export const USE_CASES: UseCase[] = [
  {
    slug: "ai-powered-lead-intake-qualification-system",
    title: "AI-Powered Lead Intake & Qualification System",
    category: "Lead Automation",
    summary:
      "Capture, score, and route inbound leads in seconds with AI-assisted qualification and deterministic routing rules.",
    oneLiner:
      "Automatically capture, qualify, and route inbound leads so high-intent buyers get handled first.",
    bestFor: "Agencies and service businesses handling 20+ inbound leads per week.",
    problem:
      "Lead data was coming from forms, website chat, and email with no unified intake. Follow-up delays were causing qualified prospects to go cold before sales saw them.",
    systemBuilt:
      "Built an n8n pipeline with webhook intake, normalization, AI lead scoring, CRM sync, owner assignment, and SLA notifications to sales in real time.",
    outcome:
      "Lead response time dropped from hours to minutes, routing became deterministic, and sales stopped missing high-priority leads.",
    image:
      "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "OpenAI", "HubSpot API", "PostgreSQL", "Slack"],
    integrations: ["Web Forms", "HubSpot", "Slack", "Email", "Custom Webhooks"],
    workflowSteps: [
      "Webhook receives lead payload from form/chat source",
      "Normalize payload and enrich with source metadata",
      "AI scoring + deterministic qualification rules",
      "Upsert contact/company in CRM and assign owner",
      "Post priority alert + create follow-up task"
    ],
    reliabilityControls: [
      "Structured logging for each lead event",
      "Retry policy on CRM write and notification nodes",
      "Dead-letter branch for invalid payloads",
      "Duplicate-lead guardrail using hashed identity keys",
      "Operational alerts for SLA misses"
    ],
    metrics: [
      { label: "Manual Work Removed", value: "8-14 hrs/week", note: "Lead triage + assignment" },
      { label: "Median Response Time", value: "< 5 min", note: "For qualified inbound leads" },
      { label: "Routing Accuracy", value: "99%+", note: "Based on deterministic assignment rules" }
    ],
    repoUrl: `${githubBase}/n8n-lead-intake-qualification-system`,
    sourceFiles: [
      {
        label: "n8n/workflow.json",
        url: `${githubBase}/n8n-lead-intake-qualification-system/blob/main/n8n/workflow.json`
      },
      {
        label: "README.md",
        url: `${githubBase}/n8n-lead-intake-qualification-system/blob/main/README.md`
      }
    ],
    workflowJsonPath: "/n8n-workflows/lead-intake-qualification-workflow.json",
    demoUrl: "/projects/ai-powered-lead-intake-qualification-system"
  },
  {
    slug: "internal-ops-request-routing-approvals",
    title: "Internal Ops Request Routing & Approvals",
    category: "Internal Ops",
    summary:
      "Centralized intake and approval routing for internal operations requests with priority-aware escalation.",
    oneLiner:
      "Replace inbox chaos with structured request routing, approvals, and status visibility.",
    bestFor: "Operations teams managing cross-functional requests and approvals.",
    problem:
      "Requests arrived through email and chat with inconsistent context. Approvals stalled because ownership and SLA expectations were unclear.",
    systemBuilt:
      "Implemented a unified request intake endpoint, policy-based routing, approval state machine, and status notifications for requesters and approvers.",
    outcome:
      "Approval latency dropped, request status became transparent, and managers regained predictable operational throughput.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "Notion API", "Slack", "Google Workspace", "PostgreSQL"],
    integrations: ["Google Forms", "Slack", "Notion", "Gmail", "Webhook APIs"],
    workflowSteps: [
      "Ingest standardized request payload",
      "Classify request type and urgency",
      "Route to approval chain by policy matrix",
      "Track status transitions with timestamps",
      "Notify requester and owners on every state change"
    ],
    reliabilityControls: [
      "Schema validation on all incoming requests",
      "Idempotent request IDs to prevent duplicates",
      "Timeout alerting for stalled approvals",
      "Audit trail for each status transition",
      "Fallback queue when downstream tools are unavailable"
    ],
    metrics: [
      { label: "Approval Turnaround", value: "-47%", note: "Median approval time reduction" },
      { label: "Request Visibility", value: "100%", note: "Every request has live status" },
      { label: "Ops Overhead", value: "-6 hrs/week", note: "Manager follow-up saved" }
    ],
    repoUrl: `${githubBase}/n8n-internal-ops-routing-approvals`,
    sourceFiles: [
      {
        label: "n8n/workflow.json",
        url: `${githubBase}/n8n-internal-ops-routing-approvals/blob/main/n8n/workflow.json`
      },
      {
        label: "README.md",
        url: `${githubBase}/n8n-internal-ops-routing-approvals/blob/main/README.md`
      }
    ],
    workflowJsonPath: "/n8n-workflows/internal-ops-routing-approvals-workflow.json",
    demoUrl: "/projects/internal-ops-request-routing-approvals"
  },
  {
    slug: "ai-support-assistant-ticket-triage",
    title: "AI Support Assistant & Ticket Triage",
    category: "AI Assistant",
    summary:
      "AI-assisted first response and triage pipeline that classifies tickets and escalates by confidence and severity.",
    oneLiner:
      "Deliver instant support drafts, route by severity, and keep the ticket queue focused on high-value issues.",
    bestFor: "SaaS support teams with growing ticket volume and repetitive issue patterns.",
    problem:
      "Support queues were overloaded with repetitive questions. Human agents spent too much time on low-complexity tickets while high-priority cases waited.",
    systemBuilt:
      "Built AI-assisted ticket triage with confidence scoring, suggested responses, policy-based escalation, and automated CRM/ticket updates.",
    outcome:
      "Support team workload shifted toward complex issues, first response times improved, and ticket handling became more predictable.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "OpenAI", "Zendesk API", "Supabase", "Slack"],
    integrations: ["Zendesk", "Intercom", "Knowledge Base", "Slack", "Email"],
    workflowSteps: [
      "Ticket event ingested from helpdesk webhook",
      "Classify intent + severity and compute confidence",
      "Generate suggested response for low-risk intents",
      "Escalate low-confidence/high-severity tickets to human queue",
      "Write triage metadata back to support platform"
    ],
    reliabilityControls: [
      "Confidence thresholds before auto-actions",
      "No auto-close policy on critical categories",
      "Audit logging for AI decisions and escalations",
      "Fallback templates when model endpoints fail",
      "Queue health alerts for backlog spikes"
    ],
    metrics: [
      { label: "First Response SLA", value: "2-4x faster", note: "Low complexity requests" },
      { label: "Agent Load", value: "-30% to -45%", note: "Repetitive ticket volume reduced" },
      { label: "Escalation Accuracy", value: "90%+", note: "Correct routing on high-severity tickets" }
    ],
    repoUrl: `${githubBase}/n8n-ai-support-ticket-triage`,
    sourceFiles: [
      {
        label: "n8n/workflow.json",
        url: `${githubBase}/n8n-ai-support-ticket-triage/blob/main/n8n/workflow.json`
      },
      {
        label: "README.md",
        url: `${githubBase}/n8n-ai-support-ticket-triage/blob/main/README.md`
      }
    ],
    workflowJsonPath: "/n8n-workflows/ai-support-ticket-triage-workflow.json",
    demoUrl: "/projects/ai-support-assistant-ticket-triage"
  },
  {
    slug: "automated-reporting-executive-dashboards",
    title: "Automated Reporting & Executive Dashboards",
    category: "Backend Automation",
    summary:
      "Scheduled data pipeline that syncs, transforms, and distributes decision-ready reporting to leadership.",
    oneLiner:
      "Replace manual exports with always-on reporting pipelines and executive-ready delivery.",
    bestFor: "Leadership teams that need weekly reporting without spreadsheet bottlenecks.",
    problem:
      "Performance data lived across siloed tools and required manual exports. Weekly reporting consumed analyst time and produced inconsistent metrics.",
    systemBuilt:
      "Implemented scheduled extraction, transformation logic, metric normalization, and automated distribution of KPI snapshots and alerts.",
    outcome:
      "Reporting became consistent, near real-time, and no longer blocked by manual data prep cycles.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "PostgreSQL", "Metabase API", "Google Sheets API", "Slack"],
    integrations: ["Google Analytics", "Stripe", "CRM", "Metabase", "Slack"],
    workflowSteps: [
      "Nightly/scheduled data extraction from source systems",
      "Transform + normalize KPI dataset",
      "Persist analytics-ready records in warehouse",
      "Trigger dashboard refresh and anomaly checks",
      "Publish executive summary to stakeholders"
    ],
    reliabilityControls: [
      "Source-level retries with exponential backoff",
      "Data quality checks before dashboard refresh",
      "Metric drift alerts for anomaly detection",
      "Execution logs with run-level trace IDs",
      "Backfill mode for missed schedule windows"
    ],
    metrics: [
      { label: "Reporting Cycle Time", value: "-70%", note: "Manual prep eliminated" },
      { label: "Data Freshness", value: "Daily / Intraday", note: "Configurable by source" },
      { label: "Leadership Visibility", value: "Always-on", note: "Automated KPI distribution" }
    ],
    repoUrl: `${githubBase}/n8n-automated-reporting-dashboards`,
    sourceFiles: [
      {
        label: "n8n/workflow.json",
        url: `${githubBase}/n8n-automated-reporting-dashboards/blob/main/n8n/workflow.json`
      },
      {
        label: "README.md",
        url: `${githubBase}/n8n-automated-reporting-dashboards/blob/main/README.md`
      }
    ],
    workflowJsonPath: "/n8n-workflows/automated-reporting-dashboards-workflow.json",
    demoUrl: "/projects/automated-reporting-executive-dashboards"
  },
  {
    slug: "client-intake-onboarding-automation",
    title: "Client Intake & Onboarding Automation",
    category: "Client Intake System",
    summary:
      "Automated onboarding pipeline for document collection, kickoff readiness, and timeline orchestration.",
    oneLiner:
      "Standardize onboarding from intake form to kickoff with zero dropped handoffs.",
    bestFor: "Service firms onboarding new clients weekly across multiple service lines.",
    problem:
      "Onboarding steps were inconsistent and manually coordinated through inbox threads. Missing documents and unclear ownership delayed project starts.",
    systemBuilt:
      "Created structured intake workflow with document checklist tracking, task creation, kickoff triggers, and milestone notifications.",
    outcome:
      "Onboarding quality became consistent, start delays dropped, and clients got a cleaner first-week experience.",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "Google Drive API", "Notion API", "Slack", "Calendly"],
    integrations: ["Intake Forms", "Google Drive", "Notion", "Slack", "Calendly"],
    workflowSteps: [
      "Capture intake details and project metadata",
      "Generate client workspace + checklist",
      "Create onboarding tasks by service template",
      "Track missing docs with reminder cadence",
      "Trigger kickoff scheduling when ready-state is met"
    ],
    reliabilityControls: [
      "Checklist completeness gates before kickoff",
      "Automated reminder retries with escalation",
      "Owner assignment for every onboarding stage",
      "Snapshot logging for compliance-sensitive docs",
      "Operational fallback when calendar API fails"
    ],
    metrics: [
      { label: "Onboarding Delays", value: "-40%", note: "Missing-doc bottlenecks reduced" },
      { label: "Process Consistency", value: "High", note: "Template-driven execution" },
      { label: "PM Coordination Time", value: "-5 hrs/week", note: "Automated reminders + tasks" }
    ],
    repoUrl: `${githubBase}/n8n-client-intake-onboarding-automation`,
    sourceFiles: [
      {
        label: "n8n/workflow.json",
        url: `${githubBase}/n8n-client-intake-onboarding-automation/blob/main/n8n/workflow.json`
      },
      {
        label: "README.md",
        url: `${githubBase}/n8n-client-intake-onboarding-automation/blob/main/README.md`
      }
    ],
    workflowJsonPath: "/n8n-workflows/client-intake-onboarding-workflow.json",
    demoUrl: "/projects/client-intake-onboarding-automation"
  },
  {
    slug: "revenue-ops-crm-sync-enrichment-pipeline",
    title: "Revenue Ops CRM Sync & Enrichment Pipeline",
    category: "Revenue Ops",
    summary:
      "Automated enrichment and CRM synchronization pipeline for cleaner pipeline analytics and faster sales action.",
    oneLiner:
      "Keep CRM records enriched, stage-accurate, and action-ready with automated pipeline intelligence.",
    bestFor: "RevOps and sales teams with stale CRM records and inconsistent pipeline hygiene.",
    problem:
      "Pipeline visibility was weak because CRM records lacked enrichment and stage hygiene. Sales managers reacted late to stalled opportunities.",
    systemBuilt:
      "Built enrichment + sync workflow that updates account intelligence, enforces stage hygiene rules, and triggers alerts on stalled/high-value deals.",
    outcome:
      "Pipeline data became trustworthy, sales prioritization improved, and stalled deals surfaced before revenue slipped.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "HubSpot", "Enrichment API", "PostgreSQL", "Slack"],
    integrations: ["HubSpot", "Salesforce", "Enrichment APIs", "Slack", "Email"],
    workflowSteps: [
      "Fetch target CRM records by freshness policy",
      "Call enrichment provider and normalize firmographics",
      "Apply stage hygiene and owner validation logic",
      "Upsert enriched fields and score opportunity health",
      "Alert RevOps on stalled/high-value opportunity events"
    ],
    reliabilityControls: [
      "Rate-limit aware API orchestration",
      "Idempotent upserts to avoid duplicate writes",
      "Field-level validation before CRM updates",
      "Stalled-deal rule engine with configurable thresholds",
      "End-to-end execution trace for auditability"
    ],
    metrics: [
      { label: "CRM Completeness", value: "90%+", note: "Critical enrichment fields filled" },
      { label: "Stalled Deal Detection", value: "Same day", note: "Policy-based alerting" },
      { label: "RevOps Manual Cleanup", value: "-6-10 hrs/week", note: "Automated hygiene routines" }
    ],
    repoUrl: `${githubBase}/n8n-revenue-ops-crm-sync`,
    sourceFiles: [
      {
        label: "n8n/workflow.json",
        url: `${githubBase}/n8n-revenue-ops-crm-sync/blob/main/n8n/workflow.json`
      },
      {
        label: "README.md",
        url: `${githubBase}/n8n-revenue-ops-crm-sync/blob/main/README.md`
      }
    ],
    workflowJsonPath: "/n8n-workflows/revenue-ops-crm-sync-workflow.json",
    demoUrl: "/projects/revenue-ops-crm-sync-enrichment-pipeline"
  }
];

export const USE_CASE_CATEGORIES: Array<"All" | UseCaseCategory> = [
  "All",
  "Revenue Ops",
  "Lead Automation",
  "Internal Ops",
  "AI Assistant",
  "Backend Automation",
  "Client Intake System"
];
