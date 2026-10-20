---
example_description: "Un getJson<T>(url, validate) que no miente: comprueba response.ok (HttpError con su status), guarda el JSON como unknown y solo devuelve T si el validador lo confirma (ValidationError con la lista de problemas). T se deduce del predicado, y quien llama distingue los fallos con instanceof"
example_tags: "typescript|fetch|json|unknown|validacion|predicados-de-tipo|genericos|errores-propios|instanceof"
example_stage: intermediate
example_importance: critical
console: true
---

# TypeScript

```typescript
// Usa assets/catalog.json (bien) y assets/catalog-v1.json (precios en texto).
type Product = { sku: string; name: string; price: number };

// ── Errores propios, con los datos que necesita quien los trate ────────────
class HttpError extends Error {
  override name = 'HttpError';
  constructor(readonly status: number, readonly url: string) {
    super(`HTTP ${status} al pedir ${url}`);
  }
}
class ValidationError extends Error {
  override name = 'ValidationError';
  constructor(readonly url: string, readonly problems: string[]) {
    super(`${url} no tiene la forma esperada (${problems.length} problemas)`);
  }
}

// ── Un validador: un predicado que además apunta qué falla (módulo 2) ──────
type Validator<T> = (data: unknown, problems: string[]) => data is T;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isProductList(data: unknown, problems: string[]): data is Product[] {
  if (!Array.isArray(data)) {
    problems.push('se esperaba una lista');
    return false;
  }
  data.forEach((item: unknown, index) => {
    if (!isRecord(item)) {
      problems.push(`[${index}] no es un objeto`);
      return;
    }
    if (typeof item.sku !== 'string') problems.push(`[${index}].sku debe ser texto`);
    if (typeof item.name !== 'string') problems.push(`[${index}].name debe ser texto`);
    if (typeof item.price !== 'number') problems.push(`[${index}].price debe ser un número, llegó ${JSON.stringify(item.price)}`);
  });
  return problems.length === 0;
}

// ── El ayudante: lo único que puede salir de aquí es un T comprobado o un error ──
async function getJson<T>(url: string, validate: Validator<T>, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new HttpError(response.status, url);
  const data: unknown = await response.json(); // any → unknown: desde aquí, nada sin comprobar
  const problems: string[] = [];
  if (!validate(data, problems)) throw new ValidationError(url, problems);
  return data; // T: lo ha estrechado el predicado
}

// ── Quien llama: T = Product[], deducido del validador ────────────────────
async function showCatalog(url: string): Promise<void> {
  try {
    const products = await getJson(url, isProductList);
    const total = products.reduce((sum, product) => sum + product.price, 0);
    console.log(`✅ ${url} → ${products.length} productos · total $${total}`);
  } catch (error) {
    if (error instanceof HttpError) console.log(`⛔ ${error.name} ${error.status} · ${error.url}`); // status: number
    else if (error instanceof ValidationError) console.log(`⚠️ ${error.message}: ${error.problems.join(' | ')}`); // problems: string[]
    else throw error; // lo inesperado (un fallo de red, un bug) sigue subiendo
  }
}

await showCatalog('catalog.json');
await showCatalog('catalog-v1.json');
await showCatalog('catalogo.json');
```
