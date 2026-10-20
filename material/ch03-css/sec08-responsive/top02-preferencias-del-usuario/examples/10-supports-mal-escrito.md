---
example_description: "Tres @supports mal escritos que no se aplican nunca y no dan ningún error: sin paréntesis, con la propiedad sola y mezclando and y or sin agrupar. Al lado, su versión correcta"
example_tags: "css|responsive|supports|feature-queries|sintaxis|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<p class="caption">Las seis condiciones preguntan por cosas que Chrome entiende, así que todas deberían decir «sí». Las tres ❌ están mal escritas.</p>
<table class="queries">
  <tbody>
    <tr class="b1"><td>❌ <code>@supports display: grid</code></td><td class="status"></td></tr>
    <tr class="g1"><td>✅ <code>@supports (display: grid)</code></td><td class="status"></td></tr>
    <tr class="b2"><td>❌ <code>@supports (backdrop-filter)</code></td><td class="status"></td></tr>
    <tr class="g2"><td>✅ <code>@supports (backdrop-filter: blur(1px))</code></td><td class="status"></td></tr>
    <tr class="b3"><td>❌ <code>@supports (display: grid) and (gap: 1rem) or (display: flex)</code></td><td class="status"></td></tr>
    <tr class="g3"><td>✅ <code>@supports (display: grid) and ((gap: 1rem) or (display: flex))</code></td><td class="status"></td></tr>
  </tbody>
</table>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }
.queries { border-collapse: collapse; font-size: 0.75rem; }
.queries td { padding: 3px 8px; border: 1px solid #cbd5e1; }
.status { white-space: nowrap; font-weight: 700; background: var(--status-bg, #f1f5f9); }
.status::after { content: var(--status-text, "✗ no se aplica"); }

/* 🐛 1. Sin paréntesis no es una condición: la at-rule entera es inválida y el
   navegador se salta su bloque, como cualquier CSS inválido. */
@supports display: grid {
  .b1 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports (display: grid) {
  .g1 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* 🐛 2. @supports pregunta por DECLARACIONES completas. «(backdrop-filter)» no
   es una declaración: es algo desconocido entre paréntesis, que vale «no».
   (En @media sí existe la forma corta: (hover).) */
@supports (backdrop-filter) {
  .b2 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports (backdrop-filter: blur(1px)) {
  .g2 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* 🐛 3. Como en las media queries, and y or no se mezclan sin paréntesis
   (tampoco not con and/or): la regla es inválida y se ignora entera. */
@supports (display: grid) and (gap: 1rem) or (display: flex) {
  .b3 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

@supports (display: grid) and ((gap: 1rem) or (display: flex)) {
  .g3 { --status-text: "✓ sí"; --status-bg: #bbf7d0; }
}

/* Para comprobar una condición sin adivinar, en la consola de DevTools:
   CSS.supports("(display: grid) and (gap: 1rem)") → true */
```
