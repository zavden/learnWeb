---
example_description: "Las líneas de tiempo de scroll también existen en JavaScript (en Chrome): new ScrollTimeline({ source }) como timeline de element.animate() hace una barra de lectura, y new ViewTimeline({ subject }) con rangeStart/rangeEnd funde cada párrafo al entrar"
example_tags: "javascript|web-animations|scrolltimeline|viewtimeline|scroll|animation-range"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Guía del mercado de Coyoacán</h1>
  <div class="progress"><div id="bar" class="bar"></div></div>
  <article id="article" class="article" tabindex="0" aria-label="Guía del mercado (desplazable)">
    <p>El mercado abre a las 7:00. Las primeras horas son las de los puestos de fruta y de flores, cuando todo acaba de llegar de la central de abasto.</p>
    <p>En el pasillo central están las tostadas: de pata, de tinga, de ceviche. Se piden en la barra y se comen de pie.</p>
    <p>Al fondo, los puestos de artesanía venden alebrijes de Oaxaca, juguetes de madera y piñatas de siete picos.</p>
    <p>Los jugos y licuados se pagan antes de pedirlos; el de naranja con zanahoria es el más vendido.</p>
    <p>Los domingos el mercado se llena a partir de las 11:00: si buscas sitio en las tostadas, llega antes.</p>
    <p>A la salida, la plaza de Coyoacán y sus cafés están a cinco minutos a pie.</p>
  </article>
  <p id="status" aria-live="polite"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.progress {
  height: 0.4rem;
  background: #e4e7eb;
}
.bar {
  height: 100%;
  background: #0e7490;
  transform-origin: left;
  scale: 0 1;
}
.article {
  height: 9rem;
  overflow-y: auto;
  padding: 0 0.75rem;
  background: #ffffff;
}
.article:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
const article = document.querySelector('#article');
const statusLine = document.querySelector('#status');
console.log('¿ScrollTimeline existe? →', typeof ScrollTimeline === 'function');

if (typeof ScrollTimeline === 'function') {
  // 1. La barra de lectura: su reloj es el scroll del artículo (0 % arriba, 100 % abajo)
  const timeline = new ScrollTimeline({ source: article, axis: 'block' });
  const reading = document.querySelector('#bar').animate({ scale: ['0 1', '1 1'] }, { timeline, fill: 'both' });
  console.log('la barra usa el scroll →', reading.timeline === timeline, '· duración:', reading.effect.getTiming().duration);

  // 2. Cada párrafo, su propia línea de tiempo de vista: se funde mientras ENTRA por abajo
  for (const paragraph of article.querySelectorAll('p')) {
    paragraph.animate({ opacity: [0.15, 1] }, {
      timeline: new ViewTimeline({ subject: paragraph, axis: 'block' }),
      rangeStart: 'entry 0%',
      rangeEnd: 'entry 100%',
      fill: 'both',
    });
  }
  console.log('animaciones en la página →', document.getAnimations().length);

  // El progreso, como número: currentTime de una línea de tiempo de scroll es un porcentaje
  article.addEventListener('scrollend', () => {
    const percent = Math.round(timeline.currentTime.value);
    statusLine.textContent = `Leído: ${percent} %`;
    console.log(`scrollend → ${percent} %`);
  });
  console.log('Listo: desplaza el artículo (con la rueda o, tras Tab, con las flechas)');
} else {
  statusLine.textContent = 'Este navegador no tiene ScrollTimeline: el artículo se lee igual, sin animaciones.';
}
```
