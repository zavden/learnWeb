---
example_description: "WGSL no convierte tipos por su cuenta: un i32 entre un i32 da un i32, y guardarlo en un let de tipo f32 es un error de compilación («cannot initialize 'let' of type 'f32' with value of type 'i32'»), como en GLSL. Dos formas de leer los errores: getCompilationInfo() (línea y columna) y un ámbito de errores alrededor de createShaderModule, que además muestra cómo el error se contagia al pipeline"
example_tags: "javascript|webgpu|wgsl|tipos|conversiones|getcompilationinfo|pusherrorscope|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
addEventListener('pagehide', () => device.destroy());

// Forma 1: getCompilationInfo() da cada mensaje con su tipo, su línea y su columna
async function messagesOf(code) {
  const module = device.createShaderModule({ label: 'media', code });
  const { messages } = await module.getCompilationInfo();
  return messages.map((m) => `${m.type} ${m.lineNum}:${m.linePos} ${m.message}`);
}

// 🐛 total / count es i32 (división entera), y WGSL no lo convierte solo a f32
const broken = /* wgsl */ `fn average(total: i32, count: i32) -> f32 {
  let mean: f32 = total / count;
  let rounded: i32 = mean;
  return mean;
}`;
const brokenMessages = await messagesOf(broken);
console.log('🐛 mensajes →', brokenMessages.length); // la línea 3 también está mal…
for (const line of brokenMessages) console.log(`   ${line}`);

// ✅ Conversiones explícitas, con el nombre del tipo: f32(…), i32(…), u32(…)
const fixed = /* wgsl */ `fn average(total: i32, count: i32) -> f32 {
  let mean = f32(total) / f32(count);
  let rounded = i32(round(mean));
  return mean;
}`;
console.log('✅ mensajes →', (await messagesOf(fixed)).length);

// Forma 2: un ámbito de errores. Una errata en la línea 4: «datos» en lugar de «data».
const typo = /* wgsl */ `@group(0) @binding(0) var<storage, read_write> data: array<f32>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
  data[id.x] = datos[id.x] * 2.0;
}`;
device.pushErrorScope('validation');
const module = device.createShaderModule({ label: 'duplicar', code: typo });
const moduleError = await device.popErrorScope();
console.log('🐛 createShaderModule →', moduleError.message.split('\n')[0]);

// El módulo inválido contagia a todo lo que se cree con él: lee siempre el PRIMER error
device.pushErrorScope('validation');
device.createComputePipeline({ label: 'duplicar', layout: 'auto', compute: { module } });
const pipelineError = await device.popErrorScope();
console.log('🐛 createComputePipeline →', pipelineError.message.split('\n')[0]);
```
