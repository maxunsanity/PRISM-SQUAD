/**
 * registry.tsx — type 문자열 → React 컴포넌트 매핑
 * 운영 UI 추가 시 operationalUi.ts 타입 추가 + 이 파일 JSX 구현 동시 패치
 */
import React, { useSyncExternalStore } from 'react';
import { hudStore, type SkillCardData } from '../game/hudExternalStore';

/* ── 공통 유틸 ── */
function useHud() {
  return useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
}

function resolveValue(v: unknown, hud: ReturnType<typeof useHud>): unknown {
  if (v && typeof v === 'object' && '$state' in v) {
    const path = (v as { $state: string }).$state;
    return hud[path as keyof typeof hud];
  }
  return v;
}

/* ── HUD 컴포넌트 구현 ── */

function HudTimerImpl({ value }: { value: unknown }) {
  const hud = useHud();
  const v = resolveValue(value, hud) as string;
  return (
    <div style={{
      background: 'rgba(15, 25, 45, 0.85)',
      border: '2px solid #FFD600',
      boxShadow: '0 0 10px rgba(255, 214, 0, 0.3)',
      padding: '3px 12px',
      color: '#fff',
      fontSize: 20,
      fontWeight: '900',
      fontFamily: 'monospace',
      letterSpacing: '1px',
      borderRadius: 0
    }}>
      {v}
    </div>
  );
}

