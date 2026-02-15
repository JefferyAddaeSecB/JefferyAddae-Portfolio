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
      'AI Agent + OpenAI Chat Model -> parsed AI signal',
      'Signal merge -> final weighted score and priority decision',
      'Hot-lead branch to Slack + HubSpot + Notion + Gmail owner summary'
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
      'AI Agent + OpenAI Chat Model for escalation signal generation',
      'Merged risk decision -> escalation branch or standard approval flow',
      'Persistent request record in Notion + Slack + Gmail notifications'
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
      'AI Agent + OpenAI Chat Model triage scoring and queue recommendation',
      'Signal merge -> final triage decision and escalation score',
      'Urgent branch to Slack escalation + Notion log + Gmail customer update'
    ]
  },
  {
    dir: 'n8n-automated-reporting-dashboards',
    title: 'Automated Reporting Dashboards',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/automated-reporting-executive-dashboards',
    description:
      'Scheduled KPI pipeline with multi-source merge, anomaly scoring, AI narrative generation, and executive distribution.',
    architecture: [
      'Daily trigger -> deterministic KPI snapshot + anomaly scoring',
      'AI Agent + OpenAI Chat Model executive narrative generation',
      'Signal merge -> final reporting packet',
      'Notion brief + Gmail exec summary + Slack anomaly branch'
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
      'AI Agent + OpenAI Chat Model onboarding signal',
      'Merged readiness decision for kickoff readiness',
      'Notion onboarding record + Slack branch + Gmail client update'
    ]
  },
  {
    dir: 'n8n-revenue-ops-crm-sync',
    title: 'Revenue Ops CRM Sync',
    demo: 'https://jeffery-addae-portfolio-web.vercel.app/projects/revenue-ops-crm-sync-enrichment-pipeline',
    description:
      'Scheduled stale-deal sync with enrichment, AI slippage-risk analysis, rescue-task branching, and RevOps alerts.',
    architecture: [
      '6-hour trigger -> HubSpot deal search -> deterministic risk scoring',
      'AI Agent + OpenAI Chat Model risk analysis',
      'Signal merge -> final risk decision',
      'HubSpot sync + Notion log + Slack branch + Gmail RevOps summary'
    ]
  }
];

for (const repo of repos) {
  const readme = `# n8n ${repo.title}

${repo.description}

## Files
- \`n8n/workflow.json\` importable n8n workflow (AI Agent + deterministic fallback + native app nodes)

## Architecture
${repo.architecture.map((step) => `- ${step}`).join('\n')}

## Runtime Requirements
- n8n (validated with containerized import on n8n latest)
- Configure credentials for:
  - \`OpenAI\` (for \`AI Agent\` model connection)
  - \`Slack\`
  - \`Notion\`
  - \`Gmail\`
  - \`HubSpot\` (where used)
- Replace placeholder channel/database IDs and recipient addresses before activation

## Import
1. Open n8n UI.
2. Go to \`Workflows -> Import from File\`.
3. Select \`n8n/workflow.json\`.
4. Configure credentials and placeholder IDs.
5. Run a manual execution test before enabling schedule/webhook traffic.

## Live Demo
- ${repo.demo}
`;

  writeFileSync(join(rootDir, 'case-study-repos', repo.dir, 'README.md'), readme, 'utf8');
}

console.log(`Updated ${repos.length} case-study READMEs.`);
