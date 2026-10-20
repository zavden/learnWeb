---
example_description: "Un dispositivo solo tiene las características que se le piden: aunque el adaptador tenga «shader-f16», un shader con «enable f16;» no compila en un dispositivo pedido sin opciones. Con requiredFeatures: ['shader-f16'] (y solo si el adaptador la tiene) compila"
example_tags: "javascript|webgpu|features|requiredfeatures|shader-f16|f16|wgsl|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const adapter = await navigator.gpu.requestAdapter();

// Un shader con números de media precisión (f16, lección «Float32 y precisión»).
// «enable f16;» va al principio; 0.5h es un literal f16 (la h de half).
const code = /* wgsl */ `enable f16;
fn halfPrice(price: f16) -> f16 {
  return price * 0.5h;
}`;

async function compile(device) {
  device.pushErrorScope('validation');
  device.createShaderModule({ label: 'precios en f16', code });
  const error = await device.popErrorScope();
  return error ? error.message.split('\n')[0] : 'compila';
}

console.log('¿el adaptador tiene shader-f16? →', adapter.features.has('shader-f16'));

// 🐛 Aunque el adaptador la tenga, el dispositivo solo trae lo que pides
const basic = await adapter.requestDevice();
console.log('🐛 características →', [...basic.features].sort().join(', '));
console.log('🐛 enable f16 →', await compile(basic));
basic.destroy();

// ✅ requiredFeatures, solo si el adaptador la tiene (si no, requestDevice() falla).
// Un adaptador nuevo: cada uno da un solo dispositivo (ejemplo 04).
const halfAdapter = await navigator.gpu.requestAdapter();
if (halfAdapter.features.has('shader-f16')) {
  const withHalf = await halfAdapter.requestDevice({ requiredFeatures: ['shader-f16'] });
  console.log('✅ características →', [...withHalf.features].sort().join(', '));
  console.log('✅ enable f16 →', await compile(withHalf));
  withHalf.destroy();
}
```
