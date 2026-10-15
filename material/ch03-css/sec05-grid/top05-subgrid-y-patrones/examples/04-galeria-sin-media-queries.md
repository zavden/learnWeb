---
example_description: "Una galería que pasa de 1 a 2, 3 o más columnas según el sitio, sin media queries: repeat(auto-fit, minmax(min(100%, 12rem), 1fr))"
example_tags: "css|grid|auto-fit|minmax|min|responsive|galeria"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">↔ Estrecha o ensancha la vista previa (o ábrela con ↗ y cambia el ancho de la ventana): 1, 2, 3… columnas, sin una sola <code>@media</code>.</p>

<ul class="gallery">
  <li><img src="plant-monstera.svg" alt="" width="240" height="240"><span>Monstera</span></li>
  <li><img src="plant-pothos.svg" alt="" width="240" height="240"><span>Pothos</span></li>
  <li><img src="plant-cactus.svg" alt="" width="240" height="240"><span>Cactus</span></li>
  <li><img src="plant-sansevieria.svg" alt="" width="240" height="240"><span>Sansevieria</span></li>
  <li><img src="plant-calathea.svg" alt="" width="240" height="240"><span>Calathea</span></li>
  <li><img src="plant-peperomia.svg" alt="" width="240" height="240"><span>Peperomia</span></li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0;
  font-size: 0.8rem;
}

/* La línea entera, por partes:
   - repeat(auto-fit, …): tantas columnas como quepan; si sobran, se colapsan.
   - minmax(…, 1fr): cada columna crece hasta repartirse el ancho.
   - min(100%, 12rem): el mínimo es 12rem… salvo que el contenedor mida menos;
     entonces, el 100 % del contenedor. Así nunca hay una columna más ancha que la
     galería (lo verás roto en el siguiente ejemplo). */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gallery li {
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

/* Las imágenes son decorativas (alt=""): el nombre va en el texto. */
.gallery img {
  display: block;
  width: 100%;
  height: auto;
}

.gallery span {
  display: block;
  padding: 6px 8px;
  font-size: 0.85rem;
  font-weight: bold;
}
```
