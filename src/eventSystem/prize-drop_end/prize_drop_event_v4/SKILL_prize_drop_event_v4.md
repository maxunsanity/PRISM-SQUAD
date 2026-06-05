---
name: prize-drop-v4
description: Prize Drop(구슬 드롭 핀볼 아케이드) 이벤트 미니게임을 MD v4 + CSV만으로 재현할 때의 진입점 — 읽기 순서, 3공정 파이프라인(보드→bank→재생), 비주얼(2D 페이퍼 아케이드), 에셋 교체, json-render, PRISM SQUAD 코어 연동/빌드 스코프, v4 규칙.
doc_generation: mdv4
condense_policy: forbidden
---

# SKILL — Prize Drop 이벤트 미니게임 v4 진입점

> **사용법:** "이 폴더(`src/eventSystem/prize-drop_end/prize_drop_event_v4/`)의 `SKILL_prize_drop_event_v4.md` 읽고 게임 만들어" → 이 문서 1개로 Prize Drop 재현 경로가 다 이어진다.
> **함축 금지:** 이 v4 문서들은 기획서 원본이자 재현 계약이다. 요약·삭제·임의 수치 변경 금지 (함축은 v5에서). 특히 물리 수치·보드 좌표·치수는 bank와 직결되므로 절대 변경 금지.
> **이벤트 모듈:** Prize Drop은 PRISM SQUAD 코어에 **약결합**된 독립 iframe 미니게임이다. 코어는 Prize Drop 없이도 단독 동작하며, Prize Drop은 코어와 `event:grant` postMessage 한 줄로만 연결된다.

---

## ★ 데이터 구동 필수 (최우선 규칙)
이 폴더의 **CSV(= DEV §14 CSV 전문 / game_data, 또는 동봉 `.csv`)가 모든 수치·밸런스·구성의 단일 진실(SSoT)**다. 게임은 **반드시 이 CSV를 런타임에 fetch·파싱해 구동**하도록 만들 것 — **어떤 수치도 코드에 하드코딩 금지**(물리·보드 좌표 포함). CSV에 없는 항목만 DEV 데이터 스키마로 생성하되, 생성 후에도 CSV로 빼서 구동(데이터구동화). 이게 "에셋·수치 교체로 다양한 버전 양산"의 전제다.

## 0. 이 게임은 무엇인가
- **Prize Drop** = 구슬 드롭 물리 아케이드(핀볼/플린코류). 상단 드롭 버튼(5곳)에서 구슬을 떨어뜨리면 **핀·범퍼·다이아몬드·보상원을 통과** → **하단 슬롯(0~6) 착지** → 슬롯별 **번개(⚡) 누적** → 누적 번개가 **마일스톤 임계값**에 도달하면 보상 지급.
- **결과는 런타임 물리가 아니다.** 결과는 `game_data/bank/` JSON에 **사전 녹화**되어 있고, 화면에 보이는 구슬 움직임은 그 키프레임의 **재생(연출)**이다. 런타임에 Matter.js 물리 시뮬은 돌지 않는다(Matter.js는 오프라인 시뮬·좌표 참조용).
- **3공정 파이프라인(순서 절대 역전 금지):** ① 정상 게임 보드 구현(육안 확인) → ② `simulationRunner`로 슬롯7×드롭5 = 35개 bank JSON 녹화 → ③ `bankPlayer`로 재생. bank 없이 게임을 완성할 수 없다.
- **고정 치수·고정 슬롯:** 컨테이너 366×646px, 보드 360×396px, 슬롯 7개, 드롭 버튼 중심 X 30/105/180/255/330px — 전부 고정. simulationRunner와 항상 동기화.

## 1. 읽기 순서 (필수 — 이 폴더 파일명)
1. **이 SKILL** (지금 문서)
2. `GAME_prize_drop_event_v4.md` — Design Pillars(서버 결정·클라 연출 / 3공정 / 고정 치수) · Mechanics · Anti-Patterns + **코어 연동(재화·아이템)** + **유저 플로우**
3. `DESIGN_prize_drop_event_v4.md` — 비주얼 토큰(`--bps-*`) · 컴포넌트 · 고정 치수 · 애니메이션 7종 + **§Appendix style.css 전문(SSoT)**
4. `DEV_prize_drop_event_v4.md` — 스택·파일구조·json-render·$state 17경로·**Implementation Order(3공정 13단계)**·Anti-Patterns·Bug Log·에셋 교체 + **§14 배포 CSV 전문(public SSoT)**
5. `RECIPE_prize_drop_event.md` — 검증된 패턴
6. `RECIPE_CODE_prize_drop_event.md` — 추론 위험 구간 소스 발췌 (repo에서 복사, 임의 수정 금지)