function HudTopBarImpl() {
  const hud = useHud();
  const timer = String(hud['/hud/timer'] ?? '00:00');
  const stage = Number(hud['/hud/stage'] ?? 1);
  const level = Number(hud['/hud/level'] ?? 1);
  const hp = Number(hud['/hud/hpPct'] ?? 100);
  const expPct = Number(hud['/hud/expPct'] ?? 0);
  const kill = Number(hud['/hud/killCount'] ?? 0);
  const gold = Number(hud['/hud/gold'] ?? 0);

  return (
    <div style={{
      width: '100%',
      height: 56,
      background: 'rgba(18, 24, 38, 0.95)',
      borderBottom: '3px solid #FFD600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      boxSizing: 'border-box',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    }}>
      {/* ── 좌측: 아바타 + 플레이어 상태 (HP/EXP) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* 아바타 영역 (각짐 컨셉) */}
        <div style={{
          width: 42,
          height: 42,
          border: '2px solid #FFD600',
          background: '#2B313F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          position: 'relative',
        }}>
          <svg width="34" height="34" viewBox="0 0 32 32">
            <rect x="4" y="4" width="24" height="24" fill="#FF6B2B" stroke="#111" strokeWidth="2"/>
            <rect x="6" y="10" width="20" height="8" fill="#7BE8F4" stroke="#111" strokeWidth="2"/>
            <path d="M 6 28 L 26 28 L 21 24 L 11 24 Z" fill="#CC0000" stroke="#111" strokeWidth="2" />
          </svg>
          {/* 레벨 뱃지 */}
          <div style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            background: '#FFD600',
            color: '#111',
            fontSize: 9,
            fontWeight: 900,
            padding: '1px 3px',
            border: '1px solid #111',
            lineHeight: 1,
          }}>
            L{level}
          </div>
        </div>

        {/* 텍스트 & 바 컨테이너 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.5px',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}>
            PLAYER 1 <span style={{ color: '#FFD600', marginLeft: 4 }}>STAGE {stage}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* HP Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 8, color: '#FF4455', fontWeight: 900, width: 14 }}>HP</span>
              <div style={{
                width: 88,
                height: 5,
                background: '#111826',
                border: '1px solid #FF445544',
                boxSizing: 'border-box',
              }}>
                <div style={{
                  width: `${Math.max(0, Math.min(100, hp))}%`,
                  height: '100%',
                  background: '#FF4455',
                  transition: 'width 0.1s ease-out',
                }} />
              </div>
            </div>
            {/* EXP Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 8, color: '#00F0FF', fontWeight: 900, width: 14 }}>XP</span>
              <div style={{
                width: 88,
                height: 5,
                background: '#111826',
                border: '1px solid #00F0FF44',
                boxSizing: 'border-box',
              }}>
                <div style={{
                  width: `${Math.max(0, Math.min(100, expPct))}%`,
                  height: '100%',
                  background: '#00F0FF',
                  transition: 'width 0.2s ease-out',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 우측: 일시정지 및 인게임 재화 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* 일시정지 */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'TOGGLE_PAUSE' }))}
          style={{
            width: 30,
            height: 30,
            background: 'rgba(15, 25, 45, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#fff',
            fontSize: 12,
            cursor: 'pointer',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'skewX(-8deg)',
            outline: 'none',
          }}
        >
          <span style={{ display: 'inline-block', transform: 'skewX(8deg)' }}>⏸</span>
        </button>

        {/* 타이머 */}
        <div style={{
          minWidth: 64,
          height: 30,
          background: 'rgba(15, 25, 45, 0.85)',
          border: '1.5px solid #00F0FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: '0 6px',
          color: '#fff',
          fontWeight: 900,
          fontSize: 12,
          fontFamily: 'monospace',
          transform: 'skewX(-8deg)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, transform: 'skewX(8deg)' }}>
            <span style={{ color: '#00F0FF' }}>⏱</span>
            <span>{timer}</span>
          </span>
        </div>

        {/* 처치수 */}
        <div style={{
          minWidth: 54,
          height: 30,
          background: 'rgba(15, 25, 45, 0.85)',
          border: '1.5px solid #FF4455',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: '0 6px',
          color: '#fff',
          fontWeight: 900,
          fontSize: 12,
          fontFamily: 'monospace',
          transform: 'skewX(-8deg)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, transform: 'skewX(8deg)' }}>
            <span style={{ color: '#FF4455' }}>💀</span>
            <span style={{ color: '#FF4455' }}>{kill}</span>
          </span>
        </div>

        {/* 골드 */}
        <div style={{
          minWidth: 58,
          height: 30,
          background: 'rgba(15, 25, 45, 0.85)',
          border: '1.5px solid #FFD600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: '0 6px',
          color: '#fff',
          fontWeight: 900,
          fontSize: 12,
          fontFamily: 'monospace',
          transform: 'skewX(-8deg)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, transform: 'skewX(8deg)' }}>
            <span style={{ color: '#FFD600' }}>🪙</span>
            <span style={{ color: '#FFD600' }}>{gold}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function HudExpBarImpl({ pct, level }: { pct: unknown; level: unknown }) {
  const hud = useHud();
  const p = resolveValue(pct, hud) as number;
  const lv = resolveValue(level, hud) as number;
  return (
    <div style={{
      position: 'relative', width: '100%', height: 28,
      background: 'rgba(15, 25, 45, 0.85)',
      border: '1.5px solid #00F0FF',
      boxShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
      borderRadius: 0,
      overflow: 'hidden'
    }}>
      <div style={{ width: `${p}%`, height: '100%', background: '#80E5B0', borderRadius: 0, transition: 'width 0.2s' }} />
      <span style={{ position: 'absolute', left: 10, top: 0, fontSize: 13, fontWeight: '900', color: '#fff', lineHeight: '28px', textShadow: '0 1px 2px #000' }}>
        LV.{lv}
      </span>
    </div>
  );
}

function HudKillCountImpl({ value }: { value: unknown }) {
  const hud = useHud();
  const v = resolveValue(value, hud) as number;
  return (
    <div style={{
      background: 'rgba(15, 25, 45, 0.85)',
      border: '1.5px solid #FF4455',
      boxShadow: '0 0 8px rgba(255, 68, 85, 0.25)',
      padding: '3px 10px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: 0
    }}>
      💀 <span style={{ color: '#FF4455' }}>{v}</span>
    </div>
  );
}

function HudGoldImpl({ value }: { value: unknown }) {
  const hud = useHud();
  const v = resolveValue(value, hud) as number;
  return (
    <div style={{
      background: 'rgba(15, 25, 45, 0.85)',
      border: '1.5px solid #FFD600',
      boxShadow: '0 0 8px rgba(255, 214, 0, 0.25)',
      padding: '3px 10px',
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: 0
    }}>
      🪙 <span style={{ color: '#FFD600' }}>{v}</span>
    </div>
  );
}

function HudPlayerHpImpl({ pct }: { pct: unknown }) {
  const hud = useHud();
  const p = resolveValue(pct, hud) as number;
  const color = p <= 50 ? '#FF6680' : '#FFD600';
  return (
    <div style={{ position: 'absolute', bottom: -6, left: 0, width: '100%', height: 4, background: '#ffffff44', borderRadius: 0 }}>
      <div style={{ width: `${p}%`, height: '100%', background: color, borderRadius: 0, transition: 'width 0.1s' }} />
    </div>
  );
}

function HudBossHpImpl({ pct, bossName }: { pct: unknown; bossName: unknown }) {
  const hud = useHud();
  const visible = hud['/hud/bossVisible'];
  const p = resolveValue(pct, hud) as number;
  const name = resolveValue(bossName, hud) as string;
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', top: 60, left: '10%', width: '80%' }}>
      <div style={{ color: '#C099FF', fontSize: 12, marginBottom: 2 }}>{name}</div>
      <div style={{ height: 10, background: '#ffffff44', borderRadius: 5 }}>
        <div style={{ width: `${p}%`, height: '100%', background: '#9955FF', borderRadius: 5, transition: 'width 0.1s' }} />
      </div>
    </div>
  );
}

function HudPauseBtnImpl({ action: _action }: { action: string }) {
  return (
    <button
      style={{
        background: 'rgba(15,25,45,0.85)',
        border: '2px solid #ffffff66',
        borderRadius: 0,
        color: '#fff',
        fontSize: 16,
        padding: '0 12px',
        height: '100%',
        cursor: 'pointer',
        flexShrink: 0,
        letterSpacing: 1,
      }}
      onClick={() => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'TOGGLE_PAUSE' }))}
    >
      ⏸
    </button>
  );
}

function LobbyScreenImpl() {
  const hud = useHud();
  if (!hud['/lobby/visible']) return null;
  const stage = Number(hud['/hud/stage'] ?? 1);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 45,
      background: 'linear-gradient(180deg, #ff9d00 0%, #ffb11a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#111',
    }}>
      <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', textShadow: '0 3px 0 #0008' }}>PRISM SQUAD</div>
      <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700 }}>로비 · 입장 대기</div>
      <div style={{
        marginTop: 8,
        fontSize: 24,
        fontWeight: 900,
        color: '#111',
        letterSpacing: 1,
      }}>
        STAGE {stage}
      </div>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'START_GAME' }))}
        style={{
          marginTop: 26, width: 220, height: 220, padding: 0,
          background: '#FFD600', border: '3px solid #111', borderRadius: 0,
          fontWeight: 900, fontSize: 44, color: '#111', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1.12,
          whiteSpace: 'pre-line',
          textAlign: 'center',
        }}
      >
        게임{'\n'}시작
      </button>
    </div>
  );
}

