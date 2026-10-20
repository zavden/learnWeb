---
example_description: "Solución: la vista previa en sandbox vacío, un title en cada marco, allow=\"fullscreen\" para el reproductor y loading=\"lazy\" para el mapa"
example_tags: "ejercicio|solucion|iframe|sandbox|title|allow|loading"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<h1>Foro del huerto</h1>

<h2>Vista previa de tu mensaje</h2>
<!-- sandbox="" (vacío): sin scripts, sin formularios, sin ventanas y con un origen opaco.
     El script del mensaje ya no corre y no puede tocar esta página. -->
<iframe sandbox="" title="Vista previa de tu mensaje" width="480" height="70"
        srcdoc="<p style='font-family: system-ui, sans-serif'>Vendo semillas de calabaza: 2 € el sobre.</p>
                <script>parent.document.querySelector('h1').textContent = '😈 Foro secuestrado';</script>"></iframe>

<h2>El vídeo de la semana</h2>
<!-- Nuestro propio reproductor (mismo origen): sin sandbox, con su nombre y su permiso -->
<iframe src="player.html" title="Reproductor: el juego de la vida" width="480" height="300"
        allow="fullscreen"></iframe>

<h2>Normas del foro</h2>
<p>Sé amable, no publiques datos personales de nadie y usa el buscador antes de abrir un tema nuevo.</p>
<p>Los mensajes con enlaces de venta se revisan antes de publicarse. Si ves algo que incumple las normas, pulsa «Avisar» en el mensaje.</p>
<p>El foro está abierto a cualquier persona del barrio, tenga o no parcela en el huerto.</p>

<h2>Cómo llegar</h2>
<!-- loading="lazy": el mapa no se descarga hasta que la persona baja cerca de él -->
<iframe src="map.html" title="Mapa: cómo llegar al huerto comunitario" width="480" height="300"
        loading="lazy"></iframe>
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
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Adelanto: JavaScript se
// explica en su capítulo. Esperan a load: los marcos retrasan ese evento hasta cargar.
window.addEventListener('load', () => {
  const [preview, player, map] = document.querySelectorAll('iframe');
  const tokens = (frame) => (frame.getAttribute('sandbox') ?? '').split(/\s+/).filter(Boolean);
  const checks = [
    ['la vista previa tiene sandbox vacío', preview.hasAttribute('sandbox') && tokens(preview).length === 0],
    ['ningún marco combina allow-scripts con allow-same-origin', [preview, player, map]
      .every((frame) => !(tokens(frame).includes('allow-scripts') && tokens(frame).includes('allow-same-origin')))],
    ['cada iframe tiene un title', [preview, player, map].every((frame) => frame.title.trim() !== '')],
    ['el reproductor puede ir a pantalla completa', /\bfullscreen\b/.test(player.getAttribute('allow') ?? '')],
    ['el mapa se carga solo al acercarse (loading="lazy")', map.loading === 'lazy'],
    ['el título de la página no ha cambiado', document.querySelector('h1').textContent === 'Foro del huerto'],
  ];
  for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
});
```
