// Leonida Trophy Guide — gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide is this directory's app/ folder: plain static files a desktop
// browser loads offline (app/index.html and its module, the trophy data in
// app/data/trophies.json, no library and no network request). This program hands
// it in: it copies app/ and screenshots/ from beside this file to /output and
// writes /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library.
//
// The guide itself is a tracker for the 55 PlayStation 5 trophies of Grand Theft
// Auto VI: every trophy with its official name, description and grade, a
// checklist saved in the browser, export and import, filters by kind and grade,
// a spoiler setting, a roadmap to the platinum, missable flags, and a guide to
// each trophy in our own words, with its sources.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The entry is nothing without its page, so refuse to hand in a broken tree.
const indexHtml = join(here, 'app', 'index.html');
if (!existsSync(indexHtml)) {
  throw new Error('app/index.html is missing; nothing to hand in');
}

mkdirSync(out, { recursive: true });

// The grader runs this program more than once into the same /output, and the
// repository it reads from is read-only — so a copy inherits read-only modes.
// Clear each destination first, or the second run fails with EACCES at cpSync.
rmSync(join(out, 'app'), { recursive: true, force: true });
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
rmSync(join(out, 'dossier.json'), { force: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Count what was handed in, so a silent empty copy is caught here, not later.
function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return n;
}
const appFiles = countFiles(join(out, 'app'));
const shots = existsSync(join(out, 'screenshots'))
  ? readdirSync(join(out, 'screenshots')).filter((f) => !f.startsWith('.')).length
  : 0;
if (appFiles === 0) throw new Error('app/ copied empty');
if (shots < 3 || shots > 4) throw new Error(`expected 3 or 4 screenshots, found ${shots}`);

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json).
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

const dossierBytes = statSync(dossierPath).size;
if (dossierBytes > 1572864) throw new Error(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
console.log(`handed in ${appFiles} app files and ${shots} screenshots; dossier.json is ${dossierBytes} bytes`);
