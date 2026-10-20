---
example_description: "::before y ::after no funcionan en un input (ni en img, video o iframe): ponlos en el label o en un envoltorio"
example_tags: "css|pseudoelementos|after|input|reemplazados"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p>
  <label for="name-a">Nombre</label>
  <input id="name-a" class="required-field" type="text" required>
  ❌ el <code>::after</code> del input no aparece
</p>
<p>
  <label for="name-b" class="required-label">Nombre</label>
  <input id="name-b" type="text" required>
  ✅ el <code>::after</code> del label, sí
</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Objetivo: marcar los campos obligatorios con un asterisco rojo. */

/* ❌ ::before y ::after se insertan DENTRO del elemento, como su primer y último hijo.
   Un <input>, como <img>, <video> o <iframe>, es un elemento REEMPLAZADO: el navegador
   dibuja en su lugar algo que no sale del HTML (el control, la imagen…) y no tiene un
   contenido donde meter hijos. Resultado: el pseudoelemento no se genera. */
.required-field::after {
  content: " *";
  color: #b91c1c;
}

/* ✅ Ponlo en un elemento que sí tenga contenido: el label (o un span que envuelva al input). */
.required-label::after {
  content: " *";
  color: #b91c1c;
}
```
