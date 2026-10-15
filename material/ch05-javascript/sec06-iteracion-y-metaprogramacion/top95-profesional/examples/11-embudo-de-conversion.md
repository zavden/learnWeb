---
example_description: "Analítica de una tienda sobre un flujo de clics: la actividad de 40 usuarios (generadores con semilla) se mezcla por orden de tiempo, se quitan los dobles clics, se parte en sesiones por inactividad y se calcula el embudo de conversión, por dispositivo y por producto, con generadores y helpers"
example_tags: "javascript|profesional|generadores|iterator-helpers|analitica|streaming|groupby"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// EL EMBUDO DE CONVERSIÓN DE UNA TIENDA EN LÍNEA, calculado sobre un flujo de clics.
//
// Decisiones:
// - La actividad de cada usuario es un generador (azar con semilla). El flujo
//   de la tienda MEZCLA los 40 generadores por orden de tiempo (una mezcla de k
//   flujos ordenados: en cada paso sale el evento más temprano de todos).
// - dropDoubleClicks quita los eventos repetidos seguidos (el doble clic).
// - sessions() parte la actividad de cada usuario en SESIONES cuando pasan más
//   de 30 minutos sin eventos. Guarda la sesión abierta de cada usuario en un
//   Map y la entrega cuando se cierra; al final, entrega las que quedan.
// - El embudo cuenta hasta qué paso llegó cada sesión: ver → carrito →
//   pago → compra. Map.groupBy separa los resultados por dispositivo.
// - El tiempo son segundos desde las 00:00 UTC: se formatea con aritmética,
//   sin Date, así que no depende de la zona horaria.
//
// Alcance: módulos 1-6.

function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

const PRODUCTS = [
  { sku: 'CAF-500', name: 'Café de Chiapas', cents: 21000 },
  { sku: 'MOL-250', name: 'Mole poblano', cents: 16000 },
  { sku: 'CAC-070', name: 'Chocolate de mesa', cents: 9500 },
  { sku: 'VAI-100', name: 'Vainilla de Papantla', cents: 18500 },
  { sku: 'MIE-500', name: 'Miel de Yucatán', cents: 14000 },
];
const STEPS = ['view', 'cart', 'checkout', 'purchase'];
const STEP_LABELS = { view: 'ver producto', cart: 'añadir al carrito', checkout: 'iniciar pago', purchase: 'comprar' };
const SESSION_GAP = 30 * 60;
const clock = (seconds) => `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}`;

const counters = { generated: 0 };

// ── 1. La actividad de un usuario ──────────────────────────────────────────
function* userActivity(user, seed) {
  const random = createRandom(seed);
  const device = random() < 0.6 ? 'móvil' : 'escritorio';
  const pick = (list) => list[Math.floor(random() * list.length)];
  let t = 8 * 3600 + Math.floor(random() * 4 * 3600); // empieza entre las 08:00 y las 12:00
  const visits = 1 + Math.floor(random() * 3);
  for (let visit = 0; visit < visits; visit++) {
    const product = pick(PRODUCTS);
    const journey = ['view'];
    for (let i = Math.floor(random() * 3); i > 0; i--) journey.push('view');
    if (random() < 0.5) journey.push('cart');
    if (journey.includes('cart') && random() < 0.6) journey.push('checkout');
    if (journey.includes('checkout') && random() < 0.7) journey.push('purchase');
    for (const type of journey) {
      t += 20 + Math.floor(random() * 240);
      const event = { user, device, t, type, sku: type === 'view' ? pick(PRODUCTS).sku : product.sku };
      counters.generated += 1;
      yield event;
      if (random() < 0.1) { // un doble clic: el mismo evento, otra vez
        counters.generated += 1;
        yield { ...event };
      }
    }
    t += SESSION_GAP + Math.floor(random() * 3 * 3600); // vuelve más tarde: otra sesión
  }
}

