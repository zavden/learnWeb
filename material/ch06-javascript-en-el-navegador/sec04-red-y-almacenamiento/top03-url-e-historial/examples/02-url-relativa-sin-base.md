---
example_description: "new URL('/carrito') lanza «TypeError: Failed to construct 'URL': Invalid URL»: una ruta relativa necesita una base (una URL fija o document.baseURI). URL.canParse y URL.parse comprueban sin lanzar; con ellas y protocol se valida un campo «sitio web»"
example_tags: "javascript|url|base|canparse|validacion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const link = '/carrito?cupon=BIENVENIDA';

// 🐛 Una ruta relativa no es una URL completa: new URL no sabe a qué sitio va.
try {
  new URL(link);
} catch (error) {
  console.log('🐛 new URL(relativa) →', `${error.name}: ${error.message}`);
}

// Comprobar sin lanzar: URL.canParse (booleano) y URL.parse (URL o null).
console.log('URL.canParse(relativa) →', URL.canParse(link));
console.log('URL.parse(relativa) →', URL.parse(link));

// ✅ Con una base fija…
console.log('✅ base fija →', new URL(link, 'https://tienda.example/catalogo/').href);

// ✅ …o con la base de la página, la misma que usan sus enlaces.
const here = new URL(link, document.baseURI);
console.log('✅ base de la página → pathname:', here.pathname, '| cupón:', here.searchParams.get('cupon'));

// Validar el campo «Tu sitio web» de un formulario: que sea una URL completa
// Y de la web (protocol http: o https:). Un enlace javascript: o data: en un
// href ejecutaría código (lección «Crear y modificar elementos», XSS).
function isWebAddress(text) {
  const url = URL.parse(text.trim());
  return url !== null && ['http:', 'https:'].includes(url.protocol);
}
for (const text of ['https://cafe-chiapas.example', 'cafe-chiapas.example', 'javascript:alert(1)', ' http://mole.example/ ']) {
  console.log(`  ${JSON.stringify(text)} → ${isWebAddress(text) ? '✅ válida' : '⛔ no válida'}`);
}

// En Python, urljoin('', '/carrito') devuelve '/carrito' sin quejarse. En
// JavaScript, una URL siempre es ABSOLUTA: si no hay base, no hay URL.
```
