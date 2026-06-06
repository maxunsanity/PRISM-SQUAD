---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

---
identity:
  name: PRISM SQUAD
  doc_type: DEV
  scope: "기술 명세 — 스택·파일구조·CSV 스키마·Anti-Patterns"
---

# PRISM SQUAD — DEV.md

> **대상**: 개발자 · AI 에이전트  
> **게임 기획**: `src/GAME.md`  
> **비주얼 시스템**: `src/DESIGN.md`  
> **이벤트 시스템**: `src/eventSystem/EVENT_MANAGEMENT.md`

---

## 1. 스택

| 항목 | 값 |
|------|-----|
| 빌드 | Vite + TypeScript |
| UI | React 18 (`useSyncExternalStore`) |
| 3D | Three.js (WebGLRenderer, OrthographicCamera) |
| UI 선언 | json-render 패턴 (Spec → Catalog → Registry) |
| 상태 | External Store (React context 없음) |
| 데이터 | CSV (public/) — 런타임 fetch |


---

## 2. 선택 모듈 조립 (있으면 붙임)

> **전문:** [`ATTACH_MODULES_v4.md`](./ATTACH_MODULES_v4.md)  
> 코어만 만들 때는 무시. 타이쿤·라바·세일 붙일 때 필수.

| module_id | v4 폴더 |
|-----------|---------|
| tycoon_season | `src/eventSystem/tycoonSeason/tycoon_season_event_v4/` |
| lava | `src/eventSystem/Lava Quest _game_end/lava_quest_event_v4/` |
| prize | `src/eventSystem/prize-drop_end/prize_drop_event_v4/` |
| archery | `src/eventSystem/Archery Arena_game_end/archery_arena_event_v4/` |
| mall_marvels | `src/eventSystem/mallMarvels/mall_marvels_event_v4/` |
| drivers_joy | `src/eventSystem/driversJoy/drivers_joy_event_v4/` |

---

## 3. 파일 구조

```
src/
├── App.tsx                    ← 유일한 진입점. Three.js + React 초기화
├── main.tsx
├── style.css                  ← 전역 CSS + keyframe 애니메이션
├── GAME.md / DESIGN.md / DEV.md
│
├── game/
│   ├── GameCore.ts            ← 메인 게임 루프, 스테이지 관리, EventBridge 연결
│   ├── EnemySystem.ts         ← 적 AI, 이동, 접촉 데미지
│   ├── SkillSystem.ts         ← 스킬 장착/발사/투사체 전체
│   ├── BossController.ts      ← 보스 AI, BOSS_INTRO 연출
│   ├── DropSystem.ts          ← XP/아이템 드롭, 자석 픽업
│   ├── VfxSystem.ts           ← 파티클 VFX
│   ├── InputController.ts     ← 조이스틱(터치) + WASD(PC)
│   ├── hudExternalStore.ts    ← HUD $state 브릿지 (/hud/*, /lobby/* 등)
│   ├── shopUtils.ts
│   └── data.ts                ← CSV 파싱 + 타입 정의
│
├── three/
│   ├── Renderer3D.ts          ← WebGLRenderer, OrthographicCamera, 루프
│   ├── EnemyMesh.ts           ← InstancedMesh 기반 적 렌더러 (4종)
│   ├── PlayerMesh.ts          ← 플레이어 메쉬
│   └── ArenaWallSystem.ts     ← 맵 벽
│
├── jsonRender/
│   ├── prismHudSpec.ts        ← HUD Spec 주문서 ($state 바인딩)
│   ├── registry.tsx           ← React 구현 (컴포넌트 등록)
│   ├── catalog.ts             ← Spec 유효성 검증
│   ├── operationalUi.ts       ← 게임 UI 컴포넌트 (모달·버튼·바)
│   ├── equipUi.tsx            ← 장비 화면
│   ├── ShopScreen.tsx         ← 상점 화면
│   ├── ToastOverlay.tsx       ← 토스트 알림
│   ├── NavTabBar.tsx          ← 하단 탭바
│   ├── stubsAndMaterials.ts   ← 더미/머티리얼 헬퍼
│   └── shared.ts
│
└── eventSystem/               ← 이벤트 시스템 (독립 모듈, EVENT_MANAGEMENT.md 참조)

public/
├── *.csv                      ← 게임 데이터 (SSoT, CSV_PATHS)
└── event/tycoonSeason/*.csv   ← 이벤트 데이터
```

---

## 4. json-render 패턴

UI 추가/수정 시 항상 **3종 세트 동시 패치**:

```
prismHudSpec.ts  ← $state 바인딩 선언
    ↓
catalog.ts       ← 타입 유효성 검증
    ↓
registry.tsx     ← React 컴포넌트 구현
```

**규칙**:
- `visible` 제어는 Spec이 아닌 `hudStore`의 `/xxx/visible` 상태로
- `props: {}` 반드시 명시 (생략 시 catalog 오류)
- 타입 import는 파일 상단 `import type` 으로만

---

## 5. 상태 관리

### hudExternalStore (게임)

```
/hud/timer, /hud/hpPct, /hud/level, /hud/expPct, /hud/killCount, /hud/gold
/hud/bossHpPct, /hud/bossName, /hud/bossVisible, /hud/bossWarningVisible
/hud/activeSkillSlots
/lobby/visible, /shop/visible, /equip/visible, /challenge/visible
/evolution/visible, /talent/visible, /energy/visible, /avatar/visible
/result/visible, /pause/visible, /modal/visible, /battle/visible
/scene/transitionVisible, /scene/transitionText
/bossIntro/phase
/luckyTrain/visible
/advUp/visible
```

### eventExternalStore (이벤트)

`/event/*` 경로만. `hudExternalStore`와 완전 분리. → `src/eventSystem/tycoonSeason/store/eventExternalStore.ts`

---

## 5. Three.js 규칙

### z-레이어 (절대 변경 금지)

| 오브젝트 | z |
|----------|---|
| 바닥 | -2.0 ~ -1.2 |
| 적 InstancedMesh | 0.5 |
| 화염장판/오라 | 0.5 |
| 스킬 투사체 | **1.0** ← 반드시 |
| 가디언 블레이드 | 2.0 |
| 드론 본체 | 8.0 |

카메라: z=500, -Z 방향 → z 클수록 앞에 표시

### 머티리얼 정책

- **MeshBasicMaterial 전용** (조명 없음)
- `MeshStandardMaterial` 사용 금지

### InstancedMesh 규칙

- 적 4종 각 InstancedMesh 1개 (draw call 4개 고정)
- `MAX_INSTANCES = 512` per type
- **`frustumCulled = false` 필수** (없으면 적 안 보임)
- 인스턴스 숨김: `scale=0` + `z=-9999`

---

## 7. CSV 스키마 (SSoT)

모든 수치는 CSV만 수정. 코드 하드코딩 금지. 경로는 `data.ts` `CSV_PATHS` 단일 관리.

| 파일 | 주요 필드 | 담당 |
|------|-----------|------|
| `player_config.csv` | hp, speed, radius, invincible_frames | 밸런스 |
| `enemy_config.csv` | enemy_id, hp, speed, contact_dmg, exp_drop_type, gold_drop | 밸런스 |
| `boss_config.csv` | boss_id, hp, speed, spawn_time_seconds, is_mini_boss | 밸런스 |
| `wave_config.csv` | wave_id, enemy_rates(합=1.0), spawn_count, stage_range | 밸런스 |
| `skill_config.csv` | skill_id, damage, cooldown_ms, projectile_speed, element | 밸런스 |
| `skill_level_config.csv` | skill_id, level, stat_delta | 밸런스 |
| `skill_evolution_config.csv` | active_id, passive_id, evo_id | 기획 |
| `drop_config.csv` | drop_type, effect_value (xp_small=1/medium=5/large=22) | 밸런스 |
| `level_config.csv` | level, exp_required, exp_scale_rate=1.145 | 밸런스 |
| `map_config.csv` | map_id, width, height, bg_asset | 기획 |
| `stage_config.csv` | stage_id, xp_mult, initial_xp_small | 밸런스 |
| `vfx_config.csv` | vfx_id, particle_count, bloom_strength | 아트 |
| `talent_config.csv` | talent_id, stat_key, value_per_level | 기획 |
| `talent_cost_config.csv` | level, cost | 밸런스 |
| `control_config.csv` | joystick_maxDist, deadzone | 기획 |
| `lucky_train_config.csv` | gold_threshold, skill_cost_formula | 밸런스 |
| `combat_tuning.csv` | key, value (DOT·스피터·보스연출·러시 등) | 밸런스 |
| `element_config.csv` | effect_type, duration_sec, tick_interval_sec | 밸런스 |
| `player_visual_config.csv` | key, value (PlayerMesh 연출) | 아트/체감 |
| `renderer_config.csv` | key, value (Renderer3D 카메라·격자) | 아트 |
| `skill_runtime_config.csv` | key, value (스킬 런타임) | 밸런스 |
| `boss_pattern_config.csv` | boss_id, key, value | 밸런스 |

**wave_config 필수 제약**: 같은 wave_id의 enemy rate 합 = **정확히 1.0**

---

## 6. gameState 전이

GameState 타입 = `PLAYING | LEVELUP | PAUSED | BOSS_INTRO | GAMEOVER` (**5종, VICTORY 없음**).

```
PAUSED(초기/로비) → PLAYING ↔ LEVELUP
PLAYING → PAUSED(일시정지/행운열차) → PLAYING
PLAYING → BOSS_INTRO(600초) → PLAYING(보스전)
PLAYING → GAMEOVER  ── 승/패 공통 수렴
```

- `PAUSED`: 초기 상태(게임 시작 전 로비) + 인게임 일시정지/행운열차
- `BOSS_INTRO`: 최종보스 600초 등장. phase1 WARNING(~1300ms) → phase2 암전+등장(~1000ms) → phase3 충격파(800ms) 후 PLAYING(보스전)
- 보스 등장 후에도 `PLAYING` 유지 (별도 enum 없음)
- ⚠️ **VICTORY는 독립 gameState가 아님**: 보스 처치(승)·HP0(패) 모두 `GAMEOVER`로 수렴. 결과창은 `/result/isVictory` 불린으로 승("클리어!")/패("실패") 구분.

> 화면별 트리거($state·gameState)·구성요소는 `DESIGN.md §10`, 전체 유저 플로우는 `GAME.md ## User Flow`.

---

## 8. 게임 핵심 수치 (기획 확정, 수정 시 GAME.md와 동기화)

| 항목 | 값 |
|------|-----|
| 게임 시간 | 10분 (600초) |
| 최종보스 등장 | 600초 (`boss_config.spawn_time_seconds`) |
| 미니보스 주기 | 100초마다 CRUSHER ↔ NEXUS 교대 |
| 러시 주기 | 50초마다 |
| 대각선 이동 | `vx=+1, vy=-1` → √2배 (의도된 스펙, 수정 금지) |
| 조이스틱 maxDist | 40px, 동적 생성(터치 지점 Pivot) |

---

## 9. 이벤트 연동 계약 (코어↔이벤트 3계층) — 재현 SSoT

> 코어(GameCore)는 이벤트에 **약결합**. `EventBridge`를 `import type`(런타임 의존 없음)으로만 참조하고 `null` 가능 필드로 보유 → **코어 단독 동작 보장**. 계층별 연동 방식이 다르므로 정확히 구분할 것.

### 9.1 계층 ③ — 타이쿤·시즌 (EventBridge, 인게임 킬 적립)

`src/eventSystem/tycoonSeason/host/EventBridge.ts` 실제 시그니처:

```ts
class EventBridge {
  constructor(data: EventData)
  onRewardGranted?: (bundleId: string) => void  // 마일스톤/순위 보상 콜백
  dispose(): void
  syncTicketMultiplier(ticketMultiplier: number): void  // 입장 배수 확정 시 UI 칩 동기화
  onEnemyKilled(enemyId: string, ticketMultiplier: number): void
  tick(dt: number): void
  getTycoonPoints(): number
  getSeasonCoins(): number
}
```

⚠️ **`onBossKilled` / `onGameTick` / `onGameEnd` 메서드는 없다.** 보스 사망 = `onEnemyKilled('final_boss', mult)`, 틱 = `tick(dt)`, 종료 = 코어가 `getTycoonPoints()`를 **pull**(전용 종료 메서드 없음).

GameCore 내 호출 지점(전부):
```ts
this.eventBridge?.tick(dt);                                          // 메인 루프
this.eventBridge?.onEnemyKilled(dead.cfg.enemy_id, this.ticketMultiplier); // 일반 적 사망
this.eventBridge?.onEnemyKilled('final_boss', this.ticketMultiplier);      // 보스 사망(_onBossDeath)
this.eventBridge?.getTycoonPoints() ?? <폴백>                         // 결과창 tycoonEarned
this.eventBridge?.syncTicketMultiplier(mult);                        // 배수 토글/입장/전투시작
```
결과창 적립: `getTycoonPoints()`(EventController 누적, `event_kill_reward_config.csv` 기반). **EventBridge 미부착(코어 단독) 시에만** 폴백 `(killCount + result_clear_bonus_kills) * ticketMultiplier`.

### 9.2 계층 ① — iframe 미니게임 (lava / prize / archery)

postMessage 브릿지. 코어→iframe 진입, iframe→코어 보상.

```ts
// 보상 환류 (App.tsx: window 'message' → core.grantReward)
grantReward(rewards: Array<{ kind: string; amount?: number; slotId?: string }>)
//  kind: 'gold'→metaGold / 'gem'→metaGems / 'lightning'→metaEnergy / 'equip'→equipLevels[slotId]
//  (slotId = equipment_config.slot_id, 예: prize_crown)
//  보상 라인 없이 bundleId만 오면 archeryBundleToGrant(bundleId)로 변환
```
- 등록: `src/game/eventMinigameRegistry.ts`(`EventMinigameId='lava'|'prize'|'archery'` union + FALLBACK 내장) + `public/event_minigame_host_config.csv`(`id,label,emoji,tab_bg,src,ticket_path,ticket_cost,ticket_unit,show_flag_key,persist_keys,duration_hours,enabled`)
- **입장 차감 없음**: 세 게임 모두 `ticket_cost=0`. 퍼즐·양궁 재화는 입장이 아니라 **플레이 중 게임이 자체 소비**(지갑 계약 §11) 후 `*:walletChanged`로 호스트에 잔액 저장. 라바는 단독 플레이.
- **사이드탭 = 남은시간 카운트다운**: `duration_hours`(lava 0.5 / prize 24 / archery 48) → `eventExposure.ts`로 endMs 영속·계산. 갯수 표기 아님(§12·§13).
- Lava만 코어 전투 진입형: iframe "도전 시작" → `lq:start_attempt` → `startLavaQuestMode` → 전투(라바 호스트) → `_onLavaQuestEnd` → iframe 복귀

### 9.3 계층 ② — 세일 오버레이 (mallMarvels / driversJoy)

`SalesHostBridge`(`src/eventSystem/sales/createPrismSalesHost.ts`) → 코어 직접 메서드:
```ts
grantRewards:   lines => core.grantSalesRewards(lines)   // reward_type: energy|meta_gold|gems|supply_key|dna|open_box|equip_lv
trySpendCashKrw: a => core.trySpendSalesCashKrw(a)        // metaCashKrw 차감
trySpendGems:    a => core.trySpendSalesGems(a)
getWallet:      () => core.getSalesWallet()               // {cashKrw,gems,gold,energy}
```

### 9.4 빌드 스코프 (이벤트 포함/제외) — 핵심 메커니즘

- **코어 단독화 = `App.tsx`의 `eventData null 가드 + attachEventBridge(null)`.** 이벤트 CSV 로드 실패/부재 → `setEventData(null)` → bridge 미생성 → 코어 옵셔널 체이닝으로 전부 no-op.
- 게임 데이터·이벤트 데이터·세일 데이터는 `loadAllGameData`/`loadAllEventData`/`loadAllSalesEventData`로 **독립 로드**("이벤트 실패해도 게임 무영향").
- 런타임 ON/OFF: 로비 햄버거 메뉴(`/lobby/show*` 토글) → `EventMiniCards`가 show 플래그로 필터.
- CSV OFF(계층①): `event_minigame_host_config.csv` `enabled=0`/행 삭제. 단 `eventMinigameRegistry.ts` `FALLBACK`에 3종 하드코딩이 있어 **완전 제외엔 FALLBACK·union도 정리** 필요.
- ❌ `EventManager.ts` / 루트 `event_board_config.csv`는 **코드에 없음**(문서 선행 설계). 실제 board_config는 `public/event/tycoonSeason/event_board_config.csv`(tycoon 전용)만 존재.

> 재현 절차: 코어 구현 전 **사용자에게 "6 이벤트 포함 통합 빌드 / 코어만 / 일부"를 질문**(기본=통합). 상세는 `GAME.md ## 이벤트 연동 (3계층) + 빌드 스코프 결정` + `ATTACH_MODULES_v4.md`.

---

## 9-A. 에셋 교체 시스템 (그래픽 리소스 규칙) — 재현 필수

> **목적:** 코드 수정 없이 게임의 모든 그래픽(적·플레이어·보스·투사체·드롭·VFX·배경 + UI)을 **CSV/에셋 경로 + 이미지 파일 교체만으로** 바꾼다. 유니티 프리팹+Inspector를 웹(Three.js + CSV)으로 옮긴 구조. 설계 원문: 노션 "서비스 버전 에셋 시스템 — 설계 원칙".
> **이유:** 지금의 그래픽(게임월드 네온·도형 / UI 2D 스케치)은 **기본(base)** 이고, 나중에 에셋만 갈아끼워 **다양한 디자인/스킨을 붙이기** 위함(`?skin=cyber` 식 테마 전환까지 확장 가능). 그래서 AI가 다시 만들 때도 **이 규칙대로** 만들어야 한다.

### 9-A.1 핵심 원칙 (4개)
1. **CSV/에셋 설정이 SSoT** — 모든 시각 설정은 CSV(또는 `event_asset_config.csv`)에. 코드는 읽어 렌더만 하고 모양/색/이미지를 직접 결정하지 않는다.
2. **폴백 보존 (절대 손상 금지)** — `sprite_url`이 비어있으면 기존 절차적 도형/색(또는 손그림 SVG)으로 폴백. 기본 연출은 절대 깨지지 않는다.
3. **`public/sprites/` 가 리소스 루트** — 카테고리 폴더(enemies/player/boss/skills/drops/fx/bg + (UI 확장 시) ui/). Vite가 `dist/`로 복사 → `/sprites/...` 직접 접근.
   - ⚠️ **`assets/`가 아니라 `sprites/`인 이유:** Vite 번들 출력 폴더가 `/assets/`(해시 파일 전용)라 일부 정적 호스트가 `/assets/` 하위 비-해시 파일을 안 내려준다(404). 충돌 회피 위해 런타임 이미지는 **반드시 `/sprites/`** 에 둔다.
4. **마크다운/이모지 금지** — 텍스트 이모지 대신 **컨셉에 맞게 그린 그래픽(SVG / Three.js)**. 교체 기준점이 되는 **플레이스홀더 PNG**를 `scripts/gen_sprites.mjs`로 생성해 둔다.

### 9-A.2 코드 패턴 (Three.js)
```typescript
// Config 인터페이스: sprite_url 필드
export interface XxxConfig { /* ... */ sprite_url: string; } // 비면 절차적 폴백
// 파서:  sprite_url: r['sprite_url'] ?? '',
// 렌더러 분기:
if (cfg.sprite_url) {
  const tex = new THREE.TextureLoader().load(cfg.sprite_url);
  geo = new THREE.PlaneGeometry(radius * 2.2, radius * 2.2);
  mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
} else { /* 기존 절차적 도형 코드 그대로 */ }
```
주의: InstancedMesh `frustumCulled=false` 필수 / 배경 텍스처 `wrapS=wrapT=ClampToEdgeWrapping` / VFX `depthWrite:false`+`AdditiveBlending` / 진화·파생 스킬은 `baseIdMap`으로 base 스킬의 sprite_url 상속.

