import { useEffect, useRef, useState, useCallback } from 'react';
import { getEventAsset, type EventData } from '../data';
import { EventIcon } from './eventMonopolyUi';
import { EVENT_ANCHOR, getAnchorCenterInContainer } from './eventHudAnchors';

type FlyParticle = {
  id: number;
  kind: 'tycoon' | 'season';
  amount: number;
  assetKey: string;
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
  startMs: number;
  durationMs: number;
};

let flyId = 0;

/** 느린 가속 → 부드러운 감속 (베지어 t 매핑) */
function easeFly(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5
    ? 4 * x * x * x
    : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function quadBezier(t: number, a: number, b: number, c: number): number {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

function spawnStart(container: HTMLElement): { x: number; y: number } {
  const w = container.clientWidth;
  const h = container.clientHeight;
  return {
    x: w * (0.4 + Math.random() * 0.2),
    y: h * (0.5 + Math.random() * 0.14),
  };
}

function makeArcControl(
  x0: number, y0: number, x1: number, y1: number, kind: 'tycoon' | 'season',
): { cx: number; cy: number } {
  const mx = (x0 + x1) * 0.5;
  const my = (y0 + y1) * 0.5;
  const lift = kind === 'tycoon' ? -90 - Math.random() * 40 : -70 - Math.random() * 30;
  const side = kind === 'tycoon' ? -35 : 45;
  return { cx: mx + side, cy: my + lift };
}

const FLY_MS = { tycoon: 1550, season: 1750 } as const;

/** 처치 시 재화가 2차 베지어 곡선으로 HUD까지 끌려 들어감 */
export function EventCurrencyFlyOverlay({ data }: { data: EventData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<FlyParticle[]>([]);
  const [, setTick] = useState(0);
  const rafRef = useRef(0);

  const pump = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    const onFly = (e: Event) => {
      const d = (e as CustomEvent<{
        tycoonGain?: number;
        seasonGain?: number;
        tycoonAssetKey?: string;
        seasonAssetKey?: string;
      }>).detail;
      const container = containerRef.current;
      if (!container) return;

      const tycoonGain = Math.max(0, Number(d?.tycoonGain ?? 0));
      const seasonGain = Math.max(0, Number(d?.seasonGain ?? 0));
      const now = performance.now();
      const batch: FlyParticle[] = [];

      if (tycoonGain > 0) {
        const start = spawnStart(container);
        const target = getAnchorCenterInContainer(container, EVENT_ANCHOR.tycoonGauge)
          ?? { x: container.clientWidth * 0.35, y: 48 };
        const { cx, cy } = makeArcControl(start.x, start.y, target.x, target.y, 'tycoon');
        batch.push({
          id: ++flyId,
          kind: 'tycoon',
          amount: tycoonGain,
          assetKey: d?.tycoonAssetKey ?? 'tycoon_coin',
          x0: start.x, y0: start.y, cx, cy, x1: target.x, y1: target.y,
          startMs: now, durationMs: FLY_MS.tycoon,
        });
      }
      if (seasonGain > 0) {
        const start = spawnStart(container);
        const target = getAnchorCenterInContainer(container, EVENT_ANCHOR.seasonTab)
          ?? { x: container.clientWidth * 0.92, y: 160 };
        const { cx, cy } = makeArcControl(start.x, start.y, target.x, target.y, 'season');
        batch.push({
          id: ++flyId,
          kind: 'season',
          amount: seasonGain,
          assetKey: d?.seasonAssetKey ?? 'season_coin',
          x0: start.x, y0: start.y, cx, cy, x1: target.x, y1: target.y,
          startMs: now + 120, durationMs: FLY_MS.season,
        });
      }
      if (batch.length === 0) return;
      particlesRef.current = [...particlesRef.current, ...batch];
      pump();
    };

    window.addEventListener('event:currencyFly', onFly);
    return () => window.removeEventListener('event:currencyFly', onFly);
  }, [pump]);

  useEffect(() => {
    const step = (now: number) => {
      const list = particlesRef.current;
      if (list.length > 0) {
        const remain: FlyParticle[] = [];
        let changed = false;

        for (const p of list) {
          const raw = (now - p.startMs) / p.durationMs;
          if (raw >= 1) {
            changed = true;
            if (p.kind === 'tycoon') {
              window.dispatchEvent(new CustomEvent('event:tycoonGaugeAbsorb', {
                detail: { amount: p.amount },
              }));
            } else {
              window.dispatchEvent(new CustomEvent('event:seasonTabAbsorb', {
                detail: { amount: p.amount },
              }));
            }
            continue;
          }
          remain.push(p);
          changed = true;
        }

        if (changed) {
          particlesRef.current = remain;
          pump();
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pump]);

  const now = performance.now();
  const particles = particlesRef.current;

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 55, overflow: 'hidden' }}>
      {particles.map(p => {
        const raw = (now - p.startMs) / p.durationMs;
        const t = easeFly(Math.max(0, Math.min(1, raw)));
        const x = quadBezier(t, p.x0, p.cx, p.x1);
        const y = quadBezier(t, p.y0, p.cy, p.y1);
        const scale = 0.85 + 0.35 * (1 - Math.abs(t - 0.55) * 1.4);
        const opacity = raw > 0.88 ? 1 - (raw - 0.88) / 0.12 : 1;
        const asset = getEventAsset(data, p.assetKey);

        return (
          <div
            key={p.id}
            className="event-fly-particle-wrap"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`,
              opacity,
              willChange: 'transform, opacity',
            }}
          >
            {asset ? <EventIcon data={data} assetKey={p.assetKey} size={26} /> : <span>◆</span>}
          </div>
        );
      })}
    </div>
  );
}
