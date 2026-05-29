/**
 * VfxSystem.ts — 파티클 + 화면진동 + 플래시
 *
 * play(vfxId, x, y, color?) : 이펙트 재생
 * tick(dt) : 매 프레임 갱신 → { shakeX, shakeY } 반환
 *            (GameCore가 카메라 오프셋에 적용)
 *
 * 플래시는 hudStore '/vfx/flash*' 경로로 방출
 * (App.tsx CSS 오버레이가 소비)
 */
import * as THREE from 'three';
import type { VfxConfig } from './data';
import { hudStore } from './hudExternalStore';

interface Particle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/** VFX 재생 시 사용할 색상 매핑 (vfx_id → hex number) */
const VFX_COLORS: Record<string, number> = {
  enemy_death:  0xFFCC88,
  player_hit:   0xFF4455,
  boss_spawn:   0xCC55FF,
  boss_hit:     0xFF8800,
  level_up:     0xFFD600,
  bomb_use:     0xFF6633,
  explosion:    0xFF8844,
  red_tint_hit: 0xFF0000,
};

export class VfxSystem {
  private scene: THREE.Scene;
  private vfxMap: Map<string, VfxConfig>;

  private particles: Particle[] = [];

  /* 화면진동 */
  private shakeIntensity = 0;
  private shakeTimer = 0;
  private shakeDuration = 0;

  /* 플래시 페이드 */
  private flashOpacity = 0;
  private flashFadeSpeed = 0;
  private flashTimer = 0;

  constructor(scene: THREE.Scene, vfxMap: Map<string, VfxConfig>) {
    this.scene = scene;
    this.vfxMap = vfxMap;
  }

  /* ── 이펙트 재생 ── */
  play(id: string, x: number, y: number, colorOverride?: number): void {
    const cfg = this.vfxMap.get(id);
    if (!cfg) return;

    const color = colorOverride ?? (VFX_COLORS[id] ?? 0xffffff);

    /* 파티클 스폰 */
    for (let i = 0; i < cfg.particle_count; i++) {
      const size = cfg.particle_size_min + Math.random() * (cfg.particle_size_max - cfg.particle_size_min);
      const geo = new THREE.SphereGeometry(Math.max(0.5, size * 0.5), 4, 4);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 2 + Math.random() * 2);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = cfg.particle_speed * (0.4 + Math.random() * 0.6);
      const lifeSeconds = (cfg.particle_life_frames / 60) * (0.7 + Math.random() * 0.6);

      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: lifeSeconds,
        maxLife: lifeSeconds,
      });
    }

    /* 화면진동 */
    if (cfg.screen_shake_intensity > 0 && cfg.screen_shake_duration_frames > 0) {
      /* 더 강한 쪽 우선 */
      if (cfg.screen_shake_intensity >= this.shakeIntensity) {
        this.shakeIntensity = cfg.screen_shake_intensity;
        this.shakeDuration  = cfg.screen_shake_duration_frames / 60;
        this.shakeTimer     = this.shakeDuration;
      }
    }

    /* 플래시 */
    if (cfg.flash_duration_frames > 0) {
      this.flashOpacity   = 0.55;
      this.flashTimer     = cfg.flash_duration_frames / 60;
      this.flashFadeSpeed = 0.55 / this.flashTimer;

      const hexStr = '#' + color.toString(16).padStart(6, '0');
      hudStore.setMany({
        '/vfx/flashOpacity': this.flashOpacity,
        '/vfx/flashColor':   hexStr,
      });
    }
  }

  /* ── 매 프레임 갱신 ── */
  tick(dt: number): { shakeX: number; shakeY: number } {
    /* 파티클 갱신 */
    const toRemove: number[] = [];
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        toRemove.push(i);
        this.scene.remove(p.mesh);
        continue;
      }
      /* 속도 감쇠 */
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.mesh.position.x += p.vx * 60 * dt;
      p.mesh.position.y += p.vy * 60 * dt;

      /* 투명도 페이드아웃 */
      const t = p.life / p.maxLife;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = t;
    }
    /* 역순 제거 */
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.particles.splice(toRemove[i], 1);
    }

    /* 화면진동 */
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = Math.max(0, this.shakeTimer / this.shakeDuration);
      const amplitude = this.shakeIntensity * t * 55;
      shakeX = (Math.random() - 0.5) * amplitude;
      shakeY = (Math.random() - 0.5) * amplitude;
    }

    /* 플래시 페이드아웃 */
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      const newOpacity = Math.max(0, this.flashTimer * this.flashFadeSpeed);
      if (Math.abs(newOpacity - this.flashOpacity) > 0.015) {
        this.flashOpacity = newOpacity;
        hudStore.set('/vfx/flashOpacity', this.flashOpacity);
      }
      if (this.flashTimer <= 0) {
        this.flashOpacity = 0;
        hudStore.set('/vfx/flashOpacity', 0);
      }
    }

    return { shakeX, shakeY };
  }

  dispose(): void {
    for (const p of this.particles) this.scene.remove(p.mesh);
    this.particles.length = 0;
  }
}
