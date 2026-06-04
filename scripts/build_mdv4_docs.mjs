#!/usr/bin/env node
/**
 * mdv4 문서 생성 — mdv3·src/*.md 복사 + public CSV 전문 부록
 * 함축 금지: v5 diff용 전량 보존
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ES = path.join(ROOT, 'src/eventSystem');

const V4_BANNER = `---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

`;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function read(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
  console.log('wrote', path.relative(ROOT, p));
}

function listCsv(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.csv'))
    .sort()
    .map(f => path.join(dir, f));
}

function csvAppendix(title, csvPaths) {
  let out = `\n\n---\n\n## ${title}\n\n`;
  out += `> **배포 SSoT.** AI는 이 내용을 임의 변경하지 말 것. 파일이 repo에 있으면 fetch 경로 그대로 사용.\n\n`;
  for (const fp of csvPaths) {
    const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
    const body = read(fp).trimEnd();
    out += `### \`${rel}\`\n\n\`\`\`csv\n${body}\n\`\`\`\n\n`;
  }
  return out;
}

function copyMdv3ToMdv4(folderName, csvPublicDir, extraCsvDirs = []) {
  const base = path.join(ES, folderName);
  const srcDir = path.join(base, 'mdv3');
  const dstDir = path.join(base, 'mdv4');
  if (!fs.existsSync(srcDir)) {
    console.warn('skip mdv3 missing', folderName);
    return;
  }
  ensureDir(dstDir);
  const csvPaths = [
    ...listCsv(path.join(ROOT, csvPublicDir)),
    ...extraCsvDirs.flatMap(d => listCsv(path.join(ROOT, d))),
  ];
  for (const name of fs.readdirSync(srcDir)) {
    if (!name.endsWith('.md')) continue;
    const src = path.join(srcDir, name);
    const dstName = name.replace(/_v4\.md$/, '_v4.md').replace(/\.md$/, (m) => {
      if (name.includes('_v4')) return m;
      return '_v4.md';
    });
    // keep original filename in mdv4 (same as mdv3 names)
    const dst = path.join(dstDir, name);
    let body = read(src);
    if (!body.startsWith('---\n')) body = V4_BANNER + body;
    else body = V4_BANNER + body.replace(/^---[\s\S]*?---\n\n?/, '');

    if (name.startsWith('DEV_') && csvPaths.length) {
      body += csvAppendix('14. Deployed CSV Full Contents (public SSoT)', csvPaths);
    }
    if (name === 'HANDOFF_archery_arena_v4.md') {
      body += csvAppendix('Appendix. Deployed CSV (archeryArena)', csvPaths);
    }
    write(dst, body);
  }
}

function buildCoreMdv4() {
  const dst = path.join(ROOT, 'src/prism_squad_v4');
  ensureDir(dst);

  const coreCsvDir = path.join(ROOT, 'public');
  const coreCsvs = listCsv(coreCsvDir);
  const eventCsvs = [
    ...listCsv(path.join(ROOT, 'public/event/tycoonSeason')),
    ...listCsv(path.join(ROOT, 'public/event/lavaQuest')),
    ...listCsv(path.join(ROOT, 'public/event/prizeDrop/game_data')),
    ...listCsv(path.join(ROOT, 'public/event/archeryArena')),
    ...listCsv(path.join(ROOT, 'public/event/mallMarvels')),
    ...listCsv(path.join(ROOT, 'public/event/driversJoy')),
  ];

  const pairs = [
    ['GAME.md', 'GAME_prism_squad_v4.md'],
    ['DESIGN.md', 'DESIGN_prism_squad_v4.md'],
    ['DEV.md', 'DEV_prism_squad_v4.md'],
  ];
  for (const [srcName, dstName] of pairs) {
    let body = read(path.join(ROOT, 'src', srcName));
    body = V4_BANNER + body;
    if (dstName.startsWith('DEV_')) {
      body += csvAppendix('14. Host Core CSV Full Contents (public/*.csv)', coreCsvs);
      body += csvAppendix('15. Attached Event CSV Full Contents (public/event/*)', eventCsvs);
      body += read(path.join(ROOT, 'src/eventSystem/SALES_EVENTS_PLAN.md'));
      body += '\n\n---\n\n';
      body += read(path.join(ROOT, 'src/eventSystem/EVENT_MANAGEMENT.md'));
    }
    write(path.join(dst, dstName), body);
  }

  // Host architecture doc
  let hostArch = V4_BANNER + read(path.join(ROOT, 'HANDOFF.md'));
  hostArch += '\n\n---\n\n## Appendix. SALES_EVENTS_PLAN (full)\n\n';
  hostArch += read(path.join(ROOT, 'src/eventSystem/SALES_EVENTS_PLAN.md'));
  write(path.join(dst, 'HOST_ARCHITECTURE_v4.md'), hostArch);

  // RECIPE stub from GAME anti-patterns + DEV json-render
  let recipe = V4_BANNER + `# PRISM SQUAD Host — RECIPE.md (v4)\n\n`;
  recipe += read(path.join(ROOT, 'src/GAME.md')).split('## Anti-Patterns')[1] || '';
  recipe += '\n\n---\n\n## json-render 3종 세트 (호스트 HUD)\n\n';
  recipe += read(path.join(ROOT, 'src/DEV.md')).split('## 3. json-render')[1]?.split('## 4.')[0] || '';
  write(path.join(dst, 'RECIPE_prism_squad.md'), recipe);

  write(path.join(dst, 'RECIPE_CODE_prism_squad.md'), V4_BANNER + `# PRISM SQUAD Host — RECIPE_CODE.md (v4)\n\n> 구현 스니펫은 \`src/game/GameCore.ts\`, \`src/jsonRender/registry.tsx\`, \`src/App.tsx\` 를 SSoT로 복사. v4 DEV §9 EventBridge 참조.\n\n` + read(path.join(ROOT, 'src/DEV.md')).split('## 9. EventBridge')[1]?.split('## 10.')[0] || '');
}

function buildModuleFromLegacy(folder, prefix, files, csvPublicDir, extra = {}) {
  const dst = path.join(ES, folder, 'mdv4');
  ensureDir(dst);
  const csvPaths = listCsv(path.join(ROOT, csvPublicDir));

  for (const [srcRel, dstName] of files) {
    const srcPath = path.join(ROOT, srcRel);
    let body = read(srcPath);
    if (!body) continue;
    body = V4_BANNER + body.replace(/^---[\s\S]*?---\n\n?/, '');
    if (dstName.startsWith('DEV_') && csvPaths.length) {
      body += csvAppendix('14. Deployed CSV Full Contents (public SSoT)', csvPaths);
    }
    if (extra.appendToDev && dstName.startsWith('DEV_') && extra.appendToDev) {
      body += '\n\n---\n\n' + extra.appendToDev;
    }
    write(path.join(dst, dstName), body);
  }
}

// mdv3 clones
copyMdv3ToMdv4('Lava Quest _game_end', 'public/event/lavaQuest');
copyMdv3ToMdv4('prize-drop_end', 'public/event/prizeDrop/game_data', ['src/eventSystem/prize-drop_end/game_data']);
copyMdv3ToMdv4('Archery Arena_game_end', 'public/event/archeryArena', ['src/eventSystem/Archery Arena_game_end']);

buildCoreMdv4();

buildModuleFromLegacy('tycoonSeason', 'tycoon', [
  ['src/eventSystem/tycoonSeason/GAME.md', 'GAME_tycoon_season_v4.md'],
  ['src/eventSystem/tycoonSeason/DESIGN.md', 'DESIGN_tycoon_season_v4.md'],
  ['src/eventSystem/tycoonSeason/DEV.md', 'DEV_tycoon_season_v4.md'],
  ['src/eventSystem/tycoonSeason/HANDOFF.md', 'HANDOFF_tycoon_season_v4.md'],
], 'public/event/tycoonSeason');

buildModuleFromLegacy('mallMarvels', 'mm', [
  ['src/eventSystem/mallMarvels/GAME.md', 'GAME_mall_marvels_v4.md'],
  ['src/eventSystem/mallMarvels/DESIGN.md', 'DESIGN_mall_marvels_v4.md'],
  ['src/eventSystem/mallMarvels/DEV.md', 'DEV_mall_marvels_v4.md'],
], 'public/event/mallMarvels');

buildModuleFromLegacy('driversJoy', 'dj', [
  ['src/eventSystem/driversJoy/GAME.md', 'GAME_drivers_joy_v4.md'],
  ['src/eventSystem/driversJoy/DESIGN.md', 'DESIGN_drivers_joy_v4.md'],
  ['src/eventSystem/driversJoy/DEV.md', 'DEV_drivers_joy_v4.md'],
], 'public/event/driversJoy');

console.log('mdv4 build done — entry: .cursor/skills/prism-squad-v4/SKILL.md');
// 코어 CSS·RECIPE_CODE·ATTACH 보강
spawnSync('node', ['scripts/enrich_core_mdv4.mjs'], { cwd: ROOT, stdio: 'inherit' });
spawnSync('node', ['scripts/enrich_events_mdv4.mjs'], { cwd: ROOT, stdio: 'inherit' });
spawnSync('node', ['scripts/write_mdv4_indexes.mjs'], { cwd: ROOT, stdio: 'inherit' });
