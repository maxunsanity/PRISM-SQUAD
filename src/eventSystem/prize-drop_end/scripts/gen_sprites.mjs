/**
 * gen_sprites.mjs
 * Node.js 내장 모듈(fs, zlib)만 사용해 128×128 PNG 스프라이트 생성.
 * 실행: node scripts/gen_sprites.mjs
 */
import { createDeflate } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

const SIZE = 128;

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function uint32BE(n) {
  return [(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF];
}

function pngChunk(type, data) {
  const tb = [...type].map(c => c.charCodeAt(0));
  const body = [...tb, ...data];
  return [...uint32BE(data.length), ...body, ...uint32BE(crc32(new Uint8Array(body)))];
}

// ── PNG 인코더 ─────────────────────────────────────────────────────────────
function deflateSync(buf) {
  return new Promise((res, rej) => {
    const z = createDeflate({ level: 6 });
    const chunks = [];
    z.on('data', c => chunks.push(c));
    z.on('end', () => res(Buffer.concat(chunks)));
    z.on('error', rej);
    z.write(buf);
    z.end();
  });
}

async function savePng(pixels, w, h, path) {
  const raw = [];
  for (let y = 0; y < h; y++) {
    raw.push(0); // filter byte: None
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      raw.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
    }
  }
  const compressed = await deflateSync(Buffer.from(raw));
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  const ihdr = pngChunk('IHDR', [...uint32BE(w), ...uint32BE(h), 8, 6, 0, 0, 0]);
  const idat = pngChunk('IDAT', [...compressed]);
  const iend = pngChunk('IEND', []);
  writeFileSync(path, Buffer.from([...sig, ...ihdr, ...idat, ...iend]));
  console.log('  wrote', path);
}

// ── 픽셀 드로잉 헬퍼 ───────────────────────────────────────────────────────
function makePixels(w, h) { return new Uint8Array(w * h * 4); }

function setPixel(px, w, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= w || y < 0 || y >= w) return;
  const i = (y * w + x) * 4;
  px[i] = r; px[i+1] = g; px[i+2] = b; px[i+3] = a;
}

function fillCircle(px, w, cx, cy, r, color, softEdge = 0) {
  const [R, G, B] = color;
  const lo = Math.max(0, Math.floor(cy - r - softEdge - 1));
  const hi = Math.min(w - 1, Math.ceil(cy + r + softEdge + 1));
  const ll = Math.max(0, Math.floor(cx - r - softEdge - 1));
  const rr = Math.min(w - 1, Math.ceil(cx + r + softEdge + 1));
  for (let y = lo; y <= hi; y++) {
    for (let x = ll; x <= rr; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (softEdge > 0) {
        const alpha = Math.max(0, Math.min(1, (r + softEdge - dist) / softEdge));
        if (alpha > 0) setPixel(px, w, x, y, R, G, B, Math.round(alpha * 255));
      } else {
        if (dist <= r) setPixel(px, w, x, y, R, G, B, 255);
      }
    }
  }
}

function fillRect(px, w, x0, y0, x1, y1, color, alpha = 255) {
  const [R, G, B] = color;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      setPixel(px, w, x, y, R, G, B, alpha);
}

// ── 스프라이트 픽셀 생성 ───────────────────────────────────────────────────
function makeSlotNormal(w) {
  const px = makePixels(w, w);
  const cx = w >> 1, cy = w >> 1, r = (w >> 1) - 4;
  fillCircle(px, w, cx, cy, r, [80, 220, 60]);
  fillCircle(px, w, cx - 10, cy - 10, Math.round(r * 0.45), [180, 255, 140], 6);
  for (let a = 0; a < Math.PI * 2; a += 0.02)
    setPixel(px, w, Math.round(cx + (r+1)*Math.cos(a)), Math.round(cy + (r+1)*Math.sin(a)), 30, 100, 20, 200);
  return px;
}

