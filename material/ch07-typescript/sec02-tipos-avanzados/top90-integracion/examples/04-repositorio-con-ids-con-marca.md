---
example_description: "Un repositorio genérico para los datos de un museo: ids con marca por entidad (Id<'Museum'> no sirve donde se pide Id<'Exhibition'>), create recibe Omit<T, 'id'>, update un Partial sin id, y lo que sale es DeepReadonly y además está congelado (en modo estricto, cambiarlo lanza)"
example_tags: "typescript|integracion|genericos|tipos-con-marca|tipos-de-utilidad|omit|partial|tipos-recursivos|readonly"
example_stage: intermediate
example_importance: critical
console: true
---

# TypeScript

```typescript
// ── Ids con marca: un texto que solo vale para su entidad (lección 6) ─────
type Id<Entity extends string> = string & { readonly __brand: Entity };
// DeepReadonly (lección 3), con un cambio: una marca es string & { … }, que también
// «es un objeto»; por eso los primitivos (con o sin marca) se dejan pasar primero.
type DeepReadonly<T> = T extends string | number | boolean | null | undefined ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> };

type Museum = { id: Id<'Museum'>; name: string; city: string };
type Exhibition = { id: Id<'Exhibition'>; museumId: Id<'Museum'>; title: string; until: string; tags: string[] };

// ── Un repositorio para cualquier entidad con id (lecciones 1 y 4) ────────
class Repository<T extends { id: Id<string> }> {
  #items = new Map<T['id'], DeepReadonly<T>>();
  #next = 1;
  #prefix: string;
  constructor(prefix: string) {
    this.#prefix = prefix;
  }

  create(input: Omit<T, 'id'>): DeepReadonly<T> {
    const id = `${this.#prefix}-${this.#next++}` as T['id']; // el único sitio que fabrica ids
    // TypeScript no puede demostrar que Omit<T, 'id'> + id es un T genérico: as.
    const item = deepFreeze({ ...input, id } as T);
    this.#items.set(id, item);
    return item;
  }
  get(id: T['id']): DeepReadonly<T> | undefined {
    return this.#items.get(id);
  }
  update(id: T['id'], patch: Partial<Omit<T, 'id'>>): DeepReadonly<T> {
    const current = this.#items.get(id);
    if (current === undefined) throw new Error(`No existe ${id}`);
    const next = deepFreeze({ ...current, ...patch } as T); // copia nueva: la anterior no cambia
    this.#items.set(id, next);
    return next;
  }
}

function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}

// ── Uso ───────────────────────────────────────────────────────────────────
const museums = new Repository<Museum>('mus');
const exhibitions = new Repository<Exhibition>('exp');

const munal = museums.create({ name: 'Museo Nacional de Arte', city: 'Ciudad de México' });
const velasco = exhibitions.create({ museumId: munal.id, title: 'Velasco: el valle', until: '2027-01-31', tags: ['paisaje'] });
console.log('creada →', velasco.id, '«' + velasco.title + '» en', museums.get(velasco.museumId)?.name);
// museums.get(velasco.id) sería un error: un Id<'Exhibition'> no es un Id<'Museum'>.
// exhibitions.create({ id: …, … }) también: create no admite id (Omit).

const extended = exhibitions.update(velasco.id, { until: '2027-03-15' });
console.log('ampliada →', extended.until, '| la versión anterior sigue igual →', velasco.until);

try {
  (extended.tags as string[]).push('siglo XIX'); // el tipo lo prohíbe; el as lo fuerza…
} catch (error) {
  console.log('🧊 congelada →', String(error)); // …y deepFreeze lo impide en ejecución
}
```
