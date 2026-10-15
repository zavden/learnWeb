---
example_description: "En una página en árabe, la flecha de «siguiente» tiene que apuntar a la izquierda, hacia donde avanza la lectura: :dir(rtl) con scale: -1 1 refleja los iconos con dirección; los que no la tienen (una lupa) se quedan como están"
example_tags: "css|transformaciones|scale|espejo|rtl|dir|iconos|modos-de-escritura"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">El mismo componente en español y en árabe (<code>dir="rtl"</code>). La flecha tiene dirección; la lupa, no.</p>

<p class="label">❌ Sin reflejar: en árabe, «التالي» (siguiente) apunta hacia atrás</p>
<div class="pair">
  <nav class="pager" aria-label="Paginación"><a href="/catalogo?pagina=2">Siguiente<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h11.2l-4.6-4.6L12 5l7 7-7 7-1.4-1.4 4.6-4.6H4z"/></svg></a></nav>
  <nav class="pager" lang="ar" dir="rtl" aria-label="ترقيم الصفحات"><a href="/catalogo?pagina=2">التالي<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h11.2l-4.6-4.6L12 5l7 7-7 7-1.4-1.4 4.6-4.6H4z"/></svg></a></nav>
</div>

<p class="label">✅ <code>.is-directional:dir(rtl) { scale: -1 1 }</code>: la flecha mira hacia donde avanza la lectura</p>
<div class="pair">
  <nav class="pager" aria-label="Paginación"><a href="/catalogo?pagina=2">Siguiente<svg class="icon is-directional" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h11.2l-4.6-4.6L12 5l7 7-7 7-1.4-1.4 4.6-4.6H4z"/></svg></a></nav>
  <nav class="pager" lang="ar" dir="rtl" aria-label="ترقيم الصفحات"><a href="/catalogo?pagina=2">التالي<svg class="icon is-directional" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h11.2l-4.6-4.6L12 5l7 7-7 7-1.4-1.4 4.6-4.6H4z"/></svg></a></nav>
</div>

<p class="label">Una lupa no tiene dirección: se queda igual en los dos idiomas</p>
<div class="pair">
  <p class="search"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>Buscar</p>
  <p class="search" lang="ar" dir="rtl"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>بحث</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 10px 0 6px;
  font-size: 0.72rem;
}

.pair {
  display: flex;
  gap: 12px;
}

.pager,
.search {
  flex: 1;
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f1f5f9;
}

/* El flex del enlace ya coloca el icono al FINAL de la línea en los dos
   idiomas (a la derecha en español, a la izquierda en árabe): eso lo hace
   el modo de escritura. Lo que no cambia solo es el DIBUJO de la flecha. */
.pager a,
.search {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #1d4ed8;
  font-weight: 600;
}

.search {
  display: flex;
  color: #1e293b;
}

.icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* :dir(rtl) pregunta por la dirección que el elemento hereda del HTML (lección
   de modos de escritura). scale: -1 1 refleja en horizontal: es lo mismo que
   transform: scaleX(-1), pero como propiedad suelta no pisa otros transform. */
.is-directional:dir(rtl) {
  scale: -1 1;
}
```
