---
example_description: "Un constructor de consultas inmutable sobre el catálogo de una tienda de discos: where con condiciones que dependen del tipo de cada campo (rango para números, texto o lista para strings), orderBy con claves comprobadas, y select<K> que cambia el tipo del resultado a Pick<T, K>"
example_tags: "typescript|profesional|genericos|tipos-mapeados|tipos-condicionales|pick|keyof|clases"
example_stage: professional
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// ── Las condiciones dependen del tipo de cada campo (condicional + mapeado) ─
type Range = { min?: number; max?: number };
// [V] entre corchetes: sin reparto (lección 3). Si no, con genre = 'rock' | 'son' | …
// readonly V[] sería readonly 'rock'[] | readonly 'son'[] | …, y ['rock', 'son'] no encajaría.
type Condition<V> =
  [V] extends [number] ? number | Range
  : [V] extends [string] ? V | readonly V[] | { includes: string }
  : [V] extends [boolean] ? boolean
  : never;
type Where<T> = { [K in keyof T]?: Condition<T[K]> };
type Direction = 'asc' | 'desc';

function matches(value: unknown, condition: unknown): boolean {
  if (Array.isArray(condition)) return condition.includes(value);
  if (typeof condition !== 'object' || condition === null) return value === condition;
  if (typeof value === 'number') {
    const min = Reflect.get(condition, 'min');
    const max = Reflect.get(condition, 'max');
    return (typeof min !== 'number' || value >= min) && (typeof max !== 'number' || value <= max);
  }
  const text = Reflect.get(condition, 'includes');
  return typeof value === 'string' && typeof text === 'string' && value.toLowerCase().includes(text.toLowerCase());
}

// ── La consulta: cada método devuelve una consulta NUEVA (inmutable) ──────
class Query<T, Selected extends keyof T = keyof T> {
  readonly #rows: readonly T[];
  readonly #filters: readonly Where<T>[];
  readonly #order: readonly [keyof T, Direction] | null;
  readonly #fields: readonly Selected[] | null;
  readonly #max: number;

  constructor(rows: readonly T[], filters: readonly Where<T>[] = [], order: readonly [keyof T, Direction] | null = null, fields: readonly Selected[] | null = null, max = Infinity) {
    this.#rows = rows;
    this.#filters = filters;
    this.#order = order;
    this.#fields = fields;
    this.#max = max;
  }

  where(filter: Where<T>): Query<T, Selected> {
    return new Query(this.#rows, [...this.#filters, filter], this.#order, this.#fields, this.#max);
  }
  orderBy(key: keyof T, direction: Direction = 'asc'): Query<T, Selected> {
    return new Query(this.#rows, this.#filters, [key, direction], this.#fields, this.#max);
  }
  // select cambia el tipo del resultado: de T completo a Pick<T, K>.
  select<K extends keyof T>(...fields: K[]): Query<T, K> {
    return new Query<T, K>(this.#rows, this.#filters, this.#order, fields, this.#max);
  }
  limit(count: number): Query<T, Selected> {
    return new Query(this.#rows, this.#filters, this.#order, this.#fields, count);
  }

  run(): Pick<T, Selected>[] {
    let rows = this.#rows.filter((row) =>
      this.#filters.every((filter) =>
        Object.entries(filter).every(([key, condition]) => matches(Reflect.get(Object(row), key), condition)),
      ),
    );
    if (this.#order) {
      const [key, direction] = this.#order;
      const sign = direction === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => (a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0));
    }
    const fields = this.#fields;
    return rows.slice(0, this.#max).map((row) => {
      if (fields === null) return row; // sin select, Selected es keyof T y Pick<T, keyof T> es T
      const picked = {} as Pick<T, Selected>;
      for (const field of fields) picked[field] = row[field];
      return picked;
    });
  }
}

// ── El catálogo de una tienda de discos ───────────────────────────────────
type Album = { sku: string; title: string; artist: string; genre: 'bolero' | 'rock' | 'son' | 'cumbia'; year: number; price: number; vinyl: boolean };
const ALBUMS: readonly Album[] = [
  { sku: 'LP-101', title: 'Amor prohibido', artist: 'Selena', genre: 'cumbia', year: 1994, price: 649, vinyl: true },
  { sku: 'LP-102', title: 'Re', artist: 'Café Tacvba', genre: 'rock', year: 1994, price: 699, vinyl: true },
  { sku: 'CD-103', title: 'Sones de Veracruz', artist: 'Mono Blanco', genre: 'son', year: 1997, price: 259, vinyl: false },
  { sku: 'LP-104', title: 'Romance', artist: 'Luis Miguel', genre: 'bolero', year: 1991, price: 589, vinyl: true },
  { sku: 'CD-105', title: 'El circo', artist: 'Maldita Vecindad', genre: 'rock', year: 1991, price: 239, vinyl: false },
  { sku: 'LP-106', title: 'Avalancha de éxitos', artist: 'Café Tacvba', genre: 'rock', year: 1996, price: 629, vinyl: true },
];

const vinylsOfThe90s = new Query(ALBUMS)
  .where({ vinyl: true, year: { min: 1990, max: 1995 } })
  .orderBy('price', 'desc')
  .select('title', 'artist', 'price');
const rows = vinylsOfThe90s.run();
type Checks = [Expect<Equal<(typeof rows)[number], { title: string; artist: string; price: number }>>];
for (const row of rows) console.log(`💿 ${row.title} · ${row.artist} · $${row.price}`);

const rock = new Query(ALBUMS).where({ genre: ['rock', 'son'], artist: { includes: 'café' } }).select('sku', 'year').orderBy('year').run();
console.log('rock con «café» →', rock.map((album) => `${album.sku} (${album.year})`).join(', '));

const cheapest = new Query(ALBUMS).orderBy('price').limit(2).run(); // sin select: Album completo
console.log('los 2 más baratos →', cheapest.map((album) => `${album.title} $${album.price}`).join(' · '));
// .where({ year: 'noventas' }) sería un error: year pide un número o un rango.
// .where({ genre: 'jazz' }) también: genre solo admite sus cuatro valores.
// rows[0].year también: el select dejó solo title, artist y price.
```
