---
example_description: "Si el selector de fuera es una lista (.card, #promo), el anidamiento nativo la envuelve en :is(), y :is() vale lo que su selector más específico: & h2 pesa (1,0,1) también en las tarjetas sin id, y una regla posterior de (0,2,0) pierde. En Sass, cada combinación conserva su especificidad"
example_tags: "css|anidamiento|nesting|especificidad|is|sass|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ Anidamiento nativo: <code>.card, #promo { &amp; h2 {…} }</code></p>
<div class="row">
  <article class="card">
    <h2 class="title">Taller de grabado</h2>
    <p>Título azul marino: <code>.card .title</code> (verde) no gana, aunque va después.</p>
  </article>
  <article class="card" id="promo">
    <h2 class="title">2 × 1 en talleres</h2>
    <p>Esta sí tiene el id.</p>
  </article>
</div>

<p class="label">✅ Las mismas reglas escritas planas (lo que genera Sass)</p>
<div class="row">
  <article class="flat-card">
    <h2 class="title">Taller de grabado</h2>
    <p>Título verde: <code>.flat-card .title</code> gana a <code>.flat-card h2</code>.</p>
  </article>
  <article class="flat-card" id="flat-promo">
    <h2 class="title">2 × 1 en talleres</h2>
    <p>Azul marino: aquí sí manda el id.</p>
  </article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.card,
.flat-card {
  flex: 1 1 12rem;
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.8rem;
}

h2 {
  font-size: 1rem;
}

/* 🐛 El navegador entiende el anidamiento como :is(): esta regla es
   :is(.card, #promo) h2. Y :is() vale lo que su argumento MÁS específico,
   #promo: la regla pesa (1,0,1) en TODAS las tarjetas, también en las que
   no tienen id. */
.card, #promo {
  & h2 {
    color: #1e3a8a;
  }
}

/* Más tarde, el título de una tarjeta en verde: (0,2,0). Pierde contra
   (1,0,1), aunque vaya después. */
.card .title {
  color: #15803d;
}

/* ✅ Sass, en cambio, escribe cada combinación por separado:
   .flat-card h2, #flat-promo h2 { … }. Cada una conserva su especificidad:
   (0,1,1) la primera y (1,0,1) la segunda. Para conseguirlo en CSS nativo,
   no mezcles ids (ni selectores pesados) en la lista de fuera: escribe dos
   reglas, o rebaja el id con :where(#promo). */
.flat-card h2,
#flat-promo h2 {
  color: #1e3a8a;
}

/* Gana en la primera tarjeta (0,2,0 > 0,1,1) y pierde en la del id
   (1,0,1): el id solo pesa donde está, como debe ser. */
.flat-card .title {
  color: #15803d;
}
```
