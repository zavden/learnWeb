---
example_description: "Un recorrido por WGSL en un archivo .wgsl de assets: tipos (f32, u32, vec3f, mat4x4f), const/let/var, fn, struct, bucles con límite y los atributos @compute, @vertex, @fragment, @group, @binding, @builtin, @location y @workgroup_size. El ejemplo lo descarga con fetch, lo compila y lee los mensajes del compilador"
example_tags: "javascript|webgpu|wgsl|shader|createshadermodule|getcompilationinfo|entrypoint"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/tour.wgsl (léelo con «Assets»): el shader comentado línea a línea.
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
addEventListener('pagehide', () => device.destroy());

// Un shader es texto: en un template string o, como aquí, en un archivo .wgsl de assets/
const code = await (await fetch('tour.wgsl')).text();
console.log('tour.wgsl →', code.trimEnd().split('\n').length, 'líneas');

// createShaderModule compila; getCompilationInfo() trae los mensajes (errores y avisos)
const module = device.createShaderModule({ label: 'tour', code });
const info = await module.getCompilationInfo();
console.log('mensajes del compilador →', info.messages.length);

// Un módulo puede tener varios puntos de entrada: el pipeline elige uno con entryPoint
device.pushErrorScope('validation');
device.createComputePipeline({ label: 'tour', layout: 'auto', compute: { module, entryPoint: 'main' } });
const error = await device.popErrorScope();
console.log('pipeline de cómputo con «main» →', error ? error.message.split('\n')[0] : 'creado');
```
