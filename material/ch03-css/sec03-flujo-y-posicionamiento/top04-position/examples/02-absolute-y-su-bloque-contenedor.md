---
example_description: "Una insignia position: absolute se coloca respecto al antepasado posicionado más cercano; si no hay ninguno, se va a la esquina de la página"
example_tags: "css|position|absolute|bloque-contenedor|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="note">La insignia de la tarjeta ❌ ha acabado aquí arriba, en la esquina de la PÁGINA →</p>

<article class="card">
  <h3>Mochila de 30 litros</h3>
  <p>❌ La tarjeta no está posicionada.</p>
  <p class="price">59,90 €</p>
  <span class="badge">−20 %</span>
</article>

<article class="card is-anchor">
  <h3>Mochila de 30 litros</h3>
  <p>✅ <code>position: relative</code> en la tarjeta.</p>
  <p class="price">59,90 €</p>
  <span class="badge">−20 %</span>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.note {
  margin: 0 0 12px;
  padding-right: 80px;
  font-size: 0.8rem;
  text-align: right;
}

.card {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
  padding: 12px;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  background: #ffffff;
}

.card h3,
.card p {
  margin: 0 0 6px;
  font-size: 0.9rem;
}

.price {
  font-weight: bold;
}

/* position: absolute saca la insignia del flujo y la coloca con top/right respecto a su
   BLOQUE CONTENEDOR: el borde de relleno (padding box) del antepasado POSICIONADO más
   cercano (position distinta de static).
   🐛 En la primera tarjeta no hay ninguno: el bloque contenedor es el «inicial», un
   rectángulo del tamaño de la ventana en lo alto de la página. La insignia se va allí. */
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: bold;
}

/* ✅ La pareja más usada de CSS: el padre relative (sin desplazarlo) hace de referencia
   y el hijo absolute se coloca en sus esquinas. */
.is-anchor {
  position: relative;
}
```
