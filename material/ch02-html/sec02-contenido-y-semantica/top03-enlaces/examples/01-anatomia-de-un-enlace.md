---
example_description: "a con href absoluto, relativo, desde la raíz o de fragmento: el navegador lo resuelve siempre a una URL completa"
example_tags: "html|enlaces|href|url"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Un enlace es un <a> (anchor, «ancla») con href (hypertext reference: a dónde lleva)
     y un texto que dice a dónde lleva. Por defecto: azul y subrayado; morado si ya lo
     visitaste. -->

<!-- Absoluta: la URL completa, con esquema y host. Para enlazar a OTROS sitios. -->
<p>Consulta la <a href="https://developer.mozilla.org/es/docs/Web/HTML/Element/a">referencia de MDN sobre el elemento a</a>.</p>

<!-- Relativa: se resuelve contra la URL de ESTE documento. Para las páginas de tu sitio. -->
<p>Escríbenos desde la <a href="pages/contact.html">página de contacto</a>.</p>

<!-- Desde la raíz: empieza por / y va a la raíz del servidor, esté donde esté la página -->
<p><a href="/">Raíz del servidor</a></p>

<!-- Fragmento: empieza por # y lleva a un elemento con ese id, en esta misma página -->
<p><a href="#legal">Ir al aviso legal</a></p>

<p id="legal"><small>Aviso legal: los horarios pueden cambiar en verano.</small></p>
```

# JavaScript

```javascript
// getAttribute('href') devuelve lo que escribiste; la propiedad href, la URL completa
// que pedirá el navegador al hacer clic (las rutas relativas, en «Cómo funciona la web»).
for (const link of document.querySelectorAll('a')) {
  console.log(link.getAttribute('href'), '→', link.href);
}
```
