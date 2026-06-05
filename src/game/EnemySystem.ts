/**
 * EnemySystem.ts — 적 인스턴스 관리 + AI + 충돌
 * GameCore._tick() 에서 매 프레임 tick() 호출
 */
import * as THREE from 'three';
import type { BossConfig, EnemyConfig, EnemyId, GameData } from './data';
import { createEnemyMesh, clearEnemyInstancer, createBossMesh, type EnemyMeshHandle } from '../three/EnemyMesh';

export interface EnemyInstance {
  id: number;
  cfg: EnemyConfig;
  handle: EnemyMeshHandle;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  /** 접촉 데미지 쿨다운 (초) */
  contactTimer: number;
  dead: boolean;
  fireTimer?: number;
  slowTimer?: number;
  /** 스테이지 속도 배율 */
  speedMult: number;
  /** 스테이지 데미지 배율 */
  dmgMult: number;
  /* ── 속성 상태 효과 ── */
  /** 화염 DoT: 남은 시간(초) */
  burnTimer?: number;
  /** 화염 DoT: 초당 데미지 */
  burnDps?: number;
  burnTickAccum?: number;
  /** 냉기 둔화: 남은 시간(초) — slowTimer 재사용, 둔화율 */
  slowFactor?: number;
  /** 독 누적: 스택 수 + 남은 시간 */
  poisonStacks?: number;
  poisonTimer?: number;
  poisonTickAccum?: number;
  /** dog 대시 상태: 양수=대시 중 남은 시간, 음수=쿨다운 */
  dashTimer?: number;
  dashVx?: number;
  dashVy?: number;
  /** 미니보스 전용: 현재 페이즈 (1=기본/2=분노) */
  bossPhase?: number;
  /** 미니보스 돌진 쿨다운 */
  chargeTimer?: number;
  /** 종대 스피터 분대 식별자 */
  squadId?: number;
  /** 종대 컬럼 인덱스 (0~1) */
  squadCol?: number;
  /** 종대 행 인덱스 */
  squadRow?: number;
  /** basic/bloater 전용 — 스폰 시 고정 추적 패턴 */
  chaseMode?: ChaseMode;
  /** flank 모드 좌/우 (스폰 시 고정) */
  flankSign?: 1 | -1;
}

export type ChaseMode = 'direct' | 'intercept' | 'flank';

export interface EnemyProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  radius: number;
  mesh: THREE.Object3D;
  life: number;
  /** 유도 미사일 전용 */
  homing?: boolean;
  turn_rate?: number;   // rad/s — 낮을수록 둔하게 회전
  max_range?: number;   // 최대 이동 거리 (0=무한)
  traveled?: number;    // 누적 이동 거리
  speed?: number;       // 속도 유지용
}

let _nextId = 1;

interface SpawnOptions {
  squadId?: number;
  squadCol?: number;
  squadRow?: number;
  squadMoveSec?: number;
  squadFireSec?: number;
  squadColSpacing?: number;
  squadRowSpacing?: number;
  squadMarchSpeedMult?: number;
  chaseMode?: ChaseMode;
  flankSign?: 1 | -1;
}

interface SpitterSquadState {
  centerX: number;
  centerY: number;
  phase: 'move' | 'fire';
  phaseTimer: number;
  moveSec: number;
  fireSec: number;
  colSpacing: number;
  rowSpacing: number;
  marchSpeedMult: number;
}

export class EnemySystem {
  private scene: THREE.Scene;
  private data: GameData;
  readonly enemies: EnemyInstance[] = [];
  readonly projectiles: EnemyProjectile[] = [];
  /** 이번 프레임 플레이어에게 적용된 효과 (GameCore가 읽고 처리) */
  readonly playerEffects: string[] = [];
  /** 이번 프레임 플레이어가 적 미사일에 피격됐는지 */
  playerHitByMissile = false;
  private spitterSquads = new Map<number, SpitterSquadState>();

  constructor(scene: THREE.Scene, data: GameData) {
    this.scene = scene;
    this.data = data;
  }

  /** 전투 튜닝 값 조회 (combat_tuning.csv) */
  private _ct(key: string, def: number): number {
    const v = this.data.combatTuning.get(key);
    return v === undefined ? def : v;
  }

