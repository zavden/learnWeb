---
example_description: "El DOCTYPE también cambia el parser: en quirks mode una tabla no cierra el párrafo"
example_tags: "integracion|quirks-mode|parser|tablas|doctype"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<h1>El mismo HTML, dos árboles</h1>
<p>El modo del documento no solo cambia el CSS: también una regla del parser. Mira la consola.</p>
```

# JavaScript

```javascript
// DOMParser (JavaScript) analiza un texto con el parser del navegador. Le damos el mismo
// HTML dos veces: una con DOCTYPE (modo estándar) y otra sin él (quirks mode).
const markup = '<p>Texto antes de la tabla<table><tr><td>celda</td></tr></table>';

const standards = new DOMParser().parseFromString('<!DOCTYPE html>' + markup, 'text/html');
const quirks = new DOMParser().parseFromString(markup, 'text/html');

// En modo estándar, <table> cierra el párrafo abierto (como un div).
console.log('con DOCTYPE →', standards.compatMode, '\n' + standards.body.innerHTML);
// En quirks mode, por compatibilidad con los 90, la tabla queda DENTRO del párrafo.
console.log('sin DOCTYPE →', quirks.compatMode, '\n' + quirks.body.innerHTML);
```
