---
example_description: "Un validador escrito a mano para el catálogo que llega como JSON (assets/catalog.json): parte de unknown, comprueba cada campo con predicados y en vez de parar en el primer fallo reúne todos los errores con su ruta (items[2].price, items[3].tags[1])"
example_tags: "typescript|validacion|unknown|json|fetch|predicados-de-tipo|genericos"
example_stage: intermediate
example_importance: critical
console: true
---

# TypeScript

```typescript
// Usa el archivo assets/catalog.json de esta lección (ábrelo con «Assets»).
type Product = { sku: string; name: string; price: number; stock: number; tags: string[] };
type Issue = { path: string; message: string };
// Una comprobación: un predicado y cómo describir lo que se esperaba.
type Check<T> = { test: (value: unknown) => value is T; expected: string };

const text: Check<string> = { test: (v): v is string => typeof v === 'string' && v.trim() !== '', expected: 'texto' };
const money: Check<number> = { test: (v): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0, expected: 'un número ≥ 0' };
const count: Check<number> = { test: (v): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0, expected: 'un entero ≥ 0' };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Lee un campo; si no encaja, apunta el problema con su ruta y devuelve undefined.
function read<T>(record: Record<string, unknown>, key: string, check: Check<T>, path: string, issues: Issue[]): T | undefined {
  const value = record[key];
  if (check.test(value)) return value;
  issues.push({ path: `${path}.${key}`, message: value === undefined ? 'falta' : `debe ser ${check.expected}, llegó ${JSON.stringify(value)}` });
  return undefined;
}

function readList<T>(record: Record<string, unknown>, key: string, check: Check<T>, path: string, issues: Issue[]): T[] | undefined {
  const value: unknown = record[key];
  if (!Array.isArray(value)) {
    issues.push({ path: `${path}.${key}`, message: value === undefined ? 'falta' : 'debe ser una lista' });
    return undefined;
  }
  const before = issues.length;
  const list: T[] = [];
  value.forEach((item: unknown, index) => {
    if (check.test(item)) list.push(item);
    else issues.push({ path: `${path}.${key}[${index}]`, message: `debe ser ${check.expected}, llegó ${JSON.stringify(item)}` });
  });
  return issues.length === before ? list : undefined;
}

function readProduct(value: unknown, path: string, issues: Issue[]): Product | undefined {
  if (!isRecord(value)) {
    issues.push({ path, message: 'debe ser un objeto' });
    return undefined;
  }
  const sku = read(value, 'sku', text, path, issues);
  const name = read(value, 'name', text, path, issues);
  const price = read(value, 'price', money, path, issues);
  const stock = read(value, 'stock', count, path, issues);
  const tags = readList(value, 'tags', text, path, issues);
  if (sku === undefined || name === undefined || price === undefined || stock === undefined || tags === undefined) return undefined;
  return { sku, name, price, stock, tags }; // aquí, y solo aquí, nace un Product
}

const response = await fetch('catalog.json');
const data: unknown = await response.json(); // json() también devuelve any: lo guardamos como unknown
const issues: Issue[] = [];
const items: unknown[] = isRecord(data) && Array.isArray(data.items) ? data.items : [];
const products = items
  .map((item, index) => readProduct(item, `items[${index}]`, issues))
  .filter((product) => product !== undefined); // Product[] (predicado inferido)

for (const issue of issues) console.log(`⚠️ ${issue.path}: ${issue.message}`);
console.log(`✅ ${products.length} de ${items.length} productos válidos:`, products.map((p) => p.sku).join(', '));
```
