---
example_description: "document es la raíz del árbol: de él cuelgan <html>, <head> y <body>; el script de cada ejemplo es el último elemento del <body>, así que todo el HTML de encima ya existe cuando se ejecuta"
example_tags: "javascript|dom|document|arbol|script"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main id="app">
  <h1>Recetario</h1>
  <p>Platos de México y de España, paso a paso.</p>
</main>
```

# JavaScript

```javascript
// document es el objeto que representa la página entera: la raíz del árbol.
console.log('document →', document);
console.log('document.nodeName →', document.nodeName);

// Sus atajos a los tres elementos que toda página tiene:
console.log('documentElement →', document.documentElement.nodeName); // <html>
console.log('head →', document.head.nodeName, '| body →', document.body.nodeName);
console.log('hijos de <html> →', [...document.documentElement.children].map((el) => el.nodeName));
console.log('lang de la página →', document.documentElement.lang);

// ¿Dónde está este script? currentScript es el <script> que se está
// ejecutando ahora mismo (en un script clásico; en un módulo vale null).
const thisScript = document.currentScript;
console.log('¿el script está dentro del <body>? →', thisScript.parentElement === document.body);
console.log('el elemento anterior al script →', thisScript.previousElementSibling);

// Como el script va al final del <body>, todo tu HTML ya está en el árbol…
console.log('¿ya existe #app? →', document.querySelector('#app') !== null);
// …aunque el parser todavía no ha terminado: le queda el cierre del documento.
console.log('readyState →', document.readyState);

// Abre DevTools (↗ y luego ⌥⌘I) y mira el panel Elements: es este árbol.
```
