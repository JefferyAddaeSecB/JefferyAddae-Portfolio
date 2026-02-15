import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();

const repos = [
  {
    dir: 'n8n-lead-intake-qualification-system',
    title: 'Lead Intake Qualification System',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/ai-powered-lead-intake-qualification-system',
    description:
      'AI-assisted inbound lead scoring with deterministic fallback, hot-lead alerts, CRM upserts, and owner notifications.',
    architecture: [
      'Webhook intake -> payload normalization -> deterministic score',
      'AI qualification via OpenRouter -> parsed score signal',
      'Signal merge -> final weighted score and priority decision',
      'Hot-lead branch to sales alert + all-leads CRM upsert + owner notification'
    ]
  },
  {
    dir: 'n8n-internal-ops-routing-approvals',
    title: 'Internal Ops Routing and Approvals',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/internal-ops-request-routing-approvals',
    description:
      'Policy-first request routing with AI escalation risk review, SLA-aware approvals, and escalation notifications.',
    architecture: [
      'Webhook intake -> normalization -> deterministic routing policy engine',
      'AI risk review for escalation signal generation',
      'Merged risk decision -> escalation branch or standard approval flow',
      'Persistent request record + approver notification'
    ]
  },
  {
    dir: 'n8n-ai-support-ticket-triage',
    title: 'AI Support Ticket Triage',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/ai-support-assistant-ticket-triage',
    description:
      'Ticket triage pipeline combining deterministic severity heuristics with AI queueing decisions and human escalation paths.',
    architecture: [
      'Webhook intake -> payload validation -> deterministic severity score',
      'AI triage scoring and queue recommendation via OpenRouter',
      'Signal merge -> final triage decision and escalation score',
      'Urgent branch to human escalation + universal helpdesk update + summary post'
    ]
  },
  {
    dir: 'n8n-automated-reporting-dashboards',
    title: 'Automated Reporting Dashboards',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/automated-reporting-executive-dashboards',
    description:
      'Scheduled KPI pipeline with multi-source merge, anomaly scoring, AI narrative generation, and executive distribution.',
    architecture: [
      'Daily trigger -> pull analytics and revenue sources',
      'Source merge -> KPI computation + anomaly scoring',
      'AI executive narrative generation and parse',
      'Dashboard refresh + executive brief + anomaly alert branch'
    ]
  },
  {
    dir: 'n8n-client-intake-onboarding-automation',
    title: 'Client Intake Onboarding Automation',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/client-intake-onboarding-automation',
    description:
      'Client onboarding flow with readiness scoring, AI onboarding planning, kickoff/no-kickoff branching, and client comms.',
    architecture: [
      'Webhook intake -> normalization -> deterministic readiness engine',
      'AI onboarding planner signal via OpenRouter',
      'Merged readiness decision for kickoff readiness',
      'Task creation + kickoff scheduling or missing-document request + welcome summary'
    ]
  },
  {
    dir: 'n8n-revenue-ops-crm-sync',
    title: 'Revenue Ops CRM Sync',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/revenue-ops-crm-sync-enrichment-pipeline',
    description:
      'Scheduled stale-deal sync with enrichment, AI slippage-risk analysis, rescue-task branching, and RevOps alerts.',
    architecture: [
      '6-hour trigger -> stale-deal fetch -> enrichment',
      'Deterministic deal health scoring + AI risk analysis',
      'Signal merge -> final risk decision',
      'At-risk branch to rescue tasks + CRM health upsert + RevOps channel notifications'
    ]
  }
];

for (const repo of repos) {
  const readme = `# n8n ${repo.title}

${repo.description}

## Files
- \`n8n/workflow.json\` importable n8n workflow (AI-assisted + deterministic fallback)

## Architecture
${repo.architecture.map((step) => `- ${step}`).join('\n')}

## Runtime Requirements
- n8n (validated with containerized import on n8n latest)
- Set \`OPENROUTER_API_KEY\` in your n8n environment for AI nodes
- Replace placeholder webhook/API endpoints and credentials before activation

## Import
1. Open n8n UI.
2. Go to \`Workflows -> Import from File\`.
3. Select \`n8n/workflow.json\`.
4. Configure credentials and endpoint placeholders.
5. Run a manual execution test before enabling schedule/webhook traffic.

## Live Demo
- ${repo.demo}
`;

  writeFileSync(join(rootDir, 'case-study-repos', repo.dir, 'README.md'), readme, 'utf8');
}

console.log(`Updated ${repos.length} case-study READMEs.`);