## 2. 코딩 전 7항목 요약 (채우고 시작)
```
- 이 게임은 무엇인가:
- 핵심 기술 구조(스택·렌더러):
- 선언형(json-render HUD) vs 명령형(Three.js 보드/bank 재생) 경계:
- 가장 주의할 Anti-Pattern 3개:
- RECIPE / RECIPE_CODE 있음 여부:
- game_data CSV 목록(파일명 나열) + bank 35개 존재 여부:
- 코어 연동 포함 여부(독립 iframe / 코어 host 연결까지) — §5:
```

## 3. 비주얼 (DESIGN — 2D 페이퍼 아케이드)
- **iframe 자체 `style.css` 1파일 SSoT** — 인라인 style 금지. `:root` 에 `--bps-*` 토큰 보유. (코어의 2레이어 베이지 톤과 별개 — 이쪽은 빈티지 아케이드 머신을 종이에 스케치한 **페이퍼 아케이드** 톤.)
- **토큰:** `--bps-paper #f0f0e8`(보드·카드 배경) · `--bps-ink #1a1a1a`(잉크 테두리·텍스트·HUD 상단) · `--bps-gray #d1d1c1`(구분선) · `--font-main`(Outfit). 비토큰 색: 슬롯 `#a0ff60`, 잭팟 `#ffd700`, 마일스톤 `#5ab0ff`/달성 `#4cde6a`, body 외곽 `#a0a090`.
- **레이어 구분(혼합 금지):** Three.js 보드(`#game-viewport`, OrthographicCamera, MeshBasicMaterial) ↔ json-render HUD(상단 110px + board-spacer 396px + slot-labels 50px + ms-wrap) ↔ 모달(z-index 500). 그림자는 blur 없는 하드 드롭 섀도만.

## 4. 에셋 교체 시스템 (DEV §에셋 교체)
- 그래픽 = CSV가 SSoT. `01_slot_lightning.csv`·`04_board_obstacle.csv` 에 `sprite_url` 컬럼. 비어있으면 절차적 도형/MeshBasicMaterial 색상 폴백(기본 연출 무손상). `public/assets/` 루트(플레이스홀더 PNG 6개). 이미지 교체만으로 리스킨.

## 5. 코어 연동 (PRISM SQUAD Host) — 계층① iframe + postMessage
> 상세·코드 위치는 `GAME ## 코어 연동` 참조. Prize Drop은 코어 전투(GameCore)와 물리·로직을 공유하지 않으며, 코어 전투로 진입하는 경로는 **없다**(라바 퀘스트의 `lq:start_attempt` 같은 흐름 없음).

- **진입:** 로비 우측 사이드탭 🎰(라벨 `퍼즐`) → `EventMiniCards` 클릭 → `openEventMinigame('prize')` → iframe 오버레이 마운트. 노출 조건 = `/lobby/showPrizeDrop` true. (등록: `public/event_minigame_host_config.csv` `prize` 행, `src=/event/prizeDrop/index.html`.)
- **재화(이식 지갑 계약):** 입장 차감 없음(`ticket_cost=0`). 퍼즐볼은 **드롭마다 1개** 게임이 자체 소비 → `pd:walletChanged`로 호스트 저장. 수급(`MinigameCurrencyService`, `event_minigame_acquire_config.csv`) = 코어 전투 일반 **300킬→+1** · 보스 **10킬→+1** · 스테이지 클리어 보너스. 입장 인트로(`PrizeIntro`)에 미션·보유 퍼즐볼 표시. 사이드탭은 갯수 아닌 **남은시간**(`duration_hours=24`).
- **코어→이벤트 데이터: 없음.** 드롭 결과는 사전 녹화된 bank JSON 재생이라 코어 데이터 불필요(독립 물리).
- **이벤트→코어 보상:** 마일스톤 달성 시(`03_milestone.csv` `threshold_lightning`) 달성 순서대로 모달 큐 + `event:grant` postMessage 전송 → `App.tsx` 핸들러 → `GameCore.grantReward()`. 매핑: `gold→metaGold` / `gem→metaGems` / `lightning→metaEnergy(입장 에너지)` / `equip→equipment_config.csv` 에서 `slot_id===slotId` 장비 레벨 0→1 또는 +1. 예: 황금 왕관 `prize_crown`(equip) → 코어 장비 슬롯 레벨업. 잭팟 슬롯(slot 3)은 화면 연출일 뿐 자체로 코어 재화를 직접 지급하지 않는다(번개 누적 → 마일스톤 경유로만 적립).
- **화면 전환:** 진입/이탈은 사선 블라인드(팝업 없음).
- **빌드 스코프:** 런타임 OFF = `/lobby/showPrizeDrop` false(사이드탭 숨김). 완전 제외 = host config CSV `enabled=0` — 단 `eventMinigameRegistry.ts` FALLBACK 에 `prize` 가 하드코딩(`enabled:true`)이라 CSV만으론 불충분할 수 있으니 FALLBACK 도 함께 손봐야 한다.

