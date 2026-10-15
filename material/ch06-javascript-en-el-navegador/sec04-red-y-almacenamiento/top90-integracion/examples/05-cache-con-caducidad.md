---
example_description: "Una caché de respuestas en localStorage con caducidad: dentro del plazo responde al instante sin pedir nada; caducada, vuelve a la red; sin conexión, sirve la copia vieja avisando de su edad. JSON de ida y vuelta, QuotaExceededError atrapado y un reloj simulado para probar los plazos"
example_tags: "javascript|fetch|localstorage|cache|ttl|sin-conexion|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Combina «Peticiones con fetch» (errores de red), «Almacenamiento en el
// navegador» (JSON, cuotas) y «URL e historial» (URLSearchParams).
const CACHE_PREFIX = 'lw-red-cache:';
let clock = Date.parse('2026-10-14T18:00:00Z'); // reloj simulado: lo avanzamos a mano
const now = () => clock;
let online = true;

// La «API de precios»: el servidor de prueba con 300 ms de retraso. Sin
// conexión, una dirección donde no contesta nadie.
async function fetchPrices() {
  const url = new URL(online ? '/api/demo/echo' : 'http://localhost:59999/', document.baseURI);
  url.searchParams.set('lista', 'otono-2026');
  url.searchParams.set('delay', '300');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const echo = await response.json();
  return { list: echo.query.lista, prices: { 'CAF-500': 210, 'CAC-250': 145 } };
}

async function cachedJSON(key, loader, { ttlMs }) {
  const storageKey = CACHE_PREFIX + key;
  let entry = null;
  try {
    entry = JSON.parse(localStorage.getItem(storageKey)); // null si no hay nada
  } catch {
    entry = null; // copia corrupta: como si no hubiera
  }
  const ageMin = entry ? (now() - entry.savedAt) / 60_000 : Infinity;
  if (ageMin * 60_000 < ttlMs) return { data: entry.data, source: `caché, de hace ${ageMin} min` };
  try {
    const data = await loader();
    try {
      localStorage.setItem(storageKey, JSON.stringify({ savedAt: now(), data }));
    } catch (error) {
      if (error.name !== 'QuotaExceededError') throw error; // sin sitio: sigue sin caché
    }
    return { data, source: 'red' };
  } catch (error) {
    // Un fallo de red con copia vieja: mejor datos viejos (avisando) que nada.
    if (entry && error.name === 'TypeError') return { data: entry.data, source: `caché CADUCADA, de hace ${ageMin} min (sin conexión)` };
    throw error;
  }
}

async function show(label) {
  const start = performance.now();
  try {
    const { data, source } = await cachedJSON('precios', fetchPrices, { ttlMs: 5 * 60_000 });
    const ms = performance.now() - start;
    console.log(`${label} → ${source} | ${data.list}: café $${data.prices['CAF-500']} | ${source === 'red' ? `≥ 300 ms: ${ms >= 300}` : `< 50 ms: ${ms < 50}`}`);
  } catch (error) {
    console.log(`${label} → 📡 ${error.name}: sin conexión y sin copia guardada`);
  }
}

localStorage.removeItem(`${CACHE_PREFIX}precios`); // empezar limpio
await show('18:00 primera visita');
clock += 2 * 60_000;
await show('18:02');
clock += 8 * 60_000;
await show('18:10 (caducó a los 5 min)');
online = false;
clock += 10 * 60_000;
await show('18:20 sin conexión');
localStorage.removeItem(`${CACHE_PREFIX}precios`);
await show('18:20 sin conexión ni copia');
online = true;

// Los datos de una caché así son siempre «de mejor esfuerzo»: el navegador
// puede borrarlos. Para respuestas grandes o muchas URLs, la Cache API o
// IndexedDB (lección «Almacenamiento en el navegador») tienen más cuota.
```
