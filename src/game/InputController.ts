/**
 * InputController.ts — 터치 조이스틱 + WASD/방향키
 * gameState 체크로 입력 차단. control_config.csv 기반 수치.
 */
import type { ControlConfig, GameState } from './data';

export class InputController {
  vx = 0;
  vy = 0;

  private state: GameState = 'PLAYING';
  private cfg: ControlConfig;
  private container: HTMLElement;

  /* 조이스틱 DOM */
  private ringEl: HTMLDivElement;
  private knobEl: HTMLDivElement;

  /* 터치 상태 */
  private pivotX = 0;
  private pivotY = 0;
  private touchActive = false;
  private touchId: number | null = null;
  private usingPointerEvents = false;

  /* 키보드 상태 */
  private keys = new Set<string>();

  /* HUD 영역 높이 (터치 차단) */
  private hudHeight = 60;

  constructor(container: HTMLElement, cfg: ControlConfig) {
    this.cfg = cfg;
    this.container = container;

    /* 조이스틱 링 */
    this.ringEl = document.createElement('div');
    Object.assign(this.ringEl.style, {
      position: 'absolute',
      width: `${cfg.joystick_ring_diameter}px`,
      height: `${cfg.joystick_ring_diameter}px`,
      borderRadius: '50%',
      border: `3px solid rgba(255,255,255,${cfg.joystick_ring_opacity + 0.2})`,
      background: `rgba(255,255,255,${cfg.joystick_ring_opacity * 0.3})`,
      display: 'none',
      zIndex: String(cfg.joystick_z_index),
      pointerEvents: 'none',
      transform: 'translate(-50%,-50%)',
    });

    /* 조이스틱 노브 */
    this.knobEl = document.createElement('div');
    Object.assign(this.knobEl.style, {
      position: 'absolute',
      width: `${cfg.joystick_knob_diameter}px`,
      height: `${cfg.joystick_knob_diameter}px`,
      borderRadius: '50%',
      background: `rgba(255,255,255,${cfg.joystick_knob_opacity})`,
      display: 'none',
      zIndex: String(cfg.joystick_z_index + 1),
      pointerEvents: 'none',
      transform: 'translate(-50%,-50%)',
    });

    container.appendChild(this.ringEl);
    container.appendChild(this.knobEl);

    this._bindInput();
    this._bindKeyboard();
  }

  setGameState(state: GameState) {
    this.state = state;
    if (state !== 'PLAYING') this._resetJoystick();
  }

  setHudHeight(h: number) { this.hudHeight = h; }

  private _canMove(): boolean { return this.state === 'PLAYING'; }

  /* ── 입력 이벤트 (Pointer 우선, Touch fallback) ── */
  private _bindInput() {
    this.container.addEventListener('contextmenu', e => e.preventDefault());
    if (typeof PointerEvent !== 'undefined') {
      this.usingPointerEvents = true;
      this.container.addEventListener('pointerdown', this._onPointerDown);
      this.container.addEventListener('pointermove', this._onPointerMove);
      this.container.addEventListener('pointerup', this._onPointerUp);
      this.container.addEventListener('pointercancel', this._onPointerUp);
      this.container.addEventListener('pointerleave', this._onPointerUp);
      return;
    }

    const opts = { passive: false };
    this.container.addEventListener('touchstart', this._onTouchStart, opts);
    this.container.addEventListener('touchmove',  this._onTouchMove,  opts);
    this.container.addEventListener('touchend',   this._onTouchEnd,   opts);
    this.container.addEventListener('touchcancel',this._onTouchEnd,   opts);
  }

  private _onPointerDown = (e: PointerEvent) => {
    if (!this._canMove()) return;
    if (this.touchActive) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();

    const rect = this.container.getBoundingClientRect();
    const ty = e.clientY - rect.top;
    if (ty < this.hudHeight) return;

    this.touchId = e.pointerId;
    this.touchActive = true;
    this.pivotX = e.clientX - rect.left;
    this.pivotY = ty;
    this._showJoystick(this.pivotX, this.pivotY);
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (!this.touchActive || !this._canMove()) return;
    if (this.touchId !== e.pointerId) return;
    e.preventDefault();
    this._applyJoystickFromClient(e.clientX, e.clientY);
  };

