---
example_description: "box-shadow: desplazamiento, desenfoque, extensión, color, inset y varias sombras; las sombras no ocupan espacio en el diseño"
example_tags: "css|sombras|box-shadow"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="card basic">0 2px 6px</div>
<div class="card soft">varias capas</div>
<div class="card spread">0 0 0 4px (anillo)</div>
<div class="card inset">inset</div>
<div class="card offset">8px 8px 0 (sin desenfoque)</div>
<p>Las sombras no ocupan espacio: estas tarjetas tienen la misma separación que tendrían sin sombra.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
  background: #f8fafc;
}

.card {
  display: inline-block;
  width: 150px;
  margin: 0 20px 20px 0;
  padding: 24px 12px;
  border-radius: 12px;
  background: white;
  font-size: 0.85rem;
}

/* box-shadow: desplazamiento-x desplazamiento-y desenfoque extensión color */
.basic  { box-shadow: 0 2px 6px rgb(15 23 42 / 0.25); }

/* Varias sombras separadas por comas: la primera se pinta encima. Una sombra «natural»
   suele combinar una cercana y nítida con otra lejana y difusa. */
.soft   { box-shadow: 0 1px 2px rgb(15 23 42 / 0.2), 0 12px 32px rgb(15 23 42 / 0.15); }

/* Sin desplazamiento ni desenfoque, la extensión dibuja un anillo que no mueve nada:
   útil para anillos de foco sin cambiar el tamaño de la caja. */
.spread { box-shadow: 0 0 0 4px #93c5fd; }

/* inset: la sombra se dibuja DENTRO de la caja, como si estuviera hundida. */
.inset  { box-shadow: inset 0 2px 8px rgb(15 23 42 / 0.3); }

.offset { box-shadow: 8px 8px 0 #1d4ed8; border: 2px solid #1d4ed8; }
```
