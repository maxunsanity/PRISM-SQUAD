import * as THREE from 'three';
import Matter from 'matter-js';
import { LoadedGameData } from './loadGameData';
import { buildBoard, BOARD_CONSTANTS } from './boardBuilder';
import { GameActions } from './gameControlBridge';
import { syncHud } from './hudExternalStore';
import { milestoneStore } from './milestoneStore';
import { BankPlayer } from './bankPlayer';
import { gameStore } from './gameStore';
import { rewardModalStore } from './rewardModalStore';

export class PrizeDrop implements GameActions {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private viewWidth: number;
  private viewHeight: number;

  private bankPlayer: BankPlayer;
  private isReady = false;
  /** 착지 전까지 추가 드롭 1회만 허용 */
  private dropBusy = false;

  // 게임 상태
  private session_lightning = 0;
  private currentMultiplier = 1;
  private milestonesCleared: boolean[];
  private cycleCount = 0;
  private rewardMeshes: { 
    mesh: THREE.Mesh, 
    outline: THREE.Mesh, 
    ripples: THREE.Mesh[], 
    originalRadius: number, 
    lastHitTime: number 
  }[] = [];

  constructor(container: HTMLElement, private data: LoadedGameData) {
    this.viewWidth = container.clientWidth || BOARD_CONSTANTS.WIDTH;
    this.viewHeight = container.clientHeight || BOARD_CONSTANTS.HEIGHT;
    this.milestonesCleared = data.milestones.map(() => false);

    // Three.js 설정
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f0f0e8');

    this.camera = new THREE.OrthographicCamera(
      0, this.viewWidth,
      this.viewHeight, 0,
      -1000, 1000
    );
    this.camera.position.set(0, 0, 500);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.viewWidth, this.viewHeight, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.bankPlayer = new BankPlayer(this.scene, this.viewHeight);

    this.initBoard();
    this.startRenderLoop();
    this.initHud();

    // 뱅크 비동기 로드 — 로드 완료 시 isReady=true
    this.bankPlayer.loadAll().then(() => {
      this.isReady = true;
      console.log('PrizeDrop: 뱅크 로드 완료, 드롭 가능');
    });

    console.log('PrizeDrop 초기화 완료 — W:', this.viewWidth, 'H:', this.viewHeight);
  }

  // ── 보드 시각화 (Matter.js는 좌표 참조 용도만) ────────────────
  private initBoard() {
    // Matter.js 엔진은 보드 시각화를 위한 좌표 계산에만 사용
    const engine = Matter.Engine.create();
    const bodies = buildBoard(this.data);
    Matter.Composite.add(engine.world, [
      ...bodies.pins, ...bodies.obstacles,
      ...bodies.slots, ...bodies.boundaries,
    ]);

    const { HEIGHT } = BOARD_CONSTANTS;
    const pinGroup = new THREE.Group();
    const obstacleGroup = new THREE.Group();
    this.scene.add(pinGroup, obstacleGroup);

    // 핀 렌더링
    const pinGeo = new THREE.CircleGeometry(BOARD_CONSTANTS.PIN_RADIUS, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: '#d1d1c1' });
    const pinEdgeMat = new THREE.MeshBasicMaterial({ color: '#1a1a1a' });

    bodies.pins.forEach(body => {
      if (body.label === 'separator_pin') return; // 슬롯 구분선 위 핀은 렌더링 제외

      const mesh = new THREE.Mesh(pinGeo, pinMat);
      mesh.position.set(body.position.x, HEIGHT - body.position.y, 5);
      pinGroup.add(mesh);

      const outlineGeo = new THREE.CircleGeometry(BOARD_CONSTANTS.PIN_RADIUS + 0.5, 16);
      const outlineMesh = new THREE.Mesh(outlineGeo, pinEdgeMat);
      outlineMesh.position.set(body.position.x, HEIGHT - body.position.y, 4.9);
      pinGroup.add(outlineMesh);
    });

