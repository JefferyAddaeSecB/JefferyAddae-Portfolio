import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const rootDir = process.cwd();

const notionDatabasePlaceholder = 'https://www.notion.so/00000000000000000000000000000000';
const slackChannelPlaceholder = 'C01234567';
const ownerEmailPlaceholder = 'owner@example.com';

const parseAiOutputCode = `return $input.all().map((item) => {
  const rawCandidate =
    item.json.output ??
    item.json.text ??
    item.json.response ??
    item.json.result ??
    item.json;

  let parsed = {};

  if (typeof rawCandidate === 'string') {
    try {
      parsed = JSON.parse(rawCandidate);
    } catch (error) {
      parsed = { summary: rawCandidate };
    }
  } else if (rawCandidate && typeof rawCandidate === 'object') {
    parsed = rawCandidate;
  }

  const pickNumber = (...keys) => {
    for (const key of keys) {
      const value = Number(parsed[key]);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return 0;
  };

  const pickString = (...keys) => {
    for (const key of keys) {
      const value = parsed[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
  };

  return {
    json: {
      aiScore: pickNumber('aiScore', 'score', 'riskScore', 'severityScore', 'readinessScore'),
      aiPriority: pickString('priority', 'queue', 'recommendation', 'decision'),
      aiSummary: pickString('summary', 'rationale', 'reason', 'triageSummary', 'recommendation') || 'ai_response_unavailable',
      aiPayload: parsed,
    },
  };
});`;

function webhookNode({ id, name, path, position }) {
  return {
    parameters: {
      path,
      httpMethod: 'POST',
      responseMode: 'onReceived',
    },
    id,
    name,
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1,
    position,
    webhookId: path,
  };
}

function scheduleNode({ id, name, hoursInterval, position }) {
  return {
    parameters: {
      rule: {
        interval: [{ field: 'hours', hoursInterval }],
      },
    },
    id,
    name,
    type: 'n8n-nodes-base.scheduleTrigger',
    typeVersion: 1,
    position,
  };
}

function setNode({ id, name, fields, position }) {
  return {
    parameters: {
      keepOnlySet: false,
      values: {
        string: fields.map((field) => ({ name: field.name, value: field.value })),
      },
    },
    id,
    name,
    type: 'n8n-nodes-base.set',
    typeVersion: 3,
    position,
  };
}

function codeNode({ id, name, jsCode, position }) {
  return {
    parameters: { jsCode },
    id,
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
  };
}

function agentNode({ id, name, prompt, position }) {
  return {
    parameters: {
      promptType: 'define',
      text: prompt,
      options: {},
    },
    id,
    name,
    type: '@n8n/n8n-nodes-langchain.agent',
    typeVersion: 3.1,
    position,
  };
}

function modelNode({ id, name, position }) {
  return {
    parameters: {
      model: {
        mode: 'list',
        value: 'gpt-4.1-mini',
      },
      options: {},
    },
    id,
    name,
    type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
    typeVersion: 1.3,
    position,
  };
}

function mergeNode({ id, name, position }) {
  return {
    parameters: { mode: 'combine' },
    id,
    name,
    type: 'n8n-nodes-base.merge',
    typeVersion: 3,
    position,
  };
}

function ifNumberNode({ id, name, valueExpr, threshold, position }) {
  return {
    parameters: {
      conditions: {
        number: [
          {
            value1: valueExpr,
            operation: 'largerEqual',
            value2: threshold,
          },
        ],
      },
    },
    id,
    name,
    type: 'n8n-nodes-base.if',
    typeVersion: 2,
    position,
  };
}

function slackPostNode({ id, name, textExpr, position }) {
  return {
    parameters: {
      resource: 'message',
      operation: 'post',
      select: 'channel',
      channelId: {
        mode: 'id',
        value: slackChannelPlaceholder,
      },
      messageType: 'text',
      text: textExpr,
    },
    id,
    name,
    type: 'n8n-nodes-base.slack',
    typeVersion: 2.4,
    position,
  };
}

function notionCreatePageNode({ id, name, titleExpr, position }) {
  return {
    parameters: {
      resource: 'databasePage',
      operation: 'create',
      databaseId: {
        mode: 'url',
        value: notionDatabasePlaceholder,
      },
      title: titleExpr,
      simple: true,
    },
    id,
    name,
    type: 'n8n-nodes-base.notion',
    typeVersion: 2.2,
    position,
  };
}

function gmailSendNode({ id, name, toExpr, subject, messageExpr, position }) {
  return {
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: toExpr,
      subject,
      message: messageExpr,
    },
    id,
    name,
    type: 'n8n-nodes-base.gmail',
    typeVersion: 2.2,
    position,
  };
}

function hubspotContactUpsertNode({ id, name, emailExpr, position }) {
  return {
    parameters: {
      resource: 'contact',
      operation: 'upsert',
      email: emailExpr,
      additionalFields: {},
    },
    id,
    name,
    type: 'n8n-nodes-base.hubspot',
    typeVersion: 2.2,
    position,
  };
}

function hubspotDealSearchNode({ id, name, position }) {
  return {
    parameters: {
      resource: 'deal',
      operation: 'search',
      additionalFields: {},
    },
    id,
    name,
    type: 'n8n-nodes-base.hubspot',
    typeVersion: 2.2,
    position,
  };
}

