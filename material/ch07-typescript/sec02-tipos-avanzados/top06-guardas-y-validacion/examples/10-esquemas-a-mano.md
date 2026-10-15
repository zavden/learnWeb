---
example_description: "La idea de Zod y Valibot en unas 40 líneas: un esquema es un valor que valida un unknown en ejecución y, a la vez, describe un tipo; Infer<typeof TrackSchema> saca el tipo del esquema con infer y un tipo mapeado, así que tipo y validación no pueden separarse"
example_tags: "typescript|python|validacion|esquemas|infer|tipos-mapeados|genericos|zod"
example_stage: intermediate
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// Un esquema sabe convertir un unknown en un T (o lanzar un error con la ruta del fallo).
type Schema<T> = { parse: (value: unknown, path: string) => T };
// El tipo que describe un esquema, sacado con infer (lección 3).
type Infer<S> = S extends Schema<infer T> ? T : never;

const s = {
  string: (): Schema<string> => ({
    parse: (value, path) => {
      if (typeof value !== 'string') throw new TypeError(`${path}: se esperaba texto, llegó ${JSON.stringify(value)}`);
      return value;
    },
  }),
  number: (): Schema<number> => ({
    parse: (value, path) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${path}: se esperaba un número, llegó ${JSON.stringify(value)}`);
      return value;
    },
  }),
  array: <T>(item: Schema<T>): Schema<T[]> => ({
    parse: (value, path) => {
      if (!Array.isArray(value)) throw new TypeError(`${path}: se esperaba una lista`);
      return value.map((element: unknown, index) => item.parse(element, `${path}[${index}]`));
    },
  }),
  // Un tipo mapeado (lección 3): cada clave del molde, con el tipo que describe su esquema.
  object: <Shape extends Record<string, Schema<unknown>>>(shape: Shape): Schema<{ [K in keyof Shape]: Infer<Shape[K]> }> => ({
    parse: (value, path) => {
      if (typeof value !== 'object' || value === null) throw new TypeError(`${path}: se esperaba un objeto`);
      const result: Record<string, unknown> = {};
      for (const [key, schema] of Object.entries(shape)) result[key] = schema.parse(Reflect.get(value, key), `${path}.${key}`);
      return result as { [K in keyof Shape]: Infer<Shape[K]> }; // el bucle no deja seguir el tipo: as
    },
  }),
};

// El esquema se escribe UNA vez (existe en ejecución)… y el tipo sale de él.
const TrackSchema = s.object({ title: s.string(), seconds: s.number(), artists: s.array(s.string()) });
type Track = Infer<typeof TrackSchema>;
type Checks = [Expect<Equal<Track, { title: string; seconds: number; artists: string[] }>>];

const bodies = [
  '{"title": "La Llorona", "seconds": 296, "artists": ["Chavela Vargas", "Lila Downs"]}',
  '{"title": "Cielito lindo", "seconds": "182", "artists": []}',
  '{"title": "Sabor a mí", "seconds": 167, "artists": ["Eydie Gormé", null]}',
];
for (const body of bodies) {
  try {
    const track: Track = TrackSchema.parse(JSON.parse(body), 'track');
    console.log(`✅ ${track.title} (${track.seconds} s) · ${track.artists.join(', ')}`);
  } catch (error) {
    console.log('⚠️', error instanceof Error ? error.message : String(error));
  }
}
```
