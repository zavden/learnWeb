---
example_description: "Un solo archivo que no se encuentra (una ruta sin .js, o una carpeta sin index.js) rompe el grafo entero: el import falla y no se evalúa ningún módulo, ni siquiera los que se descargaron bien"
example_tags: "javascript|modulos|rutas|404|extensiones|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/03-roto/):
//   app.js       → 🐛 import … from './format' (sin .js) + './analytics.js'
//   analytics.js → existe; avisa cuando se evalúa
//   format.js    → existe… como format.js
//   app-fixed.js → ✅ las dos rutas completas
// (import() se explica en la lección «Import dinámico»; aquí atrapa los errores.)

// 🐛 './format' no existe (el archivo es format.js): el servidor responde 404
//    y TODO el grafo de app.js falla. analytics.js se descargó bien, pero no
//    se evalúa: no aparece «(evaluando analytics.js)».
try {
  await import('./03-roto/app.js');
} catch (error) {
  console.log('🐛 app.js →', error.name, '|', error.message.split(': ')[0]);
}

// 🐛 El navegador tampoco busca index.js dentro de una carpeta.
try {
  await import('./03-roto');
} catch (error) {
  console.log('🐛 la carpeta 03-roto →', error.name, '|', error.message.split(': ')[0]);
}

// ✅ Con las rutas completas, todo carga. Ahora sí se evalúa analytics.js.
const { checkout } = await import('./03-roto/app-fixed.js');
console.log('✅', checkout(48720));

// El mensaje no dice qué archivo faltaba: míralo en la pestaña «Red» de
// DevTools (ábrelo con ↗), donde aparece la petición de «format» con un 404.
// Con un import estático, el script entero no se ejecuta: ni una línea.
```
