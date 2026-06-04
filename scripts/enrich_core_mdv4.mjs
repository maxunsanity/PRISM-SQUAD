#!/usr/bin/env node
/** 코어 mdv4: CSS 전문 · RECIPE_CODE 소스 · DEV 조립 섹션 삽입 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MDV4 = path.join(ROOT, 'src/prism_squad_v4');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}
function write(p, c) {
  fs.writeFileSync(p, c, 'utf8');
  console.log('wrote', path.relative(ROOT, p), `(${c.split('\n').length} lines)`);
}

function extractFile(relPath, label) {
  const fp = path.join(ROOT, relPath);
  if (!fs.existsSync(fp)) return `\n<!-- missing: ${relPath} -->\n`;
  const body = read(fp).trimEnd();
  return `\n## ${label}\n\n> SSoT: \`${relPath}\` — RECIPE_CODE v4. 임의 수정 금지.\n\n\`\`\`typescript\n${body}\n\`\`\`\n`;
}

// DESIGN + full style.css
const designPath = path.join(MDV4, 'DESIGN_prism_squad_v4.md');
let design = read(designPath);
const css = read(path.join(ROOT, 'src/style.css')).trimEnd();
const cssBlock = `\n\n---\n\n## 11. Quick Start — \`src/style.css\` 전문 (SSoT)\n\n> AI는 아래 CSS를 그대로 사용. 누락·임의 색 변경 금지.\n\n\`\`\`css\n${css}\n\`\`\`\n`;
if (!design.includes('## 11. Quick Start — `src/style.css`')) {
  design = design.replace(/\n---\n\n## (?:10|11)\. Quick Start[\s\S]*$/m, '') + cssBlock;
  write(designPath, design);
}

// RECIPE_CODE
const recipeParts = [
  '# PRISM SQUAD Host — RECIPE_CODE.md (v4)\n',
  '---\n',
  'doc_generation: mdv4\n',
  'condense_policy: forbidden\n',
  'modify_policy: copy_only_from_repo\n',
  '---\n\n',
  '> 검증된 소스 전문. 경로만 참조하는 구현 금지.\n\n',
  extractFile('src/game/eventMinigameRegistry.ts', 'R-CORE-01 eventMinigameRegistry.ts'),
  extractFile('src/eventSystem/tycoonSeason/host/EventBridge.ts', 'R-CORE-02 EventBridge.ts'),
];

// 메서드명 기반 brace-매칭 발췌 (절대 줄번호 금지 — 코드 이동에도 안 깨짐)
function extractMethodByName(relPath, label, methodName) {
  const src = read(path.join(ROOT, relPath));
  if (!src) return `\n## ${label}\n\n<!-- missing: ${relPath} -->\n`;
  const esc = methodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('\\n(\\s+)(?:public |private |protected |async |static )*' + esc + '\\s*[(<]');
  const m = re.exec(src);
  if (!m) return `\n## ${label}\n\n<!-- ${methodName}() 정의 미발견: ${relPath} -->\n`;
  const start = m.index + 1; // leading \n 제거
  let i = src.indexOf('{', m.index);
  let depth = 0, end = src.length;
  for (; i < src.length && i >= 0; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  return `\n## ${label}\n\n> \`${relPath}\` — ${methodName}() (메서드명 매칭)\n\n\`\`\`typescript\n${src.slice(start, end)}\n\`\`\`\n`;
}

recipeParts.push(
  extractMethodByName('src/game/GameCore.ts', 'R-CORE-03a attachEventBridge', 'attachEventBridge'),
  extractMethodByName('src/game/GameCore.ts', 'R-CORE-03b _onEnemyDeath (onEnemyKilled 적립)', '_onEnemyDeath'),
  extractMethodByName('src/game/GameCore.ts', 'R-CORE-03c _onBossDeath (보스 적립)', '_onBossDeath'),
  extractMethodByName('src/game/GameCore.ts', 'R-CORE-03d startLavaQuestMode', 'startLavaQuestMode'),
  extractMethodByName('src/game/GameCore.ts', 'R-CORE-03e grantReward (iframe 보상)', 'grantReward'),
);

// App.tsx excerpts - attach + message + show hud
const appPath = path.join(ROOT, 'src/App.tsx');
const appFull = read(appPath);
const markers = [
  ['R-CORE-04 App.tsx — EventBridge 초기화', '/* 3) EventBridge 초기화', '}, [eventData]);'],
  ['R-CORE-05 App.tsx — postMessage 브릿지', '/* 4) 라바 퀘스트 ↔ 스퀘어 postMessage', 'window.addEventListener(\'message\', onMessage);'],
  ['R-CORE-06 App.tsx — showEventHud 분기', 'const iframeOpen = Boolean', 'const eventOverlayOpen = eventModalOpen'],
];
for (const [label, start, end] of markers) {
  const i0 = appFull.indexOf(start);
  const i1 = appFull.indexOf(end, i0);
  if (i0 < 0) continue;
  const chunk = appFull.slice(i0, i1 + end.length);
  recipeParts.push(`\n## ${label}\n\n\`\`\`typescript\n${chunk.trimEnd()}\n\`\`\`\n`);
}

recipeParts.push(
  extractFile('src/jsonRender/prismHudSpec.ts', 'R-CORE-07 prismHudSpec.ts'),
  extractFile('src/game/eventMinigameHost.ts', 'R-CORE-08 eventMinigameHost.ts'),
  extractFile('src/game/hudExternalStore.ts', 'R-CORE-09 hudExternalStore.ts ($state 전체 SSoT)'),
  extractFile('src/game/eventMinigameRegistry.ts', 'R-CORE-10 eventMinigameRegistry.ts (iframe 등록)'),
  '\n---\n\n조립 절차 전문: `ATTACH_MODULES_v4.md`\n',
);

write(path.join(MDV4, 'RECIPE_CODE_prism_squad.md'), recipeParts.join(''));

// DEV: insert attach pointer after section 1 if missing
const devPath = path.join(MDV4, 'DEV_prism_squad_v4.md');
let dev = read(devPath);
const attachInsert = `
---

## 2. 선택 모듈 조립 (있으면 붙임)

> **전문:** [\`ATTACH_MODULES_v4.md\`](./ATTACH_MODULES_v4.md)  
> 코어만 만들 때는 무시. 타이쿤·라바·세일 붙일 때 필수.

| module_id | v4 폴더 |
|-----------|---------|
| tycoon_season | \`src/eventSystem/tycoonSeason/mdv4/\` |
| lava | \`src/eventSystem/Lava Quest _game_end/mdv4/\` |
| prize | \`src/eventSystem/prize-drop_end/mdv4/\` |
| archery | \`src/eventSystem/Archery Arena_game_end/mdv4/\` |
| mall_marvels | \`src/eventSystem/mallMarvels/mdv4/\` |
| drivers_joy | \`src/eventSystem/driversJoy/mdv4/\` |

`;

if (!dev.includes('## 2. 선택 모듈 조립')) {
  dev = dev.replace(
    /(# PRISM SQUAD — DEV\.md[\s\S]*?## 1\. 스택[\s\S]*?\| 데이터 \| CSV \(public\/\) — 런타임 fetch \|\n\n)/,
    `$1${attachInsert}`,
  );
  dev = dev.replace(/## 2\. 파일 구조/g, '## 3. 파일 구조');
  dev = dev.replace(/## 3\. json-render/g, '## 4. json-render');
  dev = dev.replace(/## 4\. 상태 관리/g, '## 5. 상태 관리');
  dev = dev.replace(/## 5\. gameState/g, '## 6. gameState');
  dev = dev.replace(/## 6\. CSV 스키마/g, '## 7. CSV 스키마');
  dev = dev.replace(/## 6-bis\./g, '## 7-bis.');
  dev = dev.replace(/## 7\. gameState/g, '## 6. gameState');
  // fix double renumber - read dev and fix manually if broken
  write(devPath, dev);
}

// GAME: append attach pointer
const gamePath = path.join(MDV4, 'GAME_prism_squad_v4.md');
let game = read(gamePath);
if (!game.includes('ATTACH_MODULES_v4')) {
  game += `\n\n---\n\n## 연동 모듈 (선택 — v4)\n\n| 문서 | 내용 |\n|------|------|\n| [\`ATTACH_MODULES_v4.md\`](./ATTACH_MODULES_v4.md) | 있으면 붙이는 이벤트·iframe·세일 절차 |\n| 각 이벤트 \`mdv4/\` | 검증된 이벤트 GAME·DEV·DESIGN·RECIPE·CSV |\n\n코어 단독 플레이 가능. 이벤트 md 없으면 해당 모듈 구현·연동 **생략**.\n`;
  write(gamePath, game);
}

console.log('enrich_core_mdv4 done');
