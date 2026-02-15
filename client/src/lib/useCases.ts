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

export interface UseCaseBeforeAfterMetric {
  metric: string;
  before: string;
  after: string;
  improvement: string;
}

export interface UseCaseSourceFile {
  label: string;
  url: string;
}

export interface UseCaseTestimonial {
  quote: string;
  attribution: string;
}

export interface UseCaseCta {
  title: string;
  subtitle: string;
  highlights: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface UseCasePolicyMatrixRow {
  requestType: string;
  approver: string;
  baseSla: string;
  escalationThreshold: string;
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
  whoItsFor?: string[];
  technicalHighlights?: string[];
  beforeAfterMetrics?: UseCaseBeforeAfterMetric[];
  deploymentTimeline?: string[];
  typicalInvestment?: string;
  testimonial?: UseCaseTestimonial;
  cta?: UseCaseCta;
  stateFlow?: string[];
  policyMatrix?: UseCasePolicyMatrixRow[];
}

const githubBase = "https://github.com/JefferyAddaeSecB";

export const USE_CASES: UseCase[] = [
  {
    slug: "ai-powered-lead-intake-qualification-system",
    title: "Lead Automation Pipeline That Cut Response Time to < 5 Minutes",
    category: "Lead Automation",
    summary:
      "Production-grade lead intake and routing engine that combines deterministic logic with AI scoring to prioritize high-intent pipeline instantly.",
    oneLiner:
      "Automatically capture, score, and route inbound leads so hot opportunities get handled first, every time.",
    bestFor: "B2B teams handling multi-source inbound volume and needing deterministic SLA-based routing.",
    problem:
      "Lead data was scattered across 4+ channels (forms, website chat, cold email replies, and event sources) with no unified intake. Reps were manually checking multiple systems, causing 6-12 hour follow-up delays and inconsistent prioritization. High-intent opportunities were getting buried in noise, with an estimated ~$25K/month in preventable pipeline leakage.",
    systemBuilt:
      "Built an n8n pipeline that accepts webhook leads from any source, normalizes 12+ payload variants, validates required fields, then scores each lead using a hybrid engine (65% deterministic rules, 35% AI signal). Leads are routed into hot/warm/cold SLA queues, upserted into CRM with owner assignment, and pushed to Slack + tasking channels in real time.",
    outcome:
      "Lead response time dropped from hours to minutes, routing became deterministic, and sales stopped missing high-priority leads.",
    image:
      "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "OpenAI", "HubSpot API", "PostgreSQL", "Slack"],
    integrations: ["Web Forms", "HubSpot", "Slack", "Email", "Custom Webhooks"],
    workflowSteps: [
      "Webhook intake captures leads from forms, chat, and email reply pipelines",
      "Normalization layer maps 12+ field variants and enforces schema checks",
      "Hybrid scoring engine combines rules (budget/timeline/source) with GPT signal using 65/35 weighting",
      "Priority router assigns hot/warm/cold tiers with deterministic SLA windows",
      "HubSpot upsert + owner assignment runs with retries and idempotent guardrails",
      "Slack and task notifications fire with score breakdown and lead context"
    ],
    reliabilityControls: [
      "Structured logging for each lead event",
      "Retry policy on CRM write and notification nodes",
      "Dead-letter branch for invalid payloads",
      "Duplicate-lead guardrail using hashed identity keys",
      "Operational alerts for SLA misses"
    ],
    whoItsFor: [
      "B2B teams processing 50+ inbound leads per month",
      "Sales orgs with leads split across forms, chat, and outbound replies",
      "Teams that need deterministic routing, not black-box auto-assignment",
      "Organizations with strict first-response SLAs"
    ],
    technicalHighlights: [
      "Idempotency keys generated from hashed lead fingerprints to prevent duplicate processing",
      "Dual-output workflow pattern separating routing alerts from persistence/logging",
      "Thresholds and weighting configurable via environment variables for controlled tuning",
      "Graceful degradation path: if AI fails, deterministic rules continue routing safely",
      "Retry policies + failure branches on CRM and notification nodes"
    ],
    beforeAfterMetrics: [
      { metric: "Median Response Time", before: "6-12 hours", after: "< 5 minutes", improvement: "98% faster" },
      { metric: "Manual Triage Load", before: "8-14 hrs/week", after: "< 1 hr/week", improvement: "85-93% reduction" },
      { metric: "Routing Accuracy", before: "~92%", after: "99%+", improvement: "+7pp" }
    ],
    deploymentTimeline: [
      "Week 1: Source mapping and ROI requirements",
      "Week 2: Intake + normalization + initial scoring build",
      "Week 3: CRM routing, SLA alerts, and edge-case handling",
      "Week 4: Load testing, QA sign-off, and go-live enablement"
    ],
    typicalInvestment: "$5,000-$8,000 depending on source complexity and assignment logic",
    testimonial: {
      quote:
        "We moved from manual triage to automated scoring and routing. Response times dropped from same-day to same-hour, and hot leads stopped slipping through.",
      attribution: "Head of Sales Operations, B2B Services"
    },
    cta: {
      title: "Want This System for Your Business?",
      subtitle:
        "I build custom lead automation pipelines for B2B teams that need reliable qualification, routing, and SLA execution.",
      highlights: [
        "Typical timeline: 3-4 weeks from kickoff to production",
        "Scope includes source integration, scoring calibration, and CRM sync",
        "Delivery includes reliability controls, runbooks, and operator handoff"
      ],
      primaryLabel: "Schedule a 30-Minute Strategy Call",
      primaryHref: "/contact?tab=booking",
      secondaryLabel: "Send a Message",
      secondaryHref: "/contact"
    },
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
    title: "Ops Approval Automation That Cut Turnaround Time by 47%",
    category: "Internal Ops",
    summary:
      "Dual-webhook approval system with policy-based routing, SLA tracking, and one-click decision capture for full operational accountability.",
    oneLiner:
      "Replace scattered requests with a deterministic approval state machine and complete audit visibility.",
    bestFor: "Operations teams handling cross-functional approvals with strict ownership and SLA requirements.",
    problem:
      "Requests were arriving through 6+ channels (email, Slack, forms, meeting notes, ad-hoc docs, and direct messages) with inconsistent context and no common intake contract. Approval chains stalled 3-5 days on average because ownership and SLA expectations were unclear, blocking roughly 40% of operational initiatives.",
    systemBuilt:
      "Built a production-grade dual-webhook n8n system: webhook #1 handles intake, validation, field normalization, risk scoring, SLA calculation, and policy-matrix routing (finance/security/legal/IT/HR/general). Approvers receive one-click approve/reject links via email, and webhook #2 captures action events, validates the actor/action payload, updates status in Notion/DB, and notifies requester + owners automatically.",
    outcome:
      "Median approval turnaround dropped from 6-8 days to 3.2 days (47% faster), stalled requests fell from ~40% to <2%, and request visibility reached 100% with full state-level auditability.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "Notion API", "Slack", "Google Workspace", "PostgreSQL"],
    integrations: ["Google Forms", "Slack", "Notion", "Gmail", "Webhook APIs"],
    workflowSteps: [
      "Validate request payload (required fields, email/domain checks, schema normalization)",
      "Classify request type and urgency (finance/security/legal/IT/HR/general)",
      "Calculate dynamic SLA windows (4h-24h) from type + priority modifiers",
      "Route by policy matrix and send one-click approve/reject links to assigned approver",
      "Capture approval actions via second webhook endpoint and validate state transition intent",
      "Persist every transition (received -> routed -> pending -> approved/rejected -> closed) with timestamp + actor",
      "Notify requester on every state change and alert owner on escalations/SLA risk"
    ],
    reliabilityControls: [
      "Schema validation on all incoming requests",
      "Idempotent request IDs to prevent duplicates",
      "Timeout alerting for stalled approvals",
      "Audit trail for each status transition",
      "Fallback queue when downstream tools are unavailable"
    ],
    whoItsFor: [
      "Operations teams processing 80+ internal requests per month",
      "Organizations with multi-team approval policies and compliance traceability needs",
      "Teams that need strict SLA governance for security/finance/legal workflows",
      "Leaders who need real-time request status without manual follow-up"
    ],
    technicalHighlights: [
      "Dual-webhook architecture separates intake processing from approval action capture",
      "Configurable approver mapping by request type with fallback ownership rules",
      "Dynamic SLA calculation and countdown tracking per request class",
      "One-click approve/reject email actions with signed, validated action payloads",
      "Hybrid scoring (70% deterministic + 30% AI) for escalation risk detection"
    ],
    beforeAfterMetrics: [
      { metric: "Approval Turnaround", before: "6-8 days", after: "3.2 days", improvement: "47% faster" },
      { metric: "Stalled Requests", before: "~40%", after: "<2%", improvement: "20x better" },
      { metric: "Status Visibility", before: "0% (email threads)", after: "100% (live tracking)", improvement: "Full transparency" },
      { metric: "Manager Follow-Up Load", before: "6 hrs/week", after: "< 1 hr/week", improvement: "85%+ reduction" }
    ],
    stateFlow: [
      "submitted",
      "validated",
      "classified",
      "routed",
      "pending_approval",
      "approved_or_rejected",
      "closed"
    ],
    policyMatrix: [
      { requestType: "Security", approver: "security-lead", baseSla: "4h", escalationThreshold: ">= 85" },
      { requestType: "Finance", approver: "finance-manager", baseSla: "8h", escalationThreshold: ">= 80" },
      { requestType: "Legal", approver: "legal-counsel", baseSla: "12h", escalationThreshold: ">= 75" },
      { requestType: "IT", approver: "it-admin", baseSla: "16h", escalationThreshold: ">= 70" },
      { requestType: "HR", approver: "hr-director", baseSla: "20h", escalationThreshold: ">= 70" },
      { requestType: "General", approver: "ops-manager", baseSla: "24h", escalationThreshold: ">= 70" }
    ],
    deploymentTimeline: [
      "Week 1: Discovery, policy mapping, and SLA definition",
      "Week 2: Intake webhook + validation + routing matrix implementation",
      "Week 3: Approval action webhook + one-click email flows",
      "Week 4: Observability hardening, escalation paths, and user acceptance testing",
      "Week 5: Team onboarding, runbooks, and production launch"
    ],
    typicalInvestment: "$8,000-$12,000 depending on policy complexity and integration depth",
    testimonial: {
      quote:
        "We replaced approval chaos with a clear system. Decisions move faster, ownership is obvious, and every request is traceable end-to-end.",
      attribution: "Operations Director, Multi-Team Services Org"
    },
    cta: {
      title: "Need This for Your Operations Team?",
      subtitle:
        "I build approval automation systems for teams drowning in scattered requests, unclear ownership, and missed SLA windows.",
      highlights: [
        "Unified intake endpoint across forms, chat, and email",
        "Policy-based routing with one-click interactive approvals",
        "State-level audit trails, escalation alerts, and operator runbooks"
      ],
      primaryLabel: "Schedule Discovery Call",
      primaryHref: "/contact?tab=booking",
      secondaryLabel: "Send a Message",
      secondaryHref: "/contact?tab=message"
    },
    metrics: [
      { label: "Approval Turnaround", value: "-47%", note: "Median approval time reduction" },
      { label: "Request Visibility", value: "100%", note: "Every request has live status" },
      { label: "Approval Success Rate", value: "94%", note: "Requests resolved vs abandoned" }
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
    title: "AI Ticket Triage System That Cut Agent Load by 45%",
    category: "AI Assistant",
    summary:
      "Hybrid AI + rules support pipeline with three-tier queue routing, queue-based SLAs, and instant customer confirmation with trackable ticket IDs.",
    oneLiner:
      "Route every ticket to urgent-human, human, or ai-assisted in seconds while keeping escalation decisions auditable.",
    bestFor: "SaaS support teams handling 500+ tickets/month across web, chat, and email channels.",
    problem:
      "Support was handling 800+ tickets per month across email, web forms, and in-app chat with no unified intake or reliable priority model. Agents spent ~60% of their time on repetitive requests while outage and security-related tickets waited in the same queue for 8-12 hours. Missing ticket IDs caused duplicate submissions and status confusion.",
    systemBuilt:
      "Built a production-grade n8n triage engine with multi-layer validation (length checks, spam pattern filtering, optional CAPTCHA, domain rules), ticket ID generation, and hybrid scoring (60% deterministic keyword/severity logic + 40% AI signal). The system routes tickets into urgent-human (1h SLA), human (8h SLA), or ai-assisted (24h SLA), sends customer confirmation with queue + ETA + tracking ID, and triggers owner alerts only on urgent tickets to prevent alert fatigue.",
    outcome:
      "After rollout, 60% of inbound tickets moved to ai-assisted handling with instant acknowledgement, reducing human ticket load by 45%. Urgent first response dropped from 8-12 hours to under 1 hour (95% SLA adherence), duplicate submissions fell below 3%, and customer satisfaction rose from 68% to 87%.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "OpenAI", "Zendesk API", "Supabase", "Slack"],
    integrations: ["Zendesk", "Intercom", "Knowledge Base", "Slack", "Email"],
    workflowSteps: [
      "Ingest ticket events from helpdesk/web form/webhook channels",
      "Validate payload (email format, required fields, message length, spam/captcha/domain checks)",
      "Generate unique ticket ID for customer tracking and dedupe key generation",
      "Score severity with hybrid engine (deterministic priority rules + AI context analysis)",
      "Route to three-tier queue: urgent-human, human, or ai-assisted",
      "Assign queue-specific SLA deadline and escalation behavior",
      "Send customer auto-response with ticket ID, queue assignment, ETA, and tracking link",
      "Notify Slack channels and owner only for urgent queues, then persist triage metadata"
    ],
    reliabilityControls: [
      "Confidence thresholds before auto-actions",
      "No auto-close policy on critical categories",
      "Audit logging for AI decisions and escalations",
      "Fallback templates when model endpoints fail",
      "Queue health alerts for backlog spikes",
      "Idempotency keys to block duplicate ticket processing"
    ],
    whoItsFor: [
      "Support teams with repetitive inbound volume and inconsistent prioritization",
      "Teams that need guaranteed first-response SLAs for urgent incidents",
      "Organizations requiring transparent AI triage with human override paths",
      "Ops leaders who need lower ticket noise without sacrificing service quality"
    ],
    technicalHighlights: [
      "Three-tier queue model (urgent-human, human, ai-assisted) with SLA-aware routing",
      "Max-priority deterministic scoring avoids inflated scores from stacked weak keywords",
      "Professional ticket IDs (TKT-{timestamp}-{hash}) support customer tracking and dedupe",
      "Customer auto-response includes queue, ETA, and tracking link immediately after intake",
      "Conditional notifications keep owner alerts limited to urgent tickets only"
    ],
    beforeAfterMetrics: [
      { metric: "Urgent First Response", before: "8-12 hours", after: "< 1 hour", improvement: "95% SLA met" },
      { metric: "Human Ticket Load", before: "800/mo", after: "440/mo", improvement: "-45%" },
      { metric: "AI-Assisted Handling", before: "0%", after: "60%", improvement: "+60pp automation" },
      { metric: "Duplicate Submissions", before: "~22%", after: "<3%", improvement: "7x better" },
      { metric: "Customer Satisfaction", before: "68%", after: "87%", improvement: "+19 points" }
    ],
    stateFlow: [
      "ticket_received",
      "validated",
      "scored",
      "queued",
      "responded",
      "resolved"
    ],
    policyMatrix: [
      { requestType: "urgent-human", approver: "assigned agent + owner", baseSla: "1h", escalationThreshold: "score >= 70" },
      { requestType: "human", approver: "agent pool", baseSla: "8h", escalationThreshold: "45 <= score < 70" },
      { requestType: "ai-assisted", approver: "AI responder + KB", baseSla: "24h", escalationThreshold: "score < 45 + safe intent" }
    ],
    deploymentTimeline: [
      "Week 1: Intake mapping, policy design, and SLA definition",
      "Week 2: Validation + scoring + queue routing implementation",
      "Week 3: Customer response templates, escalation paths, and QA",
      "Week 4: Ops training, dashboard checks, and go-live"
    ],
    typicalInvestment: "$6,000-$10,000 depending on ticket sources, policy rules, and integration depth",
    testimonial: {
      quote:
        "The triage pipeline took repetitive load off the team immediately. We respond faster on urgent issues and customers finally get clear status updates.",
      attribution: "Support Lead, B2B SaaS"
    },
    cta: {
      title: "Want This Triage System for Your Support Team?",
      subtitle:
        "I build AI-assisted support routing systems with strict SLA controls, human override paths, and customer-visible tracking.",
      highlights: [
        "3-tier queue routing with deterministic + AI scoring",
        "Instant customer acknowledgement with ticket ID and ETA",
        "Urgent-only owner escalation to reduce alert fatigue"
      ],
      primaryLabel: "Book Support Automation Audit",
      primaryHref: "/contact?tab=booking",
      secondaryLabel: "Send a Message",
      secondaryHref: "/contact?tab=message"
    },
    metrics: [
      { label: "Urgent Response SLA", value: "< 1h", note: "95% adherence on critical queues" },
      { label: "Agent Load", value: "-45%", note: "Human-handled volume reduced" },
      { label: "Escalation Accuracy", value: "90%+", note: "Correct urgent routing outcomes" }
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
    title: "Statistical KPI Engine with Z-Score Anomaly Detection",
    category: "Backend Automation",
    summary:
      "Automated executive reporting pipeline that computes 9 KPIs from live HubSpot data, runs statistical anomaly detection, and delivers decision-ready daily briefs.",
    oneLiner:
      "Replace manual Monday reporting with daily KPI intelligence, historical trending, and anomaly alerts.",
    bestFor: "Revenue and leadership teams that need reliable KPI reporting without manual spreadsheet workflows.",
    problem:
      "Revenue reporting required manual HubSpot exports, spreadsheet cleanup, and hand-built summaries that consumed 4-6 analyst hours each week. Metrics varied depending on who ran the report, historical trends were missing, and anomaly detection was effectively quarterly because no statistical monitoring existed.",
    systemBuilt:
      "Built a production-grade analytics workflow that pulls live HubSpot deals daily, parses flexible field/date formats, computes 9 KPIs in a single pass, and applies z-score-based anomaly detection on rolling historical revenue. The system adds AI-generated executive narrative context, formats currency/trend signals for leadership readability, and routes normal/watch/critical outputs across Notion, Gmail, and Slack with data-quality transparency.",
    outcome:
      "Manual report prep dropped from 4-6 hours/week to zero, KPI freshness improved from weekly snapshots to 24-hour cadence, and anomaly visibility shifted from reactive quarterly reviews to daily statistical alerts.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "HubSpot API", "OpenAI", "Notion API", "Gmail API"],
    integrations: ["HubSpot", "Notion", "Gmail", "Slack", "Dashboard Links"],
    workflowSteps: [
      "Extract live deal data from HubSpot on a 24-hour schedule",
      "Parse 6+ field variations and 3 date formats into standardized KPI inputs",
      "Compute 9 core metrics (revenue, prior day, week/month totals, pipeline, open/won/stale counts, deltas)",
      "Run statistical anomaly detection using rolling historical mean/stdDev and z-score",
      "Generate AI executive narrative with score/severity context and confidence",
      "Format executive digest with currency precision, trend indicators, and data-quality flags",
      "Distribute by severity path: Notion log, owner email digest, and Slack for critical anomalies"
    ],
    reliabilityControls: [
      "Source-level retries with exponential backoff",
      "Data quality checks before dashboard refresh",
      "Metric drift alerts for anomaly detection",
      "Execution logs with run-level trace IDs",
      "Backfill mode for missed schedule windows",
      "Flexible date parsing for Unix seconds/milliseconds and ISO strings",
      "Multi-path field extraction to tolerate API schema variation",
      "Rolling 30-day historical window to avoid unbounded data growth",
      "Conditional alerting by severity to prevent notification fatigue"
    ],
    whoItsFor: [
      "Revenue ops teams needing trustworthy daily KPI visibility",
      "Leadership teams that rely on predictable executive digests",
      "Organizations with high CRM volume and stale weekly reporting loops",
      "Teams that need statistical anomaly detection, not static threshold alerts"
    ],
    technicalHighlights: [
      "Z-score anomaly engine built on rolling 30-day mean and standard deviation",
      "Single-pass computation of 9 KPIs from one HubSpot extraction cycle",
      "Flexible parser handles field-name and date-format variation across payload shapes",
      "AI narrative constrained to executive-length summary with strict JSON parsing fallback",
      "Data-quality classification surfaces live-data vs empty-result runs explicitly"
    ],
    beforeAfterMetrics: [
      { metric: "Reporting Effort", before: "4-6 hrs/week", after: "0 hrs/week", improvement: "100% eliminated" },
      { metric: "Data Freshness", before: "7+ days old", after: "24-hour cadence", improvement: "93% fresher" },
      { metric: "KPI Coverage", before: "3-4 metrics", after: "9 metrics", improvement: "3x depth" },
      { metric: "Anomaly Detection", before: "Quarterly/manual", after: "Daily/statistical", improvement: "90x faster" },
      { metric: "Metric Consistency", before: "Analyst-dependent", after: "Standardized engine", improvement: "100% consistent" }
    ],
    stateFlow: [
      "data_extracted",
      "parsed",
      "aggregated",
      "analyzed",
      "narrated",
      "distributed",
      "logged"
    ],
    policyMatrix: [
      { requestType: "critical", approver: "owner + Slack alert", baseSla: "Immediate", escalationThreshold: "anomaly >= 80 OR aiPriority=critical" },
      { requestType: "watch", approver: "owner digest + Notion", baseSla: "<24h", escalationThreshold: "60 <= anomaly < 80 OR aiPriority=watch" },
      { requestType: "normal", approver: "daily digest + Notion", baseSla: "24h", escalationThreshold: "anomaly < 60 AND aiPriority=normal" }
    ],
    deploymentTimeline: [
      "Week 1: KPI mapping, historical baseline strategy, and target design",
      "Week 2: HubSpot extraction + parser + metric engine implementation",
      "Week 3: Statistical anomaly logic, narrative generation, and output formatting",
      "Week 4: Distribution paths, observability, QA, and stakeholder rollout"
    ],
    typicalInvestment: "$7,000-$11,000 depending on KPI depth, source complexity, and reporting channels",
    testimonial: {
      quote:
        "We went from slow manual exports to daily KPI intelligence. Leadership now gets consistent numbers and anomaly context before issues become quarter-end surprises.",
      attribution: "Revenue Operations Manager, B2B SaaS"
    },
    cta: {
      title: "Need Executive Reporting Without Spreadsheet Fire Drills?",
      subtitle:
        "I build statistical reporting pipelines that deliver daily KPI clarity, anomaly alerts, and leadership-ready summaries.",
      highlights: [
        "Live CRM extraction with resilient parsing and data-quality safeguards",
        "Statistical anomaly detection using rolling historical baselines",
        "Executive digest delivery to Notion, email, and Slack by severity"
      ],
      primaryLabel: "Book Reporting Automation Audit",
      primaryHref: "/contact?tab=booking",
      secondaryLabel: "Send a Message",
      secondaryHref: "/contact?tab=message"
    },
    metrics: [
      { label: "Reporting Cycle Time", value: "-100%", note: "Manual prep removed" },
      { label: "Data Freshness", value: "24h cadence", note: "Daily automated refresh" },
      { label: "Anomaly Detection", value: "Daily", note: "Statistical z-score monitoring" }
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
    title: "Incremental Deal Risk Engine with Executive Digest Automation",
    category: "Revenue Ops",
    summary:
      "Production-grade RevOps workflow that incrementally processes changed deals, scores risk across four dimensions, and sends consolidated digest alerts.",
    oneLiner:
      "Surface at-risk pipeline in hours, not quarters, with incremental processing and noise-controlled executive reporting.",
    bestFor: "RevOps teams managing large HubSpot pipelines and needing proactive deal-risk intervention.",
    problem:
      "RevOps was manually reviewing large pipeline exports to find stalled opportunities, often spotting risks only during weekly or quarterly reviews. Without automated inactivity, stage-aging, and deadline-pressure detection, high-value deals slipped before intervention. Alerting was fragmented and noisy, so attention on true risk was inconsistent.",
    systemBuilt:
      "Built a 6-hour incremental risk engine on HubSpot deals: normalize fields with multi-path fallback, parse mixed date formats, filter to recently changed records, score each deal with a four-factor deterministic model blended with AI context, classify health (at_risk/warning/healthy), and aggregate all actionable deals into a single executive digest with pagination and conditional sending.",
    outcome:
      "Pipeline triage shifted from reactive manual review to continuous automated monitoring. RevOps gets one actionable digest instead of alert spam, at-risk opportunities are surfaced same day, and processing cost/runtime dropped through lookback-based incremental execution.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80",
    technologies: ["n8n", "HubSpot API", "OpenAI", "Notion API", "Gmail API"],
    integrations: ["HubSpot", "Notion", "Slack", "Gmail", "Custom Webhooks"],
    workflowSteps: [
      "Fetch HubSpot deals on a 6-hour schedule and normalize 8+ core fields with multi-path fallback",
      "Parse close/activity/modified timestamps across Unix seconds, milliseconds, ISO strings, and Date formats",
      "Filter to recently modified deals using configurable lookback window (default 6 hours)",
      "Score risk with four deterministic factors: stage aging, deal value stakes, inactivity, and close-date pressure",
      "Blend deterministic and AI signals with configurable weights, then classify health tiers",
      "Route attention-worthy deals to Slack and log all processed records to Notion",
      "Build a single RevOps digest with severity counts, row limits, overflow handling, and conditional send"
    ],
    reliabilityControls: [
      "Incremental processing prevents redundant full-pipeline rescans",
      "Idempotency keys built from deal + modified timestamp + priority",
      "Configurable at-risk/warning thresholds and normalized AI/rules weighting",
      "Digest pagination and conditional sending prevent notification fatigue",
      "Retry-on-fail and graceful error paths for HubSpot, Slack, Notion, and Gmail nodes",
      "Field/date parsing fallback logic for API shape inconsistencies"
    ],
    whoItsFor: [
      "RevOps teams managing 1,000+ open deals and struggling with stale risk visibility",
      "Sales leadership teams needing concise daily risk rollups instead of raw alert streams",
      "Organizations that require configurable thresholds by pipeline context",
      "Teams that want AI context while preserving deterministic control"
    ],
    technicalHighlights: [
      "Incremental lookback filter reduces processing scope to recently changed deals only",
      "Four-factor risk model captures stage aging, amount risk, inactivity, and close-date pressure",
      "Three-tier health system (at_risk/warning/healthy) drives routing and digest inclusion",
      "Digest builder aggregates risk rows with max-row controls and overflow handling",
      "Weight normalization guarantees deterministic + AI blend always sums to 1.0"
    ],
    beforeAfterMetrics: [
      { metric: "Deals Processed Per Run", before: "2,500 full scan", after: "40-80 incremental", improvement: "~98% reduction" },
      { metric: "Runtime", before: "45+ min", after: "< 2 min", improvement: "~96% faster" },
      { metric: "Alert Volume", before: "180+ noisy alerts/day", after: "4 digest emails/day", improvement: "~98% less noise" },
      { metric: "Risk Detection Cadence", before: "Weekly/quarterly review", after: "Every 6 hours", improvement: "Near real-time" }
    ],
    stateFlow: [
      "deal_normalized",
      "recent_change_filtered",
      "risk_scored",
      "health_classified",
      "logged",
      "digest_built",
      "digest_sent_if_needed"
    ],
    policyMatrix: [
      { requestType: "at_risk", approver: "RevOps owner + Slack alert", baseSla: "Immediate", escalationThreshold: "score >= 80" },
      { requestType: "warning", approver: "RevOps digest queue", baseSla: "<24h", escalationThreshold: "60 <= score < 80" },
      { requestType: "healthy", approver: "Logged only (no alert)", baseSla: "Next cycle", escalationThreshold: "score < 60" }
    ],
    deploymentTimeline: [
      "Week 1: Risk model design, threshold alignment, and source mapping",
      "Week 2: HubSpot normalization + incremental filter implementation",
      "Week 3: Blended scoring, digest builder, and notification routing",
      "Week 4: Tuning, QA on historical samples, and production rollout"
    ],
    typicalInvestment: "$8,000-$12,000 based on pipeline complexity and routing requirements",
    testimonial: {
      quote:
        "We stopped drowning in raw pipeline alerts. The digest tells us exactly where to intervene, and we catch risk before quarter-end surprises.",
      attribution: "Head of RevOps, B2B SaaS"
    },
    cta: {
      title: "Want This Risk Intelligence System in Your CRM?",
      subtitle:
        "I build RevOps automation that detects pipeline risk continuously and delivers one clear daily action plan.",
      highlights: [
        "Incremental processing for speed and API efficiency",
        "4-factor risk scoring with AI-assisted context",
        "Digest-first alerting that eliminates noise"
      ],
      primaryLabel: "Book RevOps Automation Audit",
      primaryHref: "/contact?tab=booking",
      secondaryLabel: "Send a Message",
      secondaryHref: "/contact?tab=message"
    },
    metrics: [
      { label: "Processing Efficiency", value: "~98% less volume", note: "Incremental vs full scans" },
      { label: "Digest Signal Quality", value: "1 concise brief/run", note: "Alert noise dramatically reduced" },
      { label: "Risk Visibility", value: "6-hour cadence", note: "At-risk deals surfaced same day" }
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
