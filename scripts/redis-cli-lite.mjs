#!/usr/bin/env node
/**
 * Minimal Redis CLI over RESP (no external deps).
 *
 * Usage (env-driven):
 *   REDIS_HOST=... REDIS_PORT=... REDIS_USER=default REDIS_PASSWORD=... node scripts/redis-cli-lite.mjs ping
 *   ... node scripts/redis-cli-lite.mjs get "some:key"
 *   ... node scripts/redis-cli-lite.mjs set "some:key" "value" 60   # optional ttl seconds
 *   ... node scripts/redis-cli-lite.mjs del "some:key"
 *   ... node scripts/redis-cli-lite.mjs delete-prefix "lead:dedupe:v2:"   # SCAN + DEL
 *
 * TLS:
 *   Set REDIS_TLS=true if your Redis endpoint requires TLS.
 */

import net from 'node:net';
import tls from 'node:tls';

const env = process.env;

const REDIS_HOST = String(env.REDIS_HOST || '').trim();
const REDIS_PORT = Number(env.REDIS_PORT || '');
const REDIS_USER = String(env.REDIS_USER || 'default').trim();
const REDIS_PASSWORD = String(env.REDIS_PASSWORD || '').trim();
const REDIS_TLS = String(env.REDIS_TLS || '').toLowerCase().trim();
const USE_TLS = REDIS_TLS === '1' || REDIS_TLS === 'true' || REDIS_TLS === 'yes';

if (!REDIS_HOST) {
  console.error('Missing REDIS_HOST');
  process.exit(2);
}
if (!Number.isFinite(REDIS_PORT) || REDIS_PORT <= 0) {
  console.error('Missing/invalid REDIS_PORT');
  process.exit(2);
}

const argv = process.argv.slice(2);
const cmd = (argv[0] || '').toLowerCase();

if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
  console.log(
    [
      'redis-cli-lite.mjs',
      '',
      'Commands:',
      '  ping',
      '  get <key>',
      '  set <key> <value> [ttlSeconds]',
      '  del <key>',
      '  scan-prefix <prefix>',
      '  delete-prefix <prefix>',
      '',
      'Env:',
      '  REDIS_HOST, REDIS_PORT, REDIS_USER (default), REDIS_PASSWORD, REDIS_TLS',
    ].join('\n'),
  );
  process.exit(0);
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
    if (buf.slice(end, end + 2).toString('utf8') !== '\r\n') throw new Error('Invalid bulk terminator');
    return { value: data, next: end + 2 };
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

  if (REDIS_PASSWORD) {
    // ACL auth (Redis 6+): AUTH <username> <password>
    await client.command('AUTH', REDIS_USER || 'default', REDIS_PASSWORD);
  }

  return client;
}

async function main() {
  const client = await connect();

  try {
    if (cmd === 'ping') {
      const res = await client.command('PING');
      console.log(res);
      return;
    }

    if (cmd === 'get') {
      const key = argv[1];
      if (!key) throw new Error('Usage: get <key>');
      const res = await client.command('GET', key);
      console.log(res === null ? '(nil)' : res);
      return;
    }

    if (cmd === 'set') {
      const key = argv[1];
      const value = argv[2];
      const ttlRaw = argv[3];
      if (!key || value === undefined) throw new Error('Usage: set <key> <value> [ttlSeconds]');
      if (ttlRaw !== undefined) {
        const ttl = Number(ttlRaw);
        if (!Number.isFinite(ttl) || ttl <= 0) throw new Error('ttlSeconds must be a positive number');
        const res = await client.command('SET', key, value, 'EX', String(ttl));
        console.log(res);
        return;
      }
      const res = await client.command('SET', key, value);
      console.log(res);
      return;
    }

    if (cmd === 'del') {
      const key = argv[1];
      if (!key) throw new Error('Usage: del <key>');
      const res = await client.command('DEL', key);
      console.log(res);
      return;
    }

    if (cmd === 'scan-prefix' || cmd === 'delete-prefix') {
      const prefix = argv[1];
      if (!prefix) throw new Error(`Usage: ${cmd} <prefix>`);

      let cursor = '0';
      let total = 0;
      do {
        // SCAN <cursor> MATCH <pattern> COUNT 1000
        const res = await client.command('SCAN', cursor, 'MATCH', `${prefix}*`, 'COUNT', '1000');
        const nextCursor = Array.isArray(res) ? String(res[0]) : '0';
        const keys = Array.isArray(res) && Array.isArray(res[1]) ? res[1].map(String) : [];

        if (cmd === 'scan-prefix') {
          for (const k of keys) console.log(k);
        } else {
          // Delete in manageable batches.
          for (let i = 0; i < keys.length; i += 200) {
            const batch = keys.slice(i, i + 200);
            if (!batch.length) continue;
            await client.command('DEL', ...batch);
            total += batch.length;
          }
        }

        cursor = nextCursor;
      } while (cursor !== '0');

      if (cmd === 'delete-prefix') console.log(`deleted=${total}`);
      return;
    }

    throw new Error(`Unknown command: ${cmd}`);
  } finally {
    await client.quit();
  }
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});