function leadWorkflow() {
  const nodes = [
    webhookNode({ id: 'lead_webhook', name: 'Lead Webhook', path: 'lead-intake-v3', position: [220, 320] }),
    setNode({
      id: 'normalize_lead_payload',
      name: 'Normalize Lead Payload',
      fields: [
        { name: 'pipeline', value: 'lead-intake-qualification' },
        { name: 'receivedAt', value: '={{new Date().toISOString()}}' },
      ],
      position: [450, 320],
    }),
    codeNode({
      id: 'deterministic_lead_scoring',
      name: 'Deterministic Lead Scoring',
      position: [700, 320],
      jsCode: `return $input.all().map((item) => {
  const budget = Number(item.json.budget || 0);
  const urgency = String(item.json.urgency || 'normal').toLowerCase();
  const source = String(item.json.source || 'unknown').toLowerCase();

  let deterministicScore = 35;
  if (budget >= 5000) deterministicScore += 25;
  if (budget >= 12000) deterministicScore += 10;
  if (urgency.includes('high') || urgency.includes('urgent')) deterministicScore += 15;
  if (source.includes('referral')) deterministicScore += 10;

  return {
    json: {
      ...item.json,
      deterministicScore: Math.min(deterministicScore, 100),
      deterministicPriority: deterministicScore >= 75 ? 'hot' : deterministicScore >= 55 ? 'warm' : 'cold',
    },
  };
});`,
    }),
    agentNode({
      id: 'ai_lead_qualifier',
      name: 'AI Lead Qualifier',
      prompt:
        "={{'You are a B2B lead qualification agent. Return strict JSON with keys aiScore (0-100), priority (hot|warm|cold), summary (string). Lead payload: ' + JSON.stringify($json)}}",
      position: [940, 220],
    }),
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', position: [940, 520] }),
    codeNode({ id: 'parse_ai_output', name: 'Parse AI Output', jsCode: parseAiOutputCode, position: [1160, 220] }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1160, 360] }),
    codeNode({
      id: 'final_priority_decision',
      name: 'Final Priority Decision',
      position: [1380, 360],
      jsCode: `return $input.all().map((item) => {
  const deterministicScore = Number(item.json.deterministicScore || 0);
  const aiScore = Number(item.json.aiScore || 0);
  const leadScore = aiScore > 0
    ? Math.round((deterministicScore * 0.65) + (aiScore * 0.35))
    : deterministicScore;

  const priority = leadScore >= 75 ? 'hot' : leadScore >= 55 ? 'warm' : 'cold';

  return {
    json: {
      ...item.json,
      leadScore,
      priority,
      aiSummary: item.json.aiSummary || 'deterministic fallback used',
    },
  };
});`,
    }),
    ifNumberNode({ id: 'hot_lead_check', name: 'Hot Lead?', valueExpr: '={{$json.leadScore}}', threshold: 75, position: [1600, 360] }),
    hubspotContactUpsertNode({
      id: 'hubspot_upsert_contact',
      name: 'HubSpot Upsert Contact',
      emailExpr: '={{$json.email || "lead@example.com"}}',
      position: [1820, 450],
    }),
    notionCreatePageNode({
      id: 'notion_record_lead',
      name: 'Notion Record Lead',
      titleExpr: '={{"Lead: " + ($json.firstName || $json.name || "Unknown") + " | " + ($json.priority || "cold")}}',
      position: [1820, 320],
    }),
    slackPostNode({
      id: 'slack_hot_lead_alert',
      name: 'Slack Hot Lead Alert',
      textExpr: '={{"🔥 HOT lead: " + ($json.email || "no-email") + " | score " + ($json.leadScore || 0)}}',
      position: [1820, 180],
    }),
    slackPostNode({
      id: 'slack_standard_lead_alert',
      name: 'Slack Standard Lead Alert',
      textExpr: '={{"New lead: " + ($json.email || "no-email") + " | priority " + ($json.priority || "cold")}}',
      position: [1820, 560],
    }),
    gmailSendNode({
      id: 'gmail_owner_lead_summary',
      name: 'Gmail Owner Lead Summary',
      toExpr: `={{${JSON.stringify(ownerEmailPlaceholder)}}}`,
      subject: 'Lead Qualification Summary',
      messageExpr: '={{"Priority: " + ($json.priority || "cold") + "\\nScore: " + ($json.leadScore || 0) + "\\nAI: " + ($json.aiSummary || "N/A")}}',
      position: [2050, 450],
    }),
  ];

  const connections = {
    'Lead Webhook': { main: [[{ node: 'Normalize Lead Payload', type: 'main', index: 0 }]] },
    'Normalize Lead Payload': { main: [[{ node: 'Deterministic Lead Scoring', type: 'main', index: 0 }]] },
    'Deterministic Lead Scoring': {
      main: [
        [{ node: 'AI Lead Qualifier', type: 'main', index: 0 }],
        [{ node: 'Merge AI with Rules', type: 'main', index: 0 }],
      ],
    },
    'OpenAI Chat Model': {
      ai_languageModel: [[{ node: 'AI Lead Qualifier', type: 'ai_languageModel', index: 0 }]],
    },
    'AI Lead Qualifier': { main: [[{ node: 'Parse AI Output', type: 'main', index: 0 }]] },
    'Parse AI Output': { main: [[{ node: 'Merge AI with Rules', type: 'main', index: 1 }]] },
    'Merge AI with Rules': { main: [[{ node: 'Final Priority Decision', type: 'main', index: 0 }]] },
    'Final Priority Decision': { main: [[{ node: 'Hot Lead?', type: 'main', index: 0 }]] },
    'Hot Lead?': {
      main: [
        [
          { node: 'Slack Hot Lead Alert', type: 'main', index: 0 },
          { node: 'Notion Record Lead', type: 'main', index: 0 },
          { node: 'HubSpot Upsert Contact', type: 'main', index: 0 },
        ],
        [
          { node: 'Slack Standard Lead Alert', type: 'main', index: 0 },
          { node: 'Notion Record Lead', type: 'main', index: 0 },
          { node: 'HubSpot Upsert Contact', type: 'main', index: 0 },
        ],
      ],
    },
    'HubSpot Upsert Contact': { main: [[{ node: 'Gmail Owner Lead Summary', type: 'main', index: 0 }]] },
  };

  return {
    name: 'Lead Intake Qualification Pipeline',
    active: false,
    settings: { executionOrder: 'v1' },
    versionId: '8ed2f31d-136c-47b8-95f9-031da7c9e0b8',
    nodes,
    connections,
  };
}

