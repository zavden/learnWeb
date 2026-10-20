---
example_description: "Heredar (Object.create) mantiene un enlace en vivo con la base; copiar (spread, Object.assign) hace una foto independiente. JSON.stringify solo ve lo propio"
example_tags: "javascript|herencia|delegacion|spread|object-assign|json"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const siteDefaults = { theme: 'light', fontSize: 16, language: 'es' };

// DELEGAR: el objeto solo guarda lo que cambia; el resto lo busca en la base.
const delegated = Object.create(siteDefaults);
delegated.theme = 'dark';

// COPIAR: el objeto recibe una foto de la base en este momento.
const copied = { ...siteDefaults, theme: 'dark' };

console.log('propias de delegated →', Object.keys(delegated)); // ['theme']
console.log('propias de copied →', Object.keys(copied));       // ['theme', 'fontSize', 'language']

// La base cambia después (por ejemplo, una actualización de la configuración):
siteDefaults.fontSize = 18;
console.log('delegated.fontSize →', delegated.fontSize); // 18: enlace en vivo
console.log('copied.fontSize →', copied.fontSize);       // 16: la foto no cambia

// ⚠️ Lo que no es propio no viaja: JSON.stringify, el spread y Object.keys
// solo ven las propiedades propias del objeto delegado.
console.log('JSON delegated →', JSON.stringify(delegated)); // {"theme":"dark"}
console.log('JSON copied →', JSON.stringify(copied));
console.log('spread delegated →', { ...delegated });         // {theme: 'dark'}

// Para «aplanar» un objeto delegado (propio + heredado), recorre con for…in:
const flattened = {};
for (const key in delegated) flattened[key] = delegated[key];
console.log('aplanado →', flattened);

// Resumen:
//   delegar → ahorra memoria, ve los cambios de la base, no se serializa entero
//   copiar  → independiente y completo, pero no se entera de los cambios
```
