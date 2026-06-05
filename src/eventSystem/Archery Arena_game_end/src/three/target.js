import * as THREE from 'three';

const ZONE_ORDER = ['OUTER', 'MIDDLE', 'CENTER', 'BULLSEYE'];

/**
 * @param {THREE.Scene} scene
 * @param {Record<string, string>} colors hex #rrggbb
 * @param {Record<string, string>} zoneSprites
 *   키: 'backdrop' | 'OUTER' | 'MIDDLE' | 'CENTER' | 'BULLSEYE'
 *   값: 이미지 URL (빈 문자열이면 기존 MeshPhong 색상 렌더링)
 */
export function buildTargetRings(scene, colors, zoneSprites = {}) {
  /** 과녁 전체 ~32% 축소 — 화면 비율은 카메라로 보정 */
  const s = 0.68;
  const outerRadii = [5.0 * s, 3.6 * s, 2.2 * s, 1.0 * s];
  const innerRadii = [3.6 * s, 2.2 * s, 1.0 * s, 0.35 * s];
  const meshes = {};

  const backdropUrl = zoneSprites['backdrop'] || '';
  const backdropR = outerRadii[0] + 0.36;
  if (backdropUrl) {
    const tex = new THREE.TextureLoader().load(backdropUrl);
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(backdropR * 2, backdropR * 2),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    backdrop.position.z = -0.22;
    scene.add(backdrop);
  } else {
    const backdrop = new THREE.Mesh(
      new THREE.CircleGeometry(backdropR, 72),
      new THREE.MeshPhongMaterial({ color: 0xfff8f0, shininess: 8, specular: 0x222222 })
    );
    backdrop.position.z = -0.22;
    scene.add(backdrop);
  }

  ZONE_ORDER.forEach((zone, i) => {
    const zoneUrl = zoneSprites[zone] || '';
    let mesh;
    if (zoneUrl) {
      const tex = new THREE.TextureLoader().load(zoneUrl);
      const w = outerRadii[i] * 2;
      mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, w),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
      );
    } else {
      const geo = new THREE.RingGeometry(innerRadii[i], outerRadii[i], 72);
      const col = new THREE.Color(colors[zone] || '#888888');
      const mat = new THREE.MeshPhongMaterial({
        color: col,
        emissive: col.clone().multiplyScalar(0.04),
        specular: 0x111111,
        shininess: 18,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geo, mat);
    }
    mesh.userData.zone = zone;
    mesh.position.z = (i - (ZONE_ORDER.length - 1) * 0.5) * 0.045;
    scene.add(mesh);
    meshes[zone] = mesh;
  });

  return { meshes, outerRadii, innerRadii };
}

export function ringHitPosition(hitZone, outerRadii) {
  const angle = (Math.random() - 0.5) * 0.35;
  let rMin;
  let rMax;
  if (hitZone === 'OUTER') {
    rMin = outerRadii[1] + 0.1;
    rMax = outerRadii[0] - 0.1;
  } else if (hitZone === 'MIDDLE') {
    rMin = outerRadii[2] + 0.1;
    rMax = outerRadii[1] - 0.1;
  } else if (hitZone === 'CENTER') {
    rMin = outerRadii[3] + 0.08;
    rMax = outerRadii[2] - 0.08;
  } else {
    rMin = outerRadii[3] * 0.2;
    rMax = outerRadii[3] * 0.85;
  }
  const rad = rMin + Math.random() * (rMax - rMin);
  return new THREE.Vector3(Math.cos(angle) * rad, Math.sin(angle) * rad, 0);
}

export function addBulletHole(scene, pos) {
  const holeR = 0.11 + Math.random() * 0.048;
  const zLift = 0.085 + Math.random() * 0.025;
  const rot = (Math.random() - 0.5) * 0.65;
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(holeR, 28),
    new THREE.MeshBasicMaterial({ color: 0x0b0908 })
  );
  hole.position.set(pos.x, pos.y, zLift);
  hole.rotation.z = rot;
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(holeR * 0.4, holeR * 1.22, 28),
    new THREE.MeshBasicMaterial({ color: 0x3f3833, side: THREE.DoubleSide })
  );
  rim.position.set(pos.x, pos.y, zLift + 0.005);
  rim.rotation.z = rot + 0.12;
  scene.add(hole);
  scene.add(rim);
}

/**
 * 링 크기 변화 없음 — 색만 짧게 플래시 (과녁이 커졌다 작아지는 연출 제거)
 */
export function flashRing(mesh, durationMs) {
  if (!mesh) return Promise.resolve();
  const mat = mesh.material;
  const orig = mat.color.clone();
  const start = performance.now();
  return new Promise((resolve) => {
    function step() {
      const t = (performance.now() - start) / durationMs;
      if (t >= 1) {
        mat.color.copy(orig);
        resolve();
        return;
      }
      const k = t < 0.5 ? t * 2 : 2 - t * 2;
      mat.color.copy(orig).lerp(new THREE.Color(0xfff8f0), 0.38 * Math.sin(k * Math.PI));
      requestAnimationFrame(step);
    }
    step();
  });
}
