#!/usr/bin/env node
/**
 * Regression tests for the "guest auto reply" email preparation path.
 * Ensures we never attempt to send Gmail with an empty To field by:
 * - extracting email from either top-level payload or webhook .body
 * - producing guestEmail + guestEmailOkFlag correctly
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
  const validate = getNodeById('validate_lead_payload');
  const prepare = getNodeById('prepare_guest_auto_reply');
  const validateJs = String(validate.parameters?.jsCode || '');
  const prepareJs = String(prepare.parameters?.jsCode || '');

  // Case A: top-level payload
  {
    const lead = item({ full_name: 'Test User', email: 'TEST@Example.com', message: 'hello', source: 'website' });
    const v = await runCodeNode(validateJs, [lead]);
    assert(v?.[0]?.json?.isValidLead === 1, 'top-level: expected isValidLead=1');
    assert(v?.[0]?.json?.email === 'test@example.com', 'top-level: expected normalized email');

    const p = await runCodeNode(prepareJs, v);
    assert(p?.[0]?.json?.guestEmail === 'test@example.com', 'top-level: expected guestEmail');
    assert(p?.[0]?.json?.guestEmailOkFlag === 1, 'top-level: expected guestEmailOkFlag=1');
  }

  // Case B: webhook body nesting (n8n webhook can expose body under .body)
  {
    const leadBody = { full_name: 'Body User', email: 'body.user@example.com', message: 'hello', source: 'website' };
    const lead = item({ headers: { host: 'example' }, body: leadBody });
    const v = await runCodeNode(validateJs, [lead]);
    assert(v?.[0]?.json?.isValidLead === 1, 'body: expected isValidLead=1');
    assert(v?.[0]?.json?.email === 'body.user@example.com', 'body: expected extracted email');

    const p = await runCodeNode(prepareJs, v);
    assert(p?.[0]?.json?.guestEmail === 'body.user@example.com', 'body: expected guestEmail');
    assert(p?.[0]?.json?.guestEmailOkFlag === 1, 'body: expected guestEmailOkFlag=1');
  }

  // Case C: invalid email should not be ok
  {
    const lead = item({ full_name: 'Bad Email', email: 'not-an-email', message: 'hello', source: 'website' });
    const v = await runCodeNode(validateJs, [lead]);
    assert(v?.[0]?.json?.isValidLead === 0, 'invalid-email: expected isValidLead=0');
    assert(Array.isArray(v?.[0]?.json?.validationErrors), 'invalid-email: expected validationErrors array');

    const p = await runCodeNode(prepareJs, v);
    assert(p?.[0]?.json?.guestEmailOkFlag === 0, 'invalid-email: expected guestEmailOkFlag=0');
  }

  console.log('ok');
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});

