---
example_description: "Una referencia circular: --space: calc(var(--space) * 2) no duplica el valor heredado (como haría $space: $space * 2 en Sass), sino que forma un ciclo; el token pasa a ser inválido, el padding que lo usa cae a 0 y un var() con respaldo usa el respaldo. Solución: otro nombre para el valor nuevo"
example_tags: "css|arquitectura|design-tokens|custom-properties|var|ciclo|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<article class="note">Tarjeta normal: <code>padding: var(--space)</code> → 12px.</article>
<article class="note is-roomy">❌ <code>--space: calc(var(--space) * 2)</code> → ciclo: sin relleno.</article>
<article class="note is-roomy-fallback">❌ El mismo ciclo, leído con respaldo: <code>var(--space, 4px)</code> → 4px.</article>
<article class="note is-roomy-fixed">✅ Otro nombre: <code>--note-space: calc(var(--space) * 2)</code> → 24px.</article>
```

# CSS

```css
:root {
  --space: 12px;
}

body {
  display: grid;
  gap: 10px;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.note {
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #f1f5f9;
  font-size: 0.85rem;
  padding: var(--space);
}

/* 🐛 «Esta tarjeta, con el doble de espacio». En Sass, $space: $space * 2
   funciona: se ejecuta de arriba abajo y usa el valor anterior. Una custom
   property no es una variable que se reasigna: es una propiedad de ESTE
   elemento, y var(--space) dentro de su propio valor se refiere a sí misma,
   no a la heredada. --space depende de --space: es un ciclo. Las custom
   properties de un ciclo pasan a ser inválidas (como si no existieran), y
   padding: var(--space) es inválido en tiempo de cómputo → 0. */
.is-roomy {
  --space: calc(var(--space) * 2);
}

/* El mismo ciclo, pero quien lo usa tiene respaldo: como el token es
   inválido, var() usa el respaldo, 4px. Tampoco es el doble. */
.is-roomy-fallback {
  --space: calc(var(--space) * 2);
  padding: var(--space, 4px);
}

/* ✅ El valor nuevo, con otro nombre (un token de componente). Ahora
   var(--space) es la heredada de :root, 12px, y no hay ciclo. Lo mismo
   pasa con dos tokens que se citan entre sí: --a: var(--b); --b: var(--a)
   rompe los dos. */
.is-roomy-fixed {
  --note-space: calc(var(--space) * 2);
  padding: var(--note-space);
}
```
