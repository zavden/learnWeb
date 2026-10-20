---
example_description: "Ejercicio: una búsqueda que se guarda en la URL y la última en localStorage, escrita pegando textos: un & en la búsqueda la corta, los + no vuelven a ser espacios, la página llega como texto, los tuestes repetidos se pierden y localStorage guarda «[object Object]». Reescríbela con URL, URLSearchParams y JSON"
example_tags: "javascript|urlsearchparams|url|localstorage|json|ejercicio"
exercise: true
exercise_title: "La búsqueda en la URL, sin pegar textos"
exercise_instructions: "buildSearchUrl, readSearch, saveLastSearch y loadLastSearch funcionan con búsquedas sencillas, pero fallan con «café & cacao», con varios tuestes, con números y con lo guardado || Reescribe buildSearchUrl con new URL(BASE) y url.searchParams: set para q y pagina, append para cada tueste || Reescribe readSearch con new URL(address).searchParams: get('q') ?? '', getAll('tueste') y la página como número entero ≥ 1 (1 si falta o no es válida) || saveLastSearch debe guardar JSON y loadLastSearch analizarlo, devolviendo { q: '', roasts: [], page: 1 } si no hay nada o el texto está roto || Ejecuta hasta que las seis comprobaciones salgan ✓"
exercise_hints: "URLSearchParams codifica y decodifica por ti: no hace falta encodeURIComponent ni decodeURIComponent || Number('abc') es NaN y Number('') es 0: Number.isInteger(page) && page >= 1 cubre los dos || JSON.parse(null) devuelve null, y JSON.parse de un texto roto lanza: un try/catch y ?? resuelven los dos casos"
exercise_solution_example: 08-ej-busqueda-en-la-url-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
const BASE = 'https://tienda.example/buscar';
const LAST_KEY = 'lw-red-ultima-busqueda';

// filters = { q: 'café & cacao', roasts: ['oscuro', 'medio'], page: 2 }
function buildSearchUrl(filters) {
  // TODO 1: new URL(BASE) + url.searchParams (set y append) en vez de pegar textos
  let address = `${BASE}?q=${filters.q}`;
  for (const roast of filters.roasts) address += `&tueste=${roast}`;
  return `${address}&pagina=${filters.page}`;
}

function readSearch(address) {
  // TODO 2: new URL(address).searchParams: get, getAll y la página como número
  const result = { q: '', roasts: [], page: 1 };
  for (const pair of (address.split('?')[1] ?? '').split('&')) {
    const [key, value] = pair.split('=');
    if (key === 'q') result.q = decodeURIComponent(value);
    if (key === 'tueste') result.roasts = [value];
    if (key === 'pagina') result.page = value;
  }
  return result;
}

function saveLastSearch(filters) {
  localStorage.setItem(LAST_KEY, filters); // TODO 3: guarda JSON
}
function loadLastSearch() {
  return localStorage.getItem(LAST_KEY); // TODO 4: JSON.parse, con valor por defecto si falta o está roto
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
