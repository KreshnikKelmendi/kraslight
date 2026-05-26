import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const installed = require('next/package.json').version;

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const wanted = pkg.dependencies?.next ?? '15.5.18';

function parse(v) {
  return v.split('.').map((n) => Number(n));
}

function gte(a, b) {
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

const minSafe = [15, 5, 18];
const installedParts = parse(installed);

if (!gte(installedParts, minSafe)) {
  console.error(
    `\n❌ Next.js ${installed} is blocked on Vercel (need >= 15.5.18).\n` +
      `   package.json wants: ${wanted}\n` +
      `   Run: npm install next@15.5.18 eslint-config-next@15.5.18\n`
  );
  process.exit(1);
}

console.log(`✓ Next.js ${installed} (safe for Vercel deploy)`);
