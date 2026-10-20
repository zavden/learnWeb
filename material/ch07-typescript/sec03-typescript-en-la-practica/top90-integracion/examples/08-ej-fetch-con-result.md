---
example_description: "Ejercicio: loadCatalog promete un Result pero se fía de json() con un as y deja escapar los errores de red. Conviértelo en una función que nunca lanza: comprueba response.ok, valida desde unknown y devuelve un fallo tipado (http, invalid o network) para cada caso"
example_tags: "typescript|ejercicio|fetch|result|validacion|unknown|uniones-discriminadas"
exercise: true
exercise_title: "De as a Result"
exercise_instructions: "Al abrirlo, la primera comprobación sale ✓ y las otras cuatro ✗: el catálogo antiguo y el 404 «salen bien» y la petición sin servidor lanza un error || Envuelve el fetch en try/catch: si fetch rechaza, devuelve { ok: false, error: { kind: 'network' } } || Si response.ok es false, devuelve el fallo 'http' con el status || Guarda el JSON como unknown (nada de as) y valídalo: debe ser una lista y cada precio un número; anota cada problema como `[índice].price` y devuelve el fallo 'invalid' con la lista || El objetivo: las cinco comprobaciones ✓, ningún error de tipos y ningún as en loadCatalog"
exercise_hints: "Para leer item.price desde unknown: typeof item === 'object' && item !== null && 'price' in item ? item.price : undefined || Si la validación va en un predicado (data: unknown, problems: string[]) => data is Product[], después del if el JSON ya es un Product[] y no hace falta as || Usa los archivos catalog.json y catalog-v1.json de esta página (ábrelos con «Assets»); catalogo.json no existe a propósito"
exercise_solution_example: 08-ej-fetch-con-result-solucion.md
example_stage: exercise
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { sku: string; name: string; price: number };
type LoadError = { kind: 'http'; status: number } | { kind: 'invalid'; problems: string[] } | { kind: 'network' };
type Result<T> = { ok: true; value: T } | { ok: false; error: LoadError };

// TODO: que nunca lance y que solo devuelva ok: true con datos comprobados.
async function loadCatalog(url: string): Promise<Result<Product[]>> {
  const response = await fetch(url);
  const products = (await response.json()) as Product[]; // 🐛 nadie lo comprueba
  return { ok: true, value: products };
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
async function check(description: string, compute: () => Promise<unknown>, expected: unknown): Promise<void> {
  let actual: unknown;
  try {
    actual = await compute();
  } catch {
    actual = 'lanza un error';
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const kindOf = (result: Result<Product[]>): string => (result.ok ? 'ok' : result.error.kind);

await check('catalog.json → ok con 3 productos', async () => {
  const result = await loadCatalog('catalog.json');
  return result.ok ? result.value.length : kindOf(result);
}, 3);
await check('catalog-v1.json → invalid', async () => kindOf(await loadCatalog('catalog-v1.json')), 'invalid');
await check('…con un problema por precio', async () => {
  const result = await loadCatalog('catalog-v1.json');
  return !result.ok && result.error.kind === 'invalid' ? result.error.problems[0] : kindOf(result);
}, '[0].price');
await check('catalogo.json (no existe) → http 404', async () => {
  const result = await loadCatalog('catalogo.json');
  return !result.ok && result.error.kind === 'http' ? result.error.status : kindOf(result);
}, 404);
await check('sin servidor → network, sin lanzar', async () => kindOf(await loadCatalog('http://localhost:59999/')), 'network');
```
