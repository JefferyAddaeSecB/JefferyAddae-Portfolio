import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const rootDir = process.cwd();

const workflows = [
  {
    fileName: 'lead-intake-qualification-workflow.json',
    repoDir: 'n8n-lead-intake-qualification-system',
    workflow: {
      name: 'Lead Intake Qualification Pipeline',
      active: false,
      settings: { executionOrder: 'v1' },
      versionId: '2f2d5f8b-7d52-4270-9352-b8fc66fd03a1',
      nodes: [
        {
          parameters: {
            path: 'lead-intake-v2',
            httpMethod: 'POST',
            responseMode: 'onReceived'
          },
          id: 'lead_webhook',
          name: 'Lead Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [220, 320],
          webhookId: 'lead-intake-v2'
        },
        {
          parameters: {
            keepOnlySet: false,
            values: {
              string: [
                { name: 'pipeline', value: 'lead-intake-qualification' },
                { name: 'receivedAt', value: '={{new Date().toISOString()}}' }
              ]
            }
          },
          id: 'normalize_lead_payload',
          name: 'Normalize Lead Payload',
          type: 'n8n-nodes-base.set',
          typeVersion: 3,
          position: [440, 320]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const budget = Number(item.json.budget || 0);
  const urgency = String(item.json.urgency || 'normal').toLowerCase();
  const source = String(item.json.source || 'unknown').toLowerCase();
  const tools = String(item.json.tools || item.json.toolsInvolved || '').toLowerCase();

  let score = 35;
  if (budget >= 5000) score += 25;
  if (budget >= 12000) score += 10;
  if (urgency.includes('urgent') || urgency.includes('high')) score += 15;
  if (source.includes('referral')) score += 8;
  if (tools.includes('hubspot') || tools.includes('salesforce')) score += 7;

  const deterministicPriority = score >= 75 ? 'hot' : score >= 55 ? 'warm' : 'cold';

  return {
    json: {
      ...item.json,
      deterministicScore: Math.min(score, 100),
      deterministicPriority
    }
  };
});`
          },
          id: 'deterministic_lead_scoring',
          name: 'Deterministic Lead Scoring',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [660, 320]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: 'Authorization',
                  value:
                    "={{$env.OPENROUTER_API_KEY ? 'Bearer ' + $env.OPENROUTER_API_KEY : 'Bearer REPLACE_OPENROUTER_API_KEY'}}"
                },
                { name: 'Content-Type', value: 'application/json' }
              ]
            },
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"model":"openai/gpt-4o-mini","temperature":0.1,"messages":[{"role":"system","content":"You score inbound B2B leads. Return strict JSON with keys aiScore (0-100 number), priority (hot|warm|cold), rationale (short string)."},{"role":"user","content": JSON.stringify($json)}]}'
          },
          id: 'ai_qualification',
          name: 'AI Qualification',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [900, 220]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const raw = item.json;
  let ai = {};

  try {
    const content = raw.choices?.[0]?.message?.content ?? raw.data?.choices?.[0]?.message?.content ?? '';
    ai = content ? JSON.parse(content) : {};
  } catch (error) {
    ai = {};
  }

  return {
    json: {
      aiScore: Number(ai.aiScore ?? ai.score ?? 0),
      aiPriority: String(ai.priority || '').toLowerCase(),
      aiRationale: String(ai.rationale || 'ai_response_unavailable')
    }
  };
});`
          },
          id: 'parse_ai_qualification',
          name: 'Parse AI Qualification',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1120, 220]
        },
        {
          parameters: {
            mode: 'combine'
          },
          id: 'merge_scoring_signals',
          name: 'Merge Scoring Signals',
          type: 'n8n-nodes-base.merge',
          typeVersion: 3,
          position: [1120, 360]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const deterministic = Number(item.json.deterministicScore || 0);
  const aiScore = Number(item.json.aiScore || 0);
  const blended = aiScore > 0
    ? Math.round((deterministic * 0.6) + (aiScore * 0.4))
    : deterministic;

  const priority = blended >= 75 ? 'hot' : blended >= 55 ? 'warm' : 'cold';

  return {
    json: {
      ...item.json,
      leadScore: blended,
      priority,
      scoringSource: aiScore > 0 ? 'blended_ai_plus_rules' : 'deterministic_rules_only'
    }
  };
});`
          },
          id: 'final_priority_decision',
          name: 'Final Priority Decision',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1340, 360]
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json.leadScore}}',
                  operation: 'largerEqual',
                  value2: 75
                }
              ]
            }
          },
          id: 'if_hot_lead',
          name: 'Hot Lead?',
          type: 'n8n-nodes-base.if',
          typeVersion: 2,
          position: [1560, 360]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/REPLACE/SALES/WEBHOOK',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"text":"🔥 HOT lead: {{$json.firstName || $json.name || \"Unknown\"}} ({{$json.email || \"no-email\"}}) score {{$json.leadScore}}"}'
          },
          id: 'send_sales_alert',
          name: 'Send Sales Alert',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 240]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-crm.local/api/leads/upsert',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{$json}}'
          },
          id: 'upsert_lead_crm',
          name: 'Upsert Lead in CRM',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 420]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-mail.local/api/send',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"to":"owner@jefferyaddae.com","subject":"New {{$json.priority}} lead scored {{$json.leadScore}}","payload":$json}'
          },
          id: 'owner_notification',
          name: 'Owner Email Notification',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [2000, 420]
        }
      ],
      connections: {
        'Lead Webhook': {
          main: [[{ node: 'Normalize Lead Payload', type: 'main', index: 0 }]]
        },
        'Normalize Lead Payload': {
          main: [[{ node: 'Deterministic Lead Scoring', type: 'main', index: 0 }]]
        },
        'Deterministic Lead Scoring': {
          main: [
            [{ node: 'AI Qualification', type: 'main', index: 0 }],
            [{ node: 'Merge Scoring Signals', type: 'main', index: 0 }]
          ]
        },
        'AI Qualification': {
          main: [[{ node: 'Parse AI Qualification', type: 'main', index: 0 }]]
        },
        'Parse AI Qualification': {
          main: [[{ node: 'Merge Scoring Signals', type: 'main', index: 1 }]]
        },
        'Merge Scoring Signals': {
          main: [[{ node: 'Final Priority Decision', type: 'main', index: 0 }]]
        },
        'Final Priority Decision': {
          main: [[{ node: 'Hot Lead?', type: 'main', index: 0 }]]
        },
        'Hot Lead?': {
          main: [
            [
              { node: 'Send Sales Alert', type: 'main', index: 0 },
              { node: 'Upsert Lead in CRM', type: 'main', index: 0 }
            ],
            [{ node: 'Upsert Lead in CRM', type: 'main', index: 0 }]
          ]
        },
        'Upsert Lead in CRM': {
          main: [[{ node: 'Owner Email Notification', type: 'main', index: 0 }]]
        }
      }
    }
  },
  {
    fileName: 'internal-ops-routing-approvals-workflow.json',
    repoDir: 'n8n-internal-ops-routing-approvals',
    workflow: {
      name: 'Internal Ops Routing and Approvals',
      active: false,
      settings: { executionOrder: 'v1' },
      versionId: '66e7fbf8-f3df-4456-8d20-7d17956ef31f',
      nodes: [
        {
          parameters: {
            path: 'ops-request-v2',
            httpMethod: 'POST',
            responseMode: 'onReceived'
          },
          id: 'ops_request_webhook',
          name: 'Ops Request Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [220, 320],
          webhookId: 'ops-request-v2'
        },
        {
          parameters: {
            keepOnlySet: false,
            values: {
              string: [
                { name: 'status', value: 'intake_received' },
                { name: 'requestReceivedAt', value: '={{new Date().toISOString()}}' }
              ]
            }
          },
          id: 'normalize_ops_request',
          name: 'Normalize Ops Request',
          type: 'n8n-nodes-base.set',
          typeVersion: 3,
          position: [440, 320]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const requestType = String(item.json.requestType || 'general').toLowerCase();
  const priority = String(item.json.priority || 'normal').toLowerCase();
  const impact = String(item.json.impact || 'medium').toLowerCase();

  const approver = requestType.includes('finance')
    ? 'finance-manager'
    : requestType.includes('security')
    ? 'security-lead'
    : 'ops-manager';

  let routingScore = 35;
  if (priority.includes('high') || priority.includes('urgent')) routingScore += 25;
  if (impact.includes('high') || impact.includes('critical')) routingScore += 20;
  if (requestType.includes('access') || requestType.includes('security')) routingScore += 10;

  return {
    json: {
      ...item.json,
      approver,
      slaHours: routingScore >= 75 ? 4 : routingScore >= 55 ? 12 : 24,
      routingScore
    }
  };
});`
          },
          id: 'policy_routing_engine',
          name: 'Policy Routing Engine',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [670, 320]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: 'Authorization',
                  value:
                    "={{$env.OPENROUTER_API_KEY ? 'Bearer ' + $env.OPENROUTER_API_KEY : 'Bearer REPLACE_OPENROUTER_API_KEY'}}"
                },
                { name: 'Content-Type', value: 'application/json' }
              ]
            },
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"model":"openai/gpt-4o-mini","temperature":0.1,"messages":[{"role":"system","content":"You review internal ops requests for escalation risk. Return JSON: riskScore (0-100), escalationReason (string), shouldEscalate (true|false)."},{"role":"user","content": JSON.stringify($json)}]}'
          },
          id: 'ai_risk_reviewer',
          name: 'AI Risk Reviewer',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [900, 220]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const raw = item.json;
  let ai = {};

  try {
    const content = raw.choices?.[0]?.message?.content ?? '';
    ai = content ? JSON.parse(content) : {};
  } catch (error) {
    ai = {};
  }

  return {
    json: {
      aiRiskScore: Number(ai.riskScore ?? 0),
      shouldEscalateAi: ai.shouldEscalate === true,
      escalationReasonAi: String(ai.escalationReason || 'ai_response_unavailable')
    }
  };
});`
          },
          id: 'parse_ai_risk_review',
          name: 'Parse AI Risk Review',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1120, 220]
        },
        {
          parameters: { mode: 'combine' },
          id: 'merge_risk_signals',
          name: 'Merge Risk Signals',
          type: 'n8n-nodes-base.merge',
          typeVersion: 3,
          position: [1120, 360]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const routingScore = Number(item.json.routingScore || 0);
  const aiRiskScore = Number(item.json.aiRiskScore || 0);
  const escalationScore = aiRiskScore > 0
    ? Math.round((routingScore * 0.65) + (aiRiskScore * 0.35))
    : routingScore;

  const escalate = escalationScore >= 70 || item.json.shouldEscalateAi === true;

  return {
    json: {
      ...item.json,
      escalationScore,
      escalate,
      approvalStatus: escalate ? 'escalation_required' : 'standard_approval'
    }
  };
});`
          },
          id: 'final_routing_decision',
          name: 'Final Routing Decision',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1340, 360]
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json.escalationScore}}',
                  operation: 'largerEqual',
                  value2: 70
                }
              ]
            }
          },
          id: 'escalation_needed',
          name: 'Escalation Needed?',
          type: 'n8n-nodes-base.if',
          typeVersion: 2,
          position: [1560, 360]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-notion.local/api/ops-requests/upsert',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{$json}}'
          },
          id: 'create_request_record',
          name: 'Create Request Record',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 420]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/REPLACE/OPS/ESCALATION',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"text":"⚠️ Escalated ops request for {{$json.approver}} | score {{$json.escalationScore}} | reason {{$json.escalationReasonAi}}"}'
          },
          id: 'escalate_to_director',
          name: 'Escalate to Director',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 240]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/REPLACE/OPS/APPROVER',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"text":"New {{$json.requestType || \"ops\"}} request assigned to {{$json.approver}} (SLA {{$json.slaHours}}h)."}'
          },
          id: 'notify_assigned_approver',
          name: 'Notify Assigned Approver',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [2000, 420]
        }
      ],
      connections: {
        'Ops Request Webhook': {
          main: [[{ node: 'Normalize Ops Request', type: 'main', index: 0 }]]
        },
        'Normalize Ops Request': {
          main: [[{ node: 'Policy Routing Engine', type: 'main', index: 0 }]]
        },
        'Policy Routing Engine': {
          main: [
            [{ node: 'AI Risk Reviewer', type: 'main', index: 0 }],
            [{ node: 'Merge Risk Signals', type: 'main', index: 0 }]
          ]
        },
        'AI Risk Reviewer': {
          main: [[{ node: 'Parse AI Risk Review', type: 'main', index: 0 }]]
        },
        'Parse AI Risk Review': {
          main: [[{ node: 'Merge Risk Signals', type: 'main', index: 1 }]]
        },
        'Merge Risk Signals': {
          main: [[{ node: 'Final Routing Decision', type: 'main', index: 0 }]]
        },
        'Final Routing Decision': {
          main: [[{ node: 'Escalation Needed?', type: 'main', index: 0 }]]
        },
        'Escalation Needed?': {
          main: [
            [
              { node: 'Escalate to Director', type: 'main', index: 0 },
              { node: 'Create Request Record', type: 'main', index: 0 }
            ],
            [{ node: 'Create Request Record', type: 'main', index: 0 }]
          ]
        },
        'Create Request Record': {
          main: [[{ node: 'Notify Assigned Approver', type: 'main', index: 0 }]]
        }
      }
    }
  },
  {
    fileName: 'ai-support-ticket-triage-workflow.json',
    repoDir: 'n8n-ai-support-ticket-triage',
    workflow: {
      name: 'AI Support Ticket Triage',
      active: false,
      settings: { executionOrder: 'v1' },
      versionId: 'ea44b9b8-71f6-46e2-9804-0d5ef0ba1c93',
      nodes: [
        {
          parameters: {
            path: 'support-ticket-v2',
            httpMethod: 'POST',
            responseMode: 'onReceived'
          },
          id: 'ticket_webhook',
          name: 'Ticket Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [220, 320],
          webhookId: 'support-ticket-v2'
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const message = String(item.json.message || item.json.description || '').trim();
  const subject = String(item.json.subject || 'No subject');
  return {
    json: {
      ...item.json,
      subject,
      message: message || 'No message provided',
      receivedAt: new Date().toISOString()
    }
  };
});`
          },
          id: 'validate_ticket_payload',
          name: 'Validate Ticket Payload',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [440, 320]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const text = String(item.json.subject || "") + " " + String(item.json.message || "");
  const loweredText = text.toLowerCase();
  let ruleSeverityScore = 30;

  if (loweredText.includes('outage') || loweredText.includes('down')) ruleSeverityScore += 35;
  if (loweredText.includes('payment') || loweredText.includes('billing')) ruleSeverityScore += 20;
  if (loweredText.includes('security') || loweredText.includes('breach')) ruleSeverityScore += 25;

  return {
    json: {
      ...item.json,
      ruleSeverityScore,
      baselineQueue: ruleSeverityScore >= 70 ? 'urgent-human' : 'ai-assisted'
    }
  };
});`
          },
          id: 'deterministic_severity_rules',
          name: 'Deterministic Severity Rules',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [670, 320]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: 'Authorization',
                  value:
                    "={{$env.OPENROUTER_API_KEY ? 'Bearer ' + $env.OPENROUTER_API_KEY : 'Bearer REPLACE_OPENROUTER_API_KEY'}}"
                },
                { name: 'Content-Type', value: 'application/json' }
              ]
            },
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"model":"openai/gpt-4o-mini","temperature":0.1,"messages":[{"role":"system","content":"You triage support tickets. Return JSON: aiSeverityScore (0-100), queue (urgent-human|human|ai-assisted), triageSummary (string)."},{"role":"user","content": JSON.stringify($json)}]}'
          },
          id: 'ai_triage_agent',
          name: 'AI Triage Agent',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [900, 220]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const raw = item.json;
  let ai = {};

  try {
    const content = raw.choices?.[0]?.message?.content ?? '';
    ai = content ? JSON.parse(content) : {};
  } catch (error) {
    ai = {};
  }

  return {
    json: {
      aiSeverityScore: Number(ai.aiSeverityScore ?? 0),
      aiQueue: String(ai.queue || ''),
      aiTriageSummary: String(ai.triageSummary || 'ai_response_unavailable')
    }
  };
});`
          },
          id: 'parse_ai_triage',
          name: 'Parse AI Triage',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1120, 220]
        },
        {
          parameters: { mode: 'combine' },
          id: 'merge_triage_signals',
          name: 'Merge Triage Signals',
          type: 'n8n-nodes-base.merge',
          typeVersion: 3,
          position: [1120, 360]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const rules = Number(item.json.ruleSeverityScore || 0);
  const ai = Number(item.json.aiSeverityScore || 0);
  const triageScore = ai > 0 ? Math.round((rules * 0.6) + (ai * 0.4)) : rules;
  const needsHuman = triageScore >= 70;

  return {
    json: {
      ...item.json,
      triageScore,
      needsHuman,
      finalQueue: needsHuman ? 'urgent-human' : item.json.aiQueue || item.json.baselineQueue,
      triageSummary: item.json.aiTriageSummary || 'rules-only triage applied'
    }
  };
});`
          },
          id: 'final_triage_decision',
          name: 'Final Triage Decision',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1340, 360]
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json.triageScore}}',
                  operation: 'largerEqual',
                  value2: 70
                }
              ]
            }
          },
          id: 'human_escalation_required',
          name: 'Human Escalation Required?',
          type: 'n8n-nodes-base.if',
          typeVersion: 2,
          position: [1560, 360]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-pagerduty.local/api/incidents',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"title":"Urgent support ticket","ticket":$json.ticketId || $json.id || "unknown","score":$json.triageScore,"summary":$json.triageSummary}'
          },
          id: 'escalate_to_human_queue',
          name: 'Escalate to Human Queue',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 240]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-helpdesk.local/api/tickets/triage',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{$json}}'
          },
          id: 'update_helpdesk_ticket',
          name: 'Update Helpdesk Ticket',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 420]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/REPLACE/SUPPORT/SUMMARY',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"text":"Ticket triaged to {{$json.finalQueue}} | score {{$json.triageScore}} | {{$json.triageSummary}}"}'
          },
          id: 'post_triage_summary',
          name: 'Post Triage Summary',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [2000, 420]
        }
      ],
      connections: {
        'Ticket Webhook': {
          main: [[{ node: 'Validate Ticket Payload', type: 'main', index: 0 }]]
        },
        'Validate Ticket Payload': {
          main: [[{ node: 'Deterministic Severity Rules', type: 'main', index: 0 }]]
        },
        'Deterministic Severity Rules': {
          main: [
            [{ node: 'AI Triage Agent', type: 'main', index: 0 }],
            [{ node: 'Merge Triage Signals', type: 'main', index: 0 }]
          ]
        },
        'AI Triage Agent': {
          main: [[{ node: 'Parse AI Triage', type: 'main', index: 0 }]]
        },
        'Parse AI Triage': {
          main: [[{ node: 'Merge Triage Signals', type: 'main', index: 1 }]]
        },
        'Merge Triage Signals': {
          main: [[{ node: 'Final Triage Decision', type: 'main', index: 0 }]]
        },
        'Final Triage Decision': {
          main: [[{ node: 'Human Escalation Required?', type: 'main', index: 0 }]]
        },
        'Human Escalation Required?': {
          main: [
            [
              { node: 'Escalate to Human Queue', type: 'main', index: 0 },
              { node: 'Update Helpdesk Ticket', type: 'main', index: 0 }
            ],
            [{ node: 'Update Helpdesk Ticket', type: 'main', index: 0 }]
          ]
        },
        'Update Helpdesk Ticket': {
          main: [[{ node: 'Post Triage Summary', type: 'main', index: 0 }]]
        }
      }
    }
  },
  {
    fileName: 'automated-reporting-dashboards-workflow.json',
    repoDir: 'n8n-automated-reporting-dashboards',
    workflow: {
      name: 'Automated Reporting and Dashboards',
      active: false,
      settings: { executionOrder: 'v1' },
      versionId: '3fe23b85-b954-4f6f-a462-87ce69961980',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'hours', hoursInterval: 24 }]
            }
          },
          id: 'daily_trigger',
          name: 'Daily Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [220, 320]
        },
        {
          parameters: {
            method: 'GET',
            url: 'https://example-analytics.local/api/metrics'
          },
          id: 'pull_product_analytics',
          name: 'Pull Product Analytics',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [460, 240]
        },
        {
          parameters: {
            method: 'GET',
            url: 'https://example-billing.local/api/revenue'
          },
          id: 'pull_revenue_metrics',
          name: 'Pull Revenue Metrics',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [460, 400]
        },
        {
          parameters: {
            mode: 'combine'
          },
          id: 'merge_source_metrics',
          name: 'Merge Source Metrics',
          type: 'n8n-nodes-base.merge',
          typeVersion: 3,
          position: [700, 320]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const data = item.json;
  const arr = Array.isArray(data) ? data : [data];
  const normalized = arr.flatMap((x) => (Array.isArray(x.metrics) ? x.metrics : [x]));

  const revenue = Number(item.json.totalRevenue || item.json.revenue || 0);
  const previousRevenue = Number(item.json.previousRevenue || item.json.lastPeriodRevenue || 0);
  const changePct = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

  const anomalyScore = Math.min(100, Math.max(0, Math.round(Math.abs(changePct) * 2)));

  return {
    json: {
      ...item.json,
      normalizedMetricCount: normalized.length,
      kpiSummary: {
        revenue,
        previousRevenue,
        changePct: Number(changePct.toFixed(2))
      },
      anomalyScore,
      reportGeneratedAt: new Date().toISOString()
    }
  };
});`
          },
          id: 'compute_kpi_pack',
          name: 'Compute KPI Pack',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [940, 320]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: 'Authorization',
                  value:
                    "={{$env.OPENROUTER_API_KEY ? 'Bearer ' + $env.OPENROUTER_API_KEY : 'Bearer REPLACE_OPENROUTER_API_KEY'}}"
                },
                { name: 'Content-Type', value: 'application/json' }
              ]
            },
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"model":"openai/gpt-4o-mini","temperature":0.1,"messages":[{"role":"system","content":"You generate executive KPI summaries. Return JSON: executiveSummary (string), actionItems (array of short strings)."},{"role":"user","content": JSON.stringify($json)}]}'
          },
          id: 'ai_narrative_generator',
          name: 'AI Narrative Generator',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1170, 220]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const raw = item.json;
  let ai = {};

  try {
    const content = raw.choices?.[0]?.message?.content ?? '';
    ai = content ? JSON.parse(content) : {};
  } catch (error) {
    ai = {};
  }

  return {
    json: {
      executiveSummary: String(ai.executiveSummary || 'Executive summary unavailable; fallback to KPI payload.'),
      actionItems: Array.isArray(ai.actionItems) ? ai.actionItems : []
    }
  };
});`
          },
          id: 'parse_ai_narrative',
          name: 'Parse AI Narrative',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1390, 220]
        },
        {
          parameters: { mode: 'combine' },
          id: 'merge_kpi_narrative',
          name: 'Merge KPI + Narrative',
          type: 'n8n-nodes-base.merge',
          typeVersion: 3,
          position: [1390, 360]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-dashboard.local/api/refresh',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{$json}}'
          },
          id: 'publish_dashboard_snapshot',
          name: 'Publish Dashboard Snapshot',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1610, 360]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-mail.local/api/send',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"to":"exec-team@company.com","subject":"Daily KPI Brief","summary":$json.executiveSummary,"actions":$json.actionItems,"kpi":$json.kpiSummary}'
          },
          id: 'send_executive_email_brief',
          name: 'Send Executive Email Brief',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1830, 360]
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json.anomalyScore}}',
                  operation: 'largerEqual',
                  value2: 70
                }
              ]
            }
          },
          id: 'anomaly_score_critical',
          name: 'Anomaly Score Critical?',
          type: 'n8n-nodes-base.if',
          typeVersion: 2,
          position: [1610, 520]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/REPLACE/ANALYTICS/ALERTS',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"text":"🚨 KPI anomaly detected (score {{$json.anomalyScore}}). Revenue delta: {{$json.kpiSummary.changePct}}%."}'
          },
          id: 'send_anomaly_alert',
          name: 'Send Anomaly Alert',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1830, 520]
        }
      ],
      connections: {
        'Daily Trigger': {
          main: [
            [{ node: 'Pull Product Analytics', type: 'main', index: 0 }],
            [{ node: 'Pull Revenue Metrics', type: 'main', index: 0 }]
          ]
        },
        'Pull Product Analytics': {
          main: [[{ node: 'Merge Source Metrics', type: 'main', index: 0 }]]
        },
        'Pull Revenue Metrics': {
          main: [[{ node: 'Merge Source Metrics', type: 'main', index: 1 }]]
        },
        'Merge Source Metrics': {
          main: [[{ node: 'Compute KPI Pack', type: 'main', index: 0 }]]
        },
        'Compute KPI Pack': {
          main: [
            [{ node: 'AI Narrative Generator', type: 'main', index: 0 }],
            [{ node: 'Merge KPI + Narrative', type: 'main', index: 0 }]
          ]
        },
        'AI Narrative Generator': {
          main: [[{ node: 'Parse AI Narrative', type: 'main', index: 0 }]]
        },
        'Parse AI Narrative': {
          main: [[{ node: 'Merge KPI + Narrative', type: 'main', index: 1 }]]
        },
        'Merge KPI + Narrative': {
          main: [
            [{ node: 'Publish Dashboard Snapshot', type: 'main', index: 0 }],
            [{ node: 'Anomaly Score Critical?', type: 'main', index: 0 }]
          ]
        },
        'Publish Dashboard Snapshot': {
          main: [[{ node: 'Send Executive Email Brief', type: 'main', index: 0 }]]
        },
        'Anomaly Score Critical?': {
          main: [[{ node: 'Send Anomaly Alert', type: 'main', index: 0 }], []]
        }
      }
    }
  },
  {
    fileName: 'client-intake-onboarding-workflow.json',
    repoDir: 'n8n-client-intake-onboarding-automation',
    workflow: {
      name: 'Client Intake and Onboarding',
      active: false,
      settings: { executionOrder: 'v1' },
      versionId: '1f25ef4c-c307-4116-88fa-2ea8f5f719d3',
      nodes: [
        {
          parameters: {
            path: 'client-intake-v2',
            httpMethod: 'POST',
            responseMode: 'onReceived'
          },
          id: 'client_intake_webhook',
          name: 'Client Intake Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [220, 320],
          webhookId: 'client-intake-v2'
        },
        {
          parameters: {
            keepOnlySet: false,
            values: {
              string: [
                { name: 'onboardingStatus', value: 'intake_received' },
                { name: 'intakeCapturedAt', value: '={{new Date().toISOString()}}' }
              ]
            }
          },
          id: 'normalize_intake',
          name: 'Normalize Intake',
          type: 'n8n-nodes-base.set',
          typeVersion: 3,
          position: [440, 320]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const budget = Number(item.json.budget || 0);
  const timeline = String(item.json.timeline || '').toLowerCase();
  const docsProvided = Number(item.json.docsProvided || 0);

  let readinessScore = 40;
  if (budget >= 5000) readinessScore += 15;
  if (timeline.includes('asap') || timeline.includes('this week')) readinessScore += 15;
  if (docsProvided >= 3) readinessScore += 20;

  return {
    json: {
      ...item.json,
      readinessScore,
      readinessByRules: readinessScore >= 80 ? 'kickoff-ready' : 'needs-docs'
    }
  };
});`
          },
          id: 'deterministic_readiness_engine',
          name: 'Deterministic Readiness Engine',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [670, 320]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: 'Authorization',
                  value:
                    "={{$env.OPENROUTER_API_KEY ? 'Bearer ' + $env.OPENROUTER_API_KEY : 'Bearer REPLACE_OPENROUTER_API_KEY'}}"
                },
                { name: 'Content-Type', value: 'application/json' }
              ]
            },
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"model":"openai/gpt-4o-mini","temperature":0.15,"messages":[{"role":"system","content":"You create onboarding plans for agency clients. Return JSON: aiReadinessScore (0-100), kickoffRecommendation (ready|not-ready), kickoffChecklist (array), summary (string)."},{"role":"user","content": JSON.stringify($json)}]}'
          },
          id: 'ai_onboarding_planner',
          name: 'AI Onboarding Planner',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [900, 220]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const raw = item.json;
  let ai = {};

  try {
    const content = raw.choices?.[0]?.message?.content ?? '';
    ai = content ? JSON.parse(content) : {};
  } catch (error) {
    ai = {};
  }

  return {
    json: {
      aiReadinessScore: Number(ai.aiReadinessScore ?? 0),
      kickoffRecommendationAi: String(ai.kickoffRecommendation || 'not-ready'),
      kickoffChecklistAi: Array.isArray(ai.kickoffChecklist) ? ai.kickoffChecklist : [],
      onboardingPlanSummary: String(ai.summary || 'ai_plan_unavailable')
    }
  };
});`
          },
          id: 'parse_ai_plan',
          name: 'Parse AI Plan',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1120, 220]
        },
        {
          parameters: { mode: 'combine' },
          id: 'merge_readiness_signals',
          name: 'Merge Readiness Signals',
          type: 'n8n-nodes-base.merge',
          typeVersion: 3,
          position: [1120, 360]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const rules = Number(item.json.readinessScore || 0);
  const ai = Number(item.json.aiReadinessScore || 0);
  const blendedReadiness = ai > 0 ? Math.round((rules * 0.65) + (ai * 0.35)) : rules;

  return {
    json: {
      ...item.json,
      readinessScore: blendedReadiness,
      onboardingStatus: blendedReadiness >= 80 ? 'kickoff_ready' : 'awaiting_documents',
      kickoffChecklist: item.json.kickoffChecklistAi || []
    }
  };
});`
          },
          id: 'final_onboarding_decision',
          name: 'Final Onboarding Decision',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1340, 360]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-notion.local/api/onboarding/tasks',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{$json}}'
          },
          id: 'create_onboarding_tasks',
          name: 'Create Onboarding Tasks',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1560, 420]
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json.readinessScore}}',
                  operation: 'largerEqual',
                  value2: 80
                }
              ]
            }
          },
          id: 'kickoff_ready',
          name: 'Kickoff Ready?',
          type: 'n8n-nodes-base.if',
          typeVersion: 2,
          position: [1560, 240]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-calendly.local/api/schedule',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"email":$json.email,"name":$json.firstName || $json.name,"status":"kickoff_ready","checklist":$json.kickoffChecklist}'
          },
          id: 'schedule_kickoff_meeting',
          name: 'Schedule Kickoff Meeting',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 180]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-mail.local/api/send',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"to":$json.email,"subject":"Missing documents before kickoff","status":$json.onboardingStatus,"summary":$json.onboardingPlanSummary}'
          },
          id: 'request_missing_documents',
          name: 'Request Missing Documents',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 300]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-mail.local/api/send',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"to":$json.email,"subject":"Welcome - onboarding started","status":$json.onboardingStatus,"summary":$json.onboardingPlanSummary}'
          },
          id: 'send_welcome_next_steps',
          name: 'Send Welcome + Next Steps',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1780, 460]
        }
      ],
      connections: {
        'Client Intake Webhook': {
          main: [[{ node: 'Normalize Intake', type: 'main', index: 0 }]]
        },
        'Normalize Intake': {
          main: [[{ node: 'Deterministic Readiness Engine', type: 'main', index: 0 }]]
        },
        'Deterministic Readiness Engine': {
          main: [
            [{ node: 'AI Onboarding Planner', type: 'main', index: 0 }],
            [{ node: 'Merge Readiness Signals', type: 'main', index: 0 }]
          ]
        },
        'AI Onboarding Planner': {
          main: [[{ node: 'Parse AI Plan', type: 'main', index: 0 }]]
        },
        'Parse AI Plan': {
          main: [[{ node: 'Merge Readiness Signals', type: 'main', index: 1 }]]
        },
        'Merge Readiness Signals': {
          main: [[{ node: 'Final Onboarding Decision', type: 'main', index: 0 }]]
        },
        'Final Onboarding Decision': {
          main: [
            [{ node: 'Create Onboarding Tasks', type: 'main', index: 0 }],
            [{ node: 'Kickoff Ready?', type: 'main', index: 0 }]
          ]
        },
        'Create Onboarding Tasks': {
          main: [[{ node: 'Send Welcome + Next Steps', type: 'main', index: 0 }]]
        },
        'Kickoff Ready?': {
          main: [
            [{ node: 'Schedule Kickoff Meeting', type: 'main', index: 0 }],
            [{ node: 'Request Missing Documents', type: 'main', index: 0 }]
          ]
        }
      }
    }
  },
  {
    fileName: 'revenue-ops-crm-sync-workflow.json',
    repoDir: 'n8n-revenue-ops-crm-sync',
    workflow: {
      name: 'Revenue Ops CRM Sync and Enrichment',
      active: false,
      settings: { executionOrder: 'v1' },
      versionId: 'f5002b8a-e495-438c-a953-8e8f36df07ac',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'hours', hoursInterval: 6 }]
            }
          },
          id: 'six_hour_trigger',
          name: '6 Hour Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [220, 320]
        },
        {
          parameters: {
            method: 'GET',
            url: 'https://example-crm.local/api/deals/stale'
          },
          id: 'fetch_stale_deals',
          name: 'Fetch Stale Deals',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [460, 320]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-enrichment.local/api/company',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{$json}}'
          },
          id: 'enrich_company_profile',
          name: 'Enrich Company Profile',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [700, 320]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const ageDays = Number(item.json.daysInStage || item.json.stageAgeDays || 0);
  const amount = Number(item.json.amount || item.json.dealValue || 0);

  let deterministicRisk = 25;
  if (ageDays > 14) deterministicRisk += 30;
  if (ageDays > 30) deterministicRisk += 20;
  if (amount >= 10000) deterministicRisk += 15;

  return {
    json: {
      ...item.json,
      deterministicRisk: Math.min(deterministicRisk, 100)
    }
  };
});`
          },
          id: 'deterministic_deal_health_scoring',
          name: 'Deterministic Deal Health Scoring',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [940, 320]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: 'Authorization',
                  value:
                    "={{$env.OPENROUTER_API_KEY ? 'Bearer ' + $env.OPENROUTER_API_KEY : 'Bearer REPLACE_OPENROUTER_API_KEY'}}"
                },
                { name: 'Content-Type', value: 'application/json' }
              ]
            },
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"model":"openai/gpt-4o-mini","temperature":0.1,"messages":[{"role":"system","content":"You analyze CRM deals for slippage risk. Return JSON: aiRiskScore (0-100), reason (string), recommendedAction (string)."},{"role":"user","content": JSON.stringify($json)}]}'
          },
          id: 'ai_deal_risk_analyst',
          name: 'AI Deal Risk Analyst',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [1170, 220]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const raw = item.json;
  let ai = {};

  try {
    const content = raw.choices?.[0]?.message?.content ?? '';
    ai = content ? JSON.parse(content) : {};
  } catch (error) {
    ai = {};
  }

  return {
    json: {
      aiRiskScore: Number(ai.aiRiskScore ?? 0),
      aiReason: String(ai.reason || 'ai_response_unavailable'),
      aiRecommendedAction: String(ai.recommendedAction || 'manual_review')
    }
  };
});`
          },
          id: 'parse_ai_deal_risk',
          name: 'Parse AI Deal Risk',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1390, 220]
        },
        {
          parameters: { mode: 'combine' },
          id: 'merge_deal_risk_signals',
          name: 'Merge Deal Risk Signals',
          type: 'n8n-nodes-base.merge',
          typeVersion: 3,
          position: [1390, 360]
        },
        {
          parameters: {
            jsCode: `return $input.all().map((item) => {
  const deterministicRisk = Number(item.json.deterministicRisk || 0);
  const aiRiskScore = Number(item.json.aiRiskScore || 0);
  const dealRiskScore = aiRiskScore > 0
    ? Math.round((deterministicRisk * 0.65) + (aiRiskScore * 0.35))
    : deterministicRisk;

  return {
    json: {
      ...item.json,
      dealRiskScore,
      health: dealRiskScore >= 70 ? 'at_risk' : 'healthy'
    }
  };
});`
          },
          id: 'final_deal_risk_decision',
          name: 'Final Deal Risk Decision',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [1610, 360]
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json.dealRiskScore}}',
                  operation: 'largerEqual',
                  value2: 70
                }
              ]
            }
          },
          id: 'at_risk_deal',
          name: 'At Risk Deal?',
          type: 'n8n-nodes-base.if',
          typeVersion: 2,
          position: [1830, 360]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-pm.local/api/tasks',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"title":"Deal rescue playbook","dealId":$json.dealId || $json.id,"risk":$json.dealRiskScore,"reason":$json.aiReason,"action":$json.aiRecommendedAction}'
          },
          id: 'create_rescue_task',
          name: 'Create Rescue Task',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [2050, 240]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://example-crm.local/api/deals/upsert-health',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{$json}}'
          },
          id: 'upsert_crm_health_fields',
          name: 'Upsert CRM Health Fields',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [2050, 420]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/REPLACE/REVOPS/STATUS',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={"text":"Deal {{$json.dealId || $json.id}} marked {{$json.health}} (score {{$json.dealRiskScore}})."}'
          },
          id: 'notify_revops_channel',
          name: 'Notify RevOps Channel',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [2270, 420]
        }
      ],
      connections: {
        '6 Hour Trigger': {
          main: [[{ node: 'Fetch Stale Deals', type: 'main', index: 0 }]]
        },
        'Fetch Stale Deals': {
          main: [[{ node: 'Enrich Company Profile', type: 'main', index: 0 }]]
        },
        'Enrich Company Profile': {
          main: [[{ node: 'Deterministic Deal Health Scoring', type: 'main', index: 0 }]]
        },
        'Deterministic Deal Health Scoring': {
          main: [
            [{ node: 'AI Deal Risk Analyst', type: 'main', index: 0 }],
            [{ node: 'Merge Deal Risk Signals', type: 'main', index: 0 }]
          ]
        },
        'AI Deal Risk Analyst': {
          main: [[{ node: 'Parse AI Deal Risk', type: 'main', index: 0 }]]
        },
        'Parse AI Deal Risk': {
          main: [[{ node: 'Merge Deal Risk Signals', type: 'main', index: 1 }]]
        },
        'Merge Deal Risk Signals': {
          main: [[{ node: 'Final Deal Risk Decision', type: 'main', index: 0 }]]
        },
        'Final Deal Risk Decision': {
          main: [[{ node: 'At Risk Deal?', type: 'main', index: 0 }]]
        },
        'At Risk Deal?': {
          main: [
            [
              { node: 'Create Rescue Task', type: 'main', index: 0 },
              { node: 'Upsert CRM Health Fields', type: 'main', index: 0 }
            ],
            [{ node: 'Upsert CRM Health Fields', type: 'main', index: 0 }]
          ]
        },
        'Upsert CRM Health Fields': {
          main: [[{ node: 'Notify RevOps Channel', type: 'main', index: 0 }]]
        }
      }
    }
  }
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

console.log(`Generated ${workflows.length} workflows in public and repo mirrors.`);