### 9-A.3 적용 대상 + 현재 구현 현황 (코드 검증 기준)

**레이어 B (게임 월드) — ✅ 구현 완료:**

| 오브젝트 | CSV 컬럼 | 렌더러 | 상태 |
|---|---|---|---|
| 적 | `sprite_url` | EnemyMesh.ts | ✅ InstancedMesh, 타입별 공유 |
| 플레이어 | `sprite_url` | PlayerMesh.ts | ✅ |
| 보스 | `sprite_url` | EnemyMesh.ts | ✅ |
| 투사체/스킬 | `projectile_sprite_url` | SkillSystem.ts | ✅ baseIdMap 상속 |
| 드롭 아이템 | `sprite_url` | DropSystem.ts | ✅ |
| VFX 파티클 | `particle_sprite_url` | VfxSystem.ts | ✅ 색상도 CSV |
| 배경 | `bg_sprite_url` | Renderer3D.ts | ✅ 없으면 스타디움 플로어 |

→ `scripts/gen_sprites.mjs`가 위 카테고리 플레이스홀더 PNG 생성(현재 `public/sprites/` 7폴더·PNG 배포됨). 대부분 sprite_url은 비어 있어 절차적 폴백(보스·드롭만 `/sprites/...` 지정).

**이벤트 — ✅ 자체 에셋 시스템 보유:** 퍼즐/라바/양궁(iframe)은 각자 CSV `sprite_url`/`*_sprite_url` + 전용 `assets/`. 타이쿤/시즌은 `public/event/tycoonSeason/event_asset_config.csv`(`asset_key,asset_type,url,fallback_text`)로 url 있으면 `<img>`, 없으면 fallback 텍스트.

### 9-A.4 ★ UI 확장 규칙 (레이어 A — 아직 미구현, 재현 시 적용)
> **현 상태:** UI 크롬(HUD·상점·장비·로비·모달)은 2D 스케치 SVG가 **코드에 인라인 하드코딩**돼 있고, **에셋 교체 컬럼이 없다**(특히 상점·장비·코어 HUD). 일부 화면엔 생 이모지도 잔존(🌋🎰🚗, 😈 등). 디자인 토큰(`#F4EFE6`/검정테두리/`3px 3px 0 #000`)도 공통 변수가 아니라 40+곳 복붙.
> **재현 시 규칙 (이렇게 만들 것):**
> 1. **디자인 토큰 단일화** — `#F4EFE6`·`2~3px solid #000`·`3px 3px 0 #000`·등급색을 `:root --bps-*`(또는 TS 상수) 한곳에 두고 참조.
> 2. **스케치 아이콘 함수 공통 모듈화** — `getCommonSketchIcon`·`getResourceSketchIcon`·`renderEquipIcon` 등을 한 모듈로, 중복 제거.
> 3. **UI 에셋 교체 도입** — 타이쿤의 `event_asset_config.csv`(`asset_key,url,fallback_text`) 패턴을 UI(상점·장비·HUD 아이콘)로 이식. url 있으면 이미지, 없으면 손그림 SVG 폴백. `gen_sprites.mjs`에 `ui/` 아이콘 생성 분기 추가.
> 4. **이모지 0** — 잔존 이모지는 전부 스케치 SVG로.
> 5. **레이어 경계 유지** — UI(레이어 A, 2D 스케치 베이지)와 게임월드(레이어 B, 네온·도형)는 토큰·에셋을 섞지 않는다.

### 9-A.5 교체 플로우 (사용자 관점)
```
1) AI로 PNG 생성 (적/투사체 64×64, 보스 128×128, 배경 512×512, PNG 투명)
2) public/sprites/[카테고리]/ 에 저장
3) CSV의 sprite_url(또는 event_asset_config url)에 경로 입력 (예: /sprites/enemies/basic.png)
4) 새로고침 → 즉시 반영
```

---

## 9-B. 레드닷(빨간 점) 전역 시스템 — 재현 필수

> 모든 메뉴·이벤트·하단 탭의 "알림 점"을 **CSV 규칙으로 일괄 관리**. AI 재현 시 아래 구조 그대로.

### 9-B.1 3축 분류 (우선순위 **claim > action > new** — UI는 하나만 표시)
| 축 | 의미 | 표시 |
|----|------|------|
| `claim` | 받을 보상 있음 | 빨간 점 `#FF3B30` |
| `action` | 재화·티켓 보유로 지금 콘텐츠 사용 가능 | 주황 점 `#FF9500` |
| `new` | 한 번도 안 열어봄 | 하늘색 N 뱃지 `#4FC3F7` |

### 9-B.2 아키텍처
```
public/red_dot_config.csv (규칙)
  → src/game/redDot/ {types, redDotConfig, resolvers, redDotSeen, RedDotService, redDotUi}.ts
  → hudStore `/redDot/{scope}/{category}`
  → 레거시 호환 `/event/redDot/{scope}` (= claim || action || new OR)
  → UI: EventRedDot / NavTabBar / EventMiniCards / SalesEventOverlay / eventMonopolyUi
```

### 9-B.3 CSV 스키마 (`public/red_dot_config.csv`)
`dot_id, category, enabled, hud_path, resolver_key, min_int, bubble_to, note`
- `dot_id`: seen 저장 키(`markRedDotSeen`). `resolver_key`: `resolvers.ts` 함수명과 **1:1**. `hud_path`: 결과 쓸 store 경로. `min_int`: action 임계값(티켓≥1·번개≥1). `aggregate_*` resolver는 2차 패스에서 `partial` 참조.
- 등록 규칙(현재): 이벤트(tycoon/season/express/lava/prize/archery의 claim·action·new), `event_minigame_stack` 합산, 세일(mall/drivers), 하단 탭(shop/equip/challenge/evolution의 new + action) + `aggregate_nav_*`, 전투 탭 버블업.

### 9-B.4 집계 흐름 (`refreshRedDots()`)
1) CSV 1차 패스 — 개별 resolver 실행 → 2) 2차 패스 — `aggregate_*`(partial 참조) → 3) 레거시 OR(`/event/redDot/*` 자동 생성) → 4) 후처리(전투 탭 버블업·세일 레거시·시즌+익스프레스 OR).

### 9-B.5 seen 해제
`markRedDotSeen(dot_id)` 또는 `window.dispatchEvent(new CustomEvent('redDot:markSeen', { detail: dotId }))`. 저장: localStorage `prism_red_dot_seen_v1`. 트리거: iframe 첫 입장(eventMinigameHost)·이벤트 패널 오픈(EventController)·하단 탭 진입(GameCore)·장비 강화·진화 해금·몰 claim·드라이버 구매.

### 9-B.6 UI 헬퍼 (`src/game/redDot/redDotUi.ts`)
- `pickScopeRedDot(hud, scope)` — claim > action > new 중 하나.
- `hasNavTabRedDot(hud, tab)` / `pickNavTabRedDot(hud, tab)` — `/redDot/nav/{tab}` 집계.
- 공통 컴포넌트: `<EventRedDot category={'claim'|'action'|'new'|null} />` (`src/jsonRender/eventRedDot.tsx`). 활성 탭엔 점 숨김.

### 9-B.7 refresh 트리거
`App.tsx` `preloadRedDotConfig()` 후 초기 1회 + `eventStore`/`mallMarvelsStore`/`driversJoyStore` subscribe + 5초 interval + `redDot:markSeen` 이벤트 + GameCore 탭 오픈·장비 강화·진화 해금.

### 9-B.8 신규 레드닷 추가 절차
1) CSV 행 추가(dot_id·category·hud_path·resolver_key) → 2) `resolvers.ts`에 동명 함수 → 3) `hudExternalStore`(이벤트는 `eventExternalStore`)에 경로 + default false → 4) 집계면 `aggregate_*` + 2차 패스 partial → 5) 레거시 필요 시 `RedDotService` OR → 6) UI `pickScopeRedDot` + `<EventRedDot>` → 7) seen 해제 지점 + `refreshRedDots()` → 8) `npm run build`.

---

## 10. 빌드 & 배포

```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
npm run build          # tsc -b && vite build
# dist/ 폴더 생성
zip -r ~/Desktop/PRISM_SQUAD_v2.zip dist/
```

---

## Anti-Patterns

### [CRITICAL] 투사체 z 값 임의 변경
z=1.0이 아닌 투사체는 적 레이어(0.5) 아래로 숨어 보이지 않는다.

### [CRITICAL] MeshStandardMaterial 사용
조명 계산으로 성능 저하 + 비주얼 불일치. `MeshBasicMaterial`만.

### [CRITICAL] frustumCulled = true (기본값 방치)
InstancedMesh에서 카메라 밖 적이 사라진다. 반드시 `false`.

### wave_config rate 합 != 1.0
스폰 가중치 계산 오류 → 특정 적이 절대 안 나오거나 넘침.

### hudStore에 이벤트 키 추가
이벤트 상태는 `eventStore (/event/*)` 전용. 두 스토어 혼용 금지.

### 3종 세트 중 하나만 수정
Spec만 수정하면 registry에서 컴포넌트 못 찾음. catalog만 수정하면 Spec 오류 무시. 항상 3개 동시.

### 같은 trigger 안에서 변수 선언 후 즉시 사용
LLE 연동 시 해당. 코어 게임 로직은 무관.


---

## 14. Host Core CSV Full Contents (public/tables/*.csv)

> **배포 SSoT.** AI는 이 내용을 임의 변경하지 말 것. 파일이 repo에 있으면 fetch 경로 그대로 사용.

### `public/tables/adventure_config.csv`

```csv
level,exp_required,reward_gem,reward_gold
1,0,0,0
2,300,10,500
3,700,10,600
4,1200,15,700
5,1900,15,800
6,2800,20,1000
7,3900,20,1200
8,5200,30,1500
9,6800,30,1800
10,8700,40,2200
11,11000,40,2600
12,13800,50,3000
13,17200,50,3500
14,21300,60,4000
15,26200,80,5000
```

### `public/tables/boss_config.csv`

```csv
boss_id,boss_name,is_mini_boss,boss_type,arena_size_w,arena_size_h,hp,speed,radius,contact_dmg,contact_dmg_interval_frames,puddle_interval_frames,puddle_radius,puddle_life_frames,puddle_dmg,puddle_dmg_interval_frames,missile_count,missile_interval_frames,missile_speed,missile_turn_rate,missile_max_range,missile_spread_angle,spawn_time_seconds,spawn_offset_y,clear_minions_on_intro,suppress_wave_spawn,geometry_type,color_hex,glow_color_hex,sprite_url
crusher,CRUSHER,true,moving,0,0,225,1.6,36,8,15,0,0,0,0,0,0,0,0,0,0,0,100,200,0,0,BoxGeometry,#FF3322,#FF6644,
nexus,NEXUS,true,stationary_missile,360,420,150,0,42,0,0,0,0,0,0,0,3,90,3.8,1.8,500,25,200,220,0,0,OctahedronGeometry,#AA22FF,#DD55FF,
titan,TITAN,false,moving,0,0,300,1.0,26,8,20,130,50,200,2,30,0,0,0,0,0,0,600,320,1,0,TorusGeometry,#3D2060,#6600FF,
```

### `public/tables/boss_pattern_config.csv`

```csv
boss_id,key,value,note
titan,phase2_hp_pct,0.7,페이즈2 전환 HP 비율
titan,phase3_hp_pct,0.4,페이즈3 전환 HP 비율
titan,phase3_speed_mult,1.5,페이즈3 추적 속도 배율
titan,phase3_puddle_freq_mult,2,페이즈3 웅덩이 간격 ÷ 이값
titan,charge_speed_mult,4,돌진 속도 배율(×cfg.speed×60×dt)
titan,charge_end_sec,-0.35,돌진 종료 chargeTimer 임계
titan,charge_prep_sec,-0.25,돌진 예비 chargeTimer 임계
titan,charge_cool_min_sec,1.3,돌진 후 쿨 최소(음수 타이머)
titan,charge_cool_rand_sec,1.4,돌진 후 쿨 랜덤
titan,phase2_missile_interval_sec,2.8,페이즈2 미사일 주기
titan,phase3_missile_interval_sec,1.7,페이즈3 미사일 주기
titan,missile_volley_offsets,-0.25|0|0.25,3발 방사 각 오프셋(rad)
titan,missile_speed,4.2,유도 미사일 속도
titan,missile_turn_rate,2,유도 미사일 선회
titan,missile_max_range,500,유도 미사일 사거리
titan,missile_dmg_ratio,0.6,미사일 dmg = contact_dmg×비율
titan,skill_spin_sec,0.35,웅덩이 후 스핀 연출(초)
titan,missile_spin_sec,0.5,미사일 후 스핀 연출(초)
titan,skill_spin_rate,4.2,스핀 tick 배율
titan,puddle_target_player_chance,0.55,웅덩이 플레이어 추적 확률
titan,puddle_dist_player_min,18,플레이어 주변 최소 거리
titan,puddle_dist_player_rand,44,플레이어 주변 랜덤 거리
titan,puddle_dist_boss_min,20,보스 주변 최소 거리
titan,puddle_dist_boss_rand,40,보스 주변 랜덤 거리
titan,phase2_flash_count,3,페이즈2 전환 플래시 횟수
titan,phase2_flash_interval_ms,200,페이즈2 플래시 간격
titan,phase3_flash_count,5,페이즈3 전환 플래시 횟수
titan,phase3_flash_interval_ms,150,페이즈3 플래시 간격
titan,phase2_intro_missile_delay_sec,2,페이즈2 진입 미사일 타이머
titan,phase3_intro_charge_delay_sec,1.5,페이즈3 진입 돌진 타이머(음수)
crusher,charge_speed_mult,4.5,돌진 속도 배율
crusher,charge_end_sec,-0.4,돌진 종료
crusher,charge_prep_sec,-0.3,돌진 예비
crusher,charge_cool_min_sec,1.1,돌진 쿨 최소
crusher,charge_cool_rand_sec,1.2,돌진 쿨 랜덤
crusher,charge_contact_dmg_mult,1.5,돌진 중 접촉 dmg 배율
crusher,charge_warn_spin_sec,0.3,돌진 예비 플래시 유지
crusher,intro_charge_delay_sec,1.5,스폰 후 첫 돌진(음수)+rand
nexus,missile_fallback_interval_sec,1.5,missile_interval_frames=0일 때
nexus,missile_min_count,3,방사 최소 발수(cfg 미만 시)
nexus,skill_spin_sec,0.4,발사 후 스핀
nexus,skill_spin_rate,4.2,스핀 tick 배율
nexus,contact_interval_sec,1,근접 접촉 간격(고정 포탑)
nexus,miniboss_pattern_a_spread_mults,-2|-1|0|1|2,스테이지 NEXUS 패턴A spread 배수
nexus,miniboss_pattern_a_speed_mult,1.1,패턴A 속도 배율
nexus,miniboss_pattern_b_ray_count,12,패턴B 전방위 발수
nexus,miniboss_pattern_b_speed_mult,0.85,패턴B 속도 배율
nexus,miniboss_pattern_b_dmg_mult,0.65,패턴B dmg 배율
nexus,miniboss_fallback_contact_dmg,5,contact_dmg=0 폴백
arena_wall,wall_thickness,3,봉쇄 벽 두께
arena_wall,wall_height,6,벽 높이(Z extrude)
arena_wall,wall_z,1.5,벽 Z 위치
arena_wall,fade_duration_sec,0.5,해제 페이드(초)
arena_wall,wall_opacity,0.75,벽 불투명도
host,miniboss_warning_visible_ms,2000,미니보스 등장 WARNING HUD 표시(ms)
host,boss_death_vfx2_ms,200,사망 연출 2차 VFX
host,boss_death_vfx3_ms,380,사망 연출 3차 VFX
host,boss_death_vfx4_ms,550,사망 연출 4차 VFX
host,boss_death_phase2_ms,700,VICTORY 텍스트
host,boss_death_phase3_ms,2200,페이드아웃 시작
```

### `public/tables/challenge_config.csv`

```csv
challenge_id,stage,difficulty,difficulty_name,enemy_hp_mult,enemy_dmg_mult,reward_dna,reward_gold,prereq_id
1,1,1,노말,1.0,1.0,5,500,0
2,1,2,하드,1.4,1.25,8,800,1
3,1,3,헬,1.9,1.55,12,1200,2
4,2,1,노말,1.3,1.1,5,600,3
5,2,2,하드,1.8,1.35,8,950,4
6,2,3,헬,2.4,1.7,12,1400,5
7,3,1,노말,1.6,1.2,8,750,6
8,3,2,하드,2.2,1.5,12,1150,7
9,3,3,헬,3.0,1.9,18,1700,8
10,4,1,노말,2.0,1.35,8,950,9
11,4,2,하드,2.7,1.65,12,1450,10
12,4,3,헬,3.6,2.1,18,2100,11
13,5,1,노말,2.4,1.5,10,1200,12
14,5,2,하드,3.3,1.85,15,1800,13
15,5,3,헬,4.4,2.35,22,2600,14
16,6,1,노말,2.9,1.65,10,1500,15
17,6,2,하드,4.0,2.05,15,2200,16
18,6,3,헬,5.3,2.6,22,3200,17
19,7,1,노말,3.5,1.85,15,1900,18
20,7,2,하드,4.8,2.3,20,2800,19
21,7,3,헬,6.4,2.9,30,4000,20
22,8,1,노말,4.2,2.1,15,2400,21
23,8,2,하드,5.8,2.6,20,3500,22
24,8,3,헬,7.7,3.3,30,5000,23
25,9,1,노말,5.1,2.4,20,3000,24
26,9,2,하드,7.0,3.0,28,4400,25
27,9,3,헬,9.3,3.8,40,6300,26
28,10,1,노말,6.2,2.7,25,3800,27
29,10,2,하드,8.5,3.4,35,5600,28
30,10,3,헬,11.3,4.3,60,8000,29
```

### `public/tables/combat_tuning.csv`

