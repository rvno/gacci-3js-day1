import * as THREE from "three";
import { TeapotGeometry } from "three/addons/geometries/TeapotGeometry.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { TextureLoader } from "three";
import GUI from "lil-gui";

const scene = new THREE.Scene();

// Add fog to cover the top half of the scene (above the kaws model at y=-20)
// Using FogExp2 for exponential density fog
scene.fog = new THREE.Fog(
  0x1a0a2e, // fog color matching background (dark purple)
  10, // near distance - fog starts
  60 // far distance - fog is fully opaque
);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x1a0a2e); // dark dark purple
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

let model;
const loader = new GLTFLoader();
loader.load(
  "kaws/scene.gltf",
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
    model.scale.set(3, 3, 3);
    model.position.set(0, 0, 0); // position at origin, same Y axis as lathe, below it
    model.position.y = -20; // position below the lathe
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

let bottleModel;
const bottleLoader = new GLTFLoader();
const bottleOrbitRadius = 12; // Orbit radius just short of lathe's max radius (~15)
bottleLoader.load(
  "bottled-storm/scene.gltf",
  function (gltf) {
    bottleModel = gltf.scene;
    bottleModel.traverse((child) => {
      if (child.isMesh) {
        // Clone the material to avoid sharing materials between meshes
        if (child.material) {
          child.material = child.material.clone();

          // Ensure textures are loaded properly from the bottled-storm folder
          // GLTF loader automatically handles texture paths relative to the .gltf file
          // Set texture encoding for proper color display
          if (child.material.map) {
            child.material.map.colorSpace = THREE.SRGBColorSpace;
          }
          if (child.material.emissiveMap) {
            child.material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
          }
          if (child.material.normalMap) {
            // Normal maps should use LinearColorSpace
            child.material.normalMap.colorSpace = THREE.LinearSRGBColorSpace;
          }

          // Update material to ensure it responds to lights
          child.material.needsUpdate = true;
        }
        // Compute vertex normals for proper lighting
        if (child.geometry) {
          child.geometry.computeVertexNormals();
        }
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(bottleModel);
    bottleModel.scale.set(40, 40, 40);
    bottleModel.position.set(bottleOrbitRadius, 3, 0); // Lower y position, start at orbit radius
  },
  undefined,
  function (error) {
    console.error("Error loading bottle model:", error);
  }
);

const gui = new GUI({ title: "Controls", width: 300 });

// GUI controls object for lathe shader
const latheControls = {
  opacity: 0.7,
  color: 0x789bba, // blue-grey
};

// Create a folder for lathe shader controls
const latheFolder = gui.addFolder("Lathe Shader");

// Add opacity control (0 to 1)
latheFolder
  .add(latheControls, "opacity", 0, 1, 0.01)
  .name("Opacity")
  .onChange((value) => {
    // Update will happen in animate loop
  });

// Add color control
latheFolder
  .addColor(latheControls, "color")
  .name("Color")
  .onChange((value) => {
    if (latheMat.uniforms && latheMat.uniforms.baseColor) {
      latheMat.uniforms.baseColor.value.setHex(value);
    }
  });

// Open the folder by default
latheFolder.open();

// GUI controls object for torus knot
const torusKnotControls = {
  color: 0xcc5500, // burnt orange
  emissive: 0xffff00, // yellow emissive
  emissiveIntensity: 0.3,
};

// Create a folder for torus knot controls
const torusKnotFolder = gui.addFolder("Torus Knot");

// Add color control
torusKnotFolder
  .addColor(torusKnotControls, "color")
  .name("Color")
  .onChange((value) => {
    torusMat.color.setHex(value);
  });

// Add emissive color control
torusKnotFolder
  .addColor(torusKnotControls, "emissive")
  .name("Emissive")
  .onChange((value) => {
    torusMat.emissive.setHex(value);
  });

// Add emissive intensity control
torusKnotFolder
  .add(torusKnotControls, "emissiveIntensity", 0, 2, 0.1)
  .name("Emissive Intensity")
  .onChange((value) => {
    torusMat.emissiveIntensity = value;
  });

// Open the folder by default
torusKnotFolder.open();

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// ===== LIGHTING =====
// Global ambient light for soft yellow glow on all objects
const ambientLight = new THREE.AmbientLight(0xffed4e, 0.9); // soft yellow, moderate intensity
scene.add(ambientLight);

// Create magenta point light
const pointLight = new THREE.PointLight(0xff00ff, 2, 100);
pointLight.position.set(10, 10, 10);
pointLight.castShadow = true;
scene.add(pointLight);

// Add point light helper to visualize the light position
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
// scene.add(pointLightHelper);

// Add turquoise area light with high intensity
const areaLight = new THREE.RectAreaLight(0x40e0d0, 15, 20, 20); // turquoise, very high intensity, 20x20 size
areaLight.position.set(0, 10, 0); // position above the scene
areaLight.lookAt(0, 0, 0); // aim at center
scene.add(areaLight);

// Add area light helper
const areaLightHelper = new RectAreaLightHelper(areaLight);
// scene.add(areaLightHelper);

// Add fiery glow light below the teapot
const teapotLight = new THREE.PointLight(0xff4500, 3, 15); // orange-red color, high intensity, 15 unit range
teapotLight.position.set(0, -2, 0); // positioned below the teapot
teapotLight.castShadow = false; // no shadows for atmospheric effect
scene.add(teapotLight);

// Add teapot light helper (optional for debugging)
const teapotLightHelper = new THREE.PointLightHelper(teapotLight, 0.5);
// scene.add(teapotLightHelper);
// ===== END LIGHTING =====

const teapotGeo = new TeapotGeometry(5, 3);
const teapotMat = new THREE.MeshPhongMaterial({
  color: "hsla(19, 97%, 47%, 1.00)",
  emissive: 0x4488ff,
  emissiveIntensity: 1.2,
  specular: 0xffff00,
  shininess: 30,
  // wireframe: true,
});
const teapot = new THREE.Mesh(teapotGeo, teapotMat);
teapot.scale.set(1, 1.4, 1.3);
teapot.rotation.y = -Math.PI / 4;
scene.add(teapot);

const torusGeo = new THREE.TorusKnotGeometry(5, 0.6, 150, 10, 10, 8);
const torusMat = new THREE.MeshPhongMaterial({
  color: 0xcc5500, // burnt orange
  emissive: 0xffff00, // yellow emissive
  emissiveIntensity: 0.3,
  specular: 0xffff00, // yellow specular
  shininess: 50,
  // wireframe: true,
});

const torusKnot = new THREE.Mesh(torusGeo, torusMat);
torusKnot.rotation.x = -Math.PI / 2;
torusKnot.scale.set(1.25, 1.25, 1.25);
scene.add(torusKnot);

const points = [];
for (let i = 0; i < 10; i++) {
  points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
}
const latheGeo = new THREE.LatheGeometry(points, 30, 0.96, 6.28);

// Custom shader material with animated noise for smoke/wind effect
const latheMat = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 }, // Animation time uniform
    baseColor: { value: new THREE.Color(0x6b8ca8) }, // blue-grey color
    opacity: { value: 0.7 }, // Opacity uniform for transparency control
  },
  vertexShader: `
    // Vertex shader - pass position and UV to fragment shader
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;

    // Simple 3D noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;
      vPosition = position;

      // Add noise-based displacement for wind/smoke effect
      vec3 pos = position;
      float noise = snoise(vec3(position.x * 0.3, position.y * 0.3 + time * 0.5, position.z * 0.3));
      pos += normal * noise * 0.3;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    // Fragment shader - animated color with noise
    uniform float time;
    uniform vec3 baseColor;
    uniform float opacity;
    varying vec2 vUv;
    varying vec3 vPosition;

    // 2D noise function for color variation
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // Improved 2D noise with smoother interpolation
    float noise2D(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f); // smoothstep interpolation

      float a = rand(i);
      float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0));
      float d = rand(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      // Create horizontal ring patterns for transparency
      // Use y-position as primary driver for horizontal bands
      float noise1 = noise2D(vec2(vPosition.y * 2.0 + time * 0.1, time * 0.15));
      float noise2 = noise2D(vec2(vPosition.y * 1.5 - time * 0.08, time * 0.12));
      float noise3 = noise2D(vec2(vPosition.y * 3.0 + time * 0.05, vPosition.x * 0.1 + vPosition.z * 0.1));

      // Combine multiple noise layers for horizontal ring variation
      float combinedNoise = (noise1 + noise2 + noise3) / 3.0;

      // Create horizontal pockets of transparency based on noise threshold
      float transparency = combinedNoise * 0.6 + 0.4; // range 0.4 to 1.0

      float wave = sin(vPosition.y * 2.0 + time) * 0.5 + 0.5;

      // Mix base color with noise patterns
      vec3 color = baseColor;
      color += vec3(combinedNoise * 0.2);
      color *= (0.7 + wave * 0.3);

      // Apply opacity with transparent pockets
      float finalOpacity = opacity * transparency;
      gl_FragColor = vec4(color, finalOpacity);
    }
  `,
  side: THREE.DoubleSide,
  transparent: true,
  // wireframe: true,
});

