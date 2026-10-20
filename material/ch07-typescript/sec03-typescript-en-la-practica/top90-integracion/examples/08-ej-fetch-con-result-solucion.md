---
example_description: "Solución: loadCatalog envuelve fetch en try/catch (network), comprueba response.ok (http con su status), guarda el JSON como unknown y lo valida con un predicado que anota [índice].price (invalid); solo devuelve ok: true con un Product[] comprobado. Cinco comprobaciones ✓, sin as"
example_tags: "typescript|ejercicio|solucion|fetch|result|validacion|unknown|predicados-de-tipo"
example_stage: final-solution
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { sku: string; name: string; price: number };
type LoadError = { kind: 'http'; status: number } | { kind: 'invalid'; problems: string[] } | { kind: 'network' };
type Result<T> = { ok: true; value: T } | { ok: false; error: LoadError };

// Un predicado que además apunta qué falla (lección 3).
function isProductList(data: unknown, problems: string[]): data is Product[] {
  if (!Array.isArray(data)) {
    problems.push('se esperaba una lista');
    return false;
  }
  data.forEach((item: unknown, index) => {
    const price = typeof item === 'object' && item !== null && 'price' in item ? item.price : undefined;
    if (typeof price !== 'number') problems.push(`[${index}].price`);
  });
  return problems.length === 0;
}

// Nunca lanza: cada fallo esperado vuelve como dato, con lo necesario para tratarlo.
async function loadCatalog(url: string): Promise<Result<Product[]>> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return { ok: false, error: { kind: 'network' } };
  }
  if (!response.ok) return { ok: false, error: { kind: 'http', status: response.status } };
  const data: unknown = await response.json(); // any → unknown
  const problems: string[] = [];
  if (!isProductList(data, problems)) return { ok: false, error: { kind: 'invalid', problems } };
  return { ok: true, value: data }; // Product[], estrechado por el predicado
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
