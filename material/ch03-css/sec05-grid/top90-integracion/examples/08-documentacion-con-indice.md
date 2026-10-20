---
example_description: "Una página de documentación: índice lateral sticky que se pega gracias a align-self: start, contenido con minmax(0, 1fr) para que el bloque de código se desplace en vez de ensanchar la página, y una tabla de parámetros con subgrid"
example_tags: "css|grid|sticky|align-self|minmax|subgrid|documentacion"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">↕ Desplaza la página: el índice se queda arriba. ↔ El bloque de código se desplaza dentro de su caja.</p>

<div class="viewport" tabindex="0" role="region" aria-label="Documentación de la API de riego">
  <div class="docs">
    <nav class="toc" aria-label="En esta página">
      <p class="toc-title">En esta página</p>
      <ul>
        <li><a href="#instalar">Instalar</a></li>
        <li><a href="#programar">Programar un riego</a></li>
        <li><a href="#parametros">Parámetros</a></li>
        <li><a href="#errores">Errores</a></li>
      </ul>
    </nav>

    <article class="content">
      <h2 id="instalar">Instalar</h2>
      <p>El controlador se conecta a la red de casa y responde en el puerto 8080.</p>
      <pre><code>curl -X POST http://riego.local:8080/api/v1/zonas/jardin-trasero/programas --data '{"inicio":"06:30","minutos":12}'</code></pre>

      <h2 id="programar">Programar un riego</h2>
      <p>Cada zona admite hasta cuatro programas al día. Si dos se solapan, el controlador ejecuta el primero y pospone el segundo.</p>

      <h2 id="parametros">Parámetros</h2>
      <dl class="params">
        <div><dt><code>inicio</code></dt><dd>texto</dd><dd>Hora de inicio, en formato 24 h («06:30»).</dd></div>
        <div><dt><code>minutos</code></dt><dd>número</dd><dd>Duración, de 1 a 60.</dd></div>
        <div><dt><code>dias</code></dt><dd>lista</dd><dd>Días de la semana; si falta, todos.</dd></div>
      </dl>

      <h2 id="errores">Errores</h2>
      <p>Una respuesta 409 significa que la zona ya tiene cuatro programas. Borra uno antes de crear otro.</p>
    </article>
  </div>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Documentación con índice
   - .viewport hace de ventana del navegador (alto fijo y scroll).
   - .docs: dos columnas. El índice, a su medida (max-content con un tope de
     9rem); el contenido, minmax(0, 1fr): sin mínimo automático, el <pre> no lo
     ensancha y su overflow-x: auto puede trabajar.
   - El índice es sticky y lleva align-self: start; sin él, la fila lo estiraría
     hasta el alto del artículo y no tendría recorrido.
   - Parámetros: cada fila es un <div> con subgrid, así las tres columnas (nombre,
     tipo y descripción) quedan alineadas en todas las filas.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.label {
  margin: 0 0 8px;
  font-size: 0.8rem;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.viewport {
  max-width: 30rem;
  height: 300px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
  border-radius: 8px;
}

.docs {
  display: grid;
  grid-template-columns: fit-content(9rem) minmax(0, 1fr);
  gap: 16px;
  padding: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.toc {
  position: sticky;
  top: 0;
  align-self: start;
  padding: 8px;
  border-left: 3px solid #0f766e;
  background: #f0fdfa;
  font-size: 0.8rem;
}

.toc-title {
  margin: 0 0 4px;
  font-weight: bold;
}

.toc ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc a {
  color: #0f5c55;
}

.content h2 {
  margin: 16px 0 4px;
  font-size: 1rem;
}

.content h2:first-child {
  margin-top: 0;
}

.content p {
  margin: 0 0 8px;
}

.content pre {
  margin: 0 0 8px;
  padding: 8px;
  overflow-x: auto;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.75rem;
}

/* Tres columnas en el dl; cada fila (div) las hereda con subgrid. */
.params {
  display: grid;
  grid-template-columns: max-content max-content minmax(0, 1fr);
  column-gap: 10px;               /* las filas lo heredan con subgrid */
  margin: 0 0 8px;
  border-top: 1px solid #cbd5e1;
}

.params div {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  padding: 4px 0;
  border-bottom: 1px solid #cbd5e1;
}

.params dd {
  margin: 0;
}

.params dd:first-of-type {
  color: #475569;
}
```
