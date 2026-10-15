---
example_description: "clip-path: path() dibuja curvas, pero sus coordenadas son píxeles fijos: el mismo borde ondulado diseñado para 200px corta la caja por la mitad cuando mide 400px. shape() acepta porcentajes y se adapta"
example_tags: "css|recortes|clip-path|path|shape|responsive|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<p class="caption">Un borde inferior ondulado. El cuadro discontinuo marca la caja completa. Arriba, la caja de 200px para la que se diseñó: las dos versiones son iguales.</p>
<div class="row">
  <div class="frame narrow"><div class="banner is-path">path()</div></div>
  <div class="frame narrow"><div class="banner is-shape">shape()</div></div>
</div>

<p class="caption">❌ La misma <code>path()</code> en una caja de 400px: la forma sigue midiendo 200px y lo demás desaparece</p>
<div class="frame wide"><div class="banner is-path">path() a 400px</div></div>

<p class="caption">✅ <code>shape()</code> con porcentajes: la onda se estira con la caja</p>
<div class="frame wide"><div class="banner is-shape">shape() a 400px</div></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 4px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  gap: 16px;
}

/* El marco no tiene recorte: su borde discontinuo muestra el tamaño real. */
.frame {
  outline: 1px dashed #94a3b8;
}

.narrow { width: 200px; }
.wide   { width: 400px; }

.banner {
  height: 120px;
  padding: 12px;
  box-sizing: border-box;
  background: #0f766e;
  color: #ffffff;
  font-weight: 700;
}

/* 🐛 path() usa la sintaxis del atributo d de SVG: M (mover), H (horizontal),
   V (vertical), C (curva), Z (cerrar). Sus números son PÍXELES, sin unidad y
   sin porcentajes: la forma mide lo mismo sea cual sea la caja. */
.is-path {
  clip-path: path("M0 0 H200 V96 C150 126 50 66 0 96 Z");
}

/* ✅ shape() (Chrome 135, 2025) describe lo mismo con palabras y acepta
   porcentajes, calc() y custom properties:
   «from» = M, «hline to» = H, «vline to» = V, «curve to … with … / …» = C. */
.is-shape {
  clip-path: shape(
    from 0% 0%,
    hline to 100%,
    vline to 80%,
    curve to 0% 80% with 75% 105% / 25% 55%,
    close
  );
}
```