function internalOpsWorkflow() {
  const nodes = [
    webhookNode({ id: 'ops_request_webhook', name: 'Ops Request Webhook', path: 'ops-request-v3', position: [220, 320] }),
    setNode({
      id: 'normalize_ops_request',
      name: 'Normalize Ops Request',
      fields: [
        { name: 'requestReceivedAt', value: '={{new Date().toISOString()}}' },
        { name: 'status', value: 'intake_received' },
      ],
      position: [450, 320],
    }),
    codeNode({
      id: 'deterministic_ops_routing',
      name: 'Deterministic Ops Routing',
      position: [700, 320],
      jsCode: `return $input.all().map((item) => {
  const requestType = String(item.json.requestType || 'general').toLowerCase();
  const priority = String(item.json.priority || 'normal').toLowerCase();

  let deterministicScore = 40;
  if (priority.includes('high') || priority.includes('urgent')) deterministicScore += 25;
  if (requestType.includes('finance')) deterministicScore += 15;
  if (requestType.includes('security')) deterministicScore += 20;

  const approver = requestType.includes('finance')
    ? 'finance-manager'
    : requestType.includes('security')
    ? 'security-lead'
    : 'ops-manager';

  return {
    json: {
      ...item.json,
      deterministicScore,
      approver,
      slaHours: deterministicScore >= 75 ? 4 : deterministicScore >= 55 ? 12 : 24,
    },
  };
});`,
    }),
    agentNode({
      id: 'ai_ops_risk_agent',
      name: 'AI Ops Risk Agent',
      prompt:
        "={{'You classify internal ops requests for escalation risk. Return strict JSON with keys aiScore (0-100), priority (escalate|standard), summary (string). Request payload: ' + JSON.stringify($json)}}",
      position: [940, 220],
    }),
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', position: [940, 520] }),
    codeNode({ id: 'parse_ai_output', name: 'Parse AI Output', jsCode: parseAiOutputCode, position: [1160, 220] }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1160, 360] }),
    codeNode({
      id: 'final_ops_decision',
      name: 'Final Ops Decision',
      position: [1380, 360],
      jsCode: `return $input.all().map((item) => {
  const deterministicScore = Number(item.json.deterministicScore || 0);
  const aiScore = Number(item.json.aiScore || 0);
  const escalationScore = aiScore > 0
    ? Math.round((deterministicScore * 0.7) + (aiScore * 0.3))
    : deterministicScore;

  const escalate = escalationScore >= 70;

  return {
    json: {
      ...item.json,
      escalationScore,
      escalate,
      approvalStatus: escalate ? 'escalation_required' : 'standard_approval',
    },
  };
});`,
    }),
    ifNumberNode({ id: 'escalation_check', name: 'Escalation Needed?', valueExpr: '={{$json.escalationScore}}', threshold: 70, position: [1600, 360] }),
    notionCreatePageNode({
      id: 'notion_record_request',
      name: 'Notion Record Request',
      titleExpr: '={{"Ops Request: " + ($json.requestType || "general") + " | " + ($json.approvalStatus || "standard")}}',
      position: [1820, 360],
    }),
    slackPostNode({
      id: 'slack_escalation_alert',
      name: 'Slack Escalation Alert',
      textExpr: '={{"⚠️ Escalation required for " + ($json.requestType || "request") + " | score " + ($json.escalationScore || 0)}}',
      position: [1820, 180],
    }),
    slackPostNode({
      id: 'slack_standard_alert',
      name: 'Slack Standard Alert',
      textExpr: '={{"New ops request assigned to " + ($json.approver || "ops-manager") + " | SLA " + ($json.slaHours || 24) + "h"}}',
      position: [1820, 540],
    }),
    gmailSendNode({
      id: 'gmail_request_status',
      name: 'Gmail Request Status',
      toExpr: '={{$json.email || "requester@example.com"}}',
      subject: 'Ops Request Status Update',
      messageExpr: '={{"Status: " + ($json.approvalStatus || "pending") + "\\nApprover: " + ($json.approver || "ops-manager") + "\\nSLA: " + ($json.slaHours || 24) + "h"}}',
      position: [2050, 360],
    }),
    gmailSendNode({
      id: 'gmail_owner_escalation',
      name: 'Gmail Owner Escalation',
      toExpr: `={{${JSON.stringify(ownerEmailPlaceholder)}}}`,
      subject: 'Escalated Ops Request',
      messageExpr: '={{"Escalation score: " + ($json.escalationScore || 0) + "\\nType: " + ($json.requestType || "general")}}',
      position: [2050, 180],
    }),
  ];

  const connections = {
    'Ops Request Webhook': { main: [[{ node: 'Normalize Ops Request', type: 'main', index: 0 }]] },
    'Normalize Ops Request': { main: [[{ node: 'Deterministic Ops Routing', type: 'main', index: 0 }]] },
    'Deterministic Ops Routing': {
      main: [
        [{ node: 'AI Ops Risk Agent', type: 'main', index: 0 }],
        [{ node: 'Merge AI with Rules', type: 'main', index: 0 }],
      ],
    },
    'OpenAI Chat Model': {
      ai_languageModel: [[{ node: 'AI Ops Risk Agent', type: 'ai_languageModel', index: 0 }]],
    },
    'AI Ops Risk Agent': { main: [[{ node: 'Parse AI Output', type: 'main', index: 0 }]] },
    'Parse AI Output': { main: [[{ node: 'Merge AI with Rules', type: 'main', index: 1 }]] },
    'Merge AI with Rules': { main: [[{ node: 'Final Ops Decision', type: 'main', index: 0 }]] },
    'Final Ops Decision': { main: [[{ node: 'Escalation Needed?', type: 'main', index: 0 }]] },
    'Escalation Needed?': {
      main: [
        [
          { node: 'Slack Escalation Alert', type: 'main', index: 0 },
          { node: 'Notion Record Request', type: 'main', index: 0 },
          { node: 'Gmail Owner Escalation', type: 'main', index: 0 },
        ],
        [
          { node: 'Slack Standard Alert', type: 'main', index: 0 },
          { node: 'Notion Record Request', type: 'main', index: 0 },
        ],
      ],
    },
    'Notion Record Request': { main: [[{ node: 'Gmail Request Status', type: 'main', index: 0 }]] },
  };

  return {
    name: 'Internal Ops Routing and Approvals',
    active: false,
    settings: { executionOrder: 'v1' },
    versionId: 'df0f02a4-0913-4f2b-a419-bc74f4f4eaa3',
    nodes,
    connections,
  };
}

