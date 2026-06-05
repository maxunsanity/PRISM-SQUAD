import { useSyncExternalStore, type MouseEvent } from 'react';
import {
  Renderer,
  ComponentRegistry,
  Spec,
  ComponentRenderProps,
} from '@json-render/react';
import { ActionHandler } from '@json-render/core';
import { hudStore } from '../game/hudExternalStore';
import { dispatchGameAction } from '../game/gameControlBridge';
import { rewardModalStore } from '../game/rewardModalStore';
import { postRewardDetail, rewardTypeToKind } from '../game/postRewardDetail';

// ── Registry 구현 ────────────────────────────────────────────────

// 전체 HUD root 래퍼 — flex column, 646px 고정 높이로 레이아웃 잡음
function HudRootImpl({ children }: ComponentRenderProps) {
  return <div className="prizedrop-hud-root">{children}</div>;
}

// 상단 컨트롤 영역 — 110px 고정
function HudTopSectionImpl({ children }: ComponentRenderProps) {
  return <div className="prizedrop-hud-top">{children}</div>;
}

// 신규: 스테이터스 콘솔 (공 수 + 배수)
function StatusPanelImpl({ children }: ComponentRenderProps) {
  return <div className="prizedrop-status-panel">{children}</div>;
}

// 신규: 머신 헤드 (드롭 버튼들을 감싸는 종이 프레임)
function MachineHeadImpl({ children }: ComponentRenderProps) {
  return (
    <div className="prizedrop-machine-head">
      <div className="machine-head-body">{children}</div>
      <div className="machine-head-bottom-line" />
    </div>
  );
}

// 보드 공간 확보용 spacer — pointer-events: none 으로 클릭 통과
function BoardSpacerImpl() {
  return <div className="prizedrop-board-spacer" />;
}

function BallCountImpl({ element }: ComponentRenderProps) {
  const p = (element.props ?? {}) as { ballCount?: unknown; showWarning?: unknown };
  const count = Number(p.ballCount ?? 0);
  return (
    <div className="ball-hud">
      <span className="ball-icon">⚾</span>
      <span className="ball-count">{count}</span>
      {/* +10 치트 버튼 제거 — 퍼즐볼은 전투에서 획득한 호스트 재화 */}
      {!!p.showWarning && <div className="ball-warning">공이 부족합니다!</div>}
    </div>
  );
}

function MultiplierImpl({ element, emit }: ComponentRenderProps) {
  const p = (element.props ?? {}) as { multiplier?: unknown };
  return (
    <div className="multiplier-circle" onClick={() => (emit as any)('press')}>
      x{Number(p.multiplier ?? 1)}
    </div>
  );
}

// 드롭 버튼 — 각 버튼마다 종이 배출구(Launcher)를 감싸도록 변경
function DropButtonsImpl() {
  const dropBusy = useSyncExternalStore(
    hudStore.subscribe,
    () => Boolean(hudStore.getSnapshot()['/hud/drop_busy']),
    () => false,
  );

  return (
    <div id="jr-overlay-buttons">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="drop-launcher">
          <button
            type="button"
            className="btn-drop"
            disabled={dropBusy}
            aria-disabled={dropBusy}
            onClick={() => {
              if (dropBusy) return;
              dispatchGameAction('release_drop', i);
            }}
          />
          <div className="launcher-spout" />
        </div>
      ))}
    </div>
  );
}

function SlotLabelsImpl() {
  const labels = [1, 10, 20, 100, 20, 10, 1];
  return (
    <div id="slot-labels">
      {labels.map((v, i) => (
        <div key={i} className="slot-item">
          <div className="lightning-icon" />
          <div className="slot-val">{v}</div>
        </div>
      ))}
    </div>
  );
}

type MilestoneRewardDef = {
  step: number;
  threshold_lightning: number;
  reward_type: string;
  reward_amount: number;
  reward_icon: string;
  reward_label: string;
  reward_item_id: string;
};

