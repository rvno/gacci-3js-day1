import * as THREE from "three";
import { TeapotGeometry } from "three/addons/geometries/TeapotGeometry.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const teapotGeo = new TeapotGeometry(5, 3);
const teapotMat = new THREE.MeshBasicMaterial({
  color: "hsla(257, 84%, 58%, 1.00)",
});
const teapot = new THREE.Mesh(teapotGeo, teapotMat);
scene.add(teapot);

const torusGeo = new THREE.TorusKnotGeometry(5, 0.6, 150, 10, 10, 8);
const torusMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const torusKnot = new THREE.Mesh(torusGeo, torusMat);
scene.add(torusKnot);

camera.position.z = 3;
camera.position.y = 15;
camera.up.set(0, 0, -3);
camera.lookAt(0, 0, 0);

function animate() {
  renderer.render(scene, camera);
}