const lathe = new THREE.Mesh(latheGeo, latheMat);
lathe.castShadow = true;
lathe.receiveShadow = true;
// lathe.rotation.x = -Math.PI / 4;
scene.add(lathe);

// Create large reflective plane beneath the model with emissive glow
const planeGeo = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.MeshStandardMaterial({
  color: 0x1a4a4e, // dark base color
  emissive: 0x00ffcc, // emissive green-blue color
  emissiveIntensity: 0.5, // moderate emissive glow
  metalness: 0.8, // high metalness for reflectivity
  roughness: 0.2, // low roughness for shiny reflections
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2; // rotate to be horizontal
plane.position.y = -25; // position below the model (model is at y=-20)
plane.receiveShadow = true;
scene.add(plane);

camera.position.z = -30;
// camera.position.y = 15;
// camera.up.set(0, 0, -3);
camera.lookAt(0, 0, 0);

let time = 0;
function animate(time) {
  // time += 0.01;
  time *= 0.001;

  // Update shader uniforms for animated smoke/wind effect
  if (latheMat.uniforms) {
    if (latheMat.uniforms.time) {
      latheMat.uniforms.time.value = time;
    }
    if (latheMat.uniforms.opacity) {
      latheMat.uniforms.opacity.value = latheControls.opacity;
    }
  }

  lathe.rotation.y += 0.01;
  torusKnot.position.y = Math.sin(time * 0.3);
  torusKnot.rotation.x += Math.cos(time * 3) + 1;

  // Teapot: boiling kettle effect - slight scaling with violent shaking at peak
  const scaleWave = Math.sin(time * 0.7);
  const scale = Math.abs(scaleWave) * 0.15 + 0.95; // subtle scale between 0.95 and 1.1
  teapot.scale.set(scale, scale, scale);

  // Violent shaking intensity increases dramatically at the peak
  const shakeIntensity = Math.pow(Math.abs(scaleWave), 3) * 2.5; // cubic function for dramatic peak
  teapot.position.x = Math.sin(time * 20) * shakeIntensity; // fast, violent shake on X
  teapot.position.z = Math.cos(time * 23) * shakeIntensity; // fast, violent shake on Z (slightly different frequency)
  teapot.position.y = Math.sin(time * 18) * shakeIntensity * 0.3; // vertical shake at peak

  // Animate the teapot fire light - flicker and intensify at boiling peaks
  const fireFlicker = Math.sin(time * 15) * 0.3 + Math.sin(time * 8) * 0.2; // fast flicker
  const boilIntensity = Math.pow(Math.abs(scaleWave), 2); // intensity increases at boiling peaks
  teapotLight.intensity = 3 + fireFlicker + boilIntensity * 2; // base 3, flicker ±0.5, peak +2
  teapotLight.position.x = teapot.position.x; // follow teapot shake
  teapotLight.position.z = teapot.position.z;

  // Bottle: rotate around y-axis in a circular orbit within the lathe
  if (bottleModel) {
    bottleModel.position.x = Math.cos(time * 0.5) * bottleOrbitRadius;
    bottleModel.position.z = Math.sin(time * 0.5) * bottleOrbitRadius;
    // Oscillate up and down (lathe height is ~20 units, so oscillate ~5 units)
    bottleModel.position.y = 3 + Math.sin(time * 0.8) * 5;
    // Rotate the bottle itself on multiple axes
    bottleModel.rotation.y += 0.01;
    bottleModel.rotation.x += 0.005;
    bottleModel.rotation.z += 0.003;
  }

  renderer.render(scene, camera);
}