function SceneTransitionImpl({ visibleState, text }: { visibleState: unknown; text: unknown }) {
  const hud = useHud();
  const visible = Boolean(resolveValue(visibleState, hud));
  const label = String(resolveValue(text, hud) ?? 'STAGE 1');
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: '#000000cc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>{label}</div>
    </div>
  );
}

function HudSkillSlotsImpl({ slots: _slots }: { slots: unknown }) {
  return null;
}

function HudBossWarningImpl() {
  const hud = useHud();
  if (!hud['/hud/bossWarningVisible']) return null;
  return (
    <div style={{
      position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
      background: '#CC0000', color: '#fff', fontWeight: 'bold', fontSize: 20,
      padding: '8px 24px', borderRadius: 0, zIndex: 20,
      border: '2px solid #FF4444',
      boxShadow: '0 0 16px #CC000088',
    }}>
      ⚠️ BOSS WARNING ⚠️
    </div>
  );
}

function renderSkillIcon(skillId: string, size = 44): React.ReactNode {
  switch (skillId) {
    case 'kunai':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M24 6 L34 24 L24 42 L14 24 Z" fill="none" stroke="#FF5388" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF5388)"/>
          <circle cx="24" cy="24" r="3.5" fill="#FF5388"/>
        </svg>
      );
    case 'ghost_shuriken':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M24 4 L36 24 L24 44 L12 24 Z" fill="none" stroke="#00F0FF" strokeWidth="4.5" filter="drop-shadow(0 0 6px #00F0FF)"/>
          <path d="M24 10 L31 24 L24 38 L17 24 Z" fill="none" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 3"/>
        </svg>
      );
    case 'boomerang':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M14 14 L34 14 L34 34" fill="none" stroke="#00A0FF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 5px #00A0FF)"/>
        </svg>
      );
    case 'twin_boomerang':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="15" fill="none" stroke="#00FFFF" strokeWidth="4.5" filter="drop-shadow(0 0 5px #00FFFF)"/>
          <circle cx="24" cy="24" r="9" fill="none" stroke="#00FFFF" strokeWidth="2"/>
        </svg>
      );
    case 'molotov':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#FF6633" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF6633)"/>
          <path d="M16 24 A8 8 0 0 1 32 24" fill="none" stroke="#FF3300" strokeWidth="3"/>
        </svg>
      );
    case 'napalm':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="#FF3300" strokeWidth="5.5" filter="drop-shadow(0 0 8px #FF3300)"/>
          <circle cx="24" cy="24" r="10" fill="#FF8800" opacity="0.6"/>
        </svg>
      );
    case 'guardian':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="13" fill="none" stroke="#E5E5E5" strokeWidth="3"/>
          <rect x="21" y="4" width="6" height="40" fill="#E5E5E5" transform="rotate(30 24 24)"/>
          <rect x="21" y="4" width="6" height="40" fill="#E5E5E5" transform="rotate(120 24 24)"/>
        </svg>
      );
    case 'eternal_guardian':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="15" fill="none" stroke="#FFD600" strokeWidth="4.5" filter="drop-shadow(0 0 6px #FFD600)"/>
          <polygon points="24,2 28,16 42,16 31,25 35,39 24,30 13,39 17,25 6,16 20,16" fill="none" stroke="#FFD600" strokeWidth="2.5"/>
        </svg>
      );
    case 'rocket':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="20" y="8" width="8" height="28" rx="4" fill="none" stroke="#FF6633" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF6633)"/>
          <polygon points="20,36 28,36 24,44" fill="#FF3300"/>
        </svg>
      );
    case 'cluster_rocket':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="17" y="6" width="14" height="28" rx="6" fill="none" stroke="#FF3300" strokeWidth="4.5" filter="drop-shadow(0 0 6px #FF3300)"/>
          <circle cx="24" cy="28" r="3.5" fill="#FFCC00"/>
          <polygon points="14,34 34,34 24,44" fill="#FF5500"/>
        </svg>
      );
    case 'drone':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="14" y="14" width="20" height="20" rx="3" fill="none" stroke="#8F9DB6" strokeWidth="4.5" filter="drop-shadow(0 0 5px #8F9DB6)"/>
          <circle cx="24" cy="24" r="6.5" fill="#FF533D"/>
        </svg>
      );
    case 'soccer_ball':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#80E5B0" strokeWidth="4.5" filter="drop-shadow(0 0 6px #80E5B0)"/>
          <polygon points="24,14 29,24 19,24" fill="#80E5B0"/>
        </svg>
      );
    case 'quantum_ball':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#00FFCC" strokeWidth="5.5" filter="drop-shadow(0 0 8px #00FFCC)"/>
          <circle cx="24" cy="24" r="6" fill="#00FFCC" opacity="0.8"/>
        </svg>
      );
    case 'drill_shot':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,4 36,36 12,36" fill="none" stroke="#00F0FF" strokeWidth="4.5" filter="drop-shadow(0 0 6px #00F0FF)"/>
          <path d="M24 12 Q20 20 24 28" fill="none" stroke="#00F0FF" strokeWidth="2.5"/>
        </svg>
      );
    case 'whistling_arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,2 34,32 24,26 14,32" fill="none" stroke="#00F0FF" strokeWidth="4.5" filter="drop-shadow(0 0 8px #00F0FF)"/>
          <line x1="24" y1="26" x2="24" y2="44" stroke="#00F0FF" strokeWidth="3" strokeDasharray="3 3"/>
        </svg>
      );
    case 'dimensional_blade':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M8 40 Q24 20 40 8" fill="none" stroke="#FF55FF" strokeWidth="4.5" strokeLinecap="round" filter="drop-shadow(0 0 6px #FF55FF)"/>
        </svg>
      );
    case 'void_slash':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#FF55FF" strokeWidth="5.5" filter="drop-shadow(0 0 8px #FF55FF)"/>
          <path d="M12 12 L36 36 M36 12 L12 36" stroke="#FF55FF" strokeWidth="2.5"/>
        </svg>
      );
    case 'debuff_aura':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="10" y="10" width="28" height="28" rx="4" fill="none" stroke="#80E5B0" strokeWidth="4.0" filter="drop-shadow(0 0 5px #80E5B0)"/>
          <circle cx="24" cy="24" r="8" fill="#9900FF" filter="drop-shadow(0 0 6px #9900FF)"/>
          <circle cx="16" cy="16" r="3" fill="#9900FF"/>
          <circle cx="32" cy="32" r="3" fill="#9900FF"/>
        </svg>
      );
    case 'elasticShoes':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M14 34 L24 24 L34 34 M14 24 L24 14 L34 24" fill="none" stroke="#80E5B0" strokeWidth="4.5" filter="drop-shadow(0 0 5px #80E5B0)"/>
        </svg>
      );
    case 'highFuel':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="10" fill="none" stroke="#FF8800" strokeWidth="3"/>
          <circle cx="24" cy="24" r="17" fill="none" stroke="#FF5500" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF5500)"/>
        </svg>
      );
    case 'exoskeleton':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,6 38,14 38,34 24,42 10,34 10,14" fill="none" stroke="#C099FF" strokeWidth="4.5" filter="drop-shadow(0 0 5px #C099FF)"/>
        </svg>
      );
    case 'ninjaScroll':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,6 40,24 24,42 8,24" fill="none" stroke="#FFCC00" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FFCC00)"/>
          <circle cx="24" cy="24" r="5" fill="#FFCC00"/>
        </svg>
      );
    default:
      return <div style={{ fontSize: size * 0.7 }}>❓</div>;
  }
}

