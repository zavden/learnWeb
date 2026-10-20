---
example_description: "var de nivel superior crea una propiedad de window y puede chocar con las del navegador (var name)"
example_tags: "javascript|variables|var|window|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// En un script clásico, var en el nivel superior crea una PROPIEDAD de window,
// el objeto global del navegador.
var appTitle = 'Mi app';
console.log('window.appTitle →', window.appTitle); // 'Mi app'

// let y const de nivel superior también son globales, pero NO tocan window.
let appVersion = '1.0';
console.log('appVersion →', appVersion);                  // '1.0'
console.log('window.appVersion →', window.appVersion);    // undefined

// 🐛 Por eso var puede chocar con propiedades que el navegador ya tiene.
// window.name existe (es el nombre de la ventana) y SIEMPRE guarda texto.
// (typeof da el tipo de un valor: lo verás en la lección siguiente.)
var name = 42;
console.log('var name = 42 →', name, '| typeof:', typeof name); // '42', 'string'

// Con «let name = 42;» obtendrías un number: let no toca window.name.
// (No está aquí porque declarar el mismo nombre con var y con let en el
// mismo script es un SyntaxError.)

// En los módulos (type="module") var de nivel superior ya no se cuelga de window.
```
