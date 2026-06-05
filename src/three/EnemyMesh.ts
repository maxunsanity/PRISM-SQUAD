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
  /** 디버프 상태 색상 표시 (매 프레임 EnemySystem에서 호출) */
  updateDebuff(burn: boolean, slow: boolean, poisonStacks: number): void;
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
  let mat: THREE.MeshBasicMaterial;

  if (cfg.sprite_url) {
    // 스프라이트 모드: PlaneGeometry + 텍스처
    geo = new THREE.PlaneGeometry(r * 3.0, r * 3.0);
    const tex = new THREE.TextureLoader().load(cfg.sprite_url);
    mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, color: 0xffffff });
  } else {
    // 폴백: 기존 절차적 도형
    switch (cfg.geometry_type) {
      case 'ConeGeometry_flat':
        geo = new THREE.ConeGeometry(r, r * 1.2, 3);
        geo.rotateZ(-Math.PI / 2);
        break;
      case 'CylinderGeometry':
        geo = new THREE.CylinderGeometry(r, r, r * 0.7, 6);
        break;
      case 'BoxGeometry':
        geo = new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 0.5);
        break;
      case 'OctahedronGeometry':
        geo = new THREE.OctahedronGeometry(r * 1.3, 0);
        break;
      case 'TorusGeometry':
        geo = new THREE.TorusGeometry(r * 1.1, r * 0.4, 8, 16);
        break;
      default:                      // ConeGeometry
        geo = new THREE.ConeGeometry(r, r * 2, 3);
        geo.rotateZ(-Math.PI / 2);
        break;
    }
    // material.color = white → instanceColor가 실제 색상을 결정
    mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  }

  const baseColor = cfg.sprite_url
    ? new THREE.Color(0xffffff)
    : new THREE.Color(cfg.color_hex);

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

  /* 디버프 색상 상수 */
  const _COL_BURN   = new THREE.Color(1.0, 0.45, 0.1);   // 화염: 주황
  const _COL_SLOW   = new THREE.Color(0.3, 0.7,  1.0);   // 냉기: 파랑
  const _COL_POISON = new THREE.Color(0.3, 1.0,  0.3);   // 독: 초록
  let _debuffColor: THREE.Color | null = null; // null = 기본색

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

    updateDebuff(burn: boolean, slow: boolean, poisonStacks: number) {
      /* 우선순위: 화염 > 독 > 냉기 > 없음 */
      const next = burn
        ? _COL_BURN
        : poisonStacks > 0
          ? _COL_POISON
          : slow
            ? _COL_SLOW
            : null;

      if (next === _debuffColor) return; // 변화 없으면 스킵
      _debuffColor = next;

      /* 히트 플래시 중이면 복구 타이머에 맡기고 색은 건드리지 않음 */
      if (flashTimer > 0) return;
      entry.mesh.setColorAt(slot, _debuffColor ?? entry.baseColor);
      entry.mesh.instanceColor!.needsUpdate = true;
    },

    tick(dt) {
      if (flashTimer > 0) {
        flashTimer -= dt;
        if (flashTimer <= 0) {
          /* 플래시 종료 → 디버프 색 or 기본색 복구 */
          entry.mesh.setColorAt(slot, _debuffColor ?? entry.baseColor);
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
    updateDebuff() {},
    tick() {},
    dispose() {},
  };
}

/* ────────────────────────────────────────────
   보스 메쉬 — 개별 Group 유지 (보스는 1마리)
──────────────────────────────────────────── */
export function createBossMesh(cfg: BossConfig, scene: THREE.Scene): EnemyMeshHandle {
  const group = new THREE.Group();
  const r = cfg.radius;
  const bossId = cfg.boss_id;

  const allMats: THREE.Material[] = [];
  let flashTimer = 0;
  let isFlashing = false;
  let pulseTime  = 0;
  let currentPhase = 1;

  // 회전각 관리
  const rotGroups: { group: THREE.Object3D; speed: number; dir: number }[] = [];
  const subMeshes: THREE.Object3D[] = [];

  let coreMesh: THREE.Mesh | null = null;
  let glowMesh: THREE.Mesh | null = null;
  let glowMat: THREE.MeshBasicMaterial | null = null;

  // 1. 색상 팔레트 정의 (보스별 전용 네온 컬러셋)
  const PALETTES = {
    titan: {
      body:  [0x1A0035, 0x3D0020, 0x5A0000] as const,
      inner: [0x6A00CC, 0xCC0055, 0xFF1100] as const,
      core:  [0xCC44FF, 0xFF4488, 0xFF6600] as const,
      spike: [0x8800FF, 0xDD0044, 0xFF3300] as const,
      tip:   [0xEE88FF, 0xFF88AA, 0xFFAA44] as const,
      hp:    [0x9955FF, 0xFF3366, 0xFF4400] as const,
    },
    crusher: {
      body:  [0x2A1100, 0x4A1E00, 0x6A0000] as const,
      inner: [0xFF5500, 0xFF7700, 0xFF2200] as const,
      core:  [0xFFD700, 0xFFEA00, 0xFFFFCC] as const,
      spike: [0xFF2200, 0xFF3300, 0xFF0000] as const,
      tip:   [0xFFFF00, 0xFFFFAA, 0xFFFFFF] as const,
      hp:    [0xFF5500, 0xFF3300, 0xFF1100] as const,
    },
    nexus: {
      body:  [0x0F0026, 0x22003D, 0x3D005A] as const,
      inner: [0x8800FF, 0xAA00FF, 0xFF00D4] as const,
      core:  [0x00FFFF, 0x88FFFF, 0xFFFFFF] as const,
      spike: [0x0088FF, 0x00CCFF, 0x00FF88] as const,
      tip:   [0x88FFFF, 0xCCFFFF, 0xFFFFFF] as const,
      hp:    [0x8800FF, 0x00FFFF, 0x00FF88] as const,
    }
  };

  const activePalette = (PALETTES[bossId as 'titan' | 'crusher' | 'nexus'] || PALETTES.titan);

  // HP바 재질
  const hpFillMat = new THREE.MeshBasicMaterial({ color: activePalette.hp[0] });
  allMats.push(hpFillMat);

  // 2. 개별 보스 레이아웃 조립
  if (bossId === 'crusher') {
    /* ── CRUSHER (이동형 중간 보스: 돌격 전차 & 사나운 황소 뿔 3D 조립) ── */
    glowMat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0], transparent: true, opacity: 0.25 });
    allMats.push(glowMat);
    glowMesh = new THREE.Mesh(new THREE.CircleGeometry(r * 1.3, 32), glowMat);
    glowMesh.position.z = -0.1;
    group.add(glowMesh);
    subMeshes.push(glowMesh);

    // 톱니바퀴 링
    const gearRingGeo = new THREE.RingGeometry(r * 0.88, r * 0.98, 16);
    const gearRingMat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0] });
    allMats.push(gearRingMat);
    const gearRingMesh = new THREE.Mesh(gearRingGeo, gearRingMat);
    gearRingMesh.position.z = 0.1;
    group.add(gearRingMesh);
    subMeshes.push(gearRingMesh);

    // 톱니 스파이크 (6개)
    const spikeGroup = new THREE.Group();
    spikeGroup.position.z = 0.2;
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const spikeGeo = new THREE.ConeGeometry(r * 0.15, r * 0.45, 4);
      const sMat = new THREE.MeshBasicMaterial({ color: activePalette.spike[0] });
      allMats.push(sMat);
      const spike = new THREE.Mesh(spikeGeo, sMat);
      spike.position.set(Math.cos(angle) * r * 1.0, Math.sin(angle) * r * 1.0, 0);
      spike.rotation.z = angle - Math.PI / 2;
      spikeGroup.add(spike);
    }
    group.add(spikeGroup);
    rotGroups.push({ group: spikeGroup, speed: 0.65, dir: 1 });

    // 앞을 쏘아보는 2개의 거대한 뿔
    const hornGroup = new THREE.Group();
    hornGroup.position.z = 0.3;
    const hornAngles = [-Math.PI * 0.15, Math.PI * 0.15];
    hornAngles.forEach(angle => {
      const hornGeo = new THREE.ConeGeometry(r * 0.16, r * 0.72, 6);
      hornGeo.translate(0, r * 0.36, 0);
      const hMat = new THREE.MeshBasicMaterial({ color: activePalette.tip[0] });
      allMats.push(hMat);
      const horn = new THREE.Mesh(hornGeo, hMat);
      const startDist = r * 0.75;
      horn.position.set(Math.cos(angle) * startDist, Math.sin(angle) * startDist, 0);
      horn.rotation.z = angle - Math.PI / 2;
      hornGroup.add(horn);
    });
    group.add(hornGroup);

    // 장갑 바디
    const mainBodyGeo = new THREE.CylinderGeometry(r * 0.75, r * 0.8, r * 0.2, 8);
    mainBodyGeo.rotateX(Math.PI / 2);
    const mainBodyMat = new THREE.MeshBasicMaterial({ color: activePalette.body[0] });
    allMats.push(mainBodyMat);
    const mainBodyMesh = new THREE.Mesh(mainBodyGeo, mainBodyMat);
    mainBodyMesh.position.z = 0.4;
    group.add(mainBodyMesh);
    subMeshes.push(mainBodyMesh);

    // 기계식 코어
    const cGeo = new THREE.CircleGeometry(r * 0.35, 16);
    const cMat = new THREE.MeshBasicMaterial({ color: activePalette.core[0] });
    allMats.push(cMat);
    coreMesh = new THREE.Mesh(cGeo, cMat);
    coreMesh.position.z = 0.6;
    group.add(coreMesh);

    // 크로스 데코 아머플레이트
    const plateGeo = new THREE.BoxGeometry(r * 1.1, r * 0.16, r * 0.1);
    const plateMat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0] });
    allMats.push(plateMat);
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0, 0.5);
    plate.rotation.z = Math.PI / 4;
    group.add(plate);
    subMeshes.push(plate);

  } else if (bossId === 'nexus') {
    /* ── NEXUS (고정형 중간 보스: 3중 자이로 링 포탑 3D 조립) ── */
    glowMat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0], transparent: true, opacity: 0.25 });
    allMats.push(glowMat);
    glowMesh = new THREE.Mesh(new THREE.CircleGeometry(r * 1.35, 32), glowMat);
    glowMesh.position.z = -0.1;
    group.add(glowMesh);
    subMeshes.push(glowMesh);

    // 자이로 공명 링 1
    const ring1Geo = new THREE.TorusGeometry(r * 1.05, r * 0.08, 6, 24);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0] });
    allMats.push(ring1Mat);
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.position.z = 0.15;
    group.add(ring1);
    rotGroups.push({ group: ring1, speed: 0.45, dir: -1 });

    // 자이로 공명 링 2 (기울기 부여)
    const ring2Geo = new THREE.TorusGeometry(r * 0.85, r * 0.07, 6, 20);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: activePalette.spike[0] });
    allMats.push(ring2Mat);
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.position.z = 0.25;
    ring2.rotation.x = Math.PI / 6;
    group.add(ring2);
    rotGroups.push({ group: ring2, speed: 0.72, dir: 1 });

    // 포신 안테나 (4방향)
    const antGroup = new THREE.Group();
    antGroup.position.z = 0.2;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const antGeo = new THREE.CylinderGeometry(r * 0.06, r * 0.09, r * 0.42, 6);
      antGeo.translate(0, r * 0.21, 0);
      const antMat = new THREE.MeshBasicMaterial({ color: activePalette.body[0] });
      allMats.push(antMat);
      const ant = new THREE.Mesh(antGeo, antMat);
      ant.position.set(Math.cos(angle) * r * 0.95, Math.sin(angle) * r * 0.95, 0);
      ant.rotation.z = angle - Math.PI / 2;
      antGroup.add(ant);

      const hGeo = new THREE.SphereGeometry(r * 0.08, 6, 6);
      const hMat = new THREE.MeshBasicMaterial({ color: activePalette.tip[0] });
      allMats.push(hMat);
      const head = new THREE.Mesh(hGeo, hMat);
      head.position.set(Math.cos(angle) * r * 1.2, Math.sin(angle) * r * 1.2, 0.02);
      antGroup.add(head);
    }
    group.add(antGroup);
    rotGroups.push({ group: antGroup, speed: 0.3, dir: 1 });

    // 중앙 팔면체 코어
    const coreGeo = new THREE.OctahedronGeometry(r * 0.38, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: activePalette.core[0] });
    allMats.push(coreMat);
    coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.z = 0.5;
    group.add(coreMesh);

    // 에너지 전도 축 기둥
    const rodGeo = new THREE.CylinderGeometry(r * 0.08, r * 0.08, r * 1.1, 8);
    rodGeo.rotateX(Math.PI / 2);
    const rodMat = new THREE.MeshBasicMaterial({ color: activePalette.tip[0] });
    allMats.push(rodMat);
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.z = 0.48;
    group.add(rod);
    subMeshes.push(rod);

  } else {
    /* ── TITAN (최종 보스: 위엄 있는 2중 역회전 스파이크 링) ── */
    glowMat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0], transparent: true, opacity: 0.22 });
    allMats.push(glowMat);
    const glowMesh = new THREE.Mesh(new THREE.CircleGeometry(r * 1.55, 32), glowMat);
    glowMesh.position.z = -0.1;
    group.add(glowMesh);
    subMeshes.push(glowMesh);

    // 바깥 스파이크 링 A (16개)
    const outerSpikeGroup = new THREE.Group();
    outerSpikeGroup.position.z = 0.2;
    const SPIKE_COUNT_A = 16;
    const outerSpikeMats: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < SPIKE_COUNT_A; i++) {
      const angle = (i / SPIKE_COUNT_A) * Math.PI * 2;
      const len   = i % 2 === 0 ? r * 0.72 : r * 0.48;
      const width = i % 2 === 0 ? r * 0.13 : r * 0.09;
      const geo = new THREE.ConeGeometry(width, len, 3);
      const mat = new THREE.MeshBasicMaterial({ color: activePalette.spike[0] });
      outerSpikeMats.push(mat);
      allMats.push(mat);
      const spike = new THREE.Mesh(geo, mat);
      const dist = r * 1.02;
      spike.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0);
      spike.rotation.z = angle - Math.PI / 2;
      outerSpikeGroup.add(spike);

      const tipMat = new THREE.MeshBasicMaterial({ color: activePalette.tip[0] });
      outerSpikeMats.push(tipMat);
      allMats.push(tipMat);
      const tipGeo = new THREE.CircleGeometry(width * 0.55, 4);
      const tip = new THREE.Mesh(tipGeo, tipMat);
      const tipDist = dist + len * 0.45;
      tip.position.set(Math.cos(angle) * tipDist, Math.sin(angle) * tipDist, 0.01);
      outerSpikeGroup.add(tip);
    }
    group.add(outerSpikeGroup);
    rotGroups.push({ group: outerSpikeGroup, speed: 0.8, dir: 1 });

    // 안쪽 스파이크 링 B (8개)
    const innerSpikeGroup = new THREE.Group();
    innerSpikeGroup.position.z = 0.35;
    const SPIKE_COUNT_B = 8;
    const innerSpikeMats: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < SPIKE_COUNT_B; i++) {
      const angle = (i / SPIKE_COUNT_B) * Math.PI * 2 + Math.PI / SPIKE_COUNT_B;
      const geo = new THREE.ConeGeometry(r * 0.1, r * 0.52, 3);
      const mat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0] });
      innerSpikeMats.push(mat);
      allMats.push(mat);
      const spike = new THREE.Mesh(geo, mat);
      spike.position.set(Math.cos(angle) * r * 0.78, Math.sin(angle) * r * 0.78, 0);
      spike.rotation.z = angle - Math.PI / 2;
      innerSpikeGroup.add(spike);
    }
    group.add(innerSpikeGroup);
    rotGroups.push({ group: innerSpikeGroup, speed: 1.1, dir: -1 });

    // 본체 베이스 원
    const bodyMat = new THREE.MeshBasicMaterial({ color: activePalette.body[0] });
    allMats.push(bodyMat);
    const bodyMesh = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 32), bodyMat);
    bodyMesh.position.z = 0.5;
    group.add(bodyMesh);
    subMeshes.push(bodyMesh);

    // 본체 링 테두리
    const ringMat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0] });
    allMats.push(ringMat);
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(r * 0.84, r * 0.92, 32), ringMat);
    ringMesh.position.z = 0.6;
    group.add(ringMesh);
    subMeshes.push(ringMesh);

    // 내부 코어 원
    const coreMat = new THREE.MeshBasicMaterial({ color: activePalette.core[0] });
    allMats.push(coreMat);
    coreMesh = new THREE.Mesh(new THREE.CircleGeometry(r * 0.32, 20), coreMat);
    coreMesh.position.z = 0.7;
    group.add(coreMesh);

    // 코어 공명 링
    const coreRingMat = new THREE.MeshBasicMaterial({ color: activePalette.inner[0], transparent: true, opacity: 0.7 });
    allMats.push(coreRingMat);
    const coreRing = new THREE.Mesh(new THREE.RingGeometry(r * 0.32, r * 0.45, 20), coreRingMat);
    coreRing.position.z = 0.65;
    group.add(coreRing);
    subMeshes.push(coreRing);
  }

  /* ── 3. HP 바 (공통) ── */
  const barW = r * 3.8;
  const barH = r * 0.18;
  const hpBg = new THREE.Mesh(
    new THREE.PlaneGeometry(barW + r * 0.12, barH + r * 0.06),
    new THREE.MeshBasicMaterial({ color: 0x110011, transparent: true, opacity: 0.9 }),
  );
  hpBg.position.set(0, r * 2.05, 1);
  group.add(hpBg);

  const hpBorder = new THREE.Mesh(
    new THREE.RingGeometry(0, barH * 0.5 + r * 0.04, 4),
    new THREE.MeshBasicMaterial({ color: 0x440044, transparent: true, opacity: 0.0 }),
  );
  hpBorder.position.set(0, r * 2.05, 1.05);
  group.add(hpBorder);

  const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(barW, barH), hpFillMat);
  hpFill.position.set(0, r * 2.05, 1.1);
  group.add(hpFill);

  scene.add(group);

  function applyPhase(phase: number) {
    const p = Math.min(phase - 1, 2) as 0 | 1 | 2;
    hpFillMat.color.setHex(activePalette.hp[p]);

    if (glowMat) glowMat.color.setHex(activePalette.inner[p]);
  }

  return {
    group,

    setPosition(x, y) {
      group.position.set(x, y, 0);
    },

    updateHp(pct) {
      hpFill.scale.x = Math.max(pct, 0.01);
      hpFill.position.x = -barW * (1 - Math.max(pct, 0.01)) / 2;

      const newPhase = pct > 0.7 ? 1 : pct > 0.4 ? 2 : 3;
      if (newPhase !== currentPhase) {
        currentPhase = newPhase;
        applyPhase(currentPhase);
      }
    },

    updateDirection(_vx, _vy) {},

    flashHit() {
      flashTimer = 0.1;
      isFlashing = true;
      allMats.forEach(m => {
        if (m instanceof THREE.MeshBasicMaterial) m.color.setHex(0xffffff);
      });
    },

    tick(dt) {
      pulseTime += dt;
      const speedMult = currentPhase === 3 ? 1.8 : currentPhase === 2 ? 1.3 : 1.0;

      // 회전 틱
      rotGroups.forEach(rg => {
        rg.group.rotation.z += dt * rg.speed * rg.dir * speedMult;
      });

      // 코어 맥동 효과
      if (coreMesh) {
        const pulse = (bossId === 'nexus' ? 0.94 : 0.88) + Math.sin(pulseTime * (currentPhase === 3 ? 7 : 4)) * 0.12;
        coreMesh.scale.set(pulse, pulse, pulse);
      }

      // 글로우 알파 맥동
      if (glowMat) {
        glowMat.opacity = 0.15 + Math.sin(pulseTime * 2.5) * 0.08;
      }

      // 히트 플래시 복귀
      if (isFlashing) {
        flashTimer -= dt;
        if (flashTimer <= 0) {
          isFlashing = false;
          applyPhase(currentPhase);
        }
      }
    },

    updateDebuff() {},

    dispose(s) {
      s.remove(group);
      allMats.forEach(m => {
        if (m instanceof THREE.MeshBasicMaterial && m.map) m.map.dispose();
        m.dispose();
      });
      hpBg.geometry.dispose();
      (hpBg.material as THREE.Material).dispose();
      hpBorder.geometry.dispose();
      (hpBorder.material as THREE.Material).dispose();
      hpFill.geometry.dispose();

      // 등록된 서브 메쉬들 재귀 해제
      subMeshes.forEach(mesh => {
        if (mesh instanceof THREE.Mesh) mesh.geometry.dispose();
      });
      rotGroups.forEach(rg => {
        rg.group.children.forEach(c => {
          if (c instanceof THREE.Mesh) c.geometry.dispose();
        });
      });
      if (coreMesh) coreMesh.geometry.dispose();
    },
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
