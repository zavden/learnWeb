---
example_description: "La puerta de WebGPU: navigator.gpu (solo en contextos seguros) y requestAdapter(), que da un adaptador, una GPU concreta. adapter.info dice el fabricante y la familia; el navegador oculta el modelo exacto. Los valores dependen de la máquina"
example_tags: "javascript|webgpu|navigator-gpu|requestadapter|adaptador|soporte"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// WebGPU no sale de un <canvas>: sale de navigator.gpu. Solo existe en navegadores que lo
// tienen y en contextos seguros (https, localhost; también en las tarjetas de LearnWeb).
console.log("'gpu' in navigator →", 'gpu' in navigator);
console.log('isSecureContext →', isSecureContext);

// El ADAPTADOR representa una GPU concreta con su driver. Pedirlo es asíncrono (una promesa).
// El ?. evita un TypeError si navigator.gpu no existe: entonces adapter es undefined.
const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) {
  console.log('Sin adaptador: este equipo no puede usar WebGPU ahora mismo');
} else {
  // adapter.info: quién fabrica la GPU y de qué familia es
  console.log('fabricante →', adapter.info.vendor);
  console.log('arquitectura →', adapter.info.architecture);
  // El modelo exacto identificaría tu equipo entre millones: el navegador lo deja vacío
  console.log('modelo y descripción →', JSON.stringify(adapter.info.device), JSON.stringify(adapter.info.description));
  // Un adaptador «de reserva» emula la GPU en la CPU: funciona, pero lento
  console.log('¿de reserva (por software)? →', adapter.info.isFallbackAdapter);
}
```
