---
example_description: "La carta de un restaurante llega como JSON: con any, una entrada rota revienta lejos; con unknown, cada entrada se comprueba a mano (typeof, in, Array.isArray) y el resultado es una unión discriminada ok/error que obliga a tratar los fallos"
example_tags: "typescript|integracion|json|unknown|any|estrechamiento|uniones-discriminadas|validacion"
example_stage: intermediate
example_importance: critical
console: true
---

# TypeScript

```typescript
// Así esperamos los platillos (lección 3)…
type MenuItem = { id: string; name: string; priceCents: number; tags: string[]; spicy: boolean };

// …y esto es lo que llega de verdad (una entrada sin nombre, otra con precio en texto).
const body = `[
  {"id": "tla", "name": "Tlayuda", "price": 120, "tags": ["oaxaqueña"], "spicy": false},
  {"id": "mol", "name": "Mole negro", "price": 165, "tags": ["oaxaqueña", "temporada"], "spicy": true},
  {"id": "taj", "price": 180},
  {"id": "poz", "name": "Pozole rojo", "price": "150"},
  {"id": "agu", "name": "Agua de jamaica", "price": 35}
]`;

// 🐛 Con any (lección 1), la anotación se acepta sin mirar nada…
const careless: MenuItem[] = JSON.parse(body);
try {
  console.log(careless.map((item) => item.name.toUpperCase()));
} catch (error) {
  console.log('🐛 con any →', String(error)); // …y el fallo sale al usar los datos
}

// ✅ Con unknown (lección 2), cada propiedad se comprueba antes de usarla (lección 4).
type ParseResult = { ok: true; item: MenuItem } | { ok: false; error: string };

function readItem(data: unknown, index: number): ParseResult {
  const where = `entrada ${index + 1}`;
  if (typeof data !== 'object' || data === null) return { ok: false, error: `${where}: no es un objeto` };
  if (!('id' in data) || typeof data.id !== 'string') return { ok: false, error: `${where}: falta id` };
  if (!('name' in data) || typeof data.name !== 'string') return { ok: false, error: `${data.id}: falta name` };
  if (!('price' in data) || typeof data.price !== 'number' || data.price < 0) {
    return { ok: false, error: `${data.id}: price debe ser un número ≥ 0` };
  }
  // Opcionales: si faltan, un valor por defecto; si están, se comprueban igual.
  const tags: string[] = [];
  if ('tags' in data && Array.isArray(data.tags)) {
    for (const tag of data.tags) if (typeof tag === 'string') tags.push(tag);
  }
  const spicy = 'spicy' in data && data.spicy === true;
  return { ok: true, item: { id: data.id, name: data.name, priceCents: Math.round(data.price * 100), tags, spicy } };
}

const raw: unknown = JSON.parse(body);
const entries: unknown[] = Array.isArray(raw) ? raw : [];
const menu: MenuItem[] = [];
for (const [index, entry] of entries.entries()) {
  const result = readItem(entry, index);
  if (result.ok) menu.push(result.item); // aquí result es { ok: true; item }
  else console.log('⚠️', result.error); // y aquí { ok: false; error }
}

for (const item of menu) {
  const extras = [item.spicy ? '🌶️' : '', ...item.tags].filter((text) => text !== '').join(' ');
  console.log(`✅ ${item.name} · $${(item.priceCents / 100).toFixed(2)} ${extras}`.trimEnd());
}
```