function SkillModalImpl({ cards }: { cards: unknown }) {
  const hud = useHud();
  const visible = hud['/modal/visible'];
  const cardList = resolveValue(cards, hud) as SkillCardData[];

  // 반응형 스케일 감지 추가 (모바일 짤림 방지)
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // 기준 너비를 440px로 넉넉하게 확장하여 큰 카드가 안 잘리도록 처리
      if (width < 440) {
        setScale(Math.max(0.65, width / 440));
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!visible) return null;

  const activeSlots = (hud['/hud/activeSkillSlots'] as string[]) ?? [];
  const passiveSlots = (hud['/hud/passiveSkillSlots'] as string[]) ?? [];
  const maxSlots = 6;
  const pad = (arr: string[]) => {
    const out = [...arr];
    while (out.length < maxSlots) out.push('');
    return out.slice(0, maxSlots);
  };
  const paddedActive = pad(activeSlots);
  const paddedPassive = pad(passiveSlots);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(5, 10, 20, 0.72)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 40,
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden',
    }}>
      {/* 동적 스케일 래퍼 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        transition: 'transform 0.1s ease-out',
        width: '100%',
      }}>
        {/* ── 스킬 선택 배너: 기울기 유지, 끝까지 각짐 ── */}
        <div style={{
          background: '#FFD600',
          border: '3px solid #111',
          borderRadius: 0,
          padding: '6px 48px',
          color: '#111',
          fontSize: 15,
          fontWeight: '900',
          marginBottom: 12,
          boxShadow: '0 4px 0 #00000044, 0 0 15px rgba(255,214,0,0.5)',
          transform: 'skewX(-8deg)',
          letterSpacing: '2px',
          flexShrink: 0,
        }}>
          <span style={{ display: 'inline-block', transform: 'skewX(8deg)' }}>스킬 선택</span>
        </div>

        {/* ── ACTIVE / PASSIVE 슬롯바: 완전 각진 ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          background: 'rgba(15, 25, 45, 0.85)',
          border: '1.5px solid rgba(0, 240, 255, 0.4)',
          borderRadius: 0,
          padding: '8px 12px',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
          marginBottom: 20, zIndex: 41, width: 'fit-content', minWidth: 268,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 54, color: '#00F0FF', fontSize: 9, fontWeight: 900,
              letterSpacing: '1px',
              borderLeft: '2px solid #00F0FF', paddingLeft: 4,
            }}>ACTIVE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 26px)', gap: 4 }}>
              {paddedActive.map((icon, idx) => (
                <div key={`a-${icon}-${idx}`} style={{
                  width: 26, height: 26,
                  borderRadius: 0,
                  border: `1.5px solid ${icon ? '#00F0FF' : 'rgba(0,240,255,0.2)'}`,
                  background: icon ? 'rgba(0,240,255,0.12)' : 'rgba(5,10,20,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon ? renderSkillIcon(icon, 18) : null}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 54, color: '#80E5B0', fontSize: 9, fontWeight: 900,
              letterSpacing: '1px',
              borderLeft: '2px solid #80E5B0', paddingLeft: 4,
            }}>PASSIVE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 26px)', gap: 4 }}>
              {paddedPassive.map((icon, idx) => (
                <div key={`p-${icon}-${idx}`} style={{
                  width: 26, height: 26,
                  borderRadius: 0,
                  border: `1.5px solid ${icon ? '#80E5B0' : 'rgba(128,229,176,0.2)'}`,
                  background: icon ? 'rgba(128,229,176,0.12)' : 'rgba(5,10,20,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon ? renderSkillIcon(icon, 18) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 가로 카드 컨테이너 ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexShrink: 0 }}>
          {cardList.map((card, idx) => {
            const isEvo = card.is_evolution;
            const neonColor = isEvo ? '#CC55FF' : '#00F0FF';
            return (
              <div key={card.skill_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('prism:skillSelect', { detail: card.skill_id }))}
                  style={{
                    position: 'relative',
                    background: 'rgba(15, 25, 45, 0.92)',
                    borderRadius: 0,
                    padding: '0 0 8px 0',
                    width: 136,
                    height: 234,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: `2px solid ${neonColor}`,
                    cursor: 'pointer',
                    boxShadow: `0 0 12px ${neonColor}33`,
                    color: '#fff',
                    overflow: 'hidden',
                    outline: 'none',
                  }}
                >
                  {/* EVO 뱃지 */}
                  {isEvo && (
                    <span style={{
                      position: 'absolute', top: 4, left: 4,
                      background: 'linear-gradient(90deg, #CC55FF, #8A2BE2)',
                      color: '#fff', fontSize: 9, borderRadius: 0,
                      padding: '2px 5px', fontWeight: 'bold',
                      border: '1px solid #E0B0FF', zIndex: 2,
                    }}>⚡ EVO</span>
                  )}
                  {/* New! 뱃지: 기울기 스타일 적용 */}
                  {!isEvo && card.is_new && (
                    <span style={{
                      position: 'absolute', top: 0, right: 0,
                      background: '#FF4500', color: '#fff', fontSize: 9,
                      borderRadius: 0,
                      padding: '3px 8px', fontWeight: 'bold',
                      boxShadow: '0 0 5px #FF450088',
                      transform: 'skewX(-8deg)',
                      zIndex: 2,
                    }}>New!</span>
                  )}

                  {/* 카드 헤더: 기울기 유지 */}
                  <div style={{
                    width: '100%',
                    background: isEvo
                      ? 'linear-gradient(90deg, #8A2BE2, #CC55FF)'
                      : '#FFD600',
                    color: isEvo ? '#fff' : '#111',
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: '900',
                    padding: '7px 4px',
                    borderBottom: `2px solid ${neonColor}`,
                    marginTop: isEvo ? 18 : 0,
                    letterSpacing: '0.5px',
                  }}>
                    {card.skill_name}
                  </div>

                  {/* 중앙 아이콘 */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: `drop-shadow(0 0 6px ${neonColor}44)`,
                  }}>
                    {renderSkillIcon(card.skill_id, 46)}
                  </div>

                  {/* 하단 설명 */}
                  <div style={{
                    fontSize: 11, color: '#d1d9e6',
                    padding: '0 8px', textAlign: 'center',
                    height: 42,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: '15px', marginBottom: 4,
                  }}>
                    {card.description}
                  </div>

                  {/* 레벨 별점 */}
                  <div style={{
                    fontSize: 12, color: '#FFD600',
                    letterSpacing: '0.5px',
                    textShadow: '0 0 4px rgba(255,214,0,0.4)',
                  }}>
                    {'★'.repeat(card.current_level)}{'☆'.repeat(Math.max(0, card.max_level - card.current_level))}
                  </div>
                </button>

                {/* 하단 단축 번호: 직사각형으로 변경 */}
                <div style={{
                  width: 28, height: 20,
                  borderRadius: 0,
                  background: 'rgba(15,25,45,0.85)',
                  border: `1.5px solid ${neonColor}`,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace',
                  marginTop: 2,
                  transform: 'skewX(-4deg)',
                }}>
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* 가이드 텍스트 */}
        <div style={{
          marginTop: 20,
          color: '#ffffff88',
          fontSize: 11,
          fontWeight: 'bold',
          letterSpacing: '2px',
          flexShrink: 0,
        }}>
          배울 스킬을 선택하세요
        </div>
      </div>
    </div>
  );
}

