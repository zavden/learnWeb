---
example_description: "Una caché sin límite es una fuga lenta: el Map de búsquedas guarda cada consulta distinta para siempre y crece con el uso. Una caché LRU (menos usada recientemente) con un tamaño máximo, hecha con el orden de inserción de Map, se queda en 50 entradas y conserva casi todos los aciertos"
example_tags: "javascript|memoria|fugas|cache|lru|map|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Buscar en el catálogo «cuesta» (iría al servidor), así que los resultados se guardan.
let searches = 0;
function searchCatalog(query) {
  searches += 1;
  return Int32Array.from({ length: 20 }, (_, i) => (query.length * 131 + i * 7) % 5000); // 20 ids
}
// La gente busca mucho unas pocas cosas y, de vez en cuando, una referencia que nadie más busca.
const popular = ['café', 'mole', 'pan de muerto', 'tamales', 'cajeta', 'chocolate', 'mezcal', 'salsa macha', 'tortillas', 'chiles secos'];
const queryAt = (i) => (i % 10 < 7 ? popular[(i * 7) % popular.length] : `REF-${(i * 7919) % 100000}`);

// 🐛 Un Map sin límite: cada consulta distinta se queda para siempre.
const unlimited = new Map();
function cachedSearch(query) {
  if (!unlimited.has(query)) unlimited.set(query, searchCatalog(query));
  return unlimited.get(query);
}

// ✅ LRU: un Map recuerda el orden de inserción. Al usar una entrada se mueve al final
//    (la más reciente); al pasar del máximo se borra la primera (la que lleva más sin usarse).
class LruCache {
  #entries = new Map();
  constructor(maxSize) {
    this.maxSize = maxSize;
  }
  get(key) {
    if (!this.#entries.has(key)) return undefined;
    const value = this.#entries.get(key);
    this.#entries.delete(key);
    this.#entries.set(key, value);
    return value;
  }
  set(key, value) {
    this.#entries.delete(key);
    this.#entries.set(key, value);
    if (this.#entries.size > this.maxSize) this.#entries.delete(this.#entries.keys().next().value);
  }
  get size() { return this.#entries.size; }
}
let recent = new LruCache(50);
function lruSearch(query) {
  let ids = recent.get(query);
  if (ids === undefined) {
    ids = searchCatalog(query);
    recent.set(query, ids);
  }
  return ids;
}

function simulate(total, search) {
  searches = 0;
  for (let i = 0; i < total; i++) search(queryAt(i));
  return Math.round((1 - searches / total) * 100); // % de aciertos de caché
}
for (const total of [3000, 30000]) {
  unlimited.clear();
  recent = new LruCache(50);
  const unlimitedHits = simulate(total, cachedSearch);
  const lruHits = simulate(total, lruSearch);
  console.log(`${total} búsquedas → 🐛 entradas: ${unlimited.size} (aciertos ${unlimitedHits} %) · ✅ LRU: ${recent.size} entradas (aciertos ${lruHits} %)`);
}
// Mismos aciertos con 50 entradas que con 9007: las populares están siempre entre las 50 más
// recientes, y las 9000 referencias que acumula el Map 🐛 no se vuelven a pedir nunca.
// Con una caché sin límite, la memoria de la pestaña crece mientras alguien la use.
```
