---
example_description: "En calc(), + y - necesitan espacios a ambos lados: calc(100%-4rem) es inválido y la declaración se descarta"
example_tags: "css|funciones|calc|errores"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="bar bad">❌ width: calc(100%-4rem) → declaración inválida: la barra ocupa todo el ancho</div>
<div class="bar good">✅ width: calc(100% - 4rem) → deja 4rem libres a la derecha</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.bar {
  margin: 6px 0;
  padding: 4px;
  font-size: 0.85rem;
}

/* 🐛 Sin espacios, el navegador lee «100%» y «-4rem» (un número negativo) pegados,
   sin operador entre ellos → calc() inválido → se descarta la declaración entera
   (lección 1) → width vuelve a auto: todo el ancho. Ningún error en la consola. */
.bad {
  width: calc(100%-4rem);
  background: #fecaca;
}

/* ✅ + y - siempre con un espacio a cada lado. (* y / no lo necesitan, pero
   ponerlo siempre es más legible.) */
.good {
  width: calc(100% - 4rem);
  background: #bbf7d0;
}
```
