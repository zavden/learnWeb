---
example_description: "Ejercicio: carga bajo demanda con import(): valida y carga métodos de pago (su exportación por defecto), carga catálogos JSON con with { type: 'json' } y una alternativa, escribe once() y carga varios catálogos a la vez"
example_tags: "javascript|ejercicio|modulos|import-dinamico|json|promesas"
exercise: true
exercise_title: "Carga bajo demanda"
exercise_instructions: "loadPaymentMethod(id): si id no está en PAYMENT_IDS, lanza RangeError('Método de pago no disponible: ' + id); si está, importa ./08-ej/payments/<id>.js y devuelve su exportación POR DEFECTO || loadMessages(lang): importa ./08-ej/messages/<lang>.json como JSON (with { type: 'json' }) y devuelve el objeto; si la carga falla, devuelve el catálogo de 'es' || once(loader): devuelve una función que llama a loader() solo la primera vez y después devuelve siempre la misma promesa || loadAllMessages(langs): carga todos los catálogos A LA VEZ y devuelve un objeto { es: catálogo, en: catálogo, … } || Ejecuta hasta que las nueve comprobaciones salgan ✓"
exercise_hints: "import() devuelve una promesa del espacio de nombres: la exportación por defecto está en la clave default || El atributo JSON con import() va en un segundo argumento: import(ruta, { with: { type: 'json' } }) || Un 404 rechaza la promesa de import(): un try/catch alrededor del await basta para la alternativa || En once, guarda la promesa en una variable de fuera de la función que devuelves (un closure) y créala solo si todavía no existe || Promise.all con map crea las promesas a la vez; Object.fromEntries convierte [[lang, catálogo], …] en un objeto"
exercise_solution_example: 08-ej-carga-bajo-demanda-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: carga bajo demanda con import(). Completa cada TODO.
// Archivos que usa (assets/08-ej/):
//   payments/card.js, payments/oxxo.js → export default { id, label, fee(cents) }
//   messages/es.json, messages/en.json → { "cartTitle": …, "checkout": … }
//   (no hay fr.json)

const PAYMENT_IDS = ['card', 'oxxo'];

// TODO 1: valida el id y devuelve la exportación POR DEFECTO de
// ./08-ej/payments/<id>.js
async function loadPaymentMethod(id) {
  return null;
}

// TODO 2: importa ./08-ej/messages/<lang>.json como JSON; si falla, devuelve
// el catálogo de 'es'.
async function loadMessages(lang) {
  return {};
}

// TODO 3: llama a loader() solo la primera vez; después, la misma promesa.
function once(loader) {
  return () => loader();
}

// TODO 4: carga los catálogos a la vez → { es: {…}, en: {…} }
async function loadAllMessages(langs) {
  return {};
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
async function check(description, compute, expected) {
  let actual;
  try {
    const limit = new Promise((resolve) => setTimeout(resolve, 2000, '⏰ no terminó en 2 s'));
    actual = await Promise.race([compute(), limit]);
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const rejectionOf = async (promise) => {
  try {
    await promise;
    return 'no se rechazó';
  } catch (error) {
    return `${error.name}: ${error.message}`;
  }
};

async function runChecks() {
  await check('loadPaymentMethod(\'card\') da el método de tarjeta', async () => (await loadPaymentMethod('card')).label, 'Tarjeta');
  await check('loadPaymentMethod(\'oxxo\') da un objeto con fee()', async () => (await loadPaymentMethod('oxxo')).fee(48720), 1200);
  await check('un método desconocido se rechaza con RangeError', () => rejectionOf(loadPaymentMethod('paypal')), 'RangeError: Método de pago no disponible: paypal');
  await check('dos cargas del mismo método dan el mismo objeto', async () => {
    const first = await loadPaymentMethod('card');
    return first !== null && first === await loadPaymentMethod('card');
  }, true);
  await check('loadMessages(\'en\') carga el JSON en inglés', async () => (await loadMessages('en')).cartTitle, 'Your cart');
  await check('loadMessages(\'fr\') no existe: usa el español', async () => (await loadMessages('fr')).cartTitle, 'Tu carrito');
  await check('once: el loader se llama una sola vez', async () => {
    let calls = 0;
    const loadOnce = once(() => {
      calls += 1;
      return loadMessages('es');
    });
    await Promise.all([loadOnce(), loadOnce(), loadOnce()]);
    return `${calls} llamada(s)`;
  }, '1 llamada(s)');
  await check('once: siempre la misma promesa', async () => {
    const loadOnce = once(() => loadMessages('es'));
    return loadOnce() === loadOnce();
  }, true);
  await check('loadAllMessages([\'es\', \'en\']) los carga a la vez', async () => {
    const all = await loadAllMessages(['es', 'en']);
    return Object.entries(all).map(([lang, messages]) => `${lang}: ${messages?.cartTitle}`).join(' · ');
  }, 'es: Tu carrito · en: Your cart');
}
runChecks();
```
