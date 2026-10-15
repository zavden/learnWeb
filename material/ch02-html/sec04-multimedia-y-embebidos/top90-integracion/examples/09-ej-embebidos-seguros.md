---
example_description: "Ejercicio: una página del foro con tres iframes mal configurados (una vista previa que secuestra la página, marcos sin nombre, sin permisos y sin carga diferida); arréglalos"
example_tags: "ejercicio|iframe|sandbox|title|allow|loading|srcdoc|seguridad"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Asegura los marcos del foro"
exercise_instructions: "Mira el título de la página: el mensaje de la vista previa lo ha cambiado || Deja la vista previa del mensaje con sandbox vacío, para que ningún script de un usuario corra || Da a cada iframe un title que diga qué contiene || Permite que el reproductor pase a pantalla completa con allow || Haz que el mapa, al final de la página, solo se descargue cuando esté a punto de verse || Comprueba que la consola sale toda ✅ y que el título de la página vuelve a ser «Foro del huerto»"
exercise_hints: "allow-scripts junto con allow-same-origin, sobre un srcdoc, no aísla nada: el marco está en tu origen y ejecuta scripts || sandbox=\"\" lo prohíbe todo || allow=\"fullscreen\" || loading=\"lazy\""
exercise_solution_example: 09-ej-embebidos-seguros-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<h1>Foro del huerto</h1>

<h2>Vista previa de tu mensaje</h2>
<!-- TODO 1: el HTML que escribe un usuario no es de fiar. Así configurado, su script ha
     podido cambiar el título de esta página. -->
<iframe sandbox="allow-scripts allow-same-origin" width="480" height="70"
        srcdoc="<p style='font-family: system-ui, sans-serif'>Vendo semillas de calabaza: 2 € el sobre.</p>
                <script>parent.document.querySelector('h1').textContent = '😈 Foro secuestrado';</script>"></iframe>

<h2>El vídeo de la semana</h2>
<!-- TODO 2 y 3: sin nombre y sin permiso de pantalla completa -->
<iframe src="player.html" width="480" height="300"></iframe>

<h2>Normas del foro</h2>
<p>Sé amable, no publiques datos personales de nadie y usa el buscador antes de abrir un tema nuevo.</p>
<p>Los mensajes con enlaces de venta se revisan antes de publicarse. Si ves algo que incumple las normas, pulsa «Avisar» en el mensaje.</p>
<p>El foro está abierto a cualquier persona del barrio, tenga o no parcela en el huerto.</p>

<h2>Cómo llegar</h2>
<!-- TODO 2 y 4: sin nombre, y se descarga aunque nadie baje hasta aquí -->
<iframe src="map.html" width="480" height="300"></iframe>
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
