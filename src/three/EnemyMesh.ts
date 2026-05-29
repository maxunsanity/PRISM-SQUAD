/**
 * EnemyMesh.ts — InstancedMesh 기반 적 렌더러 (최적화 v2)
 *
 * 변경 사항:
 * 1. PointLight 완전 제거 → emissive 없이 MeshBasicMaterial 색상만 사용
 * 2. MeshStandardMaterial → MeshBasicMaterial (PBR 연산 0)
 * 3. InstancedMesh — 적 타입 4종 각각 draw call 1개 (기존 최대 580개)
 *
 * 외부 API:
 *   initEnemyInstancer(scene)   — EnemySystem 생성 시 호출
 *   clearEnemyInstancer()       — 스테이지 전환 / 리셋 시 호출
 *   createEnemyMesh(cfg, scene) — spawn 시 슬롯 할당, handle 반환
 */
import * as THREE from 'three';
import type { EnemyConfig, BossConfig, EnemyId } from '../game/data';

/* ────────────────────────────────────────────
   핸들 인터페이스
   (EnemySystem이 사용하는 공개 API)
──────────────────────────────────────────── */
export interface EnemyMeshHandle {
  /** 더미 오브젝트 — 렌더링 안 됨, 외부 호환용으로만 유지 */
  group: THREE.Object3D;
  /** 월드 좌표 갱신 (매 프레임 tick 이전에 호출) */
  setPosition(x: number, y: number): void;
  updateHp(pct: number): void;
  updateDirection(vx: number, vy: number): void;
  flashHit(): void;
  tick(dt: number): void;
  dispose(scene: THREE.Scene): void;
}

/* ────────────────────────────────────────────
   공용 임시 변수 (매 프레임 GC 방지)
──────────────────────────────────────────── */
const MAX_INSTANCES = 512;        // 타입별 최대 동시 적 수
const _m4    = new THREE.Matrix4();
const _pos   = new THREE.Vector3();
const _quat  = new THREE.Quaternion();
const _s1    = new THREE.Vector3(1, 1, 1);
const _s0    = new THREE.Vector3(0, 0, 0);
const _zAxis = new THREE.Vector3(0, 0, 1);
const _WHITE = new THREE.Color(1, 1, 1);

/* ────────────────────────────────────────────
   InstancedMesh 레지스트리
──────────────────────────────────────────── */
interface TypeEntry {
  mesh:      THREE.InstancedMesh;
  freeSlots: number[];
  baseColor: THREE.Color;
}

const _registry = new Map<EnemyId, TypeEntry>();
let   _scene: THREE.Scene | null = null;

/** EnemySystem 생성 시 1회 호출. 같은 씬이면 재초기화 생략. */
export function initEnemyInstancer(scene: THREE.Scene) {
  if (_scene === scene) return;
  // 씬 전환 시 기존 메쉬를 새 씬으로 이전
  for (const e of _registry.values()) {
    _scene?.remove(e.mesh);
    scene.add(e.mesh);
  }
  _scene = scene;
}

/** 스테이지 전환 / 전체 리셋 — 인스턴스 전부 숨김 + 슬롯 반납 */
export function clearEnemyInstancer() {
  _m4.compose(_pos.set(0, 0, -9999), _quat.identity(), _s0);
  for (const e of _registry.values()) {
    for (let i = 0; i < MAX_INSTANCES; i++) e.mesh.setMatrixAt(i, _m4);
    e.mesh.instanceMatrix.needsUpdate = true;
    if (e.mesh.instanceColor) e.mesh.instanceColor.needsUpdate = true;
    // 슬롯 전부 반납
    e.freeSlots.length = 0;
    for (let i = MAX_INSTANCES - 1; i >= 0; i--) e.freeSlots.push(i);
  }
}

