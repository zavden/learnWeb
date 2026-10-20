---
example_description: "srcdoc lleva el documento embebido escrito dentro del propio atributo; las comillas de dentro se escriben con &quot; para no cerrar el atributo antes de tiempo"
example_tags: "html|iframe|srcdoc|comillas|entidades|embebido"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<h1>Vista previa de un comentario</h1>

<!-- srcdoc lleva el HTML del marco dentro del atributo, en lugar de en un archivo aparte.
     Es útil para una porción de HTML «de usuario» que quieres aislar sin crear un documento.
     El valor va entre comillas dobles, así que dentro NO puedes usar comillas dobles:
     la primera cerraría el atributo. Dos salidas:
       1. usa comillas simples dentro (class='aviso'), o
       2. escribe las dobles como la entidad &quot;. -->
<iframe title="Comentario de ejemplo, aislado en su propio documento"
        width="340" height="150"
        srcdoc="
          <div style='font-family: system-ui, sans-serif; margin: .6rem'>
            <p class='aviso'>Marta escribió: &quot;El compost ya está listo&quot;.</p>
            <p>Comillas simples y &amp;quot; conviven dentro del srcdoc.</p>
          </div>
        "></iframe>

<p>El contenido de arriba vive en su propio documento: su CSS no afecta a esta página.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
}

h1 {
  font-size: 1.3rem;
}

iframe {
  border: 1px solid #64748b;
  border-radius: 8px;
}

/* La clase .aviso de ESTA página no llega al documento del iframe: son mundos separados */
.aviso {
  color: #be123c;
}
```