  /** basic/bloater 전략 추적 — 스폰 시 고정된 chaseMode 기준 */
  private _chaseDir(
    e: EnemyInstance,
    px: number,
    py: number,
    pvx: number,
    pvy: number,
    dx: number,
    dy: number,
    dist: number,
  ): { nx: number; ny: number } {
    const direct = { nx: dx / dist, ny: dy / dist };
    const mode = e.chaseMode ?? 'direct';
    if (mode === 'direct') return direct;

    const pSpeed = Math.hypot(pvx, pvy);
    const moveThresh = this._ct('spawn_move_speed_threshold', 0.12);

    if (mode === 'intercept') {
      if (pSpeed > moveThresh) {
        const leadSec = this._ct('chase_intercept_lead_sec', 0.45);
        const movePxPerSec = this._ct('chase_intercept_player_speed', 180);
        const scale = movePxPerSec * leadSec * pSpeed;
        const tdx = (px + (pvx / pSpeed) * scale) - e.x;
        const tdy = (py + (pvy / pSpeed) * scale) - e.y;
        const td = Math.hypot(tdx, tdy);
        if (td > 0.5) return { nx: tdx / td, ny: tdy / td };
      }
      return direct;
    }

    /* flank — 플레이어 측면 목표점으로 우회 */
    const flankOffset = this._ct('chase_flank_offset_px', 70);
    const sign = e.flankSign ?? 1;
    let perpX: number;
    let perpY: number;
    if (pSpeed > moveThresh) {
      perpX = (-pvy / pSpeed) * sign;
      perpY = (pvx / pSpeed) * sign;
    } else {
      perpX = (-dy / dist) * sign;
      perpY = (dx / dist) * sign;
    }
    const fdx = (px + perpX * flankOffset) - e.x;
    const fdy = (py + perpY * flankOffset) - e.y;
    const fd = Math.hypot(fdx, fdy);
    if (fd > 0.5) return { nx: fdx / fd, ny: fdy / fd };
    return direct;
  }

  /** element_config.tick_interval_sec 우선, 없으면 combat_tuning */
  private _elemTick(elementId: string, tuningKey: string, def: number): number {
    const el = this.data.elements.get(elementId);
    if (el && el.tick_interval_sec > 0) return el.tick_interval_sec;
    return this._ct(tuningKey, def);
  }

  spawn(
    enemyId: EnemyId,
    x: number,
    y: number,
    hpMult = 1.0,
    speedMult = 1.0,
    dmgMult = 1.0,
    options?: SpawnOptions,
  ): EnemyInstance {
    const cfg = this.data.enemies.get(enemyId)!;
    const handle = createEnemyMesh(cfg, this.scene);
    handle.setPosition(x, y);
    const scaledHp = Math.round(cfg.hp * hpMult);
    const inst: EnemyInstance = {
      id: _nextId++,
      cfg,
      handle,
      hp: scaledHp,
      maxHp: scaledHp,
      x,
      y,
      contactTimer: 0,
      dead: false,
      fireTimer: enemyId === 'spitter' ? this._ct('spitter_init_delay_min', 0.3) + Math.random() * (this._ct('spitter_init_delay_max', 1.0) - this._ct('spitter_init_delay_min', 0.3)) : undefined,
      dashTimer: enemyId === 'dog' ? -(2 + Math.random() * 2) : undefined,
      speedMult,
      dmgMult,
      squadId: options?.squadId,
      squadCol: options?.squadCol,
      squadRow: options?.squadRow,
      chaseMode: options?.chaseMode,
      flankSign: options?.flankSign,
    };
    if (enemyId === 'spitter' && options?.squadId !== undefined && !this.spitterSquads.has(options.squadId)) {
      const moveSec = Math.max(0.2, options.squadMoveSec ?? 1.4);
      this.spitterSquads.set(options.squadId, {
        centerX: x,
        centerY: y,
        phase: 'move',
        phaseTimer: moveSec,
        moveSec,
        fireSec: Math.max(0.2, options.squadFireSec ?? 0.9),
        colSpacing: Math.max(8, options.squadColSpacing ?? 30),
        rowSpacing: Math.max(8, options.squadRowSpacing ?? 26),
        marchSpeedMult: Math.max(0.1, options.squadMarchSpeedMult ?? 0.85),
      });
    }
    this.enemies.push(inst);
    return inst;
  }

