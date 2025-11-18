import * as THREE from "three";

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
  color: 0xcccccc
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const geometry = new THREE.BoxGeometry(1, 1, 1);
geometry.translate(0, 0, 0.5);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
camera.position.y = 7;
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

function animate() {
  renderer.render(scene, camera);
}