```csv
key,value,note
bomb_damage,10,폭탄 아이템 고정 데미지
player_debuff_sec,2.0,피격 디버프 지속(초)
debuff_speed_mult,0.6,디버프 중 이동속도 배율
boss_spawn_invuln_sec,1.2,최종보스 등장 무적(초)
boss_death_invuln_sec,4.0,보스 사망 연출 무적(초)
spitter_fire_range,260,스피터 사격 사거리(px)
spitter_fire_interval_sec,2.0,스피터 발사 주기(초)
spitter_keep_distance,120,스피터 근접 유지 거리(px)
spitter_init_delay_min,0.3,스피터 초기 발사 쿨 최소(초)
spitter_init_delay_max,1.0,스피터 초기 발사 쿨 최대(초)
spitter_missile_speed,3.5,스피터 미사일 속도
spitter_missile_radius,4.5,스피터 미사일 반경(px)
spitter_missile_dmg,3,스피터 미사일 데미지
spitter_missile_life_sec,3.0,스피터 미사일 수명(초)
poison_dps_per_stack,1.5,독 스택당 DOT 데미지
poison_tick_sec,0.5,독 DOT 틱 주기(초)
poison_max_stacks,5,독 최대 스택
fire_tick_sec,0.5,화염 DOT 틱 주기(초)
cold_slow_mult,0.5,냉기 둔화 배율
mini_boss_cycle_sec,100,미니보스 주기(초)
rush_cycle_sec,50,대규모 러시 주기(초)
rush_overlap_delay_sec,20,미니보스와 겹칠 때 러시 지연(초)
boss_rush_block_before_sec,40,최종보스 전 러시 차단 구간(초)
boss_rush_block_after_sec,20,최종보스 후 러시 차단 구간(초)
boss_intro_phase1_ms,1300,BOSS_INTRO Phase1 WARNING(ms)
boss_intro_phase2_ms,1000,BOSS_INTRO Phase2 암전~스폰(ms)
boss_intro_phase3_ms,800,BOSS_INTRO Phase3 종료(ms)
boss_death_result_delay_ms,3500,보스 사망 후 결과창(ms)
scene_transition_ms,3400,스테이지/라바 전환 오버레이(ms)
kill_per_event_ticket,30,@deprecated event_minigame_acquire_config 사용
stage_clear_lava_bonus,1,스테이지 클리어 라바 티켓 보너스
stage_clear_prize_bonus,1,스테이지 클리어 퍼즐볼 보너스
archery_starter_bows,5,신규·마이그레이션 기본 활대
result_clear_bonus_kills,50,스테이지 클리어 타이쿤 보너스 킬 수
rush_column_col_spacing,30,러시 종대 열 간격(px)
rush_column_row_spacing,26,러시 종대 행 간격(px)
rush_column_count_min,10,종대 formation 최소 마릿수
rush_column_count_max,20,종대 formation 최대 마릿수
chase_basic_direct_pct,30,basic 직추적 비율(%)
chase_basic_intercept_pct,40,basic 요격 비율(%)
chase_bloater_direct_pct,50,bloater 직추적 비율(%)
chase_bloater_intercept_pct,30,bloater 요격 비율(%)
chase_intercept_lead_sec,0.45,요격 예측 시간(초)
chase_intercept_player_speed,180,요격 예측 기준 이동속도(px/s)
chase_flank_offset_px,70,측면 우회 목표 오프셋(px)
spawn_move_behind_weight,0.55,이동 중 스폰 뒤쪽 비율
spawn_move_side_weight,0.30,이동 중 스폰 측면 비율
spawn_move_speed_threshold,0.12,방향성 스폰·요격 최소 입력
```

### `public/tables/control_config.csv`

```csv
joystick_ring_diameter,joystick_knob_diameter,joystick_max_dist,joystick_z_index,joystick_ring_opacity,joystick_knob_opacity,keyboard_diagonal_normalize
100,40,40,5,0.4,0.7,false
```

### `public/tables/drop_config.csv`

```csv
drop_id,drop_type,drop_weight,effect_value,pickup_radius,geometry_type,color_hex,size_small,size_medium,size_large,sprite_url
xp_small,xp,0,1,34,XpGemBillboard,#00E5FF,3.6,4.8,6.2,
xp_medium,xp,0,5,34,XpGemBillboard,#9B7AFF,4.8,6.2,7.8,
xp_large,xp,0,22,34,XpGemBillboard,#FFC830,6.2,7.8,9.5,
meat,heal,0.04,30,28,CrossGeometry,#80CCFF,0,0,0,
magnet,magnet,0.06,4,28,HalfTorusGeometry,#C099FF,0,0,0,
bomb,bomb,0.015,0,28,IcosahedronGeometry,#FF6680,0,0,0,
```

### `public/tables/element_config.csv`

```csv
element,element_name,icon,color_hex,effect_type,duration_sec,magnitude,tick_interval_sec,max_stacks
fire,화염,🔥,#FF5522,dot,3.0,6,0.5,0
ice,냉기,💙,#55CCFF,slow,2.0,0.45,0,0
poison,독,☠️,#88DD44,poison_stack,4.0,3,0.5,5
beam,광선,✨,#66FFFF,pierce,0,0,0,0
electric,전기,⚡,#CC88FF,chain,0,0,0,0
```

### `public/tables/enemy_config.csv`

```csv
enemy_id,enemy_name,hp,damage_reduction,speed,radius,contact_dmg,contact_dmg_interval_frames,exp_drop_type,gold_drop,weight,geometry_type,color_hex,has_glow,glow_color_hex,sprite_url
basic,기본 적,10,0.00,0.75,10,4,20,small,2,1.0,ConeGeometry,#FF8080,false,,
dog,사냥개,16,0.18,1.40,8,4,20,small,2,0.7,ConeGeometry_flat,#E06060,false,,
bloater,블로터,30,0.24,0.50,19,4,20,medium,4,2.5,CylinderGeometry,#FFBA66,true,#FF9500,
spitter,스피터,18,0.14,0.60,9,4,20,medium,3,0.9,BoxGeometry,#B899FF,true,#8833FF,
```

### `public/tables/equipment_config.csv`

```csv
slot_id,slot_name,item_name,icon,grade,stat_type,effect_per_level,max_level,base_gold_cost,gold_cost_scale,description,skill_id
weapon,WEAPON,레전드 리볼버,🔫,LEGEND,power,0.06,10,300,1.5,"가장 가까운 적을 유도 사격하는 권총",auto_revolver
weapon_shotgun,WEAPON,스프레드 샷건,💥,EPIC,power,0.05,10,250,1.5,"전방으로 산탄 5발을 퍼붓는 샷건",auto_shotgun
weapon_drill,WEAPON,파워 드릴건,🌀,EPIC,power,0.05,10,250,1.5,"적을 관통하고 벽에 튕기는 드릴 발사기",auto_drill
necklace,NECKLACE,에픽 체인,📿,EPIC,power,0.04,10,250,1.5,착용 시 공격력이 증가하는 마력 목걸이,
gloves,GLOVES,정밀 장갑,🧤,RARE,power,0.03,10,200,1.4,명중과 화력을 끌어올리는 정밀 장갑,
armor,ARMOR,수호 갑옷,🛡️,EPIC,hp,20,10,250,1.5,최대 체력을 크게 늘려주는 견고한 갑옷,
belt,BELT,강철 벨트,🎗️,RARE,hp,15,10,200,1.4,허리를 보호하며 체력을 더하는 강철 벨트,
boots,BOOTS,쾌속 부츠,👟,RARE,speed,0.03,10,200,1.4,이동 속도를 높여 회피를 돕는 쾌속 부츠,
lava_blade,WEAPON,용암 검,⚔️,LEGEND,power,0.07,10,300,1.5,"화염을 휘감은 전설의 검",auto_revolver
prize_crown,NECKLACE,황금 왕관,👑,LEGEND,power,0.06,10,300,1.5,"부의 상징 황금 왕관",
```

### `public/tables/event_minigame_acquire_config.csv`

```csv
minigame_id,target_type,kills_required,reward_label,left_icon_key,reward_icon_key,sort_order,enabled,row_title
prize,normal,300,1개,enemy_normal,prize_ball,1,1,일반 몬스터
prize,boss,10,1개,enemy_boss,prize_ball,2,1,보스
archery,normal,200,1발,enemy_normal,archery_bow,1,1,일반 몬스터
archery,boss,2,1발,enemy_boss,archery_bow,2,1,보스
```

### `public/tables/event_minigame_host_config.csv`

```csv
id,label,emoji,tab_bg,src,ticket_path,ticket_cost,ticket_unit,show_flag_key,persist_keys,duration_hours,enabled
lava,라바,🌋,#FFB347,/event/lavaQuest/index.html,,0,장,/lobby/showLavaQuest,lq_session_v1,48,1
prize,퍼즐,🎰,#B388FF,/event/prizeDrop/index.html,/lobby/prizeBalls,0,개,/lobby/showPrizeDrop,,24,1
archery,양궁,🏹,#7EC8A8,/event/archeryArena/index.html,/lobby/archeryBowStands,0,발,/lobby/showArcheryArena,"aa_player_state|aa_event_meta|aa_ranking_bots|aa_ranking_dummy_schema",48,1
```

### `public/tables/event_minigame_kill_reward_config.csv`

```csv
enemy_id,lava_base,prize_base,archery_base,is_boss
basic,1,1,1,false
dog,1,1,1,false
bloater,1,1,1,false
spitter,1,1,1,false
mini_boss,1,1,1,true
final_boss,1,1,1,true
```

### `public/tables/evolution_config.csv`

```csv
evo_id,order,branch,node_name,node_title,node_description,icon,ability_type,effect_value,cost_type,cost_amount,prereq_id
1,1,0,방어 강화,방어,받는 피해를 줄입니다.,🛡️,armor,0.05,gold,500,0
2,2,0,체력 증가,체력,체력이 세면 파워도 셉니다.,❤️,hp,40,gold,800,1
3,3,0,공격력 강화,힘,적의 얼굴을 강타합니다.,💪,power,0.06,gold,1200,2
4,4,0,고기 보급,체력,최대 체력을 추가로 올립니다.,🍖,hp,50,gold,1800,3
5,5,0,방패 강화,방어,추가 피해감소를 얻습니다.,🛡️,armor,0.05,gold,2600,4
6,6,0,맹공 본능,힘,공격 계수를 더 크게 올립니다.,⚔️,power,0.08,gold,3600,5
7,7,0,강철 의지,체력,후반 생존용 체력을 확보합니다.,❤️,hp,80,gold,5000,6
8,8,0,쾌속 기동,기동,이동속도를 올려 회피를 강화합니다.,👟,speed,0.06,gold,6800,7
101,3,1,포식자,포식자,처치 시 확률적으로 HP를 회복합니다.,🍴,predator,0.15,dna,15,3
102,5,1,각성,각성,모든 스킬의 쿨타임을 단축합니다.,⚡,cooldown,0.10,dna,20,5
103,7,1,고출력 자석,고출력 자석,드롭 수집 반경을 크게 늘립니다.,🧲,magnet,0.40,dna,25,7
```

### `public/tables/formation_spawn_config.csv`

```csv
formation_id,start_time_seconds,enemy_id,count,start_offset_y,col_spacing,row_spacing,move_sec,fire_sec,march_speed_mult,enabled
1,70,spitter,12,250,30,26,1.3,0.9,0.82,1
2,130,spitter,13,260,30,26,1.4,0.9,0.85,1
3,190,spitter,14,270,30,26,1.4,0.9,0.88,1
4,250,spitter,15,280,30,26,1.5,0.9,0.9,1
5,310,spitter,16,300,32,26,1.6,1.0,0.92,1
6,370,spitter,17,310,32,28,1.6,1.0,0.94,1
7,430,spitter,18,320,32,28,1.7,1.0,0.95,1
8,490,spitter,19,330,34,28,1.8,1.0,0.96,1
9,550,spitter,20,340,34,30,1.9,1.1,0.98,1
```

### `public/tables/guardian_runtime_config.csv`

```csv
key,value,note
guardian_orbit_speed,2.5,공전 각속도(rad/s)
guardian_hit_tick_sec,0.3,타격 판정 주기(초)
guardian_hit_radius_pad,8,적 radius + 패딩 충돌
guardian_count_min,2,일반 최소 블레이드 수
guardian_count_max,5,일반 최대 블레이드 수
guardian_count_per_level,1,레벨당 +1 (min~max 클램프)
guardian_dmg_mult,8,일반 dmg = base×level×이값
guardian_orbit_base,52,일반 궤도 기본 반경
guardian_orbit_per_level,3,일반 레벨당 궤도 +
guardian_orbit_scale,1.1,궤도 최종 배율
guardian_blade_w,14,블레이드 BoxGeometry W
guardian_blade_h,5,블레이드 H
guardian_blade_d,2.5,블레이드 D
guardian_color,16750848,블레이드 색(0xFFD600 10진)
eternal_count,5,진화 eternal 최대 블레이드
eternal_dmg_mult,14,eternal dmg 배율
eternal_orbit_base,74,eternal 궤도 기본
eternal_orbit_per_level,4,eternal 레벨당 궤도 +
eternal_blade_w,19,eternal 블레이드 W
```

### `public/tables/lava_quest_host_config.csv`

```csv
level_min,level_max,boss_id,boss_spawn_sec_override,note
1,2,crusher,50,라바 호스트 전투 — 보스 선택·등장 초
3,4,nexus,50,
5,7,titan,50,
```

### `public/tables/level_config.csv`

```csv
level,exp_required,exp_scale_rate
1,30,1.145
2,34,1.145
3,39,1.145
4,45,1.145
5,52,1.145
6,59,1.145
7,68,1.145
8,78,1.145
9,89,1.145
10,102,1.145
11,117,1.145
12,134,1.145
13,153,1.145
14,175,1.145
15,201,1.145
16,230,1.145
17,263,1.145
18,301,1.145
19,345,1.145
20,395,1.145
21,452,1.145
22,518,1.145
23,593,1.145
24,679,1.145
25,777,1.145
26,890,1.145
27,1019,1.145
28,1167,1.145
29,1336,1.145
30,1530,1.145
31,1752,1.145
32,2006,1.145
33,2297,1.145
34,2630,1.145
35,3011,1.145
```

### `public/tables/levelup_rule_config.csv`

```csv
key,value,note
card_count,3,레벨업 선택 카드 수
max_evo_cards,1,진화 카드 최대 노출 장수
evo_random_pick,1,1=진화 후보 중 랜덤 1장
evo_first_in_list,1,1=진화 카드를 목록 맨 앞에 배치
normal_shuffle,1,1=일반 스킬 후보 셔플
```

### `public/tables/lucky_train_config.csv`

```csv
skill_id,gold_cost
kunai,150
boomerang,130
molotov,130
guardian,150
rocket,190
drone,230
soccer_ball,100
drill_shot,100
dimensional_blade,200
debuff_aura,175
ninjaScroll,100
elasticShoes,100
highFuel,130
exoskeleton,130
lightning,200
mine,175
shotgun,150
energyCube,140
fitnessGuide,140
```

### `public/tables/map_config.csv`

```csv
map_id,map_width,map_height,camera_zoom,spawn_radius_min,spawn_radius_max,boundary_color_hex,boundary_opacity,grid_color_hex,grid_interval,floor_color_hex,ambient_light_color,ambient_light_intensity,dir_light_color,dir_light_intensity,boss_ambient_color,boss_ambient_transition_seconds,bg_sprite_url
default,3000,3000,60,120,200,#FF4444,0.5,#D0D0D8,60,#F0EDE8,#ffffff,0.6,#ffffff,0.8,#3D0080,2.0,
```

### `public/tables/meta_config.csv`

```csv
key,value,note
initial_gems,500,신규/리셋 테스트 보석
initial_dna,100,특수진화 DNA
initial_gold,12400,메타 골드 기본값(저장 없을 때)
initial_energy,500,입장 번개
max_energy,60,번개 상한
energy_per_mult,5,배수×1당 번개 소모
armor_cap,0.8,진화 피해감소 상한
predator_heal_ratio,0.02,포식자 회복(최대HP 비율)
first_purchase_double,1,보석 첫구매 2배(1=on)
item_drop_chance,0.03,인게임 아이템 드롭 확률
cooldown_mult_min,0.2,각성 쿨감 하한
avatar_profile_limit,16,캐릭터 선택 슬롯 수(4×4)
```

### `public/tables/player_config.csv`

```csv
player_id,max_hp,base_speed,radius,invincible_frames,geometry_size,color_hex,glow_intensity,hp_bar_low_threshold,sprite_url
default,200,2.6,12,30,20,#7BE8F4,2.0,0.5,
char_1,180,2.8,12,30,20,#FF4488,2.2,0.5,
char_2,220,2.5,12,30,20,#52FF88,1.9,0.5,
char_3,190,2.7,12,30,20,#FFE45C,2.1,0.5,
char_4,210,2.6,12,30,20,#CC55FF,2.0,0.5,
char_5,200,2.7,12,30,20,#FF8844,2.0,0.5,
char_6,240,2.4,12,30,20,#FF3333,1.8,0.5,
char_7,215,2.7,12,30,20,#FFD600,2.1,0.5,
char_8,200,2.6,12,30,20,#00FFCC,2.0,0.5,
char_9,230,2.5,12,30,20,#0066FF,1.9,0.5,
char_10,195,2.8,12,30,20,#CCFF00,2.2,0.5,
char_11,185,2.9,12,30,20,#FF6B6B,2.3,0.5,
char_12,200,2.7,12,30,20,#00FFFF,2.0,0.5,
char_13,205,2.6,12,30,20,#E6E6FA,2.0,0.5,
char_14,190,2.7,12,30,20,#FF00FF,2.1,0.5,
char_15,225,2.5,12,30,20,#50C878,1.9,0.5,
char_16,180,2.9,12,30,20,#FF007F,2.3,0.5,
char_17,210,2.6,12,30,20,#8F00FF,2.0,0.5,
char_18,200,2.7,12,30,20,#FF7F00,2.0,0.5,
char_19,190,2.8,12,30,20,#FFF700,2.2,0.5,
char_20,200,2.6,12,30,20,#00E5FF,2.0,0.5,
char_21,205,2.6,12,30,20,#B39DDB,2.0,0.5,
char_22,185,2.8,12,30,20,#E91E63,2.2,0.5,
char_23,220,2.5,12,30,20,#008080,1.9,0.5,
char_24,195,2.7,12,30,20,#FFB74D,2.1,0.5,
char_25,210,2.6,12,30,20,#FFFFFF,2.0,0.5,
char_26,190,2.8,12,30,20,#7FFF00,2.2,0.5,
char_27,200,2.6,12,30,20,#80DEEA,2.0,0.5,
char_28,215,2.5,12,30,20,#E0115F,1.9,0.5,
char_29,225,2.5,12,30,20,#0F52BA,1.9,0.5,
```

### `public/tables/player_visual_config.csv`

```csv
key,value,note
pip_count,5,탄창 핍 개수
pip_width_scale,0.16,핍 너비(geometry_size 배율)
pip_height_scale,0.11,핍 높이
pip_gap_scale,0.06,핍 간격
pip_y_scale,0.74,핍 Y(geometry_size 배율)
weapon_offset_x_scale,0.72,총 피벗 X 오프셋
hp_bar_low_pct,0.5,HP바 빨강 전환 임계
hp_bar_y_scale,0.9,HP바 Y
hp_bar_w_scale,1.1,HP바 너비
glow_pulse_period_sec,3,글로우 펄스 주기
glow_pulse_flash_sec,0.6,펄스 플래시 구간
glow_pulse_mult_peak,3,펄스 피크 배율
blink_interval_sec,0.15,무적 깜빡임 간격
silhouette_opacity,0.52,그림자 불투명도
silhouette_y_scale,-0.22,그림자 Y 오프셋
silhouette_blur_px,14,실루엣 블러 반경
aim_indicator_opacity,0.5,조준 지표 투명도
body_sprite_scale,2.2,스프라이트 본체 스케일
body_canvas_scale,1.8,캔버스 본체 스케일
invinc_blink_low_opacity,0.3,무적 깜빡임 최소
invinc_shadow_low_opacity,0.18,무적 시 그림자 최소
move_speed_threshold,0.05,이동 판정 최소 속도
hop_base_scale,0.04,점프 높이 기본(geometry_size 배율)
hop_speed_scale,0.012,속도에 따른 추가 점프
hop_phase_speed_base,8,점프 위상 속도 기본
hop_phase_speed_per_move,5,이동속도당 위상 가속
idle_float_freq,0.002,정지 부유 sin 주파수
idle_float_amp_scale,0.008,정지 부유 진폭(geometry_size 배율)
hop_squash_scale,0.03,착지 스쿼시 강도
exo_shell_scale,1.16,엑소 쉘 크기(geometry_size 배율)
exo_opacity_base,0.16,엑소 기본 투명도
exo_opacity_per_level,0.05,엑소 레벨당 추가
exo_pulse_mid,0.9,엑소 펄스 중심
exo_pulse_amp,0.1,엑소 펄스 진폭
exo_create_opacity,0.22,엑소 생성 시 투명도
exo_depth_z_scale,0.05,엑소 Z(본체 width 배율)
debuff_particle_count,5,디버프 공전 파티클 수
debuff_particle_geo_scale,0.08,디버프 구체 반경(geometry_size 배율)
debuff_particle_radius_base,0.35,공전 반경 기본
debuff_particle_radius_step,0.08,파티클마다 반경 증가
debuff_particle_orbit_speed_base,2.5,공전 속도 기본
debuff_particle_orbit_speed_step,0.6,파티클마다 속도 증가
```

