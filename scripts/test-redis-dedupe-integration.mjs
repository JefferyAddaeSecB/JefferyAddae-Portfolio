#!/usr/bin/env node
/**
 * Integration test against a Redis endpoint to ensure the v2 dedupe scheme behaves:
 * - First time: NOT duplicate
 * - Second time (same key): duplicate
 * - Different email: different key => NOT duplicate
 *
 * Requires env:
 *   REDIS_HOST, REDIS_PORT, REDIS_USER (default), REDIS_PASSWORD
 *   REDIS_TLS (optional)
 */

import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import tls from 'node:tls';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const env = process.env;

const REDIS_HOST = String(env.REDIS_HOST || '').trim();
const REDIS_PORT = Number(env.REDIS_PORT || '');
const REDIS_USER = String(env.REDIS_USER || 'default').trim();
const REDIS_PASSWORD = String(env.REDIS_PASSWORD || '').trim();
const REDIS_TLS = String(env.REDIS_TLS || '').toLowerCase().trim();
const USE_TLS = REDIS_TLS === '1' || REDIS_TLS === 'true' || REDIS_TLS === 'yes';

if (!REDIS_HOST || !Number.isFinite(REDIS_PORT) || !REDIS_PASSWORD) {
  console.error('Missing REDIS_HOST/REDIS_PORT/REDIS_PASSWORD');
  process.exit(2);
}

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

function encodeBulkString(str) {
  const buf = Buffer.from(String(str), 'utf8');
  return Buffer.concat([Buffer.from(`$${buf.length}\r\n`, 'utf8'), buf, Buffer.from('\r\n', 'utf8')]);
}

function encodeArray(parts) {
  const chunks = [Buffer.from(`*${parts.length}\r\n`, 'utf8')];
  for (const part of parts) chunks.push(encodeBulkString(part));
  return Buffer.concat(chunks);
}

function readLine(buf, offset) {
  const idx = buf.indexOf('\r\n', offset);
  if (idx === -1) return null;
  const line = buf.slice(offset, idx).toString('utf8');
  return { line, next: idx + 2 };
}

function parseOne(buf, offset = 0) {
  if (offset >= buf.length) return null;
  const prefix = String.fromCharCode(buf[offset]);

  if (prefix === '+' || prefix === '-' || prefix === ':') {
    const res = readLine(buf, offset + 1);
    if (!res) return null;
    if (prefix === '+') return { value: res.line, next: res.next };
    if (prefix === '-') return { value: new Error(res.line), next: res.next };
    return { value: Number(res.line), next: res.next };
  }

  if (prefix === '$') {
    const header = readLine(buf, offset + 1);
    if (!header) return null;
    const len = Number(header.line);
    if (!Number.isFinite(len)) throw new Error(`Invalid bulk length: ${header.line}`);
    if (len === -1) return { value: null, next: header.next };
    const start = header.next;
    const end = start + len;
    if (buf.length < end + 2) return null;
    const data = buf.slice(start, end).toString('utf8');
    return { value: data, next: end + 2 + 0 }; // skip \r\n already present
  }

  if (prefix === '*') {
    const header = readLine(buf, offset + 1);
    if (!header) return null;
    const count = Number(header.line);
    if (!Number.isFinite(count)) throw new Error(`Invalid array count: ${header.line}`);
    if (count === -1) return { value: null, next: header.next };
    let next = header.next;
    const arr = [];
    for (let i = 0; i < count; i += 1) {
      const parsed = parseOne(buf, next);
      if (!parsed) return null;
      arr.push(parsed.value);
      next = parsed.next;
    }
    return { value: arr, next };
  }

  throw new Error(`Unsupported RESP prefix: ${prefix}`);
}

class RedisClientLite {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.pending = [];

