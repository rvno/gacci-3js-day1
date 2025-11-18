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

const planeGeometry = new THREE.PlaneGeometry(7, 7);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xcccccc,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const teapotGeo = new TeapotGeometry(5, 3);
const teapotMat = new THREE.MeshBasicMaterial({
  color: "hsla(184, 77%, 39%, 1.00)",
});
const teapot = new THREE.Mesh(teapotGeo, teapotMat);
scene.add(teapot);

const torusGeo = new THREE.TorusKnotGeometry(5, 3, 2, 8);
const torusMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const torusKnot = new THREE.Mesh(torusGeo, torusMat);
scene.add(torusKnot);

camera.position.z = 5;
camera.position.y = 7;
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

function animate() {
  renderer.render(scene, camera);
}
