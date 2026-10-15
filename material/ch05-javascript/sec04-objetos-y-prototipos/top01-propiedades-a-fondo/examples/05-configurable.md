---
example_description: "configurable: false es una puerta de un solo sentido: la propiedad no se puede borrar ni redefinir, solo cerrar más (writable de true a false)"
example_tags: "javascript|objetos|configurable|defineproperty|var"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
const config = {};
Object.defineProperty(config, 'apiUrl', {
  value: 'https://api.example.com/v2',
  writable: true,     // el valor sí puede cambiar…
  enumerable: true,
  configurable: false, // …pero la propiedad no se puede borrar ni reconfigurar
});

// No se puede borrar: delete devuelve false (en modo estricto, TypeError).
console.log('delete config.apiUrl →', delete config.apiUrl);
console.log('config.apiUrl →', config.apiUrl);

// Como es writable, el valor sí cambia:
config.apiUrl = 'https://staging.example.com/v2';
console.log('nuevo valor →', config.apiUrl);

// No se pueden cambiar sus atributos…
try {
  Object.defineProperty(config, 'apiUrl', { enumerable: false });
} catch (error) {
  console.log('cambiar enumerable →', error.name, '|', error.message);
}

// …salvo «cerrar más»: pasar writable de true a false está permitido…
Object.defineProperty(config, 'apiUrl', { writable: false });
// …y no tiene vuelta atrás.
try {
  Object.defineProperty(config, 'apiUrl', { writable: true });
} catch (error) {
  console.log('volver a writable →', error.name, '|', error.message);
}
console.log('descriptor final →', Object.getOwnPropertyDescriptor(config, 'apiUrl'));

// Un caso que ya conoces: var en el nivel superior crea una propiedad de window
// con configurable: false. Por eso no se puede borrar.
var appVersion = '3.1.0';
console.log('window.appVersion →', Object.getOwnPropertyDescriptor(window, 'appVersion'));
console.log('delete window.appVersion →', delete window.appVersion); // false
```
