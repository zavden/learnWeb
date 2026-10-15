---
example_description: "Un campo con width: 100% y padding se sale de su tarjeta; box-sizing: border-box lo arregla"
example_tags: "css|modelo-de-cajas|box-sizing|width|formularios"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="card">
  <label for="email-bug">❌ Tu correo (content-box)</label>
  <input id="email-bug" class="field" type="email" placeholder="ana@ejemplo.es">
  <p class="note">100% = 280px de contenido, + 24px de padding + 4px de borde = <strong>308px</strong> en una tarjeta de 280px.</p>
</div>

<div class="card">
  <label for="email-fix">✅ Tu correo (border-box)</label>
  <input id="email-fix" class="field fixed" type="email" placeholder="ana@ejemplo.es">
  <p class="note">Ahora 100% = 280px de borde a borde: el padding y el borde se restan del contenido.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* La tarjeta tiene un contenido de 280px y un borde discontinuo para ver sus límites */
.card {
  width: 280px;
  padding: 16px;
  border: 2px dashed #94a3b8;
  margin-bottom: 16px;
}

/* 🐛 width: 100% = el 100% del CONTENIDO del padre (280px)… para el CONTENIDO del campo.
   Con content-box, el padding y el borde se suman por fuera: 280 + 24 + 4 = 308px.
   Sobran 28px: el campo atraviesa el padding derecho (16px) y el borde (2px) y asoma 10px por fuera.
   Los campos de texto usan content-box en la hoja del navegador. */
.field {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #64748b;
  font: inherit;
}

/* ✅ border-box: width mide de borde a borde, así que 100% son 280px en total. */
.fixed {
  box-sizing: border-box;
}

.note {
  font-size: 0.8rem;
  color: #475569;
  margin-bottom: 0;
}
```
