# Scene, Camera & Renderer

Every Three.js application requires three core objects.

## Scene

The container for all 3D objects, lights, and cameras.

```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
```

## Camera

Defines the viewpoint. **PerspectiveCamera** is the most common:

```javascript
const camera = new THREE.PerspectiveCamera(
  75,                           // FOV (degrees)
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1,                          // Near clipping plane
  1000                          // Far clipping plane
);
camera.position.z = 5;
```

## Renderer

Draws the scene to a `<canvas>`:

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);
```

## The Minimal Loop

```javascript
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```