function ResultScreenImpl(_props: Record<string, unknown>) {
  const hud = useHud();
  const visible = hud['/result/visible'];
  if (!visible) return null;
  const isVictory = hud['/result/isVictory'];
  const accent = isVictory ? '#40d08c' : '#ff5a76';
  const title = isVictory ? '성공' : '실패';
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0f1726dd',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 40, color: '#fff',
      padding: 14,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: '#202838',
        border: '3px solid #2f3f5f',
        boxShadow: '0 8px 0 #0b1020',
      }}>
        <div style={{
          height: 52,
          background: '#1773b7',
          borderBottom: '3px solid #0b3f66',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          fontWeight: 900,
          color: accent,
          textShadow: '0 2px 0 #0008',
        }}>
          {title}
        </div>

        <div style={{
          padding: '16px 14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{
            background: '#0e121d',
            border: '2px solid #3b465e',
            minHeight: 104,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1, letterSpacing: 1 }}>
              {String(hud['/result/survivalTime'])}
            </div>
            <div style={{ fontSize: 12, color: '#b8c0d4', fontWeight: 700 }}>
              총 플레이 시간
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <div style={{ background: '#4a556f', border: '2px solid #616d89', padding: '8px 10px', fontSize: 22, fontWeight: 900, display: 'flex', justifyContent: 'space-between' }}>
              <span>획득 EXP</span><span style={{ color: '#79ff97' }}>{Number(hud['/result/totalXpEarned'] ?? 0)}</span>
            </div>
            <div style={{ background: '#4a556f', border: '2px solid #616d89', padding: '8px 10px', fontSize: 22, fontWeight: 900, display: 'flex', justifyContent: 'space-between' }}>
              <span>획득 골드</span><span style={{ color: '#ffd35a' }}>{Number(hud['/result/goldEarned'] ?? 0)}</span>
            </div>
            <div style={{ background: '#4a556f', border: '2px solid #616d89', padding: '8px 10px', fontSize: 20, fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
              <span>처치 수</span><span>{Number(hud['/result/killCount'] ?? 0)}</span>
            </div>
            <div style={{ background: '#4a556f', border: '2px solid #616d89', padding: '8px 10px', fontSize: 20, fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
              <span>최고 레벨</span><span>{Number(hud['/result/finalLevel'] ?? 1)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 14px 14px' }}>
          <button onClick={() => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'EXIT' }))}
            style={{
              width: '100%',
              height: 56,
              background: '#ffd600',
              border: '3px solid #111',
              borderRadius: 0,
              color: '#111',
              cursor: 'pointer',
              fontSize: 30,
              fontWeight: 900,
            }}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── registry 맵 ── */
type RegistryFn = (props: Record<string, unknown>) => React.ReactElement | null;

export const registry: Record<string, RegistryFn> = {
  PrismHudTopBar:      () => <HudTopBarImpl />,
  PrismLobbyScreen:    () => <LobbyScreenImpl />,
  PrismSceneTransition:(p) => <SceneTransitionImpl visibleState={p['visibleState']} text={p['text']} />,
  PrismHudTimer:       (p) => <HudTimerImpl value={p['value']} />,
  PrismHudExpBar:      (p) => <HudExpBarImpl pct={p['pct']} level={p['level']} />,
  PrismHudKillCount:   (p) => <HudKillCountImpl value={p['value']} />,
  PrismHudGold:        (p) => <HudGoldImpl value={p['value']} />,
  PrismHudPlayerHp:    (p) => <HudPlayerHpImpl pct={p['pct']} />,
  PrismHudBossHp:      (p) => <HudBossHpImpl pct={p['pct']} bossName={p['bossName']} />,
  PrismHudPauseBtn:    (p) => <HudPauseBtnImpl action={p['action'] as string} />,
  PrismHudSkillSlots:  (p) => <HudSkillSlotsImpl slots={p['slots']} />,
  PrismHudBossWarning: () => <HudBossWarningImpl />,
  PrismSkillModal:     (p) => <SkillModalImpl cards={p['cards']} />,
  PrismResultScreen:   (p) => <ResultScreenImpl {...p} />,
};
