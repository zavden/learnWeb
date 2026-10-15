---
example_description: "Solo el botón pulsado añade su par name=value, y formaction/formmethod cambian adónde y cómo se envía solo para ese botón"
example_tags: "html|formularios|button|submitter|formaction|formmethod"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Pulsa los tres botones y compara las tres líneas de la consola. -->
<form action="https://blog.example/entradas" method="post">
  <p>
    <label for="title">Título</label>
    <input id="title" name="title" size="40" value="Cómo empezar un huerto en el balcón">
  </p>

  <!-- Los dos botones tienen el mismo name y distinto value: solo viaja el par del botón
       PULSADO (el «submitter»), así el servidor sabe qué quería hacer el usuario. -->
  <button type="submit" name="status" value="draft">Guardar borrador</button>
  <button type="submit" name="status" value="published">Publicar</button>

  <!-- formaction y formmethod sustituyen a action y method solo cuando se pulsa este botón -->
  <button type="submit" formaction="https://blog.example/vista-previa" formmethod="get">Vista previa</button>
</form>

<p class="hint">Pulsa Enter dentro del campo: el navegador «pulsa» el primer botón de envío, «Guardar borrador».</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.hint {
  color: #475569;
  font-size: 0.9rem;
}
```
