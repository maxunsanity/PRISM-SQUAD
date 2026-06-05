/**
 * gen_sprites.mjs
 * Node.js 내장 모듈(zlib, fs)만 사용해 128×128 PNG 샘플 스프라이트를 생성합니다.
 * 실행: node scripts/gen_sprites.mjs
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const W = 128, H = 128;

// ─── PNG 인코더 (순수 Node.js) ─────────────────────────────────────────────
function writePNG(rgba) {
  // rgba: Uint8Array, 크기 W*H*4
  const signature = Buffer.from([137,80,78,71,13,10,26,10]);

  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const d = data instanceof Buffer ? data : Buffer.from(data);
    const len = Buffer.alloc(4); len.writeUInt32BE(d.length);
    const crcBuf = Buffer.concat([t, d]);
    const crc = crc32(crcBuf);
    const crcOut = Buffer.alloc(4); crcOut.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, t, d, crcOut]);
  }

  // CRC32
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c;
    }
    return t;
  })();
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // raw scanlines (filter byte 0 per row)
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0; // filter=None
    for (let x = 0; x < W; x++) {
      const src = (y * W + x) * 4;
      const dst = y * (1 + W * 4) + 1 + x * 4;
      raw[dst]   = rgba[src];
      raw[dst+1] = rgba[src+1];
      raw[dst+2] = rgba[src+2];
      raw[dst+3] = rgba[src+3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, chunk('IHDR', ihdr), idat, iend]);
}

// ─── 픽셀 헬퍼 ────────────────────────────────────────────────────────────
function makePixels() { return new Uint8Array(W * H * 4); }

function setPixel(px, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=a;
}

/** 원형 마스크 채우기 (cx,cy 중심, 반지름 r1~r2, 안티앨리어싱 없음) */
function fillAnnulus(px, cx, cy, r1, r2, r, g, b, a = 255) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d >= r1 && d <= r2) setPixel(px, x, y, r, g, b, a);
    }
  }
}

function fillCircle(px, cx, cy, radius, r, g, b, a = 255) {
  fillAnnulus(px, cx, cy, 0, radius, r, g, b, a);
}

function save(relPath, pixels) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, writePNG(pixels));
  console.log('wrote', relPath);
}

// ─── 스프라이트 생성 ──────────────────────────────────────────────────────
const cx = W / 2, cy = H / 2;

// backdrop.png — 크림색 원형
{
  const px = makePixels();
  fillCircle(px, cx, cy, 60, 255, 248, 240);
  save('public/assets/target/backdrop.png', px);
}

// outer.png — 빨간 링 (r 44~60)
{
  const px = makePixels();
  fillAnnulus(px, cx, cy, 44, 60, 180, 60, 40);
  save('public/assets/target/outer.png', px);
}

// middle.png — 노란 링 (r 30~44)
{
  const px = makePixels();
  fillAnnulus(px, cx, cy, 30, 44, 232, 160, 32);
  save('public/assets/target/middle.png', px);
}

// center.png — 파란 링 (r 16~30)
{
  const px = makePixels();
  fillAnnulus(px, cx, cy, 16, 30, 40, 120, 220);
  save('public/assets/target/center.png', px);
}

// bullseye.png — 노란 중심 (r 0~16)
{
  const px = makePixels();
  fillCircle(px, cx, cy, 16, 255, 215, 0);
  save('public/assets/target/bullseye.png', px);
}

// arrow.png — 어두운 화살 모양 (수직선 + 삼각 촉)
{
  const px = makePixels();
  // shaft
  for (let y = 20; y < 100; y++) {
    for (let x = cx-3; x <= cx+3; x++) setPixel(px, x, y, 40, 28, 20);
  }
  // head
  for (let y = 10; y < 30; y++) {
    const half = Math.round((30 - y) / 2.0);
    for (let dx = -half; dx <= half; dx++) setPixel(px, cx+dx, y, 40, 28, 20);
  }
  // fletching
  for (let y = 90; y < 110; y++) {
    const half = Math.round((y - 90) / 2.5);
    for (let dx = -half; dx <= half; dx++) setPixel(px, cx+dx, y, 80, 56, 40);
  }
  save('public/assets/arrows/arrow.png', px);
}

// bg/default.png — 어두운 배경 그라데이션 느낌 (단색)
{
  const px = makePixels();
  for (let y = 0; y < H; y++) {
    const v = Math.round(20 + (y / H) * 15);
    for (let x = 0; x < W; x++) setPixel(px, x, y, v, v+4, v+8);
  }
  save('public/assets/bg/default.png', px);
}

// fx/particle.png — 빛나는 원형 파티클
{
  const px = makePixels();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      const a = Math.max(0, 1 - d / 50);
      setPixel(px, x, y, 255, 240, 100, Math.round(a * 255));
    }
  }
  save('public/assets/fx/particle.png', px);
}

console.log('모든 스프라이트 생성 완료.');
