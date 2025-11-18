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
renderer.setClearColor("hsla(216, 78%, 78%, 1.00)");
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const teapotGeo = new TeapotGeometry(5, 3);
const teapotMat = new THREE.MeshBasicMaterial({
  color: "hsla(82, 91%, 40%, 1.00)",
  // wireframe: true,
});
const teapot = new THREE.Mesh(teapotGeo, teapotMat);
teapot.scale.set(1, 1.4, 1.3);
teapot.rotation.y = -Math.PI / 4;
scene.add(teapot);

const torusGeo = new THREE.TorusKnotGeometry(5, 0.6, 150, 10, 10, 8);
const torusMat = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  wireframe: true,
});

const torusKnot = new THREE.Mesh(torusGeo, torusMat);
torusKnot.rotation.z = -Math.PI / 2;
torusKnot.scale.set(1.2, 1.2, 1.2);
scene.add(torusKnot);

const points = [];
for (let i = 0; i < 10; i++) {
  points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
}
const latheGeo = new THREE.LatheGeometry(points, 30, 0.96, 6.28);
const latheMat = new THREE.MeshBasicMaterial({
  color: "hsla(285, 76%, 66%, 1.00)",
  wireframe: true,
});
const lathe = new THREE.Mesh(latheGeo, latheMat);
lathe.rotation.x = -Math.PI / 4;
scene.add(lathe);

camera.position.z = 3;
camera.position.y = 15;
camera.up.set(0, 0, -3);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
let time = 0;
function animate(time) {
  // time += 0.01;
  time *= 0.001;
  lathe.rotation.y += 0.01;
  torusKnot.position.y = Math.sin(time * 0.3);
  torusKnot.rotation.z = Math.cos(time * 2) + 1;
  teapot.scale.set(
    Math.sin(time * 0.7),
    Math.sin(time * 0.6),
    Math.sin(time * 0.7)
  );
  renderer.render(scene, camera);
}
