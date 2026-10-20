---
example_description: "sandbox=\"\" (vacío) prohíbe TODO al documento embebido: sus scripts no corren, sus formularios no se envían y no tiene origen propio"
example_tags: "html|iframe|sandbox|seguridad|embebido"
example_stage: minimal
example_importance: important
---

# HTML

```html
<h1>Lo que llega de fuera, en cuarentena</h1>

<!-- El atributo sandbox mete el documento embebido en una «caja de arena»: le quita permisos.
     Vacío (sandbox="") es el máximo encierro: sin scripts, sin formularios, sin popups,
     sin plugins y con un ORIGEN opaco (no es el tuyo, así que no ve tus cookies ni tu
     almacenamiento). Cada token que añadas devuelve UN permiso (ejemplo siguiente).
     Úsalo para HTML que no controlas: un comentario, un anuncio, una previsualización. -->
<iframe sandbox=""
        title="Documento embebido sin ningún permiso"
        width="360" height="170"
        srcdoc="
          <div style='font-family: system-ui, sans-serif; margin: .6rem'>
            <p>Scripts: <strong id='js'>desactivados</strong></p>
            <form action='/enviar'>
              <button>Enviar (no hace nada: sandbox bloquea el envío)</button>
            </form>
            <script>
              /* Con sandbox vacío este script NO corre: el texto se queda en «desactivados» */
              document.getElementById('js').textContent = 'activados';
            </script>
          </div>
        "></iframe>

<p>El botón no envía y el texto sigue diciendo «desactivados»: ningún script se ejecutó.</p>
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
```
