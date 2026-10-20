---
example_description: "Un enlace inline que contiene bloques se parte en dos trozos: su fondo y su borde no envuelven la tarjeta"
example_tags: "css|flujo-normal|cajas-anonimas|inline|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ El enlace es <code>inline</code> (su valor por defecto) y contiene bloques</p>
<a class="card-link" href="#">
  <h3>Taller de cerámica</h3>
  <p>Sábado 14 · 10:00 · 25 €</p>
</a>

<p class="label">✅ Con <code>display: block</code> el enlace es una caja que envuelve a sus hijos</p>
<a class="card-link fixed" href="#">
  <h3>Taller de encuadernación</h3>
  <p>Domingo 15 · 11:00 · 30 €</p>
</a>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 12px 0 4px;
  font-size: 0.85rem;
}

/* HTML permite que un <a> contenga bloques (una tarjeta entera puede ser un enlace).
   Pero CSS sigue tratando al <a> como una caja EN LÍNEA. */
.card-link {
  padding: 4px 8px;
  border: 3px solid #1d4ed8;
  background: #fde68a;
  color: #1e293b;
  text-decoration: none;
}

.card-link h3,
.card-link p {
  margin: 0;
}

/* 🐛 Un bloque dentro de una caja en línea la PARTE en dos: un trozo antes del bloque y
   otro después, cada uno en su propia línea (casi vacía), envueltos en cajas de bloque anónimas.
   El <h3> y el <p> quedan entre los dos trozos, FUERA de la caja del enlace:
   - el borde azul solo dibuja dos trozos sueltos, uno encima del título y otro debajo del precio;
   - el fondo amarillo no pinta la tarjeta.
   El enlace sigue funcionando (el clic en el título llega al <a>), pero su caja no envuelve nada. */

/* ✅ Si el enlace va a contener bloques, conviértelo en bloque. */
.fixed {
  display: block;
  max-width: 320px;
}
```
