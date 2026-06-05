import * as THREE from 'three';

let renderer;
let scene;
let camera;
let resizeObserver;
let containerEl;

export function getThreeContext() {
  return { renderer, scene, camera, containerEl };
}

export function mountArcheryThree(container, visualRow) {
  disposeArcheryThree();
  containerEl = container;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfff8f0);

  const halfH = Number(visualRow.ortho_view_half_height) || 10;
  const fov = 38;
  const aspectFallback = 390 / 500;
  camera = new THREE.PerspectiveCamera(fov, aspectFallback, 0.1, 200);
  const camDist = (20 + halfH * 0.92) * 0.88;
  camera.position.set(-halfH * 0.06, halfH * 0.38, camDist);
  camera.lookAt(0, halfH * 0.04, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  /** WebGL을 맨 뒤(z-order)로 — 위에 UI 오버레이 */
  if (container.firstChild) container.insertBefore(canvas, container.firstChild);
  else container.appendChild(canvas);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff6ec, 1.05);
  key.position.set(10, 14, 18);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfeaff, 0.42);
  fill.position.set(-8, 6, 12);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.28);
  rim.position.set(0, -6, 8);
  scene.add(rim);

  const resize = () => {
    if (!containerEl || !renderer || !camera) return;
    const rect = containerEl.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  resize();
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  renderer.setAnimationLoop(() => {
    if (renderer && scene && camera) renderer.render(scene, camera);
  });

  return { renderer, scene, camera, resize };
}

export function disposeArcheryThree() {
  if (renderer) renderer.setAnimationLoop(null);

  if (resizeObserver && containerEl) {
    try {
      resizeObserver.unobserve(containerEl);
    } catch {
      /* noop */
    }
  }
  resizeObserver = null;

  if (scene) {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.();
      if (obj.material) {
        const m = obj.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose?.());
        else m.dispose?.();
      }
    });
    scene.clear();
  }
  scene = null;

  if (renderer) {
    renderer.dispose();
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
  renderer = null;
  camera = null;
  containerEl = null;
}
