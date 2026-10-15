---
example_description: "Un iframe embebe otra página completa dentro de la tuya: src, title (obligatorio para accesibilidad), width/height y loading=\"lazy\""
example_tags: "html|iframe|src|title|loading|embebido"
example_stage: minimal
example_importance: important
---

# HTML

```html
<h1>Mi panel del huerto</h1>

<!-- Un iframe es una ventana a OTRA página dentro de esta.
     src: la URL del documento embebido. Aquí, widget.html, servido desde la carpeta
          assets/ del tema (ábrelo con el botón «Assets»): se resuelve junto a la página.
     title: el nombre del marco para los lectores de pantalla. SIN él, se anuncia solo
          como «marco», y no se sabe qué contiene. Es obligatorio para la accesibilidad.
     width/height: el tamaño de la ventana en píxeles (sin ellos, 300 × 150, como un canvas).
     loading="lazy": no descarga la página embebida hasta que está a punto de verse. -->
<iframe src="widget.html"
        title="Estado del huerto comunitario"
        width="320" height="200"
        loading="lazy"></iframe>

<p>El widget de arriba es otra página HTML completa, con su propio &lt;head&gt; y su CSS.</p>
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

/* Un iframe trae un borde por defecto; lo dejamos a la vista, con una esquina redondeada */
iframe {
  border: 1px solid #64748b;
  border-radius: 8px;
}
```
