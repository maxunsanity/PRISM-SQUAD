/**
 * hudExternalStore.ts — $state 브릿지
 * $state 경로 수정 시 반드시 동시 패치:
 *   1) 이 파일 키  2) prismHudSpec.ts $state 문자열  3) registry.tsx
 */

type HudState = {
  '/lobby/visible': boolean;
  '/lobby/selectedStage': number;
  '/lobby/maxStages': number;
  '/lobby/stageEnemyMult': number;
  '/lobby/ticketSummary': string;
  '/scene/transitionVisible': boolean;
  '/scene/transitionText': string;
  '/hud/timer': string;
  '/hud/stage': number;
  '/hud/expPct': number;
  '/hud/level': number;
  '/hud/killCount': number;
  '/hud/gold': number;
  '/hud/hpPct': number;
  '/hud/bossHpPct': number;
  '/hud/bossVisible': boolean;
  '/hud/bossName': string;
  '/hud/bossWarningVisible': boolean;
  '/hud/activeSkillSlots': string[];
  '/hud/passiveSkillSlots': string[];
  '/modal/visible': boolean;
  '/modal/cards': SkillCardData[];
  '/lobby/selectedPlayerId': string;
  '/lobby/selectedPlayerColorHex': string;
  '/avatar/visible': boolean;
  '/avatar/players': AvatarItem[];
  '/avatar/selectedId': string;
  '/lobby/advLevel': number;
  '/lobby/advExpPct': number;
  '/lobby/gems': number;
  '/lobby/metaGold': number;
  '/meta/avatarProfileLimit': number;
  '/lobby/entryTickets': number;
  '/lobby/prizeBalls': number;         // 프라이즈 볼
  '/lobby/prizeKillsToward': number;
  '/lobby/prizeKillsRequired': number;
  '/lobby/archeryBowStands': number;   // 양궁 활대
  '/lobby/showLavaQuest': boolean;     // 이벤트 카드 노출
  '/lobby/showPrizeDrop': boolean;     // 이벤트 카드 노출
  '/lobby/showArcheryArena': boolean;  // 양궁 아레나 탭
  '/archery/killsTowardBow': number;
  '/archery/killsPerBow': number;
  '/archery/claimPending': boolean;
  '/event/redDot/lava': boolean;
  '/event/redDot/prize': boolean;
  '/event/redDot/archery': boolean;
  '/event/redDot/tycoon': boolean;
  '/event/redDot/season': boolean;
  '/event/redDot/express': boolean;
  '/event/redDot/mall': boolean;
  '/event/redDot/drivers': boolean;
  /** CSV red_dot_config → hud_path (claim/action/new) */
  '/redDot/tycoon/claim': boolean;
  '/redDot/tycoon/action': boolean;
  '/redDot/tycoon/new': boolean;
  '/redDot/season/claim': boolean;
  '/redDot/season/action': boolean;
  '/redDot/season/new': boolean;
  '/redDot/express/claim': boolean;
  '/redDot/express/action': boolean;
  '/redDot/lava/claim': boolean;
  '/redDot/lava/action': boolean;
  '/redDot/lava/new': boolean;
  '/redDot/prize/claim': boolean;
  '/redDot/prize/action': boolean;
  '/redDot/prize/new': boolean;
  '/redDot/archery/claim': boolean;
  '/redDot/archery/action': boolean;
  '/redDot/archery/new': boolean;
  '/redDot/event_stack/any': boolean;
  '/redDot/mall/claim': boolean;
  '/redDot/mall/new': boolean;
  '/redDot/drivers/action': boolean;
  '/redDot/drivers/new': boolean;
  '/redDot/nav/shop': boolean;
  '/redDot/nav/shop/new': boolean;
  '/redDot/nav/equip': boolean;
  '/redDot/nav/equip/new': boolean;
  '/redDot/nav/equip/action': boolean;
  '/redDot/nav/challenge': boolean;
  '/redDot/nav/challenge/new': boolean;
  '/redDot/nav/challenge/action': boolean;
  '/redDot/nav/evolution': boolean;
  '/redDot/nav/evolution/new': boolean;
  '/redDot/nav/evolution/action': boolean;
  '/redDot/nav/battle': boolean;
  '/lobby/showMallMarvels': boolean;   // 쇼핑몰의 경이로움 사이드 탭
  '/lobby/showDriversJoy': boolean;    // 드라이버의 기쁨 사이드 탭
  '/lobby/menuOpen': boolean;          // 햄버거 메뉴 (App z55 레이어)
  /** @deprecated 레거시 — eventMinigameHost가 동기화 */
  '/iframe/visible': boolean;
  '/iframe/src': string;
  '/iframe/mountKey': number;
  /** iframe 미니게임 단일 호스트 (lava | prize) */
  '/event/minigame/activeId': string;
  '/event/minigame/visible': boolean;
  '/event/minigame/suspended': boolean;
  '/event/minigame/mountKey': number;
  '/game/lavaQuestActive': boolean;    // 라바 퀘스트 호스트 전투 모드 (GameCore 웨이브·보스 분기)
  '/lobby/selectedMult': number;
  '/lobby/multEnergyCost': number;
  '/lobby/stageName': string;
  '/lobby/bestTime': string;
  '/toast/visible': boolean;
  '/toast/text': string;
  '/advUp/visible': boolean;
  '/advUp/level': number;
  '/advUp/rewardGem': number;
  '/advUp/rewardGold': number;
  '/challenge/visible': boolean;
  '/challenge/items': ChallengeItem[];
  '/evolution/visible': boolean;
  '/evolution/items': EvoNodeItem[];
  '/evolution/gold': number;
  '/evolution/dna': number;
  '/equip/visible': boolean;
  '/equip/items': EquipItem[];
  '/equip/gold': number;
  '/equip/atk': number;
  '/equip/hp': number;
  '/equip/spd': number;
  '/equip/weapons': WeaponItem[];
  '/equip/selectedWeaponId': string;
  '/shop/visible': boolean;
  '/shop/cashKrw': number;
  '/shop/gems': number;
  '/shop/metaGold': number;
  '/shop/energy': number;
  '/shop/supplyKeys': number;
  '/shop/defensePity': number;
  '/shop/purchasedGemIds': string[];
  '/shop/gemPacks': ShopGemPackHud[];
  '/shop/goldPacks': ShopGoldPackHud[];
  '/shop/boxes': ShopBoxHud[];
  '/shop/maxEnergy': number;
  '/shop/showResetButton': boolean;
  '/shop/testCashKrw': number;
  '/talent/visible': boolean;
  '/talent/items': TalentItem[];
  '/talent/gold': number;
  '/battle/visible': boolean;
  '/battle/options': MultOption[];
  '/battle/selectedMult': number;
  '/battle/energy': number;
  '/battle/maxEnergy': number;
  '/energy/visible': boolean;
  '/energy/cur': number;
  '/energy/max': number;
  '/energy/gems': number;
  '/rushWave/visible': boolean;
  '/bossIntro/phase': 0 | 1 | 2 | 3; // 0=없음, 1=WARNING, 2=스폰연출, 3=등장충격
  '/bossDeath/phase': 0 | 1 | 2 | 3; // 0=없음, 1=폭발플래시, 2=VICTORY, 3=페이드
  '/bossDeath/bossName': string;
  '/pause/visible': boolean;
  '/luckyTrain/visible': boolean;
  '/luckyTrain/gold': number;
  '/luckyTrain/skills': LuckyTrainSkillItem[];
  '/luckyTrain/selectedId': string;
  '/result/visible': boolean;
  '/result/isVictory': boolean;
  '/result/killCount': number;
  '/result/survivalTime': string;
  '/result/finalLevel': number;
  '/result/totalXpEarned': number;
  '/result/goldEarned': number;
  '/result/tycoonEarned': number;
  '/result/ticketMultiplier': number;
  '/vfx/flashOpacity': number;
  '/vfx/flashColor': string;
};

