/**
 * PlayerMesh.ts — 플레이어 Three.js 오브젝트
 * BoxGeometry + PointLight + HP바 + 방향 마커 + 무적 깜빡임
 */
import * as THREE from 'three';
import type { PlayerConfig } from '../game/data';

export class PlayerMesh {
  readonly group: THREE.Group;
  private body: THREE.Mesh;
  // dirMarker 제거됨 (라인 없음)
  private hpBarBg: THREE.Mesh;
  private hpBarFill: THREE.Mesh;
  private light: THREE.PointLight;
  private eyeLeft: THREE.Mesh | null = null;
  private eyeRight: THREE.Mesh | null = null;
  private debuffDots: THREE.Mesh[] = [];
  private exoShell: THREE.Mesh | null = null;
  private exoLevel = 0;

  private maxHp: number;
  private currentHp: number;
  private invincTimer = 0;
  private invincDuration = 0;
  private blinkTimer = 0;
  private readonly blinkInterval = 0.15;
  private moveAngle = 0; // 라디안, 이동 방향

  constructor(cfg: PlayerConfig, scene: THREE.Scene) {
    this.maxHp = cfg.max_hp;
    this.currentHp = cfg.max_hp;
    this.group = new THREE.Group();

    const s = cfg.geometry_size;
    const col = new THREE.Color(cfg.color_hex);

    if (cfg.sprite_url) {
      /* ── 스프라이트 모드 ── */
      const tex = new THREE.TextureLoader().load(cfg.sprite_url);
      const bodyGeo = new THREE.PlaneGeometry(s * 2.2, s * 2.2);
      const bodyMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
      this.body = new THREE.Mesh(bodyGeo, bodyMat);
    } else {
      /* ── 기본 절차적 모드 ── */
      const bodyGeo = new THREE.BoxGeometry(s, s, s * 0.4);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.1,
      });
      this.body = new THREE.Mesh(bodyGeo, bodyMat);

