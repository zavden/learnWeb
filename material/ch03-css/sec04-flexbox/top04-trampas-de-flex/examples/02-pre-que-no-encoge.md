---
example_description: "Un bloque de código con overflow: auto no muestra su scroll dentro de un elemento flex: el elemento no encoge por debajo de la línea más larga hasta que lleva min-width: 0"
example_tags: "css|flexbox|min-width|pre|overflow|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ El artículo no encoge: la línea del comando lo hace tan ancho como ella y todo se sale del contenedor</p>
<div class="docs">
  <nav class="toc" aria-label="Guía, versión con el error">
    <a href="/guia/instalar">Instalar</a>
    <a href="/guia/configurar">Configurar</a>
    <a href="/guia/publicar">Publicar</a>
  </nav>
  <article class="content">
    <h3>Instalar</h3>
    <p>Abre una terminal en la carpeta de tus proyectos y ejecuta:</p>
    <pre tabindex="0"><code>npm create vite@latest mi-tienda -- --template vanilla-ts && cd mi-tienda && npm install</code></pre>
  </article>
</div>

<p class="label">✅ <code>min-width: 0</code> en el artículo: encoge hasta caber y el <code>pre</code> desplaza su propia línea</p>
<div class="docs is-fixed">
  <nav class="toc" aria-label="Guía, versión corregida">
    <a href="/guia/instalar">Instalar</a>
    <a href="/guia/configurar">Configurar</a>
    <a href="/guia/publicar">Publicar</a>
  </nav>
  <article class="content">
    <h3>Instalar</h3>
    <p>Abre una terminal en la carpeta de tus proyectos y ejecuta:</p>
    <pre tabindex="0"><code>npm create vite@latest mi-tienda -- --template vanilla-ts && cd mi-tienda && npm install</code></pre>
  </article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.docs {
  display: flex;
  gap: 12px;
  max-width: 400px;
  padding: 8px;
  outline: 2px dashed #7c3aed;
  font-size: 0.8rem;
}

.toc {
  display: flex;
  flex-direction: column;
  flex: 0 0 80px;
  gap: 4px;
}

.toc a {
  color: #1d4ed8;
}

.content h3 {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.content p {
  margin: 0 0 6px;
}

pre {
  margin: 0;
  padding: 8px;
  overflow-x: auto;      /* si no cabe, scroll horizontal… en teoría */
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
}

a:focus-visible,
pre:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* El artículo ocupa lo que deje el índice: flex: 1 (base 0, crece). */
.content {
  flex: 1;
}

/* 🐛 Pero un elemento flex tiene min-width: auto = el ancho mínimo de su contenido.
   Una línea de <pre> no se puede partir, así que el mínimo del artículo es la línea
   entera (unos 600px). El artículo se congela ahí, el contenedor se desborda y la
   página entera gana scroll horizontal. El overflow-x: auto del pre no llega a
   actuar nunca: su padre ya es tan ancho como él. */

/* ✅ Quita el suelo en el ELEMENTO FLEX (el artículo), no en el pre. Ahora el artículo
   mide lo que le corresponde y el pre, más estrecho que su línea, muestra su scroll.
   (overflow: hidden en el artículo también lo quitaría, pero recortaría cualquier
   cosa que sobresalga, como los anillos de foco.) */
.is-fixed .content {
  min-width: 0;
}
```
