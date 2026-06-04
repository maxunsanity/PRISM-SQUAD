---
doc_generation: mdv4
condense_policy: forbidden
---

# CSV — v4에서 할 일 / 안 할 일

## v4 문서 작업으로 **끝난 것** (추가 CSV 작업 불필요)

| 항목 | 상태 |
|------|------|
| **배포 CSV 전문** | 각 모듈 `DEV_*_v4.md` **§14 Deployed CSV Full Contents** = `public/` 파일과 동일 |
| **코어 CSV 목록** | `DEV_prism_squad_v4.md` **§14–15** — `data.ts` `CSV_PATHS` (호스트·이벤트 CSV 전문) |
| **이벤트 CSV** | tycoon 12종, lava/prize/archery/mall/drivers 각 public 경로 |
| **AI 규칙** | CSV 있으면 **그대로 fetch** — DEV에 적힌 수치로 임의 생성·변경 금지 |

→ **「v4 백화점에 CSV 넣기」** 는 **여기까지 완료**.  
→ AI가 게임 만들 때 **§14 블록 = SSoT** 면 됨.

---

## v4와 **별도**인 일 (나중·기획 결정 시)

아까 논의했던 **테이블 쪼개기** — 문서에 CSV 넣는 것과 다름.

| 제안 (미구현) | 목적 | 지금 |
|---------------|------|------|
| `prism_host_integration.csv` | 라바 보스 50초·postMessage·티켓 등 **코드 상수** 제거 | 코드에仍 하드코딩 |
| `tournament_bot_behavior.csv` | 타이쿤 봇 72%/8초 틱 | GAME.md·코드만 |
| 마블 DEFAULT fallback 제거 | CSV만 진실 | dev fallback 유지 |

이건 **repo에 새 CSV 파일 추가 + 로더 + 코드 수정** 작업.  
**mdv4 §14 복사만으로는 안 끝남.** 필요하면 **v5 또는 별도 밸런스 티켓**.

---

## 정리

| 질문 | 답 |
|------|-----|
| v4용 CSV 더 넣을 거 있어? | **없음** — §14에 이미 전부 |
| CSV 쪼개기 더 해? | **선택** — 재현 문서와 무관, 밸런스·호스트 리팩 때 |
| 퍼즐 bank JSON? | `public/event/prizeDrop/game_data/bank/` — DEV에 경로 명시됨. JSON 35개 **파일 통째** v4에 넣으면 용량 폭발 → **경로+규칙만** (기존 RECIPE) |

---

## 모듈별 CSV 경로 (fetch SSoT)

| module | directory |
|--------|-----------|
| core | `/public/*.csv` |
| tycoon | `/public/event/tycoonSeason/` |
| lava | `/public/event/lavaQuest/` |
| prize | `/public/event/prizeDrop/game_data/` |
| archery | `/public/event/archeryArena/` |
| mall | `/public/event/mallMarvels/` |
| drivers | `/public/event/driversJoy/` |