    socket.on('data', (chunk) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      while (true) {
        const parsed = parseOne(this.buffer, 0);
        if (!parsed) break;
        this.buffer = this.buffer.slice(parsed.next);
        const waiter = this.pending.shift();
        if (!waiter) continue;
        if (parsed.value instanceof Error) waiter.reject(parsed.value);
        else waiter.resolve(parsed.value);
      }
    });

    socket.on('error', (err) => {
      while (this.pending.length) this.pending.shift()?.reject(err);
    });
  }

  command(...args) {
    const payload = encodeArray(args);
    return new Promise((resolve, reject) => {
      this.pending.push({ resolve, reject });
      this.socket.write(payload);
    });
  }

  async quit() {
    try {
      await this.command('QUIT');
    } catch (e) {}
    this.socket.end();
  }
}

async function connect() {
  const socket = USE_TLS
    ? tls.connect({ host: REDIS_HOST, port: REDIS_PORT, servername: REDIS_HOST })
    : net.connect({ host: REDIS_HOST, port: REDIS_PORT });

  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('error', reject);
  });

  const client = new RedisClientLite(socket);
  await client.command('AUTH', REDIS_USER || 'default', REDIS_PASSWORD);
  return client;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function item(json) {
  return { json };
}

async function main() {
  const validate = getNodeById('validate_lead_payload');
  const validateJs = String(validate.parameters?.jsCode || '');
  const markDup = getNodeById('mark_duplicate_status');
  const markDupJs = String(markDup.parameters?.jsCode || '');

  // Use a unique "source" so we don't collide with real leads.
  const msg = `__codex_test__ ${Date.now()}`;

  const leadA = item({ full_name: 'Codex Test', email: 'codex.test.a@example.com', message: msg, source: 'codex-test' });
  const leadB = item({ full_name: 'Codex Test', email: 'codex.test.b@example.com', message: msg, source: 'codex-test' });

  const [aOut] = await runCodeNode(validateJs, [leadA]);
  const [bOut] = await runCodeNode(validateJs, [leadB]);

  const keyA = `lead:dedupe:v2:${String(aOut?.json?.idempotencyKey || '')}`;
  const keyB = `lead:dedupe:v2:${String(bOut?.json?.idempotencyKey || '')}`;
  assert(keyA !== keyB, 'expected different dedupe keys for different emails');

  const client = await connect();

  try {
    // Clean both keys first.
    await client.command('DEL', keyA);
    await client.command('DEL', keyB);

    // A: first time -> no value -> not duplicate
    const aGet1 = await client.command('GET', keyA);
    const [aMark1] = await runCodeNode(markDupJs, [item({ ...aOut.json, dedupeEntry: aGet1 })]);
    assert(Number(aMark1?.json?.duplicateLeadFlag || 0) === 0, 'leadA first run should not be duplicate');

    // Set A key using the workflow's v2 value format.
    const aVal = JSON.stringify({ v: 1, firstSeenAt: String(aOut.json.receivedAt || new Date().toISOString()), email: String(aOut.json.email || ''), key: String(aOut.json.idempotencyKey || '') });
    await client.command('SET', keyA, aVal, 'EX', '120');

    const aGet2 = await client.command('GET', keyA);
    const [aMark2] = await runCodeNode(markDupJs, [item({ ...aOut.json, dedupeEntry: aGet2 })]);
    assert(Number(aMark2?.json?.duplicateLeadFlag || 0) === 1, 'leadA second run should be duplicate');

    // B: different email/key -> should not be duplicate
    const bGet1 = await client.command('GET', keyB);
    const [bMark1] = await runCodeNode(markDupJs, [item({ ...bOut.json, dedupeEntry: bGet1 })]);
    assert(Number(bMark1?.json?.duplicateLeadFlag || 0) === 0, 'leadB first run should not be duplicate');

    console.log('ok');
  } finally {
    // Best-effort cleanup to avoid leaving test keys around (even though they expire).
    try {
      await client.command('DEL', keyA);
      await client.command('DEL', keyB);
    } catch (e) {}
    await client.quit();
  }
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
