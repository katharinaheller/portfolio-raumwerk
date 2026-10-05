import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { NodeIO } from "@gltf-transform/core";
import { dedup, prune, weld } from "@gltf-transform/functions";
import { mkdir, writeFile } from "node:fs/promises";
// Original procedural architecture, no third-party models or textures.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString("base64")}`;
      this.onloadend?.();
    });
  }
};
const group = new THREE.Group();
group.name = "Zwischenraum-original-pavilion";
const stone = new THREE.MeshStandardMaterial({
  color: 0xc1b9a2,
  roughness: 0.85,
});
const dark = new THREE.MeshStandardMaterial({
  color: 0x33392d,
  roughness: 0.8,
});
const wood = new THREE.MeshStandardMaterial({
  color: 0xaa8154,
  roughness: 0.65,
});
const water = new THREE.MeshStandardMaterial({
  color: 0x506651,
  metalness: 0.55,
  roughness: 0.24,
});
const leaf = new THREE.MeshStandardMaterial({ color: 0x5d6c43, roughness: 1 });
function box(w, h, d, x, y, z, mat = stone) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}
box(10, 0.35, 8, 0, -0.12, 0);
box(9.4, 0.22, 7.4, 0, 0.16, 0);
box(7.6, 0.3, 5.8, 0, 0.41, -0.2);
box(5.6, 0.14, 0.7, 0.5, 0.34, 3.6);
box(6, 0.1, 0.55, 0.5, 0.21, 4.05);
box(3.1, 0.07, 4.9, -2.85, 0.61, 0, water);
box(2.9, 0.2, 0.25, -2.85, 0.71, -2.5);
box(0.2, 0.2, 5, -4.4, 0.71, 0);
for (const x of [-1, 1.6, 4])
  for (const z of [-2.55, 2.25]) box(0.13, 2.9, 0.13, x, 2.02, z, dark);
box(5.6, 0.18, 5.7, 1.4, 3.53, -0.15, wood);
box(5.85, 0.12, 5.9, 1.4, 3.66, -0.15, dark);
for (let i = 0; i < 25; i++)
  box(0.105, 0.26, 5.7, -1.32 + i * 0.228, 3.86, -0.15, wood);
for (let i = 0; i < 18; i++)
  box(0.08, 2.65, 0.09, -0.85 + i * 0.275, 2.05, -2.53, wood);
box(2.4, 0.18, 0.62, 1.25, 1.04, 1.7, wood);
box(0.12, 0.6, 0.5, 0.3, 0.72, 1.7, dark);
box(0.12, 0.6, 0.5, 2.2, 0.72, 1.7, dark);
box(1.6, 0.13, 0.85, 2.4, 1, -1, stone);
box(0.22, 0.5, 0.5, 2.4, 0.7, -1, dark);
for (const [x, z, size] of [
  [-3.2, -2.9, 0.8],
  [-3.6, 2.6, 0.65],
  [3.65, -2.5, 0.9],
]) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.09, 2.3, 8),
    wood,
  );
  trunk.position.set(x, 1.65, z);
  group.add(trunk);
  for (let i = 0; i < 6; i++) {
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size * (0.7 + (i % 3) * 0.12), 2),
      leaf,
    );
    crown.scale.set(1, 0.8, 1);
    crown.position.set(
      x + Math.sin(i * 2.4) * 0.35,
      2.5 + (i % 3) * 0.34,
      z + Math.cos(i * 2.4) * 0.35,
    );
    group.add(crown);
  }
}
const buffer = await new GLTFExporter().parseAsync(group, { binary: true });
await mkdir("public/models", { recursive: true });
const io = new NodeIO();
const document = await io.readBinary(new Uint8Array(buffer));
await document.transform(dedup(), prune(), weld());
const optimized = await io.writeBinary(document);
await writeFile("public/models/pavilion.glb", optimized);
console.log(
  `Original GLB: ${buffer.byteLength} bytes; optimized: ${optimized.byteLength} bytes`,
);
