---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

## Design Pillars

**서버 결정, 클라이언트 연출** — 결과는 bank JSON에 사전 저장된다. 플레이어가 보는 공의 움직임은 연출이다. 물리 수치를 건드리면 bank와 보드가 불일치해 공이 핀을 뚫고 지나간다.

**3공정 파이프라인** — 이 게임은 3단계 공정으로 만들어진다. ① 정상 게임 구현 → ② simulationRunner로 bank JSON 녹화 → ③ bankPlayer로 재생. 순서를 바꾸면 안 된다. bank 없이 게임을 완성할 수 없다.

**고정 치수** — 보드는 360×396px 고정. 컨테이너는 366×646px 고정. 드롭 버튼 중심 X는 30/105/180/255/330 고정. simulationRunner와 항상 동기화.

## Mechanics in Depth

결과는 game_data/bank/ JSON에 사전 저장된다. simulationRunner가 Matter.js 물리 시뮬로 슬롯 0~6 × 드롭 위치 0~4 = 35개 파일을 생성한다. 런타임에는 CSV 가중치로 목표 슬롯을 선택하고, 해당 JSON의 키프레임을 50ms 간격으로 재생한다. 플레이어는 결과를 미리 알 수 없다.

04_board_obstacle.csv를 수정하면 bank 전체를 반드시 재생성해야 한다. boardBuilder와 simulationRunner의 BOARD_CONSTANTS가 하나라도 다르면 bank 경로와 실제 보드가 불일치해 공이 핀을 뚫고 지나간다.

RewardCircle 충돌 감지는 런타임 물리 없이 렌더 루프에서 거리 계산으로 처리한다. ball과 RewardCircle 중심 거리가 (원 반지름 + BALL_RADIUS + 2) 미만이면 bounce가 발동된다.

보상 모달은 반드시 큐 시스템을 거쳐야 한다. show()를 직접 호출하면 복수 마일스톤 달성 시 첫 번째만 표시되고 나머지는 스킵된다. dismiss 후 180ms 뒤에 다음 모달이 자동으로 표시된다.

## Content Guidelines

물리 수치(restitution, radius 등)는 기획자 승인 없이 변경 금지. 변경 시 bank 전체 재생성 필수.

슬롯 수는 7개 고정. 변경 시 보드·CSV·HUD 전면 재설계 필요.

슬롯 라벨은 반드시 01_slot_lightning.csv 데이터를 slot_index 오름차순으로 렌더한다. 하드코딩 금지.

04_board_obstacle.csv는 물리·렌더 좌표의 단일 진실 원본이다. 수정 후 bank 재생성 없이 배포 금지.

## Anti-Patterns

**bankPlayer에서 viewHeight 사용** — BOARD_CONSTANTS.HEIGHT(396)을 사용해야 한다. viewHeight(≈390)와 값이 달라 공이 핀을 뚫고 지나간다.

**04_board_obstacle.csv 수정 후 bank 재생성 생략** — 시뮬 경로와 실제 보드가 불일치한다.

**BOARD_CONSTANTS와 simulationRunner B 상수 불일치** — 하나라도 다르면 bank 경로가 실제 보드와 맞지 않는다.

**모달 show() 직접 호출** — 복수 마일스톤 달성 시 모달이 스킵된다. 반드시 큐를 사용한다.

**SlotLabels 하드코딩** — CSV 수정이 화면에 반영되지 않는다.

**rect bumper(bump_0~5) 삭제** — 공이 구분선 표면을 타고 슬라이딩하는 현상이 발생한다.

**PerspectiveCamera 사용** — 보드 원근 왜곡. OrthographicCamera만 허용.

**공정 순서 역전** — bank 없이 재생 구현 시도. 공정 1(보드 구현) → 공정 2(bank 생성) → 공정 3(재생 구현) 순서를 반드시 지킨다.

## 코어 연동 (PRISM SQUAD Host) — 재화·아이템

> Prize Drop은 **독립 iframe 미니게임**이다. PRISM SQUAD 코어 전투(GameCore)와 물리·로직을 공유하지 않으며, postMessage 한 줄(`event:grant`)로만 코어와 연결된다. 코어 전투로 진입하는 경로는 없다(라바 퀘스트처럼 `lq:start_attempt`로 전투를 띄우는 흐름이 **없음**).

### 계층 — iframe + postMessage

| 항목 | 값 | 검증 위치 |
|------|----|-----------|
| 진입 계층 | 코어 전투와 분리된 단일 iframe 셸 (계층① iframe) | `src/App.tsx` iframe 오버레이 |
| 통신 | `window.parent.postMessage` 단방향(이벤트→코어) | `PrizeDrop.ts:375` |
| 코어→이벤트 | **없음** — 드롭 결과는 사전 녹화된 bank JSON 재생이라 코어 데이터 불필요 | — |

### 진입 흐름

로비 우측 사이드탭(🎰, 라벨 `퍼즐`) → `EventMiniCards` 클릭 → `openEventMinigame('prize')` → iframe 오버레이 마운트.

- 사이드탭 렌더: `src/jsonRender/registry.tsx` `EventMiniCards` (`onClick={() => openEventMinigame(id)}`)
- 호스트 API: `src/game/eventMinigameHost.ts` `openEventMinigame`
- 사이드탭 노출 조건: show 플래그 `/lobby/showPrizeDrop` 가 true 일 때만

### 입장 재화 — `/lobby/prizeBalls`

