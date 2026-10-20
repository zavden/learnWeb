---
example_description: "La configuración de la tienda en módulos JSON: base.json estático, el archivo de cada entorno con import() y with { type: 'json' }, una mezcla que no toca el JSON compartido, una validación que lista todos los problemas y un resultado congelado a fondo"
example_tags: "javascript|profesional|modulos|json|import-attributes|validacion|configuracion"
example_stage: professional
example_importance: useful
console: true
---

# JavaScript

```javascript
// LA CONFIGURACIÓN DE LA TIENDA, POR ENTORNO Y VALIDADA.
//
// Archivos (assets/12-config/):
//   base.json       → todo lo común (tienda, API local, envíos, pagos, funciones)
//   production.json → lo que cambia en producción
//   staging.json    → un entorno de pruebas con SEIS errores
//   schema.js       → validadores pequeños y validate(valor, esquema)
//   config.js       → loadConfig(entorno): mezcla, valida, congela
//
// Decisiones (detalladas en config.js):
// - La base, con un import estático; cada entorno, con import() y su
//   atributo JSON: solo se descarga el del entorno que arranca.
// - La mezcla copia (structuredClone) en vez de modificar: base.json es un
//   módulo, y el mismo objeto lo reciben todos los que lo importan.
// - La validación junta TODOS los problemas con su ruta: se arreglan de una
//   vez, no uno por despliegue.
// - La configuración final está congelada a fondo.
//
// Alcance: módulos 1-8.
import { loadConfig, ConfigError } from './12-config/config.js';
import base from './12-config/base.json' with { type: 'json' };

for (const environment of ['development', 'production']) {
  const config = await loadConfig(environment);
  console.group(`▶ ${environment}`);
  console.log('API →', config.api.baseUrl, `(plazo de ${config.api.timeoutMs} ms)`);
  console.log('pagos →', config.payments.methods.join(', '), '| envolver para regalo →', config.features.giftWrap);
  console.log('envío gratis desde →', config.shipping.freeFromCents, 'centavos |', config.shop.timeZone);
  console.groupEnd();
}

const production = await loadConfig('production');
try {
  production.features.giftWrap = false;
} catch (error) {
  console.log('⛔ la configuración está congelada →', error.name);
}

console.group('▶ staging');
try {
  await loadConfig('staging');
  console.log('cargada (no debería)');
} catch (error) {
  if (!(error instanceof ConfigError)) throw error;
  console.log('⛔', error.message);
  for (const problem of error.problems) console.log('·', problem);
}
console.groupEnd();

console.log('¿base.json sigue intacto tras cargar los entornos? →', base.features.giftWrap === false && base.payments.methods.length === 2);

try {
  await loadConfig('qa');
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}

// > Desde Python: es lo que hacen pydantic-settings o un dataclass con
//   validación al cargar un .toml o un .json por entorno.
```