function makeSlotJackpot(w) {
  const px = makePixels(w, w);
  const cx = w >> 1, cy = w >> 1, r = (w >> 1) - 4;
  fillCircle(px, w, cx, cy, r, [255, 200, 0]);
  fillCircle(px, w, cx - 10, cy - 10, Math.round(r * 0.45), [255, 240, 150], 8);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2 / 5) - Math.PI / 2;
    fillCircle(px, w, Math.round(cx + r * 0.55 * Math.cos(a)), Math.round(cy + r * 0.55 * Math.sin(a)), 6, [255, 255, 200]);
  }
  for (let a = 0; a < Math.PI * 2; a += 0.02)
    setPixel(px, w, Math.round(cx + (r+1)*Math.cos(a)), Math.round(cy + (r+1)*Math.sin(a)), 160, 100, 0, 220);
  return px;
}

function makeObstaclePin(w) {
  const px = makePixels(w, w);
  const cx = w >> 1, cy = w >> 1, r = (w >> 1) - 4;
  fillCircle(px, w, cx, cy, r, [180, 180, 170]);
  fillCircle(px, w, cx - 5, cy - 5, Math.round(r * 0.35), [230, 230, 220], 4);
  for (let a = 0; a < Math.PI * 2; a += 0.02)
    setPixel(px, w, Math.round(cx + (r+1)*Math.cos(a)), Math.round(cy + (r+1)*Math.sin(a)), 60, 60, 60, 200);
  return px;
}

function makeObstacleReward(w) {
  const px = makePixels(w, w);
  const cx = w >> 1, cy = w >> 1, r = (w >> 1) - 4;
  fillCircle(px, w, cx, cy, r, [255, 210, 30]);
  fillCircle(px, w, cx - 8, cy - 8, Math.round(r * 0.4), [255, 250, 180], 6);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI / 2) - Math.PI / 4;
    fillCircle(px, w, Math.round(cx + r * 0.35 * Math.cos(a)), Math.round(cy + r * 0.35 * Math.sin(a)), 5, [255, 255, 255]);
  }
  return px;
}

function makeBgDefault(w) {
  const px = makePixels(w, w);
  for (let y = 0; y < w; y++) {
    const t = y / w;
    fillRect(px, w, 0, y, w - 1, y, [Math.round(240 - t*20), Math.round(240 - t*15), Math.round(232 - t*20)]);
  }
  return px;
}

function makeFxParticle(w) {
  const px = makePixels(w, w);
  const cx = w >> 1, cy = w >> 1;
  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const alpha = Math.max(0, 1 - dist / (w / 2));
      setPixel(px, w, x, y, 255, 255, 200, Math.round(alpha * alpha * 255));
    }
  }
  return px;
}

// ── 메인 ──────────────────────────────────────────────────────────────────
const BASE = decodeURIComponent(new URL('../public/assets', import.meta.url).pathname);
mkdirSync(`${BASE}/slots`, { recursive: true });
mkdirSync(`${BASE}/obstacles`, { recursive: true });
mkdirSync(`${BASE}/bg`, { recursive: true });
mkdirSync(`${BASE}/fx`, { recursive: true });

console.log('Generating sprites...');
await savePng(makeSlotNormal(SIZE),     SIZE, SIZE, `${BASE}/slots/normal.png`);
await savePng(makeSlotJackpot(SIZE),    SIZE, SIZE, `${BASE}/slots/jackpot.png`);
await savePng(makeObstaclePin(SIZE),    SIZE, SIZE, `${BASE}/obstacles/pin.png`);
await savePng(makeObstacleReward(SIZE), SIZE, SIZE, `${BASE}/obstacles/reward.png`);
await savePng(makeBgDefault(SIZE),      SIZE, SIZE, `${BASE}/bg/default.png`);
await savePng(makeFxParticle(SIZE),     SIZE, SIZE, `${BASE}/fx/particle.png`);
console.log('Done.');