/* TypeEntry 없으면 새로 생성 */
function _getOrCreate(cfg: EnemyConfig): TypeEntry {
  if (_registry.has(cfg.enemy_id)) return _registry.get(cfg.enemy_id)!;

  const r = cfg.radius;
  let geo: THREE.BufferGeometry;

  switch (cfg.geometry_type) {
    case 'ConeGeometry_flat':
      geo = new THREE.ConeGeometry(r, r * 1.2, 3);
      geo.rotateZ(-Math.PI / 2);   // geometry 자체 pre-rotate → 방향 회전과 분리
      break;
    case 'CylinderGeometry':
      geo = new THREE.CylinderGeometry(r, r, r * 0.7, 6);
      break;
    case 'BoxGeometry':
      geo = new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 0.5);
      break;
    default:                        // ConeGeometry
      geo = new THREE.ConeGeometry(r, r * 2, 3);
      geo.rotateZ(-Math.PI / 2);
      break;
  }

  const baseColor = new THREE.Color(cfg.color_hex);

  // material.color = white → instanceColor가 실제 색상을 결정
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const mesh = new THREE.InstancedMesh(geo, mat, MAX_INSTANCES);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  /* ★ 프러스텀 컬링 비활성화
   * Three.js는 geometry의 바운딩 스피어(원점 반경 ~17)로 컬링을 판단.
   * 인스턴스 실제 위치(스폰 반경 380~480)와 무관하게 컬링되어 적이 안 보이는 버그 방지.
   * 숨김 처리는 scale=0으로 개별 인스턴스별로 수행. */
  mesh.frustumCulled = false;

  // instanceColor 버퍼 초기화 (baseColor로 전부 설정)
  const colorBuf = new Float32Array(MAX_INSTANCES * 3);
  for (let i = 0; i < MAX_INSTANCES; i++) {
    colorBuf[i * 3]     = baseColor.r;
    colorBuf[i * 3 + 1] = baseColor.g;
    colorBuf[i * 3 + 2] = baseColor.b;
  }
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colorBuf, 3);
  mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

  // 초기 전부 숨김
  _m4.compose(_pos.set(0, 0, -9999), _quat.identity(), _s0);
  for (let i = 0; i < MAX_INSTANCES; i++) mesh.setMatrixAt(i, _m4);
  mesh.instanceMatrix.needsUpdate = true;

  _scene!.add(mesh);

  const freeSlots: number[] = [];
  for (let i = MAX_INSTANCES - 1; i >= 0; i--) freeSlots.push(i);

  const entry: TypeEntry = { mesh, freeSlots, baseColor: baseColor.clone() };
  _registry.set(cfg.enemy_id, entry);
  return entry;
}

/* ────────────────────────────────────────────
   적 메쉬 생성 — InstancedMesh 슬롯 기반
──────────────────────────────────────────── */
export function createEnemyMesh(cfg: EnemyConfig, scene: THREE.Scene): EnemyMeshHandle {
  initEnemyInstancer(scene);
  const entry = _getOrCreate(cfg);

  const rawSlot = entry.freeSlots.pop();
  if (rawSlot === undefined) {
    console.warn('[EnemyMesh] 슬롯 부족:', cfg.enemy_id);
    return _dummyHandle();
  }
  const slot: number = rawSlot; // 클로저 내 타입 확정

  let curX = 0, curY = 0, curAngle = 0;
  let flashTimer = 0;
  const dummyGroup = new THREE.Object3D(); // 렌더링 안 됨, 호환용

  function _writeMatrix() {
    _quat.setFromAxisAngle(_zAxis, curAngle);
    _m4.compose(_pos.set(curX, curY, 0.5), _quat, _s1); // z=0.5: 투사체(z=1)보다 뒤, 바닥(z=0)보다 앞
    entry.mesh.setMatrixAt(slot, _m4);
    entry.mesh.instanceMatrix.needsUpdate = true;
  }

  return {
    group: dummyGroup,

    setPosition(x, y) {
      curX = x; curY = y;
      _writeMatrix();
    },

    updateHp(_pct) { /* 일반 적 HP바 미표시 정책 유지 */ },

    updateDirection(vx, vy) {
      if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return;
      curAngle = Math.atan2(vy, vx);
      _writeMatrix();
    },

    flashHit() {
      flashTimer = 0.1;
      entry.mesh.setColorAt(slot, _WHITE);
      entry.mesh.instanceColor!.needsUpdate = true;
    },

    tick(dt) {
      if (flashTimer > 0) {
        flashTimer -= dt;
        if (flashTimer <= 0) {
          entry.mesh.setColorAt(slot, entry.baseColor);
          entry.mesh.instanceColor!.needsUpdate = true;
        }
      }
    },

    dispose(_scene) {
      // 슬롯 숨김 후 반납
      _m4.compose(_pos.set(0, 0, -9999), _quat.identity(), _s0);
      entry.mesh.setMatrixAt(slot, _m4);
      entry.mesh.instanceMatrix.needsUpdate = true;
      entry.freeSlots.push(slot);
    },
  };
}