  /** 미니보스 스폰 — BossConfig를 기반으로 createBossMesh를 사용하여 개별 3D 조립 메쉬 할당 */
  spawnMiniBoss(cfg: BossConfig, scaledHp: number, x: number, y: number): EnemyInstance {
    const handle = createBossMesh(cfg, this.scene);
    handle.setPosition(x, y);
    const miniBossEnemyCfg: EnemyConfig = {
      enemy_id: cfg.boss_id as EnemyId,
      enemy_name: cfg.boss_name,
      hp: scaledHp,
      damage_reduction: 0,
      speed: cfg.speed,
      radius: cfg.radius,
      contact_dmg: cfg.contact_dmg,
      contact_dmg_interval_frames: cfg.contact_dmg_interval_frames,
      exp_drop_type: 'xp_large',
      gold_drop: 50,
      weight: 1,
      geometry_type: cfg.geometry_type,
      color_hex: cfg.color_hex,
      has_glow: true,
      glow_color_hex: cfg.glow_color_hex,
      sprite_url: cfg.sprite_url,
    };
    const inst: EnemyInstance = {
      id: _nextId++,
      cfg: miniBossEnemyCfg,
      handle,
      hp: scaledHp,
      maxHp: scaledHp,
      x,
      y,
      contactTimer: 0,
      dead: false,
      speedMult: 1.0,
      dmgMult: 1.0,
    };
    this.enemies.push(inst);
    return inst;
  }

  /**
   * 매 프레임 AI 이동 + 메쉬 동기화 + 접촉 데미지 판정
   * @returns 이번 프레임 플레이어에게 가한 데미지 합
   */
  tick(dt: number, px: number, py: number, playerRadius: number, pvx = 0, pvy = 0): number {
    let totalDmg = 0;
    const toRemove: number[] = [];
    this.playerEffects.length = 0;
    this.playerHitByMissile = false;

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) {
        toRemove.push(i);
        continue;
      }

      /* ── 속성 상태 효과 틱 (화염 DoT / 독 누적) — DPS×틱간격 커플링 유지 ── */
      if (e.burnTimer !== undefined && e.burnTimer > 0) {
        e.burnTimer -= dt;
        const fireTick = this._elemTick('fire', 'fire_tick_sec', 0.5);
        e.burnTickAccum = (e.burnTickAccum ?? 0) + dt;
        if (e.burnTickAccum >= fireTick) {
          e.burnTickAccum -= fireTick;
          this._applyDot(e, (e.burnDps ?? 0) * fireTick);
        }
      }
      if (e.poisonTimer !== undefined && e.poisonTimer > 0 && (e.poisonStacks ?? 0) > 0) {
        e.poisonTimer -= dt;
        const poisonTick = this._elemTick('poison', 'poison_tick_sec', 0.5);
        e.poisonTickAccum = (e.poisonTickAccum ?? 0) + dt;
        if (e.poisonTickAccum >= poisonTick) {
          e.poisonTickAccum -= poisonTick;
          const dpsPerStack = this._ct('poison_dps_per_stack', 1.5);
          this._applyDot(e, (e.poisonStacks ?? 0) * dpsPerStack * poisonTick);
        }
      }
      if (e.dead) { toRemove.push(i); continue; }

      /* 디버프 시각 표시 — 분기 진입 전 통합 처리 */
      e.handle.updateDebuff(
        (e.burnTimer ?? 0) > 0,
        (e.slowTimer ?? 0) > 0,
        e.poisonStacks ?? 0,
      );

      /* AI: 플레이어 방향 직선 추적 */
      const dx = px - e.x;
      const dy = py - e.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      const isSpitter = e.cfg.enemy_id === 'spitter';
      const isStationary = e.cfg.enemy_id === 'nexus'; // 고정형 미니보스
      const keepDistance = isSpitter && dist < this._ct('spitter_keep_distance', 120);

      let enemySpeed = e.cfg.speed * e.speedMult;
      if (e.slowTimer !== undefined && e.slowTimer > 0) {
        e.slowTimer -= dt;
        enemySpeed *= (1 - (e.slowFactor ?? this._ct('cold_slow_mult', 0.5)));
      }

      if (isStationary) {
        /* NEXUS: 이동 없음, 방향만 플레이어 쪽으로 */
        if (dist > 0.5) e.handle.updateDirection(dx / dist, dy / dist);
        e.handle.tick(dt);
        continue;
      }

