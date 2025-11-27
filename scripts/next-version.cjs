#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const semver = require('semver');

const releaseType = process.argv[2];
const allowed = new Set(['patch', 'minor', 'major']);

if (!allowed.has(releaseType)) {
  console.error('Usage: node scripts/next-version.cjs <patch|minor|major>');
  process.exit(1);
}

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);

const currentVersion = pkg.version ?? '0.0.0';

if (!semver.valid(currentVersion)) {
  console.error(`Invalid current version "${currentVersion}" in package.json`);
  process.exit(1);
}

const nextVersion = semver.inc(currentVersion, releaseType);

pkg.version = nextVersion;

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(nextVersion);
