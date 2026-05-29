/**
 * Renderer3D.ts — Three.js 씬 세팅
 * OrthographicCamera + Bloom + 아이소메트릭 그리드 + 조명
 * 명령형 유지 (GAME.md 원칙)
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { MapConfig, VfxConfig } from '../game/data';

export class Renderer3D {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.OrthographicCamera;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private animId = 0;
  private onFrameCb: ((dt: number) => void) | null = null;
  private lastTime = 0;
  private resizeObserver: ResizeObserver | null = null;
  private readonly onWindowResize = () => this._onResize();

  /* 환경 조명 — 보스 등장 시 교체 */
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private ambientTween: { from: THREE.Color; to: THREE.Color; t: number; dur: number } | null = null;
  private usePostFx = false;
  private readonly viewScale = 4.0; // 현재 대비 2배 추가 줌아웃
  private baseCameraHalfHeight = 60;
  private floorMeshes: THREE.Object3D[] = [];

  /* 카메라 경계 */
  private mapHalfW = 1500;
  private mapHalfH = 1500;

  constructor(
    canvas: HTMLCanvasElement,
    mapCfg: MapConfig,
    vfxCfg: VfxConfig,
    initialW?: number,
    initialH?: number,
  ) {
    this.mapHalfW = mapCfg.map_width / 2;
    this.mapHalfH = mapCfg.map_height / 2;
    this.baseCameraHalfHeight = Math.max(1, mapCfg.camera_zoom);

    /* ── WebGLRenderer ── */
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(parseInt(mapCfg.floor_color_hex.slice(1), 16), 1);

    const { w, h } = this._resolveViewportSize(canvas, initialW, initialH);

    /* ── Scene ── */
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(mapCfg.floor_color_hex);

    /* ── OrthographicCamera — camera_zoom 기준 반응형 ── */
    const initialHalfH = this.baseCameraHalfHeight * this.viewScale;
    const initialHalfW = initialHalfH * (w / h);
    this.camera = new THREE.OrthographicCamera(
      -initialHalfW, initialHalfW, initialHalfH, -initialHalfH, 0.1, 2000
    );
    /* lookAt(0,0,0) 사용 시 추적 이동 후 시야가 틀어짐 → Z축 탑다운만 유지 */
    this.camera.position.set(0, 0, 500);
    this.camera.up.set(0, 1, 0);
    this.camera.rotation.set(0, 0, 0);

    /* ── Bloom ── */
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      vfxCfg.bloom_strength,
      vfxCfg.bloom_radius,
      vfxCfg.bloom_threshold,
    );
    this.composer.addPass(this.bloomPass);
    this._applyViewport(w, h);

    /* ── 조명 ── */
    const ambCol = new THREE.Color(mapCfg.ambient_light_color);
    this.ambientLight = new THREE.AmbientLight(ambCol, mapCfg.ambient_light_intensity);
    this.scene.add(this.ambientLight);

    const dirCol = new THREE.Color(mapCfg.dir_light_color);
    this.dirLight = new THREE.DirectionalLight(dirCol, mapCfg.dir_light_intensity);
    this.dirLight.position.set(0, 1, 1);
    this.scene.add(this.dirLight);

    /* ── 올림픽 스타디움 테마 바닥 레이아웃 ── */
    this._buildStadiumFloor(mapCfg);

    /* ── 맵 경계 ── */
    this._buildBoundary(mapCfg);

    /* ── 리사이즈: 캔버스 실제 레이아웃 크기 추적 (window만으로는 부족) ── */
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this._onResize());
      this.resizeObserver.observe(canvas);
    }
    window.addEventListener('resize', this.onWindowResize);
  }

  /** App.tsx에서 레이아웃 직후 명시적 크기 주입 */
  setViewportSize(w: number, h: number) {
    if (w > 0 && h > 0) this._applyViewport(w, h);
  }

  private _resolveViewportSize(
    canvas: HTMLCanvasElement,
    initialW?: number,
    initialH?: number,
  ): { w: number; h: number } {
    const w = initialW && initialW > 0
      ? initialW
      : (canvas.clientWidth || canvas.width || 0);
    const h = initialH && initialH > 0
      ? initialH
      : (canvas.clientHeight || canvas.height || 0);
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }

  private _applyViewport(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.composer?.setSize(w, h);
    this.bloomPass?.setSize(w, h);
    const halfH = this.baseCameraHalfHeight * this.viewScale;
    const halfW = halfH * (w / h);
    this.camera.left   = -halfW;
    this.camera.right  =  halfW;
    this.camera.top    =  halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
  }

  /* ── 올림픽 스타디움 테마 바닥 레이아웃 ── */
  private _buildStadiumFloor(cfg: MapConfig) {
    const hw = this.mapHalfW;
    const hh = this.mapHalfH;
    const SEGS = 80; // 타원 분할 수

    // ── 1. 전체 배경: 외부/관중석 영역 (#4D5262 인도 색)
    const bgGeo = new THREE.PlaneGeometry(hw * 2, hh * 2);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x4D5262 });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -2.0);
    this.scene.add(bgMesh);
    this.floorMeshes.push(bgMesh);

    // ── 2. 트랙 도넛 (외곽 타원 - 내부 타원 hole = 달리기 트랙)
    //        색상: #2A2E3D (도로 색)
    const outerRX = 900;
    const outerRY = 580;
    const innerRX = 680;
    const innerRY = 400;

    const trackShape = new THREE.Shape();
    trackShape.absellipse(0, 0, outerRX, outerRY, 0, Math.PI * 2, false, 0);
    const innerPath = new THREE.Path();
    innerPath.absellipse(0, 0, innerRX, innerRY, 0, Math.PI * 2, true, 0);
    trackShape.holes.push(innerPath);

    const trackGeo = new THREE.ShapeGeometry(trackShape, SEGS);
    const trackMat = new THREE.MeshBasicMaterial({ color: 0x2A2E3D });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.position.set(0, 0, -1.5);
    this.scene.add(trackMesh);
    this.floorMeshes.push(trackMesh);

    // ── 3. 중앙 인필드 (트랙 안쪽 = 경기장 필드)
    //        색상: #4D5262 (인도 색)
    const fieldShape = new THREE.Shape();
    fieldShape.absellipse(0, 0, innerRX, innerRY, 0, Math.PI * 2, false, 0);
    const fieldGeo = new THREE.ShapeGeometry(fieldShape, SEGS);
    const fieldMat = new THREE.MeshBasicMaterial({ color: 0x4D5262 });
    const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
    fieldMesh.position.set(0, 0, -1.5);
    this.scene.add(fieldMesh);
    this.floorMeshes.push(fieldMesh);

    // ── 4. 인필드 촘촘한 격자 (간격 30으로 촘촘하게)
    const interval = 30;
    const gridColor = new THREE.Color(cfg.grid_color_hex);
    const gridPts: number[] = [];
    for (let x = -innerRX; x <= innerRX; x += interval) {
      gridPts.push(x, -innerRY, -1.3, x, innerRY, -1.3);
    }
    for (let y = -innerRY; y <= innerRY; y += interval) {
      gridPts.push(-innerRX, y, -1.3, innerRX, y, -1.3);
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: gridColor,
      transparent: true,
      opacity: 0.18
    });
    const fieldGrid = new THREE.LineSegments(gridGeo, gridMat);
    this.scene.add(fieldGrid);
    this.floorMeshes.push(fieldGrid);

    // ── 5. 인필드 장식 — 공용 라인 머티리얼
    const decoMat = new THREE.LineBasicMaterial({
      color: 0x6A7588,
      transparent: true,
      opacity: 0.55
    });

    // 5-a. 센터 서클 (반지름 120)
    const centerCircle = new THREE.EllipseCurve(0, 0, 120, 120, 0, Math.PI * 2, false, 0);
    const ccPts = centerCircle.getPoints(64).map(p => new THREE.Vector3(p.x, p.y, -1.2));
    const ccGeo = new THREE.BufferGeometry().setFromPoints(ccPts);
    const ccLine = new THREE.LineLoop(ccGeo, decoMat);
    this.scene.add(ccLine);
    this.floorMeshes.push(ccLine);

    // 5-b. 가로 중앙선 (인필드 폭 전체)
    const hLinePts = [
      new THREE.Vector3(-innerRX, 0, -1.2),
      new THREE.Vector3( innerRX, 0, -1.2),
    ];
    const hLineGeo = new THREE.BufferGeometry().setFromPoints(hLinePts);
    const hLine = new THREE.Line(hLineGeo, decoMat);
    this.scene.add(hLine);
    this.floorMeshes.push(hLine);

    // 5-c. 세로 중앙선 (인필드 높이 전체)
    const vLinePts = [
      new THREE.Vector3(0, -innerRY, -1.2),
      new THREE.Vector3(0,  innerRY, -1.2),
    ];
    const vLineGeo = new THREE.BufferGeometry().setFromPoints(vLinePts);
    const vLine = new THREE.Line(vLineGeo, decoMat);
    this.scene.add(vLine);
    this.floorMeshes.push(vLine);

    // 5-d. 4 코너 아크 (반지름 200, 각 모서리 90도 호)
    const arcR = 200;
    const corners: [number, number, number, number][] = [
      [-innerRX,  innerRY,  0,        Math.PI * 0.5],  // 좌상
      [ innerRX,  innerRY,  Math.PI * 0.5, Math.PI],   // 우상
      [ innerRX, -innerRY,  Math.PI,   Math.PI * 1.5],  // 우하
      [-innerRX, -innerRY,  Math.PI * 1.5, Math.PI * 2], // 좌하
    ];
    for (const [cx, cy, startA, endA] of corners) {
      const arc = new THREE.EllipseCurve(cx, cy, arcR, arcR, startA, endA, false, 0);
      const arcPts = arc.getPoints(24).map(p => new THREE.Vector3(p.x, p.y, -1.2));
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
      const arcLine = new THREE.Line(arcGeo, decoMat);
      this.scene.add(arcLine);
      this.floorMeshes.push(arcLine);
    }

    // 5-e. 센터 스팟 (중앙 작은 원, 반지름 20)
    const spotCircle = new THREE.EllipseCurve(0, 0, 20, 20, 0, Math.PI * 2, false, 0);
    const spotPts = spotCircle.getPoints(32).map(p => new THREE.Vector3(p.x, p.y, -1.2));
    const spotGeo = new THREE.BufferGeometry().setFromPoints(spotPts);
    const spotLine = new THREE.LineLoop(spotGeo, decoMat);
    this.scene.add(spotLine);
    this.floorMeshes.push(spotLine);
  }

  /* ── 맵 경계 사각형 ── */
  private _buildBoundary(cfg: MapConfig) {
    const hw = this.mapHalfW;
    const hh = this.mapHalfH;
    const pts = [
      -hw, -hh, 0,   hw, -hh, 0,
       hw, -hh, 0,   hw,  hh, 0,
       hw,  hh, 0,  -hw,  hh, 0,
      -hw,  hh, 0,  -hw, -hh, 0,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const col = new THREE.Color(cfg.boundary_color_hex);
    const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: cfg.boundary_opacity });
    this.scene.add(new THREE.LineSegments(geo, mat));
  }

  /* ── 카메라 플레이어 추적 ── */
  followPlayer(px: number, py: number) {
    /* 경계 클램핑 */
    const hw = this.mapHalfW;
    const hh = this.mapHalfH;
    const vw = (this.camera.right - this.camera.left) / 2;
    const vh = (this.camera.top  - this.camera.bottom) / 2;

    const cx = Math.max(-hw + vw, Math.min(hw - vw, px));
    const cy = Math.max(-hh + vh, Math.min(hh - vh, py));

    this.camera.position.set(cx, cy, 500);
  }

  /* ── 보스 등장 시 조명 전환 ── */
  startBossAmbient(bossColor: string, durationSec: number) {
    this.ambientTween = {
      from: this.ambientLight.color.clone(),
      to:   new THREE.Color(bossColor),
      t: 0,
      dur: durationSec,
    };
  }

  /* ── Bloom 강도 동적 변경 ── */
  setBloom(strength: number, radius: number) {
    this.bloomPass.strength = strength;
    this.bloomPass.radius   = radius;
  }

  /* ── 게임 루프 ── */
  setOnFrame(cb: (dt: number) => void) { this.onFrameCb = cb; }

  start() {
    this.lastTime = performance.now();
    const loop = (now: number) => {
      this.animId = requestAnimationFrame(loop);
      const dt = Math.min((now - this.lastTime) / 1000, 0.05); // max 50ms
      this.lastTime = now;

      /* 조명 트윈 */
      if (this.ambientTween) {
        this.ambientTween.t += dt;
        const k = Math.min(this.ambientTween.t / this.ambientTween.dur, 1);
        this.ambientLight.color.lerpColors(this.ambientTween.from, this.ambientTween.to, k);
        if (k >= 1) this.ambientTween = null;
      }

      this.onFrameCb?.(dt);
      if (this.usePostFx) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.animId);
  }

  dispose() {
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener('resize', this.onWindowResize);
    // 바닥 도시 메쉬 리소스 해제
    for (const obj of this.floorMeshes) {
      this.scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      } else if (obj instanceof THREE.Line) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
    this.floorMeshes = [];

    this.composer.dispose();
    this.renderer.dispose();
  }

  private _onResize() {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    this._applyViewport(w, h);
  }
}
