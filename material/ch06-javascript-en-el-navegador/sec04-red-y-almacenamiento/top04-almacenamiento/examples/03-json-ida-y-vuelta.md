---
example_description: "Dos funciones para guardar estructuras en localStorage: saveJSON y loadJSON con valor por defecto, que sobreviven a una clave inexistente y a datos corruptos (try/catch); las fechas vuelven como texto y un reviver las recupera"
example_tags: "javascript|localstorage|json|reviver|fechas|errores"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const DRAFT_KEY = 'lw-almacen-borrador-pedido';

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Lo guardado puede faltar, o estar roto (otra versión de la app, un usuario
// que lo editó en DevTools): nunca dejes que eso tumbe la página.
function loadJSON(key, fallback, reviver) {
  const text = localStorage.getItem(key);
  if (text === null) return fallback;
  try {
    return JSON.parse(text, reviver);
  } catch (error) {
    console.warn(`«${key}» no es JSON válido (${error.name}); uso el valor por defecto`);
    return fallback;
  }
}

const emptyDraft = { items: [], notes: '' };
console.log('sin nada guardado →', loadJSON(DRAFT_KEY, emptyDraft));

saveJSON(DRAFT_KEY, {
  items: [{ sku: 'CAF-500', quantity: 2 }],
  notes: 'Molido para prensa francesa',
  savedAt: new Date('2026-10-14T18:30:00Z'),
});
console.log('texto guardado →', localStorage.getItem(DRAFT_KEY));

// JSON no tiene fechas: vuelven como texto (lección «JSON y copias»)…
const plain = loadJSON(DRAFT_KEY, emptyDraft);
console.log('savedAt sin reviver →', typeof plain.savedAt);

// …y un reviver las recupera al analizar.
const withDates = (key, value) => (key === 'savedAt' ? new Date(value) : value);
const draft = loadJSON(DRAFT_KEY, emptyDraft, withDates);
console.log('savedAt con reviver → Date:', draft.savedAt instanceof Date, '|', draft.savedAt.toISOString());
console.log('productos →', draft.items.length, '| notas →', draft.notes);

// Datos corruptos: la página sigue funcionando.
localStorage.setItem(DRAFT_KEY, '{"items": [');
console.log('corrupto →', loadJSON(DRAFT_KEY, emptyDraft));

localStorage.removeItem(DRAFT_KEY); // limpieza
```