function supportWorkflow() {
  const nodes = [
    webhookNode({ id: 'ticket_webhook', name: 'Ticket Webhook', path: 'support-ticket-v3', position: [220, 320] }),
    codeNode({
      id: 'normalize_ticket',
      name: 'Normalize Ticket',
      position: [450, 320],
      jsCode: `return $input.all().map((item) => {
  const subject = String(item.json.subject || 'No subject');
  const message = String(item.json.message || item.json.description || 'No message');
  return {
    json: {
      ...item.json,
      subject,
      message,
      receivedAt: new Date().toISOString(),
    },
  };
});`,
    }),
    codeNode({
      id: 'deterministic_ticket_score',
      name: 'Deterministic Ticket Score',
      position: [700, 320],
      jsCode: `return $input.all().map((item) => {
  const lowered = (String(item.json.subject || '') + ' ' + String(item.json.message || '')).toLowerCase();

  let deterministicScore = 30;
  if (lowered.includes('outage') || lowered.includes('down')) deterministicScore += 35;
  if (lowered.includes('payment') || lowered.includes('billing')) deterministicScore += 20;
  if (lowered.includes('security') || lowered.includes('breach')) deterministicScore += 25;

  return {
    json: {
      ...item.json,
      deterministicScore,
      baselineQueue: deterministicScore >= 70 ? 'urgent-human' : 'ai-assisted',
    },
  };
});`,
    }),
    agentNode({
      id: 'ai_ticket_triage_agent',
      name: 'AI Ticket Triage Agent',
      prompt:
        "={{'You triage support tickets. Return strict JSON with keys aiScore (0-100), priority (urgent-human|human|ai-assisted), summary (string). Ticket payload: ' + JSON.stringify($json)}}",
      position: [940, 220],
    }),
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', position: [940, 520] }),
    codeNode({ id: 'parse_ai_output', name: 'Parse AI Output', jsCode: parseAiOutputCode, position: [1160, 220] }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1160, 360] }),
    codeNode({
      id: 'final_ticket_decision',
      name: 'Final Ticket Decision',
      position: [1380, 360],
      jsCode: `return $input.all().map((item) => {
  const deterministicScore = Number(item.json.deterministicScore || 0);
  const aiScore = Number(item.json.aiScore || 0);
  const triageScore = aiScore > 0
    ? Math.round((deterministicScore * 0.6) + (aiScore * 0.4))
    : deterministicScore;

  const queue = triageScore >= 70
    ? 'urgent-human'
    : (item.json.aiPriority || item.json.baselineQueue || 'ai-assisted');

  return {
    json: {
      ...item.json,
      triageScore,
      queue,
      summary: item.json.aiSummary || 'deterministic fallback used',
    },
  };
});`,
    }),
    ifNumberNode({ id: 'human_escalation_check', name: 'Human Escalation?', valueExpr: '={{$json.triageScore}}', threshold: 70, position: [1600, 360] }),
    notionCreatePageNode({
      id: 'notion_log_ticket',
      name: 'Notion Log Ticket',
      titleExpr: '={{"Ticket: " + ($json.subject || "No subject") + " | " + ($json.queue || "ai-assisted")}}',
      position: [1820, 360],
    }),
    slackPostNode({
      id: 'slack_urgent_ticket',
      name: 'Slack Urgent Ticket',
      textExpr: '={{"🚨 Urgent ticket: " + ($json.subject || "No subject") + " | score " + ($json.triageScore || 0)}}',
      position: [1820, 180],
    }),
    slackPostNode({
      id: 'slack_standard_ticket',
      name: 'Slack Standard Ticket',
      textExpr: '={{"Ticket triaged to " + ($json.queue || "ai-assisted") + " | " + ($json.subject || "No subject")}}',
      position: [1820, 540],
    }),
    gmailSendNode({
      id: 'gmail_ticket_update',
      name: 'Gmail Ticket Update',
      toExpr: '={{$json.email || "customer@example.com"}}',
      subject: 'Support Ticket Update',
      messageExpr: '={{"Queue: " + ($json.queue || "ai-assisted") + "\\nSummary: " + ($json.summary || "pending")}}',
      position: [2050, 360],
    }),
  ];

  const connections = {
    'Ticket Webhook': { main: [[{ node: 'Normalize Ticket', type: 'main', index: 0 }]] },
    'Normalize Ticket': { main: [[{ node: 'Deterministic Ticket Score', type: 'main', index: 0 }]] },
    'Deterministic Ticket Score': {
      main: [
        [{ node: 'AI Ticket Triage Agent', type: 'main', index: 0 }],
        [{ node: 'Merge AI with Rules', type: 'main', index: 0 }],
      ],
    },
    'OpenAI Chat Model': {
      ai_languageModel: [[{ node: 'AI Ticket Triage Agent', type: 'ai_languageModel', index: 0 }]],
    },
    'AI Ticket Triage Agent': { main: [[{ node: 'Parse AI Output', type: 'main', index: 0 }]] },
    'Parse AI Output': { main: [[{ node: 'Merge AI with Rules', type: 'main', index: 1 }]] },
    'Merge AI with Rules': { main: [[{ node: 'Final Ticket Decision', type: 'main', index: 0 }]] },
    'Final Ticket Decision': { main: [[{ node: 'Human Escalation?', type: 'main', index: 0 }]] },
    'Human Escalation?': {
      main: [
        [
          { node: 'Slack Urgent Ticket', type: 'main', index: 0 },
          { node: 'Notion Log Ticket', type: 'main', index: 0 },
        ],
        [
          { node: 'Slack Standard Ticket', type: 'main', index: 0 },
          { node: 'Notion Log Ticket', type: 'main', index: 0 },
        ],
      ],
    },
    'Notion Log Ticket': { main: [[{ node: 'Gmail Ticket Update', type: 'main', index: 0 }]] },
  };

  return {
    name: 'AI Support Ticket Triage',
    active: false,
    settings: { executionOrder: 'v1' },
    versionId: '901ed2f2-7d68-4ff0-ab85-e3885f97607c',
    nodes,
    connections,
  };
}