### `public/tables/projectile_config.csv`

```csv
projectile_id,shape,color_hex,size_mult,speed_mult,life_seconds,pierce,bounce_enemy,bounce_screen,bounce_count,homing_turn_rate,gravity
p_kunai,kunai,#FF88AA,1.0,1.0,2.5,0,0,0,0,0.18,0
p_shuriken,kunai,#AAEEFF,1.0,1.3,3.0,1,0,0,0,0.0,0
p_boomerang,boomerang,#00A0FF,1.0,1.0,1.8,1,0,0,0,0.0,0
p_twin_boomerang,torus,#00FFFF,1.0,1.6,1.6,1,0,0,0,0.0,0
p_rocket,rocket,#FF6633,1.0,1.0,3.5,0,0,0,0,0.0,0
p_drone,sphere,#FF533D,1.2,0.945,3.2,0,0,0,0,0.08,0
p_soccer,sphere,#39FF14,1.0,1.0,4.0,0,1,1,6,0.0,0
p_drill,cone,#00FFFF,2.8,0.5,5.0,1,0,1,999,0.0,0
p_shotgun,sphere,#FFCC44,1.0,1.0,1.2,0,0,0,0,0.0,0
p_flask,flask,#FF7A1A,1.2,1.0,1.4,0,0,0,0,0.0,0.45
p_auto_basic,sphere,#AAAAFF,0.7,1.2,1.8,0,0,0,0,0.0,0
p_auto_revolver,sphere,#FFDD88,1.4,1.0,2.2,0,0,0,0,0.06,0
p_auto_shotgun,sphere,#FFB347,0.8,1.1,1.4,0,0,0,0,0.0,0
p_auto_drill,cone,#00DDFF,1.6,0.9,2.5,1,0,0,0,0.0,0
```

### `public/tables/red_dot_config.csv`

```csv
dot_id,category,enabled,hud_path,resolver_key,min_int,bubble_to,note
tycoon_claim,claim,1,/redDot/tycoon/claim,tycoon_milestone_pending,0,,타이쿤 마일스톤 보상 큐 대기
tycoon_lap_guide,action,1,/redDot/tycoon/action,tycoon_lap_complete_pending,0,,10단계 완료·이벤트 창 유도
season_settlement,claim,1,/redDot/season/claim,season_settlement_pending,0,,시즌 토너먼트 정산 미수령
express_claim,claim,1,/redDot/express/claim,express_milestone_pending,0,,익스프레스 마일스톤 보상 큐
express_lap_guide,action,1,/redDot/express/action,express_lap_complete_pending,0,,익스프레스 10단계 완료 유도
lava_claim,claim,1,/redDot/lava/claim,lava_claim_pending,0,,라바 퀘스트 보상 수령 대기
lava_play,action,1,/redDot/lava/action,lava_ticket_ready,1,,라바 티켓 보유·입장 가능
lava_new,new,1,/redDot/lava/new,lava_first_visit,0,,라바 퀘스트 미방문
prize_claim,claim,1,/redDot/prize/claim,prize_claim_pending,0,,프라이즈 드롭 마일스톤 수령
prize_play,action,1,/redDot/prize/action,prize_ball_ready,1,,퍼즐볼 보유·플레이 가능
prize_new,new,1,/redDot/prize/new,prize_first_visit,0,,프라이즈 드롭 미방문
archery_claim,claim,1,/redDot/archery/claim,archery_claim_pending,0,,양궁 라운드 보상 수령 대기
archery_play,action,1,/redDot/archery/action,archery_bow_ready,1,,활대 보유·도전 가능(수령 대기 아님)
archery_new,new,1,/redDot/archery/new,archery_first_visit,0,,양궁 아레나 미방문
event_minigame_stack,action,1,/redDot/event_stack/any,aggregate_event_stack,0,,우측 이벤트 스택 — claim+action+new 합산
mall_claim,claim,1,/redDot/mall/claim,mall_free_claim,0,,쇼핑몰 무료 스텝 수령 가능
mall_new,new,1,/redDot/mall/new,mall_first_visit,0,,쇼핑몰 탭 미방문
drivers_action,action,1,/redDot/drivers/action,drivers_purchase_available,0,,드라이버 구매 가능
drivers_new,new,1,/redDot/drivers/new,drivers_first_visit,0,,드라이버 탭 미방문
express_tab,action,1,/event/redDot/express,aggregate_express_tab,0,,익스프레스 사이드탭 집계
nav_shop_new,new,1,/redDot/nav/shop/new,nav_shop_first_visit,0,,상점 탭 미방문
nav_equip_new,new,1,/redDot/nav/equip/new,nav_equip_first_visit,0,,장비 탭 미방문
nav_equip_upgrade,action,1,/redDot/nav/equip/action,equip_upgrade_available,0,,장비 강화 가능
nav_challenge_new,new,1,/redDot/nav/challenge/new,nav_challenge_first_visit,0,,도전 탭 미방문
nav_challenge_energy,action,1,/redDot/nav/challenge/action,challenge_energy_ready,1,,번개 보유·도전 가능
nav_evolution_new,new,1,/redDot/nav/evolution/new,nav_evolution_first_visit,0,,진화 탭 미방문
nav_evolution_unlock,action,1,/redDot/nav/evolution/action,evolution_unlock_available,0,,진화 해금 가능
nav_shop,action,1,/redDot/nav/shop,aggregate_nav_shop,0,,상점 탭 집계
nav_equip,action,1,/redDot/nav/equip,aggregate_nav_equip,0,,장비 탭 집계
nav_challenge,action,1,/redDot/nav/challenge,aggregate_nav_challenge,0,,도전 탭 집계
nav_evolution,action,1,/redDot/nav/evolution,aggregate_nav_evolution,0,,진화 탭 집계
```

### `public/tables/renderer_config.csv`

```csv
key,value,note
view_scale,4,카메라 줌 배율(map camera_zoom에 곱함)
hud_top_px,52,TopBar 높이(px) 카메라 Y 오프셋
grid_spacing,30,인필드 격자 간격(px)
grid_opacity,0.18,격자 선 투명도
max_frame_dt_sec,0.05,프레임 dt 상한(초)
pixel_ratio_cap,2,devicePixelRatio 상한
```

### `public/tables/rush_config.csv`

```csv
rush_id,start_time_seconds,warning_sec,spawn_count_base,spawn_count_per_stage,spawn_count_max,ring_radius,ring_radius_jitter,rate_dog,rate_basic,rate_spitter,formation,respect_max_enemies,enabled
1,90,2,90,6,150,280,40,0.7,0.3,0.0,ring,0,1
2,270,2,90,6,150,280,40,0.7,0.3,0.0,ring,0,1
3,450,2,90,6,150,280,40,0.7,0.3,0.0,ring,0,1
10,210,3,12,1,18,320,0,0.0,0.0,1.0,column,0,1
11,420,3,15,1,21,320,0,0.0,0.0,1.0,column,0,1
12,600,3,18,1,24,320,0,0.0,0.0,1.0,column,0,1
```

### `public/tables/rush_cycle_config.csv`

```csv
rush_id,warning_sec,spawn_count_base,spawn_count_per_stage,spawn_count_max,ring_radius,ring_radius_jitter,rate_dog,rate_basic,rate_spitter,formation,respect_max_enemies,enabled,note
0,1,48,6,120,320,80,0.6,0.25,0.15,ring,0,1,주기형 러시(GameCore._buildCycleRushWave) — start_time은 런타임
```

### `public/tables/shop_box.csv`

```csv
box_id,sort_order,label,subtitle,gem_cost,key_cost,pity_max,pity_force_grade,key_bonus_chance,banner_title,banner_desc,enabled
resource,1,군 자원상자,일반·우수 장비,80,0,0,,0,,,1
defense,2,지구 방위 보급품,10회 내 엘리트,80,1,10,EPIC,0.08,S급 군 지원품,10회 내 반드시 엘리트 장비 · 천장 시 EPIC,1
```

### `public/tables/shop_box_grade.csv`

```csv
box_id,equipment_grade,weight,grant_fallback_gold
resource,COMMON,50,800
resource,RARE,50,1200
defense,RARE,35,1500
defense,EPIC,40,2500
defense,LEGEND,25,4000
```

### `public/tables/shop_gem_pack.csv`

```csv
pack_id,sort_order,label,gems,bonus_gems,price_krw,enabled
gem_80,1,보석 약간,80,80,1400,1
gem_500,2,보석 한 더미,500,500,7000,1
gem_1200,3,보석 한 뭉큼,1200,1200,14000,1
gem_2500,4,보석 한 보따리,2500,2500,29000,1
gem_6500,5,보석 한 바구니,6500,6500,75000,1
gem_14000,6,보석 한 상자,14000,14000,150000,1
```

### `public/tables/shop_gold_pack.csv`

```csv
pack_id,sort_order,label,sublabel,gold,gem_cost,is_free,enabled
gold_free,1,2시간 순찰 골드,무료,12000,0,1,1
gold_6h,2,6시간 순찰 골드,💎 90,36000,90,0,1
gold_24h,3,24시간 순찰 골드,💎 288,144000,288,0,1
```

### `public/tables/shop_test_config.csv`

```csv
key,value,note
test_cash_krw,1000000,구매 테스트 캐시(미저장)
test_reset_gems,500,리셋 시 보석
show_reset_button,1,상점 리셋 버튼 표시
```

### `public/tables/skill_config.csv`

```csv
skill_id,skill_name,skill_type,icon,description,base_cooldown_frames,base_dmg_mult,projectile_speed,projectile_radius,max_level,max_range,element,projectile_sprite_url,fire_pattern,target_mode,projectile_count,spread_deg,explode_radius,projectile_id,magazine_capacity,burst_interval_frames,reload_frames
kunai,쿠나이,ACTIVE,🔪,가장 가까운 적에게 유도 수리검 사격,60,1.5,8.5,5,5,280,beam,,homing,nearest,1,0,0,p_kunai,0,0,0
boomerang,부메랑,ACTIVE,🪃,조이스틱 방향으로 발사 후 귀환 관통,70,1.5,5.5,7,5,0,,,boomerang,joystick,1,0,0,p_boomerang,0,0,0
molotov,화염병,ACTIVE,🧪,포물선으로 던져 바닥에 화염 장판 생성,90,0.5,6.5,40,5,180,fire,,parabola,random_enemy,2,0,40,p_flask,0,0,0
guardian,수호자,ACTIVE,⚙️,플레이어 주위 공전 블레이드,0,0.9,0,8,5,0,,,orbit,self,1,0,0,,0,0,0
rocket,로켓발사기,ACTIVE,🚀,최근접 적에게 폭발 로켓 발사,60,2.0,7.0,6,5,380,fire,,homing,nearest,1,0,18,p_rocket,0,0,0
drone,미사일 드론 A,ACTIVE,🛸,"우상단 큐브 드론 — 유도 미사일 연사 (공격3초/휴식7초)",20,1.4,8.0,5,5,170,,,drone,nearest,2,15,0,p_drone,0,0,0
drone_b,미사일 드론 B,ACTIVE,🛸,"좌상단 큐브 드론 — 유도 미사일 연사 (공격3초/휴식7초)",20,1.4,8.0,5,5,170,,,drone,nearest,2,15,0,p_drone,0,0,0
ninjaScroll,닌자 스크롤,PASSIVE,📜,EXP 획득량 증가,0,0,0,0,5,0,,,passive,self,0,0,0,,0,0,0
elasticShoes,탄성 신발,PASSIVE,👟,이동속도 증가,0,0,0,0,5,0,,,passive,self,0,0,0,,0,0,0
highFuel,고성능 연료,PASSIVE,⛽,폭발 및 화염 반경 증가,0,0,0,0,5,0,,,passive,self,0,0,0,,0,0,0
exoskeleton,외골격 갑옷,PASSIVE,🛡️,투사체 지속시간 증가,0,0,0,0,5,0,,,passive,self,0,0,0,,0,0,0
soccer_ball,축구공,ACTIVE,⚽,적과 벽에 튕기며 물리 피해,160,1.2,6.0,8,5,0,,,directional,joystick,2,21,0,p_soccer,0,0,0
drill_shot,드릴샷,ACTIVE,🌀,적을 관통하며 튕기는 드릴 발사,150,1.0,7.5,6,5,0,beam,,directional,joystick,2,18,0,p_drill,0,0,0
dimensional_blade,차원 검기,ACTIVE,⚔️,전방 부채꼴 구역에 참격 방출,180,1.5,0,24,5,0,beam,,blade,joystick,3,44,0,,0,0,0
debuff_aura,감쇄 오라,ACTIVE,🟣,주변 적들의 공격력과 이동속도를 감소시킴,120,0.5,0,35,5,0,ice,,aura,self,1,0,0,,0,0,0
lightning,번개 발사기,ACTIVE,⚡,랜덤 적에게 낙뢰 — 주변 적에게 전기 연쇄,80,1.3,0,18,5,360,electric,,chain,random_enemy,1,0,0,,0,0,0
mine,지뢰,ACTIVE,💣,플레이어 주변에 지뢰 설치 — 접촉 시 폭발,110,2.2,0,30,5,0,fire,,ground_self,self,1,0,0,,0,0,0
shotgun,샷건,ACTIVE,🔫,전방으로 산탄 5발 발사,100,0.9,7.0,5,5,220,,,spread,nearest,5,30,0,p_shotgun,0,0,0
energyCube,에너지 큐브,PASSIVE,🔋,모든 스킬 쿨타임 감소,0,0,0,0,5,0,,,passive,self,0,0,0,,0,0,0
fitnessGuide,피트니스 가이드,PASSIVE,💪,최대 HP 증가,0,0,0,0,5,0,,,passive,self,0,0,0,,0,0,0
ammoBooster,탄약 추진기,PASSIVE,🔩,기본 무기 재장전 속도 증가,0,0,0,0,5,0,,,passive,self,0,0,0,,0,0,0
auto_basic,기본 공격,AUTO,🎯,기본 공격 — 가장 가까운 적에게 소형 총알,45,0.8,9.0,3,1,300,,,auto,nearest,1,0,0,p_auto_basic,6,11,108
auto_revolver,리볼버,AUTO,🔫,장전된 대구경 총알 — 크고 묵직한 발사,55,1.2,8.0,5,1,320,,,auto,nearest,1,0,0,p_auto_revolver,6,18,162
auto_shotgun,샷건,AUTO,💥,전방 3방향 산탄 — 근거리 범위 공격,75,0.7,8.5,4,1,200,,,auto_spread,joystick,3,40,0,p_auto_shotgun,4,15,135
auto_drill,드릴건,AUTO,🌀,직진 관통 드릴 — 튕김 없이 앞으로만,65,1.0,7.5,5,1,280,,,auto,nearest,1,0,0,p_auto_drill,5,14,126
```

### `public/tables/skill_evolution_config.csv`

```csv
evolution_id,active_skill_id,passive_skill_id,result_skill_id,result_skill_name,result_description
evo_kunai,kunai,ninjaScroll,ghost_shuriken,유령 수리검,무한 관통 수리검. 선딜레이 소멸
evo_boomerang,boomerang,elasticShoes,twin_boomerang,쌍부메랑,양방향 동시 발사 초고속 부메랑
evo_molotov,molotov,highFuel,napalm,네이팜,화염 반경 2배 + 지속시간 3배
evo_guardian,guardian,exoskeleton,eternal_guardian,영구 수호자,공전 지속시간 무한 고정
evo_rocket,rocket,highFuel,cluster_rocket,클러스터 로켓,폭발 시 소형 로켓 3발 추가 발사
evo_soccer_ball,soccer_ball,elasticShoes,quantum_ball,양자공,초고속으로 적과 벽에 무한 튕기며 분열하는 축구공
evo_drill_shot,drill_shot,exoskeleton,whistling_arrow,휘파람 화살,적 사이를 지그재그로 자동 유도 관통하는 레이저 화살
evo_dimensional_blade,dimensional_blade,highFuel,void_slash,차원 참격,360도 전체 영역의 공간을 찢어 폭풍 피해를 입히는 검기
```

### `public/tables/skill_level_config.csv`

```csv
skill_id,level,dmg_mult_scale,cooldown_reduce_rate,passive_bonus_value
kunai,1,1.0,0.00,0
kunai,2,1.2,0.05,0
kunai,3,1.5,0.10,0
kunai,4,1.8,0.15,0
kunai,5,2.2,0.20,0
boomerang,1,1.0,0.00,0
boomerang,2,1.2,0.05,0
boomerang,3,1.5,0.10,0
boomerang,4,1.8,0.15,0
boomerang,5,2.2,0.20,0
molotov,1,1.0,0.00,0
molotov,2,1.2,0.05,0
molotov,3,1.5,0.10,0
molotov,4,1.8,0.15,0
molotov,5,2.2,0.20,0
guardian,1,1.0,0.00,0
guardian,2,1.2,0.05,0
guardian,3,1.5,0.10,0
guardian,4,1.8,0.15,0
guardian,5,2.2,0.20,0
rocket,1,1.0,0.00,0
rocket,2,1.2,0.05,0
rocket,3,1.5,0.10,0
rocket,4,1.8,0.15,0
rocket,5,2.2,0.20,0
drone,1,1.0,0.00,0
drone,2,1.2,0.05,0
drone,3,1.5,0.10,0
drone,4,1.8,0.15,0
drone,5,2.2,0.20,0
ninjaScroll,1,0,0,0.15
ninjaScroll,2,0,0,0.30
ninjaScroll,3,0,0,0.45
ninjaScroll,4,0,0,0.60
ninjaScroll,5,0,0,0.75
elasticShoes,1,0,0,0.10
elasticShoes,2,0,0,0.20
elasticShoes,3,0,0,0.30
elasticShoes,4,0,0,0.40
elasticShoes,5,0,0,0.50
highFuel,1,0,0,8
highFuel,2,0,0,16
highFuel,3,0,0,24
highFuel,4,0,0,32
highFuel,5,0,0,40
exoskeleton,1,0,0,0.20
exoskeleton,2,0,0,0.40
exoskeleton,3,0,0,0.60
exoskeleton,4,0,0,0.80
exoskeleton,5,0,0,1.00
soccer_ball,1,1.0,0.00,0
soccer_ball,2,1.2,0.05,0
soccer_ball,3,1.5,0.10,0
soccer_ball,4,1.8,0.15,0
soccer_ball,5,2.2,0.20,0
drill_shot,1,1.0,0.00,0
drill_shot,2,1.2,0.05,0
drill_shot,3,1.5,0.10,0
drill_shot,4,1.8,0.15,0
drill_shot,5,2.2,0.20,0
dimensional_blade,1,1.0,0.00,0
dimensional_blade,2,1.2,0.05,0
dimensional_blade,3,1.5,0.10,0
dimensional_blade,4,1.8,0.15,0
dimensional_blade,5,2.2,0.20,0
debuff_aura,1,1.0,0.00,0
debuff_aura,2,1.2,0.05,0
debuff_aura,3,1.5,0.10,0
debuff_aura,4,1.8,0.15,0
debuff_aura,5,2.2,0.20,0


lightning,1,1.0,0.00,0
lightning,2,1.25,0.05,0
lightning,3,1.55,0.10,0
lightning,4,1.9,0.15,0
lightning,5,2.3,0.20,0
mine,1,1.0,0.00,0
mine,2,1.3,0.05,0
mine,3,1.7,0.10,0
mine,4,2.1,0.15,0
mine,5,2.6,0.20,0
shotgun,1,1.0,0.00,0
shotgun,2,1.2,0.05,0
shotgun,3,1.45,0.10,0
shotgun,4,1.75,0.15,0
shotgun,5,2.1,0.20,0
energyCube,1,0,0,0.06
energyCube,2,0,0,0.12
energyCube,3,0,0,0.18
energyCube,4,0,0,0.24
energyCube,5,0,0,0.30
fitnessGuide,1,0,0,80
fitnessGuide,2,0,0,160
fitnessGuide,3,0,0,240
fitnessGuide,4,0,0,320
fitnessGuide,5,0,0,400
auto_basic,1,1.0,0.00,0
auto_revolver,1,1.0,0.00,0
auto_shotgun,1,1.0,0.00,0
auto_drill,1,1.0,0.00,0
drone_b,1,1.0,0.00,0
drone_b,2,1.2,0.05,0
drone_b,3,1.5,0.10,0
drone_b,4,1.8,0.15,0
drone_b,5,2.2,0.20,0
ammoBooster,1,0,0,0.10
ammoBooster,2,0,0,0.20
ammoBooster,3,0,0,0.30
ammoBooster,4,0,0,0.40
ammoBooster,5,0,0,0.50
```

