#!/usr/bin/env node
/**
 * Static sanity checks on the lead workflow graph.
 * Ensures key nodes are reachable so "auto email" + "admin email" are wired.
 */

import fs from 'node:fs';
import path from 'node:path';

const WORKFLOW_PATH = path.resolve('automation/n8n-workflows/01-lead-capture-to-crm.json');
const workflow = JSON.parse(fs.readFileSync(WORKFLOW_PATH, 'utf8'));

const nodesByName = new Map(workflow.nodes.map((n) => [n.name, n]));
const edges = new Map(); // name -> Set<name>

for (const [from, spec] of Object.entries(workflow.connections || {})) {
  const add = (to) => {
    if (!to) return;
    if (!edges.has(from)) edges.set(from, new Set());
    edges.get(from).add(to);
  };

  // Most connections are under "main". Some nodes use other channels (ai_languageModel), which we ignore here.
  const main = spec?.main || [];
  for (const group of main) {
    for (const conn of group || []) add(conn?.node);
  }
}

function reachableFrom(start) {
  const seen = new Set();
  const q = [start];
  while (q.length) {
    const cur = q.shift();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);
    const outs = edges.get(cur);
    if (!outs) continue;
    for (const next of outs) if (!seen.has(next)) q.push(next);
  }
  return seen;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function main() {
  const start = 'Lead Webhook';
  assert(nodesByName.has(start), `Missing node: ${start}`);

  const seen = reachableFrom(start);

  const mustReach = [
    'Gmail Auto Reply',
    'Gmail Owner Lead Summary',
    'Respond Accepted Webhook',
    'Respond Invalid Webhook',
  ];

  for (const name of mustReach) {
    assert(seen.has(name), `Node not reachable from ${start}: ${name}`);
  }

  console.log('ok');
}

main();
