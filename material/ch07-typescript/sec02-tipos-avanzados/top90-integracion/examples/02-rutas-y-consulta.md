---
example_description: "El enrutador de la web de un museo: los patrones viven en un objeto as const satisfies, matchRoute<P> devuelve los parámetros exactos de cada patrón (infer en una plantilla) y la consulta (?q=…&sort=…&page=…) se valida con un predicado y un número de página con marca"
example_tags: "typescript|integracion|template-literal-types|infer|satisfies|predicados-de-tipo|tipos-con-marca|url"
example_stage: intermediate
example_importance: important
console: true
---

# TypeScript

```typescript
// ── Parámetros sacados del patrón (lección 5) ────────────────────────────
type ParamNames<P extends string> =
  P extends `${string}:${infer Name}/${infer Rest}` ? Name | ParamNames<`/${Rest}`>
  : P extends `${string}:${infer Name}` ? Name
  : never;
type Params<P extends string> = { [K in ParamNames<P>]: string };

// Los patrones se escriben una vez: as const conserva los literales y satisfies comprueba (lección 2).
const ROUTES = {
  room: '/museos/:museumId/salas/:roomId',
  artwork: '/obras/:artworkId',
  search: '/buscar',
} as const satisfies Record<string, `/${string}`>;

function matchRoute<P extends string>(pattern: P, path: string): Params<P> | null {
  const names: string[] = [];
  const source = pattern.replace(/:(\w+)/g, (_match, name: string) => {
    names.push(name);
    return '([^/]+)';
  });
  const match = new RegExp(`^${source}$`).exec(path);
  if (match === null) return null;
  const params: Record<string, string> = {};
  names.forEach((name, index) => (params[name] = decodeURIComponent(match[index + 1] ?? '')));
  return params as Params<P>; // el bucle no deja seguir los nombres: as
}

// ── La consulta llega como texto: guardas y una marca (lección 6) ─────────
const SORTS = ['relevance', 'year', 'title'] as const;
type Sort = (typeof SORTS)[number];
type PageNumber = number & { readonly __brand: 'PageNumber' };
type SearchQuery = { q: string; sort: Sort; page: PageNumber };

const isSort = (value: string): value is Sort => (SORTS as readonly string[]).includes(value);
function toPage(text: string): PageNumber | null {
  const page = Number(text);
  return Number.isInteger(page) && page >= 1 && page <= 50 ? (page as PageNumber) : null;
}

function parseSearch(search: URLSearchParams): SearchQuery | string[] {
  const issues: string[] = [];
  const sort = search.get('sort') ?? 'relevance';
  const page = toPage(search.get('page') ?? '1');
  if (!isSort(sort)) issues.push(`sort: «${sort}» no es ${SORTS.join(' | ')}`);
  if (page === null) issues.push(`page: «${search.get('page')}» no es un número de 1 a 50`);
  return isSort(sort) && page !== null ? { q: search.get('q') ?? '', sort, page } : issues;
}

function resolve(address: string): string {
  const url = new URL(address, 'https://museo.example');
  const room = matchRoute(ROUTES.room, url.pathname); // { museumId: string; roomId: string } | null
  if (room) return `🏛️ ${room.museumId}, sala ${room.roomId}`;
  const artwork = matchRoute(ROUTES.artwork, url.pathname); // { artworkId: string } | null
  if (artwork) return `🖼️ obra «${artwork.artworkId}»`;
  if (matchRoute(ROUTES.search, url.pathname)) {
    const query = parseSearch(url.searchParams);
    return Array.isArray(query) ? `⚠️ ${query.join(' · ')}` : `🔎 «${query.q}» por ${query.sort}, página ${query.page}`;
  }
  return `❓ 404 ${url.pathname}`;
}

for (const address of ['/museos/munal/salas/12', '/obras/el-valle-de-mexico', '/buscar?q=velasco&sort=year&page=2', '/buscar?q=herr%C3%A1n', '/buscar?sort=color&page=0', '/tienda']) {
  console.log(`${address} → ${resolve(address)}`);
}
```