function reportingWorkflow() {
  const nodes = [
    scheduleNode({ id: 'daily_trigger', name: 'Daily Trigger', hoursInterval: 24, position: [220, 320] }),
    codeNode({
      id: 'build_kpi_snapshot',
      name: 'Build KPI Snapshot',
      position: [470, 320],
      jsCode: `return $input.all().map(() => {
  const revenue = Number((Math.random() * 50000 + 50000).toFixed(2));
  const previousRevenue = Number((Math.random() * 50000 + 45000).toFixed(2));
  const changePct = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

  return {
    json: {
      revenue,
      previousRevenue,
      changePct: Number(changePct.toFixed(2)),
      anomalyScore: Math.min(100, Math.round(Math.abs(changePct) * 3)),
      generatedAt: new Date().toISOString(),
    },
  };
});`,
    }),
    agentNode({
      id: 'ai_reporting_agent',
      name: 'AI Reporting Agent',
      prompt:
        "={{'You create executive KPI narratives. Return strict JSON with keys aiScore (0-100), priority (normal|watch|critical), summary (string). KPI payload: ' + JSON.stringify($json)}}",
      position: [730, 220],
    }),
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', position: [730, 520] }),
    codeNode({ id: 'parse_ai_output', name: 'Parse AI Output', jsCode: parseAiOutputCode, position: [950, 220] }),
    mergeNode({ id: 'merge_ai_with_snapshot', name: 'Merge AI with Snapshot', position: [950, 360] }),
    codeNode({
      id: 'final_reporting_packet',
      name: 'Final Reporting Packet',
      position: [1170, 360],
      jsCode: `return $input.all().map((item) => {
  const anomalyScore = Number(item.json.anomalyScore || 0);
  const aiSummary = item.json.aiSummary || 'deterministic fallback summary';

  return {
    json: {
      ...item.json,
      severity: anomalyScore >= 70 ? 'critical' : anomalyScore >= 45 ? 'watch' : 'normal',
      executiveSummary: aiSummary,
    },
  };
});`,
    }),
    notionCreatePageNode({
      id: 'notion_exec_brief',
      name: 'Notion Exec Brief',
      titleExpr: '={{"Daily KPI Brief | " + ($json.severity || "normal") + " | " + ($json.generatedAt || "")}}',
      position: [1390, 300],
    }),
    gmailSendNode({
      id: 'gmail_exec_summary',
      name: 'Gmail Exec Summary',
      toExpr: `={{${JSON.stringify(ownerEmailPlaceholder)}}}`,
      subject: 'Daily KPI Executive Summary',
      messageExpr: '={{"Revenue: " + ($json.revenue || 0) + "\\nChange: " + ($json.changePct || 0) + "%\\nSummary: " + ($json.executiveSummary || "N/A")}}',
      position: [1390, 430],
    }),
    ifNumberNode({ id: 'anomaly_check', name: 'Anomaly Score High?', valueExpr: '={{$json.anomalyScore}}', threshold: 70, position: [1170, 520] }),
    slackPostNode({
      id: 'slack_anomaly_alert',
      name: 'Slack Anomaly Alert',
      textExpr: '={{"🚨 KPI anomaly detected | score " + ($json.anomalyScore || 0) + " | change " + ($json.changePct || 0) + "%"}}',
      position: [1390, 560],
    }),
  ];

  const connections = {
    'Daily Trigger': { main: [[{ node: 'Build KPI Snapshot', type: 'main', index: 0 }]] },
    'Build KPI Snapshot': {
      main: [
        [{ node: 'AI Reporting Agent', type: 'main', index: 0 }],
        [{ node: 'Merge AI with Snapshot', type: 'main', index: 0 }],
      ],
    },
    'OpenAI Chat Model': {
      ai_languageModel: [[{ node: 'AI Reporting Agent', type: 'ai_languageModel', index: 0 }]],
    },
    'AI Reporting Agent': { main: [[{ node: 'Parse AI Output', type: 'main', index: 0 }]] },
    'Parse AI Output': { main: [[{ node: 'Merge AI with Snapshot', type: 'main', index: 1 }]] },
    'Merge AI with Snapshot': { main: [[{ node: 'Final Reporting Packet', type: 'main', index: 0 }]] },
    'Final Reporting Packet': {
      main: [
        [{ node: 'Notion Exec Brief', type: 'main', index: 0 }, { node: 'Gmail Exec Summary', type: 'main', index: 0 }, { node: 'Anomaly Score High?', type: 'main', index: 0 }],
      ],
    },
    'Anomaly Score High?': { main: [[{ node: 'Slack Anomaly Alert', type: 'main', index: 0 }], []] },
  };

  return {
    name: 'Automated Reporting and Dashboards',
    active: false,
    settings: { executionOrder: 'v1' },
    versionId: 'c0f2f95a-7cc4-4569-96aa-42e2f1c2efef',
    nodes,
    connections,
  };
}

