---
example_description: "Un campo sin name no se envía: el id sirve al label, al CSS y a JavaScript, pero el servidor solo recibe los campos con name"
example_tags: "html|formularios|name|id|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Envía los dos formularios y compara lo que llega en cada caso. -->
<h2>❌ Sin name</h2>
<form action="https://huerta.example/contacto" method="post">
  <p><label for="name-bug">Nombre</label> <input id="name-bug" name="full_name" value="Marta Ruiz"></p>
  <!-- 🐛 Tiene id (para su label) pero NO name: se ve, se rellena… y no se envía. -->
  <p><label for="email-bug">Correo</label> <input id="email-bug" type="email" value="marta@correo.example"></p>
  <button type="submit">Enviar</button>
</form>

<h2>✅ Con name</h2>
<form action="https://huerta.example/contacto" method="post">
  <p><label for="name-ok">Nombre</label> <input id="name-ok" name="full_name" value="Marta Ruiz"></p>
  <!-- id: para el label, el CSS y JavaScript. name: la clave con la que viaja el dato. -->
  <p><label for="email-ok">Correo</label> <input id="email-ok" name="email" type="email" value="marta@correo.example"></p>
  <button type="submit">Enviar</button>
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

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Antes de enviar nada, buscamos los campos
// de cada formulario que no tienen name: son los que el servidor no recibirá nunca.
for (const form of document.forms) {
  const unnamed = [...form.querySelectorAll('input, select, textarea')].filter((field) => !field.name);
  // previousElementSibling: el h2 que hay justo antes de cada formulario
  console.log(`${form.previousElementSibling.textContent} → campos sin name:`, unnamed.map((field) => field.id).join(', ') || 'ninguno');
}
```
