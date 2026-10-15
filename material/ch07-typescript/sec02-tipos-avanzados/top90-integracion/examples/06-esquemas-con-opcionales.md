---
example_description: "Un mini-Zod que valida el JSON de las obras de un museo (assets/artworks.json): esquemas genéricos, s.oneOf con un parámetro const, campos opcionales detectados con un condicional y filtrados con never, Infer<typeof Artwork> con infer, y todos los errores reunidos con su ruta"
example_tags: "typescript|integracion|validacion|esquemas|infer|tipos-condicionales|tipos-mapeados|genericos|fetch|json"
example_stage: intermediate
example_importance: critical
console: true
---

# TypeScript

```typescript
// Usa assets/artworks.json (ábrelo con «Assets»).
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Issue = { path: string; message: string };
type Schema<T> = { parse: (value: unknown, path: string, issues: Issue[]) => T | undefined; optional?: boolean };
type Infer<S> = S extends Schema<infer T> ? T : never; // lección 3

// Las claves cuyo esquema es opcional, filtradas con never (lección 3).
type OptionalKeys<Shape> = { [K in keyof Shape]: Shape[K] extends { optional: true } ? K : never }[keyof Shape];
type Flatten<T> = { [K in keyof T]: T[K] };
type InferObject<Shape> = Flatten<
  { [K in Exclude<keyof Shape, OptionalKeys<Shape>>]: Infer<Shape[K]> } & { [K in OptionalKeys<Shape>]?: Infer<Shape[K]> }
>;

function fail(issues: Issue[], path: string, message: string): undefined {
  issues.push({ path, message });
  return undefined;
}
const s = {
  string: (): Schema<string> => ({
    parse: (v, path, issues) => (typeof v === 'string' && v !== '' ? v : fail(issues, path, v === undefined ? 'falta' : 'debe ser texto')),
  }),
  integer: (min: number, max: number): Schema<number> => ({
    parse: (v, path, issues) =>
      typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : fail(issues, path, `debe ser un entero entre ${min} y ${max}, llegó ${JSON.stringify(v)}`),
  }),
  // <const T>: la lista de valores se infiere como tupla de literales (lección 1).
  oneOf: <const T extends readonly string[]>(values: T): Schema<T[number]> => ({
    parse: (v, path, issues) => (values.find((value) => value === v) ?? fail(issues, path, `debe ser ${values.join(' | ')}, llegó ${JSON.stringify(v)}`)),
  }),
  optional: <T>(schema: Schema<T>): Schema<T> & { optional: true } => ({
    parse: (v, path, issues) => (v === undefined ? undefined : schema.parse(v, path, issues)),
    optional: true,
  }),
  object: <Shape extends Record<string, Schema<unknown>>>(shape: Shape): Schema<InferObject<Shape>> => ({
    parse: (v, path, issues) => {
      if (typeof v !== 'object' || v === null) return fail(issues, path, 'debe ser un objeto');
      const before = issues.length;
      const result: Record<string, unknown> = {};
      for (const [key, schema] of Object.entries(shape)) {
        const parsed = schema.parse(Reflect.get(v, key), `${path}.${key}`, issues);
        if (parsed !== undefined) result[key] = parsed;
      }
      return issues.length === before ? (result as InferObject<Shape>) : undefined; // el bucle no deja seguir el tipo: as
    },
  }),
};

// ── El esquema de una obra, y su tipo sacado del esquema ─────────────────
const Artwork = s.object({
  id: s.string(),
  title: s.string(),
  artist: s.string(),
  year: s.integer(1500, 2026),
  kind: s.oneOf(['painting', 'sculpture', 'photo']),
  room: s.optional(s.integer(1, 40)),
});
// El mismo nombre para el valor y el tipo (como en Zod): viven en espacios distintos.
type Artwork = Infer<typeof Artwork>;
type Checks = [
  Expect<Equal<Artwork, { id: string; title: string; artist: string; year: number; kind: 'painting' | 'sculpture' | 'photo'; room?: number }>>,
];

const response = await fetch('artworks.json');
const data: unknown = await response.json();
const issues: Issue[] = [];
const rawList: unknown = typeof data === 'object' && data !== null ? Reflect.get(data, 'artworks') : undefined;
const list: unknown[] = Array.isArray(rawList) ? rawList : [];
const artworks = list
  .map((item, index) => Artwork.parse(item, `artworks[${index}]`, issues))
  .filter((artwork) => artwork !== undefined); // Artwork[]

for (const issue of issues) console.log(`⚠️ ${issue.path}: ${issue.message}`);
for (const artwork of artworks) {
  console.log(`✅ ${artwork.title} · ${artwork.artist} (${artwork.year}) · ${artwork.kind}${artwork.room ? ` · sala ${artwork.room}` : ''}`);
}
```
