#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRef = process.env.SUPABASE_PROJECT_REF || 'fqcuhetsqwobuxuocwub';
const token = process.env.SUPABASE_ACCESS_TOKEN;
const migrationPath = resolve('supabase/migrations/20260717000000_blackout_backend.sql');

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN. Create one in Supabase Dashboard > Account > Access Tokens.');
  process.exit(1);
}

const sql = await readFile(migrationPath, 'utf8');
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`Supabase schema apply failed (${res.status}):`);
  console.error(body);
  process.exit(1);
}

console.log(`Supabase schema applied to project ${projectRef}.`);
if (body && body !== 'null') console.log(body);
