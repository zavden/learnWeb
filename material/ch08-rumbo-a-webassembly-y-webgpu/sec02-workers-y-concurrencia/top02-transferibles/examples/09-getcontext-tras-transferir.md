---
example_description: "Después de transferControlToOffscreen(), el canvas de la página ya no es suyo: getContext lanza InvalidStateError y transferirlo otra vez también; para cambiar el dibujo hay que pedírselo a quien tiene el contexto, el worker"
example_tags: "javascript|workers|offscreencanvas|canvas|invalidstateerror|transferibles|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Visitas al museo esta semana</h1>
  <canvas id="chart" role="img" aria-label="Gráfico de barras de las visitas de lunes a sábado"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 28rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
canvas { display: block; inline-size: 100%; block-size: auto; aspect-ratio: 2 / 1; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function report(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const visits = [['L', 0], ['M', 320], ['X', 410], ['J', 380], ['V', 520], ['S', 760]]; // el lunes, cerrado

// Un worker que dibuja un gráfico de barras en el canvas que recibe.
const code = `
  self.onmessage = (event) => {
    const { canvas, visits, scale } = event.data;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    const width = canvas.width / scale;
    const height = canvas.height / scale;
    const barWidth = width / visits.length;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    visits.forEach(([day, count], index) => {
      const barHeight = (count / 800) * (height - 40);
      const x = index * barWidth;
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(x + 8, height - 20 - barHeight, barWidth - 16, barHeight);
      ctx.fillStyle = '#1e293b';
      ctx.fillText(day, x + barWidth / 2, height - 5);
      ctx.fillText(String(count), x + barWidth / 2, height - 25 - barHeight);
    });
    self.postMessage(visits.length);
  };
`;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);
addEventListener('pagehide', () => worker.terminate());
worker.onmessage = (event) => report(`✅ el worker dibujó ${event.data} barras: para cambiar el gráfico, se le envía un mensaje`);

const canvas = document.querySelector('#chart');
canvas.width = 400 * devicePixelRatio;
canvas.height = 200 * devicePixelRatio;
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen, visits, scale: devicePixelRatio }, [offscreen]);

// 🐛 1. La página ya no puede dibujar en su propio canvas.
try {
  canvas.getContext('2d');
} catch (error) {
  report(`🐛 getContext → ${error.name}: ${error.message}`);
}
// 🐛 2. Ni transferirlo otra vez (a otro worker, por ejemplo).
try {
  canvas.transferControlToOffscreen();
} catch (error) {
  report(`🐛 transferir otra vez → ${error.name}: ${error.message}`);
}
```
