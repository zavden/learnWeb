---
example_description: "max-width limita una columna de lectura sin romperla en pantallas pequeñas; si min-width y max-width chocan, gana min-width"
example_tags: "css|modelo-de-cajas|max-width|min-width|min-height"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="reading">
  <h2>max-width: 60ch</h2>
  <p>Las líneas de texto demasiado largas cansan: al saltar a la siguiente, el ojo pierde el sitio. Con max-width la columna nunca pasa de unos 60 caracteres, y en una pantalla estrecha simplemente ocupa el ancho disponible, sin desbordar.</p>
</article>

<div class="conflict">min-width: 300px y max-width: 200px → mide 300px (gana min-width)</div>

<div class="banner">min-height: 120px → nunca más bajo que esto, pero crece si el contenido lo necesita</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* width: auto (todo el ancho) + max-width: el patrón responsive más básico (sin media queries). */
.reading {
  max-width: 60ch;
  background: #bfdbfe;
  padding: 4px 16px;
}

/* Reglas de resolución: primero width, luego se aplica max-width, y por último min-width.
   Si min-width > max-width, min-width tiene la última palabra. */
.conflict {
  min-width: 300px;
  max-width: 200px;
  width: max-content;
  margin-block: 16px;
  background: #fde68a;
  padding: 6px 10px;
}

.banner {
  min-height: 120px;
  background: #bbf7d0;
  padding: 10px;
}
```
