import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { loadAllGameData, type GameData, type VfxConfig } from './game/data';
import { catalog } from './jsonRender/catalog';
import { prismHudSpec } from './jsonRender/prismHudSpec';
import { registry } from './jsonRender/registry';
import { hudStore } from './game/hudExternalStore';
import { Renderer3D } from './three/Renderer3D';
import { GameCore } from './game/GameCore';
import { useSyncExternalStore } from 'react';

/* ── 9:16 뷰포트 크기 계산 (JS) ── */
function calc916(): { w: number; h: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw / vh > 9 / 16) {
    // 가로가 9:16보다 넓음 → 세로 기준
    return { w: Math.floor(vh * 9 / 16), h: vh };
  } else {
    // 세로가 9:16보다 긴 (또는 딱 맞음) → 가로 기준
    return { w: vw, h: Math.floor(vw * 16 / 9) };
  }
}

/* ── 화면 플래시 오버레이 ── */
function FlashOverlay() {
  // 요청사항: 화면 전체 붉은/플래시 오버레이 연출 비활성화
  return null;
}

/* ── HUD 렌더러 ── */
function PrismHudRenderer({ slot }: { slot: 'top' | 'bar' | 'modal' }) {
  useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );

  const topTypes = new Set([
    'PrismHudTopBar',
  ]);
  const barTypes = new Set([
    'PrismHudBossHp', 'PrismHudBossWarning', 'PrismHudSkillSlots',
  ]);
  const modalTypes = new Set([
    'PrismLobbyScreen', 'PrismSkillModal', 'PrismResultScreen', 'PrismSceneTransition',
  ]);

  const elements = catalog.validate(prismHudSpec);
  return (
    <>
      {elements.map((el, i) => {
        const inSlot = slot === 'top'
          ? topTypes.has(el.type)
          : slot === 'bar'
            ? barTypes.has(el.type)
            : modalTypes.has(el.type);
        if (!inSlot) return null;
        const fn = registry[el.type];
        if (!fn) return null;
        return (
          <React.Fragment key={i}>
            {fn((el as { props: Record<string, unknown> }).props)}
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ── 메인 App ── */
export default function App() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const coreRef    = useRef<GameCore | null>(null);
  const rendRef    = useRef<Renderer3D | null>(null);

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [error,    setError   ] = useState<string | null>(null);

  /* ── 9:16 뷰포트 크기 (JS 계산) ── */
  const [vp, setVp] = useState<{ w: number; h: number }>(calc916);

  useLayoutEffect(() => {
    // 초기 크기 보정
    setVp(calc916());

    const onResize = () => setVp(calc916());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* 1) CSV 로드 */
  useEffect(() => {
    loadAllGameData()
      .then(data => {
        catalog.validate(prismHudSpec);
        setGameData(data);
      })
      .catch(err => setError(String(err)));
  }, []);

  /* 2) Three.js + GameCore 초기화 — useLayoutEffect로 DOM 크기 확정 후 실행 */
  useLayoutEffect(() => {
    if (!gameData || !canvasRef.current || !wrapperRef.current) return;
    if (vp.w <= 0 || vp.h <= 0) return;

    const canvas = canvasRef.current;
    canvas.width = vp.w;
    canvas.height = vp.h;

    try {
      const fallbackVfx: VfxConfig = {
        vfx_id: 'fallback',
        particle_count: 0,
        particle_size_min: 0,
        particle_size_max: 0,
        particle_life_frames: 0,
        particle_speed: 0,
        bloom_strength: 0.9,
        bloom_radius: 0.35,
        bloom_threshold: 0.1,
        screen_shake_intensity: 0,
        screen_shake_duration_frames: 0,
        flash_duration_frames: 0,
      };
      const vfxDefault = gameData.vfx.get('enemy_death')
        ?? [...gameData.vfx.values()][0]
        ?? fallbackVfx;

      const renderer = new Renderer3D(canvas, gameData.map, vfxDefault, vp.w, vp.h);
      const core = new GameCore(gameData, renderer, wrapperRef.current);
      renderer.start();

      rendRef.current = renderer;
      coreRef.current = core;

      hudStore.setMany({
        '/hud/timer':     '00:00',
        '/hud/hpPct':    100,
        '/hud/level':    1,
        '/hud/expPct':   0,
        '/hud/killCount': 0,
        '/hud/gold':     0,
      });

      return () => {
        core.dispose();
        renderer.dispose();
        rendRef.current = null;
        coreRef.current = null;
      };
    } catch (err) {
      setError(`게임 초기화 실패: ${String(err)}`);
      return;
    }
  }, [gameData]);

  /* 창 리사이즈 시 캔버스·카메라만 갱신 (게임 재시작 없음) */
  useLayoutEffect(() => {
    if (!rendRef.current || !canvasRef.current || !coreRef.current) return;
    if (vp.w <= 0 || vp.h <= 0) return;
    canvasRef.current.width = vp.w;
    canvasRef.current.height = vp.h;
    rendRef.current.setViewportSize(vp.w, vp.h);
  }, [vp.w, vp.h]);

  /* ── 공통 레터박스 래퍼 ── */
  const letterbox = (children: React.ReactNode) => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000',
    }}>
      {children}
    </div>
  );

  /* 에러 */
  if (error) {
    return letterbox(
      <div style={{
        width: vp.w, height: vp.h,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#FF6680', padding: 24,
        flexDirection: 'column',
      }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>로드 실패</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{error}</div>
      </div>
    );
  }

  /* 로딩 */
  if (!gameData) {
    return letterbox(
      <div style={{
        width: vp.w, height: vp.h,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#7BE8F4',
      }}>
        <div style={{ fontSize: 32, fontWeight: 'bold', letterSpacing: 6 }}>PRISM SQUAD</div>
        <div style={{ marginTop: 16, fontSize: 14, color: '#ffffff66' }}>데이터 로딩 중...</div>
      </div>
    );
  }

  /* 게임 */
  return letterbox(
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width:  vp.w,
        height: vp.h,
        overflow: 'hidden',
        background: '#1a1a2e',
        flexShrink: 0,
      }}
    >
      {/* Three.js 캔버스 */}
      <canvas
        ref={canvasRef}
        width={vp.w}
        height={vp.h}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* 상단 HUD 바 (가로 100% 꽉 채우는 Top Bar 컴포넌트 수용) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        pointerEvents: 'auto',
        zIndex: 10,
      }}>
        <PrismHudRenderer slot="top" />
      </div>

      {/* 상단 바형 HUD (Top Bar 하단에 위치하도록 top: 72px로 조정) */}
      <div style={{
        position: 'absolute', top: 72, left: 0, right: 0,
        padding: '0 14px', pointerEvents: 'auto',
        zIndex: 10,
      }}>
        <PrismHudRenderer slot="bar" />
      </div>

      {/* 모달/전환 레이어 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'auto' }}>
        <PrismHudRenderer slot="modal" />
      </div>

      {/* 화면 플래시 */}
      <FlashOverlay />
    </div>
  );
}
