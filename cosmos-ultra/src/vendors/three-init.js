import * as THREE from "three";

export function createBasicScene(container, options = {}) {
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 420;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(options.background || 0x00000a);

  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2000);
  camera.position.set(0, 0, options.cameraZ || 6);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  const key = new THREE.DirectionalLight(0x00f5ff, 1.2);
  key.position.set(4, 3, 6);

  scene.add(ambient, key);

  return {
    THREE,
    scene,
    camera,
    renderer,
    resize() {
      const nextWidth = container.clientWidth || width;
      const nextHeight = container.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    },
    destroy() {
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}

export function createPlanetMesh(THREERef, radius = 1, color = 0x4fa3ff) {
  const geometry = new THREERef.SphereGeometry(radius, 48, 48);
  const material = new THREERef.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05
  });

  return new THREERef.Mesh(geometry, material);
}

export function createOrbitLine(THREERef, radius = 2, color = 0x00f5ff) {
  const points = [];
  for (let index = 0; index <= 128; index += 1) {
    const angle = (index / 128) * Math.PI * 2;
    points.push(new THREERef.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const geometry = new THREERef.BufferGeometry().setFromPoints(points);
  const material = new THREERef.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.45
  });

  return new THREERef.Line(geometry, material);
}
