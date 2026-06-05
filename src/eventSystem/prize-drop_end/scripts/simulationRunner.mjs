/**
 * Prize Drop — Simulation Bank Runner
 *
 * 오프라인 실행 전용. 물리 시뮬레이션을 미리 돌려
 * 각 (drop_position × target_slot) 조합의 자연스러운 경로를 수집한다.
 *
 * 실행: node scripts/simulationRunner.mjs
 * 추가 실행 시: 기존 뱅크에 경로가 append 된다.
 */

import Matter from 'matter-js';
import decomp from 'poly-decomp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

Matter.Common.setDecomp(decomp);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANK_DIR = path.join(__dirname, '../game_data/bank');

// ── 보드 상수 (boardBuilder.ts와 동일) ──────────────────────────
const B = {
  WIDTH: 360,
  HEIGHT: 396,
  PIN_RADIUS: 5,
  BALL_RADIUS: 9,
  SLOT_COUNT: 7,
  SLOT_HEIGHT: 25,
  SEP_WIDTH: 8,
};

// ── CSV 파서 ────────────────────────────────────────────────────
function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      let v = values[i] ? values[i].trim() : '';
      if (v === 'true') v = true;
      else if (v === 'false') v = false;
      else if (v === '') v = undefined;
      else if (!isNaN(Number(v))) v = Number(v);
      obj[h] = v;
    });
    return obj;
  });
}

const obstaclesCsv = fs.readFileSync(
  path.join(__dirname, '../game_data/04_board_obstacle.csv'), 'utf-8'
);
const OBSTACLES = parseCsv(obstaclesCsv);

// ── 보드 빌더 (boardBuilder.ts와 동일 로직) ──────────────────────
function buildBoard() {
  const { WIDTH, HEIGHT, SLOT_COUNT, PIN_RADIUS, SLOT_HEIGHT } = B;
  const pins = [], obstacles = [], slots = [], boundaries = [];

  OBSTACLES.forEach(obs => {
    if (obs.type === 'pin') {
      pins.push(Matter.Bodies.circle(obs.cx, obs.cy, obs.radius, {
        isStatic: true, label: 'pin', restitution: 0.6,
      }));
    } else if (obs.type === 'circle') {
      const body = Matter.Bodies.circle(obs.cx, obs.cy, obs.radius, {
        isStatic: true, label: 'reward', restitution: 3.5,
      });
      obstacles.push(body);
    } else if (obs.type === 'triangle') {
      const isLeft = obs.cx < 180;
      const h = obs.radius, b = obs.radius * 2.0;
      const verts = isLeft
        ? [{ x: -h, y: -b }, { x: h, y: 0 }, { x: -h, y: b }]
        : [{ x: h, y: -b }, { x: -h, y: 0 }, { x: h, y: b }];
      const body = Matter.Bodies.fromVertices(obs.cx, obs.cy, [verts], {
        isStatic: true, label: 'obstacle',
      });
      obstacles.push(body);
    } else if (obs.type === 'diamond') {
      const body = Matter.Bodies.polygon(obs.cx, obs.cy, 4, obs.radius, {
        isStatic: true, label: 'obstacle',
      });
      obstacles.push(body);
    } else if (obs.type === 'rect') {
      const side = obs.radius * 2;
      const body = Matter.Bodies.rectangle(obs.cx, obs.cy, side, side, {
        isStatic: true, label: 'bumper',
      });
      obstacles.push(body);
    }
  });

  const { SEP_WIDTH } = B;
  const slotW = WIDTH / SLOT_COUNT;
  for (let i = 0; i < SLOT_COUNT; i++) {
    slots.push(Matter.Bodies.rectangle(
      slotW / 2 + i * slotW, HEIGHT - SLOT_HEIGHT / 2,
      slotW - SEP_WIDTH, SLOT_HEIGHT,
      { isStatic: true, isSensor: true, label: `slot_${i}` }
    ));
    if (i < SLOT_COUNT - 1) {
      const sepX = (i + 1) * slotW;
      boundaries.push(Matter.Bodies.rectangle(
        sepX, HEIGHT - SLOT_HEIGHT / 2, SEP_WIDTH, SLOT_HEIGHT,
        { isStatic: true, label: 'separator' }
      ));
      pins.push(Matter.Bodies.circle(sepX, HEIGHT - SLOT_HEIGHT, PIN_RADIUS, {
        isStatic: true, label: 'separator_pin', restitution: 0.6,
      }));
    }
  }

  const wt = 50;
  boundaries.push(
    Matter.Bodies.rectangle(-wt / 2, HEIGHT / 2, wt, HEIGHT, { isStatic: true }),
    Matter.Bodies.rectangle(WIDTH + wt / 2, HEIGHT / 2, wt, HEIGHT, { isStatic: true }),
    Matter.Bodies.rectangle(WIDTH / 2, HEIGHT + wt / 2, WIDTH, wt, { isStatic: true }),
  );

  return [...pins, ...obstacles, ...slots, ...boundaries];
}

