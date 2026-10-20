---
example_description: "Dos elementos con el mismo grid-area no se reparten el área: se colocan uno encima del otro y el primero desaparece (aunque el teclado aún llega a su campo); envolverlos en un solo elemento lo arregla"
example_tags: "css|grid|grid-area|areas|solapamiento|accesibilidad|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ El boletín y la oferta tienen los dos <code>grid-area: aside</code>: ¿dónde está el boletín?</p>
<div class="page">
  <header class="top">Diario del huerto</header>
  <article class="content">Cómo sembrar tomates en maceta: elige una de al menos 20 litros, con agujeros, y riega solo cuando la tierra esté seca.</article>
  <form class="newsletter" action="/boletin" method="post">
    <label for="email-a">Recibe el boletín</label>
    <input id="email-a" name="email" type="email" placeholder="tu@correo.mx">
  </form>
  <p class="promo">Semillas de temporada: <strong>20 % de descuento</strong></p>
</div>

<p class="caption">✅ Un solo elemento (<code>aside</code>) en el área, y los dos dentro</p>
<div class="page">
  <header class="top">Diario del huerto</header>
  <article class="content">Cómo sembrar tomates en maceta: elige una de al menos 20 litros, con agujeros, y riega solo cuando la tierra esté seca.</article>
  <aside class="sidebar">
    <form class="newsletter" action="/boletin" method="post">
      <label for="email-b">Recibe el boletín</label>
      <input id="email-b" name="email" type="email" placeholder="tu@correo.mx">
    </form>
    <p class="promo">Semillas de temporada: <strong>20 % de descuento</strong></p>
  </aside>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.page {
  display: grid;
  grid-template-columns: 1fr 9rem;
  grid-template-areas:
    "top     top"
    "content aside";
  gap: 8px;
  max-width: 400px;
  padding: 8px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

.page > *,
.sidebar > * {
  margin: 0;
  padding: 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.top {
  grid-area: top;
  font-weight: bold;
}

.content {
  grid-area: content;
  background: #ffffff;
}

.newsletter label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

.newsletter input {
  box-sizing: border-box;
  width: 100%;
}

/* 🐛 Dos elementos en la misma área no se reparten el sitio: grid los coloca a los
   dos en las mismas celdas, uno encima del otro (el último del HTML se pinta encima).
   La oferta tapa el boletín por completo. Y el campo del boletín sigue ahí: la tecla
   Tab llega a un campo que no se ve. */
.page > .newsletter,
.page > .promo {
  grid-area: aside;
}

/* ✅ Un área, un elemento: el aside ocupa el área y coloca dentro a sus hijos
   (aquí con flexbox en columna). */
.sidebar {
  grid-area: aside;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page > .sidebar {
  padding: 0;
  border: 0;
  background: none;
}
```
