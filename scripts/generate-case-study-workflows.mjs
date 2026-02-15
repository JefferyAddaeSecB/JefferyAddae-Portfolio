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

function webhookNode({ id, name, path, position, responseMode = 'onReceived' }) {
  return {
    parameters: {
      path,
      httpMethod: 'POST',
      responseMode,
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

function modelNode({ id, name, position, modelName = 'gpt-4o-mini' }) {
  return {
    parameters: {
      model: {
        mode: 'list',
        value: modelName,
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

function slackPostNode({ id, name, textExpr, position, channelIdValue = slackChannelPlaceholder }) {
  return {
    parameters: {
      resource: 'message',
      operation: 'post',
      select: 'channel',
      channelId: {
        mode: 'id',
        value: channelIdValue,
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

function notionCreatePageNode({ id, name, titleExpr, position, databaseIdValue = notionDatabasePlaceholder }) {
  return {
    parameters: {
      resource: 'databasePage',
      operation: 'create',
      databaseId: {
        mode: 'url',
        value: databaseIdValue,
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
      id: 'validate_lead_payload',
      name: 'Validate Lead Payload',
      position: [650, 320],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const errors = [];

  const firstName = String(payload.firstName || payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const message = String(payload.message || payload.details || payload.description || '').trim();
  const budget = Number(payload.budget || 0);
  const urgency = String(payload.urgency || payload.timeline || '').toLowerCase().trim();
  const source = String(payload.source || '').toLowerCase().trim();

  if (!firstName) errors.push('first_name_missing');
  if (!email) errors.push('email_missing');
  if (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push('email_invalid');
  if (!message) errors.push('message_missing');

  output.push({
    json: {
      ...payload,
      firstName,
      email,
      message,
      budget,
      urgency,
      source,
      isValidLead: errors.length === 0 ? 1 : 0,
      validationErrors: errors,
    },
  });
}
return output;`,
    }),
    ifNumberNode({
      id: 'lead_valid_check',
      name: 'Lead Valid?',
      valueExpr: '={{$json.isValidLead}}',
      threshold: 1,
      position: [860, 320],
    }),
    {
      ...slackPostNode({
      id: 'slack_invalid_lead',
      name: 'Slack Invalid Lead',
      textExpr: '={{"⚠️ Invalid lead blocked: " + ($json.email || "unknown") + " | errors " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 180],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_invalid_lead',
      name: 'Gmail Invalid Lead',
      toExpr: '={{$env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Invalid Lead Payload',
      messageExpr: '={{"Blocked lead for " + ($json.email || "unknown") + "\\nErrors: " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 260],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'inject_lead_config',
      name: 'Inject Lead Config',
      position: [1080, 420],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};

  const envHotThreshold = Number(process.env.N8N_LEAD_HOT_THRESHOLD || 75);
  const envWarmThreshold = Number(process.env.N8N_LEAD_WARM_THRESHOLD || 55);
  const envRulesWeight = Number(process.env.N8N_LEAD_RULES_WEIGHT || 0.65);
  const envAiWeight = Number(process.env.N8N_LEAD_AI_WEIGHT || 0.35);

  const hotBase = Number.isFinite(Number(payload.hotThreshold))
    ? Number(payload.hotThreshold)
    : (Number.isFinite(envHotThreshold) ? envHotThreshold : 75);
  const hotThreshold = Math.min(100, Math.max(1, hotBase));

  const warmBase = Number.isFinite(Number(payload.warmThreshold))
    ? Number(payload.warmThreshold)
    : (Number.isFinite(envWarmThreshold) ? envWarmThreshold : 55);
  const warmThreshold = Math.min(hotThreshold - 1, Math.min(99, Math.max(0, warmBase)));

  const rulesWeightRaw = Number.isFinite(Number(payload.rulesWeight))
    ? Number(payload.rulesWeight)
    : (Number.isFinite(envRulesWeight) ? envRulesWeight : 0.65);
  const aiWeightRaw = Number.isFinite(Number(payload.aiWeight))
    ? Number(payload.aiWeight)
    : (Number.isFinite(envAiWeight) ? envAiWeight : 0.35);

  const weightTotal = (rulesWeightRaw > 0 ? rulesWeightRaw : 0) + (aiWeightRaw > 0 ? aiWeightRaw : 0);
  const rulesWeight = weightTotal > 0 ? (rulesWeightRaw > 0 ? rulesWeightRaw : 0) / weightTotal : 0.65;
  const aiWeight = weightTotal > 0 ? (aiWeightRaw > 0 ? aiWeightRaw : 0) / weightTotal : 0.35;

  output.push({
    json: {
      ...payload,
      hotThreshold,
      warmThreshold,
      rulesWeight: Number(rulesWeight.toFixed(3)),
      aiWeight: Number(aiWeight.toFixed(3)),
    },
  });
}
return output;`,
    }),
    codeNode({
      id: 'deterministic_lead_scoring',
      name: 'Deterministic Lead Scoring',
      position: [1310, 420],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const budget = Number(payload.budget || 0);
  const urgency = String(payload.urgency || payload.timeline || '').toLowerCase().trim();
  const source = String(payload.source || 'unknown').toLowerCase().trim();
  const role = String(payload.role || payload.title || '').toLowerCase().trim();
  const companySize = Number(payload.companySize || payload.employeeCount || 0);

  let budgetScore = 0;
  if (budget >= 2000) budgetScore += 8;
  if (budget >= 5000) budgetScore += 12;
  if (budget >= 12000) budgetScore += 12;
  if (budget >= 25000) budgetScore += 8;

  let urgencyScore = 0;
  if (/high|urgent|asap|immediately|this week/.test(urgency)) urgencyScore = 20;
  else if (/soon|this month|next 2 weeks|14 days/.test(urgency)) urgencyScore = 12;
  else if (/exploring|later|no rush/.test(urgency)) urgencyScore = 4;

  let sourceScore = 0;
  if (/referral|partner/.test(source)) sourceScore = 10;
  else if (/inbound|organic|website/.test(source)) sourceScore = 6;
  else sourceScore = 3;

  let authorityScore = 0;
  if (/owner|founder|ceo|coo|director|head|manager/.test(role)) authorityScore = 8;
  if (companySize >= 20) authorityScore += 4;

  const baseScore = 20;
  const deterministicScore = Math.min(100, baseScore + budgetScore + urgencyScore + sourceScore + authorityScore);
  const hotThreshold = Number(payload.hotThreshold || 75);
  const warmThreshold = Number(payload.warmThreshold || 55);

  const deterministicPriority = deterministicScore >= hotThreshold
    ? 'hot'
    : (deterministicScore >= warmThreshold ? 'warm' : 'cold');

  const fingerprint = [
    String(payload.email || '').toLowerCase(),
    String(payload.company || '').toLowerCase(),
    String(payload.firstName || payload.name || '').toLowerCase(),
    String(payload.message || '').trim().toLowerCase(),
  ].join('|');
  const idempotencyKey = Buffer.from(fingerprint).toString('base64').replace(/=/g, '').slice(0, 64);

  output.push({
    json: {
      ...payload,
      budgetScore,
      urgencyScore,
      sourceScore,
      authorityScore,
      deterministicScore,
      deterministicPriority,
      idempotencyKey,
    },
  });
}
return output;`,
    }),
    {
      ...agentNode({
      id: 'ai_lead_qualifier',
      name: 'AI Lead Qualifier',
      prompt:
        "={{'Analyze this B2B lead for sales readiness. Respond ONLY with valid JSON (no markdown, no commentary) using this exact schema: {\"aiScore\": number 0-100, \"priority\": \"hot\" | \"warm\" | \"cold\", \"summary\": string, \"confidence\": number 0-1}. Consider: budget size, urgency signals, company fit, decision maker access, and message clarity. Keep summary under 240 characters. Lead payload: ' + JSON.stringify($json)}}",
      position: [1540, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', modelName: 'gpt-4o-mini', position: [1540, 560] }),
    codeNode({
      id: 'parse_ai_output',
      name: 'Parse AI Output',
      position: [1760, 220],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const candidates = [payload.output, payload.text, payload.response, payload.result, payload];

  let parsed = {};
  let aiParseOk = false;

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    if (typeof candidate === 'object') {
      parsed = candidate;
      aiParseOk = true;
      break;
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      try {
        parsed = JSON.parse(trimmed);
        aiParseOk = true;
        break;
      } catch (error) {
        const match = trimmed.match(/\\{[\\s\\S]*\\}/);
        if (!match) continue;
        try {
          parsed = JSON.parse(match[0]);
          aiParseOk = true;
          break;
        } catch (innerError) {
          // Continue trying remaining candidates.
        }
      }
    }
  }

  const aiScoreRaw = Number(parsed.aiScore ?? parsed.score ?? parsed.leadScore ?? 0);
  const aiScore = Number.isFinite(aiScoreRaw) ? Math.min(100, Math.max(0, aiScoreRaw)) : 0;

  let aiPriority = String(parsed.priority || '').toLowerCase().trim();
  if (!['hot', 'warm', 'cold'].includes(aiPriority)) {
    const hotThreshold = Number(payload.hotThreshold || 75);
    const warmThreshold = Number(payload.warmThreshold || 55);
    aiPriority = aiScore >= hotThreshold ? 'hot' : (aiScore >= warmThreshold ? 'warm' : 'cold');
  }

  const aiSummary = String(parsed.summary || parsed.rationale || parsed.reason || '').trim();
  const aiConfidenceRaw = Number(parsed.confidence ?? 0);
  const aiConfidence = Number.isFinite(aiConfidenceRaw) ? Math.min(1, Math.max(0, aiConfidenceRaw)) : 0;

  output.push({
    json: {
      aiParseOk,
      aiScore,
      aiPriority,
      aiSummary: aiSummary || 'deterministic fallback used',
      aiConfidence,
      aiPayload: parsed,
    },
  });
}
return output;`,
    }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1760, 420] }),
    codeNode({
      id: 'final_priority_decision',
      name: 'Final Priority Decision',
      position: [1980, 420],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const deterministicScore = Number(payload.deterministicScore || 0);
  const aiScore = Number(payload.aiScore || 0);
  const rulesWeight = Number(payload.rulesWeight || 0.65);
  const aiWeight = Number(payload.aiWeight || 0.35);
  const hotThreshold = Number(payload.hotThreshold || 75);
  const warmThreshold = Number(payload.warmThreshold || 55);

  const aiUsable = payload.aiParseOk === true && aiScore > 0;
  const blendedScore = aiUsable
    ? Math.round((deterministicScore * rulesWeight) + (aiScore * aiWeight))
    : deterministicScore;

  const leadScore = Math.min(100, Math.max(0, blendedScore));
  const priority = leadScore >= hotThreshold
    ? 'hot'
    : (leadScore >= warmThreshold ? 'warm' : 'cold');

  output.push({
    json: {
      ...payload,
      leadScore,
      priority,
      hotLeadFlag: priority === 'hot' ? 1 : 0,
      scoringSource: aiUsable ? 'blended_ai_plus_rules' : 'deterministic_rules_only',
      aiSummary: payload.aiSummary || 'deterministic fallback used',
    },
  });
}
return output;`,
    }),
    ifNumberNode({ id: 'hot_lead_check', name: 'Hot Lead?', valueExpr: '={{$json.hotLeadFlag}}', threshold: 1, position: [2200, 360] }),
    {
      ...slackPostNode({
      id: 'slack_hot_lead_alert',
      name: 'Slack Hot Lead Alert',
      textExpr: '={{"🔥 HOT lead: " + ($json.email || "no-email") + " | score " + ($json.leadScore || 0)}}',
      position: [2420, 220],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...slackPostNode({
      id: 'slack_standard_lead_alert',
      name: 'Slack Standard Lead Alert',
      textExpr: '={{"New lead: " + ($json.email || "no-email") + " | priority " + ($json.priority || "cold")}}',
      position: [2420, 380],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_owner_lead_summary',
      name: 'Gmail Owner Lead Summary',
      toExpr: '={{$env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Hot Lead Summary',
      messageExpr: '={{"Priority: " + ($json.priority || "cold") + "\\nScore: " + ($json.leadScore || 0) + "\\nLead: " + ($json.email || "no-email") + "\\nSummary: " + ($json.aiSummary || "N/A")}}',
      position: [2420, 540],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'dedupe_lead_record',
      name: 'Dedupe Lead Record',
      position: [2640, 360],
      jsCode: `const seen = new Set();
const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const key = String(payload.idempotencyKey || payload.email || '').trim();
  if (key && seen.has(key)) continue;
  if (key) seen.add(key);

  output.push({
    json: {
      ...payload,
      duplicateSuppressed: false,
    },
  });
}

return output;`,
    }),
    {
      ...notionCreatePageNode({
      id: 'notion_record_lead',
      name: 'Notion Record Lead',
      titleExpr: '={{"Lead: " + ($json.firstName || $json.name || "Unknown") + " | " + ($json.priority || "cold")}}',
      position: [2860, 360],
      databaseIdValue: '={{$env.LEADS_NOTION_DB_URL || $env.NOTION_DATABASE_URL || "https://www.notion.so/00000000000000000000000000000000"}}',
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...hubspotContactUpsertNode({
      id: 'hubspot_upsert_contact',
      name: 'HubSpot Upsert Contact',
      emailExpr: '={{$json.email || $json.primaryEmail || ""}}',
      position: [3090, 360],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
  ];

  const connections = {
    'Lead Webhook': { main: [[{ node: 'Normalize Lead Payload', type: 'main', index: 0 }]] },
    'Normalize Lead Payload': { main: [[{ node: 'Validate Lead Payload', type: 'main', index: 0 }]] },
    'Validate Lead Payload': { main: [[{ node: 'Lead Valid?', type: 'main', index: 0 }]] },
    'Lead Valid?': {
      main: [
        [{ node: 'Inject Lead Config', type: 'main', index: 0 }],
        [
          { node: 'Slack Invalid Lead', type: 'main', index: 0 },
          { node: 'Gmail Invalid Lead', type: 'main', index: 0 },
        ],
      ],
    },
    'Inject Lead Config': { main: [[{ node: 'Deterministic Lead Scoring', type: 'main', index: 0 }]] },
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
        [{ node: 'Slack Hot Lead Alert', type: 'main', index: 0 }, { node: 'Gmail Owner Lead Summary', type: 'main', index: 0 }],
        [{ node: 'Slack Standard Lead Alert', type: 'main', index: 0 }],
      ],
    },
    'Slack Hot Lead Alert': { main: [[{ node: 'Dedupe Lead Record', type: 'main', index: 0 }]] },
    'Slack Standard Lead Alert': { main: [[{ node: 'Dedupe Lead Record', type: 'main', index: 0 }]] },
    'Dedupe Lead Record': { main: [[{ node: 'Notion Record Lead', type: 'main', index: 0 }]] },
    'Notion Record Lead': { main: [[{ node: 'HubSpot Upsert Contact', type: 'main', index: 0 }]] },
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
    webhookNode({
      id: 'ops_request_webhook',
      name: 'Ops Request Webhook',
      path: 'ops-request-v3',
      responseMode: 'lastNode',
      position: [220, 320],
    }),
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
      id: 'validate_ops_request',
      name: 'Validate Ops Request',
      position: [650, 320],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const errors = [];

  const firstName = String(payload.firstName || payload.name || '').trim();
  const email = String(payload.email || payload.requesterEmail || '').trim().toLowerCase();
  const requestTypeRaw = String(payload.requestType || payload.type || 'general').trim().toLowerCase();
  const priorityRaw = String(payload.priority || payload.urgency || 'normal').trim().toLowerCase();
  const details = String(payload.details || payload.message || payload.description || '').trim();
  const allowedDomain = String(process.env.N8N_OPS_ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase();

  if (!firstName) errors.push('first_name_missing');
  if (!email) errors.push('email_missing');
  if (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push('email_invalid');
  if (allowedDomain && email && !email.endsWith('@' + allowedDomain)) errors.push('email_domain_not_allowed');
  if (!details) errors.push('details_missing');

  const fingerprint = [
    email,
    requestTypeRaw,
    priorityRaw,
    details.toLowerCase(),
  ].join('|');

  const requestId = String(payload.requestId || payload.id || '').trim() ||
    Buffer.from(fingerprint).toString('base64').replace(/=/g, '').slice(0, 64);

  output.push({
    json: {
      ...payload,
      firstName,
      email,
      requestTypeRaw,
      priorityRaw,
      details,
      requestId,
      idempotencyKey: requestId,
      isValidRequest: errors.length === 0 ? 1 : 0,
      validationErrors: errors,
    },
  });
}

return output;`,
    }),
    ifNumberNode({
      id: 'request_valid_check',
      name: 'Request Valid?',
      valueExpr: '={{$json.isValidRequest}}',
      threshold: 1,
      position: [860, 320],
    }),
    {
      ...slackPostNode({
      id: 'slack_invalid_ops_request',
      name: 'Slack Invalid Ops Request',
      textExpr: '={{"⚠️ Invalid ops request blocked: " + ($json.email || "unknown") + " | errors " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 180],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_invalid_ops_request',
      name: 'Gmail Invalid Ops Request',
      toExpr: '={{$env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Invalid Ops Request Payload',
      messageExpr: '={{"Blocked request for " + ($json.email || "unknown") + "\\nErrors: " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 260],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'inject_ops_config',
      name: 'Inject Ops Config',
      position: [1080, 420],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};

  const envEscalationThreshold = Number(process.env.N8N_OPS_ESCALATION_THRESHOLD || 70);
  const envCriticalThreshold = Number(process.env.N8N_OPS_CRITICAL_THRESHOLD || 85);
  const envRulesWeight = Number(process.env.N8N_OPS_RULES_WEIGHT || 0.7);
  const envAiWeight = Number(process.env.N8N_OPS_AI_WEIGHT || 0.3);

  const escalationThresholdRaw = Number.isFinite(Number(payload.escalationThreshold))
    ? Number(payload.escalationThreshold)
    : (Number.isFinite(envEscalationThreshold) ? envEscalationThreshold : 70);
  const escalationThreshold = Math.min(100, Math.max(1, escalationThresholdRaw));

  const criticalRaw = Number.isFinite(Number(payload.criticalThreshold))
    ? Number(payload.criticalThreshold)
    : (Number.isFinite(envCriticalThreshold) ? envCriticalThreshold : 85);
  const criticalThreshold = Math.min(100, Math.max(escalationThreshold, criticalRaw));

  const rulesWeightRaw = Number.isFinite(Number(payload.rulesWeight))
    ? Number(payload.rulesWeight)
    : (Number.isFinite(envRulesWeight) ? envRulesWeight : 0.7);
  const aiWeightRaw = Number.isFinite(Number(payload.aiWeight))
    ? Number(payload.aiWeight)
    : (Number.isFinite(envAiWeight) ? envAiWeight : 0.3);

  const totalWeight = (rulesWeightRaw > 0 ? rulesWeightRaw : 0) + (aiWeightRaw > 0 ? aiWeightRaw : 0);
  const rulesWeight = totalWeight > 0 ? (rulesWeightRaw > 0 ? rulesWeightRaw : 0) / totalWeight : 0.7;
  const aiWeight = totalWeight > 0 ? (aiWeightRaw > 0 ? aiWeightRaw : 0) / totalWeight : 0.3;

  const typeToApprover = {
    finance: 'finance-manager',
    security: 'security-lead',
    legal: 'legal-counsel',
    it: 'it-admin',
    hr: 'hr-director',
    general: 'ops-manager',
  };

  const approverEmails = {
    'finance-manager': String(payload.financeApproverEmail || process.env.N8N_APPROVER_FINANCE_EMAIL || '').trim().toLowerCase(),
    'security-lead': String(payload.securityApproverEmail || process.env.N8N_APPROVER_SECURITY_EMAIL || '').trim().toLowerCase(),
    'legal-counsel': String(payload.legalApproverEmail || process.env.N8N_APPROVER_LEGAL_EMAIL || '').trim().toLowerCase(),
    'it-admin': String(payload.itApproverEmail || process.env.N8N_APPROVER_IT_EMAIL || '').trim().toLowerCase(),
    'hr-director': String(payload.hrApproverEmail || process.env.N8N_APPROVER_HR_EMAIL || '').trim().toLowerCase(),
    'ops-manager': String(payload.opsApproverEmail || process.env.N8N_APPROVER_OPS_EMAIL || process.env.OWNER_EMAIL || '').trim().toLowerCase(),
  };

  output.push({
    json: {
      ...payload,
      escalationThreshold,
      criticalThreshold,
      rulesWeight: Number(rulesWeight.toFixed(3)),
      aiWeight: Number(aiWeight.toFixed(3)),
      ownerEmail: String(payload.ownerEmail || process.env.OWNER_EMAIL || 'owner@example.com').trim(),
      approvalWebhookBaseUrl: String(payload.approvalWebhookBaseUrl || process.env.N8N_APPROVAL_WEBHOOK_BASE_URL || 'https://example.com/webhook/ops-approval-action-v1').trim(),
      typeToApprover,
      approverEmails,
    },
  });
}

return output;`,
    }),
    codeNode({
      id: 'deterministic_ops_routing',
      name: 'Deterministic Ops Routing',
      position: [1310, 420],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const requestTypeRaw = String(payload.requestTypeRaw || payload.requestType || 'general').toLowerCase().trim();
  const priorityRaw = String(payload.priorityRaw || payload.priority || 'normal').toLowerCase().trim();
  const details = String(payload.details || '').toLowerCase();
  const typeToApprover = payload.typeToApprover || {};
  const approverEmails = payload.approverEmails || {};

  let requestType = 'general';
  if (/security|breach|vulnerability|incident/.test(requestTypeRaw)) requestType = 'security';
  else if (/finance|invoice|billing|payment|expense/.test(requestTypeRaw)) requestType = 'finance';
  else if (/legal|contract|compliance|regulatory/.test(requestTypeRaw)) requestType = 'legal';
  else if (/(^|\\W)it(\\W|$)|access|infrastructure|system/.test(requestTypeRaw)) requestType = 'it';
  else if (/hr|people|hiring|employee/.test(requestTypeRaw)) requestType = 'hr';

  let priorityScore = 0;
  if (/urgent|critical|p1|sev1/.test(priorityRaw)) priorityScore = 30;
  else if (/high|asap|today/.test(priorityRaw)) priorityScore = 22;
  else if (/normal|medium/.test(priorityRaw)) priorityScore = 12;
  else priorityScore = 6;

  const typeRiskScore = {
    security: 24,
    finance: 18,
    legal: 16,
    it: 10,
    hr: 8,
    general: 6,
  }[requestType] || 6;

  let crossFunctionalScore = 0;
  if (/cross[-\\s]?functional|multiple teams|all hands|production/.test(details)) crossFunctionalScore += 12;
  if (/customer impact|revenue impact|compliance risk/.test(details)) crossFunctionalScore += 10;

  const baseScore = 28;
  const deterministicScore = Math.min(100, baseScore + priorityScore + typeRiskScore + crossFunctionalScore);

  const approver = typeToApprover[requestType] || 'ops-manager';
  const approverEmail = String(approverEmails[approver] || '').trim().toLowerCase();
  const hasApproverEmailFlag = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(approverEmail) ? 1 : 0;

  const baseSlaByType = {
    security: 4,
    finance: 8,
    legal: 12,
    it: 16,
    hr: 20,
    general: 24,
  };
  let slaHours = baseSlaByType[requestType] || 24;
  if (/urgent|critical|p1|sev1|high/.test(priorityRaw)) slaHours = Math.max(2, Math.round(slaHours * 0.5));
  else if (deterministicScore >= 70) slaHours = Math.max(2, Math.round(slaHours * 0.7));

  const slaDeadlineAt = new Date(Date.now() + (slaHours * 60 * 60 * 1000)).toISOString();
  const escalationThreshold = Number(payload.escalationThreshold || 70);
  const statusByRules = deterministicScore >= escalationThreshold ? 'escalation_required' : 'standard_approval';

  output.push({
    json: {
      ...payload,
      requestType,
      priority: priorityRaw || 'normal',
      deterministicScore,
      approver,
      approverEmail,
      hasApproverEmailFlag,
      slaHours,
      slaDeadlineAt,
      statusByRules,
    },
  });
}

return output;`,
    }),
    {
      ...agentNode({
      id: 'ai_ops_risk_agent',
      name: 'AI Ops Risk Agent',
      prompt:
        "={{'You are an internal ops triage agent. HIGH RISK (escalate): security incidents, fraud/compliance violations, legal threats, executive urgency, or cross-functional impact. STANDARD: routine access, standard procurement, normal IT support, general requests. Return ONLY valid JSON with this schema: {\"aiScore\": number 0-100, \"priority\": \"escalate\" | \"standard\", \"summary\": string, \"confidence\": number 0-1}. Keep summary under 220 characters. Request payload: ' + JSON.stringify($json)}}",
      position: [1540, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', modelName: 'gpt-4o-mini', position: [1540, 560] }),
    codeNode({
      id: 'parse_ai_output',
      name: 'Parse AI Output',
      position: [1760, 220],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const candidates = [payload.output, payload.text, payload.response, payload.result, payload];

  let parsed = {};
  let aiParseOk = false;

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    if (typeof candidate === 'object') {
      parsed = candidate;
      aiParseOk = true;
      break;
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      try {
        parsed = JSON.parse(trimmed);
        aiParseOk = true;
        break;
      } catch (error) {
        const match = trimmed.match(/\\{[\\s\\S]*\\}/);
        if (!match) continue;
        try {
          parsed = JSON.parse(match[0]);
          aiParseOk = true;
          break;
        } catch (innerError) {
          // Continue trying remaining candidates.
        }
      }
    }
  }

  const aiScoreRaw = Number(parsed.aiScore ?? parsed.score ?? parsed.riskScore ?? 0);
  const aiScore = Number.isFinite(aiScoreRaw) ? Math.min(100, Math.max(0, aiScoreRaw)) : 0;

  let aiPriority = String(parsed.priority || '').toLowerCase().trim();
  if (!['escalate', 'standard'].includes(aiPriority)) {
    const escalationThreshold = Number(payload.escalationThreshold || 70);
    aiPriority = aiScore >= escalationThreshold ? 'escalate' : 'standard';
  }

  const aiSummary = String(parsed.summary || parsed.rationale || parsed.reason || '').trim();
  const aiConfidenceRaw = Number(parsed.confidence ?? 0);
  const aiConfidence = Number.isFinite(aiConfidenceRaw) ? Math.min(1, Math.max(0, aiConfidenceRaw)) : 0;

  output.push({
    json: {
      aiParseOk,
      aiScore,
      aiPriority,
      aiSummary: aiSummary || 'deterministic fallback used',
      aiConfidence,
      aiPayload: parsed,
    },
  });
}

return output;`,
    }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1760, 420] }),
    codeNode({
      id: 'final_ops_decision',
      name: 'Final Ops Decision',
      position: [1980, 420],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const deterministicScore = Number(payload.deterministicScore || 0);
  const aiScore = Number(payload.aiScore || 0);
  const rulesWeight = Number(payload.rulesWeight || 0.7);
  const aiWeight = Number(payload.aiWeight || 0.3);
  const escalationThreshold = Number(payload.escalationThreshold || 70);
  const criticalThreshold = Number(payload.criticalThreshold || 85);

  const aiUsable = payload.aiParseOk === true && aiScore > 0;
  const blendedScore = aiUsable
    ? Math.round((deterministicScore * rulesWeight) + (aiScore * aiWeight))
    : deterministicScore;
  const escalationScore = Math.min(100, Math.max(0, blendedScore));

  const escalate = escalationScore >= escalationThreshold;
  const isCritical = escalationScore >= criticalThreshold;

  const approvalStatus = escalate ? 'escalation_required' : 'standard_approval';
  const status = escalate
    ? (isCritical ? 'awaiting_critical_approval' : 'awaiting_escalated_approval')
    : 'awaiting_standard_approval';

  const baseApprovalUrl = String(payload.approvalWebhookBaseUrl || process.env.N8N_APPROVAL_WEBHOOK_BASE_URL || '').trim();
  const requestId = String(payload.requestId || payload.idempotencyKey || '').trim();
  const requesterEmail = String(payload.email || '').trim().toLowerCase();
  const approverEmail = String(payload.approverEmail || '').trim().toLowerCase();
  const ownerEmail = String(payload.ownerEmail || process.env.OWNER_EMAIL || 'owner@example.com').trim();

  const buildApprovalUrl = (action) => {
    if (!baseApprovalUrl || !requestId) return '';
    const params = new URLSearchParams({
      requestId,
      action,
      requesterEmail,
      approverEmail,
      ownerEmail,
    });
    return baseApprovalUrl + (baseApprovalUrl.includes('?') ? '&' : '?') + params.toString();
  };

  output.push({
    json: {
      ...payload,
      escalationScore,
      escalate,
      isCritical,
      approvalStatus,
      status,
      needsEscalationFlag: escalate ? 1 : 0,
      escalationOwnerFlag: escalate ? 1 : 0,
      scoringSource: aiUsable ? 'blended_ai_plus_rules' : 'deterministic_rules_only',
      triageSummary: payload.aiSummary || 'deterministic fallback used',
      approvalApproveUrl: buildApprovalUrl('approve'),
      approvalRejectUrl: buildApprovalUrl('reject'),
    },
  });
}

return output;`,
    }),
    ifNumberNode({ id: 'escalation_check', name: 'Escalation Needed?', valueExpr: '={{$json.needsEscalationFlag}}', threshold: 1, position: [2200, 360] }),
    {
      ...slackPostNode({
      id: 'slack_escalation_alert',
      name: 'Slack Escalation Alert',
      textExpr: '={{"⚠️ Escalation required for " + ($json.requestType || "request") + " | score " + ($json.escalationScore || 0) + " | approver " + ($json.approver || "ops-manager")}}',
      position: [2420, 220],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...slackPostNode({
      id: 'slack_standard_alert',
      name: 'Slack Standard Alert',
      textExpr: '={{"New ops request assigned to " + ($json.approver || "ops-manager") + " | SLA " + ($json.slaHours || 24) + "h"}}',
      position: [2420, 380],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'dedupe_ops_request',
      name: 'Dedupe Ops Request',
      position: [2640, 320],
      jsCode: `const seen = new Set();
const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const key = String(payload.idempotencyKey || payload.requestId || '').trim();
  if (key && seen.has(key)) continue;
  if (key) seen.add(key);

  output.push({
    json: {
      ...payload,
      duplicateSuppressed: false,
    },
  });
}

return output;`,
    }),
    {
      ...notionCreatePageNode({
      id: 'notion_record_request',
      name: 'Notion Record Request',
      titleExpr: '={{"Ops Request: " + ($json.requestType || "general") + " | " + ($json.status || "pending")}}',
      position: [2860, 320],
      databaseIdValue: '={{$env.OPS_NOTION_DB_URL || $env.NOTION_DATABASE_URL || "https://www.notion.so/00000000000000000000000000000000"}}',
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_request_status',
      name: 'Gmail Request Status',
      toExpr: '={{$json.email || $json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Ops Request Status Update',
      messageExpr: '={{"Status: " + ($json.status || "pending") + "\\nApproval: " + ($json.approvalStatus || "pending") + "\\nApprover: " + ($json.approver || "ops-manager") + "\\nSLA: " + ($json.slaHours || 24) + "h\\nDeadline: " + ($json.slaDeadlineAt || "N/A") + "\\nSummary: " + ($json.triageSummary || "N/A")}}',
      position: [3080, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    ifNumberNode({ id: 'approver_email_available', name: 'Approver Email Available?', valueExpr: '={{$json.hasApproverEmailFlag}}', threshold: 1, position: [3080, 360] }),
    {
      ...gmailSendNode({
      id: 'gmail_approver_assignment',
      name: 'Gmail Approver Assignment',
      toExpr: '={{$json.approverEmail || $json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Approval Needed: Ops Request',
      messageExpr: '={{"Request ID: " + ($json.requestId || "N/A") + "\\nType: " + ($json.requestType || "general") + "\\nPriority: " + ($json.priority || "normal") + "\\nEscalation score: " + ($json.escalationScore || 0) + "\\n\\nApprove: " + ($json.approvalApproveUrl || "N/A") + "\\nReject: " + ($json.approvalRejectUrl || "N/A") + "\\n\\nDetails: " + ($json.details || "N/A")}}',
      position: [3300, 320],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    ifNumberNode({ id: 'escalation_owner_check', name: 'Escalation Owner Notice?', valueExpr: '={{$json.escalationOwnerFlag}}', threshold: 1, position: [3080, 500] }),
    {
      ...gmailSendNode({
      id: 'gmail_owner_escalation',
      name: 'Gmail Owner Escalation',
      toExpr: '={{$json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Escalated Ops Request',
      messageExpr: '={{"Escalation score: " + ($json.escalationScore || 0) + "\\nType: " + ($json.requestType || "general") + "\\nApprover: " + ($json.approver || "ops-manager") + "\\nStatus: " + ($json.status || "pending")}}',
      position: [3300, 500],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    webhookNode({
      id: 'approval_action_webhook',
      name: 'Approval Action Webhook',
      path: 'ops-approval-action-v1',
      responseMode: 'lastNode',
      position: [220, 760],
    }),
    codeNode({
      id: 'normalize_approval_action',
      name: 'Normalize Approval Action',
      position: [450, 760],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const body = payload.body && typeof payload.body === 'object' ? payload.body : {};
  const query = payload.query && typeof payload.query === 'object' ? payload.query : {};

  const action = String(body.action || query.action || payload.action || '').trim().toLowerCase();
  const requestId = String(body.requestId || query.requestId || payload.requestId || '').trim();
  const requesterEmail = String(body.requesterEmail || query.requesterEmail || payload.requesterEmail || '').trim().toLowerCase();
  const approverEmail = String(body.approverEmail || query.approverEmail || payload.approverEmail || '').trim().toLowerCase();
  const ownerEmail = String(body.ownerEmail || query.ownerEmail || payload.ownerEmail || process.env.OWNER_EMAIL || 'owner@example.com').trim();
  const note = String(body.note || query.note || payload.note || '').trim();

  const normalizedAction = action === 'approve' ? 'approved' : (action === 'reject' || action === 'rejected' ? 'rejected' : '');
  const isValidActionFlag = normalizedAction && requestId ? 1 : 0;

  output.push({
    json: {
      ...payload,
      action: normalizedAction || action,
      requestId,
      requesterEmail,
      approverEmail,
      ownerEmail,
      note,
      isValidActionFlag,
      decisionStatus: normalizedAction || 'invalid',
      decisionAt: new Date().toISOString(),
    },
  });
}

return output;`,
    }),
    ifNumberNode({ id: 'approval_action_valid_check', name: 'Approval Action Valid?', valueExpr: '={{$json.isValidActionFlag}}', threshold: 1, position: [680, 760] }),
    {
      ...slackPostNode({
      id: 'slack_invalid_approval_action',
      name: 'Slack Invalid Approval Action',
      textExpr: '={{"⚠️ Invalid approval action callback received. requestId=" + ($json.requestId || "missing") + " action=" + ($json.action || "missing")}}',
      position: [900, 660],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...slackPostNode({
      id: 'slack_approval_decision',
      name: 'Slack Approval Decision',
      textExpr: '={{"✅ Approval decision: " + ($json.decisionStatus || "unknown") + " | request " + ($json.requestId || "N/A")}}',
      position: [900, 820],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...notionCreatePageNode({
      id: 'notion_approval_decision_log',
      name: 'Notion Approval Decision Log',
      titleExpr: '={{"Ops Approval: " + ($json.requestId || "N/A") + " | " + ($json.decisionStatus || "unknown")}}',
      position: [1120, 760],
      databaseIdValue: '={{$env.OPS_NOTION_DB_URL || $env.NOTION_DATABASE_URL || "https://www.notion.so/00000000000000000000000000000000"}}',
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_approval_decision',
      name: 'Gmail Approval Decision',
      toExpr: '={{$json.requesterEmail || $json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Ops Request Decision',
      messageExpr: '={{"Request " + ($json.requestId || "N/A") + " has been " + ($json.decisionStatus || "updated") + ".\\nTime: " + ($json.decisionAt || "N/A") + "\\nNote: " + ($json.note || "N/A")}}',
      position: [1340, 760],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
  ];

  const connections = {
    'Ops Request Webhook': { main: [[{ node: 'Normalize Ops Request', type: 'main', index: 0 }]] },
    'Normalize Ops Request': { main: [[{ node: 'Validate Ops Request', type: 'main', index: 0 }]] },
    'Validate Ops Request': { main: [[{ node: 'Request Valid?', type: 'main', index: 0 }]] },
    'Request Valid?': {
      main: [
        [{ node: 'Inject Ops Config', type: 'main', index: 0 }],
        [
          { node: 'Slack Invalid Ops Request', type: 'main', index: 0 },
          { node: 'Gmail Invalid Ops Request', type: 'main', index: 0 },
        ],
      ],
    },
    'Inject Ops Config': { main: [[{ node: 'Deterministic Ops Routing', type: 'main', index: 0 }]] },
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
        [{ node: 'Slack Escalation Alert', type: 'main', index: 0 }],
        [{ node: 'Slack Standard Alert', type: 'main', index: 0 }],
      ],
    },
    'Slack Escalation Alert': { main: [[{ node: 'Dedupe Ops Request', type: 'main', index: 0 }]] },
    'Slack Standard Alert': { main: [[{ node: 'Dedupe Ops Request', type: 'main', index: 0 }]] },
    'Dedupe Ops Request': { main: [[{ node: 'Notion Record Request', type: 'main', index: 0 }]] },
    'Notion Record Request': {
      main: [
        [{ node: 'Gmail Request Status', type: 'main', index: 0 }],
        [{ node: 'Approver Email Available?', type: 'main', index: 0 }],
        [{ node: 'Escalation Owner Notice?', type: 'main', index: 0 }],
      ],
    },
    'Approver Email Available?': {
      main: [
        [{ node: 'Gmail Approver Assignment', type: 'main', index: 0 }],
        [],
      ],
    },
    'Escalation Owner Notice?': {
      main: [
        [{ node: 'Gmail Owner Escalation', type: 'main', index: 0 }],
        [],
      ],
    },
    'Approval Action Webhook': { main: [[{ node: 'Normalize Approval Action', type: 'main', index: 0 }]] },
    'Normalize Approval Action': { main: [[{ node: 'Approval Action Valid?', type: 'main', index: 0 }]] },
    'Approval Action Valid?': {
      main: [
        [
          { node: 'Slack Approval Decision', type: 'main', index: 0 },
          { node: 'Notion Approval Decision Log', type: 'main', index: 0 },
          { node: 'Gmail Approval Decision', type: 'main', index: 0 },
        ],
        [{ node: 'Slack Invalid Approval Action', type: 'main', index: 0 }],
      ],
    },
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
    webhookNode({
      id: 'ticket_webhook',
      name: 'Ticket Webhook',
      path: 'support-ticket-v3',
      responseMode: 'lastNode',
      position: [220, 320],
    }),
    setNode({
      id: 'normalize_ticket',
      name: 'Normalize Ticket',
      fields: [
        { name: 'subject', value: '={{$json.subject || "No subject"}}' },
        { name: 'message', value: '={{$json.message || $json.description || "No message"}}' },
        { name: 'receivedAt', value: '={{new Date().toISOString()}}' },
      ],
      position: [450, 320],
    }),
    codeNode({
      id: 'validate_ticket_request',
      name: 'Validate Ticket Request',
      position: [650, 320],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const errors = [];

  const email = String(payload.email || payload.customerEmail || '').trim().toLowerCase();
  const subject = String(payload.subject || 'No subject').trim();
  const message = String(payload.message || payload.description || 'No message').trim();
  const combined = (subject + ' ' + message).toLowerCase();

  const minLengthEnv = Number(process.env.N8N_SUPPORT_MIN_MESSAGE_LENGTH || 12);
  const minLength = Number.isFinite(minLengthEnv) ? Math.max(5, minLengthEnv) : 12;
  const allowedDomain = String(process.env.N8N_SUPPORT_ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase();
  const captchaRequired = String(process.env.N8N_SUPPORT_REQUIRE_CAPTCHA || 'false').toLowerCase() === 'true';
  const expectedCaptcha = String(process.env.N8N_SUPPORT_CAPTCHA_TOKEN || '').trim();
  const headerCaptcha = String(payload.captchaToken || payload['x-captcha-token'] || '').trim();

  if (!email) errors.push('email_missing');
  if (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push('email_invalid');
  if (allowedDomain && email && !email.endsWith('@' + allowedDomain)) errors.push('email_domain_not_allowed');
  if (message.length < minLength) errors.push('message_too_short');
  if (/test ticket|asdf|qwerty/.test(combined)) errors.push('likely_spam_pattern');
  if (captchaRequired && expectedCaptcha && headerCaptcha !== expectedCaptcha) errors.push('captcha_invalid');

  const fingerprint = [email, subject.toLowerCase(), message.toLowerCase()].join('|');
  const hash = Buffer.from(fingerprint).toString('base64').replace(/=/g, '').slice(0, 16);
  const ticketId = String(payload.ticketId || '').trim() || ('TKT-' + Date.now() + '-' + hash.toUpperCase());
  const idempotencyKey = [email, hash].join('|');

  output.push({
    json: {
      ...payload,
      email,
      subject: subject || 'No subject',
      message: message || 'No message',
      ticketId,
      idempotencyKey,
      isValidTicket: errors.length === 0 ? 1 : 0,
      validationErrors: errors,
    },
  });
}

return output;`,
    }),
    ifNumberNode({
      id: 'ticket_valid_check',
      name: 'Ticket Valid?',
      valueExpr: '={{$json.isValidTicket}}',
      threshold: 1,
      position: [860, 320],
    }),
    {
      ...slackPostNode({
      id: 'slack_invalid_ticket',
      name: 'Slack Invalid Ticket',
      textExpr: '={{"⚠️ Invalid ticket blocked: " + ($json.email || "unknown") + " | errors " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 180],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_invalid_ticket',
      name: 'Gmail Invalid Ticket',
      toExpr: '={{$env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Invalid Support Ticket Payload',
      messageExpr: '={{"Blocked ticket for " + ($json.email || "unknown") + "\\nErrors: " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 260],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'inject_support_config',
      name: 'Inject Support Config',
      position: [1080, 420],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};

  const urgentRaw = Number(process.env.N8N_SUPPORT_URGENT_THRESHOLD || payload.urgentThreshold || 70);
  const humanRaw = Number(process.env.N8N_SUPPORT_HUMAN_THRESHOLD || payload.humanThreshold || 45);
  const rulesWeightRaw = Number(process.env.N8N_SUPPORT_RULES_WEIGHT || payload.rulesWeight || 0.6);
  const aiWeightRaw = Number(process.env.N8N_SUPPORT_AI_WEIGHT || payload.aiWeight || 0.4);

  const urgentThreshold = Math.min(100, Math.max(1, Number.isFinite(urgentRaw) ? urgentRaw : 70));
  const humanThreshold = Math.min(urgentThreshold - 1, Math.min(99, Math.max(0, Number.isFinite(humanRaw) ? humanRaw : 45)));

  const weightTotal = (rulesWeightRaw > 0 ? rulesWeightRaw : 0) + (aiWeightRaw > 0 ? aiWeightRaw : 0);
  const rulesWeight = weightTotal > 0 ? (rulesWeightRaw > 0 ? rulesWeightRaw : 0) / weightTotal : 0.6;
  const aiWeight = weightTotal > 0 ? (aiWeightRaw > 0 ? aiWeightRaw : 0) / weightTotal : 0.4;

  const slaUrgentHours = Number.isFinite(Number(process.env.N8N_SUPPORT_SLA_URGENT_HOURS))
    ? Number(process.env.N8N_SUPPORT_SLA_URGENT_HOURS)
    : 1;
  const slaHumanHours = Number.isFinite(Number(process.env.N8N_SUPPORT_SLA_HUMAN_HOURS))
    ? Number(process.env.N8N_SUPPORT_SLA_HUMAN_HOURS)
    : 8;
  const slaAiHours = Number.isFinite(Number(process.env.N8N_SUPPORT_SLA_AI_HOURS))
    ? Number(process.env.N8N_SUPPORT_SLA_AI_HOURS)
    : 24;

  output.push({
    json: {
      ...payload,
      urgentThreshold,
      humanThreshold,
      rulesWeight: Number(rulesWeight.toFixed(3)),
      aiWeight: Number(aiWeight.toFixed(3)),
      slaUrgentHours: Math.max(1, slaUrgentHours),
      slaHumanHours: Math.max(1, slaHumanHours),
      slaAiHours: Math.max(1, slaAiHours),
      supportPortalBaseUrl: String(payload.supportPortalBaseUrl || process.env.SUPPORT_PORTAL_BASE_URL || 'https://support.example.com/tickets').trim(),
      ownerEmail: String(payload.ownerEmail || process.env.OWNER_EMAIL || 'owner@example.com').trim(),
    },
  });
}

return output;`,
    }),
    codeNode({
      id: 'deterministic_ticket_score',
      name: 'Deterministic Ticket Score',
      position: [1310, 420],
      jsCode: `const output = [];

const keywordScores = {
  'data breach': 98,
  'security breach': 96,
  'service outage': 94,
  outage: 92,
  down: 90,
  'payment failed': 82,
  'payment issue': 78,
  'billing issue': 68,
  billing: 64,
  security: 84,
  hacked: 95,
  'cannot login': 52,
  'feature request': 42,
};

for (const item of $input.all()) {
  const payload = item.json || {};
  const lowered = (String(payload.subject || '') + ' ' + String(payload.message || '')).toLowerCase();

  let deterministicScore = 30;
  let matchedKeyword = '';

  for (const [keyword, score] of Object.entries(keywordScores)) {
    if (!lowered.includes(keyword)) continue;
    if (score > deterministicScore) {
      deterministicScore = score;
      matchedKeyword = keyword;
    }
  }

  if (/angry|furious|unacceptable|asap|urgent/.test(lowered)) deterministicScore = Math.max(deterministicScore, 72);
  if (/vip|enterprise|production/.test(lowered)) deterministicScore = Math.max(deterministicScore, 78);

  deterministicScore = Math.min(100, Math.max(0, deterministicScore));
  const urgentThreshold = Number(payload.urgentThreshold || 70);
  const humanThreshold = Number(payload.humanThreshold || 45);

  const baselineQueue = deterministicScore >= urgentThreshold
    ? 'urgent-human'
    : (deterministicScore >= humanThreshold ? 'human' : 'ai-assisted');

  output.push({
    json: {
      ...payload,
      deterministicScore,
      baselineQueue,
      matchedKeyword: matchedKeyword || 'none',
    },
  });
}

return output;`,
    }),
    {
      ...agentNode({
      id: 'ai_ticket_triage_agent',
      name: 'AI Ticket Triage Agent',
      prompt:
        "={{'You are a support ticket triage agent. PRIORITY LEVELS: urgent-human (outages, breaches, payment failures, data loss), human (complex account/billing/technical issues), ai-assisted (FAQ/how-to/general inquiries). Consider impact, urgency, complexity, and sentiment. Respond ONLY with valid JSON using this schema: {\"aiScore\": number 0-100, \"priority\": \"urgent-human\" | \"human\" | \"ai-assisted\", \"summary\": string, \"confidence\": number 0-1}. Keep summary under 220 characters. Ticket payload: ' + JSON.stringify($json)}}",
      position: [1540, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', modelName: 'gpt-4o-mini', position: [1540, 560] }),
    codeNode({
      id: 'parse_ai_output',
      name: 'Parse AI Output',
      position: [1760, 220],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const candidates = [payload.output, payload.text, payload.response, payload.result, payload];

  let parsed = {};
  let aiParseOk = false;

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    if (typeof candidate === 'object') {
      parsed = candidate;
      aiParseOk = true;
      break;
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      try {
        parsed = JSON.parse(trimmed);
        aiParseOk = true;
        break;
      } catch (error) {
        const match = trimmed.match(/\\{[\\s\\S]*\\}/);
        if (!match) continue;
        try {
          parsed = JSON.parse(match[0]);
          aiParseOk = true;
          break;
        } catch (innerError) {
          // Continue trying candidates.
        }
      }
    }
  }

  const aiScoreRaw = Number(parsed.aiScore ?? parsed.score ?? parsed.riskScore ?? 0);
  const aiScore = Number.isFinite(aiScoreRaw) ? Math.min(100, Math.max(0, aiScoreRaw)) : 0;

  let aiPriority = String(parsed.priority || parsed.queue || '').toLowerCase().trim();
  if (!['urgent-human', 'human', 'ai-assisted'].includes(aiPriority)) {
    const urgentThreshold = Number(payload.urgentThreshold || 70);
    const humanThreshold = Number(payload.humanThreshold || 45);
    aiPriority = aiScore >= urgentThreshold ? 'urgent-human' : (aiScore >= humanThreshold ? 'human' : 'ai-assisted');
  }

  const aiSummary = String(parsed.summary || parsed.rationale || parsed.reason || '').trim();
  const aiConfidenceRaw = Number(parsed.confidence ?? 0);
  const aiConfidence = Number.isFinite(aiConfidenceRaw) ? Math.min(1, Math.max(0, aiConfidenceRaw)) : 0;

  output.push({
    json: {
      aiParseOk,
      aiScore,
      aiPriority,
      aiSummary: aiSummary || 'deterministic fallback used',
      aiConfidence,
      aiPayload: parsed,
    },
  });
}

return output;`,
    }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1760, 420] }),
    codeNode({
      id: 'final_ticket_decision',
      name: 'Final Ticket Decision',
      position: [1980, 420],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const deterministicScore = Number(payload.deterministicScore || 0);
  const aiScore = Number(payload.aiScore || 0);
  const rulesWeight = Number(payload.rulesWeight || 0.6);
  const aiWeight = Number(payload.aiWeight || 0.4);
  const urgentThreshold = Number(payload.urgentThreshold || 70);
  const humanThreshold = Number(payload.humanThreshold || 45);

  const aiUsable = payload.aiParseOk === true && aiScore > 0;
  const blendedScore = aiUsable
    ? Math.round((deterministicScore * rulesWeight) + (aiScore * aiWeight))
    : deterministicScore;
  const triageScore = Math.min(100, Math.max(0, blendedScore));

  let queue = 'ai-assisted';
  if (triageScore >= urgentThreshold) queue = 'urgent-human';
  else if (['urgent-human', 'human', 'ai-assisted'].includes(String(payload.aiPriority || ''))) queue = String(payload.aiPriority);
  else queue = String(payload.baselineQueue || 'ai-assisted');

  const slaHours = queue === 'urgent-human'
    ? Number(payload.slaUrgentHours || 1)
    : (queue === 'human' ? Number(payload.slaHumanHours || 8) : Number(payload.slaAiHours || 24));

  const responseEtaText = queue === 'urgent-human'
    ? 'within 1 hour'
    : (queue === 'human' ? 'within 8 business hours' : 'within 24 hours');

  const humanEscalationFlag = queue === 'ai-assisted' ? 0 : 1;
  const urgentFlag = queue === 'urgent-human' ? 1 : 0;

  output.push({
    json: {
      ...payload,
      triageScore,
      queue,
      summary: payload.aiSummary || 'deterministic fallback used',
      slaHours: Math.max(1, slaHours),
      responseEtaText,
      humanEscalationFlag,
      urgentFlag,
      status: queue === 'ai-assisted' ? 'auto_assist_pending' : 'human_agent_pending',
      scoringSource: aiUsable ? 'blended_ai_plus_rules' : 'deterministic_rules_only',
    },
  });
}

return output;`,
    }),
    ifNumberNode({ id: 'human_escalation_check', name: 'Human Escalation?', valueExpr: '={{$json.humanEscalationFlag}}', threshold: 1, position: [2200, 360] }),
    {
      ...slackPostNode({
      id: 'slack_urgent_ticket',
      name: 'Slack Urgent Ticket',
      textExpr: '={{( $json.queue === "urgent-human" ? "🚨" : "🛠️") + " Ticket triaged to " + ($json.queue || "human") + ": " + ($json.subject || "No subject") + " | score " + ($json.triageScore || 0) + " | ticket " + ($json.ticketId || "N/A")}}',
      position: [2420, 220],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...slackPostNode({
      id: 'slack_standard_ticket',
      name: 'Slack Standard Ticket',
      textExpr: '={{"🤖 AI-assisted ticket: " + ($json.subject || "No subject") + " | score " + ($json.triageScore || 0) + " | ticket " + ($json.ticketId || "N/A")}}',
      position: [2420, 380],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'dedupe_ticket_record',
      name: 'Dedupe Ticket Record',
      position: [2640, 320],
      jsCode: `const seen = new Set();
const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const key = String(payload.idempotencyKey || payload.ticketId || '').trim();
  if (key && seen.has(key)) continue;
  if (key) seen.add(key);

  output.push({
    json: {
      ...payload,
      duplicateSuppressed: false,
    },
  });
}

return output;`,
    }),
    {
      ...notionCreatePageNode({
      id: 'notion_log_ticket',
      name: 'Notion Log Ticket',
      titleExpr: '={{"Ticket: " + ($json.ticketId || "N/A") + " | " + ($json.queue || "ai-assisted")}}',
      position: [2860, 320],
      databaseIdValue: '={{$env.SUPPORT_NOTION_DB_URL || $env.NOTION_DATABASE_URL || "https://www.notion.so/00000000000000000000000000000000"}}',
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_ticket_update',
      name: 'Gmail Ticket Update',
      toExpr: '={{$json.email || $json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: '={{"Support Ticket " + ($json.ticketId || "N/A") + " Received"}}',
      messageExpr: '={{"Thanks for contacting support.\\n\\nTicket: " + ($json.ticketId || "N/A") + "\\nSubject: " + ($json.subject || "No subject") + "\\nPriority queue: " + ($json.queue || "ai-assisted") + "\\nExpected response: " + ($json.responseEtaText || "soon") + "\\n\\n" + (($json.queue || "") === "ai-assisted" ? "Our AI assistant will follow up with guidance shortly." : "A support specialist has been assigned and will follow up shortly.") + "\\n\\nTrack: " + (($json.supportPortalBaseUrl || "https://support.example.com/tickets") + "/" + ($json.ticketId || "N/A"))}}',
      position: [3080, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    ifNumberNode({ id: 'urgent_owner_notice_check', name: 'Urgent Owner Notice?', valueExpr: '={{$json.urgentFlag}}', threshold: 1, position: [3080, 420] }),
    {
      ...gmailSendNode({
      id: 'gmail_owner_urgent_ticket',
      name: 'Gmail Owner Urgent Ticket',
      toExpr: '={{$json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Urgent Support Ticket Alert',
      messageExpr: '={{"Urgent ticket routed to human queue.\\nTicket: " + ($json.ticketId || "N/A") + "\\nSubject: " + ($json.subject || "No subject") + "\\nScore: " + ($json.triageScore || 0) + "\\nSummary: " + ($json.summary || "N/A")}}',
      position: [3300, 420],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
  ];

  const connections = {
    'Ticket Webhook': { main: [[{ node: 'Normalize Ticket', type: 'main', index: 0 }]] },
    'Normalize Ticket': { main: [[{ node: 'Validate Ticket Request', type: 'main', index: 0 }]] },
    'Validate Ticket Request': { main: [[{ node: 'Ticket Valid?', type: 'main', index: 0 }]] },
    'Ticket Valid?': {
      main: [
        [{ node: 'Inject Support Config', type: 'main', index: 0 }],
        [
          { node: 'Slack Invalid Ticket', type: 'main', index: 0 },
          { node: 'Gmail Invalid Ticket', type: 'main', index: 0 },
        ],
      ],
    },
    'Inject Support Config': { main: [[{ node: 'Deterministic Ticket Score', type: 'main', index: 0 }]] },
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
        [{ node: 'Slack Urgent Ticket', type: 'main', index: 0 }],
        [{ node: 'Slack Standard Ticket', type: 'main', index: 0 }],
      ],
    },
    'Slack Urgent Ticket': { main: [[{ node: 'Dedupe Ticket Record', type: 'main', index: 0 }]] },
    'Slack Standard Ticket': { main: [[{ node: 'Dedupe Ticket Record', type: 'main', index: 0 }]] },
    'Dedupe Ticket Record': { main: [[{ node: 'Notion Log Ticket', type: 'main', index: 0 }]] },
    'Notion Log Ticket': {
      main: [
        [{ node: 'Gmail Ticket Update', type: 'main', index: 0 }],
        [{ node: 'Urgent Owner Notice?', type: 'main', index: 0 }],
      ],
    },
    'Urgent Owner Notice?': {
      main: [
        [{ node: 'Gmail Owner Urgent Ticket', type: 'main', index: 0 }],
        [],
      ],
    },
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
    {
      ...hubspotDealSearchNode({ id: 'hubspot_search_deals', name: 'HubSpot Search Deals', position: [470, 320] }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'build_kpi_snapshot',
      name: 'Build KPI Snapshot',
      position: [730, 320],
      jsCode: `const items = $input.all();
const now = new Date();
const nowMs = now.getTime();
const oneDayMs = 24 * 60 * 60 * 1000;

const parseDate = (value) => {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value > 1e9 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return parseDate(numeric);
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  return null;
};

const getField = (payload, ...paths) => {
  for (const path of paths) {
    const parts = path.split('.');
    let cursor = payload;
    let found = true;
    for (const part of parts) {
      if (!cursor || typeof cursor !== 'object' || !(part in cursor)) {
        found = false;
        break;
      }
      cursor = cursor[part];
    }
    if (found && cursor !== undefined && cursor !== null && cursor !== '') return cursor;
  }
  return null;
};

const parseNumberArray = (candidate) => {
  if (Array.isArray(candidate)) {
    return candidate
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
  }

  if (typeof candidate === 'string' && candidate.trim()) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));
      }
    } catch (error) {
      // Ignore malformed history value.
    }
  }

  return [];
};

let revenue = 0;
let previousRevenue = 0;
let weekRevenue = 0;
let monthRevenue = 0;
let pipelineValue = 0;
let wonDeals = 0;
let openDeals = 0;
let staleDeals = 0;
let dealCount = 0;

const firstPayload = items[0] && items[0].json ? items[0].json : {};
const historicalCandidates = [
  getField(firstPayload, 'historicalRevenue'),
  getField(firstPayload, 'reportingRevenueHistory'),
  process.env.N8N_REPORTING_REVENUE_HISTORY_JSON,
];

let historicalRevenue = [];
for (const candidate of historicalCandidates) {
  const parsed = parseNumberArray(candidate);
  if (parsed.length > 0) {
    historicalRevenue = parsed;
    break;
  }
}

for (const item of items) {
  const payload = item.json || {};
  const amountRaw = Number(getField(payload, 'amount', 'dealValue', 'properties.amount', 'properties.dealvalue', 'value', 'properties.value', '0'));
  const amount = Number.isFinite(amountRaw) ? Math.max(0, amountRaw) : 0;

  const stage = String(getField(payload, 'dealstage', 'dealStage', 'stage', 'properties.dealstage', 'properties.stage', 'unknown') || 'unknown').toLowerCase();
  const isWon = /closed.?won|won/.test(stage);

  const closeDate = parseDate(getField(payload, 'closeDate', 'properties.closedate', 'closedate'));
  const lastModified = parseDate(getField(payload, 'hs_lastmodifieddate', 'lastModifiedDate', 'properties.hs_lastmodifieddate', 'properties.lastmodifieddate'));

  let dayAge = null;
  if (closeDate) dayAge = Math.floor((nowMs - closeDate.getTime()) / oneDayMs);
  const modifiedAge = lastModified ? Math.floor((nowMs - lastModified.getTime()) / oneDayMs) : null;

  if (isWon) {
    wonDeals += 1;
    if (dayAge !== null && dayAge >= 0 && dayAge < 1) revenue += amount;
    else if (dayAge !== null && dayAge >= 1 && dayAge < 2) previousRevenue += amount;

    if (dayAge !== null && dayAge >= 0 && dayAge < 7) weekRevenue += amount;
    if (dayAge !== null && dayAge >= 0 && dayAge < 30) monthRevenue += amount;
  } else {
    openDeals += 1;
    pipelineValue += amount;
    if (modifiedAge !== null && modifiedAge > 14) staleDeals += 1;
  }

  dealCount += 1;
}

if (previousRevenue === 0 && historicalRevenue.length > 0) {
  previousRevenue = historicalRevenue[historicalRevenue.length - 1] || 0;
}

if (historicalRevenue.length === 0) {
  historicalRevenue = [previousRevenue || 0, revenue || 0].filter((value) => Number.isFinite(value));
}

const changePct = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

const mean = historicalRevenue.length > 0
  ? historicalRevenue.reduce((sum, value) => sum + value, 0) / historicalRevenue.length
  : revenue;
const variance = historicalRevenue.length > 1
  ? historicalRevenue.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / historicalRevenue.length
  : 0;
const stdDev = Math.sqrt(Math.max(0, variance));
const zScore = stdDev > 0 ? (revenue - mean) / stdDev : 0;

const fallbackAnomaly = Math.min(100, Math.round(Math.abs(changePct) * 2.5));
const anomalyScore = stdDev > 0
  ? Math.min(100, Math.round(Math.abs(zScore) * 33))
  : fallbackAnomaly;

const targetRevenueRaw = Number(getField(firstPayload, 'targetRevenue', 'revenueTarget', 'kpiTarget', process.env.N8N_REPORTING_TARGET_REVENUE || 0));
const targetRevenue = Number.isFinite(targetRevenueRaw) ? Math.max(0, targetRevenueRaw) : 0;
const targetDeltaPct = targetRevenue > 0 ? ((revenue - targetRevenue) / targetRevenue) * 100 : 0;

const severityByStats = anomalyScore >= 80 ? 'critical' : anomalyScore >= 60 ? 'watch' : 'normal';

return [{
  json: {
    revenue: Number(revenue.toFixed(2)),
    previousRevenue: Number(previousRevenue.toFixed(2)),
    changePct: Number(changePct.toFixed(2)),
    weekRevenue: Number(weekRevenue.toFixed(2)),
    monthRevenue: Number(monthRevenue.toFixed(2)),
    pipelineValue: Number(pipelineValue.toFixed(2)),
    dealCount,
    openDeals,
    wonDeals,
    staleDeals,
    historicalRevenue: historicalRevenue.slice(-30),
    zScore: Number(zScore.toFixed(3)),
    anomalyScore,
    severityByStats,
    targetRevenue: Number(targetRevenue.toFixed(2)),
    targetDeltaPct: Number(targetDeltaPct.toFixed(2)),
    generatedAt: now.toISOString(),
    dataQuality: dealCount > 0 ? 'live_hubspot_data' : 'no_deal_rows_returned',
  },
}];`,
    }),
    {
      ...agentNode({
      id: 'ai_reporting_agent',
      name: 'AI Reporting Agent',
      prompt:
        "={{'You are an executive KPI reporting analyst. Create a concise narrative from these metrics: current revenue, previous revenue, percent change, weekly/monthly totals, target delta, anomaly score and z-score, and data quality. Return ONLY valid JSON with schema {\"aiScore\": number 0-100, \"priority\": \"normal\" | \"watch\" | \"critical\", \"summary\": string, \"confidence\": number 0-1}. Keep summary to 2-3 sentences and <= 260 chars. KPI payload: ' + JSON.stringify($json)}}",
      position: [990, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', modelName: 'gpt-4o-mini', position: [990, 560] }),
    codeNode({
      id: 'parse_ai_output',
      name: 'Parse AI Output',
      position: [1210, 220],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const candidates = [payload.output, payload.text, payload.response, payload.result, payload];

  let parsed = {};
  let aiParseOk = false;

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    if (typeof candidate === 'object') {
      parsed = candidate;
      aiParseOk = true;
      break;
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      try {
        parsed = JSON.parse(trimmed);
        aiParseOk = true;
        break;
      } catch (error) {
        const match = trimmed.match(/\\{[\\s\\S]*\\}/);
        if (!match) continue;
        try {
          parsed = JSON.parse(match[0]);
          aiParseOk = true;
          break;
        } catch (innerError) {
          // Continue trying remaining candidates.
        }
      }
    }
  }

  const aiScoreRaw = Number(parsed.aiScore ?? parsed.score ?? parsed.confidenceScore ?? 0);
  const aiScore = Number.isFinite(aiScoreRaw) ? Math.min(100, Math.max(0, aiScoreRaw)) : 0;

  let aiPriority = String(parsed.priority || parsed.severity || '').toLowerCase().trim();
  if (!['critical', 'watch', 'normal'].includes(aiPriority)) aiPriority = 'normal';

  const aiSummary = String(parsed.summary || parsed.rationale || parsed.reason || '').trim();
  const aiConfidenceRaw = Number(parsed.confidence ?? 0);
  const aiConfidence = Number.isFinite(aiConfidenceRaw) ? Math.min(1, Math.max(0, aiConfidenceRaw)) : 0;

  output.push({
    json: {
      aiParseOk,
      aiScore,
      aiPriority,
      aiSummary: aiSummary || 'deterministic fallback summary',
      aiConfidence,
      aiPayload: parsed,
    },
  });
}

return output;`,
    }),
    mergeNode({ id: 'merge_ai_with_snapshot', name: 'Merge AI with Snapshot', position: [1210, 360] }),
    codeNode({
      id: 'final_reporting_packet',
      name: 'Final Reporting Packet',
      position: [1430, 360],
      jsCode: `const output = [];

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

for (const item of $input.all()) {
  const payload = item.json || {};
  const anomalyScore = Number(payload.anomalyScore || 0);
  const aiPriority = String(payload.aiPriority || '').toLowerCase();
  const changePct = Number(payload.changePct || 0);
  const revenue = Number(payload.revenue || 0);
  const previousRevenue = Number(payload.previousRevenue || 0);

  const severity = aiPriority === 'critical' || anomalyScore >= 80
    ? 'critical'
    : (aiPriority === 'watch' || anomalyScore >= 60 ? 'watch' : 'normal');

  const trendLabel = changePct > 0 ? 'UP' : (changePct < 0 ? 'DOWN' : 'FLAT');
  const executiveSummary = String(payload.aiSummary || 'deterministic fallback summary').trim();
  const dashboardUrl = String(payload.dashboardUrl || process.env.REPORTING_DASHBOARD_URL || 'https://dashboard.example.com/kpis').trim();
  const generatedAt = String(payload.generatedAt || new Date().toISOString());
  const dateLabel = generatedAt.slice(0, 10);
  const criticalFlag = severity === 'critical' ? 1 : 0;

  const emailBody = [
    'Daily KPI Executive Summary - ' + dateLabel,
    '',
    'REVENUE',
    'Today: ' + formatCurrency(revenue) + ' (' + (changePct >= 0 ? '+' : '') + changePct.toFixed(2) + '%, ' + trendLabel + ')',
    'Previous day: ' + formatCurrency(previousRevenue),
    'Week total: ' + formatCurrency(payload.weekRevenue || 0),
    'Month total: ' + formatCurrency(payload.monthRevenue || 0),
    'Pipeline value: ' + formatCurrency(payload.pipelineValue || 0),
    '',
    'Severity: ' + severity.toUpperCase(),
    'Anomaly score: ' + anomalyScore + '/100 (z=' + Number(payload.zScore || 0).toFixed(3) + ')',
    'Target delta: ' + (Number(payload.targetDeltaPct || 0) >= 0 ? '+' : '') + Number(payload.targetDeltaPct || 0).toFixed(2) + '%',
    'Summary: ' + executiveSummary,
    '',
    'Data quality: ' + String(payload.dataQuality || 'unknown'),
    'Dashboard: ' + dashboardUrl,
  ].join('\\n');

  output.push({
    json: {
      ...payload,
      severity,
      criticalFlag,
      executiveSummary,
      notionTitle: 'Daily KPI Brief | ' + severity + ' | ' + dateLabel,
      emailSubject: 'Daily KPI Executive Summary [' + severity.toUpperCase() + ']',
      emailBody,
    },
  });
}

return output;`,
    }),
    {
      ...notionCreatePageNode({
      id: 'notion_exec_brief',
      name: 'Notion Exec Brief',
      titleExpr: '={{$json.notionTitle || ("Daily KPI Brief | " + ($json.severity || "normal"))}}',
      position: [1650, 320],
      databaseIdValue: '={{$env.REPORTING_NOTION_DB_URL || $env.NOTION_DATABASE_URL || "https://www.notion.so/00000000000000000000000000000000"}}',
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_exec_summary',
      name: 'Gmail Exec Summary',
      toExpr: '={{$json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: '={{$json.emailSubject || "Daily KPI Executive Summary"}}',
      messageExpr: '={{$json.emailBody || "No KPI summary available."}}',
      position: [1870, 320],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    ifNumberNode({ id: 'anomaly_check', name: 'Anomaly Score High?', valueExpr: '={{$json.criticalFlag}}', threshold: 1, position: [2090, 320] }),
    {
      ...slackPostNode({
      id: 'slack_anomaly_alert',
      name: 'Slack Anomaly Alert',
      textExpr: '={{"KPI anomaly detected | severity " + ($json.severity || "critical") + " | score " + ($json.anomalyScore || 0) + " | revenue " + ($json.revenue || 0) + " | change " + ($json.changePct || 0) + "%"}}',
      position: [2310, 320],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
  ];

  const connections = {
    'Daily Trigger': { main: [[{ node: 'HubSpot Search Deals', type: 'main', index: 0 }]] },
    'HubSpot Search Deals': { main: [[{ node: 'Build KPI Snapshot', type: 'main', index: 0 }]] },
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
    'Final Reporting Packet': { main: [[{ node: 'Notion Exec Brief', type: 'main', index: 0 }]] },
    'Notion Exec Brief': { main: [[{ node: 'Gmail Exec Summary', type: 'main', index: 0 }]] },
    'Gmail Exec Summary': { main: [[{ node: 'Anomaly Score High?', type: 'main', index: 0 }]] },
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
      id: 'validate_required_fields',
      name: 'Validate Required Fields',
      position: [650, 320],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const errors = [];

  const firstName = String(payload.firstName || payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const message = String(payload.message || '').trim();

  if (!firstName) errors.push('firstName_missing');
  if (!email) errors.push('email_missing');
  if (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push('email_invalid');
  if (!message) errors.push('message_missing');

  output.push({
    json: {
      ...payload,
      firstName,
      email,
      message,
      isValidIntake: errors.length === 0 ? 1 : 0,
      validationErrors: errors,
    },
  });
}
return output;`,
    }),
    ifNumberNode({
      id: 'intake_valid_check',
      name: 'Intake Valid?',
      valueExpr: '={{$json.isValidIntake}}',
      threshold: 1,
      position: [860, 320],
    }),
    {
      ...slackPostNode({
      id: 'slack_invalid_intake',
      name: 'Slack Invalid Intake',
      textExpr: '={{"⚠️ Invalid onboarding intake blocked: " + ($json.email || "unknown") + " | errors " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 180],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_invalid_intake',
      name: 'Gmail Invalid Intake',
      toExpr: '={{$env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Invalid Onboarding Intake',
      messageExpr: '={{"Blocked intake for " + ($json.email || "unknown") + "\\nErrors: " + (($json.validationErrors || []).join(","))}}',
      position: [1080, 260],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'inject_scoring_config',
      name: 'Inject Scoring Config',
      position: [1080, 420],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};

  const envThreshold = Number(process.env.N8N_ONBOARDING_READINESS_THRESHOLD || 80);
  const envRulesWeight = Number(process.env.N8N_ONBOARDING_RULES_WEIGHT || 0.65);
  const envAiWeight = Number(process.env.N8N_ONBOARDING_AI_WEIGHT || 0.35);

  const readinessThreshold = Number.isFinite(Number(payload.readinessThreshold))
    ? Number(payload.readinessThreshold)
    : (Number.isFinite(envThreshold) ? envThreshold : 80);
  const rulesWeightRaw = Number.isFinite(Number(payload.rulesWeight))
    ? Number(payload.rulesWeight)
    : (Number.isFinite(envRulesWeight) ? envRulesWeight : 0.65);
  const aiWeightRaw = Number.isFinite(Number(payload.aiWeight))
    ? Number(payload.aiWeight)
    : (Number.isFinite(envAiWeight) ? envAiWeight : 0.35);

  const totalWeight = (rulesWeightRaw > 0 ? rulesWeightRaw : 0) + (aiWeightRaw > 0 ? aiWeightRaw : 0);
  const rulesWeight = totalWeight > 0 ? (rulesWeightRaw > 0 ? rulesWeightRaw : 0) / totalWeight : 0.65;
  const aiWeight = totalWeight > 0 ? (aiWeightRaw > 0 ? aiWeightRaw : 0) / totalWeight : 0.35;

  output.push({
    json: {
      ...payload,
      readinessThreshold,
      rulesWeight: Number(rulesWeight.toFixed(3)),
      aiWeight: Number(aiWeight.toFixed(3)),
      docsWeighting: {
        oneDoc: 5,
        threeDocs: 10,
        fiveDocs: 5,
      },
    },
  });
}
return output;`,
    }),
    codeNode({
      id: 'deterministic_readiness',
      name: 'Deterministic Readiness',
      position: [1310, 420],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const budget = Number(payload.budget || 0);
  const docsProvided = Number(payload.docsProvided || 0);
  const timeline = String(payload.timeline || payload.howSoon || '').toLowerCase().trim();

  let budgetScore = 0;
  if (budget >= 2000) budgetScore += 10;
  if (budget >= 5000) budgetScore += 15;
  if (budget >= 10000) budgetScore += 10;

  let docsScore = 0;
  if (docsProvided >= 1) docsScore += 5;
  if (docsProvided >= 3) docsScore += 10;
  if (docsProvided >= 5) docsScore += 5;

  let timelineScore = 0;
  if (/asap|urgent|immediately|today|this week/.test(timeline)) timelineScore = 20;
  else if (/next\\s*2\\s*weeks|within\\s*2\\s*weeks|14\\s*days/.test(timeline)) timelineScore = 14;
  else if (/this month|30\\s*days|next month/.test(timeline)) timelineScore = 8;
  else if (/exploring|no rush|later|sometime/.test(timeline)) timelineScore = 2;

  const baseScore = 35;
  const deterministicScore = Math.min(100, baseScore + budgetScore + docsScore + timelineScore);
  const readinessThreshold = Number(payload.readinessThreshold || 80);

  const fingerprint = [
    String(payload.email || '').toLowerCase(),
    String(payload.company || '').toLowerCase(),
    String(payload.firstName || payload.name || '').toLowerCase(),
    String(payload.message || '').trim().toLowerCase(),
  ].join('|');
  const idempotencyKey = Buffer.from(fingerprint).toString('base64').replace(/=/g, '').slice(0, 64);

  output.push({
    json: {
      ...payload,
      budgetScore,
      docsScore,
      timelineScore,
      deterministicScore,
      idempotencyKey,
      readinessByRules: deterministicScore >= readinessThreshold ? 'kickoff_ready' : 'awaiting_documents',
    },
  });
}
return output;`,
    }),
    {
      ...agentNode({
      id: 'ai_onboarding_agent',
      name: 'AI Onboarding Agent',
      prompt:
        "={{'You are a client onboarding triage expert for B2B automation projects. Return ONLY valid JSON with this exact schema: {\"aiScore\": number 0-100, \"priority\": \"kickoff_ready\" | \"awaiting_documents\", \"summary\": string, \"missingFields\": string[], \"confidence\": number 0-1}. Rules: 1) Never return markdown. 2) If uncertain, lower confidence and explain in summary. 3) Keep summary under 220 characters. Example valid output: {\"aiScore\":72,\"priority\":\"awaiting_documents\",\"summary\":\"Strong fit but kickoff should wait for required docs.\",\"missingFields\":[\"scope_doc\"],\"confidence\":0.82}. Intake payload: ' + JSON.stringify($json)}}",
      position: [1540, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', position: [1540, 560] }),
    codeNode({
      id: 'parse_ai_output',
      name: 'Parse AI Output',
      position: [1760, 220],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const candidates = [payload.output, payload.text, payload.response, payload.result, payload];

  let parsed = {};
  let aiParseOk = false;

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    if (typeof candidate === 'object') {
      parsed = candidate;
      aiParseOk = true;
      break;
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      try {
        parsed = JSON.parse(trimmed);
        aiParseOk = true;
        break;
      } catch (error) {
        const match = trimmed.match(/\\{[\\s\\S]*\\}/);
        if (!match) continue;
        try {
          parsed = JSON.parse(match[0]);
          aiParseOk = true;
          break;
        } catch (innerError) {
          // Continue trying remaining candidates.
        }
      }
    }
  }

  const aiScoreRaw = Number(parsed.aiScore ?? parsed.score ?? parsed.readinessScore ?? 0);
  const aiScore = Number.isFinite(aiScoreRaw) ? Math.min(100, Math.max(0, aiScoreRaw)) : 0;
  const aiPriority = String(parsed.priority || '').toLowerCase();
  const aiSummary = String(parsed.summary || parsed.rationale || parsed.reason || '').trim();
  const aiConfidenceRaw = Number(parsed.confidence ?? 0);
  const aiConfidence = Number.isFinite(aiConfidenceRaw) ? Math.min(1, Math.max(0, aiConfidenceRaw)) : 0;

  output.push({
    json: {
      aiParseOk,
      aiScore,
      aiPriority,
      aiSummary: aiSummary || 'deterministic fallback used',
      aiConfidence,
      aiPayload: parsed,
    },
  });
}
return output;`,
    }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1760, 420] }),
    codeNode({
      id: 'final_onboarding_decision',
      name: 'Final Onboarding Decision',
      position: [1980, 420],
      jsCode: `const output = [];
for (const item of $input.all()) {
  const payload = item.json || {};
  const deterministicScore = Number(payload.deterministicScore || 0);
  const aiScore = Number(payload.aiScore || 0);
  const rulesWeight = Number(payload.rulesWeight || 0.65);
  const aiWeight = Number(payload.aiWeight || 0.35);
  const readinessThreshold = Number(payload.readinessThreshold || 80);

  const aiUsable = payload.aiParseOk === true && aiScore > 0;
  const blendedScore = aiUsable
    ? Math.round((deterministicScore * rulesWeight) + (aiScore * aiWeight))
    : deterministicScore;

  const readinessScore = Math.min(100, Math.max(0, blendedScore));
  const onboardingStatus = readinessScore >= readinessThreshold ? 'kickoff_ready' : 'awaiting_documents';

  output.push({
    json: {
      ...payload,
      readinessScore,
      onboardingStatus,
      kickoffReadyFlag: onboardingStatus === 'kickoff_ready' ? 1 : 0,
      scoringSource: aiUsable ? 'blended_ai_plus_rules' : 'deterministic_rules_only',
      onboardingSummary: payload.aiSummary || 'deterministic fallback used',
    },
  });
}
return output;`,
    }),
    ifNumberNode({
      id: 'kickoff_ready_check',
      name: 'Kickoff Ready?',
      valueExpr: '={{$json.kickoffReadyFlag}}',
      threshold: 1,
      position: [2200, 360],
    }),
    codeNode({
      id: 'dedupe_in_batch',
      name: 'Dedupe In Batch',
      position: [2200, 520],
      jsCode: `const seen = new Set();
const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const key = String(payload.idempotencyKey || payload.email || '').trim();
  if (key && seen.has(key)) continue;
  if (key) seen.add(key);

  output.push({
    json: {
      ...payload,
      duplicateSuppressed: false,
    },
  });
}

return output;`,
    }),
    {
      ...notionCreatePageNode({
      id: 'notion_onboarding_record',
      name: 'Notion Onboarding Record',
      titleExpr: '={{"Onboarding: " + ($json.firstName || $json.name || "Client") + " | " + ($json.onboardingStatus || "pending")}}',
      position: [2420, 520],
      databaseIdValue: '={{$env.ONBOARDING_NOTION_DB_URL || $env.NOTION_DATABASE_URL || "https://www.notion.so/00000000000000000000000000000000"}}',
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...slackPostNode({
      id: 'slack_kickoff_ready',
      name: 'Slack Kickoff Ready',
      textExpr: '={{"✅ Client kickoff ready: " + ($json.email || "unknown") + " | score " + ($json.readinessScore || 0)}}',
      position: [2420, 260],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...slackPostNode({
      id: 'slack_docs_needed',
      name: 'Slack Docs Needed',
      textExpr: '={{"📎 Docs needed before kickoff: " + ($json.email || "unknown") + " | score " + ($json.readinessScore || 0)}}',
      position: [2420, 380],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    {
      ...gmailSendNode({
      id: 'gmail_client_update',
      name: 'Gmail Client Update',
      toExpr: '={{$json.email || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: 'Your Onboarding Status',
      messageExpr: '={{"Status: " + ($json.onboardingStatus || "pending") + "\\nSummary: " + ($json.onboardingSummary || "N/A")}}',
      position: [2640, 520],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
  ];

  const connections = {
    'Client Intake Webhook': { main: [[{ node: 'Normalize Intake', type: 'main', index: 0 }]] },
    'Normalize Intake': { main: [[{ node: 'Validate Required Fields', type: 'main', index: 0 }]] },
    'Validate Required Fields': { main: [[{ node: 'Intake Valid?', type: 'main', index: 0 }]] },
    'Intake Valid?': {
      main: [
        [{ node: 'Inject Scoring Config', type: 'main', index: 0 }],
        [
          { node: 'Slack Invalid Intake', type: 'main', index: 0 },
          { node: 'Gmail Invalid Intake', type: 'main', index: 0 },
        ],
      ],
    },
    'Inject Scoring Config': { main: [[{ node: 'Deterministic Readiness', type: 'main', index: 0 }]] },
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
    'Final Onboarding Decision': {
      main: [
        [{ node: 'Kickoff Ready?', type: 'main', index: 0 }],
        [{ node: 'Dedupe In Batch', type: 'main', index: 0 }],
      ],
    },
    'Kickoff Ready?': {
      main: [
        [{ node: 'Slack Kickoff Ready', type: 'main', index: 0 }],
        [{ node: 'Slack Docs Needed', type: 'main', index: 0 }],
      ],
    },
    'Dedupe In Batch': { main: [[{ node: 'Notion Onboarding Record', type: 'main', index: 0 }]] },
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
    {
      ...hubspotDealSearchNode({ id: 'hubspot_search_deals', name: 'HubSpot Search Deals', position: [470, 320] }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'normalize_deal_fields',
      name: 'Normalize Deal Fields',
      position: [700, 320],
      jsCode: `const output = [];

const parseDate = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();

  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value > 1e9 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return parseDate(numeric);
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
};

for (const item of $input.all()) {
  const payload = item.json || {};
  const properties = payload.properties && typeof payload.properties === 'object' ? payload.properties : {};

  const getFirst = (...values) => {
    for (const value of values) {
      if (value === undefined || value === null || value === '') continue;
      return value;
    }
    return null;
  };

  const dealId = String(
    getFirst(
      payload.dealId,
      payload.id,
      payload.hs_object_id,
      properties.hs_object_id,
      properties.dealId,
      properties.deal_id,
    ) || ''
  ).trim();

  const dealName = String(
    getFirst(
      payload.dealName,
      payload.name,
      payload.dealname,
      properties.dealname,
      properties.name,
    ) || ''
  ).trim();

  const stage = String(
    getFirst(
      payload.dealStage,
      payload.stage,
      payload.pipelineStage,
      properties.dealstage,
      properties.pipeline_stage,
      properties.stage,
    ) || 'unknown'
  ).trim();

  const amountRaw = Number(
    getFirst(
      payload.amount,
      payload.dealValue,
      payload.value,
      properties.amount,
      properties.dealvalue,
      properties.value,
      0,
    )
  );
  const amount = Number.isFinite(amountRaw) ? amountRaw : 0;

  const daysInStageRaw = Number(
    getFirst(
      payload.daysInStage,
      payload.stageAgeDays,
      properties.daysInStage,
      properties.stageAgeDays,
      properties.stage_age_days,
      0,
    )
  );
  const daysInStage = Number.isFinite(daysInStageRaw) ? Math.max(0, daysInStageRaw) : 0;

  const closeDate = parseDate(
    getFirst(
      payload.closeDate,
      payload.expectedCloseDate,
      properties.closedate,
      properties.closeDate,
    )
  );

  const lastActivityDate = parseDate(
    getFirst(
      payload.lastActivityDate,
      payload.lastActivityAt,
      properties.hs_lastactivitydate,
      properties.lastactivitydate,
      properties.lastActivityDate,
    )
  );

  const lastModifiedDate = parseDate(
    getFirst(
      payload.hs_lastmodifieddate,
      payload.lastModifiedDate,
      payload.updatedAt,
      properties.hs_lastmodifieddate,
      properties.lastmodifieddate,
      properties.updatedAt,
    )
  );

  const ownerId = String(
    getFirst(
      payload.ownerId,
      payload.hubspotOwnerId,
      properties.hubspot_owner_id,
      properties.ownerId,
    ) || ''
  ).trim();

  const contactEmail = String(
    getFirst(
      payload.email,
      payload.contactEmail,
      properties.email,
      properties.contact_email,
      '',
    )
  ).trim().toLowerCase();

  output.push({
    json: {
      ...payload,
      dealId,
      dealName: dealName || (dealId ? 'Deal ' + dealId : 'Unnamed deal'),
      stage,
      amount,
      daysInStage,
      closeDate,
      lastActivityDate,
      lastModifiedDate,
      ownerId,
      contactEmail,
      normalizedAt: new Date().toISOString(),
    },
  });
}

return output;`,
    }),
    codeNode({
      id: 'filter_recent_deal_changes',
      name: 'Filter Recent Deal Changes',
      position: [930, 320],
      jsCode: `const output = [];
const nowMs = Date.now();

const parseDateMs = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? value : value > 1e9 ? value * 1000 : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return parseDateMs(numeric);
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

for (const item of $input.all()) {
  const payload = item.json || {};

  const envLookback = Number(process.env.N8N_REVOPS_LOOKBACK_HOURS || 6);
  const payloadLookback = Number(payload.lookbackHours);
  const lookbackHours = Number.isFinite(payloadLookback)
    ? payloadLookback
    : (Number.isFinite(envLookback) ? envLookback : 6);

  const allowUnknownModified = String(process.env.N8N_REVOPS_PROCESS_UNKNOWN_MODIFIED || 'false').toLowerCase() === 'true';
  const lastModifiedMs = parseDateMs(payload.lastModifiedDate);
  const withinWindow = Number.isFinite(lastModifiedMs)
    ? Math.abs(nowMs - lastModifiedMs) <= lookbackHours * 60 * 60 * 1000
    : allowUnknownModified;

  if (!withinWindow) continue;

  output.push({
    json: {
      ...payload,
      lookbackHours,
      withinLookbackWindow: true,
    },
  });
}

return output;`,
    }),
    codeNode({
      id: 'inject_revops_config',
      name: 'Inject RevOps Config',
      position: [1160, 320],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};

  const envAtRisk = Number(process.env.N8N_REVOPS_AT_RISK_THRESHOLD || 80);
  const envWarning = Number(process.env.N8N_REVOPS_WARNING_THRESHOLD || 60);
  const envRulesWeight = Number(process.env.N8N_REVOPS_RULES_WEIGHT || 0.65);
  const envAiWeight = Number(process.env.N8N_REVOPS_AI_WEIGHT || 0.35);

  const atRiskRaw = Number.isFinite(Number(payload.atRiskThreshold))
    ? Number(payload.atRiskThreshold)
    : (Number.isFinite(envAtRisk) ? envAtRisk : 80);
  const atRiskThreshold = Math.min(100, Math.max(1, atRiskRaw));

  const warningRaw = Number.isFinite(Number(payload.warningThreshold))
    ? Number(payload.warningThreshold)
    : (Number.isFinite(envWarning) ? envWarning : 60);
  const warningThreshold = Math.min(atRiskThreshold - 1, Math.min(99, Math.max(0, warningRaw)));

  const rulesWeightRaw = Number.isFinite(Number(payload.rulesWeight))
    ? Number(payload.rulesWeight)
    : (Number.isFinite(envRulesWeight) ? envRulesWeight : 0.65);
  const aiWeightRaw = Number.isFinite(Number(payload.aiWeight))
    ? Number(payload.aiWeight)
    : (Number.isFinite(envAiWeight) ? envAiWeight : 0.35);

  const totalWeight = (rulesWeightRaw > 0 ? rulesWeightRaw : 0) + (aiWeightRaw > 0 ? aiWeightRaw : 0);
  const rulesWeight = totalWeight > 0 ? (rulesWeightRaw > 0 ? rulesWeightRaw : 0) / totalWeight : 0.65;
  const aiWeight = totalWeight > 0 ? (aiWeightRaw > 0 ? aiWeightRaw : 0) / totalWeight : 0.35;

  output.push({
    json: {
      ...payload,
      atRiskThreshold,
      warningThreshold,
      rulesWeight: Number(rulesWeight.toFixed(3)),
      aiWeight: Number(aiWeight.toFixed(3)),
      ownerEmail: String(payload.ownerEmail || process.env.OWNER_EMAIL || 'owner@example.com').trim(),
    },
  });
}

return output;`,
    }),
    codeNode({
      id: 'deterministic_deal_risk',
      name: 'Deterministic Deal Risk',
      position: [1390, 420],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const nowMs = Date.now();

  const daysInStage = Number(payload.daysInStage || payload.stageAgeDays || 0);
  const amount = Number(payload.amount || payload.dealValue || 0);

  let stageAgingScore = 0;
  if (daysInStage > 14) stageAgingScore += 18;
  if (daysInStage > 30) stageAgingScore += 20;
  if (daysInStage > 45) stageAgingScore += 10;

  let amountRiskScore = 0;
  if (amount >= 10000) amountRiskScore += 10;
  if (amount >= 25000) amountRiskScore += 8;
  if (amount >= 50000) amountRiskScore += 6;

  let inactivityScore = 0;
  if (payload.lastActivityDate) {
    const activityMs = Date.parse(String(payload.lastActivityDate));
    if (!Number.isNaN(activityMs)) {
      const inactiveDays = Math.floor((nowMs - activityMs) / (1000 * 60 * 60 * 24));
      if (inactiveDays > 7) inactivityScore += 8;
      if (inactiveDays > 14) inactivityScore += 10;
      if (inactiveDays > 30) inactivityScore += 8;
    }
  }

  let closeDatePressureScore = 0;
  if (payload.closeDate) {
    const closeMs = Date.parse(String(payload.closeDate));
    if (!Number.isNaN(closeMs)) {
      const daysToClose = Math.floor((closeMs - nowMs) / (1000 * 60 * 60 * 24));
      if (daysToClose < 0) closeDatePressureScore += 12;
      else if (daysToClose <= 14) closeDatePressureScore += 6;
    }
  }

  const baseScore = 20;
  const deterministicScore = Math.min(100, baseScore + stageAgingScore + amountRiskScore + inactivityScore + closeDatePressureScore);
  const atRiskThreshold = Number(payload.atRiskThreshold || 80);
  const warningThreshold = Number(payload.warningThreshold || 60);

  const deterministicPriority = deterministicScore >= atRiskThreshold
    ? 'at_risk'
    : (deterministicScore >= warningThreshold ? 'warning' : 'healthy');

  const dedupeFingerprint = [
    String(payload.dealId || ''),
    String(payload.lastModifiedDate || ''),
    deterministicPriority,
  ].join('|');
  const idempotencyKey = Buffer.from(dedupeFingerprint).toString('base64').replace(/=/g, '').slice(0, 64);

  output.push({
    json: {
      ...payload,
      stageAgingScore,
      amountRiskScore,
      inactivityScore,
      closeDatePressureScore,
      deterministicScore,
      deterministicPriority,
      idempotencyKey,
    },
  });
}

return output;`,
    }),
    {
      ...agentNode({
      id: 'ai_deal_risk_agent',
      name: 'AI Deal Risk Agent',
      prompt:
        "={{'Analyze this deal for pipeline risk. Consider: days in current stage, deal value, last contact activity, expected close date pressure, and stage progression risk. Return ONLY valid JSON (no markdown) with this exact schema: {\"aiScore\": number 0-100, \"priority\": \"at_risk\" | \"warning\" | \"healthy\", \"summary\": string, \"confidence\": number 0-1}. Keep summary under 220 characters. Deal payload: ' + JSON.stringify($json)}}",
      position: [1620, 220],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    modelNode({ id: 'openai_chat_model', name: 'OpenAI Chat Model', modelName: 'gpt-4o-mini', position: [1620, 560] }),
    codeNode({
      id: 'parse_ai_output',
      name: 'Parse AI Output',
      position: [1840, 220],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const candidates = [payload.output, payload.text, payload.response, payload.result, payload];

  let parsed = {};
  let aiParseOk = false;

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;

    if (typeof candidate === 'object') {
      parsed = candidate;
      aiParseOk = true;
      break;
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      try {
        parsed = JSON.parse(trimmed);
        aiParseOk = true;
        break;
      } catch (error) {
        const match = trimmed.match(/\\{[\\s\\S]*\\}/);
        if (!match) continue;
        try {
          parsed = JSON.parse(match[0]);
          aiParseOk = true;
          break;
        } catch (innerError) {
          // Continue trying remaining candidates.
        }
      }
    }
  }

  const aiScoreRaw = Number(parsed.aiScore ?? parsed.score ?? parsed.riskScore ?? 0);
  const aiScore = Number.isFinite(aiScoreRaw) ? Math.min(100, Math.max(0, aiScoreRaw)) : 0;

  let aiPriority = String(parsed.priority || parsed.health || '').toLowerCase().trim();
  if (!['at_risk', 'warning', 'healthy'].includes(aiPriority)) {
    const atRiskThreshold = Number(payload.atRiskThreshold || 80);
    const warningThreshold = Number(payload.warningThreshold || 60);
    aiPriority = aiScore >= atRiskThreshold ? 'at_risk' : (aiScore >= warningThreshold ? 'warning' : 'healthy');
  }

  const aiSummary = String(parsed.summary || parsed.rationale || parsed.reason || '').trim();
  const aiConfidenceRaw = Number(parsed.confidence ?? 0);
  const aiConfidence = Number.isFinite(aiConfidenceRaw) ? Math.min(1, Math.max(0, aiConfidenceRaw)) : 0;

  output.push({
    json: {
      aiParseOk,
      aiScore,
      aiPriority,
      aiSummary: aiSummary || 'deterministic fallback used',
      aiConfidence,
      aiPayload: parsed,
    },
  });
}

return output;`,
    }),
    mergeNode({ id: 'merge_ai_with_rules', name: 'Merge AI with Rules', position: [1840, 420] }),
    codeNode({
      id: 'final_deal_decision',
      name: 'Final Deal Decision',
      position: [2060, 420],
      jsCode: `const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const deterministicScore = Number(payload.deterministicScore || 0);
  const aiScore = Number(payload.aiScore || 0);
  const rulesWeight = Number(payload.rulesWeight || 0.65);
  const aiWeight = Number(payload.aiWeight || 0.35);
  const atRiskThreshold = Number(payload.atRiskThreshold || 80);
  const warningThreshold = Number(payload.warningThreshold || 60);

  const aiUsable = payload.aiParseOk === true && aiScore > 0;
  const blendedScore = aiUsable
    ? Math.round((deterministicScore * rulesWeight) + (aiScore * aiWeight))
    : deterministicScore;
  const dealRiskScore = Math.min(100, Math.max(0, blendedScore));

  const health = dealRiskScore >= atRiskThreshold
    ? 'at_risk'
    : (dealRiskScore >= warningThreshold ? 'warning' : 'healthy');

  output.push({
    json: {
      ...payload,
      dealRiskScore,
      health,
      atRiskFlag: health === 'at_risk' ? 1 : 0,
      needsAttentionFlag: health === 'healthy' ? 0 : 1,
      scoringSource: aiUsable ? 'blended_ai_plus_rules' : 'deterministic_rules_only',
      riskSummary: payload.aiSummary || 'deterministic fallback used',
    },
  });
}

return output;`,
    }),
    ifNumberNode({ id: 'needs_attention_check', name: 'Needs Attention?', valueExpr: '={{$json.needsAttentionFlag}}', threshold: 1, position: [2280, 360] }),
    {
      ...slackPostNode({
      id: 'slack_risk_alert',
      name: 'Slack Risk Alert',
      textExpr: '={{($json.health === "at_risk" ? "🚨" : "⚠️") + " Deal risk " + ($json.health || "unknown") + ": " + ($json.dealName || $json.dealId || "Unnamed") + " | score " + ($json.dealRiskScore || 0) + " | stage " + ($json.stage || "unknown")}}',
      position: [2500, 220],
      channelIdValue: '={{$env.SLACK_CHANNEL_ID || "C01234567"}}',
    }),
      retryOnFail: true,
      maxTries: 2,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'dedupe_deal_record',
      name: 'Dedupe Deal Record',
      position: [2500, 420],
      jsCode: `const seen = new Set();
const output = [];

for (const item of $input.all()) {
  const payload = item.json || {};
  const key = String(payload.idempotencyKey || payload.dealId || '').trim();
  if (key && seen.has(key)) continue;
  if (key) seen.add(key);

  output.push({
    json: {
      ...payload,
      duplicateSuppressed: false,
    },
  });
}

return output;`,
    }),
    {
      ...notionCreatePageNode({
      id: 'notion_revops_log',
      name: 'Notion RevOps Log',
      titleExpr: '={{"RevOps: " + ($json.health || "healthy") + " | " + ($json.dealName || $json.dealId || "Unknown") + " | score " + ($json.dealRiskScore || 0)}}',
      position: [2720, 420],
      databaseIdValue: '={{$env.REVOPS_NOTION_DB_URL || $env.NOTION_DATABASE_URL || "https://www.notion.so/00000000000000000000000000000000"}}',
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
    codeNode({
      id: 'build_revops_digest',
      name: 'Build RevOps Digest',
      position: [2940, 420],
      jsCode: `const items = $input.all();
const maxRowsEnv = Number(process.env.N8N_REVOPS_DIGEST_MAX_ROWS || 40);
const maxRows = Number.isFinite(maxRowsEnv) ? Math.max(5, Math.min(200, maxRowsEnv)) : 40;

const lines = [];
let ownerEmail = 'owner@example.com';
let atRiskCount = 0;
let warningCount = 0;

for (const item of items) {
  const payload = item.json || {};
  ownerEmail = String(payload.ownerEmail || process.env.OWNER_EMAIL || ownerEmail).trim() || ownerEmail;
  if (payload.health === 'at_risk') atRiskCount += 1;
  if (payload.health === 'warning') warningCount += 1;
  if (payload.health === 'healthy') continue;

  const line = [
    payload.health === 'at_risk' ? 'AT_RISK' : 'WARNING',
    payload.dealName || payload.dealId || 'Unnamed deal',
    'score ' + Number(payload.dealRiskScore || 0),
    'stage ' + (payload.stage || 'unknown'),
    payload.riskSummary || 'No summary',
  ].join(' | ');

  lines.push(line);
}

const digestCount = lines.length;
const limitedLines = lines.slice(0, maxRows);
const overflow = digestCount > limitedLines.length ? '\\n...and ' + (digestCount - limitedLines.length) + ' more deals.' : '';

const digestSubject = digestCount > 0
  ? 'RevOps Risk Digest: ' + atRiskCount + ' at-risk, ' + warningCount + ' warning'
  : 'RevOps Risk Digest: No at-risk deals';

const digestBody = digestCount > 0
  ? [
      'Run time: ' + new Date().toISOString(),
      'Deals requiring attention: ' + digestCount,
      '',
      limitedLines.map((line) => '- ' + line).join('\\n'),
      overflow,
    ].join('\\n')
  : [
      'Run time: ' + new Date().toISOString(),
      'No at-risk or warning deals were detected in this run.',
    ].join('\\n');

return [{
  json: {
    digestCount,
    atRiskCount,
    warningCount,
    ownerEmail,
    digestSubject,
    digestBody,
  },
}];`,
    }),
    ifNumberNode({ id: 'digest_has_alerts', name: 'Digest Has Alerts?', valueExpr: '={{$json.digestCount}}', threshold: 1, position: [3160, 420] }),
    {
      ...gmailSendNode({
      id: 'gmail_revops_digest',
      name: 'Gmail RevOps Digest',
      toExpr: '={{$json.ownerEmail || $env.OWNER_EMAIL || "owner@example.com"}}',
      subject: '={{$json.digestSubject || "RevOps Risk Digest"}}',
      messageExpr: '={{$json.digestBody || "No digest content."}}',
      position: [3380, 360],
    }),
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
    },
  ];

  const connections = {
    '6 Hour Trigger': { main: [[{ node: 'HubSpot Search Deals', type: 'main', index: 0 }]] },
    'HubSpot Search Deals': { main: [[{ node: 'Normalize Deal Fields', type: 'main', index: 0 }]] },
    'Normalize Deal Fields': { main: [[{ node: 'Filter Recent Deal Changes', type: 'main', index: 0 }]] },
    'Filter Recent Deal Changes': { main: [[{ node: 'Inject RevOps Config', type: 'main', index: 0 }]] },
    'Inject RevOps Config': { main: [[{ node: 'Deterministic Deal Risk', type: 'main', index: 0 }]] },
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
    'Final Deal Decision': { main: [[{ node: 'Needs Attention?', type: 'main', index: 0 }]] },
    'Needs Attention?': {
      main: [
        [
          { node: 'Slack Risk Alert', type: 'main', index: 0 },
          { node: 'Dedupe Deal Record', type: 'main', index: 0 },
        ],
        [
          { node: 'Dedupe Deal Record', type: 'main', index: 0 },
        ],
      ],
    },
    'Dedupe Deal Record': { main: [[{ node: 'Notion RevOps Log', type: 'main', index: 0 }]] },
    'Notion RevOps Log': { main: [[{ node: 'Build RevOps Digest', type: 'main', index: 0 }]] },
    'Build RevOps Digest': { main: [[{ node: 'Digest Has Alerts?', type: 'main', index: 0 }]] },
    'Digest Has Alerts?': {
      main: [
        [{ node: 'Gmail RevOps Digest', type: 'main', index: 0 }],
        [],
      ],
    },
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
