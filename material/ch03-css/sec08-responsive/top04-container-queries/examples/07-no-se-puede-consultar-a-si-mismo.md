---
example_description: "Un contenedor no puede consultarse a sí mismo: @container busca el contenedor más cercano ENTRE LOS ANTEPASADOS del elemento al que da estilo. Si la regla apunta a la propia tarjeta-contenedor, nunca se aplica; se apunta a un envoltorio interior"
example_tags: "css|responsive|container-queries|container-type|selectores|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Dos tarjetas de 440px, cada una con <code>container-type: inline-size</code>. Las dos tienen una regla <code>@container (width &gt;= 20rem)</code> que las pone en dos columnas, y 440px &gt; 320px.</p>

<p class="label">❌ La regla da estilo a <code>.card</code>, el propio contenedor: se queda apilada</p>
<article class="card is-self">
  <img src="velasco-valle-de-mexico-480.jpg" alt="Valle de México, de José María Velasco" width="480" height="330">
  <div><h3>Valle de México</h3><p>José María Velasco, 1877 · Lámina de 50 × 35 cm · 520 MXN</p></div>
</article>

<p class="label">✅ La regla da estilo a <code>.card-layout</code>, un envoltorio de dentro</p>
<article class="card is-inner">
  <div class="card-layout">
    <img src="velasco-valle-de-mexico-480.jpg" alt="Valle de México, de José María Velasco" width="480" height="330">
    <div><h3>Valle de México</h3><p>José María Velasco, 1877 · Lámina de 50 × 35 cm · 520 MXN</p></div>
  </div>
</article>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .label { margin: 8px 0 4px; font-size: 0.72rem; }

.card {
  container-type: inline-size;
  width: 440px;
  max-width: 100%;
  padding: 8px;
  box-sizing: border-box;
  outline: 2px dashed #7c3aed;
  font-size: 0.8rem;
}

.card img { display: block; width: 100%; height: auto; }
.card h3 { margin: 6px 0 2px; font-size: 1rem; }
.card p { margin: 0; }

.is-self,
.card-layout { display: grid; gap: 8px; }

/* 🐛 Para decidir si esta regla se aplica a .is-self, el navegador busca el
   contenedor más cercano DE .is-self entre sus antepasados (body, html…). Él
   mismo no cuenta: si pudiera, su consulta cambiaría su propio tamaño, el
   círculo que la contención intenta evitar. No hay ninguno, así que la
   consulta no se cumple. Si hubiera un contenedor más arriba, le preguntaría
   a ese, que es aún más confuso. */
@container (width >= 20rem) {
  .is-self { grid-template-columns: 10rem 1fr; }
}

/* ✅ La tarjeta es el contenedor; lo que cambia es su HIJO .card-layout,
   cuyo contenedor más cercano es la tarjeta. */
@container (width >= 20rem) {
  .card-layout { grid-template-columns: 10rem 1fr; }
}
```