function onboardingWorkflow() {
  const nodes = [
    webhookNode({ id: 'client_intake_webhook', name: 'Client Intake Webhook', path: 'client-intake-v3', position: [220, 320] }),
    setNode({
      id: 'normalize_intake',
      name: 'Normalize Intake',
      fields: [
        { name: 'intakeCapturedAt', value: '={{new Date().toISOString()}}' },
        { name: 'onboardingStatus', value: 'intake_received' },
      ],
      position: [450, 320],
    }),
    codeNode({
      id: 'deterministic_readiness',
      name: 'Deterministic Readiness',
      position: [700, 320],
      jsCode: `return $input.all().map((item) => {
  const budget = Number(item.json.budget || 0);
  const timeline = String(item.json.timeline || '').toLowerCase();
  const docsProvided = Number(item.json.docsProvided || 0);

  let deterministicScore = 40;
  if (budget >= 5000) deterministicScore += 20;
  if (timeline.includes('asap') || timeline.includes('this week')) deterministicScore += 20;
  if (docsProvided >= 3) deterministicScore += 20;

  return {
    json: {
      ...item.json,
      deterministicScore,
      readinessByRules: deterministicScore >= 80 ? 'kickoff_ready' : 'awaiting_documents',
    },
  };
});`,
    }),
    agentNode({
      id: 'ai_onboarding_agent',
      name: 'AI Onboarding Agent',
      prompt:
        "={{'You plan client onboarding. Return strict JSON with keys aiScore (0-100), priority (kickoff_ready|awaiting_documents), summary (string). Intake payload: ' + JSON.stringify($json)}}",
      position: [940, 220],
    }),
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', position: [940, 520] }),
    codeNode({ id: 'parse_ai_output', name: 'Parse AI Output', jsCode: parseAiOutputCode, position: [1160, 220] }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1160, 360] }),
    codeNode({
      id: 'final_onboarding_decision',
      name: 'Final Onboarding Decision',
      position: [1380, 360],
      jsCode: `return $input.all().map((item) => {
  const deterministicScore = Number(item.json.deterministicScore || 0);
  const aiScore = Number(item.json.aiScore || 0);
  const readinessScore = aiScore > 0
    ? Math.round((deterministicScore * 0.65) + (aiScore * 0.35))
    : deterministicScore;

  const onboardingStatus = readinessScore >= 80 ? 'kickoff_ready' : 'awaiting_documents';

  return {
    json: {
      ...item.json,
      readinessScore,
      onboardingStatus,
      onboardingSummary: item.json.aiSummary || 'deterministic fallback used',
    },
  };
});`,
    }),
    ifNumberNode({ id: 'kickoff_ready_check', name: 'Kickoff Ready?', valueExpr: '={{$json.readinessScore}}', threshold: 80, position: [1600, 360] }),
    notionCreatePageNode({
      id: 'notion_onboarding_record',
      name: 'Notion Onboarding Record',
      titleExpr: '={{"Onboarding: " + ($json.firstName || $json.name || "Client") + " | " + ($json.onboardingStatus || "pending")}}',
      position: [1820, 360],
    }),
    slackPostNode({
      id: 'slack_kickoff_ready',
      name: 'Slack Kickoff Ready',
      textExpr: '={{"✅ Client kickoff ready: " + ($json.email || "unknown") + " | score " + ($json.readinessScore || 0)}}',
      position: [1820, 180],
    }),
    slackPostNode({
      id: 'slack_docs_needed',
      name: 'Slack Docs Needed',
      textExpr: '={{"📎 Docs needed before kickoff: " + ($json.email || "unknown") + " | score " + ($json.readinessScore || 0)}}',
      position: [1820, 540],
    }),
    gmailSendNode({
      id: 'gmail_client_update',
      name: 'Gmail Client Update',
      toExpr: '={{$json.email || "client@example.com"}}',
      subject: 'Your Onboarding Status',
      messageExpr: '={{"Status: " + ($json.onboardingStatus || "pending") + "\\nSummary: " + ($json.onboardingSummary || "N/A")}}',
      position: [2050, 360],
    }),
  ];

  const connections = {
    'Client Intake Webhook': { main: [[{ node: 'Normalize Intake', type: 'main', index: 0 }]] },
    'Normalize Intake': { main: [[{ node: 'Deterministic Readiness', type: 'main', index: 0 }]] },
    'Deterministic Readiness': {
      main: [
        [{ node: 'AI Onboarding Agent', type: 'main', index: 0 }],
        [{ node: 'Merge AI with Rules', type: 'main', index: 0 }],
      ],
    },
    'OpenAI Chat Model': {
      ai_languageModel: [[{ node: 'AI Onboarding Agent', type: 'ai_languageModel', index: 0 }]],
    },
    'AI Onboarding Agent': { main: [[{ node: 'Parse AI Output', type: 'main', index: 0 }]] },
    'Parse AI Output': { main: [[{ node: 'Merge AI with Rules', type: 'main', index: 1 }]] },
    'Merge AI with Rules': { main: [[{ node: 'Final Onboarding Decision', type: 'main', index: 0 }]] },
    'Final Onboarding Decision': { main: [[{ node: 'Kickoff Ready?', type: 'main', index: 0 }]] },
    'Kickoff Ready?': {
      main: [
        [
          { node: 'Slack Kickoff Ready', type: 'main', index: 0 },
          { node: 'Notion Onboarding Record', type: 'main', index: 0 },
        ],
        [
          { node: 'Slack Docs Needed', type: 'main', index: 0 },
          { node: 'Notion Onboarding Record', type: 'main', index: 0 },
        ],
      ],
    },
    'Notion Onboarding Record': { main: [[{ node: 'Gmail Client Update', type: 'main', index: 0 }]] },
  };

  return {
    name: 'Client Intake and Onboarding',
    active: false,
    settings: { executionOrder: 'v1' },
    versionId: '25997871-c326-4d87-a8b2-8cb06db579dd',
    nodes,
    connections,
  };
}

