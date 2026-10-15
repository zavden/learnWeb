---
example_description: "Ejercicio: parseProduct convierte un unknown en Product con un as que no comprueba nada. Escríbelo de verdad: un predicado isRecord, cada campo comprobado y cada problema anotado con su ruta (items[2].price, items[3].tags[1]), sin as y sin any"
example_tags: "typescript|ejercicio|validacion|unknown|predicados-de-tipo|json"
exercise: true
exercise_title: "Valida el catálogo"
exercise_instructions: "Al abrirlo, cuatro de las seis comprobaciones salen ✗: parseProduct devuelve cualquier cosa disfrazada de Product (value as Product) || Escribe el predicado isRecord(value: unknown): value is Record<string, unknown> (un objeto que no sea null ni un array) || Reescribe parseProduct sin as: si value no es un registro, anota { path, message: 'debe ser un objeto' } y devuelve undefined || Comprueba sku y name (texto no vacío), price (número finito ≥ 0) y tags (lista de textos); cada fallo se anota con su ruta: `${path}.price`, `${path}.tags[1]`, y si falta la propiedad el mensaje es 'falta' || Devuelve el Product solo si no hubo ningún problema || El objetivo: las seis comprobaciones ✓, ningún error de tipos y ningún as en parseProduct"
exercise_hints: "Saca cada campo a una const (const { sku, name, price, tags } = value): son unknown y se comprueban con typeof || Un if que solo anota un problema no estrecha las líneas siguientes: en la condición del return final, repite los typeof (TypeScript estrecha dentro de esa misma condición) || Array.isArray estrecha a any[]: recorre la lista con (tag: unknown, index) para seguir obligado a comprobar cada elemento || Para saber si hubo problemas, guarda issues.length al empezar y compáralo al final"
exercise_solution_example: 08-ej-valida-el-catalogo-solucion.md
example_stage: exercise
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { sku: string; name: string; price: number; tags: string[] };
type Issue = { path: string; message: string };

// TODO 1: escribe isRecord(value: unknown): value is Record<string, unknown>.

// TODO 2: reescribe parseProduct sin as: comprueba cada campo y anota los problemas con su ruta.
function parseProduct(value: unknown, path: string, issues: Issue[]): Product | undefined {
  return value as Product; // 🐛 una promesa que nadie comprueba
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
