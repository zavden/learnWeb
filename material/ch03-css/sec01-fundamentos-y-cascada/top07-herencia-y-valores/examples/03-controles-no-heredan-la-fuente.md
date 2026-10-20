---
example_description: "Botones y campos de formulario no heredan la fuente: la hoja del navegador les pone la suya; se arregla con font: inherit"
example_tags: "css|herencia|formularios|font"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="signup">
  <p>Este texto usa Georgia a 18px, heredada del contenedor.</p>
  <p>❌ <label>Nombre <input type="text" value="Ana"></label> <button type="button">Enviar</button></p>
  <p class="fixed">✅ <label>Nombre <input type="text" value="Ana"></label> <button type="button">Enviar</button></p>
</div>
```

# CSS

```css
.signup {
  font-family: Georgia, serif;
  font-size: 18px;
}

/* 🐛 font SÍ es una propiedad heredada… pero la hoja del navegador tiene una regla
   para input, button, select y textarea que les pone la fuente del sistema y un
   tamaño pequeño (en Chrome, algo como  font: -webkit-small-control;  ≈ 13px).
   Una regla que elige al elemento gana a la herencia → los controles «no heredan». */

/* ✅ Solución: pedir la herencia explícitamente.
   Casi todos los resets modernos lo hacen para todos los controles. */
.fixed input,
.fixed button {
  font: inherit;
}
```
