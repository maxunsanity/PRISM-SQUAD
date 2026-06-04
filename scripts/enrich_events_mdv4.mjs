#!/usr/bin/env node
/** 이벤트 mdv4 DESIGN에 style.css 전문 부록 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const pairs = [
  ['src/eventSystem/Lava Quest _game_end', 'DESIGN_lava_quest_v4.md', 'src/style.css'],
  ['src/eventSystem/prize-drop_end', 'DESIGN_prize_drop_v4.md', 'src/style.css'],
  ['src/eventSystem/Archery Arena_game_end', 'DESIGN_archery_arena_v4.md', 'src/style.css'],
];

for (const [base, designName, cssRel] of pairs) {
  const designPath = path.join(ROOT, base, 'mdv4', designName);
  const cssPath = path.join(ROOT, base, cssRel);
  if (!fs.existsSync(designPath) || !fs.existsSync(cssPath)) continue;
  let design = fs.readFileSync(designPath, 'utf8');
  const tag = '## Appendix — style.css full (SSoT)';
  if (design.includes(tag)) continue;
  const css = fs.readFileSync(cssPath, 'utf8').trimEnd();
  design += `\n\n---\n\n${tag}\n\n\`\`\`css\n${css}\n\`\`\`\n`;
  fs.writeFileSync(designPath, design);
  console.log('css appended', designPath);
}

// tycoon RECIPE_CODE
const tycoonRc = path.join(ROOT, 'src/eventSystem/tycoonSeason/mdv4/RECIPE_CODE_tycoon_season.md');
const ec = fs.readFileSync(path.join(ROOT, 'src/eventSystem/tycoonSeason/core/EventController.ts'), 'utf8');
const bridge = fs.readFileSync(path.join(ROOT, 'src/eventSystem/tycoonSeason/host/EventBridge.ts'), 'utf8');
fs.writeFileSync(tycoonRc, `---
doc_generation: mdv4
condense_policy: forbidden
---

# Tycoon Season — RECIPE_CODE (v4 source)

## EventBridge.ts (full)

\`\`\`typescript
${bridge.trimEnd()}
\`\`\`

## EventController.ts (full)

\`\`\`typescript
${ec.trimEnd()}
\`\`\`
`);
console.log('tycoon RECIPE_CODE', tycoonRc);

// mall / drivers controllers
for (const [mod, file] of [
  ['mallMarvels', 'MallMarvelsController.ts'],
  ['driversJoy', 'DriversJoyController.ts'],
]) {
  const p = path.join(ROOT, `src/eventSystem/${mod}/mdv4/RECIPE_CODE_${mod === 'mallMarvels' ? 'mall_marvels' : 'drivers_joy'}.md`);
  const src = fs.readFileSync(path.join(ROOT, `src/eventSystem/${mod}/core/${file}`), 'utf8');
  fs.writeFileSync(p, `---\ndoc_generation: mdv4\n---\n\n# ${mod} RECIPE_CODE\n\n\`\`\`typescript\n${src.trimEnd()}\n\`\`\`\n`);
  console.log('wrote', p);
}
