---
example_description: "font-family es una lista de deseos: el navegador usa la primera fuente que tiene; seis pilas y la fuente que dibuja cada una en Chrome para Mac"
example_tags: "css|tipografia|font-family|fuentes-del-sistema|familias-genericas"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Cada fila pide una pila distinta. Debajo, la fuente que dibuja el texto en <strong>Chrome para Mac</strong>; en Windows o Linux cambian casi todas. Compruébalo: ↗ → DevTools → <strong>Elements</strong> → <strong>Computed</strong> → <em>Rendered Fonts</em>.</p>

<ul class="stacks">
  <li>
    <code>Georgia, "Times New Roman", serif</code>
    <p class="sample georgia">Cigüeña: ¿quién pagó 1984&nbsp;€?</p>
    <p class="result">→ Georgia (también en Windows). Mira sus cifras: unas bajan de la línea</p>
  </li>
  <li>
    <code>"Helvetica Neue", Arial, sans-serif</code>
    <p class="sample helvetica">Cigüeña: ¿quién pagó 1984&nbsp;€?</p>
    <p class="result">→ Helvetica Neue. En Windows no existe: Arial</p>
  </li>
  <li>
    <code>system-ui, sans-serif</code>
    <p class="sample system">Cigüeña: ¿quién pagó 1984&nbsp;€?</p>
    <p class="result">→ San Francisco, la del sistema (Segoe UI en Windows)</p>
  </li>
  <li>
    <code>Menlo, Consolas, monospace</code>
    <p class="sample mono">Cigüeña: ¿quién pagó 1984&nbsp;€?</p>
    <p class="result">→ Menlo. En Windows, Consolas</p>
  </li>
  <li>
    <code>ui-serif, Georgia, serif</code>
    <p class="sample ui-serif">Cigüeña: ¿quién pagó 1984&nbsp;€?</p>
    <p class="result">→ Georgia: Chrome no entiende <code>ui-serif</code> (Safari sí, y daría New York) y pasa a la siguiente</p>
  </li>
  <li>
    <code>"Brandon Text", serif</code>
    <p class="sample missing">Cigüeña: ¿quién pagó 1984&nbsp;€?</p>
    <p class="result">→ Times: Brandon Text no está instalada y queda la genérica <code>serif</code></p>
  </li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.stacks {
  margin: 0;
  padding: 0;
  list-style: none;
}

.stacks li {
  padding: 6px 0;
  border-bottom: 1px solid #cbd5e1;
}

.stacks code {
  font-size: 0.75rem;
}

.sample {
  margin: 2px 0;
  font-size: 1.25rem;
}

.result {
  margin: 0;
  color: #334155;
  font-size: 0.75rem;
}

/* El navegador recorre la lista de izquierda a derecha y se queda con la PRIMERA
   fuente que tiene instalada (o descargada con @font-face). La última debe ser
   siempre una familia genérica: serif, sans-serif, monospace, system-ui…
   Los nombres con espacios van entre comillas; las genéricas, nunca. */
.georgia   { font-family: Georgia, "Times New Roman", serif; }
.helvetica { font-family: "Helvetica Neue", Arial, sans-serif; }
.system    { font-family: system-ui, sans-serif; }
.mono      { font-family: Menlo, Consolas, monospace; }

/* ui-serif, ui-sans-serif, ui-monospace y ui-rounded son genéricas que solo
   entiende Safari. Chrome las salta sin error, como a una fuente que no tiene. */
.ui-serif  { font-family: ui-serif, Georgia, serif; }

/* Una fuente comercial que el visitante no tiene: manda la genérica, que en
   Chrome para Mac es Times (se cambia en chrome://settings/fonts). */
.missing   { font-family: "Brandon Text", serif; }
```
