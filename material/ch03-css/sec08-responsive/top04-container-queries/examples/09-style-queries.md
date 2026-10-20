---
example_description: "Consultas de estilo (en Chrome y Safari): @container style(--tone: sale) aplica reglas a los descendientes de un elemento cuya custom property --tone vale sale. Una sola variable en la tarjeta decide el color del precio, la etiqueta y el botón"
example_tags: "css|responsive|container-queries|style-queries|custom-properties|variantes"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">Tres tarjetas con el mismo HTML. Solo cambia <code>--tone</code> en el atributo <code>style</code> de cada una.</p>
<div class="cards">
  <article class="card" style="--tone: regular"><h3>Maceta de barro</h3><p class="badge"></p><p class="price">380 MXN</p><a class="buy" href="/macetas/barro">Comprar</a></article>
  <article class="card" style="--tone: sale"><h3>Maceta de Talavera</h3><p class="badge"></p><p class="price">520 MXN</p><a class="buy" href="/macetas/talavera">Comprar</a></article>
  <article class="card" style="--tone: sold-out"><h3>Maceta colgante</h3><p class="badge"></p><p class="price">290 MXN</p><a class="buy" href="/macetas/colgante">Avísame</a></article>
</div>
<p class="note">Si tu navegador no entiende las consultas de estilo, las tres tarjetas se ven iguales (y siguen funcionando).</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .note { margin: 0 0 8px; font-size: 0.72rem; }
.cards { display: flex; flex-wrap: wrap; gap: 8px; }
.card { flex: 1 1 8rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.8rem; }
.card h3 { margin: 0; font-size: 0.9rem; }
.card p { margin: 4px 0; }
.price { font-weight: 700; }
.buy { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #1d4ed8; color: #ffffff; text-decoration: none; }
.badge { display: none; }           /* solo aparece si una consulta la enciende */

/* Una consulta de ESTILO pregunta por el valor de una custom property del
   contenedor más cercano. No hace falta container-type: para las consultas
   de estilo, todos los elementos son contenedores. Como siempre, solo se da
   estilo a los descendientes: la tarjeta decide, sus hijos cambian. */
@container style(--tone: sale) {
  .badge { display: block; color: #b91c1c; font-weight: 700; }
  .badge::before { content: "Oferta · −20 %"; }
  .price { color: #b91c1c; }
}

@container style(--tone: sold-out) {
  .badge { display: block; color: #475569; font-weight: 700; }
  .badge::before { content: "Agotado"; }
  .price { color: #475569; text-decoration: line-through; }
  .buy { background: #475569; }
}

/* ¿Por qué no una clase (.card.is-sale .price)? Porque la variable se hereda:
   una sección entera puede poner --tone: sale y todas sus tarjetas cambian,
   y una sola variable puede mover muchas piezas a la vez. */
```
