/**
 * PlayerMesh.ts — 플레이어 Three.js 오브젝트
 * BoxGeometry + PointLight + HP바 + 방향 마커 + 무적 깜빡임
 */
import * as THREE from 'three';
import type { PlayerConfig } from '../game/data';

// ── 2D Canvas 드로잉 헬퍼 함수들 ──

function drawBodyCanvas(colorHex = '#7BE8F4'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Hex to RGBA 헬퍼
  const toRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 1. 네온 라인 색상의 반투명도를 조율하여 입체감 있는 면 채우기
  // 좌측면 (어두운 반투명 하늘색)
  ctx.fillStyle = toRgba(colorHex, 0.35);
  ctx.beginPath();
  ctx.moveTo(70, 105);
  ctx.lineTo(128, 140);
  ctx.lineTo(128, 210);
  ctx.lineTo(70, 175);
  ctx.closePath();
  ctx.fill();

  // 우측 앞면/얼굴면 (라인과 동일한 색상톤 및 밝기로 완전히 칠함)
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.moveTo(128, 140);
  ctx.lineTo(186, 105);
  ctx.lineTo(186, 175);
  ctx.lineTo(128, 210);
  ctx.closePath();
  ctx.fill();

  // 윗면 (가장 밝은 반투명 하늘색)
  ctx.fillStyle = toRgba(colorHex, 0.75);
  ctx.beginPath();
  ctx.moveTo(128, 70);
  ctx.lineTo(70, 105);
  ctx.lineTo(128, 140);
  ctx.lineTo(186, 105);
  ctx.closePath();
  ctx.fill();

  // 2. 하늘색 네온 뼈대 그리기
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 6.5;
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 12;

  // 윗면 평행사변형
  ctx.beginPath();
  ctx.moveTo(128, 70);
  ctx.lineTo(70, 105);
  ctx.lineTo(128, 140);
  ctx.lineTo(186, 105);
  ctx.closePath();
  ctx.stroke();

  // 좌측 세로선
  ctx.beginPath();
  ctx.moveTo(70, 105);
  ctx.lineTo(70, 175);
  ctx.stroke();

  // 중앙 세로선
  ctx.beginPath();
  ctx.moveTo(128, 140);
  ctx.lineTo(128, 210);
  ctx.stroke();

  // 우측 세로선
  ctx.beginPath();
  ctx.moveTo(186, 105);
  ctx.lineTo(186, 175);
  ctx.stroke();

  // 아랫면 앞쪽 루프
  ctx.beginPath();
  ctx.moveTo(70, 175);
  ctx.lineTo(128, 210);
  ctx.lineTo(186, 175);
  ctx.stroke();

  ctx.shadowBlur = 0; // 섀도 리셋

  // 3. 눈 (우측 앞면 평행사변형 영역에 배치)
  // 두 눈 (검은색 점눈)
  ctx.fillStyle = '#000000';
  ctx.shadowBlur = 0; // 검은 점눈이므로 글로우 제거

  // 왼쪽 눈 (우측면 내 안쪽)
  ctx.beginPath();
  ctx.arc(144, 153, 5, 0, Math.PI * 2);
  ctx.fill();

  // 오른쪽 눈 (우측면 내 바깥쪽)
  ctx.beginPath();
  ctx.arc(168, 140, 5, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}





/** 본체 실루엣만 검정 마스크 → 블러 (캐릭터 그림은 그대로, 뒤 레이어만) */
function buildBlurredSilhouetteTex(source: HTMLCanvasElement, blurPx = 13): HTMLCanvasElement {
  const w = source.width;
  const h = source.height;
  const mask = document.createElement('canvas');
  mask.width = w;
  mask.height = h;
  const mctx = mask.getContext('2d')!;
  mctx.drawImage(source, 0, 0);
  mctx.globalCompositeOperation = 'source-in';
  mctx.fillStyle = '#000000';
  mctx.fillRect(0, 0, w, h);

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const octx = out.getContext('2d')!;
  octx.filter = `blur(${blurPx}px)`;
  octx.drawImage(mask, 0, 0);
  octx.filter = 'none';
  return out;
}


/** 손에 든 무기 — 오른쪽을 향함. 종류별(revolver/shotgun/drill) 실루엣 */
function drawGunCanvas(kind = 'revolver'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.translate(64, 64);

  if (kind === 'shotgun') {
    // 샷건 — 긴 이중 총열
    ctx.fillStyle = '#2a3140';
    ctx.beginPath();
    ctx.moveTo(-30, -7); ctx.lineTo(40, -9); ctx.lineTo(46, -3); ctx.lineTo(46, 3);
    ctx.lineTo(-6, 6); ctx.lineTo(-10, 22); ctx.lineTo(-24, 22); ctx.lineTo(-20, 4);
    ctx.lineTo(-30, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7BE8F4'; ctx.lineWidth = 4; ctx.stroke();
    // 이중 총열 분리선 + 총구
    ctx.strokeStyle = '#FFD600'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(44, -4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(46, -6); ctx.lineTo(54, -6); ctx.moveTo(46, 0); ctx.lineTo(54, 0); ctx.stroke();
    return canvas;
  }

  if (kind === 'drill') {
    // 드릴건 — 본체 + 앞쪽 원뿔 드릴
    ctx.fillStyle = '#2a3140';
    ctx.beginPath();
    ctx.moveTo(-28, -9); ctx.lineTo(18, -9); ctx.lineTo(18, 9); ctx.lineTo(-12, 9);
    ctx.lineTo(-16, 22); ctx.lineTo(-28, 22); ctx.lineTo(-24, 4); ctx.lineTo(-28, 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7BE8F4'; ctx.lineWidth = 4; ctx.stroke();
    // 드릴 원뿔(앞)
    ctx.fillStyle = '#FFD600';
    ctx.beginPath(); ctx.moveTo(18, -10); ctx.lineTo(50, 0); ctx.lineTo(18, 10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(24, -6); ctx.lineTo(40, 1); ctx.moveTo(24, 0); ctx.lineTo(44, 1); ctx.moveTo(24, 6); ctx.lineTo(40, 1); ctx.stroke();
    return canvas;
  }

  // 기본: 권총(리볼버)
  ctx.fillStyle = '#2a3140';
  ctx.beginPath();
  ctx.moveTo(-26, -8); ctx.lineTo(34, -8); ctx.lineTo(34, 4); ctx.lineTo(6, 4);
  ctx.lineTo(2, 22); ctx.lineTo(-14, 22); ctx.lineTo(-10, 4); ctx.lineTo(-26, 4);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7BE8F4'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = '#FFD600'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(34, -2); ctx.lineTo(46, -2); ctx.stroke();
  return canvas;
}

function drawIndicatorCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const cx = 0;
  const cy = 128;
  const R_out = 160; // 바깥쪽 아치 반경
  const R_in_base = 120; // 안쪽 톱니 골 반경
  const R_in_peak = 95; // 안쪽 톱니 산 반경
  
  // 톱니 호 그리기
  const startAngle = -Math.PI * 0.26;
  const endAngle = Math.PI * 0.26;
  const teethCount = 7; // 톱니 갯수

  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / 50);
    const factor = Math.sin(i / 50 * teethCount * Math.PI);
    const r = R_in_base - (R_in_base - R_in_peak) * (factor * 0.5 + 0.5);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  for (let i = 50; i >= 0; i--) {
    const angle = startAngle + (endAngle - startAngle) * (i / 50);
    const x = cx + Math.cos(angle) * R_out;
    const y = cy + Math.sin(angle) * R_out;
    ctx.lineTo(x, y);
  }
  ctx.closePath();

  // 반투명 네온 그린 채우기
  ctx.fillStyle = 'rgba(82, 255, 136, 0.20)';
  ctx.fill();

  // 바깥쪽 아치 라인 선명하게 스트로크
  ctx.strokeStyle = '#52FF88';
  ctx.lineWidth = 4.0;
  ctx.shadowColor = '#52FF88';
  ctx.shadowBlur = 10;
  
  ctx.beginPath();
  ctx.arc(cx, cy, R_out, startAngle, endAngle, false);
  ctx.stroke();
  
  // 안쪽 톱니 아치 라인 스트로크
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / 50);
    const factor = Math.sin(i / 50 * teethCount * Math.PI);
    const r = R_in_base - (R_in_base - R_in_peak) * (factor * 0.5 + 0.5);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.shadowBlur = 0;

  return canvas;
}




export class PlayerMesh {
  readonly group: THREE.Group;
  private body: THREE.Mesh;
  private hpBarBg: THREE.Mesh;
  private hpBarFill: THREE.Mesh;
  private light: THREE.PointLight;
  private aimIndicator: THREE.Mesh;
  private silhouetteShadow: THREE.Mesh | null = null;
  private ammoPips: THREE.Mesh[] = [];
  private weapon: THREE.Mesh | null = null;
  private weaponPivot: THREE.Group | null = null;
  private debuffParticles: THREE.Mesh[] = [];
  private buffParticles: THREE.Mesh[] = [];
  private exoShell: THREE.Mesh | null = null;
  private exoLevel = 0;
  private baseSize = 16;
  private moveSpeed = 0;
  private hopPhase = 0;
  private baseX = 0;
  private baseY = 0;

  private baseGlowIntensity = 1.0;
  private glowTimer = 0;

  private maxHp: number;
  private currentHp: number;
  private invincTimer = 0;
  private invincDuration = 0;
  private blinkTimer = 0;
  private blinkInterval = 0.15;
  private readonly visual: Map<string, number>;

  constructor(cfg: PlayerConfig, scene: THREE.Scene, visual: Map<string, number> = new Map()) {
    this.visual = visual;
    this.blinkInterval = this._pv('blink_interval_sec', 0.15);
    this.maxHp = cfg.max_hp;
    this.currentHp = cfg.max_hp;
    this.group = new THREE.Group();

    const s = cfg.geometry_size;
    const col = new THREE.Color(cfg.color_hex);

    this.baseSize = s;

    const spriteScale = this._pv('body_sprite_scale', 2.2);
    const canvasScale = this._pv('body_canvas_scale', 1.8);
    if (cfg.sprite_url) {
      const bodyGeo = new THREE.PlaneGeometry(s * spriteScale, s * spriteScale);
      const bodyMat = new THREE.MeshBasicMaterial({ map: null, transparent: true, alphaTest: 0.1 });
      this.body = new THREE.Mesh(bodyGeo, bodyMat);
      this.group.add(this.body);
      new THREE.TextureLoader().load(cfg.sprite_url, loaded => {
        bodyMat.map = loaded;
        bodyMat.needsUpdate = true;
        const img = loaded.image as HTMLImageElement;
        const src = document.createElement('canvas');
        src.width = img.naturalWidth || img.width;
        src.height = img.naturalHeight || img.height;
        src.getContext('2d')!.drawImage(img, 0, 0);
        this._attachSilhouetteShadow(src, bodyGeo, s);
      });
    } else {
      const bodyCanvas = drawBodyCanvas(cfg.color_hex);
      const bodyTex = new THREE.CanvasTexture(bodyCanvas);
      bodyTex.colorSpace = THREE.SRGBColorSpace;
      bodyTex.flipY = true;

      const bodyGeo = new THREE.PlaneGeometry(s * canvasScale, s * canvasScale);
      const bodyMat = new THREE.MeshBasicMaterial({ map: bodyTex, transparent: true, alphaTest: 0.02 });
      this.body = new THREE.Mesh(bodyGeo, bodyMat);
      this.group.add(this.body);
      this._attachSilhouetteShadow(bodyCanvas, bodyGeo, s);
    }

    /* ── 발광 포인트라이트 ── */
    this.baseGlowIntensity = cfg.glow_intensity;
    this.light = new THREE.PointLight(col, cfg.glow_intensity, s * 8);
    this.light.position.set(0, 0, 10);
    this.group.add(this.light);

    /* ── HP 바 배경 ── */
    const barW = s * this._pv('hp_bar_w_scale', 1.1);
    const barH = s * 0.1;
    const hpBarY = s * this._pv('hp_bar_y_scale', 0.9);
    const bgGeo = new THREE.PlaneGeometry(barW, barH);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.7 });
    this.hpBarBg = new THREE.Mesh(bgGeo, bgMat);
    this.hpBarBg.position.set(0, hpBarY, s * 0.25);
    this.group.add(this.hpBarBg);

    /* ── HP 바 채움 ── */
    const fillGeo = new THREE.PlaneGeometry(barW, barH);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0xFFD600 });
    this.hpBarFill = new THREE.Mesh(fillGeo, fillMat);
    this.hpBarFill.position.set(0, hpBarY, s * 0.3);
     this.group.add(this.hpBarFill);

    /* ── 기본 공격 탄창(쿨타임) 표시 — HP 바 바로 아래 노란 총알 핍 ── */
    const pipCount = Math.max(1, Math.round(this._pv('pip_count', 5)));
    const pipW = s * this._pv('pip_width_scale', 0.16);
    const pipH = s * this._pv('pip_height_scale', 0.11);
    const pipGap = s * this._pv('pip_gap_scale', 0.06);
    const totalW = pipCount * pipW + (pipCount - 1) * pipGap;
    const pipY = s * this._pv('pip_y_scale', 0.74);
    for (let i = 0; i < pipCount; i++) {
      const pg = new THREE.PlaneGeometry(pipW, pipH);
      const pm = new THREE.MeshBasicMaterial({ color: 0xFFC400, transparent: true, opacity: 1 });
      const pip = new THREE.Mesh(pg, pm);
      const x = -totalW / 2 + pipW / 2 + i * (pipW + pipGap);
      pip.position.set(x, pipY, s * 0.3);
      this.group.add(pip);
      this.ammoPips.push(pip);
    }

     // 조준선(Aim Indicator) 메쉬 생성 (네온 그린 톱니 아치)
     const indicatorCanvas = drawIndicatorCanvas();
     const indicatorTex = new THREE.CanvasTexture(indicatorCanvas);
     indicatorTex.colorSpace = THREE.SRGBColorSpace;
     const indicatorGeo = new THREE.PlaneGeometry(s * 2.2, s * 2.2);
     // 피벗이 (0, 128) 즉 좌측 수직 중앙이므로 지오메트리를 오른쪽으로 평행이동시켜 회전 축을 캐릭터 중심으로 맞춤
     indicatorGeo.translate(s * 1.05, 0, 0);
     
     const indicatorMat = new THREE.MeshBasicMaterial({
       map: indicatorTex,
       transparent: true,
       depthWrite: false,
       blending: THREE.AdditiveBlending,
       opacity: this._pv('aim_indicator_opacity', 0.5),
     });
     this.aimIndicator = new THREE.Mesh(indicatorGeo, indicatorMat);
     // 캐릭터 몸체 살짝 앞쪽에 배치
     this.aimIndicator.position.set(0, 0, 0.02);
     this.group.add(this.aimIndicator);

     /* ── 손에 든 총 (피벗 회전 → 발사 방향으로 캐릭터 주위를 돌며 조준) ── */
     const gunCanvas = drawGunCanvas();
     const gunTex = new THREE.CanvasTexture(gunCanvas);
     gunTex.colorSpace = THREE.SRGBColorSpace;
     const gunGeo = new THREE.PlaneGeometry(s * 0.8, s * 0.8);
    const gunMat = new THREE.MeshBasicMaterial({
      map: gunTex,
      transparent: true,
      depthWrite: false,
      depthTest: false, // 몸체 평면과 깊이 경합 방지: 총 실루엣을 안정적으로 표시
    });
     this.weapon = new THREE.Mesh(gunGeo, gunMat);
     // 총은 +x(오른쪽)를 향함. 피벗 중심에서 바깥쪽(+x)으로 오프셋 → 피벗 회전 시 총구가 바깥을 향함
     this.weapon.position.set(s * this._pv('weapon_offset_x_scale', 0.72), 0, -0.05);
    // 작은 총 형태가 장착 변경 시 확실히 식별되도록 몸체 앞 레이어에 렌더
    this.weapon.renderOrder = 2;
     this.weaponPivot = new THREE.Group();
     this.weaponPivot.add(this.weapon);
     this.group.add(this.weaponPivot);

     scene.add(this.group);
   }

  private _pv(key: string, def: number): number {
    const v = this.visual.get(key);
    return v === undefined ? def : v;
  }

  /** 본체 뒤·아래 — 블러 실루엣만 (네온 본체와 분리) */
  private _attachSilhouetteShadow(
    sourceCanvas: HTMLCanvasElement,
    bodyGeo: THREE.PlaneGeometry,
    s: number,
  ) {
    if (this.silhouetteShadow) {
      this.body.remove(this.silhouetteShadow);
      this.silhouetteShadow.geometry.dispose();
      const old = this.silhouetteShadow.material as THREE.MeshBasicMaterial;
      if (old.map) old.map.dispose();
      old.dispose();
      this.silhouetteShadow = null;
    }

    const silCanvas = buildBlurredSilhouetteTex(sourceCanvas, this._pv('silhouette_blur_px', 14));
    const silTex = new THREE.CanvasTexture(silCanvas);
    silTex.colorSpace = THREE.SRGBColorSpace;
    silTex.flipY = true;
    const silMat = new THREE.MeshBasicMaterial({
      map: silTex,
      transparent: true,
      opacity: this._pv('silhouette_opacity', 0.52),
      depthWrite: false,
      alphaTest: 0.02,
    });
    this.silhouetteShadow = new THREE.Mesh(bodyGeo, silMat);
    this.silhouetteShadow.position.set(0, s * this._pv('silhouette_y_scale', -0.22), -0.2);
    this.silhouetteShadow.renderOrder = -1;
    this.body.add(this.silhouetteShadow);
  }

   setPosition(x: number, y: number) {
     this.baseX = x;
     this.baseY = y;
     this.group.position.set(x, y, 0);
   }

   /** 화면에서 보이는 상하 바운스(탑뷰 → 월드 Y) */
   private _moveThreshold(): number {
     return this._pv('move_speed_threshold', 0.05);
   }

   private _hopOffsetY(): number {
     const s = this.baseSize;
     if (this.moveSpeed > this._moveThreshold()) {
       const t = Math.max(0, Math.sin(this.hopPhase));
       return t * t * (s * this._pv('hop_base_scale', 0.04) + this.moveSpeed * s * this._pv('hop_speed_scale', 0.012));
     }
     return Math.sin(performance.now() * this._pv('idle_float_freq', 0.002)) * s * this._pv('idle_float_amp_scale', 0.008);
   }

   private _applyHopPose(hopY: number) {
     const s = this.baseSize;
     const moving = this.moveSpeed > this._moveThreshold();
     const t = moving ? Math.max(0, Math.sin(this.hopPhase)) : 0;
     const squash = 1 - this._pv('hop_squash_scale', 0.03) * (1 - t);

     this.body.position.set(0, hopY, 0);
     const flipX = this.body.scale.x < 0 ? -1 : 1;
     this.body.scale.set(flipX, squash, 1);

     this.aimIndicator.position.set(0, hopY, 0.02);
     if (this.weaponPivot) this.weaponPivot.position.set(0, hopY, 0);
     const hpBarY = s * this._pv('hp_bar_y_scale', 0.9);
     this.hpBarBg.position.set(0, hpBarY + hopY, s * 0.25);
     this.hpBarFill.position.set(this.hpBarFill.position.x, hpBarY + hopY, s * 0.3);
     const pipY = s * this._pv('pip_y_scale', 0.74) + hopY;
     for (const pip of this.ammoPips) {
       pip.position.y = pipY;
     }
     this.light.position.set(0, hopY, 10);
   }
 
   /* vx, vy 기반으로 캐릭터 반전 및 총/조준선 360도 회전 */
   setDirection(vx: number, vy: number) {
     this.moveSpeed = Math.sqrt(vx * vx + vy * vy);
     if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return;
 
     // 이동 방향 조준선 각도 계산 및 회전
     const theta = Math.atan2(vy, vx);
     this.aimIndicator.rotation.z = theta;
 
     // Z축 회전을 원천 고정하여 물구나무 버그 해결
     this.body.rotation.z = 0;
 
     // 본체는 좌우만 scale.x를 뒤집어 Flip
     if (vx < -0.01) {
      this.body.scale.x = -1;
    } else if (vx > 0.01) {
      this.body.scale.x = 1;
    }




  }

  /* 무기 장착 여부 → 손에 든 총 표시/숨김 */
  setWeaponEquipped(equipped: boolean) {
    if (this.weaponPivot) this.weaponPivot.visible = equipped;
  }

  /* 장착 무기 종류에 따라 손에 든 총 모양 교체 (revolver/shotgun/drill) */
  setWeaponType(kind: string) {
    if (!this.weapon) return;
    const mat = this.weapon.material as THREE.MeshBasicMaterial;
    const tex = new THREE.CanvasTexture(drawGunCanvas(kind));
    tex.colorSpace = THREE.SRGBColorSpace;
    if (mat.map) mat.map.dispose();
    mat.map = tex;
    mat.needsUpdate = true;
  }

  /* 탄창 용량이 바뀌면 핍 개수를 재구성 */
  setMagazineCapacity(cap: number) {
    const target = Math.max(1, Math.min(12, cap));
    if (this.ammoPips.length === target) return;

    /* 기존 핍 제거 */
    for (const pip of this.ammoPips) {
      this.group.remove(pip);
      pip.geometry.dispose();
      (pip.material as THREE.Material).dispose();
    }
    this.ammoPips = [];

    /* 새 핍 생성 */
    const s = this.baseSize;
    const pipW = Math.min(s * this._pv('pip_width_scale', 0.16) * 1.125, s * 1.0 / target * 0.8);
    const pipH = s * this._pv('pip_height_scale', 0.11);
    const pipGap = pipW * 0.35;
    const totalW = target * pipW + (target - 1) * pipGap;
    const pipY = s * this._pv('pip_y_scale', 0.74);
    for (let i = 0; i < target; i++) {
      const pg = new THREE.PlaneGeometry(pipW, pipH);
      const pm = new THREE.MeshBasicMaterial({ color: 0xFFC400, transparent: true, opacity: 1 });
      const pip = new THREE.Mesh(pg, pm);
      const x = -totalW / 2 + pipW / 2 + i * (pipW + pipGap);
      pip.position.set(x, pipY, s * 0.3);
      this.group.add(pip);
      this.ammoPips.push(pip);
    }
  }

  /* 기본 공격 탄수/쿨타임 진행도(0→1)에 따라 탄창 핍 채우기 */
  setBasicCooldown(pct: number) {
    const n = this.ammoPips.length;
    if (n === 0) return;
    const lit = Math.round(Math.max(0, Math.min(1, pct)) * n);
    for (let i = 0; i < n; i++) {
      const mat = this.ammoPips[i].material as THREE.MeshBasicMaterial;
      if (i < lit) { mat.color.setHex(0xFFC400); mat.opacity = 1; }
      else         { mat.color.setHex(0x554a1a); mat.opacity = 0.5; }
    }
  }

  /* 발사 방향으로 총 조준 회전 (캐릭터 주위를 돌며 총구가 발사 방향을 향함) */
  setWeaponAngle(theta: number) {
    if (!this.weaponPivot) return;
    this.weaponPivot.rotation.z = theta;
    // 왼쪽을 향할 땐 상하 미러 → 총이 뒤집혀(거꾸로) 보이지 않게 총대 방향 정상화
    if (this.weapon) this.weapon.scale.y = Math.cos(theta) < 0 ? -1 : 1;
  }

  /* HP 업데이트 → 바 색상 + 크기 */
  setHp(hp: number) {
    this.currentHp = Math.max(0, hp);
    const pct = this.currentHp / this.maxHp;
    const s = 1.0; // 기본 스케일 값 매칭
    const barW = s * 1.1;

    // 크기 조정 (좌측 정렬 효과)
    this.hpBarFill.scale.x = Math.max(pct, 0.01);
    this.hpBarFill.position.x = -barW * (1 - pct) / 2;

    // 색상: 50% 이하 → 빨강
    const mat = this.hpBarFill.material as THREE.MeshBasicMaterial;
    mat.color.set(pct <= this._pv('hp_bar_low_pct', 0.5) ? 0xFF6680 : 0xFFD600);
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
        const mat = this.body.material as THREE.MeshBasicMaterial;
        const blinkLow = this._pv('invinc_blink_low_opacity', 0.3);
        const next = mat.opacity < 0.9 ? 1.0 : blinkLow;
        mat.opacity = next;
        if (this.silhouetteShadow) {
          const silOp = this._pv('silhouette_opacity', 0.52);
          const silLow = this._pv('invinc_shadow_low_opacity', 0.18);
          (this.silhouetteShadow.material as THREE.MeshBasicMaterial).opacity = next < 0.9 ? silOp : silLow;
        }
      }
      if (this.invincTimer <= 0) {
        const mat = this.body.material as THREE.MeshBasicMaterial;
        mat.opacity = 1.0;
        if (this.silhouetteShadow) {
          (this.silhouetteShadow.material as THREE.MeshBasicMaterial).opacity = this._pv('silhouette_opacity', 0.52);
        }
      }
    }

    /* 이동 시 Y축 콩콩 스텝 (탑뷰에서 보이도록), 정지 시 미세 부유 */
    if (this.moveSpeed > this._moveThreshold()) {
      this.hopPhase += dt * (this._pv('hop_phase_speed_base', 8) + this.moveSpeed * this._pv('hop_phase_speed_per_move', 5)) * Math.PI * 2;
    } else {
      this.hopPhase = 0;
    }
    this.group.position.set(this.baseX, this.baseY, 0);
    this._applyHopPose(this._hopOffsetY());

    const glowPeriod = this._pv('glow_pulse_period_sec', 3);
    const glowFlash = this._pv('glow_pulse_flash_sec', 0.6);
    const glowPeak = this._pv('glow_pulse_mult_peak', 3);
    this.glowTimer += dt;
    if (this.glowTimer >= glowPeriod) {
      this.glowTimer = 0;
    }
    let flash = 1.0;
    if (this.glowTimer < glowFlash) {
      const t = this.glowTimer / glowFlash;
      flash = 1.0 + (glowPeak - 1) * Math.pow(1.0 - t, 2);
    }
    this.light.intensity = this.baseGlowIntensity * flash;

    if (this.exoShell) {
      this.exoShell.position.z = 0;
      const shellMat = this.exoShell.material as THREE.MeshBasicMaterial;
      const pulse = this._pv('exo_pulse_mid', 0.9) + Math.sin(performance.now() * 0.005) * this._pv('exo_pulse_amp', 0.1);
      shellMat.opacity = (this._pv('exo_opacity_base', 0.16) + this.exoLevel * this._pv('exo_opacity_per_level', 0.05)) * pulse;
    }

    /* 디버프 공전 파티클 회전 */
    if (this.debuffParticles.length > 0) {
      const s = this.baseSize;
      const now = performance.now() * 0.001;
      this.debuffParticles.forEach((p, idx) => {
        const custom = p as any;
        custom.angle += dt * custom.speed;
        
        // 타원 궤도 회전
        const x = Math.cos(custom.angle) * custom.radius;
        const y = Math.sin(custom.angle) * custom.radius + Math.sin(now * 3 + idx) * s * 0.08;
        const z = s * 0.15 + Math.cos(custom.angle * 0.5) * s * 0.1;
        p.position.set(x, y, z);
        
        // 약간의 크기 맥동
        const scaleVal = 0.85 + Math.sin(now * 5 + idx) * 0.15;
        p.scale.set(scaleVal, scaleVal, scaleVal);
      });
    }

    /* 버프 상승 파티클 루프 */
    if (this.buffParticles.length > 0) {
      const s = this.baseSize;
      this.buffParticles.forEach(p => {
        const custom = p as any;
        custom.life += dt * 1.2; // 수명 증가
        if (custom.life > 1.0) {
          // 리셋하여 하단에서 다시 상승 시작
          custom.life = 0;
          p.position.set(
            (Math.random() - 0.5) * s * 0.8,
            -s * 0.5 - Math.random() * s * 0.2,
            s * 0.15 + (Math.random() * s * 0.1)
          );
          custom.speedY = s * (0.8 + Math.random() * 0.6);
          custom.speedX = (Math.random() - 0.5) * s * 0.25;
        }
        
        // 위로 상승
        p.position.y += custom.speedY * dt;
        p.position.x += custom.speedX * dt;
        
        // 투명도 조절: 상승함에 따라 투명해짐
        const mat = p.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(custom.life * Math.PI) * 0.85; // 피크 찍고 양끝 투명화
        
        // 크기도 커지며 흐려지게
        const scaleVal = 0.5 + custom.life * 0.7;
        p.scale.set(scaleVal, scaleVal, scaleVal);
      });
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
      const s = this.baseSize;
      const shellScale = this._pv('exo_shell_scale', 1.16);
      const shellGeo = new THREE.PlaneGeometry(s * shellScale, s * shellScale);

      // 외각으로 갈수록 투명해지는 Radial 그라데이션 텍스처로 사각형 경계 버그 제거
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 64;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, '#c099ff');
        g.addColorStop(0.5, '#7be8f4');
        g.addColorStop(1, 'rgba(123, 232, 244, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(cvs);
      tex.needsUpdate = true;

      const shellMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: this._pv('exo_create_opacity', 0.22),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.exoShell = new THREE.Mesh(shellGeo, shellMat);
      
      const depth = (this.body.geometry as THREE.PlaneGeometry).parameters?.width ?? s;
      this.exoShell.position.set(0, 0, depth * this._pv('exo_depth_z_scale', 0.05));
      this.body.add(this.exoShell);
    }
  }

  setDebuffState(active: boolean) {
    if (active) {
      if (this.debuffParticles.length === 0) {
        const s = this.baseSize;
        const count = Math.max(1, Math.round(this._pv('debuff_particle_count', 5)));
        const particleGeo = new THREE.SphereGeometry(s * this._pv('debuff_particle_geo_scale', 0.08), 6, 6);
        const colors = [0x9900ff, 0x673ab7, 0x4a148c];
        
        for (let i = 0; i < count; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            transparent: true,
            opacity: 0.8,
          });
          const mesh = new THREE.Mesh(particleGeo, mat);
          
          // 공전 반경, 속도, 위상 등을 커스텀 속성으로 설정
          (mesh as any).radius = s * (this._pv('debuff_particle_radius_base', 0.35) + i * this._pv('debuff_particle_radius_step', 0.08));
          (mesh as any).angle = (i * Math.PI * 2) / count;
          (mesh as any).speed = this._pv('debuff_particle_orbit_speed_base', 2.5) + i * this._pv('debuff_particle_orbit_speed_step', 0.6);
          (mesh as any).yOffset = (Math.random() - 0.5) * s * 0.3;
          
          this.body.add(mesh);
          this.debuffParticles.push(mesh);
        }
      }
    } else {
      if (this.debuffParticles.length > 0) {
        for (const p of this.debuffParticles) {
          this.body.remove(p);
          p.geometry.dispose();
          if (Array.isArray(p.material)) {
            p.material.forEach(m => m.dispose());
          } else {
            p.material.dispose();
          }
        }
        this.debuffParticles = [];
      }
    }
  }

  setBuffState(active: boolean) {
    if (active) {
      if (this.buffParticles.length === 0) {
        const s = this.baseSize;
        const particleGeo = new THREE.BoxGeometry(s * 0.08, s * 0.08, s * 0.08);
        const colors = [0xFFD700, 0x52FF88, 0xFFEB3B];
        
        for (let i = 0; i < 6; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            transparent: true,
            opacity: 0,
          });
          const mesh = new THREE.Mesh(particleGeo, mat);
          
          // 초기 위치 랜덤화 (발밑 부근)
          mesh.position.set(
            (Math.random() - 0.5) * s * 0.8,
            -s * 0.5 - Math.random() * s * 0.2,
            s * 0.15 + (Math.random() * s * 0.1)
          );
          
          (mesh as any).speedY = s * (0.8 + Math.random() * 0.6);
          (mesh as any).speedX = (Math.random() - 0.5) * s * 0.25;
          (mesh as any).life = Math.random(); // 0~1 사이 랜덤 딜레이
          
          this.body.add(mesh);
          this.buffParticles.push(mesh);
        }
      }
    } else {
      if (this.buffParticles.length > 0) {
        for (const p of this.buffParticles) {
          this.body.remove(p);
          p.geometry.dispose();
          if (Array.isArray(p.material)) {
            p.material.forEach(m => m.dispose());
          } else {
            p.material.dispose();
          }
        }
        this.buffParticles = [];
      }
    }
  }

  dispose(scene: THREE.Scene) {
    this.setDebuffState(false);
    this.setBuffState(false);
    this.setExoskeletonLevel(0);

    if (this.silhouetteShadow) {
      this.silhouetteShadow.geometry.dispose();
      const silMat = this.silhouetteShadow.material as THREE.MeshBasicMaterial;
      if (silMat.map) silMat.map.dispose();
      silMat.dispose();
      this.silhouetteShadow = null;
    }

    if (this.body.geometry) this.body.geometry.dispose();
    if (this.body.material) {
      const mat = this.body.material as THREE.MeshBasicMaterial;
      if (mat.map) mat.map.dispose();
      mat.dispose();
    }

    scene.remove(this.group);
  }
}
