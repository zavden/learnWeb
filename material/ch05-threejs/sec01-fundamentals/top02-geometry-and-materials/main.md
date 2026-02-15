# Geometry & Materials

3D objects in Three.js are made of a **Geometry** (shape) and a **Material** (appearance).

## Built-in Geometries

| Geometry | Description |
|----------|-------------|
| `BoxGeometry(w, h, d)` | Cube / rectangular prism |
| `SphereGeometry(r, wSeg, hSeg)` | Sphere |
| `CylinderGeometry(rTop, rBot, h)` | Cylinder / cone |
| `PlaneGeometry(w, h)` | Flat rectangle |
| `TorusGeometry(r, tube)` | Donut shape |
| `TorusKnotGeometry(r, tube)` | Torus knot |

## Materials

| Material | Description |
|----------|-------------|
| `MeshBasicMaterial` | No lighting, flat color |
| `MeshStandardMaterial` | Physically-based, needs lights |
| `MeshPhongMaterial` | Shiny highlights |
| `MeshNormalMaterial` | Debug — colors by face normal |

## Creating a Mesh

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THRE# Geometry & Materials

3D oolor: 0x58a6ff,
  metalness: 0.3,
  roughness: 0.5
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```
