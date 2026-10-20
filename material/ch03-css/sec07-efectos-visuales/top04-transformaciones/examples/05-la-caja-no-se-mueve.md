---
example_description: "Una caja transformada sigue ocupando su sitio original en el layout: un translate no empuja a sus vecinos, y un rótulo girado 90° sigue reservando su caja horizontal; writing-mode sí crea una caja vertical"
example_tags: "css|transformaciones|transform|layout|writing-mode|rotulos|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">🐛 La nota del medio tiene <code>transform: translateY(30px)</code>: se pinta más abajo y tapa a la siguiente, que no se mueve. El hueco que deja es su sitio, que sigue ocupado.</p>
<div class="stack">
  <p class="item">1 · Lavar el frijol</p>
  <p class="item is-moved">2 · Dejarlo en remojo</p>
  <p class="item">3 · Cocerlo con epazote</p>
</div>

<p class="caption">❌ Lomos de libro con <code>transform: rotate(-90deg)</code>: el recuadro discontinuo (la caja en el layout) sigue siendo horizontal. Los lomos se salen por arriba y por abajo, y entre ellos queda un hueco enorme.</p>
<div class="shelf">
  <span class="frame"><span class="spine is-rotated">Pedro Páramo</span></span>
  <span class="frame"><span class="spine is-rotated">Aura</span></span>
  <span class="frame"><span class="spine is-rotated">Balún Canán</span></span>
</div>

<p class="caption">✅ <code>writing-mode: sideways-lr</code> (lección de modos de escritura): la caja es vertical de verdad y el layout la respeta</p>
<div class="shelf">
  <span class="frame"><span class="spine is-vertical">Pedro Páramo</span></span>
  <span class="frame"><span class="spine is-vertical">Aura</span></span>
  <span class="frame"><span class="spine is-vertical">Balún Canán</span></span>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 6px;
  font-size: 0.72rem;
}

.stack {
  max-width: 300px;
}

.item {
  margin: 0 0 6px;
  padding: 8px 10px;
  background: #e0e7ff;
  font-size: 0.85rem;
}

/* 🐛 transform no cambia el layout: para el navegador, la nota sigue en su
   sitio original. Por eso la tercera no baja, y la nota movida se pinta
   encima de ella (un elemento transformado se pinta como uno posicionado). */
.item.is-moved {
  background: #c7d2fe;
  outline: 2px solid #4338ca;
  transform: translateY(30px);
}

.shelf {
  display: flex;
  gap: 6px;
  align-items: center;
  min-height: 150px;
}

.frame {
  outline: 1px dashed #64748b;
}

.spine {
  display: block;
  inline-size: 120px;           /* la longitud de la línea: en horizontal, el ancho */
  padding: 6px 4px;
  box-sizing: border-box;
  background: #9a3412;
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 0.85rem;
  text-align: center;
}

/* ❌ Girada, la caja SE PINTA vertical, pero el layout sigue usando la caja
   sin girar: 120px de ancho y unos 30 de alto. Habría que recolocarla a mano
   con márgenes negativos, que dependen de la longitud de cada título. */
.is-rotated {
  transform: rotate(-90deg);
}

/* ✅ El mismo CSS más writing-mode: en sideways-lr, la línea va de abajo
   arriba, así que inline-size: 120px es el ALTO, y el ancho lo dan el texto y
   su relleno (unos 30px). Sus vecinos se colocan según esa caja vertical. */
.is-vertical {
  writing-mode: sideways-lr;
}
```