- **차감**: `openEventMinigame('prize')` 진입 시 `ticket_path=/lobby/prizeBalls` 에서 `ticket_cost=1` 차감(`eventMinigameHost.ts:96-104`). 잔량 부족 시 `재화가 부족합니다` 토스트 후 진입 취소(차감·마운트 모두 안 함).
- **수급**(`GameCore.ts`):
  - 코어 전투 **30킬마다 +1** (`kill_per_event_ticket`, 기본 30 / `GameCore.ts:807-809` → `_addEventCurrency(1, 1)`)
  - **보스 처치 보너스 +1** (`_onBossDeath`, `GameCore.ts:816`)
  - **게임 클리어 보너스 +1** (`GameCore.ts:1425`)
  - 적립 함수 `_addEventCurrency(lavaTickets, prizeBalls)` 가 `/lobby/lavaTickets`·`/lobby/prizeBalls` 동시 갱신.

### 이벤트→코어 보상 — `event:grant`

마일스톤 임계값(`03_milestone.csv` `threshold_lightning`) 달성 시 달성 순서대로 모달 큐에 적재하고, 같은 순서로 호스트에 보상 지급을 요청한다(`PrizeDrop.ts:359-380`).

```
// 이벤트(iframe) — PrizeDrop.ts
window.parent.postMessage({
  type: 'event:grant',
  rewards: [{ kind, amount: ms.reward_amount, slotId: ms.reward_item_id || undefined }],
}, '*');
```

- `kind` 매핑(`reward_type` → `kind`): `equip→equip`, `gem→gem`, `lightning→lightning`, 그 외(예 `gold`)→`gold`.
- 호스트 수신: `src/App.tsx` `event:grant` 핸들러(라바·프라이즈 공통) → `coreRef.current?.grantReward(resolved)`.
- `GameCore.grantReward()` (`GameCore.ts:1539`) 처리:
  - `gold` → `metaGold += amount` → HUD `/lobby/metaGold`
  - `gem` → `metaGems += amount` → HUD `/lobby/gems`
  - `lightning` → `metaEnergy += amount` → HUD `/lobby/entryTickets` (번개=입장 에너지)
  - `equip` → `equipment_config.csv` 에서 `slot_id === slotId` 장비를 찾아 레벨 0→1(첫 획득 시 `equippedSlots` 추가), 이후 +1(`max_level` 상한). 예: `prize_crown`(NECKLACE, max_level 10) → 코어 장비 슬롯 0→1 또는 +1.
- 지급 후 `_saveMeta()` + HUD/장비 목록 동기화.

> **마일스톤 보상표**(`03_milestone.csv`): step1 100⚡→gold 500 / step2 200⚡→lightning 5 / step3 300⚡→gem 10 / step4 400⚡→gold 2000 / step5 500⚡→equip `prize_crown`(황금 왕관) 1.

### 등록 — host config CSV

`public/event_minigame_host_config.csv`:

```
id,label,emoji,tab_bg,src,ticket_path,ticket_cost,ticket_unit,show_flag_key,persist_keys,enabled
prize,퍼즐,🎰,#B388FF,/event/prizeDrop/index.html,/lobby/prizeBalls,1,개,/lobby/showPrizeDrop,,1
```

- 빌드 산출물 경로: `src=/event/prizeDrop/index.html`
- CSV → `loadAllGameData` → `initEventMinigamesFromData`(`src/game/eventMinigameRegistry.ts`)로 런타임 주입.

### 빌드 스코프 (노출/제외 제어)

- **런타임 OFF**(코드/CSV 유지, 화면에서만 숨김): 로비 햄버거 메뉴의 `/lobby/showPrizeDrop` 토글을 false 로. 사이드탭이 사라진다.
- **완전 제외**: host config CSV 에서 `enabled=0`.
  - ⚠️ **주의**: `eventMinigameRegistry.ts` 의 `FALLBACK` 에 `prize` 가 **하드코딩**(`enabled: true`)되어 있다. CSV 로드 실패/누락 시 FALLBACK 으로 되살아나므로, 진짜 제외하려면 CSV `enabled=0` 만으로 불충분할 수 있고 FALLBACK 도 함께 손봐야 한다.

## 유저 플로우 (입장 → 적립까지)

```
[로비] prizeBalls 보유(전투 30킬/보스/클리어로 수급)
   └─ 우측 사이드탭 🎰 클릭
       └─ openEventMinigame('prize') : /lobby/prizeBalls −1 (부족 시 토스트·취소)
           └─ iframe 마운트 → 드롭 버튼(5) 선택 → 구슬 드롭
               └─ CSV 가중치로 목표 슬롯(0~6) 결정 → 해당 bank JSON 키프레임 재생(연출)
                   └─ 슬롯 착지 : session_lightning += reward_lightning × current_multiplier
                       └─ 마일스톤 임계값 달성? → 보상 모달 큐 적재(달성 순)
                           └─ 같은 순서로 event:grant postMessage
                               └─ [코어] App.tsx → GameCore.grantReward()
                                   └─ gold/gem/lightning 재화 적립 or equip 장비 슬롯 레벨업
                                       └─ _saveMeta + 로비 HUD 동기화 → 영속
```

핵심 보강 포인트:
- 입장권 차감은 **진입 시 1회**(드롭마다 차감 아님). 한 세션 동안 `ball_count`(기본 10) 만큼 드롭 가능, `add_balls` 로 +10.
- 보상 지급은 **마일스톤 단위**이며, 잭팟 슬롯(slot 3)은 화면 연출(잭팟 모달)일 뿐 자체로 코어 재화를 직접 지급하지 않는다(번개 누적 → 마일스톤 경유로만 코어 적립).
- 복수 마일스톤 동시 달성 시 모달은 큐로 순차 표시되고, `event:grant` 도 달성 순서대로 각각 전송된다.
