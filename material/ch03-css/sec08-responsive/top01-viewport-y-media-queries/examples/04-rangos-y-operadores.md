---
example_description: "Una tabla que se rellena sola: cada fila es una media query (rangos, orientation, and, or, not, comas, tipo de medio) y dice si se cumple en este viewport. Una consulta que mezcla and y or sin paréntesis es inválida y nunca se cumple"
example_tags: "css|responsive|media-queries|rangos|and|or|not|orientation"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Cambia el ancho y el alto de la vista previa (o de la ventana, con ↗): la columna de la derecha se recalcula. 25rem = 400px; 40rem = 640px. La tarjeta mide 480px de ancho y es más ancha que alta (<em>landscape</em>).</p>

<table class="queries">
  <thead>
    <tr><th scope="col">Media query</th><th scope="col">¿Se cumple?</th></tr>
  </thead>
  <tbody>
    <tr class="q1"><td><code>(width &gt;= 25rem)</code></td><td class="status"></td></tr>
    <tr class="q2"><td><code>(25rem &lt;= width &lt; 40rem)</code></td><td class="status"></td></tr>
    <tr class="q3"><td><code>(orientation: landscape)</code></td><td class="status"></td></tr>
    <tr class="q4"><td><code>(width &gt;= 25rem) and (orientation: portrait)</code></td><td class="status"></td></tr>
    <tr class="q5"><td><code>(width &lt; 25rem) or (orientation: landscape)</code></td><td class="status"></td></tr>
    <tr class="q6"><td><code>(width &lt; 25rem), (orientation: landscape)</code></td><td class="status"></td></tr>
    <tr class="q7"><td><code>not (width &gt;= 40rem)</code></td><td class="status"></td></tr>
    <tr class="q8"><td><code>print</code></td><td class="status"></td></tr>
    <tr class="q9"><td>🐛 <code>(width &gt;= 25rem) and (hover) or (orientation: landscape)</code></td><td class="status"></td></tr>
  </tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 8px;
  font-size: 0.72rem;
}

.queries {
  border-collapse: collapse;
  font-size: 0.75rem;
}

.queries th,
.queries td {
  padding: 3px 8px;
  border: 1px solid #cbd5e1;
  text-align: start;
}

/* Cada fila lee dos custom properties; si nadie las define, «no» en gris.
   Cada media query las define para SU fila: «sí» en verde. */
.status {
  white-space: nowrap;
  background: var(--status-bg, #f1f5f9);
  font-weight: 700;
}

.status::after {
  content: var(--status-text, "✗ no");
}

@media (width >= 25rem) {
  .q1 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@media (25rem <= width < 40rem) {
  .q2 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@media (orientation: landscape) {
  .q3 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@media (width >= 25rem) and (orientation: portrait) {
  .q4 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@media (width < 25rem) or (orientation: landscape) {
  .q5 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* La coma separa consultas independientes: basta con que se cumpla una (como or). */
@media (width < 25rem), (orientation: landscape) {
  .q6 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@media not (width >= 40rem) {
  .q7 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* Un tipo de medio: solo al imprimir (o al emular print en DevTools). */
@media print {
  .q8 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* 🐛 and y or no se pueden mezclar sin paréntesis: la consulta es inválida y el
   navegador la trata como «not all», que no se cumple nunca. Sin ningún aviso.
   ✅ (width >= 25rem) and ((hover) or (orientation: landscape)) */
@media (width >= 25rem) and (hover) or (orientation: landscape) {
  .q9 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}
```