### `public/tables/skill_runtime_config.csv`

```csv
key,value,note
skill_fx_vis_scale,0.6666667,지뢰·폭발 FX 반경 배율(2/3)
shotgun_extra_spread_rad,0.18,산탄 추가 스프레드(rad)
homing_speed_cap,22,유도탄 속도 상한(px/s)
homing_accel_per_sec,18,유도탄 가속(px/s²)
homing_mesh_rot_speed,18,유도 메시 회전(rad/s)
drone_active_sec,3,드론 활성 페이즈(초)
drone_rest_sec_max,7,드론 휴식 최대(초) Lv1
drone_rest_sec_per_level,1,레벨당 휴식 감소(초)
drone_burst_interval,0.18,드론 연사 간격(초)
skill_dmg_scale,10,스킬 base_dmg_mult × level 배율 후 곱
meteor_start_offset_y,300,메테오 시작 Y 오프셋(px)
meteor_speed,420,메테오 낙하 속도(px/s)
mine_spawn_dist_min,40,지뢰 스폰 거리 최소
mine_spawn_dist_rand,60,지뢰 스폰 거리 랜덤
molotov_expand_ratio,0.35,화염존 팽창 비율(수명 대비)
lightning_pick_range,360,번개 1차 타겟 선정 반경(px)
lightning_chain_radius_mult,6,연쇄 반경 = r×배율
lightning_chain_max,3,연쇄 최대 타겟
lightning_chain_dmg_ratio,0.6,연쇄 메테오 dmg 배율
lightning_chain_hit_radius_ratio,0.75,연쇄 hitRadius = r×비율
meteor_warn_ring_inner_ratio,0.6,착지 경고 링 내경 비율
meteor_warn_opacity,0.6,경고 링 불투명
meteor_impact_life_pad,0.3,낙하 수명 +패딩(초)
debuff_aura_life_sec,1.5,디버프 오라 지속(초)
debuff_aura_tick_init,0.1,오라 초기 tickTimer
debuff_aura_scale_min,0.4,오라 스케일 min
debuff_aura_scale_range,0.6,오라 스케일 추가(1-ratio)×
debuff_aura_rot_speed,3,오라 회전 rad/s
debuff_aura_dmg_tick_sec,0.15,오라 피해 틱(초)
debuff_aura_dmg_ratio,0.15,오라 틱 dmg×비율
flame_tick_sec,0.5,화염/나팜 장판 dmg 틱(초)
mine_life_sec,12,지뢰 수명(초)
expire_burst_life_sec,0.28,사거리 소멸 링 VFX(초)
cluster_child_count,3,클러스터 폭발 자식 로켓 수
cluster_child_speed,10,자식 로켓 속도
cluster_child_radius,4,자식 반경
cluster_child_life_mult,1.4,자식 수명 배율
cluster_explosion_flame_life,0.5,클러스터/로켓 폭발 화염 life
cluster_explosion_dmg_ratio,0.8,폭발 화염 dmg×비율
cluster_pending_dmg_ratio,0.45,클러스터 pending dmg×비율
rocket_explosion_radius_mult,3,로켓 폭발 반경×
ghost_spawn_offset,18,고스트 쿠나이 스폰 오프셋
ghost_spread_rad,0.392699,고스트 ±스프레드(rad,≈22.5°)
ghost_speed_mult,1.3,고스트 속도×
ghost_dmg_ratio,0.8,고스트 dmg×
ghost_life_mult,3,고스트 수명×
twin_speed_mult,1.6,트윈 부메랑 속도×
twin_life_mult,1.6,트윈 수명×
napalm_radius_mult,2,나팜 반경×(projectile_radius)
napalm_life_mult,9,나팜 지속×
napalm_dmg_ratio,0.6,나팜 dmg×
napalm_target_jitter,30,나팜 목표 위치 랜덤
napalm_fallback_spread,200,적 없을 때 랜덤 범위
cluster_rocket_life_mult,3.5,클러스터 로켓 수명×
dimensional_speed,5.5,차원검 속도
dimensional_angle_offsets,-0.22|0|0.22,차원검 각 오프셋(rad)
dimensional_radius_mult,2.2,차원검 Ring R×
dimensional_blade_width,2,차원검 링 두께
dimensional_dmg_ratio,0.85,차원검 dmg×
dimensional_hit_radius_ratio,0.8,차원검 hit r×
dimensional_life_mult,0.45,차원검 수명×
quantum_speed_mult,1.5,퀀텀볼 속도×
quantum_dmg_ratio,1.1,퀀텀 dmg×
quantum_radius_mult,1.1,퀀텀 반경×
quantum_life_mult,5,퀀텀 수명×
quantum_bounce_count,9,퀀텀 볼 바운스
quantum_mini_spawn_count,2,퀀텀 분열 미니 수
quantum_mini_bounce_count,3,미니 바운스
quantum_mini_dmg_ratio,0.45,미니 dmg×
quantum_mini_speed_mult,1.15,미니 속도×
quantum_mini_radius_ratio,0.55,미니 반경×
quantum_mini_life_mult,2.5,미니 수명×
whistling_speed_mult,1.4,휘파람 화살 속도×
whistling_dmg_ratio,0.9,휘파람 dmg×
whistling_radius_mult,1.3,휘파람 반경×
whistling_life_mult,6,휘파람 수명×
whistling_turn_rate,0.22,휘파람 유도 turn
void_slash_count,12,보이드 참격 발수
void_slash_speed,3.2,보이드 속도
void_slash_angle_jitter,0.15,보이드 각 랜덤
void_slash_radius_mult,3.5,보이드 Ring R×
void_slash_width,3.2,보이드 링 두께
void_slash_dmg_ratio,1.35,보이드 dmg×
void_slash_hit_radius_ratio,0.6,보이드 hit r×
void_slash_life_mult,0.8,보이드 수명×
drill_shot_offsets,-0.16|0.16,드릴 좌우 오프셋(rad)
drill_speed_mult,0.5,드릴 속도×
drill_radius_mult,2.8,드릴 반경×
drill_life_mult,5,드릴 수명×
drone_offset_x,16,드론 A offsetX (B=-값)
drone_offset_y,14,드론 offsetY
drone_mesh_size,18,드론 PlaneGeometry
drone_bob_speed,4,드론 bob 각속도
drone_bob_amplitude,1.2,드론 bob Z 진폭
drone_tilt,0.1,드론 기울기
drone_tilt_wobble,0.08,드론 흔들림
drone_tilt_wobble_freq,0.6,드론 wobble sin 배율
molotov_arc_rot_speed,12,나팜 포물선 투사체 자전(rad/s)
flame_napalm_rot_speed,0.6,나팜 장판 회전(rad/s)
flame_fire_rot_speed,2.2,화염 장판 회전(rad/s)
flame_napalm_pulse_freq,4,나팜 맥박 sin 배율
blade_ring_rot_speed,7.5,차원검/보이드 링 회전(rad/s)
whistling_arrow_spin_y,14,휘파람 화살 Y 스핀(rad/s)
meteor_fall_rot_speed,8,메테오 낙하 메시 회전(rad/s)
```

### `public/tables/stage_config.csv`

```csv
stage,stage_name,max_enemies_scale,spawn_interval_scale,spawn_interval_min_frames,boss_hp_mult,xp_mult,initial_xp_small,enemy_hp_mult,enemy_speed_mult,enemy_dmg_mult
1,야생 거리,1.00,1.00,10,3.0,1.00,8,1.00,1.00,1.00
2,폐허 지하철,1.10,0.96,9,3.9,1.05,8,1.20,1.05,1.10
3,네온 시가지,1.20,0.92,9,4.8,1.10,8,1.40,1.10,1.20
4,붕괴된 항만,1.30,0.88,8,5.7,1.14,8,1.65,1.15,1.35
5,오염 구역,1.40,0.84,8,6.6,1.18,8,1.90,1.20,1.50
6,버려진 연구소,1.50,0.80,8,7.5,1.22,8,2.20,1.28,1.65
7,지하 격납고,1.62,0.76,7,8.4,1.26,8,2.55,1.35,1.80
8,균열의 틈,1.74,0.72,7,9.3,1.30,8,2.90,1.42,2.00
9,심연 게이트,1.86,0.68,7,10.2,1.33,8,3.30,1.46,2.20
10,프리즘 코어,2.00,0.65,6,11.1,1.35,8,3.80,1.50,2.40
```

### `public/tables/talent_config.csv`

```csv
talent_id,talent_name,description,max_level,effect_per_level
power,공격력 강화,모든 스킬 기본 데미지 +15%,3,0.15
hp,체력 증가,시작 최대 HP +50,3,50
speed,이동속도 증가,기본 이동속도 +8%,3,0.08
exp_boost,경험치 보너스,EXP 획득량 +10%,3,0.10
```

### `public/tables/talent_cost_config.csv`

```csv
talent_id,level,gold_cost
power,1,200
power,2,500
power,3,1000
hp,1,150
hp,2,400
hp,3,800
speed,1,180
speed,2,450
speed,3,900
exp_boost,1,200
exp_boost,2,500
exp_boost,3,1000
```

### `public/tables/ticket_config.csv`

```csv
ticket_id,ticket_name,ticket_tier,multiplier,gem_cost,daily_free_count,icon,acquire_label
basic_ticket,기본권,1,5,0,5,🎫,무료 지급
silver_ticket,실버권,2,15,0,0,🥈,마일스톤 보상
gold_ticket,골드권,3,25,200,0,🥇,상위 보상 / 구매
diamond_ticket,다이아권,4,50,500,0,💎,💎 500 구매
```

### `public/tables/ticket_multiplier_step.csv`

```csv
sort_order,multiplier,note
1,1,입장 배수 단계(에너지 소모 = multiplier × energy_per_mult)
2,2,
3,5,
4,10,
5,50,
6,100,
```

### `public/tables/vfx_config.csv`

```csv
vfx_id,particle_count,particle_size_min,particle_size_max,particle_life_frames,particle_speed,bloom_strength,bloom_radius,bloom_threshold,screen_shake_intensity,screen_shake_duration_frames,flash_duration_frames,particle_color_hex,particle_sprite_url
enemy_death,12,2,6,20,3.5,1.2,0.4,0.1,0,0,0,,
player_hit,8,3,7,18,2.5,0.8,0.3,0.1,0.15,8,9,,
boss_spawn,30,4,10,40,5.0,1.8,0.5,0.05,0.8,48,30,,
boss_hit,6,2,5,12,2.0,1.0,0.3,0.1,0,0,6,,
level_up,20,3,8,30,4.0,1.5,0.4,0.05,0,0,0,,
bomb_use,40,4,12,35,6.0,2.0,0.6,0.05,0.5,20,18,,
explosion,16,3,9,25,4.5,1.4,0.4,0.08,0.3,12,0,,
red_tint_hit,0,0,0,0,0,0,0,0,0.1,5,9,,
```

### `public/tables/wave_config.csv`

```csv
stage,wave_id,start_time_seconds,spawn_interval_frames,max_enemies,rate_basic,rate_dog,rate_bloater,rate_spitter
1,1,0,11,240,1.00,0.00,0.00,0.00
1,2,120,9,320,0.70,0.30,0.00,0.00
1,3,210,7,400,0.45,0.30,0.15,0.10
1,4,360,5,520,0.30,0.20,0.25,0.25
2,1,0,11,240,0.80,0.20,0.00,0.00
2,2,120,8,320,0.60,0.30,0.10,0.00
2,3,210,6,400,0.38,0.27,0.20,0.15
2,4,360,5,520,0.25,0.20,0.28,0.27
3,1,0,10,240,0.70,0.20,0.10,0.00
3,2,120,8,320,0.50,0.28,0.14,0.08
3,3,210,6,400,0.32,0.24,0.24,0.20
3,4,360,5,520,0.20,0.18,0.32,0.30
4,1,0,10,260,0.60,0.20,0.12,0.08
4,2,120,8,340,0.42,0.26,0.18,0.14
4,3,210,6,420,0.26,0.22,0.28,0.24
4,4,360,5,540,0.16,0.16,0.36,0.32
5,1,0,10,260,0.50,0.20,0.16,0.14
5,2,120,7,340,0.34,0.24,0.22,0.20
5,3,210,6,420,0.20,0.20,0.32,0.28
5,4,360,5,560,0.12,0.14,0.40,0.34
6,1,0,10,280,0.42,0.18,0.20,0.20
6,2,120,6,360,0.28,0.22,0.26,0.24
6,3,210,5,440,0.16,0.18,0.36,0.30
6,4,360,5,580,0.10,0.12,0.44,0.34
7,1,0,9,280,0.34,0.16,0.24,0.26
7,2,120,6,360,0.22,0.20,0.30,0.28
7,3,210,5,460,0.12,0.16,0.40,0.32
7,4,360,5,600,0.07,0.10,0.47,0.36
8,1,0,8,300,0.26,0.14,0.30,0.30
8,2,120,6,380,0.16,0.18,0.34,0.32
8,3,210,5,480,0.08,0.14,0.44,0.34
8,4,360,5,620,0.04,0.08,0.52,0.36
9,1,0,8,300,0.18,0.12,0.36,0.34
9,2,120,5,380,0.10,0.16,0.38,0.36
9,3,210,5,500,0.05,0.12,0.47,0.36
9,4,360,5,640,0.02,0.06,0.54,0.38
10,1,0,8,320,0.10,0.10,0.42,0.38
10,2,120,5,400,0.05,0.12,0.45,0.38
10,3,210,5,520,0.02,0.08,0.52,0.38
10,4,360,5,660,0.00,0.05,0.57,0.38
```

### `public/tables/weapon_config.csv`

```csv
weapon_id,item_name,icon,grade,skill_id,description
revolver,레전드 리볼버,🔫,LEGEND,kunai,"가장 가까운 적을 유도 사격하는 권총"
shotgun,스프레드 샷건,💥,EPIC,shotgun,"전방으로 산탄 5발을 퍼붓는 샷건"
drill,파워 드릴건,🌀,EPIC,drill_shot,"적을 관통하고 벽에 튕기는 드릴 발사기"
```

### `public/tables/weapon_visual_config.csv`

```csv
skill_id,weapon_kind,scale,offset_x,offset_y
kunai,revolver,1.0,0.72,0
shotgun,shotgun,1.0,0.72,0
drill_shot,drill,1.0,0.72,0
```



---

## 15. Attached Event CSV Full Contents (public/event/*)

> **배포 SSoT.** AI는 이 내용을 임의 변경하지 말 것. 파일이 repo에 있으면 fetch 경로 그대로 사용.

### `public/event/tycoonSeason/bot_simulator_config.csv`

```csv
key,value,note
tick_sec_cap,15,봇 틱 상한(초) — tournament tick_sec와 min
bot_init_rank_mult,250,초기 TP = rankFactor×이값 + bot_init_base + random×bot_init_rand
bot_init_base,10,
bot_init_rand,40,
bot_effective_points_floor,300,플레이어 0점일 때 봇 성장 기준 하한
bot_growth_rank_top,1.6,상위 봇 growth ratioFactor 상한
bot_growth_rank_span,1.3,상위−하위 ratioFactor 스팬
bot_cap_ratio_top_mult,1.6,상위 봇 capRatio 배율
```

### `public/event/tycoonSeason/event_asset_config.csv`

```csv
asset_key,asset_type,url,fallback_text,width,height
tycoon_coin,icon,,🎈,40,40
season_coin,icon,,🏆,40,40
reward_energy,icon,,⚡,36,36
reward_gold,icon,,💰,36,36
reward_gem,icon,,💎,36,36
reward_dna,icon,,🧬,36,36
reward_sticker,icon,,🃏,36,36
tycoon_banner_bg_top,color,#FF8A2A,,0,0
tycoon_banner_bg_bottom,color,#FFE4A8,,0,0
tycoon_banner_border,color,#FFFFFF,,0,0
tycoon_progress_track,color,#3D2817,,0,0
tycoon_progress_fill,color,#FFB347,,0,0
tycoon_title_text,color,#FFFFFF,,0,0
tycoon_timer_bg,color,#FFFFFF,,0,0
tycoon_timer_text,color,#333333,,0,0
season_widget_bg,color,#152238,,0,0
season_widget_border,color,#4FC3F7,,0,0
season_widget_accent,color,#29B6F6,,0,0
season_title_text,color,#E3F2FD,,0,0
season_badge_bg,color,#0D47A1,,0,0
season_badge_text,color,#FFFFFF,,0,0
lobby_tycoon_card_bg,color,#3D2817,,0,0
lobby_tycoon_card_border,color,#FFB347,,0,0
lobby_season_card_bg,color,#0F2744,,0,0
lobby_season_card_border,color,#4FC3F7,,0,0
enemy_normal,icon,,👾,40,40
enemy_boss,icon,,👹,40,40
enemy_mini_boss,icon,,👿,40,40
help_arrow,icon,,➜,24,24
tournament_hero,icon,,🏆,120,72
tournament_tab_icon,icon,,🏆,48,48
modal_border_color,color,#9C7BD8,,0,0
modal_bg_color,color,#E8D4F8,,0,0
row_player_bg,color,#B3E5FC,,0,0
reward_lock,icon,,🔒,36,36
```

### `public/event/tycoonSeason/event_board_config.csv`

```csv
event_id,event_name,event_kind,group_size,currency_asset_key,milestone_group_id,theme_key,duration_hours,tick_min,enabled
10001,겨울 타이쿤 챌린지,TYCOON_MILEAGE,0,tycoon_coin,mg_ty_01,tycoon_default,72,10,1
10002,시즌 익스프레스,SEASON_EXPRESS,50,season_coin,mg_se_01,season_default,72,30,1
```

### `public/event/tycoonSeason/event_express_config.csv`

```csv
event_id,event_name,duration_hours,reward_asset_key,icon_key
10002,스프린트 익스프레스,12,reward_dice,express_icon
```

### `public/event/tycoonSeason/event_help_acquire_config.csv`

```csv
event_kind,target_type,row_title,kills_required,reward_label,left_icon_key,reward_icon_key,sort_order
TYCOON_MILEAGE,normal,일반 몬스터,10,1장,enemy_normal,tycoon_coin,1
TYCOON_MILEAGE,boss,중간 보스,1,1장,enemy_mini_boss,tycoon_coin,2
SEASON_TOURNAMENT,normal,일반 몬스터,50,1장,enemy_normal,season_coin,1
SEASON_TOURNAMENT,boss,최종 보스,2,1장,enemy_boss,season_coin,2
SEASON_EXPRESS,normal,일반 몬스터,50,1장,enemy_normal,season_coin,1
SEASON_EXPRESS,boss,최종 보스,2,1장,enemy_boss,season_coin,2
```

### `public/event/tycoonSeason/event_help_config.csv`