function revenueOpsWorkflow() {
  const nodes = [
    scheduleNode({ id: 'six_hour_trigger', name: '6 Hour Trigger', hoursInterval: 6, position: [220, 320] }),
    hubspotDealSearchNode({ id: 'hubspot_search_deals', name: 'HubSpot Search Deals', position: [470, 320] }),
    codeNode({
      id: 'deterministic_deal_risk',
      name: 'Deterministic Deal Risk',
      position: [700, 320],
      jsCode: `return $input.all().map((item) => {
  const daysInStage = Number(item.json.daysInStage || item.json.stageAgeDays || 18);
  const amount = Number(item.json.amount || item.json.dealValue || 12000);

  let deterministicScore = 30;
  if (daysInStage > 14) deterministicScore += 25;
  if (daysInStage > 30) deterministicScore += 20;
  if (amount >= 10000) deterministicScore += 15;

  return {
    json: {
      ...item.json,
      deterministicScore,
      daysInStage,
      amount,
    },
  };
});`,
    }),
    agentNode({
      id: 'ai_deal_risk_agent',
      name: 'AI Deal Risk Agent',
      prompt:
        "={{'You assess revenue pipeline slippage. Return strict JSON with keys aiScore (0-100), priority (at_risk|healthy), summary (string). Deal payload: ' + JSON.stringify($json)}}",
      position: [940, 220],
    }),
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', position: [940, 520] }),
    codeNode({ id: 'parse_ai_output', name: 'Parse AI Output', jsCode: parseAiOutputCode, position: [1160, 220] }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1160, 360] }),
    codeNode({
      id: 'final_deal_decision',
      name: 'Final Deal Decision',
      position: [1380, 360],
      jsCode: `return $input.all().map((item) => {
  const deterministicScore = Number(item.json.deterministicScore || 0);
  const aiScore = Number(item.json.aiScore || 0);
  const dealRiskScore = aiScore > 0
    ? Math.round((deterministicScore * 0.65) + (aiScore * 0.35))
    : deterministicScore;

  const health = dealRiskScore >= 70 ? 'at_risk' : 'healthy';

  return {
    json: {
      ...item.json,
      dealRiskScore,
      health,
      riskSummary: item.json.aiSummary || 'deterministic fallback used',
    },
  };
});`,
    }),
    hubspotContactUpsertNode({
      id: 'hubspot_sync_owner_contact',
      name: 'HubSpot Sync Owner Contact',
      emailExpr: `={{${JSON.stringify(ownerEmailPlaceholder)}}}`,
      position: [1600, 480],
    }),
    ifNumberNode({ id: 'at_risk_check', name: 'At Risk Deal?', valueExpr: '={{$json.dealRiskScore}}', threshold: 70, position: [1600, 320] }),
    notionCreatePageNode({
      id: 'notion_revops_log',
      name: 'Notion RevOps Log',
      titleExpr: '={{"RevOps: " + ($json.health || "healthy") + " | score " + ($json.dealRiskScore || 0)}}',
      position: [1820, 360],
    }),
    slackPostNode({
      id: 'slack_at_risk_alert',
      name: 'Slack At Risk Alert',
      textExpr: '={{"🚨 At-risk deal detected | score " + ($json.dealRiskScore || 0) + " | days " + ($json.daysInStage || 0)}}',
      position: [1820, 180],
    }),
    slackPostNode({
      id: 'slack_healthy_update',
      name: 'Slack Healthy Update',
      textExpr: '={{"✅ Deal health normal | score " + ($json.dealRiskScore || 0)}}',
      position: [1820, 540],
    }),
    gmailSendNode({
      id: 'gmail_revops_summary',
      name: 'Gmail RevOps Summary',
      toExpr: `={{${JSON.stringify(ownerEmailPlaceholder)}}}`,
      subject: 'RevOps Deal Health Summary',
      messageExpr: '={{"Health: " + ($json.health || "healthy") + "\\nScore: " + ($json.dealRiskScore || 0) + "\\nSummary: " + ($json.riskSummary || "N/A")}}',
      position: [2050, 360],
    }),
  ];

  const connections = {
    '6 Hour Trigger': { main: [[{ node: 'HubSpot Search Deals', type: 'main', index: 0 }]] },
    'HubSpot Search Deals': { main: [[{ node: 'Deterministic Deal Risk', type: 'main', index: 0 }]] },
    'Deterministic Deal Risk': {
      main: [
        [{ node: 'AI Deal Risk Agent', type: 'main', index: 0 }],
        [{ node: 'Merge AI with Rules', type: 'main', index: 0 }],
      ],
    },
    'OpenAI Chat Model': {
      ai_languageModel: [[{ node: 'AI Deal Risk Agent', type: 'ai_languageModel', index: 0 }]],
    },
    'AI Deal Risk Agent': { main: [[{ node: 'Parse AI Output', type: 'main', index: 0 }]] },
    'Parse AI Output': { main: [[{ node: 'Merge AI with Rules', type: 'main', index: 1 }]] },
    'Merge AI with Rules': { main: [[{ node: 'Final Deal Decision', type: 'main', index: 0 }]] },
    'Final Deal Decision': {
      main: [
        [{ node: 'At Risk Deal?', type: 'main', index: 0 }, { node: 'HubSpot Sync Owner Contact', type: 'main', index: 0 }],
      ],
    },
    'At Risk Deal?': {
      main: [
        [
          { node: 'Slack At Risk Alert', type: 'main', index: 0 },
          { node: 'Notion RevOps Log', type: 'main', index: 0 },
        ],
        [
          { node: 'Slack Healthy Update', type: 'main', index: 0 },
          { node: 'Notion RevOps Log', type: 'main', index: 0 },
        ],
      ],
    },
    'Notion RevOps Log': { main: [[{ node: 'Gmail RevOps Summary', type: 'main', index: 0 }]] },
  };

  return {
    name: 'Revenue Ops CRM Sync and Enrichment',
    active: false,
    settings: { executionOrder: 'v1' },
    versionId: '03e50be0-bd1f-4444-8912-a426aa3efb76',
    nodes,
    connections,
  };
}

