---
example_description: "Un borde más grueso en :focus mueve el diseño; outline o box-shadow dibujan el anillo de foco sin cambiar el tamaño de la caja"
example_tags: "css|bordes|outline|box-shadow|foco|accesibilidad"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p>Pulsa Tab para recorrer los campos y fíjate en el texto de debajo de cada uno.</p>
<label>❌ border en :focus <input class="bad" placeholder="El texto de abajo salta"></label>
<p class="below">Texto de debajo</p>
<label>✅ outline + outline-offset <input class="good-outline" placeholder="No se mueve nada"></label>
<p class="below">Texto de debajo</p>
<label>✅ box-shadow como anillo <input class="good-shadow" placeholder="Tampoco se mueve nada"></label>
<p class="below">Texto de debajo</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

label {
  display: block;
  margin-top: 12px;
}

input {
  display: block;
  width: 280px;
  margin-top: 4px;
  padding: 8px;
  border: 1px solid #64748b;
  border-radius: 8px;
}

.below {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

/* ❌ El borde forma parte de la caja: pasar de 1px a 4px empuja lo que hay alrededor. */
.bad:focus { border: 4px solid #1d4ed8; outline: none; }

/* ✅ outline se dibuja FUERA de la caja y no ocupa espacio (lección 1 del módulo). */
.good-outline:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }

/* ✅ Una sombra con extensión y sin desenfoque también es un anillo que no ocupa espacio.
   Ojo: en el modo de alto contraste de Windows las sombras desaparecen; outline no. */
.good-shadow:focus-visible { outline: none; box-shadow: 0 0 0 3px #93c5fd, 0 0 0 5px #1d4ed8; }
```