```csv
help_id,event_kind,title,subtitle,acquire_section_title,mission_section_title,body_1,body_2,body_3,body_4,point_icon_asset
tycoon_help,TYCOON_MILEAGE,겨울 타이쿤 챌린지,타이쿤 이벤트,재화 획득 방법,마일스톤 미션,아래 조건으로 타이쿤 재화를 모읍니다.,번개 배수(입장 시 선택)만큼 한 번에 더 많이 받을 수 있습니다.,마일스톤 목표에 도달하면 보상을 수령합니다.,상단 주황 바에서 진행도를 확인하세요.,tycoon_coin
season_help,SEASON_TOURNAMENT,시즌 익스프레스,시즌 토너먼트,재화 획득 방법,순위 경쟁,아래 조건으로 토너먼트 점수(재화)를 모읍니다.,같은 점수가 50명 순위에 실시간 반영됩니다.,이벤트 종료 후 순위에 따라 시즌 코인을 받습니다.,이벤트 종료 시 순위 보상을 수집하세요.,season_coin
express_help,SEASON_EXPRESS,시즌 익스프레스,스프린트 익스프레스,재화 획득 방법,순위 경쟁,처치 시 시즌 점수와 타이쿤 TP가 각각 쌓입니다.,번개 배수를 올리면 두 재화 모두 더 많이 받습니다.,50명 순위에 실시간 반영됩니다.,이벤트 종료 시 순위 보상을 수집하세요.,season_coin
```

### `public/event/tycoonSeason/event_kill_reward_config.csv`

```csv
enemy_id,tycoon_point_base,season_point_base,is_boss
basic,3,2,false
dog,3,2,false
bloater,4,3,false
spitter,4,3,false
mini_boss,15,0,false
crusher,15,0,false
nexus,15,0,false
final_boss,0,25,true
```

### `public/event/tycoonSeason/event_milestone_config.csv`

```csv
milestone_group_id,step,required_point,reward_bundle_id,reward_asset_key,reward_qty_label
mg_ty_01,1,400,reward_energy_25,reward_energy,×25
mg_ty_01,2,1200,reward_gold_500,reward_gold,×500
mg_ty_01,3,2400,reward_energy_40,reward_energy,×40
mg_ty_01,4,4000,reward_dna_1,reward_dna,×1
mg_ty_01,5,6000,reward_gem_50,reward_gem,×50
mg_ty_01,6,8400,reward_gold_1000,reward_gold,×1000
mg_ty_01,7,11200,reward_energy_60,reward_energy,×60
mg_ty_01,8,14400,reward_dna_3,reward_dna,×3
mg_ty_01,9,18000,reward_gem_150,reward_gem,×150
mg_ty_01,10,22000,reward_gem_300_gold_3000,reward_gem,×300
mg_se_01,1,400,reward_energy_20,reward_energy,×20
mg_se_01,2,1200,reward_gold_300,reward_gold,×300
mg_se_01,3,2400,reward_energy_30,reward_energy,×30
mg_se_01,4,4000,reward_dna_1,reward_dna,×1
mg_se_01,5,6000,reward_gem_30,reward_gem,×30
mg_se_01,6,8400,reward_gold_800,reward_gold,×800
mg_se_01,7,11200,reward_energy_50,reward_energy,×50
mg_se_01,8,14400,reward_dna_2,reward_dna,×2
mg_se_01,9,18000,reward_gem_100,reward_gem,×100
mg_se_01,10,22000,reward_gem_200_gold_2000,reward_gem,×200
```

### `public/event/tycoonSeason/event_ui_theme_config.csv`

```csv
theme_key,prop_key,value
tycoon_default,banner_radius,22
tycoon_default,banner_height,56
tycoon_default,title_font_size,15
tycoon_default,progress_font_size,14
tycoon_default,timer_font_size,11
tycoon_default,bg_top_color,tycoon_banner_bg_top
tycoon_default,bg_bottom_color,tycoon_banner_bg_bottom
tycoon_default,border_color,tycoon_banner_border
tycoon_default,track_color,tycoon_progress_track
tycoon_default,fill_color,tycoon_progress_fill
tycoon_default,title_color,tycoon_title_text
tycoon_default,timer_bg_color,tycoon_timer_bg
tycoon_default,timer_text_color,tycoon_timer_text
season_default,side_widget_width,96
season_default,side_widget_top,118
season_default,leaderboard_row_height,36
season_default,title_font_size,11
season_default,widget_bg_color,season_widget_bg
season_default,widget_border_color,season_widget_border
season_default,widget_accent_color,season_widget_accent
season_default,title_color,season_title_text
season_default,badge_bg_color,season_badge_bg
season_default,badge_text_color,season_badge_text
season_default,modal_border_color,modal_border_color
season_default,modal_bg_color,modal_bg_color
season_default,row_player_bg,row_player_bg
season_default,side_widget_right,8
season_default,side_widget_top,140
lobby_promo_default,card_gap,8
lobby_promo_default,card_height,72
lobby_promo_default,tycoon_bg_color,lobby_tycoon_card_bg
lobby_promo_default,tycoon_border_color,lobby_tycoon_card_border
lobby_promo_default,season_bg_color,lobby_season_card_bg
lobby_promo_default,season_border_color,lobby_season_card_border
```

### `public/event/tycoonSeason/season_class_config.csv`

```csv
class_level,class_name,required_coins,tournament_reward_rate,instant_bundle_id
1,타이쿤 클래스,0,1.0,bundle_class_1
2,퍼스트 클래스,15,1.05,bundle_class_2
3,프리미어 클래스,35,1.10,bundle_class_3
4,디럭스 클래스,60,1.15,bundle_class_4
5,엘리트 클래스,90,1.20,bundle_class_5
```

### `public/event/tycoonSeason/tournament_bot_name_pool.csv`

```csv
name
하늘바람
별빛나래
초록고양이
바다물결
노을빛
은하수
바람결
새벽별
민트향
라일락
코코넛
피치맛
레몬티
베리맛
카카오
우주탐험
모험가
방랑자
여행자
탐험대
붉은여우
푸른늑대
작은토끼
느긋한곰
반짝사슴
철벽수호
빛의검
바람의활
고요한법
따뜻한힐
루나킹
솔라퀸
미스티
아쿠아
테라
진주님
옥이
수정이
마블
코랄
서준
민서
지후
수아
예린
도윤
하은
시우
유나
준호
게임왕초보
주말전사
퇴근후플레이
커피한잔
밤올빼미
행운아
평화주의
느린거북
빠른토끼
조용한관찰자
```

### `public/event/tycoonSeason/tournament_config.csv`

```csv
key,value,description
group_size,50,토너먼트 고정 인원(본인+봇)
tick_sec,200,봇 TP 갱신 간격(초) — event_board tick_min 우선, 기본 30분
difficulty,low,봇 난이도 프로필
player_cap_ratio,0.72,봇 TP 상한=플레이어×비율
growth_ratio,0.45,틱당 성장 기준 비율
variance_min,0.85,봇 랜덤 변동 하한
variance_max,1.0,봇 랜덤 변동 상한
bot_floor_ratio,0.25,봇 TP 하한=플레이어×비율
```

### `public/event/tycoonSeason/tournament_rank_reward_config.csv`

```csv
event_id,rank_from,rank_to,bundle_id,season_coins,dice_label,cash_label,pack_asset_key,token_label
10002,1,1,bundle_rank_1,20,1600,33.2M,reward_sticker,20
10002,2,3,bundle_rank_2_3,15,900,16.6M,reward_dice,18
10002,4,10,bundle_rank_4_10,10,700,12.5M,reward_gold,16
10002,11,25,bundle_rank_11_25,5,400,8.0M,reward_dice,10
10002,26,50,bundle_rank_26_50,1,200,3.0M,reward_gold,5
```

### `public/event/lavaQuest/lq_bot_config.csv`

```csv
bot_id,display_name,avatar_emoji,x_offset,sprite_url
bot_001,무장윤씨1,🔥,-3.8,
bot_002,철위권씨2,⚔️,-3.2,
bot_003,빙결강씨3,🛡️,-2.4,
bot_004,뇌전염씨4,🗡️,-1.5,
bot_005,금강최씨5,🏹,-0.6,
bot_006,암향한씨6,🦆,0.4,
bot_007,은주이씨7,🐉,1.3,
bot_008,맹렬장씨8,⭐,2.2,
bot_009,은신남씨9,💎,2.9,
bot_010,돌격조씨10,🎲,3.5,
bot_011,용사서씨11,🌋,4.0,
bot_012,화염정씨12,🪨,-3.5,
bot_013,산적신씨13,👑,-2.9,
bot_014,궁수박씨14,🐴,-1.8,
bot_015,무장임씨15,🦅,-0.2,
bot_016,철위김씨16,👤,0.8,
bot_017,빙결윤씨17,🔥,1.8,
bot_018,뇌전권씨18,⚔️,2.8,
bot_019,금강강씨19,🛡️,3.2,
bot_020,암향염씨20,🗡️,-4.0,
bot_021,은주최씨21,🏹,3.9,
bot_022,맹렬한씨22,🦆,-2.1,
bot_023,은신이씨23,🐉,-1.3,
bot_024,돌격장씨24,⭐,-0.8,
bot_025,용사남씨25,💎,-0.1,
bot_026,화염조씨26,🎲,-2.8,
bot_027,산적서씨27,🌋,-2.0,
bot_028,궁수정씨28,🪨,-1.0,
bot_029,무장신씨29,👑,2.7,
bot_030,철위박씨30,🐴,-3.35,
bot_031,빙결임씨31,🦅,-2.5,
bot_032,뇌전김씨32,👤,-3.67,
bot_033,금강윤씨33,🔥,-1.94,
bot_034,암향권씨34,⚔️,-0.45,
bot_035,은주강씨35,🛡️,-1.71,
bot_036,맹렬염씨36,🗡️,-2.93,
bot_037,은신최씨37,🏹,-3.81,
bot_038,돌격한씨38,🦆,-1.62,
bot_039,용사이씨39,🐉,-0.35,
bot_040,화염장씨40,⭐,-0.75,
bot_041,산적남씨41,💎,-1.12,
bot_042,궁수조씨42,🎲,-1.92,
bot_043,무장서씨43,🌋,-2.71,
bot_044,철위정씨44,🪨,-2.62,
bot_045,빙결신씨45,👑,-0.05,
bot_046,뇌전박씨46,🐴,-0.55,
bot_047,금강임씨47,🦅,-3.8,
bot_048,암향김씨48,👤,-3.2,
bot_049,은주윤씨49,🔥,-2.4,
bot_050,맹렬권씨50,⚔️,-1.5,
bot_051,은신강씨51,🛡️,-0.6,
bot_052,돌격염씨52,🗡️,0.4,
bot_053,용사최씨0,🏹,1.3,
bot_054,화염한씨1,🦆,2.2,
bot_055,산적이씨2,🐉,2.9,
bot_056,궁수장씨3,⭐,3.5,
bot_057,무장남씨4,💎,4.0,
bot_058,철위조씨5,🎲,-3.5,
bot_059,빙결서씨6,🌋,-2.9,
bot_060,뇌전정씨7,🪨,-1.8,
bot_061,금강신씨8,👑,-0.2,
bot_062,암향박씨9,🐴,0.8,
bot_063,은주임씨10,🦅,1.8,
bot_064,맹렬김씨11,👤,2.8,
bot_065,은신윤씨12,🔥,3.2,
bot_066,돌격권씨13,⚔️,-4.0,
bot_067,용사강씨14,🛡️,3.9,
bot_068,화염염씨15,🗡️,-2.1,
bot_069,산적최씨16,🏹,-1.3,
bot_070,궁수한씨17,🦆,-0.8,
bot_071,무장이씨18,🐉,-0.1,
bot_072,철위장씨19,⭐,-2.8,
bot_073,빙결남씨20,💎,-2.0,
bot_074,뇌전조씨21,🎲,-1.0,
bot_075,금강서씨22,🌋,2.7,
bot_076,암향정씨23,🪨,-3.35,
bot_077,은주신씨24,👑,-2.5,
bot_078,맹렬박씨25,🐴,-3.67,
bot_079,은신임씨26,🦅,-1.94,
bot_080,돌격김씨27,👤,-0.45,
bot_081,용사윤씨28,🔥,-1.71,
bot_082,화염권씨29,⚔️,-2.93,
bot_083,산적강씨30,🛡️,-3.81,
bot_084,궁수염씨31,🗡️,-1.62,
bot_085,무장최씨32,🏹,-0.35,
bot_086,철위한씨33,🦆,-0.75,
bot_087,빙결이씨34,🐉,-1.12,
bot_088,뇌전장씨35,⭐,-1.92,
bot_089,금강남씨36,💎,-2.71,
bot_090,암향조씨37,🎲,-2.62,
bot_091,은주서씨38,🌋,-0.05,
bot_092,맹렬정씨39,🪨,-0.55,
bot_093,은신신씨40,👑,-3.8,
bot_094,돌격박씨41,🐴,-3.2,
bot_095,용사임씨42,🦅,-2.4,
bot_096,화염김씨43,👤,-1.5,
bot_097,산적윤씨44,🔥,-0.6,
bot_098,궁수권씨45,⚔️,0.4,
bot_099,무장강씨46,🛡️,1.3,
bot_100,철위염씨47,🗡️,2.2,
```

### `public/event/lavaQuest/lq_elimination_schedule.csv`

```csv
level,bot_id,delay_ms
1,bot_030,366
1,bot_094,489
1,bot_004,717
1,bot_098,695
1,bot_021,917
1,bot_036,1116
1,bot_049,1076
1,bot_046,1221
1,bot_044,1467
1,bot_005,1548
1,bot_078,1583
1,bot_003,1751
1,bot_019,1785
1,bot_054,1929
1,bot_064,2070
1,bot_009,2227
1,bot_025,2277
1,bot_043,2410
1,bot_051,2489
1,bot_058,2642
1,bot_096,2727
1,bot_069,2873
1,bot_089,3052
1,bot_061,3124
1,bot_093,3200
1,bot_035,3412
1,bot_040,3478
1,bot_062,3660
2,bot_047,618
2,bot_077,653
2,bot_071,797
2,bot_013,910
2,bot_076,1088
2,bot_100,1302
2,bot_080,1392
2,bot_087,1647
2,bot_023,1747
2,bot_006,1900
2,bot_032,2140
2,bot_048,2197
2,bot_091,2521
2,bot_065,2671
2,bot_034,2786
2,bot_085,2968
2,bot_002,2994
2,bot_024,3295
2,bot_017,3423
2,bot_063,3516
3,bot_008,580
3,bot_027,671
3,bot_070,734
3,bot_086,925
3,bot_060,922
3,bot_029,951
3,bot_052,1193
3,bot_038,1085
3,bot_033,1164
3,bot_082,1385
3,bot_041,1370
3,bot_007,1446
3,bot_066,1650
3,bot_088,1572
3,bot_028,1775
4,bot_059,647
4,bot_012,912
4,bot_053,880
4,bot_045,1005
4,bot_057,1174
4,bot_037,1279
4,bot_010,1498
4,bot_016,1593
4,bot_097,1602
4,bot_022,1872
4,bot_026,1841
4,bot_072,2035
5,bot_084,770
5,bot_015,1035
5,bot_099,1229
5,bot_011,1225
5,bot_014,1514
5,bot_031,1558
5,bot_092,1811
5,bot_081,1892
6,bot_050,848
6,bot_056,1005
6,bot_018,1169
6,bot_073,1248
6,bot_067,1155
7,bot_020,1050
7,bot_039,1215
7,bot_075,1346
```

### `public/event/lavaQuest/lq_event_config.csv`

```csv
event_id,event_name,group_size,total_levels,duration_hours,grand_prize,share_count_demo
lq_001,용암 퀘스트 1회차,100,7,0.5,10000,9
```

### `public/event/lavaQuest/lq_level_config.csv`

```csv
level,difficulty_label,target_clear_rate,tip_text,bg_sprite_url
1,쉬움,0.72,첫 레벨! 가볍게 시작하세요,
2,보통,0.52,집중력이 필요합니다,
3,약간 까다로움,0.4,리듬을 잃지 마세요,
4,어려움,0.31,한 번 더 확인하고 도전해요,
5,매우 어려움,0.22,상위 생존자만 남습니다,
6,극한,0.14,실수 하나가 치명적입니다,
7,매우 어려움,0.09,최후의 도전!,
```

### `public/event/lavaQuest/lq_stage_reward.csv`

```csv
level,reward_type,reward_amount,reward_param,reward_icon,reward_label
1,gold,500,,🪙,골드 500
2,lightning,5,,🔋,번개 5
3,gem,10,,💎,보석 10
4,gold,1500,,🪙,골드 1.5K
5,equip,1,lava_blade,⚔️,용암 검
6,gem,30,,💎,보석 30
7,gem,200,,💎,보석 200
7,equip,1,prize_crown,👑,황금 왕관
```

### `public/event/prizeDrop/game_data/01_slot_lightning.csv`

```csv
slot_index,reward_lightning,is_jackpot,weight,slot_color,sprite_url
0,1,false,30,#a0ff60,
1,10,false,100,#a0ff60,
2,20,false,60,#a0ff60,
3,100,true,10,#ffd700,
4,20,false,60,#a0ff60,
5,10,false,100,#a0ff60,
6,1,false,30,#a0ff60,
```

### `public/event/prizeDrop/game_data/02_multiplier.csv`

```csv
level,value,visual_style,token_cost
1,1,normal,1
2,2,bronze,2
3,5,silver,5
4,10,gold,10
```

### `public/event/prizeDrop/game_data/03_milestone.csv`

```csv
step,threshold_lightning,reward_type,reward_amount,reward_icon,reward_label,reward_item_id
1,100,gold,500,🪙,골드,
2,200,lightning,5,⚡,번개,
3,300,gem,10,💎,보석,
4,400,gold,2000,🪙,골드,
5,500,equip,1,👑,황금 왕관,prize_crown
```

### `public/event/prizeDrop/game_data/04_board_obstacle.csv`

```csv
obstacle_id,type,cx,cy,radius,reward_type,reward_amount,sprite_url
reward_L,circle,90,150,30,Coin,1660000,
reward_C,circle,180,100,28,Dice,20,
reward_R,circle,270,150,30,Dice,20,
top_L_1,pin,70,60,5,,,
top_R_1,pin,290,60,5,,,
top_L_2,pin,120,40,5,,,
top_R_2,pin,240,40,5,,,
top_L_3,pin,165,30,5,,,
top_R_3,pin,195,30,5,,,
arrow_L_top,triangle,0,80,32,None,0,
arrow_R_top,triangle,360,80,32,None,0,
arrow_L_mid,triangle,0,210,32,None,0,
arrow_R_mid,triangle,360,210,32,None,0,
arrow_L_bot,triangle,0,330,32,None,0,
arrow_R_bot,triangle,360,330,32,None,0,
diamond_L1,diamond,100,320,5,None,0,
diamond_L2,diamond,140,320,5,None,0,
diamond_bot,diamond,180,320,5,None,0,
diamond_R1,diamond,220,320,5,None,0,
diamond_R2,diamond,260,320,5,None,0,
mid_L_2,pin,100,240,5,,,
mid_R_2,pin,260,240,5,,,
mid_L_3,pin,150,280,5,,,
mid_R_3,pin,210,280,5,,,
mid_L_4,pin,165,210,5,,,
mid_R_4,pin,195,210,5,,,
bump_0,rect,51,366,5,None,0,
bump_1,rect,103,366,5,None,0,
bump_2,rect,154,366,5,None,0,
bump_3,rect,206,366,5,None,0,
bump_4,rect,257,366,5,None,0,
bump_5,rect,309,366,5,None,0,
```

### `public/event/archeryArena/aa_attempt_config.csv`

