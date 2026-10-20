---
example_description: "Una caja con height fija no crece: si el texto no cabe, se desborda y se monta sobre lo siguiente. min-height lo resuelve"
example_tags: "css|modelo-de-cajas|height|min-height|overflow|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="card fixed">
  <h3>❌ height: 90px</h3>
  <p>Este texto, traducido o con la fuente más grande, ya no cabe en la tarjeta y se sale por abajo encima del siguiente bloque.</p>
</div>
<p class="next">Bloque siguiente (lo pisa el texto desbordado).</p>

<div class="card flexible">
  <h3>✅ min-height: 90px</h3>
  <p>Este texto, traducido o con la fuente más grande, ya no cabe en la tarjeta… así que la tarjeta crece.</p>
</div>
<p class="next">Bloque siguiente (en su sitio).</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.card {
  width: 300px;
  padding: 0 12px;
  background: #bfdbfe;
  border: 2px solid #1d4ed8;
}

.card h3 {
  margin: 8px 0 4px;
}

/* 🐛 Una altura fija es una promesa que el contenido no conoce: otro idioma, el zoom del
   usuario o un texto más largo la rompen. El contenido sobrante no se recorta: se desborda
   (overflow: visible por defecto, lo verás en la lección de overflow). */
.fixed {
  height: 90px;
}

/* ✅ min-height: «al menos 90px», pero puede crecer. */
.flexible {
  min-height: 90px;
}

.next {
  background: #fde68a;
  width: 300px;
  padding: 4px 12px;
  margin-block: 8px 24px;
}
```
