import * as THREE from 'three';

export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function quadBezierVec(p0, p1, p2, t) {
  const u = 1 - t;
  const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
  const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
  const z = u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z;
  return new THREE.Vector3(x, y, z);
}

/** 발사 지점 — game 쪽 트레일 시작점과 동일하게 유지 */
export function getArrowLaunchPoint(hitVec) {
  return new THREE.Vector3(-11, Math.min(1.8, hitVec.y * 0.35 + 1.1), 0);
}

/** 한 발마다 다른 호 높이/quadratic 중간점 — 트레일 샘플링에도 동일 객체 사용 */
export function planArrowFlight(hitVec) {
  const from = getArrowLaunchPoint(hitVec);
  const arcHeight = Math.max(from.y, hitVec.y) + 1.05 + Math.random() * 0.55;
  const mid = new THREE.Vector3(
    (from.x + hitVec.x) * 0.4 + (Math.random() - 0.5) * 1.1,
    arcHeight,
    (Math.random() - 0.5) * 0.42
  );
  const wobbleAmp = 0.1 + Math.random() * 0.1;
  return { from, mid, wobbleAmp };
}

export function sampleFlightPosition(plan, to, t) {
  const pos = quadBezierVec(plan.from, plan.mid, to, t);
  pos.z += plan.wobbleAmp * Math.sin(t * Math.PI * 2.5) * (1 - t);
  return pos;
}

/** 보이는 화살 없음 — 궤적/트레일용 빈 피벗만 이동 */
export function createArrowGroup() {
  return new THREE.Group();
}

/**
 * 포물선 베지어 + ease + z 워블 — 궤적마다 다른 느낌
 */
export function animateArrowFlight(scene, arrowGroup, to, flightMs, plan) {
  const from = plan.from;
  arrowGroup.position.copy(from);
  scene.add(arrowGroup);
  const start = performance.now();
  return new Promise((resolve) => {
    function step() {
      const raw = Math.min(1, (performance.now() - start) / flightMs);
      const t = easeOutCubic(raw);
      const pos = sampleFlightPosition(plan, to, t);
      arrowGroup.position.copy(pos);
      const ahead = sampleFlightPosition(plan, to, Math.min(1, t + 0.045));
      arrowGroup.lookAt(ahead.x, ahead.y, ahead.z);
      if (raw < 1) requestAnimationFrame(step);
      else resolve();
    }
    step();
  });
}

/** 임팩트 스위시 — 베지어 경로를 따라 잔광(이중 라인) */
export function createTrailLine(scene, points, durationMs) {
  const makeLine = (color, opacity) => {
    const geom = new THREE.BufferGeometry().setFromPoints(points.map((p) => p.clone()));
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    return { geom, mat, line: new THREE.Line(geom, mat) };
  };
  const inner = makeLine(0xffee99, 0.98);
  const outer = makeLine(0xff9933, 0.5);
  scene.add(outer.line);
  scene.add(inner.line);
  const start = performance.now();
  return new Promise((resolve) => {
    function step() {
      const t = (performance.now() - start) / durationMs;
      const k = Math.max(0, 1 - t);
      inner.mat.opacity = 0.98 * k;
      outer.mat.opacity = 0.5 * k;
      if (t < 1) requestAnimationFrame(step);
      else {
        scene.remove(inner.line);
        scene.remove(outer.line);
        inner.geom.dispose();
        inner.mat.dispose();
        outer.geom.dispose();
        outer.mat.dispose();
        resolve();
      }
    }
    step();
  });
}
