import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export async function initScene() {
  const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
  const host = document.getElementById("experience")!;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: devicePixelRatio < 2,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(12, 10, 15);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.7, 0);
  controls.enableDamping = false;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = 1.35;
  controls.update();
  scene.add(new THREE.HemisphereLight(0xe3eee0, 0x4c4836, 2.7));
  const sun = new THREE.DirectionalLight(0xffeccb, 5);
  sun.position.set(-6, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd6eac8, 1.2);
  fill.position.set(7, 4, -6);
  scene.add(fill);
  const model = await new GLTFLoader().loadAsync(
    `${import.meta.env.BASE_URL}models/pavilion.glb`,
  );
  model.scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  scene.add(model.scene);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ opacity: 0.32 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.28;
  ground.receiveShadow = true;
  scene.add(ground);
  const reduced = matchMedia("(prefers-reduced-motion:reduce)");
  let visible = true;
  let raf = 0;
  let frames = 0;
  let target: THREE.Vector3 | undefined;
  function render() {
    raf = 0;
    if (document.hidden || !visible) return;
    if (target) {
      camera.position.lerp(target, reduced.matches ? 1 : 0.09);
      camera.lookAt(controls.target);
      if (camera.position.distanceTo(target) < 0.015) {
        target = undefined;
        controls.update();
      }
    }
    renderer.render(scene, camera);
    if (target || --frames > 0) raf = requestAnimationFrame(render);
  }
  function invalidate(count = 1) {
    frames = Math.max(frames, count);
    if (!raf && !document.hidden && visible)
      raf = requestAnimationFrame(render);
  }
  function resize() {
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    invalidate();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else invalidate();
  });
  intersection.observe(host);
  controls.addEventListener("change", () => invalidate());
  controls.addEventListener("start", () => {
    target = undefined;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else invalidate();
  });
  const zones = [
    {
      pos: [12, 10, 15],
      text: "01 Gesamtbild · Der Pavillon verbindet drei offene Raumzonen.",
    },
    {
      pos: [7, 4, 8],
      text: "02 Material · Travertin, Eichenlamellen und bronzefarbenes Metall.",
    },
    {
      pos: [-10, 7, 12],
      text: "03 Licht · Das Lamellendach lenkt Licht und Schatten.",
    },
  ];
  window.addEventListener("raumwerk:zone", ((e: CustomEvent<number>) => {
    const zone = zones[e.detail] || zones[0];
    target = new THREE.Vector3(...(zone.pos as [number, number, number]));
    sun.intensity = e.detail === 2 ? 6 : 5;
    document.getElementById("scene-status")!.textContent = zone.text;
    invalidate(70);
  }) as EventListener);
  let lastScroll = scrollY;
  window.addEventListener(
    "scroll",
    () => {
      if (reduced.matches || !visible || Math.abs(scrollY - lastScroll) < 20)
        return;
      lastScroll = scrollY;
      sun.position.x = -6 + Math.min(scrollY / 180, 4);
      invalidate();
    },
    { passive: true },
  );
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    cancelAnimationFrame(raf);
    host.classList.remove("ready");
    document.getElementById("scene-status")!.textContent =
      "3D pausiert. Die Projektinhalte bleiben verfügbar.";
  });
  window.addEventListener(
    "pagehide",
    () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(
            (m) => m.dispose(),
          );
        }
      });
      renderer.dispose();
    },
    { once: true },
  );
  resize();
  renderer.render(scene, camera);
  host.classList.add("ready");
  document.getElementById("scene-status")!.textContent =
    "Modell bereit · Ziehen zum Drehen oder Ansicht auswählen";
}
