---
example_description: "Solución: isRecord estrecha unknown a Record<string, unknown>; parseProduct guarda cada campo en una const, lo comprueba con typeof, Number.isFinite y Array.isArray, anota cada problema con su ruta y solo construye el Product si no hubo ninguno; seis comprobaciones ✓, sin as"
example_tags: "typescript|ejercicio|solucion|validacion|unknown|predicados-de-tipo|json"
example_stage: final-solution
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { sku: string; name: string; price: number; tags: string[] };
type Issue = { path: string; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseProduct(value: unknown, path: string, issues: Issue[]): Product | undefined {
  if (!isRecord(value)) {
    issues.push({ path, message: 'debe ser un objeto' });
    return undefined;
  }
  const before = issues.length;
  const note = (key: string, message: string): void => {
    issues.push({ path: `${path}.${key}`, message: value[key] === undefined ? 'falta' : message });
  };
  const { sku, name, price, tags } = value; // cada campo, unknown
  if (typeof sku !== 'string' || sku === '') note('sku', 'debe ser texto');
  if (typeof name !== 'string' || name === '') note('name', 'debe ser texto');
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) note('price', 'debe ser un número ≥ 0');
  const validTags: string[] = [];
  if (!Array.isArray(tags)) note('tags', 'debe ser una lista');
  else {
    tags.forEach((tag: unknown, index) => {
      if (typeof tag === 'string') validTags.push(tag);
      else issues.push({ path: `${path}.tags[${index}]`, message: 'debe ser texto' });
    });
  }
  // Las comprobaciones de arriba no estrechan aquí abajo: se repiten en la condición final.
  if (issues.length > before || typeof sku !== 'string' || typeof name !== 'string' || typeof price !== 'number') return undefined;
  return { sku, name, price, tags: validTags };
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
const items: unknown[] = JSON.parse(`[
  { "sku": "MOL-01", "name": "Mole negro", "price": 165, "tags": ["oaxaqueño"] },
  { "sku": "CAF-02", "name": "Café de Chiapas", "price": 210, "tags": [] },
  { "sku": "CHO-03", "name": "Chocolate de metate", "price": "95", "tags": ["artesanal"] },
  { "sku": "TAS-04", "price": 180, "tags": ["ahumado", 7] },
  null
]`);
function run(index: number): { product: Product | undefined; paths: string } {
  const issues: Issue[] = [];
  const product = parseProduct(items[index], `items[${index}]`, issues);
  return { product, paths: issues.map((issue) => `${issue.path}: ${issue.message}`).join(' | ') };
}
function check(description: string, compute: () => unknown, expected: unknown): void {
  let actual: unknown;
  try {
    actual = compute();
  } catch (error) {
    actual = 'lanza un error';
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
check('un producto correcto se acepta', () => run(0).product?.name, 'Mole negro');
check('una lista de etiquetas vacía es válida', () => run(1).product?.tags.length, 0);
check('un precio en texto se rechaza', () => run(2).product, undefined);
check('…y se anota con su ruta', () => run(2).paths, 'items[2].price: debe ser un número ≥ 0');
check('faltas y etiquetas que no son texto', () => run(3).paths, 'items[3].name: falta | items[3].tags[1]: debe ser texto');
check('null no es un producto', () => run(4).paths, 'items[4]: debe ser un objeto');
```
