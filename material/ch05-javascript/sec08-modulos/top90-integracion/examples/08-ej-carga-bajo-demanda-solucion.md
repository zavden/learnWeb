---
example_description: "Solución: loadPaymentMethod valida y devuelve el default del módulo, loadMessages importa el JSON con with { type: 'json' } y cae al español si falla, once guarda la promesa en un closure y loadAllMessages usa Promise.all"
example_tags: "javascript|solucion|modulos|import-dinamico|json|promesas"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: carga bajo demanda con import().

const PAYMENT_IDS = ['card', 'oxxo'];

async function loadPaymentMethod(id) {
  if (!PAYMENT_IDS.includes(id)) throw new RangeError(`Método de pago no disponible: ${id}`);
  const { default: method } = await import(`./08-ej/payments/${id}.js`);
  return method; // el mismo objeto cada vez: el módulo se evalúa una sola vez
}

async function loadMessages(lang) {
  try {
    const { default: messages } = await import(`./08-ej/messages/${lang}.json`, { with: { type: 'json' } });
    return messages;
  } catch {
    const { default: fallback } = await import('./08-ej/messages/es.json', { with: { type: 'json' } });
    return fallback;
  }
}

function once(loader) {
  let promise = null; // el closure recuerda la promesa entre llamadas
  return () => {
    promise ??= loader();
    return promise;
  };
}

async function loadAllMessages(langs) {
  const catalogs = await Promise.all(langs.map((lang) => loadMessages(lang)));
  return Object.fromEntries(langs.map((lang, index) => [lang, catalogs[index]]));
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
