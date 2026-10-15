---
example_description: "Sin &, una pseudoclase o una clase anidadas se separan con un espacio: .btn :hover y .card .is-featured buscan descendientes"
example_tags: "sass|anidamiento|selector-padre|hover|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<button type="button" class="btn btn-bad">❌ Sin &amp;: el hover no hace nada</button>
<button type="button" class="btn btn-good">✅ Con &amp;: el hover funciona</button>

<article class="card is-featured card-bad">❌ <code>.card { .is-featured {…} }</code>: no se destaca</article>
<article class="card is-featured card-good">✅ <code>.card { &amp;.is-featured {…} }</code>: destacada</article>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.btn {
  display: block;
  margin-bottom: 8px;
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  font: inherit;
}

// 🐛 Sin &, Sass une los selectores con un ESPACIO (descendiente):
//    → .btn-bad :hover  = «cualquier elemento con :hover DENTRO de .btn-bad».
//    El botón no tiene elementos dentro, así que nunca se aplica.
.btn-bad {
  :hover {
    background: #1e40af;
  }
}

// ✅ Con &, el estado se pega al botón: → .btn-good:hover
.btn-good {
  &:hover {
    background: #1e40af;
  }
}

.card {
  max-width: 26rem;
  margin-top: 12px;
  padding: 12px 16px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
}

// 🐛 Lo mismo con una clase: → .card-bad .is-featured
//    busca un .is-featured DENTRO de la tarjeta, no la tarjeta que lo es.
.card-bad {
  .is-featured {
    border-color: #b45309;
    background: #fef3c7;
  }
}

// ✅ → .card-good.is-featured: la misma tarjeta tiene las dos clases.
.card-good {
  &.is-featured {
    border-color: #b45309;
    background: #fef3c7;
  }
}
```
