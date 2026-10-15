---
example_description: "--brand: $brand no copia el valor: Sass deja el texto «$brand» tal cual en la custom property. Hay que interpolar: --brand: #{$brand}"
example_tags: "sass|variables|custom-properties|interpolacion|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<article class="card card-raw">
  <h2>❌ <code>--brand-raw: $brand</code></h2>
  <p>Franja del color del texto y título sin verde: <code>var(--brand-raw)</code> vale el texto «$brand».</p>
</article>
<article class="card card-ok">
  <h2>✅ <code>--brand: #{$brand}</code></h2>
  <p>Franja y título verdes: la custom property vale <code>#15803d</code>.</p>
</article>
```

# SCSS

```scss
$brand: #15803d;

:root {
  // 🐛 El valor de una custom property puede ser CASI CUALQUIER COSA (lo viste en
  // CSS), así que Sass no lo interpreta: lo copia como texto. El CSS generado
  // contiene literalmente «--brand-raw: $brand;» (míralo en compiled.css).
  --brand-raw: $brand;

  // ✅ Con interpolación, Sass sí evalúa la expresión y pega su resultado.
  --brand: #{$brand};
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card {
  max-width: 26rem;
  padding: 2px 16px;
  margin-bottom: 12px;
  border: 1px solid #cbd5e1;
  border-left-width: 8px;
}

// En el navegador, var(--brand-raw) se sustituye por «$brand», que no es un color:
// la declaración es inválida en tiempo de cómputo y pasa a unset (lección de
// custom properties). border-left-color vuelve a su valor inicial (el color del
// texto) y color hereda el del padre.
.card-raw {
  border-left-color: var(--brand-raw);

  h2 {
    color: var(--brand-raw);
  }
}

.card-ok {
  border-left-color: var(--brand);

  h2 {
    color: var(--brand);
  }
}

h2 {
  font-size: 1.1rem;
}
```
