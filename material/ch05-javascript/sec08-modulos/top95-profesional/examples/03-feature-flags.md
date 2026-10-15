---
example_description: "Feature flags con módulos bajo demanda: la configuración es un módulo JSON, cada función nueva se carga con import() solo para quien la tiene activa, el reparto por porcentaje es determinista (un hash) y un módulo roto se apaga sin romper la página"
example_tags: "javascript|profesional|modulos|import-dinamico|feature-flags|json|rollout"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// FEATURE FLAGS CON MÓDULOS BAJO DEMANDA.
//
// Archivos (assets/03-flags/):
//   flags.json → { flag: { enabled, rollout (0-100), allow?, description } }
//   flags.js   → isEnabled(flag, usuario), loadFeature(flag, usuario), bucketOf()
//   features/new-checkout.js, gift-wrap.js, dark-mode.js → export default { label, render() }
//   features/recommendations.js → importa ./model.js, que NO existe (un despliegue a medias)
//
// Decisiones (detalladas en flags.js):
// - Activar una función para el 50 % no es tirar una moneda en cada visita:
//   un hash de «flag:usuario» da a cada persona un cubo fijo de 0 a 99.
// - Lo que no está activo no se descarga: cada función es un import() con su
//   ruta escrita entera (un archivo aparte con un empaquetador).
// - Una función que no carga se registra una vez y la página sigue sin ella.
//
// Alcance: módulos 1-8.
import { FLAG_NAMES, bucketOf, isEnabled, loadFeature, loadedFeatures } from './03-flags/flags.js';

const USERS = ['U-001', 'U-002', 'U-003', 'U-004', 'U-005', 'U-006', 'U-007', 'U-008'];
const failures = new Map(); // flag → primer error (no repetimos el aviso por persona)
const onError = (flag, error) => {
  if (!failures.has(flag)) failures.set(flag, `${error.name}: ${error.message.split(': ')[0]}`);
};

const order = { total: '$1,179.00' };
console.group('▶ lo que ve cada persona');
for (const userId of USERS) {
  const active = FLAG_NAMES.filter((flag) => isEnabled(flag, userId));
  const features = (await Promise.all(active.map((flag) => loadFeature(flag, userId, { onError })))).filter(Boolean);
  const view = features.map((feature) => feature.render(order)).join(' · ') || 'la tienda de siempre';
  console.log(`${userId} (cubo ${String(bucketOf('new-checkout', userId)).padStart(2)}) → ${view}`);
}
console.groupEnd();

console.log('módulos de funciones descargados →', [...loadedFeatures].join(', '));
for (const [flag, reason] of failures) console.log(`⚠️ «${flag}» no se pudo cargar (${reason}): apagada en esta página`);

console.group('▶ el reparto');
const sample = Array.from({ length: 1000 }, (_, index) => `U-${String(index + 1).padStart(4, '0')}`);
const inRollout = sample.filter((userId) => isEnabled('new-checkout', userId)).length;
console.log('new-checkout (rollout 50 %) para 1000 personas →', inRollout);
console.log('¿la misma persona, el mismo cubo? →', bucketOf('new-checkout', 'U-003') === bucketOf('new-checkout', 'U-003'));
console.log('¿cubos independientes entre flags? →', sample.filter((userId) => bucketOf('new-checkout', userId) === bucketOf('gift-wrap', userId)).length, 'de 1000 coinciden (al azar se esperan unas 10)');
console.groupEnd();

console.group('▶ una persona de QA fuerza el tema oscuro');
const darkMode = await loadFeature('dark-mode', 'U-QA', { overrides: { 'dark-mode': true } });
console.log('dark-mode →', darkMode?.render());
console.log('módulos de funciones descargados →', [...loadedFeatures].join(', '));
console.groupEnd();

// Con enabled: false en flags.json, una función desaparece para todos en el
// siguiente arranque, sin tocar el código: el «interruptor de emergencia».
// En una tienda real, la configuración vendría del servidor (fetch, capítulo 6)
// y los overrides de QA, de la URL (?flags=dark-mode).
```