  private _onPointerUp = (e: PointerEvent) => {
    if (!this.touchActive) return;
    if (this.touchId !== e.pointerId) return;
    e.preventDefault();
    this._resetJoystick();
  };

  private _onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (!this._canMove()) return;
    if (this.touchActive) return; // 첫 터치만

    const touch = e.changedTouches[0];
    const rect = this.container.getBoundingClientRect();
    const ty = touch.clientY - rect.top;

    /* HUD 영역 터치 무시 */
    if (ty < this.hudHeight) return;

    this.touchId = touch.identifier;
    this.touchActive = true;
    this.pivotX = touch.clientX - rect.left;
    this.pivotY = ty;

    this._showJoystick(this.pivotX, this.pivotY);
  };

  private _onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.touchActive || !this._canMove()) return;

    let touch: Touch | null = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        touch = e.changedTouches[i]; break;
      }
    }
    if (!touch) return;

    this._applyJoystickFromClient(touch.clientX, touch.clientY);
  };

  private _onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this._resetJoystick(); break;
      }
    }
  };

  private _showJoystick(x: number, y: number) {
    this.ringEl.style.left = `${x}px`;
    this.ringEl.style.top  = `${y}px`;
    this.ringEl.style.display = 'block';
    this.knobEl.style.left = `${x}px`;
    this.knobEl.style.top  = `${y}px`;
    this.knobEl.style.display = 'block';
  }

  private _applyJoystickFromClient(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    const dx = (clientX - rect.left) - this.pivotX;
    const dy = (clientY - rect.top)  - this.pivotY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxD = this.cfg.joystick_max_dist;

    const clampedX = dist > maxD ? (dx / dist) * maxD : dx;
    const clampedY = dist > maxD ? (dy / dist) * maxD : dy;

    this.vx =  clampedX / maxD;
    this.vy = -clampedY / maxD; // 화면 Y 반전 → 게임 Y 위가 양수
    this.knobEl.style.left = `${this.pivotX + clampedX}px`;
    this.knobEl.style.top  = `${this.pivotY + clampedY}px`;
  }

  private _resetJoystick() {
    this.touchActive = false;
    this.touchId = null;
    this.vx = 0;
    this.vy = 0;
    this.ringEl.style.display = 'none';
    this.knobEl.style.display = 'none';
    /* 키보드 방향 재반영 */
    this._applyKeys();
  }

  /* ── 키보드 이벤트 ── */
  private _bindKeyboard() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    /* ESC는 gameState 무관 항상 처리 */
    if (e.code === 'Escape') {
      window.dispatchEvent(new CustomEvent('prism:action', { detail: 'TOGGLE_PAUSE' }));
      return;
    }
    if (!this._canMove()) return;
    if (this.touchActive) return; // 조이스틱 활성 중 키보드 무시
    this.keys.add(e.code);
    this._applyKeys();
  };

  private _onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
    if (this._canMove() && !this.touchActive) this._applyKeys();
  };

  private _applyKeys() {
    if (this.touchActive || !this._canMove()) return;
    let kx = 0, ky = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp'))    ky =  1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown'))  ky = -1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft'))  kx = -1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) kx =  1;
    this.vx = kx;
    this.vy = ky;
    /* 대각선: 정규화 안 함 (기획서 의도된 스펙) */
  }

  dispose() {
    if (this.usingPointerEvents) {
      this.container.removeEventListener('pointerdown', this._onPointerDown);
      this.container.removeEventListener('pointermove', this._onPointerMove);
      this.container.removeEventListener('pointerup', this._onPointerUp);
      this.container.removeEventListener('pointercancel', this._onPointerUp);
      this.container.removeEventListener('pointerleave', this._onPointerUp);
    } else {
      this.container.removeEventListener('touchstart', this._onTouchStart);
      this.container.removeEventListener('touchmove',  this._onTouchMove);
      this.container.removeEventListener('touchend',   this._onTouchEnd);
      this.container.removeEventListener('touchcancel',this._onTouchEnd);
    }
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
    this.ringEl.remove();
    this.knobEl.remove();
  }
}
