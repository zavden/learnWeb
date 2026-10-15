---
example_description: ":is(#hero, .card) p pesa como un id también cuando coincide por .card; una lista de selectores no tiene ese problema"
example_tags: "css|especificidad|is|listas"
example_stage: common-error
example_importance: important
---

# HTML

```html
<section id="hero"><p><code>#hero p</code> → rojo, como se quería</p></section>
<section class="card"><p>❌ <code>.card p</code> → querías verde, pero sigue rojo</p></section>
<section class="panel"><p>✅ <code>.panel p</code> → verde</p></section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

p {
  padding: 6px 8px;
}

/* Estilo compartido escrito con :is() */
:is(#hero, .card) p {
  background: #fecaca;      /* (1,0,1) SIEMPRE, también cuando coincide gracias a .card */
}

/* El mismo estilo compartido, escrito como lista de selectores */
#hero p, .panel p {
  background: #fecaca;      /* en una lista, cada selector cuenta por separado: .panel p = (0,1,1) */
}

/* Más abajo quieres en verde los párrafos de .card y de .panel */
.card p  { background: #bbf7d0; }   /* (0,1,1) < (1,0,1) → ❌ pierde contra el :is() */
.panel p { background: #bbf7d0; }   /* (0,1,1) = (0,1,1) y va después → ✅ gana */

/* 🐛 :is(), :not() y :has() valen lo que el MÁS específico de sus argumentos,
   coincida el elemento por donde coincida.
   Solución: escribe una lista de selectores, o usa :where(#hero, .card) p, que vale (0,0,1). */
```
