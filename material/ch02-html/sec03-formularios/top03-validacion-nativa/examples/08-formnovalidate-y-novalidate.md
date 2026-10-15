---
example_description: "formnovalidate envía sin validar desde un botón concreto (un borrador), y novalidate desactiva la validación del navegador en todo el formulario"
example_tags: "html|formularios|validacion|novalidate|formnovalidate"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- El resumen está vacío. Pulsa los botones de los dos formularios.
     (onsubmit ejecuta JavaScript al enviar; los eventos llegan en el capítulo de JavaScript.) -->
<h2>formnovalidate en un botón</h2>
<form action="https://blog.example/entradas" method="post">
  <p><label for="title">Título</label><br><input id="title" name="title" size="36" value="Mi primera cosecha de calabazas"></p>
  <p><label for="summary">Resumen (obligatorio para publicar)</label><br><textarea id="summary" name="summary" rows="2" cols="36" required></textarea></p>
  <!-- formnovalidate: ESTE botón envía sin validar; un borrador puede estar a medias -->
  <button type="submit" name="status" value="draft" formnovalidate>Guardar borrador</button>
  <button type="submit" name="status" value="published">Publicar</button>
</form>

<h2>novalidate en el formulario</h2>
<!-- novalidate: el navegador no comprueba nada al enviar (ni muestra avisos). Las restricciones
     siguen existiendo: :invalid y checkValidity() las ven. Se usa para mostrar mensajes propios. -->
<form action="https://blog.example/entradas" method="post" novalidate onsubmit="console.log('¿válido? →', this.checkValidity())">
  <p><label for="title-2">Título</label><br><input id="title-2" name="title" size="36" value="Mi primera cosecha de calabazas"></p>
  <p><label for="summary-2">Resumen</label><br><textarea id="summary-2" name="summary" rows="2" cols="36" required></textarea></p>
  <button type="submit" name="status" value="published">Publicar</button>
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