const workflows = [
  {
    fileName: 'lead-intake-qualification-workflow.json',
    repoDir: 'n8n-lead-intake-qualification-system',
    workflow: leadWorkflow(),
  },
  {
    fileName: 'internal-ops-routing-approvals-workflow.json',
    repoDir: 'n8n-internal-ops-routing-approvals',
    workflow: internalOpsWorkflow(),
  },
  {
    fileName: 'ai-support-ticket-triage-workflow.json',
    repoDir: 'n8n-ai-support-ticket-triage',
    workflow: supportWorkflow(),
  },
  {
    fileName: 'automated-reporting-dashboards-workflow.json',
    repoDir: 'n8n-automated-reporting-dashboards',
    workflow: reportingWorkflow(),
  },
  {
    fileName: 'client-intake-onboarding-workflow.json',
    repoDir: 'n8n-client-intake-onboarding-automation',
    workflow: onboardingWorkflow(),
  },
  {
    fileName: 'revenue-ops-crm-sync-workflow.json',
    repoDir: 'n8n-revenue-ops-crm-sync',
    workflow: revenueOpsWorkflow(),
  },
];

for (const item of workflows) {
  const workflowJson = JSON.stringify(item.workflow, null, 2) + '\n';

  const publicPath = join(rootDir, 'client/public/n8n-workflows', item.fileName);
  mkdirSync(dirname(publicPath), { recursive: true });
  writeFileSync(publicPath, workflowJson, 'utf8');

  const repoPath = join(rootDir, 'case-study-repos', item.repoDir, 'n8n', 'workflow.json');
  mkdirSync(dirname(repoPath), { recursive: true });
  writeFileSync(repoPath, workflowJson, 'utf8');
}

console.log(`Generated ${workflows.length} native-node workflows in public and repo mirrors.`);
