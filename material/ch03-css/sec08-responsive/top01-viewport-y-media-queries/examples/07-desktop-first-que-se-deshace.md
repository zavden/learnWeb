---
example_description: "Desktop-first: los estilos base son los del escritorio y la media query para móvil tiene que deshacerlos uno a uno; si se olvida uno (grid-column: 2), los resultados se van a una columna implícita. Mobile-first no tiene nada que deshacer"
example_tags: "css|responsive|mobile-first|desktop-first|media-queries|grid|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Filtros y resultados de una tienda. Por debajo de 40rem (640px), como en esta tarjeta, deben ir <strong>uno debajo del otro</strong>; desde 40rem, lado a lado. Ensancha la vista previa (o ↗): a partir de 640px las dos versiones son iguales.</p>

<p class="label">❌ Desktop-first (<code>width &lt; 40rem</code> deshace): los resultados, en una columna estrecha a la derecha</p>
<div class="shop-desktop-first">
  <fieldset class="filters"><legend>Filtrar</legend><label><input type="checkbox"> Interior</label> <label><input type="checkbox"> Mascotas</label></fieldset>
  <ul class="results"><li>Monstera · 420 MXN</li><li>Pothos · 160 MXN</li><li>Calathea · 380 MXN</li></ul>
</div>

<p class="label">✅ Mobile-first (<code>width &gt;= 40rem</code> añade): uno debajo del otro</p>
<div class="shop-mobile-first">
  <fieldset class="filters"><legend>Filtrar</legend><label><input type="checkbox"> Interior</label> <label><input type="checkbox"> Mascotas</label></fieldset>
  <ul class="results"><li>Monstera · 420 MXN</li><li>Pothos · 160 MXN</li><li>Calathea · 380 MXN</li></ul>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: 0.85rem;
}

.caption,
.label {
  margin: 10px 0 4px;
  font-size: 0.72rem;
}

.filters { margin: 0; border: 1px solid #94a3b8; background: #f8fafc; }
.results { margin: 0; padding: 6px 6px 6px 24px; background: #ecfdf5; }

/* ❌ DESKTOP-FIRST: lo de fuera es el escritorio… */
.shop-desktop-first {
  display: grid;
  grid-template-columns: 12rem 1fr;
  gap: 10px;
}
.shop-desktop-first .filters { grid-column: 1; position: sticky; top: 0; }
.shop-desktop-first .results { grid-column: 2; }

/* …y para el móvil hay que DESHACER cada decisión. Cada propiedad nueva del
   escritorio exige otra línea aquí, y olvidar una no da ningún error. */
@media (width < 40rem) {
  .shop-desktop-first { grid-template-columns: 1fr; }     /* deshecho */
  .shop-desktop-first .filters { position: static; }      /* deshecho */
  /* 🐛 Olvidado: .results { grid-column: auto; }. Con grid-column: 2 y una
     sola columna, grid crea una columna IMPLÍCITA (lección de grid implícito)
     y los resultados se colocan en ella, al lado de los filtros. */
}

/* ✅ MOBILE-FIRST: lo de fuera es el móvil (aquí, el flujo normal: nada) y la
   media query solo AÑADE. No hay nada que deshacer ni que olvidar. */
.shop-mobile-first {
  display: grid;
  gap: 10px;
}

@media (width >= 40rem) {
  .shop-mobile-first { grid-template-columns: 12rem 1fr; }
  .shop-mobile-first .filters { position: sticky; top: 0; }
}
```
