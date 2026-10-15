---
example_description: "En vez de lanzar, requestJson devuelve un Result<T, FetchError>: una unión discriminada con un caso por cada fallo esperado (http con su status, network, timeout, invalid con sus problemas). El switch exhaustivo con never obliga a tratar todos, y el tipo de la función dice qué puede salir mal"
example_tags: "typescript|fetch|result|uniones-discriminadas|never|exhaustividad|abortsignal|api|dom"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Catálogo de la tienda</h1>
  <div class="actions" role="group" aria-label="Probar respuestas">
    <button type="button" data-url="catalog.json">Catálogo</button>
    <button type="button" data-url="/api/demo/echo?status=404">Error 404</button>
    <button type="button" data-url="/api/demo/echo?status=500">Error 500</button>
    <button type="button" data-url="/api/demo/echo?delay=3000">Respuesta lenta (3 s)</button>
    <button type="button" data-url="catalog-v1.json">Formato antiguo</button>
    <button type="button" data-url="http://localhost:59999/">Sin servidor</button>
  </div>
  <p id="result" class="result" role="status"></p>
  <ol class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
button { font: inherit; color: inherit; padding: 0.3rem 0.7rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
button[aria-busy="true"] { cursor: progress; opacity: 0.7; }
.result { min-height: 1.45em; font-weight: 600; }
.result.ok { color: #166534; }
.result.error { color: #b91c1c; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.5rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
type Product = { sku: string; name: string; price: number };

// ── Los fallos esperados, como datos: uno por caso, con lo que hace falta para tratarlo ──
type FetchError =
  | { kind: 'http'; status: number }
  | { kind: 'network' }
  | { kind: 'timeout'; ms: number }
  | { kind: 'invalid'; problems: string[] };
type Result<T, E = FetchError> = { ok: true; value: T } | { ok: false; error: E };
type Validator<T> = (data: unknown, problems: string[]) => data is T;

// El tipo de retorno lo dice todo: esta función NO lanza por estos motivos.
async function requestJson<T>(url: string, validate: Validator<T>, timeoutMs = 1000): Promise<Result<T>> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return { ok: false, error: { kind: 'http', status: response.status } };
    const data: unknown = await response.json();
    const problems: string[] = [];
    if (!validate(data, problems)) return { ok: false, error: { kind: 'invalid', problems } };
    return { ok: true, value: data };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') return { ok: false, error: { kind: 'timeout', ms: timeoutMs } };
    if (error instanceof TypeError) return { ok: false, error: { kind: 'network' } }; // así rechaza fetch sin red
    throw error; // lo inesperado no se disfraza de resultado
  }
}

const isProductList: Validator<Product[]> = (data, problems): data is Product[] => {
  if (!Array.isArray(data)) problems.push('se esperaba una lista');
  else data.forEach((item: unknown, index) => {
    const price: unknown = typeof item === 'object' && item !== null && 'price' in item ? item.price : undefined;
    if (typeof price !== 'number') problems.push(`[${index}].price debe ser un número, llegó ${JSON.stringify(price)}`);
  });
  return problems.length === 0;
};

// Un switch exhaustivo: si mañana FetchError gana un caso, `unhandled` sale en rojo.
function explain(error: FetchError): string {
  switch (error.kind) {
    case 'http': return error.status >= 500 ? `el servidor falló (${error.status}): reinténtalo en un momento` : `no existe (${error.status})`;
    case 'network': return 'no hay conexión con el servidor';
    case 'timeout': return `sin respuesta en ${error.ms / 1000} s: la petición se canceló`;
    case 'invalid': return `datos inesperados: ${error.problems[0]} (y ${error.problems.length - 1} más)`;
    default: {
      const unhandled: never = error;
      return unhandled;
    }
  }
}

// ── La página ──────────────────────────────────────────────────────────────
const resultText = document.getElementById('result');
const logList = document.querySelector('ol');
function report(text: string, kind: 'ok' | 'error'): void {
  console.log(text);
  if (resultText) {
    resultText.textContent = text;
    resultText.className = `result ${kind}`;
  }
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
}

document.querySelector('.actions')?.addEventListener('click', async (event) => {
  if (!(event.target instanceof HTMLButtonElement) || event.target.getAttribute('aria-busy') === 'true') return;
  const button = event.target;
  const url = button.dataset.url ?? '';
  button.setAttribute('aria-busy', 'true');
  const result = await requestJson(url, isProductList); // Result<Product[], FetchError>: nunca rechaza por un fallo esperado
  button.removeAttribute('aria-busy');
  if (result.ok) report(`✅ ${url} → ${result.value.length} productos: ${result.value.map((product) => product.name).join(', ')}`, 'ok');
  else report(`⚠️ ${url} → ${explain(result.error)}`, 'error');
});
const ready = 'Listo: pulsa cada botón para ver un resultado distinto';
console.log(ready);
if (resultText) resultText.textContent = ready;
```
