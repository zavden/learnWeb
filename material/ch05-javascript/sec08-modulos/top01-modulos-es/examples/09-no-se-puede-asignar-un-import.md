---
example_description: "Un import es de solo lectura: asignarle un valor lanza TypeError: Assignment to constant variable (y el espacio de nombres tampoco se puede cambiar); el módulo dueño exporta una función para cambiarlo"
example_tags: "javascript|modulos|live-bindings|import|typeerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/08-vivas/settings.js (el del ejemplo 08):
//   export let currency = 'MXN';
//   export function setCurrency(code) { currency = code; }
import { currency, setCurrency } from './08-vivas/settings.js';
import * as settings from './08-vivas/settings.js';

// 🐛 Aunque en settings.js sea un let, aquí el import es de solo lectura,
//    como una const: solo el módulo que lo declara puede reasignarlo.
try {
  currency = 'EUR';
} catch (error) {
  console.log('🐛 currency = …  →', error.name, '|', error.message);
}

// 🐛 Por el espacio de nombres tampoco se puede.
try {
  settings.currency = 'EUR';
} catch (error) {
  console.log('🐛 settings.currency = …  →', error.name, '|', error.message);
}

// ✅ El módulo dueño decide cómo se cambia: exporta una función.
setCurrency('EUR');
console.log('✅ setCurrency(\'EUR\') → currency:', currency);

// Esto protege la VARIABLE, no lo que contiene: si el módulo exportara un
// objeto, cualquiera podría cambiar sus propiedades (lección «Organizar el
// código»). Un error así no se puede detectar antes de ejecutar: el
// navegador solo lo descubre al llegar a la asignación.
```
