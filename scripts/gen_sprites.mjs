/**
 * gen_sprites.mjs — 플레이스홀더 스프라이트 PNG 생성
 * 실행: node scripts/gen_sprites.mjs
 * canvas 의존성 없이 순수 PNG 바이너리 작성
 */
import { writeFileSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import zlib from 'zlib';

// ── PNG 인코더 (최소 구현) ──────────────────────────────────────────────
function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const crcBuf = Buffer.concat([t, d]);
  const crc = crc32(crcBuf);
  return Buffer.concat([u32be(d.length), t, d, u32be(crc)]);
}

// CRC-32 table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makePNG(pixels, size) {
  // pixels: Uint8Array of size*size*4 (RGBA row-major)
  const IHDR = Buffer.concat([
    u32be(size), u32be(size),
    Buffer.from([8, 2, 0, 0, 0]), // bit depth=8, colorType=2(RGB)... use 6(RGBA)
  ]);
  // colorType 6 = RGBA
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 6;   // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  // scanlines: filter byte (0) + RGBA * size per row
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const si = (y * size + x) * 4;
      const di = y * (1 + size * 4) + 1 + x * 4;
      raw[di]     = pixels[si];
      raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2];
      raw[di + 3] = pixels[si + 3];
    }
  }
  const compressed = zlib.deflateSync(raw);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── 픽셀 그리기 헬퍼 ────────────────────────────────────────────────────
function hexToRGB(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function createPixels(size) {
  return new Uint8Array(size * size * 4); // all transparent
}

function setPixel(pixels, size, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (Math.round(y) * size + Math.round(x)) * 4;
  pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
}

function fillCircle(pixels, size, cx, cy, radius, r, g, b, a = 255) {
  for (let y = Math.max(0, cy - radius); y <= Math.min(size-1, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x <= Math.min(size-1, cx + radius); x++) {
      const dx = x - cx, dy = y - cy;
      if (dx*dx + dy*dy <= radius*radius) setPixel(pixels, size, x, y, r, g, b, a);
    }
  }
}

function fillRect(pixels, size, x0, y0, w, h, r, g, b, a = 255) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++)
      setPixel(pixels, size, x, y, r, g, b, a);
}

function fillTriangle(pixels, size, x0, y0, x1, y1, x2, y2, r, g, b, a = 255) {
  const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
  const maxX = Math.min(size-1, Math.ceil(Math.max(x0, x1, x2)));
  const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
  const maxY = Math.min(size-1, Math.ceil(Math.max(y0, y1, y2)));
  function sign(px, py, ax, ay, bx, by) {
    return (px - bx) * (ay - by) - (ax - bx) * (py - by);
  }
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d1 = sign(x, y, x0, y0, x1, y1);
      const d2 = sign(x, y, x1, y1, x2, y2);
      const d3 = sign(x, y, x2, y2, x0, y0);
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(hasNeg && hasPos)) setPixel(pixels, size, x, y, r, g, b, a);
    }
  }
}

function fillRing(pixels, size, cx, cy, outerR, innerR, r, g, b, a = 255) {
  for (let y = Math.max(0, cy - outerR); y <= Math.min(size-1, cy + outerR); y++) {
    for (let x = Math.max(0, cx - outerR); x <= Math.min(size-1, cx + outerR); x++) {
      const d2 = (x-cx)**2 + (y-cy)**2;
      if (d2 <= outerR**2 && d2 >= innerR**2) setPixel(pixels, size, x, y, r, g, b, a);
    }
  }
}

// 발광 효과: 가장자리 → 점점 투명
function glowCircle(pixels, size, cx, cy, radius, glowR, r, g, b) {
  const maxR = radius + glowR;
  for (let y = Math.max(0, cy - maxR); y <= Math.min(size-1, cy + maxR); y++) {
    for (let x = Math.max(0, cx - maxR); x <= Math.min(size-1, cx + maxR); x++) {
      const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
      if (dist > radius && dist <= maxR) {
        const alpha = Math.round(120 * (1 - (dist - radius) / glowR));
        if (alpha > 0) {
          const i = (y * size + x) * 4;
          if (pixels[i+3] < alpha) {
            pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = alpha;
          }
        }
      }
    }
  }
}

// ── 스프라이트 정의 ─────────────────────────────────────────────────────
const SIZE = 64;