/* 슬롯 부족 시 사용하는 빈 핸들 */
function _dummyHandle(): EnemyMeshHandle {
  const g = new THREE.Object3D();
  return {
    group: g,
    setPosition() {},
    updateHp() {},
    updateDirection() {},
    flashHit() {},
    tick() {},
    dispose() {},
  };
}

/* ────────────────────────────────────────────
   보스 메쉬 — 개별 Group 유지 (보스는 1마리)
──────────────────────────────────────────── */
export function createBossMesh(cfg: BossConfig, scene: THREE.Scene): EnemyMeshHandle {
  const group = new THREE.Group();
  const col     = new THREE.Color(cfg.color_hex);
  const glowCol = new THREE.Color(cfg.glow_color_hex);
  const r = cfg.radius;

  /* 외부 링 */
  const torusGeo = new THREE.TorusGeometry(r, r * 0.22, 8, 24);
  const torusMat = new THREE.MeshBasicMaterial({ color: col });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  group.add(torus);

  /* 가시 돌기 8개 */
  const spikeGroup = new THREE.Group();
  const spikeGeo = new THREE.BoxGeometry(r * 0.15, r * 0.5, r * 0.15); // 공유 geo
  const spikeMat = new THREE.MeshBasicMaterial({ color: glowCol });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.position.set(Math.cos(angle) * (r + r * 0.4), Math.sin(angle) * (r + r * 0.4), 0);
    spike.rotation.z = angle;
    spikeGroup.add(spike);
  }
  group.add(spikeGroup);

  /* 보스 HP 바 */
  const barW = r * 3.5;
  const barH = r * 0.22;
  const hpBg   = new THREE.Mesh(
    new THREE.PlaneGeometry(barW, barH),
    new THREE.MeshBasicMaterial({ color: 0x330033, transparent: true, opacity: 0.8 }),
  );
  hpBg.position.set(0, r * 1.8, 1);
  group.add(hpBg);

  const hpFill = new THREE.Mesh(
    new THREE.PlaneGeometry(barW, barH),
    new THREE.MeshBasicMaterial({ color: 0x9955FF }),
  );
  hpFill.position.set(0, r * 1.8, 2);
  group.add(hpFill);

  scene.add(group);

  let flashTimer = 0;
  let spikeAngle = 0;

  return {
    group,

    setPosition(x, y) {
      group.position.set(x, y, 0);
    },

    updateHp(pct) {
      hpFill.scale.x = Math.max(pct, 0.01);
      hpFill.position.x = -barW * (1 - pct) / 2;
    },

    updateDirection(_vx, _vy) { /* 보스 방향 고정 */ },

    flashHit() { flashTimer = 0.08; },

    tick(dt) {
      spikeAngle += dt * 1.2;
      spikeGroup.rotation.z = spikeAngle;
      if (flashTimer > 0) {
        flashTimer -= dt;
        torusMat.color.set(flashTimer > 0 ? 0xffffff : cfg.color_hex);
      }
    },

    dispose(s) { s.remove(group); },
  };
}

/* ── 독 웅덩이 메쉬 ── */
export function createPuddleMesh(radius: number, scene: THREE.Scene): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 16);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x33FF66, transparent: true, opacity: 0.35, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = -0.5;
  scene.add(mesh);
  return mesh;
}

/* ── 임시 색상 유틸 ── */
export const _tmpColor = new THREE.Color();