      /* ── CRUSHER 미니보스 AI ── */
      const isCrusher = e.cfg.enemy_id === 'crusher';
      if (isCrusher) {
        const hpPct = e.hp / e.maxHp;

        /* 페이즈 전환 감지 */
        if (hpPct < 0.4 && e.bossPhase !== 2) {
          e.bossPhase = 2;
          /* 분노: 색상 플래시 3회 */
          for (let f = 0; f < 3; f++) window.setTimeout(() => e.handle.flashHit(), f * 180);
        } else if (!e.bossPhase) {
          e.bossPhase = 1;
          e.chargeTimer = -(2 + Math.random() * 2);
        }

        const rageSpeedMult = e.bossPhase === 2 ? 1.6 : 1.0;
        const spd = e.cfg.speed * e.speedMult * rageSpeedMult;

        /* chargeTimer 관리 */
        if (e.chargeTimer !== undefined) e.chargeTimer -= dt;

        /* 돌진 준비: HP < 70%, 쿨다운 끝나면 짧게 멈춘 뒤 돌진 */
        if (hpPct < 0.7 && e.chargeTimer !== undefined) {
          if (e.chargeTimer <= 0 && e.chargeTimer > -0.4) {
            /* 예비동작: 멈춤 0.4초 */
            e.handle.tick(dt);
            if (e.contactTimer > 0) e.contactTimer -= dt;
            continue;
          } else if (e.chargeTimer <= -0.4 && e.chargeTimer > -0.7) {
            /* 돌진: 3.5배속 */
            if (dist > 0.5) {
              const nx = dx / dist, ny = dy / dist;
              e.x += nx * spd * 3.5 * 60 * dt;
              e.y += ny * spd * 3.5 * 60 * dt;
              e.handle.setPosition(e.x, e.y);
              e.handle.updateDirection(nx, ny);
            }
            e.handle.tick(dt);
            if (e.contactTimer > 0) e.contactTimer -= dt;
            continue;
          } else if (e.chargeTimer <= -0.7) {
            /* 돌진 완료 → 다음 쿨다운 */
            e.chargeTimer = -(3 + Math.random() * 3);
          }
        }

        /* 일반 추적 */
        if (dist > 0.5) {
          const nx = dx / dist, ny = dy / dist;
          e.x += nx * spd * 60 * dt;
          e.y += ny * spd * 60 * dt;
          e.handle.setPosition(e.x, e.y);
          e.handle.updateDirection(nx, ny);
        }
        e.handle.tick(dt);

        const contactDist = e.cfg.radius + playerRadius;
        if (dist < contactDist && e.contactTimer <= 0) {
          totalDmg += e.cfg.contact_dmg * e.dmgMult;
          e.contactTimer = e.cfg.contact_dmg_interval_frames / 60;
        }
        if (e.contactTimer > 0) e.contactTimer -= dt;
        continue;
      }

      /* ── dog 대시 AI ── */
      const isDog = e.cfg.enemy_id === 'dog';
      if (isDog && e.dashTimer !== undefined) {
        e.dashTimer -= dt;
        if (e.dashTimer > 0 && e.dashVx !== undefined) {
          /* 대시 중: 저장된 방향으로 빠르게 이동 */
          e.x += e.dashVx * 60 * dt;
          e.y += e.dashVy! * 60 * dt;
          e.handle.setPosition(e.x, e.y);
          e.handle.updateDirection(e.dashVx, e.dashVy!);
          e.handle.tick(dt);
          if (e.contactTimer > 0) e.contactTimer -= dt;
          continue;
        } else if (e.dashTimer <= 0 && e.dashTimer > -1.2) {
          /* 대시 직후 잠깐 감속 (멈춤) */
          e.dashVx = undefined;
          e.handle.tick(dt);
          if (e.contactTimer > 0) e.contactTimer -= dt;
          continue;
        } else if (e.dashTimer <= -1.2) {
          /* 쿨다운 완료 → 플레이어 가까우면 대시 준비 */
          if (dist < 200 && dist > 30) {
            const nx = dx / dist, ny = dy / dist;
            e.dashTimer = 0.22;              // 대시 지속
            e.dashVx = nx * enemySpeed * 4.5;
            e.dashVy = ny * enemySpeed * 4.5;
          } else {
            e.dashTimer = -(2 + Math.random() * 2); // 다음 쿨다운
          }
        }
      }