export interface ChallengeItem {
  challenge_id: number;
  stage: number;
  stage_name: string;
  difficulty: number;
  difficulty_name: string;
  enemy_hp_mult: number;
  enemy_dmg_mult: number;
  reward_dna: number;
  reward_gold: number;
  prereq_id: number;
  prereq_label: string;
  cleared: boolean;
  unlocked: boolean;
}

export interface ShopGemPackHud {
  pack_id: string;
  label: string;
  gems: number;
  bonus_gems: number;
  price_krw: number;
}

export interface ShopGoldPackHud {
  pack_id: string;
  label: string;
  sublabel: string;
  gold: number;
  gem_cost: number;
  is_free: boolean;
}

export interface ShopBoxHud {
  box_id: string;
  label: string;
  subtitle: string;
  gem_cost: number;
  key_cost: number;
  pity_max: number;
  banner_title: string;
  banner_desc: string;
}

export interface EvoNodeItem {
  evo_id: number;
  order: number;
  branch: number;         // 0=일반(골드), 1=특수(DNA)
  node_name: string;
  node_title: string;
  node_description: string;
  icon: string;
  ability_type: string;
  effect_label: string;   // "공격력 +6%"
  cost_type: string;      // gold / dna
  cost_amount: number;
  unlocked: boolean;
  affordable: boolean;
  available: boolean;     // prereq 충족 + 미해금
}