// ── 드롭 X 좌표 (PrizeDrop.ts spawnBall과 동일) ──────────────────
function dropX(posIndex) {
  const cw = 300, margin = (B.WIDTH - cw) / 2;
  return margin + posIndex * (cw / 4);
}

// ── 시뮬레이션 1회 실행 ─────────────────────────────────────────
const SAMPLE_MS = 50;   // 50ms마다 위치 기록 (≈3프레임)
const MAX_STEPS = 6000; // 최대 100초 (실제 3~5초면 충분)
const DT = 1000 / 60;

function simulate(baseX) {
  const engine = Matter.Engine.create({ gravity: { y: 0.6 } });
  const boardBodies = buildBoard();
  Matter.Composite.add(engine.world, boardBodies);

  const xOffset = (Math.random() - 0.5) * 20;
  const x = baseX + xOffset;
  const ball = Matter.Bodies.circle(x, 10, B.BALL_RADIUS, {
    restitution: 0.8, friction: 0.0, frictionAir: 0.001, label: 'ball',
  });

  const angle = (Math.random() - 0.5) * (10 * Math.PI / 180);
  const forceVar = 0.8 + Math.random() * 0.4;
  const base = 2.0;
  Matter.Body.setVelocity(ball, {
    x: Math.sin(angle) * base * forceVar,
    y: Math.cos(angle) * base * forceVar,
  });
  Matter.Composite.add(engine.world, ball);

  let landedSlot = -1;
  const keyframes = [];
  let nextSampleT = 0;

  Matter.Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(({ bodyA, bodyB }) => {
      const ballB = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null;
      const reward = bodyA.label === 'reward' ? bodyA : bodyB.label === 'reward' ? bodyB : null;
      if (ballB && reward) {
        Matter.Body.setVelocity(ballB, {
          x: ballB.velocity.x * 1.2,
          y: ballB.velocity.y * 1.2,
        });
      }
      const labels = [bodyA.label, bodyB.label];
      if (labels.includes('ball') && labels.some(l => l.startsWith('slot_'))) {
        const slotLabel = labels.find(l => l.startsWith('slot_'));
        landedSlot = parseInt(slotLabel.split('_')[1]);
      }
    });
  });

  let t = 0;
  for (let step = 0; step < MAX_STEPS; step++) {
    Matter.Engine.update(engine, DT);
    t += DT;

    if (t >= nextSampleT) {
      keyframes.push({
        x: Math.round(ball.position.x * 10) / 10,
        y: Math.round(ball.position.y * 10) / 10,
        t: Math.round(t),
      });
      nextSampleT += SAMPLE_MS;
    }

    if (landedSlot >= 0) break;
    if (ball.position.y > B.HEIGHT + 100) break;
  }

  Matter.Engine.clear(engine);
  Matter.World.clear(engine.world, false);

  return { landedSlot, keyframes, duration_ms: Math.round(t) };
}

// ── 메인 ────────────────────────────────────────────────────────
const PATHS_PER_COMBO = parseInt(process.argv[2] || '20');
const DROP_POSITIONS = [0, 1, 2, 3, 4];

if (!fs.existsSync(BANK_DIR)) fs.mkdirSync(BANK_DIR, { recursive: true });

for (const pos of DROP_POSITIONS) {
  const baseX = dropX(pos);
  const collected = Array.from({ length: B.SLOT_COUNT }, () => []);
  let attempts = 0;
  const maxAttempts = PATHS_PER_COMBO * B.SLOT_COUNT * 80;

  while (attempts < maxAttempts) {
    if (collected.every(p => p.length >= PATHS_PER_COMBO)) break;
    const result = simulate(baseX);
    if (result.landedSlot >= 0 && collected[result.landedSlot].length < PATHS_PER_COMBO) {
      collected[result.landedSlot].push({
        drop_position: pos,
        target_slot: result.landedSlot,
        duration_ms: result.duration_ms,
        keyframes: result.keyframes,
      });
    }
    attempts++;
  }

  for (let slot = 0; slot < B.SLOT_COUNT; slot++) {
    const filePath = path.join(BANK_DIR, `bank_slot${slot}_drop${pos}.json`);
    let existing = [];
    if (fs.existsSync(filePath)) {
      try { existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch {}
    }
    fs.writeFileSync(filePath, JSON.stringify([...existing, ...collected[slot]]));
  }
}

const files = fs.readdirSync(BANK_DIR).filter(f => f.endsWith('.json'));
const totalPaths = files.reduce((sum, f) => {
  try { return sum + JSON.parse(fs.readFileSync(path.join(BANK_DIR, f), 'utf-8')).length; } catch { return sum; }
}, 0);
console.log(`✅ ${files.length}개 파일, ${totalPaths}개 경로 생성 완료`);
