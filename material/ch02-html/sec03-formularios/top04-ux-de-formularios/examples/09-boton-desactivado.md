---
example_description: "Desactivar el botón de envío hasta que todo esté bien deja al usuario sin saber qué falta; un botón siempre activo deja que el navegador se lo diga"
example_tags: "html|formularios|ux|button|disabled|accesibilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- El correo ya está escrito. Intenta suscribirte en los dos formularios: con el ratón,
     con Tab y con Enter dentro del campo de correo.
     (oninput: los eventos llegan en el capítulo de JavaScript.) -->
<h2>❌ Botón desactivado hasta que todo esté bien</h2>
<!-- 🐛 El botón no dice POR QUÉ está desactivado; Tab se lo salta, así que quien usa el
     teclado o un lector de pantalla ni siquiera lo encuentra; y Enter no hace nada. -->
<form action="https://huerta.example/boletin" method="post" oninput="document.getElementById('send-bug').disabled = !this.checkValidity()">
  <p><label for="email-bug">Correo</label> <input id="email-bug" name="email" type="email" required value="ana@correo.es"></p>
  <p><label><input type="checkbox" name="privacy" required> He leído la política de privacidad</label></p>
  <button id="send-bug" type="submit" disabled>Suscribirme</button>
</form>

<h2>✅ Botón siempre activo</h2>
<!-- Al pulsarlo, el navegador lleva el foco al campo que falta y dice qué pasa
     (o, con mensajes propios, el formulario los muestra: ejemplos anteriores) -->
<form action="https://huerta.example/boletin" method="post">
  <p><label for="email-ok">Correo</label> <input id="email-ok" name="email" type="email" required value="ana@correo.es"></p>
  <p><label><input type="checkbox" name="privacy" required> He leído la política de privacidad</label></p>
  <button type="submit">Suscribirme</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}
```
