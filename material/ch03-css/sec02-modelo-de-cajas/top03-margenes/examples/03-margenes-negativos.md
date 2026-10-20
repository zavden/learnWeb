---
example_description: "Un margen negativo acerca o superpone cajas: arriba/izquierda mueve la caja, abajo/derecha tira de lo que viene después"
example_tags: "css|modelo-de-cajas|margin|negativo"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<div class="card">
  <div class="badge">Oferta</div>
  <h2 class="title">Auriculares inalámbricos</h2>
  <p>La etiqueta «Oferta» sube 14px y se monta sobre el borde de la tarjeta con <code>margin-top: -14px</code>.</p>
</div>

<div class="row">
  <div class="tile">A</div>
  <div class="tile pull">B · margin-top: -24px</div>
  <div class="tile">C</div>
</div>

<p class="note">B sube 24px y se monta sobre A; C también sube, porque el margen negativo de B reduce el espacio que B ocupa en el flujo.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}

.card {
  border: 2px solid #94a3b8;
  border-radius: 12px;
  padding: 0 16px 8px;
  max-width: 360px;
  margin-bottom: 40px;
}

/* Margen negativo arriba: la caja se desplaza hacia arriba, por encima del borde del padre. */
.badge {
  width: max-content;
  margin-top: -14px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dc2626;
  color: white;
  font-weight: 700;
}

.title {
  margin-block: 8px;
}

.tile {
  width: 220px;
  padding: 12px;
  background: #bfdbfe;
  border: 2px solid #1d4ed8;
}

/* -24px arriba: B se superpone a A. Los márgenes negativos no recortan nada, solo mueven. */
.pull {
  margin-top: -24px;
  margin-left: 40px;
  background: #bbf7d0;
  border-color: #15803d;
}

.note {
  max-width: 420px;
}
```