```csv
attempt_id,event_id,attempt_type,label,cost_dice,score_min,score_max,attempt_multiplier,hit_zone,has_set_bonus,sprite_url
1,1,SINGLE,1회 단독 시도,1,1,3,1.0,OUTER,false,
2,1,SET3,3회 세트 시도,3,5,10,1.5,MIDDLE,true,
3,1,SET5,5회 세트 시도,5,20,50,2.5,CENTER,true,
```

### `public/event/archeryArena/aa_bundle_reward_config.csv`

```csv
bundle_id,reward_kind,reward_amount,reward_slot_id,note
2001,gem,120,,순위 1위 GRAND
2002,gem,80,,순위 2~3위 HIGH
2003,gem,50,,순위 4~10위 MIDDLE
2004,gold,5000,,순위 11~20위 BASIC
2005,gold,2000,,순위 21~50위 ENTRY
```

### `public/event/archeryArena/aa_event_config.csv`

```csv
event_id,event_name,group_size,min_level,event_duration_hours,daily_free_attempts,bullseye_base_prob,bullseye_max_prob,bullseye_combo_increment,bot_tick_min_ms,bot_tick_max_ms
1,양궁 아레나 시즌1,50,20,48,1,0.05,0.15,0.01,8000,15000
```

### `public/event/archeryArena/aa_integration_config.csv`

```csv
config_key,config_value,description
tournament_round_min,30,토너먼트 1라운드 길이(분). endMs = now + 이 값
bot_tick_ms,60000,봇 점수 갱신 간격(ms). 0이면 aa_event_config bot_tick_min_ms~max 랜덤
shots_per_bow,5,활대 1개 소비 시 WebGL 연속 발사 횟수(SET5 점수표 사용)
event_meta_version,3,aa_event_meta localStorage v (불일치 시 메타 리셋)
starter_bow_stands,5,PRISM 호스트 최초·마이그레이션 지급 활대 개수
kills_per_bow_host,100,PRISM 스퀘어 적 처치 N마리당 활대 +1
storage_key_prism_host,prism_archery_host_v1,호스트 재화·수령대기 저장 키
storage_key_player,aa_player_state,iframe 플레이어 점수·순위 저장 키
storage_key_event_meta,aa_event_meta,iframe 토너먼트 라운드 종료·claimPending
iframe_deploy_base,/event/archeryArena/,Vite base URL·CSV fetch 기준 경로
minigame_id,archery,eventMinigameRegistry 슬롯 id
minigame_src,/event/archeryArena/index.html,iframe src
```

### `public/event/archeryArena/aa_rank_reward_config.csv`

```csv
reward_config_id,event_id,rank_min,rank_max,reward_grade,reward_bundle_id
1,1,1,1,GRAND,2001
2,1,2,3,HIGH,2002
3,1,4,10,MIDDLE,2003
4,1,11,20,BASIC,2004
5,1,21,50,ENTRY,2005
```

### `public/event/archeryArena/aa_visual_config.csv`

```csv
visual_config_id,event_id,arrow_flight_ms,trail_fade_ms,hit_ring_pulse_ms,score_popup_total_ms,bullseye_particle_count,bullseye_particle_radius_px,bullseye_particle_duration_ms,bullseye_countup_ms,ortho_view_half_height,backdrop_sprite_url,outer_sprite_url,middle_sprite_url,center_sprite_url,bullseye_sprite_url
1,1,300,500,200,1000,15,100,1500,800,10,,,,,
```

### `public/event/mallMarvels/mm_event_config.csv`

```csv
event_id,title,intro_tip,duration_hours,duration_minutes,hero_image,enabled
mall_marvels_01,쇼핑몰의 경이로움,각각의 팩을 잠금 해제하면 더 많은 보상을 받을 수 있습니다.,34,10,,1
```

### `public/event/mallMarvels/mm_step_config.csv`

```csv
step_id,event_id,sort_order,prereq_step_id,cost_type,gem_cost,price_krw,card_color,button_label_override
1,mall_marvels_01,1,0,FREE,0,0,#FFE8F0,
2,mall_marvels_01,2,1,FREE,0,0,#FFF0E8,
3,mall_marvels_01,3,2,GEMS,90,0,#E8F4FF,
4,mall_marvels_01,4,3,CASH_KRW,0,4400,#F0FFE8,
5,mall_marvels_01,5,4,GEMS,120,0,#FFF8E8,
6,mall_marvels_01,6,5,CASH_KRW,0,7000,#F8E8FF,
```

### `public/event/mallMarvels/mm_step_reward.csv`

```csv
step_id,reward_type,reward_qty,reward_param,icon_asset_key,label
1,energy,35,,bolt,⚡ 35
2,meta_gold,35400,,coin,🪙 35.4K
3,open_box,1,resource,box,📦 군자원상자
4,meta_gold,80000,,coin,🪙 80K
5,equip_lv,1,,equip,⚔️ 장비 Lv+1
6,open_box,1,defense,box,🎁 지구방위
6,energy,100,,bolt,⚡ 100
```

### `public/event/driversJoy/dj_event_config.csv`

```csv
event_id,title,duration_hours,duration_minutes,max_purchase_per_player,price_krw,side_tab_label,banner_image,enabled
drivers_joy_01,드라이버의 기쁨,10.6,10,2,4400,드라이버,,1
```

### `public/event/driversJoy/dj_reward_config.csv`

```csv
event_id,sort_order,reward_type,reward_qty,reward_param,icon_asset_key,label
drivers_joy_01,1,energy,80,,bolt,⚡ 80
drivers_joy_01,2,meta_gold,50000,,coin,🪙 50K
drivers_joy_01,3,open_box,1,defense,box,🎁 지구방위 1회
```

# 라이브 세일 이벤트 — 공통 기획 인덱스

> **목적:** 모노폴리 GO식 **좌측 아이콘 + 팝업** 세일 2종을 `src/eventSystem` 아래 **독립 모듈**로 설계한다.  
> **대상:** 기획 리드 검토용 (구현 전).  
> **상세 스펙:** 각 폴더 `GAME.md` 참고.  
> **갱신 (2026-06-03):** §9 — 로비 **iframe 미니게임**(라바·퍼즐) 단일 호스트 구현·세일과의 공존 규칙.

---

## 1. 두 이벤트 한눈에

| | 드라이버의 기쁨 | 쇼핑몰의 경이로움 |
|--|----------------|------------------|
| **모노 레퍼런스** | 단일 IAP 패키지 팝업 | 순차 해금 「팩」 사다리 |
| **핵심 루프** | 보고 → ₩결제 → 즉시 보상 수령 | 1단계씩 해금 → 무료/유료 수령 → 다음 단계 공개 |
| **진행 재화** | 없음 (마일리지 누적 X) | 없음 (TP 누적 X) |
| **잠금** | 구매 횟수(2/2)·이벤트 종료 | **이전 단계 미수령 시 다음 단계 잠금** |
| **결제** | 처음부터 **캐시(원)** | 앞은 **무료**, 뒤는 **캐시/보석** 혼합 |
| **폴더** | `src/eventSystem/driversJoy/` | `src/eventSystem/mallMarvels/` |
| **tycoonSeason 재사용** | UI 톤·타이머·에셋 CSV 패턴만 | **단계·prereq 체인** 개념만 (TP 마일리지 바 아님) |

---

## 2. tycoonSeason(마일리지) 재사용 판단

| 항목 | 재사용? | 이유 |
|------|---------|------|
| TP + 킬 적립 | **아니오** | 세일은 「한 번에 사기 / 한 칸씩 받기」지 누적 게이지가 아님 |
| `event_milestone_config` UI 바 | **아니오** | 쇼핑몰은 **세로 사다리** UX |
| `EventHelpPopup` 레이아웃 | **참고만** | 헤더·섹션·버튼 톤 복제 |
| `event_asset_config` / theme CSV | **예** | 아이콘·색·fallback 통일 |
| `EventBridge` 패턴 | **예 (이름 분리)** | `SalesEventBridge` — 보상 지급·결제만 호스트에 위임 |
| `eventExternalStore` | **아니오** | 모듈별 **전용 store** (`/driversJoy/*`, `/mallMarvels/*`) |

**결론:** 마일리지 **시스템을 붙이지 않고**, 이벤트 공통 **연동 규약(브릿지·CSV·jsonRender 3종)** 만 맞춘다.

---

## 3. 모듈 공통 구조 (Lava Quest / prize-drop 동형)

```
src/eventSystem/{moduleName}/
  GAME.md              ← 기획 SSoT (이번에 작성)
  DEV.md               ← 구현·호스트 연동 (2차)
  index.ts             ← export + EVENT_REGISTRY 등록
  data.ts              ← CSV 로더
  store/               ← 전용 external store
  core/                ← Controller (상태·구매·단계)
  host/                ← HostBridge 인터페이스
  jsonRender/          ← spec + registry + UI
  (선택) dev/          ← Vite 단독 실행 — 타 게임 이식용

public/event/{moduleName}/
  *.csv
```

**호스트(PRISM) 연동 2안**

| 안 | 설명 | 추천 |
|----|------|------|
| A. **오버레이** | 호스트 `App.tsx`에 jsonRender 슬롯 + 좌측 탭 | PRISM에 빠르게 붙일 때 |
| B. **iframe** | Lava Quest처럼 `/event/.../index.html` | **타 게임 이식** 우선이면 B |

기획 단계 **추천:** 코어는 **A+B 공통 Controller** — UI만 오버레이/iframe 갈아끼기.

---

## 4. 호스트(스퀘어)에 필요한 최소 API

```ts
// 개념 — 구현 시 host/SalesHostBridge.ts
interface SalesHostBridge {
  grantRewards(bundle: RewardLine[]): void;
  trySpendCashKrw(amount: number): boolean;   // shop metaCashKrw 연동
  trySpendGems(amount: number): boolean;
  getWallet(): { cashKrw; gems; gold; energy };
  onPurchaseComplete?(eventId: string, stepId?: number): void;
}
```

- **드라이버:** `trySpendCashKrw(4400)` → 성공 시 보상 일괄 지급  
- **쇼핑몰:** 단계별 `cost_type` → FREE는 즉시, GEMS/CASH는 차감 후 해당 단계 보상만

---

## 5. 로비 UI (모노 GO 좌측 란)

| 요소 | 드라이버 | 쇼핑몰 |
|------|----------|--------|
| 아이콘 | 🚗 + 타이머 뱃지 | 🛍️ + 타이머 뱃지 |
| 알림 점 | 미수령 무료 단계 있을 때 (쇼핑몰) / 미구매 패키지 (드라이버) | |
| 탭 위치 | **화면 왼쪽** 세로 스택 (Lava/Prize·시즌은 **오른쪽** 유지) |
| 표시 조건 | `showDriversJoy` / `showMallMarvels` (로비 플래그, 메뉴 ON/OFF) |

기존 `EventMiniCards`·타이쿤 바와 **z-index·top** 은 `eventHudLayout.ts`에 슬롯 추가.

**미니게임(라바·퍼즐)과 겹침 방지:** 세일 팝업·다른 풀스크린 UI 진입 시 `hideEventMinigameForOverlay()` → iframe 미니게임 **완전 닫기** (§9).

---

## 6. 구현 순서 제안

1. **쇼핑몰의 경이로움** — 무료 단계·잠금·CSV만으로도 플레이 검증 가능  
2. **드라이버의 기쁨** — 결제·구매 횟수·팝업 (쇼핑몰의 CASH 단계와 결제 공유)  
3. `EVENT_REGISTRY` 등록 + PRISM 로비 탭 + DEV.md  
4. (선택) iframe 빌드·`postMessage` — 타 게임 패키지

---

## 7. 기획 확정 (2026-06-03)

| # | 항목 | 확정 |
|---|------|------|
| 1 | 드라이버 구매 횟수 | UI에 `N/M` **표시용** (모노 GO 연출). 1차는 localStorage 데모 저장, **서버 계정 연동 없음** |
| 2 | 쇼핑몰 유료 시작 | **3단계부터** 비용 (`step_id` ≥ 3). 1~2단계는 `FREE` |
| 3 | 보상 풀 | **재화 + 상자/장비** 포함 (`reward_type` CSV) |
| 4 | 원화 결제 | **상점 테스트 캐시** (`metaCashKrw` / `shop_test_config`) — IAP 2차 |

공통: `CASH_KRW`·드라이버 결제 모두 `GameCore.metaCashKrw` 차감 + 상점과 동일 토스트.

---

## 8. 문서 맵 (분리 패키지용)

| 모듈 | 기획 (상세) | 개발 (연동) |
|------|-------------|-------------|
| 쇼핑몰 | [`mallMarvels/GAME.md`](./mallMarvels/GAME.md) | [`mallMarvels/DEV.md`](./mallMarvels/DEV.md) |
| 드라이버 | [`driversJoy/GAME.md`](./driversJoy/GAME.md) | [`driversJoy/DEV.md`](./driversJoy/DEV.md) |
| 세일 공통 인덱스 | 본 문서 (§1~8 세일, **§9 미니게임 호스트**) | `sales/*.ts` |
| iframe 미니게임 | §9 본 문서 · Lava `mdv3/GAME_lava_quest_v4.md` · Prize `mdv3/GAME_prize_drop_v4.md` | `eventMinigameHost.ts` · `EventMinigameOverlay.tsx` |
| 타이쿤 (별도) | [`tycoonSeason/GAME.md`](./tycoonSeason/GAME.md) | [`tycoonSeason/DEV.md`](./tycoonSeason/DEV.md) |
| 이벤트 허브 | [`GAME.md`](./GAME.md) · [`EVENT_SYSTEM.md`](./EVENT_SYSTEM.md) | |

각 `GAME.md` §0 에 **이 폴더만 복사할 때 포함 목록** + `sales/` 공유 의존성 정리됨.

---

## 9. iframe 미니게임 단일 호스트 (Lava Quest · Prize Drop)

> **배경:** 라바·퍼즐은 **같은 종류의 이벤트**(iframe 미니게임)이다. 세일(쇼핑몰·드라이버)과 달리 **한 호스트·한 iframe 슬롯**만 쓰며, 탭 전환 시 이전 화면·세이브가 따라오지 않도록 **dispose → remount** 한다.  
> **구현 완료 (호스트):** 2026-06-03

### 9.1 로비 이벤트 UI 3계층 (역할 분리)

| 계층 | 이벤트 | UI 형태 | 열기/닫기 API |
|------|--------|---------|----------------|
| **① iframe 미니게임** | 라바 퀘스트, Prize Drop | `EventMinigameOverlay` (App z500) | `eventMinigameHost` |
| **② 세일 오버레이** | 쇼핑몰의 경이로움, 드라이버의 기쁨 | `SalesEventOverlay` (좌측 탭 + 모달) | 각 `*Controller.openModal` |
| **③ 타이쿤/시즌** | 마일리지·토너먼트 | `EventHudRenderer` (전투/로비 HUD) | `eventStore` / `EventBridge` |

- **①만** iframe·`postMessage`·보상 `event:grant` 공통.
- **② 진입 시 ① 닫기** — 쇼핑몰/드라이버 `openModal()` → `hideEventMinigameForOverlay()`.
- **③** 은 미니게임 iframe과 별개(오른쪽 탭·상단 mileage).

### 9.2 SSoT — 레지스트리

파일: `src/game/eventMinigameRegistry.ts`

| id | 라벨 | iframe src | 재화·소비 (입장 차감 전부 없음) | 노출시간 | 로비 플래그 |
|----|------|------------|--------------------------------|---------|-------------|
| `lava` | 라바 | `/event/lavaQuest/index.html` | 단독 플레이(코어 전투 진입). 미니게임 재화 적립 대상 아님 | `duration_hours=0.5` | `/lobby/showLavaQuest` |
| `prize` | 퍼즐 | `/event/prizeDrop/index.html` | 퍼즐볼 = 호스트 재화. **지갑 계약**(드롭당 1개 자체 소비→`pd:walletChanged`) | `24` | `/lobby/showPrizeDrop` |
| `archery` | 양궁 | `/event/archeryArena/index.html` | 발 = 호스트 재화. **1발=1재화**, 1~5발 선택 소비(지갑 계약→`aa:walletChanged`) | `48` | `/lobby/showArcheryArena` |

> 사이드탭은 보유 갯수가 아니라 **남은시간**(`duration_hours`)을 카운트다운으로 표기(EVENT_MANAGEMENT §12·§13). 입장 차감은 셋 다 없음(`ticket_cost=0`).

**이벤트 추가 시:** 위 테이블에 행만 추가 + `public/event/{id}/` 빌드 산출물 + (필요 시) `persistKeys` for localStorage dispose.

**양궁 상세:** `src/eventSystem/Archery Arena_game_end/mdv3/HANDOFF_archery_arena_v4.md`  
빌드: `npm run build:archery` → `public/event/archeryArena/` (CSV 6종 포함).

### 9.3 호스트 API (`src/game/eventMinigameHost.ts`)

| 함수 | 용도 |
|------|------|
| `openEventMinigame(id)` | (입장 차감 없음, `ticket_cost=0`) **이전 세션 dispose** → `mountKey++` → iframe remount |
| `closeEventMinigame()` | ✕·완전 종료 — `activeId` 비움, iframe DOM 제거 |
| `hideEventMinigameForOverlay()` | 세일·기타 풀스크린 UI 진입 전 — `close`와 동일 |
| `suspendEventMinigame()` | 라바만: 스퀘어 전투 진입 (`lq:start_attempt`) — 숨김·세션 유지 |
| `resumeEventMinigame()` | 라바 전투 종료 후 iframe 복귀 + `lq:result` postMessage |
| `disposeMinigameSession(id)` | `host:eventDispose` postMessage + 라바 `lq_session_v1` 삭제 |

**hudStore 경로 (단일 상태):**

```
/event/minigame/activeId   '' | 'lava' | 'prize' | 'archery'
/event/minigame/visible    boolean
/event/minigame/suspended  boolean  (라바 전투 중)
/event/minigame/mountKey   number   (React iframe key)
```

레거시 `/iframe/*` 는 호스트가 동기화만 함(기존 코드 호환).

### 9.4 UI 셸 위치

- **이전:** `LobbyScreenImpl` 안 `IframeOverlay` — 로비 unmount 시 iframe 생명주기 꼬임.
- **현재:** `App.tsx` 최상위 `EventMinigameOverlay` — 로비·전투와 **분리**, zIndex **500**.
- 사이드 탭: `registry.tsx` `EventMiniCards` — 레지스트리 순회, `openEventMinigame(id)`만 호출.

### 9.5 전환 규칙 (기획·QA 공통)

1. **라바 → 퍼즐 (또는 반대) 탭:** 이전 이벤트 dispose + LS 정리 → **새 iframe만** 표시 (매칭 100/100 잔상 없음).
2. **✕ 닫기:** 미니게임 완전 종료.
3. **쇼핑몰·드라이버 탭:** 미니게임 먼저 닫고 세일 모달만 표시.
4. **라바 「도전 시작」:** iframe `suspend` (숨김) → 스퀘어 1분 전투 → `resume` + 결과 전달.
5. **보상 설명창:** 아이콘 탭 → `event:showRewardDetail` → 호스트 `EquipDetailPopup`(장비) / 재화 카드. 미니게임 닫히면 설명창도 닫힘.

### 9.6 postMessage 프로토콜 (호스트 ↔ iframe)