// ── 2. Mezclar k flujos ordenados por tiempo ───────────────────────────────
function* mergeByTime(streams) {
  const heads = streams.map((stream) => {
    const iterator = stream[Symbol.iterator]();
    return { iterator, current: iterator.next() };
  });
  try {
    while (true) {
      let earliest = null;
      for (const head of heads) {
        if (!head.current.done && (!earliest || head.current.value.t < earliest.current.value.t)) earliest = head;
      }
      if (!earliest) return;
      yield earliest.current.value;
      earliest.current = earliest.iterator.next();
    }
  } finally {
    for (const head of heads) head.iterator.return?.(); // si el consumidor sale antes
  }
}

// ── 3. Limpiar y partir en sesiones ────────────────────────────────────────
function* dropDoubleClicks(events) {
  const last = new Map(); // usuario → su último evento
  for (const event of events) {
    const previous = last.get(event.user);
    last.set(event.user, event);
    if (previous && previous.t === event.t && previous.type === event.type && previous.sku === event.sku) continue;
    yield event;
  }
}

function* sessions(events) {
  const open = new Map(); // usuario → sesión abierta
  for (const event of events) {
    const session = open.get(event.user);
    if (session && event.t - session.end <= SESSION_GAP) {
      session.events.push(event);
      session.end = event.t;
      continue;
    }
    if (session) yield session; // la sesión anterior de ese usuario se cerró
    open.set(event.user, { user: event.user, device: event.device, start: event.t, end: event.t, events: [event] });
  }
  yield* open.values(); // las que seguían abiertas al acabar el flujo
}

const furthestStep = (session) => Math.max(...session.events.map((event) => STEPS.indexOf(event.type)));

// ── El análisis ────────────────────────────────────────────────────────────
const USERS = Array.from({ length: 40 }, (_, i) => `u${String(i + 1).padStart(3, '0')}`);
const masterRandom = createRandom(2026); // la semilla de cada usuario sale de otra semilla
const SEEDS = USERS.map(() => 1 + Math.floor(masterRandom() * 2147483645));
const storeStream = () => mergeByTime(USERS.map((user, i) => userActivity(user, SEEDS[i])));

console.group('Los primeros eventos de la mañana');
for (const event of storeStream().take(4)) console.log(`${clock(event.t)} ${event.user} (${event.device}) ${event.type} ${event.sku}`);
console.groupEnd();

counters.generated = 0;
const clean = [...dropDoubleClicks(storeStream())];
console.log(`eventos → ${counters.generated} | sin dobles clics → ${clean.length}`);

const allSessions = [...sessions(clean)];
console.log('sesiones →', allSessions.length, '| usuarios →', new Set(allSessions.map((session) => session.user)).size);

function funnel(group) {
  const reached = STEPS.map((_, step) => group.filter((session) => furthestStep(session) >= step).length);
  return Object.fromEntries(STEPS.map((step, i) => [STEP_LABELS[step], {
    sesiones: reached[i],
    'del total': `${Math.round((reached[i] / reached[0]) * 100)} %`,
    'del paso anterior': i === 0 ? '—' : `${Math.round((reached[i] / reached[i - 1]) * 100)} %`,
  }]));
}
console.table(funnel(allSessions));

for (const [device, group] of Map.groupBy(allSessions, (session) => session.device)) {
  const bought = group.filter((session) => furthestStep(session) === 3).length;
  console.log(`${device} → ${group.length} sesiones, conversión ${Math.round((bought / group.length) * 100)} %`);
}

const views = new Map();
for (const event of clean.values().filter((e) => e.type === 'view')) views.set(event.sku, (views.get(event.sku) ?? 0) + 1);
const topViewed = [...views].toSorted((a, b) => b[1] - a[1]).slice(0, 3);
console.log('más vistos →', topViewed.map(([sku, count]) => `${PRODUCTS.find((p) => p.sku === sku).name} (${count})`).join(' · '));

// Perezoso de principio a fin: la primera compra de vainilla corta todo el flujo.
counters.generated = 0;
const firstVanilla = dropDoubleClicks(storeStream()).find((event) => event.type === 'purchase' && event.sku === 'VAI-100');
const when = firstVanilla ? `${clock(firstVanilla.t)} (${firstVanilla.user})` : 'ninguna';
console.log(`primera compra de vainilla → ${when} | eventos generados hasta entonces → ${counters.generated}`);
```