function makeBasic() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#FF8080');
  const cx = 32, cy = 32;
  // 삼각형 (위쪽 뾰족)
  fillTriangle(p, SIZE, cx, 6, 58, 58, 6, 58, r, g, b);
  // 테두리 느낌 (약간 어두운 삼각형 안에 살짝 밝은)
  fillTriangle(p, SIZE, cx, 14, 52, 54, 12, 54, 255, 160, 160);
  // 눈 두 개
  fillRect(p, SIZE, 22, 36, 6, 6, 20, 20, 20);
  fillRect(p, SIZE, 36, 36, 6, 6, 20, 20, 20);
  return p;
}

function makeDog() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#E06060');
  // 납작한 삼각형 (→ 방향)
  fillTriangle(p, SIZE, 58, 32, 6, 12, 6, 52, r, g, b);
  fillTriangle(p, SIZE, 52, 32, 12, 18, 12, 46, 230, 130, 130);
  fillCircle(p, SIZE, 12, 32, 8, r, g, b);
  fillRect(p, SIZE, 28, 28, 5, 5, 20, 20, 20);
  fillRect(p, SIZE, 28, 38, 5, 5, 20, 20, 20);
  return p;
}

function makeBloater() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#FFBA66');
  const [gr,gg,gb] = hexToRGB('#FF9500');
  // 원형 + 발광
  glowCircle(p, SIZE, 32, 32, 22, 10, gr, gg, gb);
  fillCircle(p, SIZE, 32, 32, 22, r, g, b);
  fillCircle(p, SIZE, 32, 32, 16, 255, 200, 140);
  fillRect(p, SIZE, 26, 26, 6, 6, 30, 30, 30);
  fillRect(p, SIZE, 32, 26, 6, 6, 30, 30, 30);
  return p;
}

function makeSpitter() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#B899FF');
  const [gr,gg,gb] = hexToRGB('#8833FF');
  glowCircle(p, SIZE, 32, 32, 20, 10, gr, gg, gb);
  // 육각형 근사
  const hexPts = Array.from({length: 6}, (_, i) => {
    const a = i * Math.PI / 3 - Math.PI/6;
    return [32 + 20 * Math.cos(a), 32 + 20 * Math.sin(a)];
  });
  for (let y = 6; y < 58; y++) {
    for (let x = 6; x < 58; x++) {
      let inside = true;
      for (let i = 0; i < 6; i++) {
        const [ax, ay] = hexPts[i];
        const [bx, by] = hexPts[(i+1)%6];
        if ((bx-ax)*(y-ay) - (by-ay)*(x-ax) > 0) { inside = false; break; }
      }
      if (inside) setPixel(p, SIZE, x, y, r, g, b);
    }
  }
  fillRect(p, SIZE, 24, 26, 6, 6, 20, 20, 20);
  fillRect(p, SIZE, 34, 26, 6, 6, 20, 20, 20);
  return p;
}

function makePlayer() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#6688FF');
  // 몸통 사각형
  fillRect(p, SIZE, 12, 14, 40, 40, r, g, b);
  fillRect(p, SIZE, 16, 18, 32, 32, 140, 170, 255);
  // 눈
  fillRect(p, SIZE, 20, 22, 8, 8, 10, 10, 20);
  fillRect(p, SIZE, 36, 22, 8, 8, 10, 10, 20);
  // 방향 마커 (앞쪽)
  fillTriangle(p, SIZE, 32, 4, 24, 18, 40, 18, 255, 255, 100);
  return p;
}

function makeBoss() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#3D2060');
  const [gr,gg,gb] = hexToRGB('#6600FF');
  // 외부 발광
  glowCircle(p, SIZE, 32, 32, 26, 8, gr, gg, gb);
  // 링
  fillRing(p, SIZE, 32, 32, 26, 20, r, g, b);
  fillRing(p, SIZE, 32, 32, 24, 22, gr, gg, gb);
  // 가시 8개
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bx = 32 + Math.cos(a) * 30;
    const by = 32 + Math.sin(a) * 30;
    const tx = 32 + Math.cos(a) * 36;
    const ty = 32 + Math.sin(a) * 36;
    const px1 = 32 + Math.cos(a + 0.3) * 27;
    const py1 = 32 + Math.sin(a + 0.3) * 27;
    const px2 = 32 + Math.cos(a - 0.3) * 27;
    const py2 = 32 + Math.sin(a - 0.3) * 27;
    fillTriangle(p, SIZE, tx, ty, px1, py1, px2, py2, gr, gg, gb);
  }
  // 중앙 코어
  fillCircle(p, SIZE, 32, 32, 8, gr, gg, gb);
  fillCircle(p, SIZE, 32, 32, 5, 200, 100, 255);
  return p;
}