## 6. v4 규칙 / Prize Drop 고유 Anti-Patterns
- **함축 금지**(v5 diff용) · CSV §14 = `public/`·`src/eventSystem/prize-drop_end/game_data/` 와 동일, **수치 임의 변경 금지** · RECIPE_CODE 임의 수정 금지(repo에서 복사) · $state 경로 수정 시 3곳 동시 패치(`hudExternalStore` 초기값 + Spec `$state` + 공급원 update 키).
- **[CRITICAL] bank 없이 드롭 금지** — `isReady` 확인 필수, 공정 2 전 공정 3 구현 금지.
- **[CRITICAL] 물리 수치/보드 좌표 변경 시 bank 전체 재생성** — `04_board_obstacle.csv` 수정 후 bank 재생성 없이 배포 금지. `BOARD_CONSTANTS`(boardBuilder.ts) == simulationRunner B 상수 동일(하나라도 다르면 공이 핀을 뚫는다).
- **[CRITICAL] OrthographicCamera만** — PerspectiveCamera 금지(보드 원근 왜곡).
- **[CRITICAL] bankPlayer에서 viewHeight 금지** — `BOARD_CONSTANTS.HEIGHT(396)` 사용(viewHeight≈390과 다르면 공이 핀 통과). Y-flip: Three.js Y = HEIGHT − Matter.js cy.
- **[CRITICAL] 슬롯 7개 고정** — 변경 시 보드·CSV·HUD 전면 재설계.
- **[CRITICAL] SlotLabels 하드코딩 금지** — `01_slot_lightning.csv` `slot_index` 오름차순 렌더 필수.
- **[CRITICAL] 보상 모달 show() 직접 호출 금지** — `rewardModalStore.enqueue()` 큐 사용(복수 마일스톤 동시 달성 시 스킵 방지).
- **[CRITICAL] rect bumper(bump_0~5) 삭제 금지**(슬라이딩 방지) · separator_pin 렌더 금지(physics body만) · canvas `pointer-events: auto !important` 필수.
- json-render: emit 두 번째 인자 무시 · 모든 요소 `props:{}` 필수 · `slots.default` 접근 금지(children 배열) · Provider 3개만(ValidationProvider 금지) · 외부 스토어는 useSyncExternalStore.

## 7. 빌드
```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
# (이벤트 모듈 단독 개발 시) 심링크 후 3공정 순서대로
mkdir public && ln -sf ../game_data public/game_data
node scripts/simulationRunner.mjs 20   # bank 35개 생성 (공정 2)
npm run dev                            # 보드 육안 확인 → 재생 확인
npm run build
```

## 8. 완성 체크리스트
- [ ] GAME: Design Pillars / Mechanics / Anti-Patterns + 코어 연동 + 유저 플로우
- [ ] DESIGN: `--bps-*` 토큰 + 컴포넌트 + 고정 치수(366×646/360×396) + style.css 전문
- [ ] DEV: 스택·json-render·$state 17경로·3공정 13단계·Bug Log·에셋·§14 CSV
- [ ] RECIPE + RECIPE_CODE
- [ ] 공정 1: 보드(핀·범퍼·보상원·슬롯7) 육안 확인 + BOARD_CONSTANTS == simulationRunner 동일
- [ ] 공정 2: `game_data/bank/` 35개 JSON 존재
- [ ] 공정 3: 드롭→궤적→슬롯 착지→번개 증가 / 마일스톤 모달 큐 순서 / 잭팟 모달 / 공 0개 드롭 불가
- [ ] 코어 연동 포함 여부(독립 iframe / host `event:grant`) 사용자 확정
- [ ] `npm run build` 통과