function MilestoneBarImpl({ element }: ComponentRenderProps) {
  const p = (element.props ?? {}) as {
    sessionLightning?: unknown;
    milestoneStep?: unknown;
    milestoneThresholds?: unknown;
    milestoneRewards?: unknown;
    lastGain?: unknown;
    showGain?: unknown;
    cycleCount?: unknown;
  };

  const step = Number(p.milestoneStep ?? 0);
  const thresholds = (p.milestoneThresholds as number[]) ?? [100, 200, 300, 400, 500];
  const rewards = (p.milestoneRewards as MilestoneRewardDef[]) ?? [];
  const sessionLightning = Number(p.sessionLightning ?? 0);
  const total = thresholds.length;

  const prevThreshold = step === 0 ? 0 : thresholds[step - 1];
  const nextThreshold = thresholds[step] ?? thresholds[total - 1];
  const segProgress = nextThreshold > prevThreshold
    ? Math.max(0, Math.min((sessionLightning - prevThreshold) / (nextThreshold - prevThreshold), 1))
    : 1;
  const fillWidth = (step + segProgress) / total * 100;

  return (
    <div className="ms-wrap">
      <div className={`ms-gain ${p.showGain ? 'ms-gain--on' : ''}`}>
        <span className="ms-gain-arrow">▲</span>
        <span className="ms-gain-num">+{Number(p.lastGain ?? 0)}</span>
      </div>
      <div className="ms-track">
        <div className="ms-fill" style={{ width: `${fillWidth}%` }} />
        {thresholds.map((t, i) => {
          const ms = rewards.find(r => r.step === i + 1) ?? rewards[i];
          const cleared = i < step;
          const openMarkDetail = (e: MouseEvent) => {
            e.stopPropagation();
            if (!ms) return;
            postRewardDetail({
              kind: rewardTypeToKind(ms.reward_type),
              slotId: ms.reward_item_id?.trim() || undefined,
              label: ms.reward_label || undefined,
              icon: ms.reward_icon || '🎁',
              amount: ms.reward_amount || undefined,
            });
          };
          return (
          <div key={i} className={`ms-mark ${cleared ? 'ms-mark--done' : ''}`} style={{ left: `${(i + 1) / total * 100}%` }}>
            <div
              className="ms-mark-icon ms-mark-icon--tap"
              role="button"
              tabIndex={0}
              title="보상 정보"
              onClick={openMarkDetail}
            >
              {cleared ? '✓' : (ms?.reward_icon ?? '🎁')}
            </div>
            <div className="ms-mark-num">{t}</div>
          </div>
          );
        })}
      </div>
      <div className="ms-count">
        NEXT REWARD AT {nextThreshold}
        {Number(p.cycleCount ?? 0) > 0 && <span className="ms-cycle-badge">ROUND {Number(p.cycleCount)}</span>}
      </div>
    </div>
  );
}

