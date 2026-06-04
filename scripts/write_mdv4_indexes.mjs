#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FOLDERS = [
  { dir: 'src/prism_squad_v4', title: 'PRISM SQUAD Core', csv: 'public/*.csv (DEV §14·15)' },
  { dir: 'src/eventSystem/tycoonSeason/mdv4', title: 'Tycoon Season', csv: 'public/event/tycoonSeason/' },
  { dir: 'src/eventSystem/Lava Quest _game_end/mdv4', title: 'Lava Quest', csv: 'public/event/lavaQuest/' },
  { dir: 'src/eventSystem/prize-drop_end/mdv4', title: 'Prize Drop', csv: 'public/event/prizeDrop/game_data/' },
  { dir: 'src/eventSystem/Archery Arena_game_end/mdv4', title: 'Archery Arena', csv: 'public/event/archeryArena/' },
  { dir: 'src/eventSystem/mallMarvels/mdv4', title: 'Mall Marvels', csv: 'public/event/mallMarvels/' },
  { dir: 'src/eventSystem/driversJoy/mdv4', title: "Driver's Joy", csv: 'public/event/driversJoy/' },
];

for (const { dir, title, csv } of FOLDERS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  const files = fs.readdirSync(abs).filter(f => f.endsWith('.md')).sort();
  const body = `---
doc_generation: mdv4
---

# ${title} — mdv4 폴더 안내

| 항목 | 값 |
|------|-----|
| CSV SSoT | \`${csv}\` → **DEV §14** |
| CSS | **DESIGN** 끝 Appendix (있는 모듈) |
| 소스 | **RECIPE_CODE** = 추론 위험 구간 **샘플** (전 repo 아님) |

## 이 폴더 파일

${files.map(f => `- \`${f}\``).join('\n')}

## 읽기 순서

1. GAME_*_v4.md
2. DESIGN_*_v4.md
3. DEV_*_v4.md (§14 CSV 확인)
4. RECIPE_* → RECIPE_CODE_*
`;
  fs.writeFileSync(path.join(abs, 'README_v4.md'), body);
  console.log('README_v4', dir);
}
