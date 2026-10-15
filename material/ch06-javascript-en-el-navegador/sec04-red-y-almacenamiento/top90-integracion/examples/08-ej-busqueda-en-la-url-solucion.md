---
example_description: "Solución: la búsqueda se escribe y se lee con URL y URLSearchParams (set, append, get, getAll, página validada como entero ≥ 1) y se guarda en localStorage como JSON, con valor por defecto si falta o está roto"
example_tags: "javascript|urlsearchparams|url|localstorage|json|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
const BASE = 'https://tienda.example/buscar';
const LAST_KEY = 'lw-red-ultima-busqueda';

// filters = { q: 'café & cacao', roasts: ['oscuro', 'medio'], page: 2 }
function buildSearchUrl(filters) {
  // ✅ 1. searchParams codifica &, espacios, acentos y + por ti.
  const url = new URL(BASE);
  url.searchParams.set('q', filters.q);
  for (const roast of filters.roasts) url.searchParams.append('tueste', roast);
  url.searchParams.set('pagina', String(filters.page));
  return url.href;
}

function readSearch(address) {
  // ✅ 2. Y decodifica con las mismas reglas: los + vuelven a ser espacios.
  const params = new URL(address).searchParams;
  const page = Number(params.get('pagina'));
  return {
    q: params.get('q') ?? '',
    roasts: params.getAll('tueste'),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

function saveLastSearch(filters) {
  localStorage.setItem(LAST_KEY, JSON.stringify(filters)); // ✅ 3. texto JSON
}
function loadLastSearch() {
  // ✅ 4. null (no hay nada) y texto roto acaban en la búsqueda vacía.
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY)) ?? { q: '', roasts: [], page: 1 };
  } catch {
    return { q: '', roasts: [], page: 1 };
  }
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, compute, expected) {
  let actual;
  try {
    actual = JSON.stringify(compute());
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === JSON.stringify(expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}
const sample = { q: 'café & cacao', roasts: ['oscuro', 'medio'], page: 2 };
const empty = { q: '', roasts: [], page: 1 };

check('ida y vuelta por la URL con «&» y dos tuestes', () => readSearch(buildSearchUrl(sample)), sample);
check('los + de una query son espacios', () => readSearch(`${BASE}?q=caf%C3%A9+de+olla`).q, 'café de olla');
check('la página se lee como número', () => readSearch(`${BASE}?pagina=3`).page, 3);
check('una página no válida vale 1', () => readSearch(`${BASE}?pagina=abc`).page, 1);
check('lo guardado vuelve igual', () => {
  saveLastSearch(sample);
  return loadLastSearch();
}, sample);
check('sin nada guardado, o con un texto roto, la búsqueda vacía', () => {
  localStorage.removeItem(LAST_KEY);
  const missing = loadLastSearch();
  localStorage.setItem(LAST_KEY, '{"q": "mo');
  return [missing, loadLastSearch()];
}, [empty, empty]);
localStorage.removeItem(LAST_KEY); // limpieza
```
