---
example_description: "Un catálogo de patrones del juego de la vida dibujados en canvas: mapa de bits × devicePixelRatio, role=\"img\" con un aria-label que cambia con cada generación, contenido alternativo sin JavaScript y el vídeo con subtítulos al principio"
example_tags: "profesional|canvas|devicepixelratio|accesibilidad|aria-label|video|track"
example_stage: professional
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Patrones del juego de la vida · Lección 2 · Club de Ciencia</title>
  <meta name="description" content="Bloque, colmena, parpadeador, sapo y planeador: los patrones básicos del juego de la vida de Conway, dibujados generación a generación.">
  <link rel="canonical" href="https://clubdeciencia.example/cursos/sistemas/patrones/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
  <style>
    /* Las fichas en una rejilla (grid se estudia en el capítulo de CSS) */
    .patterns { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); gap: 1rem; }
    .patterns h3 { margin: 0 0 0.5rem; }
    /* La CAJA de cada canvas; el script ajusta su mapa de bits a la pantalla */
    .pattern-canvas { display: block; width: 120px; height: 120px; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://clubdeciencia.example/">Club de Ciencia</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://clubdeciencia.example/cursos/" aria-current="page">Cursos</a></li>
        <li><a href="https://clubdeciencia.example/talleres/">Talleres</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Lección 2: los patrones</h1>
    <p class="lead">En el juego de la vida hay figuras que nunca cambian, otras que oscilan y otras que se desplazan. Primero, míralas en marcha:</p>

    <video controls preload="metadata" poster="media/life-poster.jpg" width="640" height="360" crossorigin="anonymous">
      <source src="media/life.webm" type="video/webm">
      <source src="media/life.mp4" type="video/mp4">
      <track kind="captions" src="media/life-captions-es.vtt" srclang="es" label="Español (CC)" default>
      <track kind="captions" src="media/life-captions-en.vtt" srclang="en" label="English (CC)">
      <p>Tu navegador no reproduce vídeo. <a href="media/life.mp4" download>Descarga el vídeo</a>.</p>
    </video>

    <h2>Catálogo</h2>
    <!-- Cada patrón es una imagen sencilla: role="img" y un aria-label que dice qué se ve.
         Lo de dentro del canvas solo aparece sin JavaScript. -->
    <ul class="patterns">
      <li class="card">
        <h3>Bloque</h3>
        <canvas class="pattern-canvas" data-pattern="block" width="120" height="120" role="img" aria-label="Bloque: un cuadrado de dos por dos celdas"><p>Un cuadrado de 2 × 2 celdas.</p></canvas>
        <p>Vida estática: cada celda tiene tres vecinas y nunca cambia.</p>
      </li>
      <li class="card">
        <h3>Colmena</h3>
        <canvas class="pattern-canvas" data-pattern="beehive" width="120" height="120" role="img" aria-label="Colmena: seis celdas en forma de hexágono alargado"><p>Seis celdas en forma de hexágono.</p></canvas>
        <p>Vida estática, la más frecuente después del bloque.</p>
      </li>
      <li class="card">
        <h3>Parpadeador</h3>
        <canvas class="pattern-canvas" data-pattern="blinker" width="120" height="120" role="img" aria-label="Parpadeador, generación 1: tres celdas en horizontal"><p>Tres celdas en fila que se alternan entre horizontal y vertical.</p></canvas>
        <p>Oscila cada dos generaciones.</p>
        <button type="button" data-step="blinker">Siguiente generación</button>
      </li>
      <li class="card">
        <h3>Sapo</h3>
        <canvas class="pattern-canvas" data-pattern="toad" width="120" height="120" role="img" aria-label="Sapo, generación 1: dos filas de tres celdas desplazadas una posición"><p>Dos filas de tres celdas desplazadas.</p></canvas>
        <p>Otro oscilador de periodo 2.</p>
        <button type="button" data-step="toad">Siguiente generación</button>
      </li>
      <li class="card">
        <h3>Planeador</h3>
        <canvas class="pattern-canvas" data-pattern="glider" width="120" height="120" role="img" aria-label="Planeador: cinco celdas en forma de flecha que apunta abajo a la derecha"><p>Cinco celdas en forma de flecha.</p></canvas>
        <p>Cada cuatro generaciones se desplaza una celda en diagonal.</p>
      </li>
    </ul>
    <!-- Anuncia el cambio de generación a los lectores de pantalla -->
    <p id="generation-status" class="visually-hidden" role="status"></p>
  </main>

  <footer class="site-footer">
    <p>Club de Ciencia · Lecciones con licencia CC BY-SA 4.0</p>
  </footer>

  <script>
    // Adelanto: JavaScript (y la API 2D del canvas) se explican en sus capítulos.
    // Cada patrón: sus fases (una o dos) como filas de texto, y la descripción de cada fase.
    const patterns = {
      block: { phases: [['....', '.XX.', '.XX.', '....']] },
      beehive: { phases: [['......', '..XX..', '.X..X.', '..XX..', '......']] },
      blinker: {
        name: 'Parpadeador',
        phases: [['.....', '.....', '.XXX.', '.....', '.....'], ['.....', '..X..', '..X..', '..X..', '.....']],
        labels: ['tres celdas en horizontal', 'tres celdas en vertical'],
      },
      toad: {
        name: 'Sapo',
        phases: [['......', '......', '..XXX.', '.XXX..', '......', '......'], ['......', '...X..', '.X..X.', '.X..X.', '..X...', '......']],
        labels: ['dos filas de tres celdas desplazadas una posición', 'seis celdas en forma de anillo abierto'],
      },
      glider: { phases: [['.....', '..X..', '...X.', '.XXX.', '.....']] },
    };
    const phaseOf = {};

    // Mapa de bits = caja CSS × devicePixelRatio; scale permite dibujar en píxeles CSS
    function draw(canvas, rows) {
      const ratio = window.devicePixelRatio;
      canvas.width = Math.round(120 * ratio);  // asignar width borra el canvas: se redibuja todo
      canvas.height = Math.round(120 * ratio);
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      const cell = 120 / Math.max(rows.length, rows[0].length);
      rows.forEach((row, y) => {
        [...row].forEach((value, x) => {
          ctx.fillStyle = value === 'X' ? '#0e7490' : '#f1f5f9';
          ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
        });
      });
    }

    for (const canvas of document.querySelectorAll('.pattern-canvas')) {
      const key = canvas.dataset.pattern;
      phaseOf[key] = 0;
      draw(canvas, patterns[key].phases[0]);
    }

    // Los osciladores: el botón dibuja la otra fase y actualiza el nombre del canvas
    for (const button of document.querySelectorAll('[data-step]')) {
      button.addEventListener('click', () => {
        const key = button.dataset.step;
        const pattern = patterns[key];
        phaseOf[key] = (phaseOf[key] + 1) % pattern.phases.length;
        const canvas = document.querySelector(`[data-pattern="${key}"]`);
        draw(canvas, pattern.phases[phaseOf[key]]);
        const text = `${pattern.name}, generación ${phaseOf[key] + 1}: ${pattern.labels[phaseOf[key]]}`;
        canvas.setAttribute('aria-label', text);
        document.getElementById('generation-status').textContent = text;
        console.log(text);
      });
    }
    console.log('patrones dibujados →', Object.keys(phaseOf).length, `(devicePixelRatio ${window.devicePixelRatio})`);
  </script>
</body>
</html>
```
