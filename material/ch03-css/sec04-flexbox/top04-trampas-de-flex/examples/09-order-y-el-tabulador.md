---
example_description: "order y row-reverse cambian el orden en que se ven los elementos, pero no el de la tecla Tab ni el del lector de pantalla: el foco salta de un lado a otro"
example_tags: "css|flexbox|order|row-reverse|accesibilidad|teclado|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">⌨️ Haz clic en el texto que hay encima de cada caja y pulsa <kbd>Tab</kbd> varias veces. Mira por dónde va el foco.</p>

<p class="caption">❌ <code>order: -1</code> en «Ofertas»: se ve la primera, pero el foco llega a ella en tercer lugar</p>
<nav class="menu" aria-label="Tienda, versión con order">
  <a href="/tienda">Inicio</a>
  <a href="/tienda/catalogo">Catálogo</a>
  <a class="deals" href="/tienda/ofertas">Ofertas</a>
  <a href="/tienda/contacto">Contacto</a>
</nav>

<p class="caption">❌ <code>row-reverse</code> para pegar la paginación a la derecha, con el HTML escrito al revés: el foco va de derecha a izquierda</p>
<nav class="pager is-reversed" aria-label="Páginas, versión con row-reverse">
  <a href="/blog?pagina=3">Siguiente »</a>
  <a href="/blog?pagina=3">3</a>
  <a href="/blog?pagina=2" aria-current="page">2</a>
  <a href="/blog?pagina=1">1</a>
  <a href="/blog?pagina=1">« Anterior</a>
</nav>

<p class="caption">✅ El HTML en el orden en que se lee, sin <code>order</code> ni <code>row-reverse</code>; a la derecha con <code>justify-content: flex-end</code></p>
<nav class="pager" aria-label="Páginas, versión correcta">
  <a href="/blog?pagina=1">« Anterior</a>
  <a href="/blog?pagina=1">1</a>
  <a href="/blog?pagina=2" aria-current="page">2</a>
  <a href="/blog?pagina=3">3</a>
  <a href="/blog?pagina=3">Siguiente »</a>
</nav>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.caption {
  color: #475569;
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

/* Un foco imposible de perder de vista: así se ve bien adónde salta. */
.menu a:focus-visible,
.pager a:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
  background: #fef08a;
  color: #1e293b;
}

/* 🐛 order cambia la posición VISUAL de un elemento flex (por defecto todos tienen
   order: 0; los de número menor van antes). El HTML no cambia: el tabulador y el
   lector de pantalla siguen el orden del documento. Resultado con el teclado:
   Inicio → Catálogo → Ofertas (salta a la izquierda) → Contacto (salta a la derecha). */
.deals {
  order: -1;
}

/* 🐛 row-reverse invierte el eje: el primer elemento del HTML se coloca a la derecha.
   Alguien lo usó para pegar los enlaces a la derecha y, para que se leyeran bien,
   escribió el HTML al revés. Se ve perfecto, pero el foco recorre la paginación de
   derecha a izquierda, y el lector de pantalla dice «Siguiente» antes que «Anterior». */
.is-reversed {
  flex-direction: row-reverse;
}

/* ✅ Para alinear a la derecha no hace falta invertir nada: justify-content. */
.pager:not(.is-reversed) {
  justify-content: flex-end;
}
```