| 방향 | type | 용도 |
|------|------|------|
| iframe → host | `lq:start_attempt` | 라바 전투 시작 |
| iframe → host | `lq:result` | (host → iframe) 전투 결과 |
| iframe → host | `event:grant` | 보상 실지급 (`GameCore.grantReward`) |
| iframe → host | `event:showRewardDetail` | 보상 아이콘 설명 (장비/재화) |
| host → iframe | `host:eventDispose` | 탭 전환·닫기 시 자식 정리 (라바: `clearPersistentSession`) |
| iframe → host | `pd:ready` / `aa:ready` | 퍼즐·양궁 기동 → host `host:walletSync` 전송 |
| host → iframe | `host:walletSync` | `{ balance, missionLines[, claimPending] }` — 보유 재화 + 획득안내(이식 지갑 계약) |
| iframe → host | `pd:walletChanged` / `aa:walletChanged` | `{ balance }` — 게임 자체 소비 후 남은 잔액 → 호스트 저장(`setPrizeBalls`/`setBowStands`) |
| iframe → host | `aa:claimPending` | 양궁 토너먼트 종료·미수령 (레드닷) |
| iframe → host | `aa:claimed` | 양궁 보상 수령 완료 |
| iframe → host | `aa:toast` | 호스트 토스트 (iframe 위 z530) |

> ⚠️ 구 양궁 프로토콜(`aa:consumeBow`/`host:archeryInit`/`host:bowConsumed`, 1활대=5발)은 **폐기**. 퍼즐·양궁 모두 위 **지갑 계약 3종**(`*:ready`/`host:walletSync`/`*:walletChanged`)으로 통일. 호스트는 잔액(숫자)만 주고받고 게임 규칙을 모른다(이식 가능).

Prize Drop 마일스톤·보상 모달·Lava 보상 칩 클릭 → `event:showRewardDetail`.  
장비 보상: CSV `reward_item_id` = `equipment_config.slot_id` (`prize_crown` 등).

### 9.7 클릭·레이어 (2026-06-03 수정 요약)

- 세일 래퍼 `App.tsx`: `pointer-events: none`, **탭·모달만** `auto` (전체 화면 클릭 먹통 방지).
- `RewardDetailOverlay`: iframe(z500) 위 **z520**.
- Prize Drop 마일스톤 바 🎁 마크 탭 → 설명창 연동.

### 9.8 관련 파일 맵

| 역할 | 경로 |
|------|------|
| 레지스트리 | `src/game/eventMinigameRegistry.ts` |
| 호스트 API | `src/game/eventMinigameHost.ts` |
| iframe 셸 | `src/jsonRender/EventMinigameOverlay.tsx` |
| 로비 탭 | `src/jsonRender/registry.tsx` (`EventMiniCards`) |
| 보상 설명 | `src/jsonRender/RewardDetailOverlay.tsx` |
| message 브릿지 | `src/App.tsx` |
| 라바 전투 | `src/game/GameCore.ts` (`startLavaQuestMode` / `_onLavaQuestEnd`) |
| 세일 → 미니게임 닫기 | `mallMarvels/core/MallMarvelsController.ts`, `driversJoy/core/DriversJoyController.ts` |
| 빌드 산출 | `public/event/lavaQuest/`, `public/event/prizeDrop/`, `public/event/archeryArena/` |
| 양궁 호스트 | `src/game/archeryMeta.ts`, `src/game/eventRedDots.ts` |

### 9.9 세일 모듈과의 관계 (본 문서 §1~5)

- 세일은 **iframe 없음** — §3의 **A. 오버레이** 확정.
- 로비 **왼쪽** = 세일 탭, **오른쪽** = 라바·퍼즐·(시즌) — `eventHudLayout.ts` 스택 인덱스 공유.
- **동시에 둘 다 뜨면 안 됨:** 미니게임 열린 상태에서 세일 탭 → 미니게임 닫힘. 반대는 세일 모달만 닫으면 로비로 복귀(미니게임 자동 재오픈 없음).

---

*CSV: `public/event/driversJoy/`, `public/event/mallMarvels/` — 로더 `sales/loadSalesEventData.ts` · DEV.md 참고.*  
*미니게임 CSV: `public/event/lavaQuest/` (`lq_stage_reward.csv` 등), Prize Drop `game_data/03_milestone.csv`.*


---

# 이벤트 시스템 관리 가이드

> **대상**: 운영자 · 기획자 · 개발자  
> **위치**: `src/eventSystem/`  
> **관련 문서**: 각 이벤트 폴더 내 `GAME.md` (기획) / `DEV.md` (개발)

---

## 1. 구조 개요

이벤트 시스템은 **두 레이어**로 관리된다.

```
레이어 1 (코드)  — 어떤 이벤트 모듈이 시스템에 등록되어 있나?
                   → src/eventSystem/registry.ts

레이어 2 (데이터) — 지금 어떤 이벤트가 실제로 켜져 있나?
                   → public/event/event_board_config.csv (enabled 컬럼)
```

| 작업 | 담당 레이어 | 수정 파일 |
|------|------------|-----------|
| 새 이벤트 종류 추가 | 코드 | `registry.ts` + 새 이벤트 폴더 |
| 이벤트 ON/OFF | 데이터 | `event_board_config.csv` |
| 이벤트 수치 조정 | 데이터 | 각 이벤트의 CSV |
| 호스트 게임 연동 | 코드 | `EventManager` import 한 줄 |

---

## 2. 폴더 구조

```
src/eventSystem/
├── EVENT_MANAGEMENT.md     ← 이 문서
├── registry.ts             ← 등록된 이벤트 모듈 목록 (코드 레벨)
├── EventManager.ts         ← 활성 이벤트 결정 + 라이프사이클 관리
├── index.ts                ← 바깥(App.tsx)이 import하는 유일한 진입점
│
├── tycoonSeason/           ← 타이쿤 마일리지 + 시즌 토너먼트 이벤트
│   ├── GAME.md             ← 이벤트 기획서
│   ├── DEV.md              ← 개발자 연동 요약
│   ├── HANDOFF.md          ← 인수인계
│   ├── core/               ← EventController, BotSimulator
│   ├── host/               ← EventBridge (호스트 게임 연결)
│   ├── jsonRender/         ← HUD/UI 컴포넌트
│   ├── store/              ← 이벤트 상태 (eventExternalStore)
│   ├── data.ts             ← CSV 로더 + 타입
│   └── index.ts            ← 이 이벤트의 public API
│
└── [새 이벤트 폴더]/       ← 추가 시 동일 구조로 생성
    └── ...

public/event/
├── tycoonSeason/           ← tycoonSeason 전용 CSV
│   ├── event_board_config.csv
│   ├── event_milestone_config.csv
│   ├── event_kill_reward_config.csv
│   ├── tournament_config.csv
│   ├── tournament_bot_name_pool.csv
│   ├── tournament_rank_reward_config.csv
│   ├── season_class_config.csv
│   ├── event_asset_config.csv
│   ├── event_ui_theme_config.csv
│   ├── event_help_config.csv
│   ├── event_help_acquire_config.csv
│   └── assets/
└── [새 이벤트 폴더]/       ← 추가 시 동일 구조로 생성
```

---

## 3. registry.ts — 이벤트 모듈 등록

`registry.ts`는 시스템에 **존재하는** 이벤트 모듈을 등록하는 파일이다.  
등록되지 않은 이벤트는 CSV에 있어도 절대 실행되지 않는다.

```ts
// src/eventSystem/registry.ts

import tycoonSeason from './tycoonSeason'
// import luckyTrain from './luckyTrain'   ← 추가 시 주석 해제

export const EVENT_REGISTRY: Record<string, EventModule> = {
  tycoon_season: tycoonSeason,
  // lucky_train: luckyTrain,
}
```

**새 이벤트 추가 시 여기에 한 줄만 추가한다.**

---

## 4. event_board_config.csv — 이벤트 ON/OFF

```
event_id, event_key,     enabled, event_name,         event_kind, ...
10001,    tycoon_season, 1,       겨울 타이쿤 챌린지, TYCOON_MILEAGE, ...
10002,    tycoon_season, 1,       시즌 익스프레스,     SEASON_EXPRESS, ...
20001,    lucky_train,   0,       럭키 트레인,          LUCKY_TRAIN, ...
```

| 컬럼 | 설명 |
|------|------|
| `event_key` | `registry.ts`의 키와 일치해야 함 |
| `enabled` | `1` = 활성, `0` = 비활성 (코드 수정 없이 끄고 켬) |

- 같은 `event_key`(모듈)에 여러 `event_id`(인스턴스)가 있을 수 있다
- `enabled=0`이면 해당 이벤트는 로드도, 렌더도 되지 않는다

---

## 5. EventManager.ts — 두 레이어 연결

`EventManager`가 레이어 1(registry)과 레이어 2(CSV)를 연결한다.

```
CSV enabled=1 행들
    ↓ event_key로 조회
registry.ts
    ↓ 매칭된 모듈만
활성 이벤트 인스턴스 구동
```

- **App.tsx는 `EventManager`만 import**한다. 개별 이벤트 이름을 알 필요 없다
- `EventManager`가 활성 이벤트의 init / tick / destroy 라이프사이클을 일괄 관리한다

---

## 6. 호스트 게임(스퀘어/PRISM SQUAD) 연동

```ts
// App.tsx — 호스트 게임 쪽 코드
import { EventManager } from '../eventSystem'

// 로드
const eventManager = new EventManager()
await eventManager.init()

// 인게임 킬 이벤트 전달 (호스트 → 이벤트)
eventManager.onEnemyKilled(enemyId, ticketMultiplier)

// 이벤트 분리 시: 이 import 한 줄만 제거하면 호스트 단독 복구
```

---

## 7. 이벤트 추가 체크리스트

새 이벤트를 추가할 때 순서:

1. `src/eventSystem/[새이벤트폴더]/` 생성 (동일 구조)
2. `registry.ts`에 한 줄 추가
3. `public/event/[새이벤트폴더]/event_board_config.csv`에 행 추가 (`enabled=0`으로 시작)
4. 기획 준비 완료 시 `enabled=1`로 변경
5. **코드 수정 없음**

---

## 8. 이벤트 제거 / 비활성화

| 목적 | 방법 |
|------|------|
| 일시 중지 | `event_board_config.csv`의 `enabled=0` |
| 코드에서 완전 제거 | `registry.ts`에서 해당 줄 삭제 |
| 폴더 보존(나중 재활용) | registry에서만 주석 처리, 폴더는 유지 |

---

## 9. 단독 빌드 (이벤트 시스템만)

이벤트 시스템은 `src/eventSystem/` + `public/event/`만으로 독립 실행 가능하다.

```
단독 실행 시:
  - 호스트 게임(GameCore, Renderer3D 등) 없음
  - EventBridge 대신 샌드박스 BotSimulator로 킬 이벤트 주입
  - 향후 event-sandbox 앱으로 분리 예정 (DEV.md 3차 로드맵)
```

---

## 10. 미니게임 재화 적립 — 호스트 `MinigameCurrencyService`

iframe 미니게임(퍼즐·양궁)의 재화는 **스퀘어 전투에서 적을 잡아 번다.** 호스트가 적립을 소유하고, iframe은 그 재화를 **빌려 쓰는 소비자**다.

> ⚠️ **라바는 제외.** 라바는 코어 전투로 진입하는 단독 플레이라 이 서비스의 적립 대상이 아니다(`SQUARE_CURRENCY_IDS = ['prize','archery']`). 라바 입장권은 별도.

**파일:** `src/game/minigameCurrency/MinigameCurrencyService.ts`

**적립 규칙 (타이쿤 `onEnemyKilled` 누적식과 동일):**
- `onEnemyKilled(enemyId, ticketMultiplier)` → 적 처치마다 `prize`·`archery` 각각 **누적 카운터** +1.
- 적 종류·일반/보스 구분: `event_minigame_kill_reward_config.csv`(`enemy_id, prize_base, archery_base, is_boss`).
- 필요 킬 수: `event_minigame_acquire_config.csv`(`minigame_id, target_type[normal|boss], kills_required, reward_label, …`).
- 누적이 `kills_required`에 도달하면 `max(1, floor(base × max(1,ticketMultiplier)))` 만큼 지급하고 카운터 0으로 리셋.
- `onStageClear(mult)` → `combat_tuning.csv` `stage_clear_prize_bonus` 만큼 추가 지급(승리 시).
- 영속: `prism_squad_save_v1`의 `minigameCurrency` 필드(GameCore `_saveMeta`/`_loadMeta`). 양궁 레거시 `prism_archery_host_v1` 마이그레이션 포함.

**밸런스 레버:** 난이도는 **`event_minigame_acquire_config.csv`의 `kills_required`** 가 단일 조절점. 값↑ = 획득 느려짐(어려움). 코드 수정 불필요.

**HUD 동기화(`syncHud`):** `/lobby/prizeBalls`, `/lobby/archeryBowStands`, `/lobby/prizeKillsToward`·`prizeKillsRequired`, `/archery/killsTowardBow`·`killsPerBow`.

---

## 11. 이식 가능 지갑 계약 — 호스트 ↔ iframe 미니게임 (host-agnostic)

iframe 미니게임(퍼즐·양궁)을 **다른 호스트(예: 모노폴리 GO)에도 그대로 붙이기 위한** 핵심 계약. 호스트는 **재화 잔액(숫자)만** 주고받고 게임 내부 규칙을 1도 모른다. 게임이 **자체 소비·UI·통화명**을 전부 소유한다.

### 11-1. 3개 메시지 (postMessage)

```
게임 → 호스트 :  <ns>:ready                                   (iframe 준비 완료)
호스트 → 게임 :  host:walletSync { balance, missionLines? }    (보유 재화 + 획득안내 데이터)
게임 → 호스트 :  <ns>:walletChanged { balance }                (자체 소비 후 남은 잔액 = 저장 요청)
```
- `<ns>` = 게임별 네임스페이스. 퍼즐 = `pd`, 양궁 = `aa`.
- `balance` = 재화 개수(정수). 퍼즐=퍼즐볼, 양궁=발.
- `missionLines` = `[{title, detail}]` — "어떻게 버는지" 안내(호스트가 제공하는 **표시용 데이터**, 게임은 그대로 렌더만). 없으면 게임이 제네릭 문구 표시.

### 11-2. 역할 경계 (절대 규칙)

| 책임 | 소유자 |
|------|--------|
| 재화 잔액 보관·지급·저장 | **호스트** (지갑) |
| 소비 판정(부족 경고 포함) | **게임(iframe)** |
| 입장/미션 화면, 통화명, 소비 UI | **게임(iframe)** |
| 게임 규칙(드롭·발사·연출) | **게임(iframe)** |

→ 호스트는 `balance` 숫자만 안다. **다른 호스트는 이 3개 메시지만 구현하면 게임이 그대로 붙는다.**

### 11-3. 호스트 구현 (스퀘어)

- **App.tsx** 메시지 핸들러:
  - `pd:ready`/`aa:ready` → `host:walletSync` 전송(balance = `getPrizeBalls()`/`getBowStands()`, missionLines = acquire CSV에서 구성).
  - `pd:walletChanged` → `MinigameCurrencyService.setPrizeBalls(balance)` (저장).
  - `aa:walletChanged` → `setBowStands(balance)` (저장).
- **EventMinigameOverlay.tsx** `onLoad` → 진입 직후 `host:walletSync` 1회 선전송(ready 누락 대비).
- **입장 차감 없음:** `event_minigame_host_config.csv` `ticket_cost = 0`. 소비는 게임이 플레이 중 자체 차감 후 `walletChanged`로 통지.

### 11-4. 게임(iframe) 구현 — 자립

- 진입 시 `<ns>:ready` 송신 → `host:walletSync` 수신 → 내부 재화 카운트 = `balance`.
- **입장/미션 화면을 게임이 소유**(퍼즐 = `PrizeIntro`, 양궁 = lobby 상단 미션 배너). missionLines를 그대로 렌더.
- 소비할 때 자체 카운트 차감 → `<ns>:walletChanged { balance }` 송신(호스트가 저장).
- **standalone**(호스트 없음, `window.parent === window`): `hosted=false` → 내부 기본값으로 동작(깨지지 않음).

### 11-5. ⚠️ json-render 스토어 접근 주의 (`@json-render/core`)

iframe의 `createStateStore`는 **JSON-pointer(중첩) 접근**이다. `/hud/ball_count` → `state.hud.ball_count`로 읽고 쓴다.
- **반드시 `store.get('/hud/ball_count')`** 로 읽을 것. `store.getSnapshot()['/hud/ball_count']` **직접 키 접근은 stale**(초기 평면 키만 보고 update 결과를 못 봄) → 버그.
- 초기 기본값은 평면 키라 `get()`엔 `undefined`로 보임 → 가시성 플래그는 "명시적 false일 때만 숨김"으로 판정(`get(...) !== false`).

---

## 12. 이벤트 노출 시간 — 사이드탭 카운트다운

모든 이벤트는 **노출 기간**을 데이터로 갖는다. 사이드탭은 **남은시간을 카운트다운**으로 표시하고 만료 시 숨긴다.

**기간 데이터 위치(SSoT):**
| 이벤트 | CSV · 필드 |
|--------|-----------|
| 라바 | `lq_event_config.csv` `duration_hours` |
| 퍼즐·양궁(iframe) | **`event_minigame_host_config.csv` `duration_hours`** (호스트가 노출 관리) |
| 타이쿤·시즌 | `event_board_config.csv` `duration_hours` (`EventController`가 종료 처리) |
| 쇼핑몰·드라이버 | `mm_/dj_event_config.csv` `duration_hours`/`duration_minutes` |

**iframe 미니게임 노출(호스트):** `src/game/eventExposure.ts`
- `getEventEndMs(id, durationHours)` — 최초 노출 시각을 `prism_event_exposure_v1`(localStorage)에 앵커·영속 → `endMs = 앵커 + duration`.
- `getEventRemainMs` ≤ 0 이면 `EventMiniCards`에서 탭 **숨김**. `durationHours ≤ 0`이면 `Infinity`(무기한 노출).
- `registry.tsx` `EventMiniCards`가 1초 인터벌로 재렌더하여 카운트다운 갱신.

---

## 13. 사이드탭 표기 규칙 (전 이벤트 통일)

- **시간만 표기 + 레드닷.** 재화 **갯수 표기 금지**(요즘 라이브 게임 규격).
- 포맷: 초·아이콘 없이 **`H시간 M분` / `M분`** (만료 `종료`). 무기한이면 빈 문자열.
- **단일 규칙을 6개 탭 전부 동일 적용:**
  - iframe(라바·퍼즐·양궁): `eventExposure.formatRemain`.
  - 타이쿤·시즌·쇼핑몰·드라이버: 각 컨트롤러 `formatTimer`(동일 규칙: `EventController`·`MallMarvelsController`·`DriversJoyController`).

---

## Anti-Patterns

### 사이드탭에 재화 갯수 표기
```
❌ 퍼즐 57개 / 양궁 33발   (구버전)
✅ 퍼즐 23시간 59분 + 레드닷   (시간만 + 레드닷)
```
재화 보유량은 게임 입장 후 내부 화면에서 본다. 로비 탭은 **남은시간**만.

### 호스트가 미니게임 소비를 판정
`pd:consumeBall`처럼 호스트가 차감 판정하면 게임 규칙이 호스트로 새어 이식 불가. 호스트는 `walletChanged`로 받은 **잔액 저장만**.

### iframe 스토어를 getSnapshot 직접 키로 읽기
`@json-render/core` 스토어는 JSON-pointer(중첩). `store.get(path)` 사용. 직접 키 접근은 stale.

### registry.ts 없이 App.tsx에서 직접 import
이벤트가 늘어날수록 호스트 코드가 오염된다. 반드시 `EventManager`를 통할 것.

### enabled 로직을 코드에 하드코딩
```ts
// ❌ 금지
if (eventId === 10001) { ... }

// ✅ 올바름
eventManager.getActiveEvents()
```

### 두 이벤트 폴더가 서로 import
각 이벤트 폴더는 완전 독립이어야 한다. 공통 로직이 필요하면 `eventSystem/shared/`로 올린다.

### event_key를 registry.ts와 다르게 쓰기
CSV의 `event_key`와 `registry.ts`의 키는 **정확히 일치**해야 한다.