      /* ── 눈 ── */
      const halfZ = s * 0.21;
      const eyeHalfSize = s * 0.08;
      const eyeGeo = new THREE.BoxGeometry(eyeHalfSize, eyeHalfSize, 0.1);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0D1018 });
      this.eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
      this.eyeLeft.position.set(-s * 0.25, s * 0.14, halfZ);
      this.body.add(this.eyeLeft);
      this.eyeRight = new THREE.Mesh(eyeGeo.clone(), eyeMat);
      this.eyeRight.position.set( s * 0.25, s * 0.14, halfZ);
      this.body.add(this.eyeRight);
    }
    this.group.add(this.body);

    /* ── 발광 포인트라이트 ── */
    this.light = new THREE.PointLight(col, cfg.glow_intensity, s * 8);
    this.light.position.set(0, 0, 10);
    this.group.add(this.light);

    /* ── 하단 에지 라인 제거됨 ── */

    /* ── HP 바 배경 ── */
    const barW = s * 1.1;
    const barH = s * 0.1;
    const bgGeo = new THREE.PlaneGeometry(barW, barH);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.7 });
    this.hpBarBg = new THREE.Mesh(bgGeo, bgMat);
    this.hpBarBg.position.set(0, -s * 0.7, s * 0.25);
    this.group.add(this.hpBarBg);

    /* ── HP 바 채움 ── */
    const fillGeo = new THREE.PlaneGeometry(barW, barH);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0xFFD600 });
    this.hpBarFill = new THREE.Mesh(fillGeo, fillMat);
    this.hpBarFill.position.set(0, -s * 0.7, s * 0.3);
    this.group.add(this.hpBarFill);

    scene.add(this.group);
  }

  setPosition(x: number, y: number) {
    this.group.position.set(x, y, 0);
  }

  /* vx, vy 기반으로 방향 마커 회전 */
  setDirection(vx: number, vy: number) {
    if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return;
    this.moveAngle = Math.atan2(vy, vx);
    // 본체 회전 시 자식인 dirMarker도 함께 자동 동기화됨
    this.body.rotation.z = this.moveAngle - Math.PI / 2;
  }

  /* HP 업데이트 → 바 색상 + 크기 */
  setHp(hp: number) {
    this.currentHp = Math.max(0, hp);
    const pct = this.currentHp / this.maxHp;
    const s = (this.body.geometry as THREE.BoxGeometry).parameters.width;
    const barW = s * 1.1;

    // 크기 조정 (좌측 정렬 효과)
    this.hpBarFill.scale.x = Math.max(pct, 0.01);
    this.hpBarFill.position.x = -barW * (1 - pct) / 2;

    // 색상: 50% 이하 → 빨강
    const mat = this.hpBarFill.material as THREE.MeshBasicMaterial;
    mat.color.set(pct <= 0.5 ? 0xFF6680 : 0xFFD600);
  }

  /* 무적 프레임 시작 */
  startInvincible(frameDuration: number) {
    this.invincDuration = frameDuration / 60; // 프레임 → 초
    this.invincTimer = this.invincDuration;
    this.blinkTimer = 0;
  }

  /* 매 프레임 호출 */
  tick(dt: number) {
    /* 무적 깜빡임 */
    if (this.invincTimer > 0) {
      this.invincTimer -= dt;
      this.blinkTimer += dt;
      if (this.blinkTimer >= this.blinkInterval) {
        this.blinkTimer = 0;
        const mat = this.body.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = mat.opacity < 0.9 ? 1.0 : 0.3;
      }
      if (this.invincTimer <= 0) {
        const mat = this.body.material as THREE.MeshStandardMaterial;
        mat.transparent = false;
        mat.opacity = 1.0;
      }
    }

    /* 본체 아이들 애니메이션 — 살짝 부유 */
    this.body.position.z = Math.sin(performance.now() * 0.002) * 0.8;
    this.light.position.z = 10 + Math.sin(performance.now() * 0.002) * 0.8;

    if (this.exoShell) {
      this.exoShell.position.z = this.body.position.z;
      const shellMat = this.exoShell.material as THREE.MeshBasicMaterial;
      const pulse = 0.9 + Math.sin(performance.now() * 0.005) * 0.1;
      shellMat.opacity = (0.16 + this.exoLevel * 0.05) * pulse;
    }
  }

  setExoskeletonLevel(level: number) {
    this.exoLevel = Math.max(0, level);
    if (this.exoLevel <= 0) {
      if (this.exoShell) {
        this.body.remove(this.exoShell);
        this.exoShell.geometry.dispose();
        const mat = this.exoShell.material as THREE.Material;
        mat.dispose();
        this.exoShell = null;
      }
      return;
    }

    if (!this.exoShell) {
      const s = (this.body.geometry as THREE.BoxGeometry).parameters.width;
      const shellGeo = new THREE.PlaneGeometry(s * 1.16, s * 1.16);

      // 상단 보라 -> 하단 청록 그라데이션 텍스처
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 64;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        const g = ctx.createLinearGradient(0, 0, 0, 64);
        g.addColorStop(0, '#c099ff');
        g.addColorStop(1, '#7be8f4');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
      }
      const tex = new THREE.CanvasTexture(cvs);
      tex.needsUpdate = true;

      const shellMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.exoShell = new THREE.Mesh(shellGeo, shellMat);
      this.exoShell.position.set(0, 0, (this.body.geometry as THREE.BoxGeometry).parameters.depth * 0.55);
      this.body.add(this.exoShell);
    }
  }

  setDebuffState(active: boolean) {
    if (active) {
      if (this.debuffDots.length === 0) {
        const s = (this.body.geometry as THREE.BoxGeometry).parameters.width;
        const dotGeo = new THREE.SphereGeometry(s * 0.14, 8, 8);
        const dotMat = new THREE.MeshStandardMaterial({
          color: 0x9900ff,
          emissive: 0x5500aa,
          emissiveIntensity: 0.9,
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        // 바디 정중앙 표면에 착 밀착하여 1개만 스폰
        dot.position.set(0, 0, s * 0.20);
        this.body.add(dot);
        this.debuffDots.push(dot);
      }
    } else {
      if (this.debuffDots.length > 0) {
        for (const dot of this.debuffDots) {
          this.body.remove(dot);
          dot.geometry.dispose();
          if (Array.isArray(dot.material)) {
            dot.material.forEach(m => m.dispose());
          } else {
            dot.material.dispose();
          }
        }
        this.debuffDots = [];
      }
    }
  }

  dispose(scene: THREE.Scene) {
    this.setDebuffState(false);
    this.setExoskeletonLevel(0);
    scene.remove(this.group);
  }
}
