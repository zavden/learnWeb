---
example_description: "Una página que embebe dos cosas con criterios distintos: su propio reproductor (iframe con title, loading=\"lazy\" y allow) y el comentario de un lector, encerrado en sandbox vacío"
example_tags: "integracion|iframe|sandbox|allow|loading|srcdoc|video|track"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>Boletín del huerto: la lección del mes</h1>

<!-- 1. NUESTRO reproductor (assets/player.html): contenido propio, del mismo origen, así que
     no necesita sandbox. Sí lleva title (accesibilidad), width/height, loading="lazy" y los
     permisos que su vídeo usa: pantalla completa e imagen en imagen. -->
<iframe src="player.html"
        title="Reproductor: el juego de la vida"
        width="480" height="300"
        loading="lazy"
        allow="fullscreen; picture-in-picture"></iframe>

<h2>Comentarios</h2>
<!-- 2. El comentario de un LECTOR: HTML que no controlas. sandbox="" lo prohíbe todo:
     su script no corre (no puede tocar esta página), su enlace no abre ventanas y su origen
     es opaco. Las comillas del HTML de dentro van como &quot; o simples. -->
<iframe sandbox=""
        title="Comentario de Rosa Elena"
        width="480" height="90"
        srcdoc="<div style='font-family: system-ui, sans-serif; margin: .5rem'>
                  <p><strong>Rosa Elena:</strong> &quot;¡Qué hipnótico! Lo vi tres veces.&quot;</p>
                  <script>parent.document.title = 'Página secuestrada';</script>
                </div>"></iframe>
<p>El comentario intenta cambiar el título de esta página con un script; con <code>sandbox=""</code> no lo consigue.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 42rem;
  padding: 0 1rem;
}

iframe {
  display: block;
  max-width: 100%;
  border: 1px solid #64748b;
  border-radius: 8px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Un inventario de los marcos de la página:
// lo que cualquier revisión de seguridad miraría primero.
document.title = 'Boletín del huerto'; // en un documento completo iría en <title>

setTimeout(() => {
  for (const frame of document.querySelectorAll('iframe')) {
    console.log(`«${frame.title}» → sandbox: ${frame.hasAttribute('sandbox') ? `"${frame.getAttribute('sandbox')}"` : '(ninguno)'} · allow: ${frame.getAttribute('allow') ?? '(ninguno)'} · loading: ${frame.loading}`);
  }
  console.log('título de esta página →', document.title, '(el comentario no pudo cambiarlo)');
}, 500);
```
