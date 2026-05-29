# 🎮 Game MD v4 — 분리 포맷 설계 (GAME + DESIGN + DEV + RECIPE+RECIPE_CODE+csv)

상태: 시작 전
담당자: AnHyunjung

> 이 문서는 게임 MD 프로젝트의 **v4 분리 설계** 원칙과 구조를 정리한 참고 문서다.
> 

> v3 (3파일) → v4 (5파일 + CSV)로 확장. 슬롯머신이 첫 번째 완성·검증 기준.
> 

---

# 0. 설계 개요

## 무엇을 만드는가

9개 미니게임 각각에 대해, **어떤 AI에게 줘도 동일한 결과물이 나오는 표준화된 MD 문서 세트**를 만든다.

핵심 명제: **"파일 세트만 주면 어떤 AI든 동일한 게임을 만들 수 있다."**

## 왜 5개 파일인가

| 문제 | 해결 |
| --- | --- |
| GAME + DESIGN + DEV 3파일만으로는 검증된 구현 패턴이 전달되지 않는다 | [RECIPE.md](http://RECIPE.md) — 패턴 설명서 추가 |
| 설명만으로는 코드 오류가 반복된다 | RECIPE_[CODE.md](http://CODE.md) — 검증된 코드 스니펫 추가 |
| CSV를 AI가 임의로 만들면 밸런스가 틀어진다 | [DEV.md](http://DEV.md) 스키마 + 기준 데이터로 생성 규칙 명시 |

## 파일 세트 구조

```
game-project/
├── SKILL.md                ← AI 온보딩 가이드 (공통 1개, 9게임 전부 커버)
├── GAME.md                 ← 게임 설계 (규칙·엔티티·플로우) — 코드 없음
├── DESIGN.md               ← 비주얼 시스템 (색상·폰트·컴포넌트·wireframe.css 전체)
├── DEV.md                  ← 기술 명세 (스택·파일구조·스키마·Anti-Patterns) — 코드 없음
├── RECIPE.md               ← 검증된 구현 패턴 설명서 — 코드 없음, 기획서 양식
├── RECIPE_CODE.md          ← RECIPE.md와 1:1 대응하는 검증된 코드 스니펫
└── game_data/*.csv         ← 실제 밸런스 데이터 (있으면 그대로, 없으면 DEV 스키마로 생성)
```

## 파일별 독자와 역할

| 파일 | 독자 | 역할 | 필수 여부 |
| --- | --- | --- | --- |
| [SKILL.md](http://SKILL.md) | AI | 읽기 순서·요약 형식·시작 규칙 안내 | 공통 1개 |
| [GAME.md](http://GAME.md) | 사람 + AI | 게임이 무엇인가 | 필수 |
| [DESIGN.md](http://DESIGN.md) | 사람 + AI | 어떻게 생겨야 하는가 + wireframe.css 전체 | 필수 |
| [DEV.md](http://DEV.md) | 사람 + AI | 어떻게 만드는가 + CSV 스키마 | 필수 |
| [RECIPE.md](http://RECIPE.md) | 사람 + AI | 어떤 패턴으로 만드는가 (설명만) | 선택 |
| RECIPE_[CODE.md](http://CODE.md) | AI | 검증된 코드 그대로 (수정 금지) | 선택 |
| game_data/*.csv | AI | 실제 밸런스 수치 | 선택 |

## 핵심 설계 원칙

**3개 파일은 코드 없음** — GAME·DEV·RECIPE는 설명과 규칙만. 소스 코드는 RECIPE_[CODE.md](http://CODE.md)에만 존재.

**CSV는 [DEV.md](http://DEV.md)가 스키마를 정의** — CSV가 있으면 그대로 사용. 없으면 [DEV.md](http://DEV.md)의 기준 데이터로 AI가 생성. 수치 변경 금지.

**RECIPE_[CODE.md](http://CODE.md)는 수정 금지** — 검증된 코드. 있으면 그대로 복사. 없으면 [RECIPE.md](http://RECIPE.md) 보고 직접 구현.

[**DESIGN.md](http://DESIGN.md)에 wireframe.css 전체 포함** — AI가 스타일을 추측하지 않도록 완성된 CSS를 그대로 제공.

---

# 1. v3 → v4 변경 이력

## v1 (초기)

게임 로직만 있는 단순 기획서.

## v2 (유지)

모든 정보를 하나의 파일에 집약한 AI 전용 구현 계약서. CSV 스키마, Anti-Patterns, DOM id 전부 포함. 단점: 사람이 읽기 어렵고 업계 표준과 호환 안 됨.

## v3 (3파일 분리)

GAME + DESIGN + DEV + [SKILL.md](http://SKILL.md). 업계 표준 포맷 도입. 사람도 읽을 수 있는 구조. **9개 게임 전부 완성.**

## v4 (현재 — 5파일 + CSV)

v3에서 [RECIPE.md](http://RECIPE.md) + RECIPE_[CODE.md](http://CODE.md) 추가. 검증된 구현 패턴을 코드 수준까지 전달. CSV 생성 규칙 명시. **슬롯머신으로 첫 검증 완료.**

---

# 2. 파일별 설계 원칙

## 2-1. [GAME.md](http://GAME.md)

**기반 포맷:** [gamemd.vercel.app](http://gamemd.vercel.app) 공식 포맷

**목적:** 게임 기획서처럼 사람이 읽어도 이해됨

**YAML front matter (고정 섹션):**

```
identity / components / entities / mechanics / goals
```

**components 작성 규칙:**

```yaml
# ✅ 올바른 방식 — 컴포넌트가 단일 속성
components:
  coins:
    type: int
    default: 50

# ❌ 잘못된 방식 — 컴포넌트 안에 필드 중첩
components:
  player_state:
    coins:
      type: int
```

**Markdown 섹션 (고정, 순서 변경 금지):**

```
## Design Pillars       ← 이름 — 한 문장. 2~4개.
## Mechanics in Depth   ← YAML의 "왜" 설명. 엣지케이스 중심.
## Content Guidelines   ← 새 콘텐츠 추가 시 지켜야 할 규칙.
## Anti-Patterns        ← 구체적인 실수 패턴. 원인+결과 중심.
```

**규칙:** pitch는 반드시 한 문장. 소스 코드·stack_policy 등 비표준 필드 추가 금지.

---

## 2-2. [DESIGN.md](http://DESIGN.md)

**기반 포맷:** Google Stitch 공식 9섹션 포맷

**목적:** AI가 UI를 일관되게 생성하도록 색상·폰트·컴포넌트 규칙 제공

**섹션 순서 (고정, 변경 금지):**

```
1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings      ← 각 컴포넌트의 CSS 속성 명시
5. Layout Principles       ← DOM 순서 + 겹침 방지 원칙 (⚠️ 핵심)
6. Depth & Elevation
7. Animations
8. Responsive Behavior
9. Agent Prompt Guide      ← Do's & Don'ts 포함
```

**추가 섹션 (v4):**

```
Quick Start — wireframe.css 전체   ← AI가 그대로 복사
```

**규칙:**

- Layout Principles에 DOM 순서를 트리 구조로 명시. 겹침 방지 원칙 표 포함.
- wireframe.css 전체를 Quick Start 섹션에 포함. AI가 추측하지 않도록.
- 일반 CSS 코드 외 컴포넌트 로직 코드 포함 금지.

---

## 2-3. [DEV.md](http://DEV.md)

**목적:** AI가 코드를 짜는 기술 명세서. 소스 코드 없음.

**13섹션 구조 (고정, 번호 포함, 변경 금지):**

```
1. Tech Stack
2. File Structure
3. Layout & DOM Order      ← ⚠️ 겹침 방지 핵심. v4 변경 이력 포함.
4. json-render Architecture
5. State Paths ($state)    ← 3곳 동시 패치 규칙
6. DOM Required IDs
7. Data Schema             ← CSV 스키마 + 기준 데이터
8. Session Storage
9. Implementation Order    ← main.tsx 항상 마지막
10. Anti-Patterns          ← 카테고리별 [CRITICAL] 표시
11. Bug Log
12. Checklist
13. Commands
```

**규칙:**

- 소스 코드 없음 (규칙과 설명만)
- Data Schema 섹션: "CSV가 있으면 그대로 사용. 없으면 아래 기준 데이터로 생성." 안내 포함
- json-render Architecture: 4레이어 + 데이터 흐름 필수

---

## 2-4. [RECIPE.md](http://RECIPE.md)

**목적:** 검증된 구현 패턴의 설명서. 코드 없음. 사람도 읽을 수 있는 기획서 양식.

**규칙:**

- 각 패턴은 R-01, R-02... 번호로 식별
- RECIPE_[CODE.md](http://CODE.md)와 번호 1:1 대응
- 각 패턴마다: 적용 위치 + 설명 + 규칙 포함

---

## 2-5. RECIPE_[CODE.md](http://CODE.md)

**목적:** [RECIPE.md](http://RECIPE.md)의 각 패턴에 대한 검증된 소스 코드.

**규칙:**

- 있으면 그대로 사용. 임의 수정 금지.
- 없으면 [RECIPE.md](http://RECIPE.md) 설명 보고 직접 구현.
- [RECIPE.md](http://RECIPE.md)와 번호 1:1 대응

---

## 2-6. game_data/*.csv

**목적:** 실제 게임 밸런스 데이터.

**규칙:**

- 있으면 그대로 사용. 수치 변경 금지.
- 없으면 [DEV.md](http://DEV.md) Data Schema의 기준 데이터로 생성.
- [DEV.md](http://DEV.md) Data Schema 섹션 형식:

```
> CSV가 있으면 그대로 사용.
> 없으면 아래 기준 데이터로 생성.
```

---

## 2-7. [SKILL.md](http://SKILL.md) (공통 1개)

**버전:** v2.0

**역할:** AI 온보딩 가이드. 9개 게임 전부 커버.

**읽기 순서 ([SKILL.md](http://SKILL.md)에 명시):**

```
1. GAME.md
2. DESIGN.md
3. DEV.md
4. RECIPE.md (있으면)
5. RECIPE_CODE.md (있으면)
6. game_data/ CSV (있으면 사용, 없으면 스키마로 생성)
7. 요약 작성 (7항목)
8. 시작 지시 후 코딩
```

**요약 형식 (7항목):**

```
- 이 게임은 무엇인가
- 핵심 기술 구조는 무엇인가
- 선언형 영역과 명령형 영역
- 가장 주의해야 할 Anti-Pattern
- RECIPE.md 있음 여부
- RECIPE_CODE.md 있음 여부
- game_data/ CSV 있음 여부
```

---

# 3. 테스트 방법

## 목적

파일 세트의 품질을 단계별로 검증한다. 단계가 올라갈수록 AI에게 더 많은 정보를 제공하며, 어느 단계에서 구현 품질이 개선되는지 측정한다.

## 테스트 대상

슬롯머신(Slot Machine)을 기준 게임으로 사용. 가장 먼저 v4로 완성된 게임.

## 4단계 테스트 구조

| 단계 | 제공 파일 | 검증 목적 |
| --- | --- | --- |
| 1단계 | [SKILL.md](http://SKILL.md)  • [GAME.md](http://GAME.md)  • [DESIGN.md](http://DESIGN.md)  • [DEV.md](http://DEV.md) | 기본 3파일만으로 구현 가능한지 |
| 2단계 |   • [RECIPE.md](http://RECIPE.md) | 패턴 설명서가 있을 때 개선되는지 |
| 3단계 |   • RECIPE_[CODE.md](http://CODE.md) | 검증된 코드가 있을 때 정확도가 향상되는지 |
| 4단계 | 전체 세트 (+ game_data/ CSV) | 완전한 세트의 결과물 품질 |

## 테스트 AI

| AI | 모델 |
| --- | --- |
| Claude | claude-sonnet-4 |
| Antigravity | gemini-2.5-flash |
| Cursor | cursor (default) |

## 테스트 착수 프롬프트

```
이 프로젝트를 구현해줘.

읽어야 할 파일은 다음과 같아:
- SKILL.md — 읽는 순서와 구현 규칙
- GAME.md — 게임 규칙
- DESIGN.md — 비주얼 시스템
- DEV.md — 기술 명세
(단계에 따라 RECIPE.md, RECIPE_CODE.md, game_data/ CSV 추가)

SKILL.md에 나온 순서대로 읽고,
7항목 요약을 먼저 작성해줘.
요약 확인 후 내가 시작 지시하면 그때 코딩 시작해.
```

## 성공 기준

| 항목 | 기준 |
| --- | --- |
| 레이아웃 순서 | HUD → 주사위 무대 → 버튼 행 → 타임라인 (겹침 없음) |
| json-render 적용 | HUD·결과 패널이 $state 바인딩으로 동작 |
| 실행 | npm run dev → npm run build 모두 통과 |
| 핵심 로직 | 릴 순차 정지 / 결과 선결정 / 강제 스냅 등 |

## 실패 체크 항목

- [ ]  json-render 미적용 (HUD가 하드코딩 HTML)
- [ ]  레이아웃 순서 오류 (버튼이 주사위 위에 렌더됨)
- [ ]  $state 경로 불일치 (HUD 갱신 안 됨)
- [ ]  RECIPE_[CODE.md](http://CODE.md) 코드 임의 수정
- [ ]  CSV 수치 변경
- [ ]  npm run build 실패

## 결과 기록 위치

→ [🧪 AI 테스트 결과 — Slot Machine v4](https://www.notion.so/AI-36731009efac813882dddbc0e450ae42?pvs=21)

---

# 4. 파일 포맷 표준 참고

| 포맷 | 출처 |
| --- | --- |
| [GAME.md](http://GAME.md) | [https://gamemd.vercel.app](https://gamemd.vercel.app) / [https://github.com/unsanityinc/game.md](https://github.com/unsanityinc/game.md) |
| [DESIGN.md](http://DESIGN.md) | [https://stitch.withgoogle.com/docs/design-md/format/](https://stitch.withgoogle.com/docs/design-md/format/) |
| [DESIGN.md](http://DESIGN.md) 예시 모음 | [https://github.com/VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) |
| [SKILL.md](http://SKILL.md) | [https://agents.md](https://agents.md) |

---

# 5. 완성 현황

## v4 파일 세트

| 게임 | GAME | DESIGN | DEV | RECIPE | RECIPE_CODE | CSV | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Slot Machine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | v4 완료 · 테스트 진행 중 |
| Monopoly Board | ✅ | ✅ | ✅ | ✅ | ✅ | — | v4 완료 |
| Lava Quest | — | — | — | — | — | — | v3 → v4 전환 대기 |
| Prize Drop | — | — | — | — | — | — | v3 → v4 전환 대기 |
| Sky Race | — | — | — | — | — | — | v3 → v4 전환 대기 |
| Hidden Temple | — | — | — | — | — | — | v3 → v4 전환 대기 |
| Archery Arena | — | — | — | — | — | — | v3 → v4 전환 대기 |
| Roulette Wheel | — | — | — | — | — | — | v3 → v4 전환 대기 |
| Unsanity Runner | — | — | — | — | — | — | v3 → v4 전환 대기 |

## v3 파일 세트 (3파일 완성, 유지)

9개 게임 × 3파일(GAME + DESIGN + DEV) = 27개 + [SKILL.md](http://SKILL.md) 1개 = **총 28개 파일**

| 게임 | 상태 |
| --- | --- |
| Monopoly Board | ✅ 검증 완료 |
| Lava Quest | ✅ 완료 |
| Prize Drop | ✅ 완료 |
| Sky Race | ✅ 완료 |
| Hidden Temple | ✅ 완료 |
| Archery Arena | ✅ 완료 |
| Roulette Wheel | ✅ 완료 |
| Slot Machine | ✅ 완료 |
| Unsanity Runner | ✅ 완료 |

---

# 6. 구현 작업 순서 원칙

AI가 순서 없이 만들면 import 에러로 빌드 실패. [DEV.md](http://DEV.md)에 명시 필수.

```
1단계: 정적 파일 (index.html, wireframe.css)
2단계: game_data/ CSV (있으면 그대로, 없으면 스키마 기준 생성)
3단계: 타입·유틸 (types.ts, gameDataPaths.ts)
4단계: 코어 게임 로직 (상태 머신, 타일 해석, 밸런스)
5단계: HUD 레이어 (hudExternalStore, syncHud, gameControlBridge)
6단계: catalog/ 4개 파일
7단계: jsonRender/ (Spec + Registry + Provider)
8단계: 렌더러 (Three.js / Canvas 2D 등)
9단계: 셸 + bootstrapGame
10단계: main.tsx (마지막)
```

**main.tsx는 항상 마지막.** 모든 import 대상 파일이 존재해야 빌드 성공.