function makeKunai() {
  const p = createPixels(SIZE);
  // 다이아몬드 + 손잡이
  fillTriangle(p, SIZE, 32, 4, 20, 32, 44, 32, 180, 180, 200); // 위
  fillTriangle(p, SIZE, 32, 60, 20, 32, 44, 32, 140, 140, 160); // 아래
  fillRect(p, SIZE, 28, 38, 8, 16, 100, 80, 60); // 손잡이
  fillRect(p, SIZE, 30, 36, 4, 4, 220, 220, 240); // 중앙 반짝
  return p;
}

function makeBoomerang() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#33DDFF');
  // 호형
  for (let angle = 0; angle <= Math.PI * 1.5; angle += 0.05) {
    const x = 32 + Math.cos(angle) * 22;
    const y = 32 + Math.sin(angle) * 22;
    fillCircle(p, SIZE, Math.round(x), Math.round(y), 5, r, g, b);
  }
  fillCircle(p, SIZE, 32, 10, 7, r, g, b);
  fillCircle(p, SIZE, 10, 32, 7, r, g, b);
  return p;
}

function makeRocket() {
  const p = createPixels(SIZE);
  // 몸통
  fillRect(p, SIZE, 25, 14, 14, 36, 200, 100, 60);
  // 탄두
  fillTriangle(p, SIZE, 32, 4, 22, 18, 42, 18, 255, 140, 80);
  // 날개
  fillTriangle(p, SIZE, 20, 48, 26, 32, 20, 32, 180, 80, 40);
  fillTriangle(p, SIZE, 44, 48, 38, 32, 44, 32, 180, 80, 40);
  // 불꽃
  fillCircle(p, SIZE, 32, 54, 6, 255, 200, 50);
  fillCircle(p, SIZE, 28, 57, 4, 255, 100, 20);
  fillCircle(p, SIZE, 36, 57, 4, 255, 100, 20);
  return p;
}

function makeMolotov() {
  const p = createPixels(SIZE);
  // 화염 원형
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const d = Math.sqrt((x-32)**2 + (y-32)**2);
    if (d < 26) {
      const t = d / 26;
      const r2 = Math.round(255);
      const g2 = Math.round(200 * (1-t) + 50 * t);
      const b2 = 0;
      const a = Math.round(255 * (1 - t * 0.3));
      setPixel(p, SIZE, x, y, r2, g2, b2, a);
    }
  }
  fillCircle(p, SIZE, 32, 32, 10, 255, 240, 100);
  return p;
}

function makeGuardian() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#44CCFF');
  // 마름모 블레이드
  fillTriangle(p, SIZE, 32, 4, 8, 32, 32, 60, r, g, b);
  fillTriangle(p, SIZE, 32, 4, 56, 32, 32, 60, 100, 200, 255);
  fillCircle(p, SIZE, 32, 32, 4, 255, 255, 255);
  return p;
}

function makeDrone() {
  const p = createPixels(SIZE);
  fillRect(p, SIZE, 20, 24, 24, 16, 80, 120, 180);
  // 프로펠러
  fillRect(p, SIZE, 6, 20, 14, 6, 120, 160, 200);
  fillRect(p, SIZE, 44, 20, 14, 6, 120, 160, 200);
  fillRect(p, SIZE, 6, 38, 14, 6, 120, 160, 200);
  fillRect(p, SIZE, 44, 38, 14, 6, 120, 160, 200);
  fillCircle(p, SIZE, 32, 32, 5, 200, 220, 255);
  return p;
}

function makeSoccerBall() {
  const p = createPixels(SIZE);
  fillCircle(p, SIZE, 32, 32, 26, 240, 240, 240);
  // 검정 패치들
  const patches = [[32,14],[14,22],[50,22],[20,46],[44,46]];
  for (const [cx,cy] of patches) fillCircle(p, SIZE, cx, cy, 7, 20, 20, 20);
  return p;
}

function makeDrillShot() {
  const p = createPixels(SIZE);
  // 나선형 드릴
  fillCircle(p, SIZE, 32, 32, 22, 80, 160, 255);
  fillCircle(p, SIZE, 32, 32, 16, 120, 200, 255);
  // 나선 선
  for (let a = 0; a < Math.PI * 4; a += 0.15) {
    const rr = 4 + (a / (Math.PI*4)) * 14;
    const x = 32 + Math.cos(a) * rr;
    const y = 32 + Math.sin(a) * rr;
    fillCircle(p, SIZE, Math.round(x), Math.round(y), 2, 20, 60, 160);
  }
  fillTriangle(p, SIZE, 32, 4, 24, 20, 40, 20, 200, 240, 255);
  return p;
}

