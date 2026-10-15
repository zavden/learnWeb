---
example_description: "vertical-align: middle en un bloque no centra nada: solo se aplica a cajas en línea y a celdas de tabla"
example_tags: "css|contexto-inline|vertical-align|centrar|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="banner is-wrong">
  <p>❌ <code>height: 72px; vertical-align: middle</code>: el texto sigue arriba</p>
</div>

<div class="banner is-padded">
  <p>✅ Sin altura fija y con el mismo relleno arriba y abajo</p>
</div>

<table class="schedule">
  <tr>
    <th scope="row">Celda de tabla</th>
    <td>✅ En una celda sí funciona: <code>middle</code> ya es su valor por defecto</td>
  </tr>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.banner,
.schedule {
  margin-bottom: 10px;
  border: 2px solid #1d4ed8;
  background: #bfdbfe;
}

.banner p {
  margin: 0;
  padding: 0 12px;
  font-size: 0.9rem;
}

/* 🐛 vertical-align NO es «centrar en vertical». Solo se aplica a:
   - cajas en línea (texto, inline, inline-block, imágenes): las coloca dentro de SU LÍNEA;
   - celdas de tabla: coloca su contenido dentro de la celda.
   Este div es un bloque: la declaración es válida, pero no tiene ningún efecto
   (ni en el div ni en el párrafo, que también es un bloque). */
.is-wrong {
  height: 72px;
  vertical-align: middle;
}

/* ✅ En el flujo normal, la forma robusta de centrar es no fijar la altura:
   el mismo padding arriba y abajo. Con flexbox (módulo 4) bastará align-items: center. */
.is-padded {
  padding-block: 24px;
}

.schedule {
  width: 100%;
  height: 72px;
  border-collapse: collapse;
}

.schedule th,
.schedule td {
  padding: 0 12px;
  font-size: 0.9rem;
  text-align: start;
}
```
