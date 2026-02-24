#!/usr/bin/env node
/**
 * Quick regression tests for the lead dedupe logic embedded in the n8n workflow JSON.
 * Runs the Code node JS in a sandbox with mocked $input.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const WORKFLOW_PATH = path.resolve('automation/n8n-workflows/01-lead-capture-to-crm.json');
const workflow = JSON.parse(fs.readFileSync(WORKFLOW_PATH, 'utf8'));

function getNodeById(id) {
  const node = workflow.nodes.find((n) => n.id === id);
  if (!node) throw new Error(`Node not found: ${id}`);
  return node;
}

async function runCodeNode(jsCode, items) {
  const inputItems = Array.isArray(items) ? items : [];
  const sandbox = {
    $input: {
      all: () => inputItems,
      first: () => inputItems[0] ?? null,
    },
    Buffer,
    Date,
    console,
    require,
    globalThis,
    TextEncoder,
    Uint8Array,
  };

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const fn = new AsyncFunction(...Object.keys(sandbox), jsCode);
  return await fn(...Object.values(sandbox));
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function item(json) {
  return { json };
}

async function main() {
  // Validate that idempotencyKey changes for different emails.
  const validate = getNodeById('validate_lead_payload');
  const validateJs = String(validate.parameters?.jsCode || '');
  const lead1 = item({ full_name: 'Alex Example', email: 'alex.one@example.com', message: 'hello', source: 'website' });
  const lead2 = item({ full_name: 'Alex Example', email: 'alex.two@example.com', message: 'hello', source: 'website' });
  const validateOut = await runCodeNode(validateJs, [lead1, lead2]);
  assert(Array.isArray(validateOut) && validateOut.length === 2, 'validate: expected 2 output items');
  const k1 = String(validateOut[0]?.json?.idempotencyKey || '');
  const k2 = String(validateOut[1]?.json?.idempotencyKey || '');
  assert(k1 && k2, 'validate: missing idempotencyKey');
  assert(k1 !== k2, 'validate: idempotencyKey should differ for different emails');
  assert(k1.length >= 32 && k2.length >= 32, 'validate: idempotencyKey too short');

  // Redis dedupe has been removed from the workflow entirely (to prevent false duplicate classification).
  const hasRedisNode = workflow.nodes.some((n) => String(n.type || '').includes('n8n-nodes-base.redis'));
  assert(!hasRedisNode, 'expected no Redis nodes in workflow');

  const bannedNames = new Set([
    'Redis Get Lead Dedupe',
    'Redis Set Lead Dedupe',
    'Merge Lead Dedupe Context',
    'Mark Duplicate Status',
    'Duplicate Lead?',
    'Slack Duplicate Lead',
    'Respond Duplicate Webhook',
  ]);

  for (const n of workflow.nodes) {
    assert(!bannedNames.has(n.name), `unexpected dedupe node still present: ${n.name}`);
  }

  console.log('ok');
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