function makeDimensionalBlade() {
  const p = createPixels(SIZE);
  // 부채꼴 참격
  const cx = 32, cy = 52;
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const dx = x - cx, dy = cy - y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx);
    if (dist < 48 && dist > 4 && angle > 0.1 && angle < Math.PI - 0.1) {
      const t = dist / 48;
      setPixel(p, SIZE, x, y, 220, 180, 255, Math.round(200 * (1-t)));
    }
  }
  fillRect(p, SIZE, 29, 46, 6, 12, 180, 100, 255);
  return p;
}

function makeDebuffAura() {
  const p = createPixels(SIZE);
  // 원형 오라
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const d = Math.sqrt((x-32)**2 + (y-32)**2);
    if (d < 28 && d > 16) {
      const t = Math.abs(d - 22) / 6;
      setPixel(p, SIZE, x, y, 160, 0, 255, Math.round(180 * (1-t)));
    }
  }
  fillCircle(p, SIZE, 32, 32, 8, 120, 0, 200, 200);
  return p;
}

// ── 배경 (512x512) ──────────────────────────────────────────────────────
function makeBg() {
  const S = 512;
  const p = new Uint8Array(S * S * 4);
  // 바탕: 어두운 청회색
  for (let i = 0; i < S * S; i++) {
    p[i*4] = 45; p[i*4+1] = 48; p[i*4+2] = 65; p[i*4+3] = 255;
  }
  // 격자선
  const gc = [80, 85, 110];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    if (x % 64 === 0 || y % 64 === 0) {
      const i = (y * S + x) * 4;
      p[i] = gc[0]; p[i+1] = gc[1]; p[i+2] = gc[2]; p[i+3] = 255;
    }
  }
  // 중앙 원
  const cx = S/2, cy = S/2;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.sqrt((x-cx)**2 + (y-cy)**2);
    if (d > 150 && d < 154) {
      const i = (y * S + x) * 4;
      p[i] = 100; p[i+1] = 110; p[i+2] = 140; p[i+3] = 255;
    }
  }
  return { pixels: p, size: S };
}

// ── 드롭 아이템 ─────────────────────────────────────────────────────────
/** 바닥 XP 보석 — 4각 별(플랫), 몬스터 3D 덩어리와 구분 */
function drawXpStar(p, size, cx, cy, rad, r, g, b, dark = 36) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? rad : rad * 0.42;
    pts.push([Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr)]);
  }
  for (let i = 0; i < 8; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % 8];
    fillTriangle(p, size, cx, cy, x1, y1, x2, y2, r, g, b);
  }
  fillTriangle(p, size, cx, cy, pts[0][0], pts[0][1], pts[2][0], pts[2][1],
    Math.max(0, r - dark), Math.max(0, g - dark), Math.max(0, b - dark));
  fillTriangle(p, size, cx, cy, pts[4][0], pts[4][1], pts[6][0], pts[6][1],
    Math.max(0, r - dark), Math.max(0, g - dark), Math.max(0, b - dark));
}

