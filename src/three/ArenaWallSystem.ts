/**
 * ArenaWallSystem.ts — 이동형 보스 봉쇄 벽
 * 수치 SSoT: boss_pattern_config.csv (boss_id=arena_wall)
 */
import * as THREE from 'three';
import type { BossPatternTable } from '../game/data';
import { bossPatternNum } from '../game/data';

export class ArenaWallSystem {
  private scene: THREE.Scene;
  private patterns: BossPatternTable;
  private walls: THREE.Mesh[] = [];
  private material: THREE.MeshBasicMaterial | null = null;
  private active = false;
  private fadeTimer = 0;
  private fadingOut = false;

  halfW = 0;
  halfH = 0;

  constructor(scene: THREE.Scene, patterns: BossPatternTable) {
    this.scene = scene;
    this.patterns = patterns;
  }

  private _aw(key: string, def: number): number {
    return bossPatternNum(this.patterns, 'arena_wall', key, def);
  }

  activate(centerX: number, centerY: number, sizeW: number, sizeH: number, glowColor: string) {
    this.deactivate();

    this.halfW = sizeW / 2;
    this.halfH = sizeH / 2;

    const color = new THREE.Color(glowColor);
    this.material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: this._aw('wall_opacity', 0.75),
    });

    const hw = this.halfW;
    const hh = this.halfH;
    const t = this._aw('wall_thickness', 3);
    const h = this._aw('wall_height', 6);
    const wallZ = this._aw('wall_z', 1.5);

    const wallDefs = [
      { w: sizeW + t * 2, d: t, x: centerX, y: centerY + hh + t / 2 },
      { w: sizeW + t * 2, d: t, x: centerX, y: centerY - hh - t / 2 },
      { w: t, d: sizeH, x: centerX - hw - t / 2, y: centerY },
      { w: t, d: sizeH, x: centerX + hw + t / 2, y: centerY },
    ];

    for (const def of wallDefs) {
      const geo = new THREE.BoxGeometry(def.w, def.d, h);
      const mesh = new THREE.Mesh(geo, this.material);
      mesh.position.set(def.x, def.y, wallZ);
      this.scene.add(mesh);
      this.walls.push(mesh);
    }

    this.active = true;
    this.fadingOut = false;
    this.fadeTimer = 0;
  }

  startFadeOut() {
    if (!this.active) return;
    this.fadingOut = true;
    this.fadeTimer = 0;
  }

  deactivate() {
    for (const w of this.walls) {
      this.scene.remove(w);
      w.geometry.dispose();
    }
    this.walls.length = 0;
    this.material?.dispose();
    this.material = null;
    this.active = false;
    this.fadingOut = false;
    this.halfW = 0;
    this.halfH = 0;
  }

  tick(dt: number): boolean {
    if (!this.active) return false;
    if (this.fadingOut && this.material) {
      const fadeDur = this._aw('fade_duration_sec', 0.5);
      this.fadeTimer += dt;
      this.material.opacity = Math.max(0, (this._aw('wall_opacity', 0.75)) * (1 - this.fadeTimer / fadeDur));
      if (this.fadeTimer >= fadeDur) {
        this.deactivate();
        return false;
      }
    }
    return this.active;
  }

  get isActive(): boolean {
    return this.active;
  }

  /** 플레이어를 아레나 박스 안으로 클램프 */
  clampPlayer(px: number, py: number, cx: number, cy: number, playerRadius: number): { x: number; y: number } {
    const pad = playerRadius;
    const minX = cx - this.halfW + pad;
    const maxX = cx + this.halfW - pad;
    const minY = cy - this.halfH + pad;
    const maxY = cy + this.halfH - pad;
    return {
      x: Math.max(minX, Math.min(maxX, px)),
      y: Math.max(minY, Math.min(maxY, py)),
    };
  }
}
