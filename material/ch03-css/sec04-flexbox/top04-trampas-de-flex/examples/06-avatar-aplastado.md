---
example_description: "Un avatar de iniciales y un icono de fondo con ancho fijo se aplastan junto a un texto largo, porque flex-shrink: 1 los hace encoger; flex-shrink: 0 los protege"
example_tags: "css|flexbox|flex-shrink|avatar|iconos|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ <code>width: 40px</code> no basta: junto a un texto largo, el avatar y el icono encogen</p>
<ul class="feed">
  <li class="notice">
    <span class="avatar" aria-hidden="true">MG</span>
    <p>Marta García comentó en «Cómo regar suculentas en invierno»: ¡Gracias por los consejos! Las mías ya tienen brotes nuevos.</p>
  </li>
  <li class="notice">
    <span class="icon" aria-hidden="true"></span>
    <p>Tu pedido 4821 salió del almacén de Monterrey y llegará entre el jueves y el viernes.</p>
  </li>
</ul>

<p class="label">✅ <code>flex-shrink: 0</code> en el avatar y en el icono</p>
<ul class="feed is-fixed">
  <li class="notice">
    <span class="avatar" aria-hidden="true">MG</span>
    <p>Marta García comentó en «Cómo regar suculentas en invierno»: ¡Gracias por los consejos! Las mías ya tienen brotes nuevos.</p>
  </li>
  <li class="notice">
    <span class="icon" aria-hidden="true"></span>
    <p>Tu pedido 4821 salió del almacén de Monterrey y llegará entre el jueves y el viernes.</p>
  </li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.feed {
  max-width: 400px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #7c3aed;
  list-style: none;
  font-size: 0.8rem;
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
}

.notice p {
  margin: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4338ca;
  color: #ffffff;
  font-weight: bold;
  line-height: 40px;
  text-align: center;
}

/* Un icono pintado con background-image: la caja está vacía, no tiene contenido. */
.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dcfce7 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23166534' stroke-width='2' stroke-linejoin='round'%3E%3Cpath d='M2 6h12v10H2zM14 10h4l3 3v3h-7'/%3E%3C/svg%3E") center / 22px no-repeat;
}

/* 🐛 El párrafo parte de su base auto: TODA la frase en una línea (cientos de px).
   No cabe, así que hay que encoger, y flex-shrink vale 1 en todos: el avatar y el
   icono también pierden su parte (pequeña, porque se pondera por la base, pero la
   pierden). width: 40px solo es la base, no un mínimo.
   ¿Hasta dónde encogen? Hasta su min-width: auto, el mínimo de su contenido:
   - el avatar, hasta el ancho de «MG»: un óvalo de unos 20 × 40;
   - el icono no tiene contenido: su mínimo es 0, así que se estrecha (unos 20 × 32)
     y deja de ser cuadrado. Con un texto aún más largo seguiría encogiendo. */

/* ✅ flex-shrink: 0 (o flex: none): estos elementos no encogen nunca. Todo el
   exceso lo absorbe el párrafo, que sí puede partir sus líneas. */
.is-fixed .avatar,
.is-fixed .icon {
  flex-shrink: 0;
}
```