function makeXpSmall() {
  const p = createPixels(SIZE);
  const [r, g, b] = hexToRGB('#00E5FF');
  glowCircle(p, SIZE, 32, 32, 14, 6, r, g, b);
  drawXpStar(p, SIZE, 32, 32, 18, r, g, b, 40);
  fillCircle(p, SIZE, 32, 32, 5, 255, 255, 255, 220);
  return p;
}
function makeXpMedium() {
  const p = createPixels(SIZE);
  const [r, g, b] = hexToRGB('#9B7AFF');
  glowCircle(p, SIZE, 32, 32, 16, 8, r, g, b);
  drawXpStar(p, SIZE, 32, 32, 20, r, g, b, 45);
  fillCircle(p, SIZE, 32, 32, 6, 240, 230, 255, 230);
  return p;
}
function makeXpLarge() {
  const p = createPixels(SIZE);
  const [r, g, b] = hexToRGB('#FFC830');
  glowCircle(p, SIZE, 32, 32, 18, 10, 255, 200, 40);
  drawXpStar(p, SIZE, 32, 32, 22, r, g, b, 50);
  fillCircle(p, SIZE, 32, 32, 7, 255, 255, 220, 240);
  return p;
}
function makeHeal() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#80CCFF');
  fillRect(p, SIZE, 10, 26, 44, 12, r, g, b);
  fillRect(p, SIZE, 26, 10, 12, 44, r, g, b);
  fillRect(p, SIZE, 14, 30, 36, 4, 200, 240, 255);
  fillRect(p, SIZE, 30, 14, 4, 36, 200, 240, 255);
  return p;
}
function makeMagnet() {
  const p = createPixels(SIZE);
  // 말굽 모양 — 위쪽 반원 + 두 다리
  for (let angle = Math.PI; angle <= Math.PI * 2; angle += 0.05) {
    const x = 32 + Math.cos(angle) * 18;
    const y = 32 + Math.sin(angle) * 18;
    const isLeft = angle > Math.PI * 1.5;
    const col = isLeft ? [255, 50, 50] : [50, 100, 255];
    fillCircle(p, SIZE, Math.round(x), Math.round(y), 6, col[0], col[1], col[2]);
  }
  fillRect(p, SIZE, 10, 22, 12, 18, 255, 50, 50);
  fillRect(p, SIZE, 42, 22, 12, 18, 50, 100, 255);
  return p;
}
function makeBombDrop() {
  const p = createPixels(SIZE);
  const [r,g,b] = hexToRGB('#FF6680');
  glowCircle(p, SIZE, 32, 34, 20, 8, r, g, b);
  fillCircle(p, SIZE, 32, 34, 20, r, g, b);
  fillCircle(p, SIZE, 32, 34, 14, 255, 130, 150);
  // 도화선
  fillRect(p, SIZE, 30, 10, 4, 18, 180, 140, 80);
  fillCircle(p, SIZE, 36, 10, 5, 255, 200, 50);
  return p;
}

// ── VFX 파티클 스프라이트 (공통 글로우 파티클) ─────────────────────────
function makeParticleSpark() {
  const p = createPixels(SIZE);
  // 중앙 밝은 원 → 가장자리 투명 그라데이션
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const d = Math.sqrt((x-32)**2 + (y-32)**2);
    if (d < 28) {
      const t = d / 28;
      const a = Math.round(255 * (1 - t * t));
      setPixel(p, SIZE, x, y, 255, 255, 255, a);
    }
  }
  return p;
}

// ── 출력 ────────────────────────────────────────────────────────────────
const bgData = makeBg();

const sprites = [
  ['public/assets/enemies/basic.png',   makeBasic()],
  ['public/assets/enemies/dog.png',     makeDog()],
  ['public/assets/enemies/bloater.png', makeBloater()],
  ['public/assets/enemies/spitter.png', makeSpitter()],
  ['public/assets/player/default.png',  makePlayer()],
  ['public/assets/boss/titan.png',      makeBoss()],
  ['public/assets/skills/kunai.png',        makeKunai()],
  ['public/assets/skills/boomerang.png',    makeBoomerang()],
  ['public/assets/skills/rocket.png',       makeRocket()],
  ['public/assets/skills/molotov.png',      makeMolotov()],
  ['public/assets/skills/guardian.png',     makeGuardian()],
  ['public/assets/skills/drone.png',        makeDrone()],
  ['public/assets/skills/soccer_ball.png',  makeSoccerBall()],
  ['public/assets/skills/drill_shot.png',   makeDrillShot()],
  ['public/assets/skills/dimensional_blade.png', makeDimensionalBlade()],
  ['public/assets/skills/debuff_aura.png',  makeDebuffAura()],
  // 드롭
  ['public/assets/drops/xp_small.png',   makeXpSmall()],
  ['public/assets/drops/xp_medium.png',  makeXpMedium()],
  ['public/assets/drops/xp_large.png',   makeXpLarge()],
  ['public/assets/drops/heal.png',       makeHeal()],
  ['public/assets/drops/magnet.png',     makeMagnet()],
  ['public/assets/drops/bomb.png',       makeBombDrop()],
  // VFX
  ['public/assets/fx/particle_spark.png', makeParticleSpark()],
];

// 배경은 512x512라 별도 처리
mkdirSync('public/assets/bg', { recursive: true });
mkdirSync('public/assets/drops', { recursive: true });
mkdirSync('public/assets/fx', { recursive: true });
writeFileSync('public/assets/bg/default.png', makePNG(bgData.pixels, bgData.size));
console.log('✓ public/assets/bg/default.png');

for (const [path, pixels] of sprites) {
  const png = makePNG(pixels, SIZE);
  writeFileSync(path, png);
  console.log('✓', path);
}
console.log('done');
