/**
 * Build-time gate: parse toskana-data.json against the Zod schema and print a
 * readable report. Runs before `tsc`/`vite build` so a bad data edit never
 * reaches a built app.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tripDataSchema } from '../src/data/schema.js';
import { findGaps } from '../src/lib/gaps.js';

const dataPath = fileURLToPath(new URL('../toskana-data.json', import.meta.url));
const parsed = tripDataSchema.safeParse(JSON.parse(readFileSync(dataPath, 'utf8')));

if (!parsed.success) {
  console.error('\n✗ toskana-data.json şemaya uymuyor:\n');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.') || '(kök)'} — ${issue.message}`);
  }
  console.error('');
  process.exit(1);
}

const trip = parsed.data;
console.log(`\n✓ toskana-data.json geçerli — ${trip.days.length} gün, ${trip.trip.title}`);

const gaps = findGaps(trip);
if (gaps.length > 0) {
  console.log(`\n  ${gaps.length} veri boşluğu (uygulamada gösteriliyor, build engellenmiyor):`);
  for (const gap of gaps) {
    console.log(`  · [${gap.severity}] ${gap.where} — ${gap.what}`);
  }
}
console.log('');
