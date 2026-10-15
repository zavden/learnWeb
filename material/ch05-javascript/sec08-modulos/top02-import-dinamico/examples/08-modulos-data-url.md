---
example_description: "Un módulo entero dentro de una URL data:text/javascript; la URL es la clave del mapa de módulos: el mismo texto da el mismo módulo y un espacio de más da otro"
example_tags: "javascript|modulos|import-dinamico|data-url"
example_stage: minimal
example_importance: trivial
console: true
---

# JavaScript

```javascript
// Una URL data: lleva el contenido dentro: data:<tipo>,<datos codificados>.
// Con el tipo text/javascript, import() la carga como un módulo.
const code = "export const FREE_SHIPPING_FROM = 99900; export default 'reglas de envío v3';";
const url = `data:text/javascript,${encodeURIComponent(code)}`;
console.log('URL →', `${url.slice(0, 42)}…`);

const rules = await import(url);
console.log('rules.default →', rules.default, '| envío gratis desde →', rules.FREE_SHIPPING_FROM);

// El mapa de módulos usa la URL como clave: el mismo texto, el mismo módulo.
const again = await import(url);
console.log('¿el mismo texto, el mismo módulo? →', again === rules);

// Cualquier diferencia en el texto (un espacio codificado como %20) es otra
// URL y, por tanto, otro módulo, evaluado de nuevo.
const other = await import(`${url}%20`);
console.log('¿con un espacio más? →', other === rules);

// data: sirve para módulos diminutos (pruebas, configuración generada). Para
// código más largo, un Blob es mejor: la URL es corta y el texto no se
// codifica. Y, como en un blob, dentro no funcionan las rutas relativas.
```
