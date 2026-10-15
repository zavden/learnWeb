---
example_description: "@supports pregunta si el navegador entiende una declaración (o un selector, con selector()): una tabla que se rellena sola con condiciones de propiedades, valores, and, or, not y selector(:has())"
example_tags: "css|responsive|supports|feature-queries|mejora-progresiva|selector"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Cada fila es un <code>@supports</code>: «sí» si el navegador entiende lo que hay entre paréntesis. En Chrome actual, todas menos dos.</p>
<table class="queries">
  <thead><tr><th scope="col">Condición</th><th scope="col">¿La entiende?</th></tr></thead>
  <tbody>
    <tr class="s1"><td><code>(display: grid)</code></td><td class="status"></td></tr>
    <tr class="s2"><td><code>not (display: grid)</code></td><td class="status"></td></tr>
    <tr class="s3"><td><code>(backdrop-filter: blur(4px))</code></td><td class="status"></td></tr>
    <tr class="s4"><td><code>(color: light-dark(#fff, #000))</code></td><td class="status"></td></tr>
    <tr class="s5"><td><code>(container-type: inline-size)</code></td><td class="status"></td></tr>
    <tr class="s6"><td><code>(display: grid) and (gap: 1rem)</code></td><td class="status"></td></tr>
    <tr class="s7"><td><code>(text-wrap: balance) or (text-wrap: pretty)</code></td><td class="status"></td></tr>
    <tr class="s8"><td><code>selector(:has(+ p))</code></td><td class="status"></td></tr>
    <tr class="s9"><td><code>(dispaly: grid)</code></td><td class="status"></td></tr>
  </tbody>
</table>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }
.queries { border-collapse: collapse; font-size: 0.75rem; }
.queries th, .queries td { padding: 3px 8px; border: 1px solid #cbd5e1; text-align: start; }

.status { white-space: nowrap; font-weight: 700; background: var(--status-bg, #f1f5f9); }
.status::after { content: var(--status-text, "✗ no"); }

/* @supports (propiedad: valor) { … }: las reglas de dentro solo cuentan si el
   navegador sabe LEER esa declaración. No la prueba: comprueba que la entiende. */
@supports (display: grid) {
  .s1 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports not (display: grid) {
  .s2 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports (backdrop-filter: blur(4px)) {
  .s3 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* También comprueba VALORES: light-dark() llegó a todos los navegadores en 2024. */
@supports (color: light-dark(#fff, #000)) {
  .s4 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports (container-type: inline-size) {
  .s5 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports (display: grid) and (gap: 1rem) {
  .s6 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports (text-wrap: balance) or (text-wrap: pretty) {
  .s7 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* selector(): ¿entiende este selector? Útil con :has() y los selectores nuevos. */
@supports selector(:has(+ p)) {
  .s8 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* Una errata no da error: el navegador no conoce «dispaly» y responde «no». */
@supports (dispaly: grid) {
  .s9 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}
```
