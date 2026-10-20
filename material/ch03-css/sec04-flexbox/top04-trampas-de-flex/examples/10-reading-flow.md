---
example_description: "reading-flow: flex-visual en el contenedor hace que el tabulador y el lector de pantalla sigan el orden visual de los elementos flex (Chrome 137+)"
example_tags: "css|flexbox|reading-flow|order|accesibilidad|teclado"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="support is-missing">⚠️ Tu navegador no entiende <code>reading-flow</code>: aquí el foco seguirá el orden del HTML, como en el ejemplo anterior.</p>
<p class="support is-available">✅ Tu navegador entiende <code>reading-flow</code>.</p>

<p class="label">⌨️ Haz clic en el texto que hay encima de cada caja y pulsa <kbd>Tab</kbd> varias veces: ahora el foco va en el orden en que se ve.</p>

<p class="caption">El mismo menú con <code>order: -1</code> en «Ofertas», más <code>reading-flow: flex-visual</code></p>
<nav class="menu" aria-label="Tienda">
  <a href="/tienda">Inicio</a>
  <a href="/tienda/catalogo">Catálogo</a>
  <a class="deals" href="/tienda/ofertas">Ofertas</a>
  <a href="/tienda/contacto">Contacto</a>
</nav>

<p class="caption">La misma paginación con <code>row-reverse</code>, más <code>reading-flow: flex-visual</code></p>
<nav class="pager" aria-label="Páginas">
  <a href="/blog?pagina=3">Siguiente »</a>
  <a href="/blog?pagina=3">3</a>
  <a href="/blog?pagina=2" aria-current="page">2</a>
  <a href="/blog?pagina=1">1</a>
  <a href="/blog?pagina=1">« Anterior</a>
</nav>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption,
.support {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.caption {
  color: #475569;
}

.support {
  padding: 4px 8px;
  border-radius: 6px;
  background: #fef3c7;
}

/* @supports aplica sus reglas solo si el navegador entiende la declaración (se
   explica en el módulo de responsive). Aquí elige cuál de los dos avisos se ve. */
.is-available {
  display: none;
  background: #dcfce7;
}

@supports (reading-flow: flex-visual) {
  .is-missing { display: none; }
  .is-available { display: block; }
}

.menu,
.pager {
  display: flex;
  gap: 6px;
  max-width: 400px;
  padding: 6px;
  outline: 2px dashed #7c3aed;
  font-size: 0.85rem;
}

.menu a,
.pager a {
  padding: 2px 8px;
  border: 1px solid #4338ca;
  border-radius: 6px;
  background: #e0e7ff;
  color: #1e293b;
}

.pager a[aria-current="page"] {
  background: #4338ca;
  color: #ffffff;
}

.menu a:focus-visible,
.pager a:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
  background: #fef08a;
  color: #1e293b;
}

.deals {
  order: -1;
}

.pager {
  flex-direction: row-reverse;
}

/* reading-flow se escribe en el CONTENEDOR y cambia el orden de lectura de sus hijos
   directos: el de la tecla Tab y el que reciben los lectores de pantalla. No mueve
   nada en pantalla.
   - normal (inicial): el orden del HTML.
   - flex-visual: el orden en que se VEN, en el sentido de lectura de la página
     (aquí, de izquierda a derecha), sea cual sea flex-direction u order.
   - flex-flow: el orden del eje flex (con row-reverse, de derecha a izquierda).
   Llegó en Chrome 137 (2025); otros navegadores pueden no tenerlo todavía, y entonces
   se ignora sin avisar y vuelve el problema del ejemplo anterior. Por eso, en código
   real, escribe el HTML en el orden de lectura y guarda reading-flow para cuando el
   orden visual cambie de verdad (por ejemplo, según el ancho de la pantalla). */
.menu,
.pager {
  reading-flow: flex-visual;
}
```