      if (dist > 0.5 && !keepDistance) {
        const isBasicChaser = e.cfg.enemy_id === 'basic' || e.cfg.enemy_id === 'bloater';
        const { nx, ny } = isBasicChaser && e.chaseMode
          ? this._chaseDir(e, px, py, pvx, pvy, dx, dy, dist)
          : { nx: dx / dist, ny: dy / dist };
        const spd = enemySpeed * 60 * dt;
        e.x += nx * spd;
        e.y += ny * spd;
        e.handle.setPosition(e.x, e.y);
        e.handle.updateDirection(nx, ny);
      } else if (keepDistance) {
        /* 플레이어가 너무 가까우면 적극적으로 후퇴 */
        const nx = dx / dist;
        const ny = dy / dist;
        e.handle.updateDirection(nx, ny);
        const spd = enemySpeed * 60 * dt;
        e.x -= nx * spd;
        e.y -= ny * spd;
        e.handle.setPosition(e.x, e.y);
      }

      /* 접촉 데미지 */
      const contactDist = e.cfg.radius + playerRadius;
      if (dist < contactDist) {
        if (e.contactTimer <= 0) {
          totalDmg += e.cfg.contact_dmg * e.dmgMult;
          e.contactTimer = e.cfg.contact_dmg_interval_frames / 60;
          /* bloater 접촉 시 플레이어 냉기 둔화 */
          if (e.cfg.enemy_id === 'bloater') {
            this.playerEffects.push('cold');
          }
        }
      }
      if (e.contactTimer > 0) e.contactTimer -= dt;