function RewardModalImpl({ element, emit }: ComponentRenderProps) {
  const p = (element.props ?? {}) as {
    visible?: unknown;
    modalType?: unknown;
    modalStep?: unknown;
    rewardAmount?: unknown;
    rewardType?: unknown;
    rewardIcon?: unknown;
    rewardLabel?: unknown;
    rewardSlotId?: unknown;
    remaining?: unknown;
    cycleCount?: unknown;
  };

  if (!p.visible) return null;

  const modalType = String(p.modalType ?? '');
  const isJackpot = modalType === 'jackpot';
  const isComplete = modalType === 'complete';
  const remaining = Number(p.remaining ?? 0);

  const openDetail = () => {
    if (isComplete) return;
    const rewardType = String(p.rewardType ?? '');
    const kind = isJackpot ? 'lightning' : rewardTypeToKind(rewardType);
    postRewardDetail({
      kind,
      slotId: String(p.rewardSlotId ?? '').trim() || undefined,
      label: String(p.rewardLabel ?? '') || undefined,
      icon: String(p.rewardIcon ?? '🎁'),
      amount: Number(p.rewardAmount ?? 0) || undefined,
    });
  };

  return (
    <div className="rw-overlay" onClick={isComplete ? undefined : () => (emit as any)('close')}>
      <div
        className={`rw-card ${isJackpot ? 'rw-card--jackpot' : ''} ${isComplete ? 'rw-card--complete' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {modalType === 'milestone' && (
          <>
            <div className="rw-icon rw-icon--tap" role="button" tabIndex={0} onClick={openDetail}>{String(p.rewardIcon ?? '🎲')}</div>
            <div className="rw-label">마일스톤 {Number(p.modalStep ?? 0)}단계 달성!</div>
            <div className="rw-amount">+{Number(p.rewardAmount ?? 0)}</div>
            <div className="rw-unit">{String(p.rewardLabel || p.rewardType || '')}</div>
          </>
        )}
        {isJackpot && (
          <>
            <div className="rw-icon rw-icon--tap" role="button" tabIndex={0} onClick={openDetail}>🎰</div>
            <div className="rw-label">JACKPOT</div>
            <div className="rw-amount">+{Number(p.rewardAmount ?? 0)}</div>
            <div className="rw-unit">번개</div>
          </>
        )}
        {isComplete && (
          <>
            <div className="rw-icon">🎉</div>
            <div className="rw-label rw-label--complete">모든 이벤트를 진행하셨습니다!</div>
            {Number(p.cycleCount ?? 0) > 1 && (
              <div className="rw-unit">{Number(p.cycleCount ?? 0)}번째 완주</div>
            )}
          </>
        )}
        <button className="rw-close" onClick={() => (emit as any)('close')}>
          {remaining > 0 ? `확인 (${remaining}개 남음)` : '확인'}
        </button>
      </div>
    </div>
  );
}

export const prizedropRegistry: ComponentRegistry = {
  PrizedropHudRoot: HudRootImpl,
  PrizedropHudTopSection: HudTopSectionImpl,
  PrizedropHudStatusPanel: StatusPanelImpl,
  PrizedropHudMachineHead: MachineHeadImpl,
  PrizedropHudBoardSpacer: BoardSpacerImpl,
  PrizedropHudBallCount: BallCountImpl,
  PrizedropHudMultiplier: MultiplierImpl,
  PrizedropHudDropButtons: DropButtonsImpl,
  PrizedropHudSlotLabels: SlotLabelsImpl,
  PrizedropHudMilestoneBar: MilestoneBarImpl,
  PrizedropHudRewardModal: RewardModalImpl,
};

// ── Action Handlers ──────────────────────────────────────────────

export const overlayActionHandlers: Record<string, ActionHandler> = {
  prizedropDropBall: async () => {
    dispatchGameAction('release_drop', 2);
  },
  prizedropAddBalls: async () => {
    hudStore.update({ '/hud/ball_count': (hudStore.getSnapshot()['/hud/ball_count'] as number) + 10 });
  },
  prizedropCycleMultiplier: async () => {
    dispatchGameAction('select_multiplier');
  },
  prizedropDismissModal: async () => {
    rewardModalStore.dismiss();
  },
};

// ── Spec ─────────────────────────────────────────────────────────
// 구조:
//   root (HudRoot — flex column, 646px)
//     hud_top (HudTopSection — 110px)
//       controls_row (ControlsRow — flex row)
//         ball_count
//         multiplier
//       drop_buttons
//     board_spacer (396px, pointer-events: none)
//     slot_labels (50px)
//     milestone_bar
//     reward_modal (position: absolute overlay)

export const mainHudSpec: Spec = {
  root: 'root',
  elements: {
    root: {
      type: 'PrizedropHudRoot',
      props: {},
      children: ['hud_top', 'board_spacer', 'slot_labels', 'milestone_bar', 'reward_modal'],
    },
    hud_top: {
      type: 'PrizedropHudTopSection',
      props: {},
      children: ['status_panel', 'machine_head'],
    },
    status_panel: {
      type: 'PrizedropHudStatusPanel',
      props: {},
      children: ['ball_count', 'multiplier'],
    },
    machine_head: {
      type: 'PrizedropHudMachineHead',
      props: {},
      children: ['drop_buttons'],
    },
    board_spacer: {
      type: 'PrizedropHudBoardSpacer',
      props: {},
    },
    ball_count: {
      type: 'PrizedropHudBallCount',
      props: {
        ballCount: { $state: '/hud/ball_count' },
        showWarning: { $state: '/hud/show_warning' },
      },
      // 퍼즐볼 = 호스트(스퀘어) 재화 — 탭 +10 치트 제거(실재화 동기화)
    },
    multiplier: {
      type: 'PrizedropHudMultiplier',
      props: {
        multiplier: { $state: '/hud/multiplier' },
      },
      on: { press: { action: 'prizedropCycleMultiplier' } },
    },
    drop_buttons: {
      type: 'PrizedropHudDropButtons',
      props: {},
    },
    slot_labels: {
      type: 'PrizedropHudSlotLabels',
      props: {},
    },
    milestone_bar: {
      type: 'PrizedropHudMilestoneBar',
      props: {
        sessionLightning: { $state: '/hud/session_lightning' },
        milestoneStep: { $state: '/hud/milestone_step' },
        milestoneThresholds: { $state: '/hud/milestone_thresholds' },
        milestoneRewards: { $state: '/hud/milestone_rewards' },
        lastGain: { $state: '/hud/last_gain' },
        showGain: { $state: '/hud/show_gain' },
        cycleCount: { $state: '/hud/cycle_count' },
      },
    },
    reward_modal: {
      type: 'PrizedropHudRewardModal',
      props: {
        visible: { $state: '/hud/modal_visible' },
        modalType: { $state: '/hud/modal_type' },
        modalStep: { $state: '/hud/modal_step' },
        rewardAmount: { $state: '/hud/modal_reward_amount' },
        rewardType: { $state: '/hud/modal_reward_type' },
        rewardIcon: { $state: '/hud/modal_reward_icon' },
        rewardLabel: { $state: '/hud/modal_reward_label' },
        rewardSlotId: { $state: '/hud/modal_reward_slot_id' },
        remaining: { $state: '/hud/modal_remaining' },
        cycleCount: { $state: '/hud/modal_cycle_count' },
      },
      on: { close: { action: 'prizedropDismissModal' } },
    },
  },
};

export const GameJsonHud = () => {
  return <Renderer spec={mainHudSpec} registry={prizedropRegistry} />;
};
