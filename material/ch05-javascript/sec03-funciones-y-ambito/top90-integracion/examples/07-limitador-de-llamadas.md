---
example_description: "once, after y un limitador de ventana deslizante construidos con closures; envolver un método con una flecha pierde this y con function + apply lo conserva"
example_tags: "javascript|integracion|closures|this|apply|orden-superior"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// LIMITADORES para el cliente de una API de envíos, con el reloj simulado.
// Integra: closures («Closures»), envoltorios de orden superior y objeto de
// opciones, this con apply («La palabra clave this»), rest y spread («Parámetros»).

// Todos los envoltorios usan function (no flecha) y fn.apply(this, args):
// así, si envuelven un MÉTODO, el método sigue recibiendo su objeto como this.
function once(fn) {
  let done = false;
  let result;
  return function (...args) {
    if (!done) {
      done = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}
function after(times, fn) {
  let calls = 0;
  return function (...args) {
    calls += 1;
    return calls >= times ? fn.apply(this, args) : undefined;
  };
}
// Como mucho max llamadas en cualquier ventana de perMs milisegundos.
function rateLimit(fn, { max, perMs, now, onReject = () => {} }) {
  let recent = []; // instantes de las llamadas aceptadas
  return function (...args) {
    const time = now();
    recent = recent.filter((t) => time - t < perMs); // olvida las que salieron de la ventana
    if (recent.length >= max) return onReject(time, args);
    recent = [...recent, time];
    return fn.apply(this, args);
  };
}

let fakeTime = 0;
const shippingApi = {
  baseUrl: 'https://api.example.com/v2',
  connect: once(function () {
    console.log(`  🔌 conectando con ${this.baseUrl}…`);
    return 'sesión-7f3a';
  }),
  track(code) {
    return `${this.baseUrl}/tracking/${code}`;
  },
};

console.log('connect ×3 →', shippingApi.connect(), shippingApi.connect(), shippingApi.connect());

// 🐛 Un envoltorio con flecha llama a fn como función simple: el método pierde this.
const arrowWrap = (fn) => (...args) => fn(...args);
const brokenTrack = arrowWrap(shippingApi.track);
console.log('🐛 flecha →', brokenTrack('ES123'));  // 'undefined/tracking/ES123'

// ✅ El limitador (function + apply) se coloca como método y conserva this.
const rejected = [];
shippingApi.track = rateLimit(shippingApi.track, {
  max: 3,
  perMs: 1000,
  now: () => fakeTime,
  onReject: (time, [code]) => {
    rejected.push(code);
    return `⏳ espera (t=${time})`;
  },
});

const warnAfterThreeRejections = after(3, () => console.log('  ⚠️ 3 peticiones rechazadas: avisa al equipo'));
// Peticiones de seguimiento: [milisegundo, código del envío].
const requests = [[0, 'A1'], [200, 'A2'], [400, 'A3'], [600, 'A4'], [900, 'A5'],
  [1250, 'A6'], [1300, 'A7'], [1450, 'A8'], [1500, 'A9']];
for (const [time, code] of requests) {
  fakeTime = time;
  const result = shippingApi.track(code);
  console.log(`t=${String(time).padStart(4)} · ${code} → ${result}`);
  if (result.startsWith('⏳')) warnAfterThreeRejections();
}
console.log('rechazadas →', rejected);
```
