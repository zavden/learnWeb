---
example_description: "Una lista de selectores separados por comas aplica el mismo bloque a varios grupos de elementos"
example_tags: "css|selectores|lista|agrupar"
example_stage: minimal
example_importance: important
---

# HTML

```html
<h2>Un h2 → coincide con el primer selector de la lista</h2>
<p class="highlight">Un p con <code>class="highlight"</code> → coincide con el segundo</p>
<p>Un p normal → no coincide con ninguno</p>
<p id="footer-note">Un p con <code>id="footer-note"</code> → coincide con el tercero</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Sin lista tendrías que repetir el mismo bloque tres veces:
     h2 { … }    .highlight { … }    #footer-note { … }
   Con una LISTA (selectores separados por comas) lo escribes una vez.
   La coma funciona como un «o»: basta con que coincida uno de los selectores. */
h2, .highlight, #footer-note {
  background: #fde68a;
  padding: 4px 8px;
}

/* Recuerda la lección anterior: si UN selector de la lista es inválido,
   se descarta la regla entera. */
```
