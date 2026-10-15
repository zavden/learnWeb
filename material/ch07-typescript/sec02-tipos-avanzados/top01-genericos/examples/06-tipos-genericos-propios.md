---
example_description: "Tipos e interfaces con parámetros: Result<T> (éxito con un valor T o error) y Page<T> (una página de resultados de cualquier cosa); la misma función de paginar sirve para museos y para obras"
example_tags: "typescript|genericos|interface|uniones-discriminadas|paginacion"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Un tipo genérico es una «plantilla» de tipo: Result<number>, Result<Museum>…
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// Las interfaces también aceptan parámetros.
interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
}

type Museum = { name: string; city: string };
type Artwork = { title: string; year: number };

function paginate<T>(all: T[], page: number, size: number): Page<T> {
  const start = (page - 1) * size;
  return { items: all.slice(start, start + size), page, totalPages: Math.ceil(all.length / size) };
}

function parseVisitors(text: string): Result<number> {
  const visitors = Number(text);
  return Number.isInteger(visitors) && visitors > 0
    ? { ok: true, value: visitors }
    : { ok: false, error: `«${text}» no es un número de visitantes` };
}

const museums: Museum[] = [
  { name: 'Museo Nacional de Antropología', city: 'CDMX' },
  { name: 'MUNAL', city: 'CDMX' },
  { name: 'Museo Amparo', city: 'Puebla' },
];
const artworks: Artwork[] = [
  { title: 'La Bañista', year: 1919 },
  { title: 'Paisaje del valle de México', year: 1875 },
];

const museumPage = paginate(museums, 2, 2); // Page<Museum>
const artPage = paginate(artworks, 1, 5); // Page<Artwork>
console.log(`página ${museumPage.page}/${museumPage.totalPages} →`, museumPage.items.map((m) => m.city));
console.log(`página ${artPage.page}/${artPage.totalPages} →`, artPage.items.map((a) => a.year));

for (const text of ['12', 'doce']) {
  const result = parseVisitors(text); // Result<number>
  console.log(result.ok ? `✅ ${result.value} visitantes` : `⚠️ ${result.error}`);
}
```
