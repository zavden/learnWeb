---
example_description: "Una clase ApiClient con parameter properties (la base y el plazo) y un método genérico get<T>(ruta, validador) que devuelve Result<T, ApiError>. Los errores son clases con un campo kind literal: se distinguen con un switch como una unión discriminada y conservan sus datos (status, problemas)"
example_tags: "typescript|integracion|clases|genericos|result|fetch|abortsignal|uniones-discriminadas|validacion"
example_stage: intermediate
example_importance: critical
console: true
---

# TypeScript

```typescript
// Usa assets/catalog.json y assets/catalog-v1.json (precios en texto).
type Product = { sku: string; name: string; price: number };
type Validator<T> = (data: unknown, problems: string[]) => data is T;

// ── Errores: clases (instanceof, name, stack) con un kind literal (switch) ──
class HttpError extends Error {
  readonly kind = 'http';
  override name = 'HttpError';
  constructor(readonly status: number, readonly url: string) {
    super(`HTTP ${status} en ${url}`);
  }
}
class NetworkError extends Error {
  readonly kind = 'network';
  override name = 'NetworkError';
}
class TimeoutError extends Error {
  readonly kind = 'timeout';
  override name = 'TimeoutError';
  constructor(readonly ms: number) {
    super(`sin respuesta en ${ms} ms`);
  }
}
class ValidationError extends Error {
  readonly kind = 'validation';
  override name = 'ValidationError';
  constructor(readonly problems: string[]) {
    super(`${problems.length} problema(s) en la respuesta`);
  }
}
type ApiError = HttpError | NetworkError | TimeoutError | ValidationError;
type Result<T, E = ApiError> = { ok: true; value: T } | { ok: false; error: E };

// ── El cliente ────────────────────────────────────────────────────────────
class ApiClient {
  constructor(private readonly baseUrl: string, private readonly timeoutMs = 1000) {}

  async get<T>(path: string, validate: Validator<T>): Promise<Result<T>> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') return { ok: false, error: new TimeoutError(this.timeoutMs) };
      return { ok: false, error: new NetworkError(`no se pudo conectar con ${url}`, { cause: error }) };
    }
    if (!response.ok) return { ok: false, error: new HttpError(response.status, url) };
    const data: unknown = await response.json();
    const problems: string[] = [];
    return validate(data, problems) ? { ok: true, value: data } : { ok: false, error: new ValidationError(problems) };
  }
}

// ── Un validador (lección 3) ──────────────────────────────────────────────
function isProductList(data: unknown, problems: string[]): data is Product[] {
  if (!Array.isArray(data)) {
    problems.push('se esperaba una lista');
    return false;
  }
  data.forEach((item: unknown, index) => {
    const price = typeof item === 'object' && item !== null && 'price' in item ? item.price : undefined;
    if (typeof price !== 'number') problems.push(`[${index}].price: llegó ${JSON.stringify(price)}`);
  });
  return problems.length === 0;
}

// ── Quien lo usa: un switch exhaustivo sobre kind ─────────────────────────
function explain(error: ApiError): string {
  switch (error.kind) {
    case 'http': return `${error.status >= 500 ? '⏳' : '⛔'} ${error.message}`; // status: number
    case 'network': return `📡 ${error.message}`;
    case 'timeout': return `⏱️ ${error.message}`; // ms: number
    case 'validation': return `⚠️ ${error.message}: ${error.problems.join(' | ')}`;
    default: {
      const unhandled: never = error;
      return unhandled;
    }
  }
}

const shop = new ApiClient(''); // rutas relativas: assets/ y el servidor de prueba
const slowShop = new ApiClient('/api/demo/echo', 300);
const offline = new ApiClient('http://localhost:59999');

const attempts: Array<[string, Promise<Result<Product[]>>]> = [
  ['catálogo', shop.get('catalog.json', isProductList)],
  ['catálogo antiguo', shop.get('catalog-v1.json', isProductList)],
  ['sin archivo', shop.get('catalogo.json', isProductList)],
  ['lento', slowShop.get('?delay=1000', isProductList)],
  ['sin servidor', offline.get('/catalog', isProductList)],
];
for (const [label, pending] of attempts) {
  const result = await pending; // las cinco peticiones ya salieron a la vez
  console.log(`${label} → ${result.ok ? `✅ ${result.value.map((product) => product.name).join(', ')}` : explain(result.error)}`);
}
```