    // 구분선(separator) 렌더링
    bodies.boundaries.forEach(body => {
      if (body.label === 'separator') {
        const { min, max } = body.bounds;
        const h = max.y - min.y;
        const geo = new THREE.PlaneGeometry(8, h);
        const mat = new THREE.MeshBasicMaterial({ color: '#1a1a1a', transparent: true, opacity: 0.15 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(body.position.x, HEIGHT - body.position.y, 1);
        pinGroup.add(mesh);
      }
    });

    // obstacle_id → CSV 데이터 매핑 (sprite_url 조회용)
    const obstacleDataMap = new Map(this.data.obstacles.map(o => [o.obstacle_id, o]));
    const texLoader = new THREE.TextureLoader();

    // 장애물 렌더링
    bodies.obstacles.forEach((body: any) => {
      const cx = body.position.x;
      const cy = HEIGHT - body.position.y;
      const csvData = obstacleDataMap.get(body.id as string);
      const spriteUrl = csvData?.sprite_url ?? '';

      if (body.label === 'reward') {
        const r = body.circleRadius || 30;

        let rewardMesh: THREE.Mesh;
        if (spriteUrl) {
          // sprite_url 있으면 텍스처 평면으로 교체
          const tex = texLoader.load(spriteUrl);
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, depthWrite: false });
          rewardMesh = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), mat);
        } else {
          rewardMesh = new THREE.Mesh(
            new THREE.CircleGeometry(r, 32),
            new THREE.MeshBasicMaterial({ color: '#ffffff' })
          );
        }
        rewardMesh.position.set(cx, cy, 2);
        obstacleGroup.add(rewardMesh);

        const outlineGeo = new THREE.RingGeometry(r - 1.5, r + 1.5, 32);
        const outline = new THREE.Mesh(outlineGeo, new THREE.MeshBasicMaterial({ color: '#1a1a1a', side: THREE.DoubleSide }));
        outline.position.set(cx, cy, spriteUrl ? 1.9 : 2.1);
        if (!spriteUrl) obstacleGroup.add(outline);

        // 애니메이션 관리를 위해 저장 (리플 라인 추가)
        const ripples: THREE.Mesh[] = [];
        const rippleGeo = new THREE.RingGeometry(r - 1, r, 32);
        const rippleMat = new THREE.MeshBasicMaterial({ color: '#1a1a1a', transparent: true, opacity: 0 });

        for (let i = 0; i < 2; i++) {
          const ripple = new THREE.Mesh(rippleGeo, rippleMat.clone());
          ripple.position.set(cx, cy, 2.05);
          ripple.visible = false;
          obstacleGroup.add(ripple);
          ripples.push(ripple);
        }

        this.rewardMeshes.push({ mesh: rewardMesh, outline, ripples, originalRadius: r, lastHitTime: 0 });
      } else if (body.label === 'obstacle' || body.label === 'bumper') {
        const vCount = body.vertices?.length ?? 4;
        const r = body.originalRadius ?? (vCount === 3 ? 24 : 30);

        let mesh: THREE.Mesh;
        if (spriteUrl) {
          // sprite_url 있으면 텍스처 평면으로 교체
          const tex = texLoader.load(spriteUrl);
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, depthWrite: false });
          mesh = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), mat);
        } else {
          let geo: THREE.BufferGeometry;
          if (vCount === 3) {
            const h = r, b = r * 2.0;
            const shape = new THREE.Shape();
            if (cx < BOARD_CONSTANTS.CENTER_X) {
              shape.moveTo(-h, -b); shape.lineTo(h, 0); shape.lineTo(-h, b);
            } else {
              shape.moveTo(h, -b); shape.lineTo(-h, 0); shape.lineTo(h, b);
            }
            geo = new THREE.ShapeGeometry(shape);
          } else {
            geo = new THREE.CircleGeometry(r, 4); // Diamond or Square
          }
          // 다이아몬드, 범퍼, 삼각형은 모두 아주 단단한 블랙 솔리드
          mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#1a1a1a' }));
          if (vCount === 4) mesh.rotation.z = Math.PI / 4;
        }

        mesh.position.set(cx, cy, 0.5);
        obstacleGroup.add(mesh);
      }
    });

    this.scene.add(new THREE.AmbientLight(0xffffff, 1));

    // Matter.js 엔진 해제 (시각화 완료 후 불필요)
    Matter.Engine.clear(engine);
    Matter.World.clear(engine.world, false);
  }

  // ── 렌더 루프 ───────────────────────────────────────────
  private startRenderLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      
      const now = Date.now();
      const balls = this.bankPlayer.getActiveBalls();
      const ballRadius = 9; // boardBuilder.ts 수치와 동기화

      // 우퍼 바운스 로직: 모든 활성 구슬과 보상 원형의 충돌 체크
      this.rewardMeshes.forEach(rm => {
        let isHit = false;
        balls.forEach(ball => {
          const dx = ball.position.x - rm.mesh.position.x;
          const dy = ball.position.y - rm.mesh.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // 충돌 감지 (Pre-sim이라도 시각적 효과를 위해 거리 체크)
          if (dist < rm.originalRadius + ballRadius + 2) {
            isHit = true;
          }
        });

        if (isHit && now - rm.lastHitTime > 150) {
          rm.lastHitTime = now;
        }

        // 바운스 & 리플 애니메이션
        const elapsed = now - rm.lastHitTime;
        if (elapsed < 400) {
          // 1. 메인 바운스 (0~300ms)
          if (elapsed < 300) {
            const s = elapsed < 80 ? 1 + (elapsed / 80) * 0.12 : 1.12 - ((elapsed - 80) / 220) * 0.12;
            rm.mesh.scale.set(s, s, 1);
            rm.outline.scale.set(s, s, 1);
          } else {
            rm.mesh.scale.set(1, 1, 1);
            rm.outline.scale.set(1, 1, 1);
          }

          // 2. 소닉 리플 (안쪽으로 수축)
          rm.ripples.forEach((ripple, idx) => {
            const delay = idx * 120; // 라인간 시간차
            const rElapsed = elapsed - delay;
            const rDuration = 280;

            if (rElapsed > 0 && rElapsed < rDuration) {
              ripple.visible = true;
              const p = rElapsed / rDuration;
              const s = 1 - p; // 1 -> 0 (점으로 수축)
              ripple.scale.set(s, s, 1);
              (ripple.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.6;
            } else {
              ripple.visible = false;
            }
          });
        } else {
          rm.mesh.scale.set(1, 1, 1);
          rm.outline.scale.set(1, 1, 1);
          rm.ripples.forEach(r => r.visible = false);
        }
      });

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  // ── HUD 초기 동기화 ───────────────────────────────────────────
  private initHud() {
    const thresholds = this.data.milestones.map(m => m.threshold_lightning);
    // 마일스톤 상태 → milestoneStore facade (내부적으로 hudStore에 push)
    milestoneStore.update({
      sessionLightning: 0,
      milestoneStep: 0,
      milestoneThresholds: thresholds,
      cycleCount: 0,
    });
    syncHud({
      '/hud/multiplier': this.currentMultiplier,
      '/hud/milestone_rewards': this.data.milestones.map(m => ({
        step: m.step,
        threshold_lightning: m.threshold_lightning,
        reward_type: m.reward_type,
        reward_amount: m.reward_amount,
        reward_icon: m.reward_icon,
        reward_label: m.reward_label,
        reward_item_id: m.reward_item_id,
      })),
    });
  }

  // ── 슬롯 가중치 기반 랜덤 선택 ───────────────────────────────
  private pickTargetSlot(): number {
    const total = this.data.slots.reduce((s, slot) => s + slot.weight, 0);
    let rand = Math.random() * total;
    for (const slot of this.data.slots) {
      rand -= slot.weight;
      if (rand <= 0) return slot.slot_index;
    }
    return this.data.slots[this.data.slots.length - 1].slot_index;
  }

  // ── 슬롯 착지 처리 ───────────────────────────────────────────
  private onBallLand(slotIndex: number) {
    const slot = this.data.slots[slotIndex];
    if (!slot) return;

    const gained = slot.reward_lightning * this.currentMultiplier;
    this.session_lightning += gained;

    console.log(`슬롯 ${slotIndex} 착지 — ⚡${gained} (누적: ${this.session_lightning})`);

    // 마일스톤 체크 — 이번에 달성된 것 전부 수집
    const newlyCleared: typeof this.data.milestones = [];
    this.data.milestones.forEach((ms, i) => {
      if (!this.milestonesCleared[i] && this.session_lightning >= ms.threshold_lightning) {
        this.milestonesCleared[i] = true;
        newlyCleared.push(ms);
      }
    });

    let clearedCount = this.milestonesCleared.filter(Boolean).length;

    // 사이클 완료 — 모든 마일스톤 달성 시 리셋
    let justCompleted = false;
    if (clearedCount === this.data.milestones.length) {
      this.cycleCount += 1;
      this.session_lightning = 0;
      this.milestonesCleared = this.data.milestones.map(() => false);
      clearedCount = 0;
      justCompleted = true;
    }

    const nextMilestone = this.data.milestones.find((_, i) => !this.milestonesCleared[i]);
    const progress = nextMilestone
      ? Math.min(this.session_lightning / nextMilestone.threshold_lightning, 1)
      : 1;

    // milestoneStore facade가 hudStore에 한 번에 push
    milestoneStore.update({
      sessionLightning: this.session_lightning,
      milestoneStep: clearedCount,
      cycleCount: this.cycleCount,
    });
    syncHud({ '/hud/milestone_progress': Math.round(progress * 100) });
    milestoneStore.showGainBadge(gained);

    // 마일스톤 모달 — 달성된 순서대로 큐에 추가
    newlyCleared.forEach(ms => {
      rewardModalStore.enqueue({
        type: 'milestone',
        step: ms.step,
        rewardAmount: ms.reward_amount,
        rewardType: ms.reward_type,
        rewardIcon: ms.reward_icon,
        rewardLabel: ms.reward_label,
        rewardSlotId: ms.reward_item_id || undefined,
      });
      /* 호스트(스퀘어)에 보상 실지급 요청 */
      if (typeof window !== 'undefined' && window.parent !== window) {
        const kind = ms.reward_type === 'equip' ? 'equip'
          : ms.reward_type === 'gem' ? 'gem'
          : ms.reward_type === 'lightning' ? 'lightning'
          : 'gold';
        window.parent.postMessage({
          type: 'event:grant',
          rewards: [{ kind, amount: ms.reward_amount, slotId: ms.reward_item_id || undefined }],
        }, '*');
      }
    });

    // 잭팟 모달
    if (slot.is_jackpot) {
      rewardModalStore.enqueue({ type: 'jackpot', rewardAmount: gained });
    }

    // 이벤트 완료 모달 (마일스톤 모달 뒤에 표시)
    if (justCompleted) {
      rewardModalStore.enqueue({ type: 'complete', cycleCount: this.cycleCount });
    }
  }

  // ── GameActions 인터페이스 구현 ───────────────────────────────
  select_drop_position(_index: number) {}
  hold_drop(_index: number) {}

  release_drop(index: number) {
    if (!this.isReady) {
      console.warn('뱅크 로드 중 — 잠시 후 다시 시도');
      return;
    }
    if (this.dropBusy) return;

    // 공 차감 시도
    if (!gameStore.useBall()) {
      syncHud({ '/hud/show_warning': true });
      window.setTimeout(() => syncHud({ '/hud/show_warning': false }), 1200);
      return;
    }

    const targetSlot = this.pickTargetSlot();
    this.dropBusy = true;
    syncHud({ '/hud/drop_busy': true });

    const played = this.bankPlayer.play({
      targetSlot,
      dropPosition: index,
      onLand: (slotIndex) => {
        this.dropBusy = false;
        syncHud({ '/hud/drop_busy': false });
        this.onBallLand(slotIndex);
      },
    });

    if (!played) {
      this.dropBusy = false;
      syncHud({ '/hud/drop_busy': false });
      gameStore.addBalls(1);
    }
  }

  select_multiplier() {
    const levels = this.data.multipliers;
    const currentIdx = levels.findIndex(m => m.value === this.currentMultiplier);
    const nextIdx = (currentIdx + 1) % levels.length;
    this.currentMultiplier = levels[nextIdx].value;
    // gameStore.setMultiplier이 hudStore에 push — syncHud 중복 불필요
    gameStore.setMultiplier(this.currentMultiplier);
  }
}