      /* 스피터 사격 AI */
      if (isSpitter && e.squadId !== undefined) {
        this._tickSpitterSquadMember(e, dt, px, py);
      } else if (isSpitter && e.fireTimer !== undefined) {
        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && dist < this._ct('spitter_fire_range', 180)) {
          e.fireTimer = this._ct('spitter_fire_interval_sec', 3.5);
          this._fireMissile(e.x, e.y, dx, dy, dist);
        }
      }

      e.handle.tick(dt);
    }

    this._tickSpitterSquads(dt, px, py);

    /* 역순 제거 (인덱스 안전) */
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const idx = toRemove[i];
      this.enemies[idx].handle.dispose(this.scene);
      this.enemies.splice(idx, 1);
    }
    this._cleanupSpitterSquads();

    /* 적군 투사체 업데이트 */
    const projToRemove: number[] = [];
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        projToRemove.push(i);
        continue;
      }

      /* 유도 미사일 — 제한된 회전 반경으로 플레이어 추적 */
      if (p.homing && p.turn_rate && p.speed) {
        const dx = px - p.x;
        const dy = py - p.y;
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(p.vy, p.vx);
        let angleDiff = targetAngle - currentAngle;
        // 각도 정규화 (-π ~ π)
        while (angleDiff > Math.PI)  angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        const maxTurn = p.turn_rate * dt;
        const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
        const newAngle = currentAngle + turn;
        p.vx = Math.cos(newAngle) * p.speed;
        p.vy = Math.sin(newAngle) * p.speed;
        p.mesh.rotation.z = newAngle;
      }

      const moveX = p.vx * 60 * dt;
      const moveY = p.vy * 60 * dt;
      p.x += moveX;
      p.y += moveY;

      /* max_range 초과 시 소멸 */
      if (p.max_range && p.traveled !== undefined) {
        p.traveled += Math.sqrt(moveX * moveX + moveY * moveY);
        if (p.traveled >= p.max_range) {
          projToRemove.push(i);
          continue;
        }
      }

      p.mesh.position.set(p.x, p.y, 1);

      // 플레이어 충돌 검사
      const pdx = px - p.x;
      const pdy = py - p.y;
      const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pDist < p.radius + playerRadius) {
        totalDmg += p.dmg;
        this.playerHitByMissile = true;
        projToRemove.push(i);
      }
    }

    const sortedProj = [...new Set(projToRemove)].sort((a, b) => b - a);
    for (const idx of sortedProj) {
      this.scene.remove(this.projectiles[idx].mesh);
      this.projectiles.splice(idx, 1);
    }

    return totalDmg;
  }

  /* 공유 미사일 지오메트리/재질 (한 번만 생성) */
  private static _missileHeadGeo = new THREE.CircleGeometry(4.5, 5);
  private static _missileHeadMat = new THREE.MeshBasicMaterial({ color: 0xCC1111 });
  private static _missileTailGeo = new THREE.CircleGeometry(2.8, 4);
  private static _missileTailMat = new THREE.MeshBasicMaterial({ color: 0x444444 });

  private _fireMissile(sx: number, sy: number, dx: number, dy: number, dist: number) {
    if (dist <= 0) return;
    const speed = this._ct('spitter_missile_speed', 2.4);
    const radius = this._ct('spitter_missile_radius', 4.5);
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    /* 공유 Geo+Mat 재사용 — GPU 오브젝트 추가 생성 없음 */
    const head = new THREE.Mesh(EnemySystem._missileHeadGeo, EnemySystem._missileHeadMat);
    const tail = new THREE.Mesh(EnemySystem._missileTailGeo, EnemySystem._missileTailMat);
    tail.position.set(-radius * 1.5, 0, 0);

    const group = new THREE.Group();
    group.add(head, tail);
    group.rotation.z = Math.atan2(vy, vx);
    group.position.set(sx, sy, 1);
    this.scene.add(group);

    this.projectiles.push({
      x: sx,
      y: sy,
      vx,
      vy,
      dmg: this._ct('spitter_missile_dmg', 3),
      radius,
      mesh: group,
      life: this._ct('spitter_missile_life_sec', 3.0),
    });
  }

  private _tickSpitterSquads(dt: number, px: number, py: number) {
    for (const squad of this.spitterSquads.values()) {
      squad.phaseTimer -= dt;
      if (squad.phase === 'move') {
        const dx = px - squad.centerX;
        const dy = py - squad.centerY;
        const d = Math.hypot(dx, dy) || 1;
        const spd = squad.marchSpeedMult;
        squad.centerX += (dx / d) * spd * 60 * dt;
        squad.centerY += (dy / d) * spd * 60 * dt;
      }
      if (squad.phaseTimer <= 0) {
        if (squad.phase === 'move') {
          squad.phase = 'fire';
          squad.phaseTimer = squad.fireSec;
        } else {
          squad.phase = 'move';
          squad.phaseTimer = squad.moveSec;
        }
      }
    }
  }

  private _tickSpitterSquadMember(e: EnemyInstance, dt: number, px: number, py: number) {
    const squad = this.spitterSquads.get(e.squadId!);
    if (!squad) return;
    const col = e.squadCol ?? 0;
    const row = e.squadRow ?? 0;
    const tx = squad.centerX + (col === 0 ? -squad.colSpacing * 0.5 : squad.colSpacing * 0.5);
    const ty = squad.centerY + row * squad.rowSpacing;
    const dx = tx - e.x;
    const dy = ty - e.y;
    const d = Math.hypot(dx, dy);
    const followSpd = e.cfg.speed * e.speedMult * 60 * dt * (squad.phase === 'move' ? 1.35 : 0.9);
    if (d > 1) {
      e.x += (dx / d) * Math.min(d, followSpd);
      e.y += (dy / d) * Math.min(d, followSpd);
      e.handle.setPosition(e.x, e.y);
      e.handle.updateDirection(dx / d, dy / d);
    }

    if (squad.phase === 'move') {
      e.fireTimer = 0;
    }
    if (squad.phase === 'fire' && e.fireTimer !== 999) {
      const pdx = px - e.x;
      const pdy = py - e.y;
      const pd = Math.hypot(pdx, pdy);
      if (pd < this._ct('spitter_fire_range', 260)) {
        this._fireMissile(e.x, e.y, pdx, pdy, pd);
      }
      e.fireTimer = 999;
    }
  }

  private _cleanupSpitterSquads() {
    const aliveIds = new Set<number>();
    for (const e of this.enemies) {
      if (!e.dead && e.squadId !== undefined) aliveIds.add(e.squadId);
    }
    for (const id of this.spitterSquads.keys()) {
      if (!aliveIds.has(id)) this.spitterSquads.delete(id);
    }
  }

  /** NEXUS 유도 미사일 발사 — 제한된 회전 반경 + 최대 사거리 */
  fireHomingMissile(
    sx: number, sy: number,
    angle: number,
    speed: number, turnRate: number, maxRange: number,
    dmg: number,
  ) {
    const radius = 5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const head = new THREE.Mesh(EnemySystem._missileHeadGeo, EnemySystem._missileHeadMat);
    const tail = new THREE.Mesh(EnemySystem._missileTailGeo, EnemySystem._missileTailMat);
    tail.position.set(-radius * 1.5, 0, 0);
    const group = new THREE.Group();
    group.add(head, tail);
    group.rotation.z = angle;
    group.position.set(sx, sy, 1);
    this.scene.add(group);

    this.projectiles.push({
      x: sx, y: sy, vx, vy,
      dmg, radius, mesh: group, life: 6.0,
      homing: true,
      turn_rate: turnRate,
      max_range: maxRange,
      traveled: 0,
      speed,
    });
  }

  /** 적 피격. 사망 시 dead=true 마킹 후 true 반환 */
  hit(enemyId: number, dmg: number): boolean {
    const e = this.enemies.find(en => en.id === enemyId);
    if (!e || e.dead) return false;
    const reducedDmg = this._applyDefenseReduction(dmg, e.cfg.damage_reduction);
    e.hp = Math.max(0, e.hp - reducedDmg);
    e.handle.flashHit();
    e.handle.updateHp(e.hp / e.maxHp);
    if (e.hp <= 0) {
      e.dead = true;
      return true;
    }
    return false;
  }

  /** DoT 데미지 (내부용, 메쉬 플래시 없이) */
  private _applyDot(e: EnemyInstance, dmg: number) {
    if (e.dead || dmg <= 0) return;
    const reducedDmg = this._applyDefenseReduction(dmg, e.cfg.damage_reduction);
    e.hp = Math.max(0, e.hp - reducedDmg);
    e.handle.updateHp(e.hp / e.maxHp);
    if (e.hp <= 0) e.dead = true;
  }

  private _applyDefenseReduction(dmg: number, reduction: number): number {
    const clamped = Math.max(0, Math.min(0.95, reduction));
    return dmg * (1 - clamped);
  }

  /** 스킬 적중 시 속성 효과 부여 */
  applyElement(enemyId: number, cfg: import('./data').ElementConfig) {
    const e = this.enemies.find(en => en.id === enemyId);
    if (!e || e.dead) return;
    switch (cfg.effect_type) {
      case 'dot': // 화염
        e.burnTimer = cfg.duration_sec;
        e.burnDps = cfg.magnitude;
        e.burnTickAccum = e.burnTickAccum ?? 0;
        break;
      case 'slow': // 냉기
        e.slowTimer = cfg.duration_sec;
        e.slowFactor = cfg.magnitude;
        break;
      case 'poison_stack': // 독 누적
        e.poisonStacks = Math.min(
          (e.poisonStacks ?? 0) + 1,
          cfg.max_stacks || this._ct('poison_max_stacks', 5),
        );
        e.poisonTimer = cfg.duration_sec;
        e.poisonTickAccum = e.poisonTickAccum ?? 0;
        break;
      /* pierce(광선)/chain(전기)은 투사체 단계에서 처리, 상태효과 없음 */
    }
  }

  /** 지정 좌표에서 가장 가까운 살아있는 적 */
  findNearest(x: number, y: number): EnemyInstance | null {
    let nearest: EnemyInstance | null = null;
    let minD2 = Infinity;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minD2) { minD2 = d2; nearest = e; }
    }
    return nearest;
  }

  /** 원 범위 내 모든 살아있는 적 */
  findInRadius(x: number, y: number, radius: number): EnemyInstance[] {
    const r2 = radius * radius;
    return this.enemies.filter(e => {
      if (e.dead) return false;
      const dx = e.x - x;
      const dy = e.y - y;
      return dx * dx + dy * dy <= r2;
    });
  }

  applySlowInRadius(x: number, y: number, radius: number, duration: number) {
    const r2 = radius * radius;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) {
        e.slowTimer = duration;
      }
    }
  }

  get liveCount(): number {
    return this.enemies.filter(e => !e.dead).length;
  }

  clear() {
    for (const e of this.enemies) {
      e.handle.dispose(this.scene);
    }
    this.enemies.length = 0;

    for (const p of this.projectiles) {
      this.scene.remove(p.mesh);
    }
    this.projectiles.length = 0;
    this.spitterSquads.clear();

    /* InstancedMesh 슬롯 전부 반납 + 숨김 */
    clearEnemyInstancer();
  }

}
