---
example_description: "Un triángulo con WebGPU, todo a mano y en orden: el contexto «webgpu» del lienzo (y null si después se pide «2d»), el tamaño con devicePixelRatio, configure() con el formato preferido, un módulo WGSL con un vertex shader que saca los vértices de un array constante y un fragment shader de un color, el pipeline de render, una pasada que borra y dibuja, y submit"
example_tags: "javascript|webgpu|render-pipeline|wgsl|vertex-shader|fragment-shader|render-pass|triangulo"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Un triángulo con WebGPU</h1>
  <canvas id="stage" role="img" aria-label="Un triángulo rojo frambuesa sobre fondo azul noche"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  background: #0f172a;
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
canvas {
  display: block;
  width: 240px;
  height: 160px;
  outline: 1px solid #334155;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function log(label, value) {
  console.log(label, value);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${label} ${value}` }));
}

// 1. El dispositivo, comprobado (lección «¿Qué es WebGPU?»)
const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) throw new Error('WebGPU no está disponible en este equipo');
const device = await adapter.requestDevice({ label: 'triángulo' });
addEventListener('pagehide', () => device.destroy());
device.addEventListener('uncapturederror', (event) => console.warn('GPU →', event.error.message));

// 2. El lienzo: contexto 'webgpu'. Un lienzo da UN tipo de contexto.
const canvas = document.querySelector('#stage');
const context = canvas.getContext('webgpu');
log('el mismo lienzo como 2d →', canvas.getContext('2d')); // null: ya es un lienzo webgpu
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio); // mapa de bits nítido
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const format = navigator.gpu.getPreferredCanvasFormat(); // el orden de canales de la pantalla
context.configure({ device, format, alphaMode: 'opaque' });

// 3. Los shaders: un módulo con dos puntos de entrada
const module = device.createShaderModule({
  label: 'triángulo',
  code: /* wgsl */ `
    @vertex
    fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      // Los 3 vértices, en el propio shader: coordenadas de recorte (-1 a 1, y hacia arriba)
      var positions = array<vec2f, 3>(vec2f(0.0, 0.75), vec2f(-0.75, -0.5), vec2f(0.75, -0.5));
      return vec4f(positions[index], 0.0, 1.0);
    }

    @fragment
    fn fragmentMain() -> @location(0) vec4f {
      return vec4f(0.882, 0.114, 0.282, 1.0); // #e11d48: 225, 29, 72 entre 255
    }`,
});

// 4. El pipeline: los dos shaders, cómo se ensamblan los vértices y el formato del destino.
// Todo se valida AHORA, una vez; dibujar después ya no comprueba casi nada.
const pipeline = device.createRenderPipeline({
  label: 'triángulo',
  layout: 'auto',
  vertex: { module, entryPoint: 'vertexMain' },
  fragment: { module, entryPoint: 'fragmentMain', targets: [{ format }] },
  primitive: { topology: 'triangle-list' }, // cada 3 vértices, un triángulo
});

// 5. Una pasada de render sobre la textura del lienzo de ESTE fotograma
const texture = context.getCurrentTexture();
const encoder = device.createCommandEncoder({ label: 'triángulo' });
const pass = encoder.beginRenderPass({
  label: 'dibujar el triángulo',
  colorAttachments: [{
    view: texture.createView(),
    clearValue: [15 / 255, 23 / 255, 42 / 255, 1], // #0f172a, de 0 a 1
    loadOp: 'clear', // al empezar la pasada: borrar con clearValue
    storeOp: 'store', // al terminar: guardar lo dibujado
  }],
});
pass.setPipeline(pipeline);
pass.draw(3); // 3 vértices: vertexMain se ejecuta con index 0, 1 y 2
pass.end();

// 6. Enviar. Al terminar esta tarea, el navegador muestra la textura en el lienzo.
device.queue.submit([encoder.finish()]);
log('enviado →', '1 pasada, 1 draw(3), 1 submit');
log('formato →', format);
log('textura →', `${texture.width} × ${texture.height} · ${texture.format}`);
```