export interface AvatarItem {
  player_id: string;
  max_hp: number;
  base_speed: number;
  color_hex: string;
  unlocked: boolean;
  selected: boolean;
}

export interface EquipItem {
  slot_id: string;
  slot_name: string;
  item_name: string;
  icon: string;
  grade: string;
  stat_type: 'power' | 'hp' | 'speed';
  current_level: number;
  max_level: number;
  current_stat: string;   // "ATK +36%"
  next_cost: number;      // 0 = 만렙
  description: string;
  equipped: boolean;      // 장착 여부 (스탯 반영 + 머리 위 버프 아이콘)
  skill_id: string;       // 무기 아이템: 장착 시 기본 공격 스킬 (그 외 빈값)
}

export interface WeaponItem {
  weapon_id: string;
  item_name: string;
  icon: string;
  grade: string;
  skill_id: string;
  description: string;
  selected: boolean;
}

export interface TalentItem {
  talent_id: string;
  talent_name: string;
  description: string;
  icon: string;
  current_level: number;
  max_level: number;
  current_effect: string;   // 현재 효과 표시 ("+30%")
  next_effect: string;      // 다음 레벨 효과 ("+45%")
  next_cost: number;        // 다음 레벨 비용 (0 = 만렙)
}

export interface MultOption {
  mult: number;       // 배수 (1/2/5/10/50/100)
  energy: number;     // 소모 번개
  affordable: boolean;
}

export interface LuckyTrainSkillItem {
  skill_id: string;
  skill_name: string;
  icon: string;
  description: string;
  skill_type: string;
  gold_cost: number;
  owned_level: number; // 0 = 미보유
}

export interface SkillCardData {
  skill_id: string;
  skill_name: string;
  icon: string;
  description: string;
  current_level: number;
  max_level: number;
  is_new: boolean;
  is_evolution?: boolean;
  evo_recipe?: {
    active_icon: string;
    active_name: string;
    passive_icon: string;
    passive_name: string;
  };
}

type Listener = () => void;

