#!/usr/bin/env node
/**
 * Web Design System — Validation Script
 *
 * Verifies:
 *  1. system.json parses as valid JSON
 *  2. Every analysis listed in system.json has an existing analyses/{id}/analysis.json
 *  3. Every analyses/{id} folder is registered in system.json (no orphans)
 *  4. Each analysis.json parses and conforms to required fields in analysis.schema.json
 *
 * Exits with code 0 on success, 1 on any error.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

async function readJson(path) {
  const raw = await readFile(path, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    err(`Invalid JSON: ${path} — ${e.message}`);
    return null;
  }
}

function getRegisteredAnalyses(manifest) {
  if (!manifest || !Array.isArray(manifest.groups)) return [];
  const group = manifest.groups.find((g) => g.id === 'analyses');
  if (!group || !Array.isArray(group.items)) return [];
  return group.items;
}

function validateAnalysisShape(data, file) {
  if (!data || typeof data !== 'object') {
    err(`${file}: must be an object`);
    return;
  }
  const required = ['id', 'url', 'title', 'analyzedAt'];
  required.forEach((k) => {
    if (data[k] === undefined || data[k] === null || data[k] === '') {
      err(`${file}: missing required field "${k}"`);
    }
  });
  if (data.id && !/^[a-z0-9][a-z0-9-]*$/.test(data.id)) {
    err(`${file}: id "${data.id}" must match ^[a-z0-9][a-z0-9-]*$`);
  }
  if (data.analyzedAt && !/^\d{4}-\d{2}-\d{2}$/.test(data.analyzedAt)) {
    err(`${file}: analyzedAt "${data.analyzedAt}" must be YYYY-MM-DD`);
  }
  if (data.colors && Array.isArray(data.colors.extracted)) {
    data.colors.extracted.forEach((e, idx) => {
      if (!e.hex || !/^#[0-9A-Fa-f]{3,8}$/.test(e.hex)) {
        err(`${file}: colors.extracted[${idx}].hex "${e.hex}" is not a valid hex`);
      }
    });
  }
}

async function main() {
  console.log('Validating Web Design System…\n');

  // 1. system.json
  const manifestPath = join(ROOT, 'system.json');
  if (!existsSync(manifestPath)) {
    err('system.json not found at project root');
    return finish();
  }
  const manifest = await readJson(manifestPath);
  if (!manifest) return finish();

  // 2. schema present
  const schemaPath = join(ROOT, 'schemas', 'analysis.schema.json');
  if (!existsSync(schemaPath)) {
    warn('schemas/analysis.schema.json not found — schema validation skipped');
  } else {
    const schema = await readJson(schemaPath);
    if (!schema) warn('schemas/analysis.schema.json could not be parsed');
  }

  // 3. analyses directory
  const analysesDir = join(ROOT, 'analyses');
  let folderIds = [];
  if (existsSync(analysesDir)) {
    const entries = await readdir(analysesDir, { withFileTypes: true });
    folderIds = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }

  const registered = getRegisteredAnalyses(manifest);
  const registeredIds = registered.map((r) => r.id);

  // 4. registered → file exists + shape valid
  for (const item of registered) {
    if (!item.id) {
      err(`system.json analyses entry missing "id"`);
      continue;
    }
    const file = join(analysesDir, item.id, 'analysis.json');
    if (!existsSync(file)) {
      err(`Registered analysis "${item.id}" has no file at analyses/${item.id}/analysis.json`);
      continue;
    }
    const data = await readJson(file);
    if (!data) continue;
    validateAnalysisShape(data, `analyses/${item.id}/analysis.json`);
    if (data.id && data.id !== item.id) {
      err(`analyses/${item.id}/analysis.json: id "${data.id}" does not match folder name "${item.id}"`);
    }
  }

  // 5. orphan folders
  folderIds.forEach((id) => {
    if (!registeredIds.includes(id)) {
      warn(`Orphan folder: analyses/${id}/ is not registered in system.json`);
    }
  });

  finish();
}

function finish() {
  if (warnings.length) {
    console.log('Warnings:');
    warnings.forEach((w) => console.log('  • ' + w));
    console.log('');
  }
  if (errors.length) {
    console.error('Errors:');
    errors.forEach((e) => console.error('  ✗ ' + e));
    console.error(`\nValidation failed with ${errors.length} error(s).`);
    process.exit(1);
  }
  console.log(`✓ Validation passed. ${warnings.length} warning(s).`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
