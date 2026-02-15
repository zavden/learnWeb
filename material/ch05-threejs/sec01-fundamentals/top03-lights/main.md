# Lights

Most materials require lights to be visible. Three.js offers several light types.

## Light Types

| Light | Description |
|-------|-------------|
| `AmbientLight(color, intensity)` | Uniform light everywhere |
| `DirectionalLight(color, intensity)` | Sun-like parallel rays |
| `PointLight(color, intensity, distance)` | Light bulb, radiates in all directions |
| `SpotLight(color, intensity, distance, angle)` | Cone-shaped light |
| `HemisphereLight(skyColor, groundColor)` | Sky + ground gradient |

## Example Setup

```javascript
// Soft ambient fill
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// Key directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);
```

> **Tip**: Always combine ambient + directional for a balanced look. Pure ambient makes objects look flat.