class HudExternalStore {
  private state: HudState = {
    '/lobby/visible': true,
    '/lobby/selectedStage': 1,
    '/lobby/maxStages': 10,
    '/lobby/stageEnemyMult': 1.0,
    '/lobby/ticketSummary': '',
    '/scene/transitionVisible': false,
    '/scene/transitionText': 'STAGE 1',
    '/hud/timer': '00:00',
    '/hud/stage': 1,
    '/hud/expPct': 0,
    '/hud/level': 1,
    '/hud/killCount': 0,
    '/hud/gold': 0,
    '/hud/hpPct': 100,
    '/hud/bossHpPct': 100,
    '/hud/bossVisible': false,
    '/hud/bossName': '',
    '/hud/bossWarningVisible': false,
    '/hud/activeSkillSlots': [],
    '/hud/passiveSkillSlots': [],
    '/lobby/selectedPlayerId': 'default',
    '/lobby/selectedPlayerColorHex': '#7BE8F4',
    '/avatar/visible': false,
    '/avatar/players': [],
    '/avatar/selectedId': 'default',
    '/lobby/advLevel': 1,
    '/lobby/advExpPct': 0,
    '/lobby/gems': 500,
    '/lobby/metaGold': 0,
    '/meta/avatarProfileLimit': 16,
    '/lobby/entryTickets': 10,
    '/lobby/prizeBalls': 0,
    '/lobby/prizeKillsToward': 0,
    '/lobby/prizeKillsRequired': 30,
    '/lobby/archeryBowStands': 5,
    '/lobby/showLavaQuest': true,
    '/lobby/showPrizeDrop': true,
    '/lobby/showArcheryArena': true,
    '/archery/killsTowardBow': 0,
    '/archery/killsPerBow': 100,
    '/archery/claimPending': false,
    '/event/redDot/lava': false,
    '/event/redDot/prize': false,
    '/event/redDot/archery': false,
    '/event/redDot/tycoon': false,
    '/event/redDot/season': false,
    '/event/redDot/express': false,
    '/event/redDot/mall': false,
    '/event/redDot/drivers': false,
    '/redDot/tycoon/claim': false,
    '/redDot/tycoon/action': false,
    '/redDot/tycoon/new': false,
    '/redDot/season/claim': false,
    '/redDot/season/action': false,
    '/redDot/season/new': false,
    '/redDot/express/claim': false,
    '/redDot/express/action': false,
    '/redDot/lava/claim': false,
    '/redDot/lava/action': false,
    '/redDot/lava/new': false,
    '/redDot/prize/claim': false,
    '/redDot/prize/action': false,
    '/redDot/prize/new': false,
    '/redDot/archery/claim': false,
    '/redDot/archery/action': false,
    '/redDot/archery/new': false,
    '/redDot/event_stack/any': false,
    '/redDot/mall/claim': false,
    '/redDot/mall/new': false,
    '/redDot/drivers/action': false,
    '/redDot/drivers/new': false,
    '/redDot/nav/shop': false,
    '/redDot/nav/shop/new': false,
    '/redDot/nav/equip': false,
    '/redDot/nav/equip/new': false,
    '/redDot/nav/equip/action': false,
    '/redDot/nav/challenge': false,
    '/redDot/nav/challenge/new': false,
    '/redDot/nav/challenge/action': false,
    '/redDot/nav/evolution': false,
    '/redDot/nav/evolution/new': false,
    '/redDot/nav/evolution/action': false,
    '/redDot/nav/battle': false,
    '/lobby/showMallMarvels': true,
    '/lobby/showDriversJoy': true,
    '/lobby/menuOpen': false,
    '/iframe/visible': false,
    '/iframe/src': '',
    '/iframe/mountKey': 0,
    '/event/minigame/activeId': '',
    '/event/minigame/visible': false,
    '/event/minigame/suspended': false,
    '/event/minigame/mountKey': 0,
    '/game/lavaQuestActive': false,
    '/lobby/selectedMult': 1,
    '/lobby/multEnergyCost': 5,
    '/lobby/stageName': '야생 거리',
    '/lobby/bestTime': '--:--',
    '/toast/visible': false,
    '/toast/text': '',
    '/advUp/visible': false,
    '/advUp/level': 1,
    '/advUp/rewardGem': 0,
    '/advUp/rewardGold': 0,
    '/challenge/visible': false,
    '/challenge/items': [],
    '/evolution/visible': false,
    '/evolution/items': [],
    '/evolution/gold': 0,
    '/evolution/dna': 0,
    '/equip/visible': false,
    '/equip/items': [],
    '/equip/gold': 0,
    '/equip/atk': 0,
    '/equip/hp': 0,
    '/equip/spd': 0,
    '/equip/weapons': [],
    '/equip/selectedWeaponId': 'revolver',
    '/shop/visible': false,
    '/shop/cashKrw': 1_000_000,
    '/shop/gems': 500,
    '/shop/metaGold': 0,
    '/shop/energy': 0,
    '/shop/supplyKeys': 0,
    '/shop/defensePity': 0,
    '/shop/purchasedGemIds': [],
    '/shop/gemPacks': [],
    '/shop/goldPacks': [],
    '/shop/boxes': [],
    '/shop/maxEnergy': 60,
    '/shop/showResetButton': true,
    '/shop/testCashKrw': 1_000_000,
    '/talent/visible': false,
    '/talent/items': [],
    '/talent/gold': 0,
    '/battle/visible': false,
    '/battle/options': [],
    '/battle/selectedMult': 1,
    '/battle/energy': 10,
    '/battle/maxEnergy': 60,
    '/energy/visible': false,
    '/energy/cur': 10,
    '/energy/max': 60,
    '/energy/gems': 0,
    '/rushWave/visible': false,
    '/bossIntro/phase': 0,
    '/bossDeath/phase': 0,
    '/bossDeath/bossName': '',
    '/pause/visible': false,
    '/luckyTrain/visible': false,
    '/luckyTrain/gold': 0,
    '/luckyTrain/skills': [],
    '/luckyTrain/selectedId': '',
    '/modal/visible': false,
    '/modal/cards': [],
    '/result/visible': false,
    '/result/isVictory': false,
    '/result/killCount': 0,
    '/result/survivalTime': '00:00',
    '/result/finalLevel': 1,
    '/result/totalXpEarned': 0,
    '/result/goldEarned': 0,
    '/result/tycoonEarned': 0,
    '/result/ticketMultiplier': 1,
    '/vfx/flashOpacity': 0,
    '/vfx/flashColor': '#ffffff',
  };

  private listeners = new Set<Listener>();

  get<K extends keyof HudState>(path: K): HudState[K] {
    return this.state[path];
  }

  set<K extends keyof HudState>(path: K, value: HudState[K]): void {
    this.state = { ...this.state, [path]: value };
    this._notify();
  }

  setMany(patch: Partial<HudState>): void {
    this.state = { ...this.state, ...patch };
    this._notify();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getSnapshot(): HudState {
    return this.state;
  }

  private _notify(): void {
    this.listeners.forEach(fn => fn());
  }
}

export const hudStore = new HudExternalStore();

/** React useSyncExternalStore 어댑터 — registry.tsx에서 직접 사용 */
export type { HudState };
