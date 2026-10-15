---
example_description: "Sin la propiedad content, ::before y ::after no se generan aunque el resto de la regla sea correcto"
example_tags: "css|pseudoelementos|content|before"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="note-broken">❌ <code>::before</code> sin <code>content</code>: aquí, a la izquierda, debería haber un cuadrado rojo</p>
<p class="note-fixed">✅ <code>::before</code> con <code>content: ""</code>: ahora sí aparece</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Un adorno típico: un cuadrado de color antes del texto, sin texto propio.
   (display: inline-block deja dar ancho y alto a una caja que vive dentro de
   una línea de texto; display se estudia en el módulo del modelo de cajas.) */

.note-broken::before {
  /* ❌ Falta content → el pseudoelemento NO se genera.
     Todas estas declaraciones son válidas, pero no hay ninguna caja a la que aplicarlas. */
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  background: #dc2626;
}

.note-fixed::before {
  content: "";                 /* ✅ cadena vacía: genera una caja sin texto */
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  background: #dc2626;
}

/* content: none y content: normal tampoco generan nada: son la forma de «apagarlo». */
```
