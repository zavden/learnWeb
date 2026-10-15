---
example_description: "z-index: 99 en una caja static no hace nada: la tarjeta posicionada que viene después la tapa igualmente"
example_tags: "css|z-index|position|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="column">
  <p class="caption">❌ <code>z-index: 99</code> sin <code>position</code></p>
  <p class="tip">Consejo: lleva siempre agua y un chubasquero.</p>
  <article class="card">Ruta del Cares · 12 km<br>La tarjeta lleva <code>position: relative</code> por su insignia.</article>
</div>

<div class="column">
  <p class="caption">✅ <code>position: relative; z-index: 1</code></p>
  <p class="tip is-positioned">Consejo: lleva siempre agua y un chubasquero.</p>
  <article class="card">Ruta del Cares · 12 km<br>La tarjeta lleva <code>position: relative</code> por su insignia.</article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

/* Un globo que se monta 20px sobre la tarjeta con un margen negativo. */
.tip {
  margin: 0 12px -20px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.8rem;
  z-index: 99;                       /* 🐛 sin position, este z-index se ignora */
}

.card {
  position: relative;               /* lo normal: muchas tarjetas lo llevan para sus insignias */
  padding: 28px 10px 10px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #f1f5f9;
  font-size: 0.85rem;
}

/* 🐛 z-index solo se aplica a cajas posicionadas (y a hijos de flex y grid).
   El globo es static: se pinta en la fase de los bloques, y la tarjeta, que está
   posicionada, se pinta después y lo tapa, tenga el z-index que tenga el globo.
   En Elements → Styles, DevTools pone junto a este z-index un icono de información:
   «no tiene efecto porque el elemento no está posicionado». */

/* ✅ Posicionado, su z-index cuenta: 1 ya basta para quedar por encima de la tarjeta (auto). */
.is-positioned {
  position: relative;
  z-index: 1;
}
```
