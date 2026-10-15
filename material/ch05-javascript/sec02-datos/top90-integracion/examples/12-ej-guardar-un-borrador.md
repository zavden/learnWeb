---
example_description: "Ejercicio: guardar un borrador con Date, Set y Map como JSON sin perder datos, restaurarlo con try/catch y duplicarlo con una copia profunda"
example_tags: "javascript|ejercicio|json|copias|map|set"
exercise: true
exercise_title: "Guarda y restaura un borrador"
exercise_instructions: "Ejecuta el ejemplo: la versión inicial pierde las respuestas (un Map) y las etiquetas (un Set) al guardar || serializeDraft(draft): devuelve el JSON del borrador con tags como array y answers como array de pares [clave, valor] || restoreDraft(text): devuelve null si el texto no es JSON válido; si lo es, reconstruye updatedAt (Date), tags (Set) y answers (Map) || duplicateDraft(draft): devuelve una copia PROFUNDA con id terminado en '-copia' y título terminado en ' (copia)', sin tocar el original || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "JSON.stringify convierte un Map y un Set en {} sin avisar: pasa antes [...draft.tags] y [...draft.answers] || Con spread ({ ...draft, tags: … }) creas un objeto nuevo sin modificar el borrador || La Date no necesita nada al guardar (toJSON la escribe como string ISO), pero vuelve como string: new Date(texto) || new Map(pares) y new Set(array) reconstruyen las colecciones || { ...draft } copia solo el primer nivel: el Map de la copia sería el mismo objeto. structuredClone copia todos los niveles y conserva Date, Map y Set"
exercise_solution_example: 12-ej-guardar-un-borrador-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa las tres funciones para que todas las comprobaciones salgan ✓.
// Un formulario de encuestas guarda el borrador en el navegador como texto JSON.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const draft = {
  id: 'encuesta-otono',
  title: 'Encuesta de satisfacción',
  updatedAt: new Date('2026-10-12T16:45:00Z'),
  tags: new Set(['clientes', 'otoño']),
  answers: new Map([['q1', 'Muy satisfecho'], ['q2', 'El envío tardó 2 días'], ['q3', '']]),
};

function serializeDraft(value) {
  // TODO 1: JSON.stringify pierde el Set y el Map: conviértelos antes en arrays
  return JSON.stringify(value);
}

function restoreDraft(text) {
  // TODO 2: si JSON.parse lanza un SyntaxError → devuelve null
  // TODO 3: reconstruye updatedAt (Date), tags (Set) y answers (Map)
  return JSON.parse(text);
}

function duplicateDraft(value) {
  // TODO 4: ¿basta con esta copia? Cambia también id y title
  const copy = { ...value };
  return copy;
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Llama a restoreDraft(text) y, si lanza un error, devuelve su nombre como texto.
function restoreResultOf(text) {
  try {
    return restoreDraft(text);
  } catch (error) {
    return `lanzó ${error.name}`;
  }
}

const saved = serializeDraft(draft);
console.log('guardado →', saved);
const plain = JSON.parse(saved);
check('el JSON trae las etiquetas', JSON.stringify(plain.tags), '["clientes","otoño"]');
check('el JSON trae las 3 respuestas', Array.isArray(plain.answers) && plain.answers.length, 3);
check('la fecha se guarda como ISO', plain.updatedAt, '2026-10-12T16:45:00.000Z');

const restored = restoreResultOf(saved);
check('updatedAt vuelve a ser Date', restored.updatedAt instanceof Date, true);
check('es el mismo instante', restored.updatedAt instanceof Date && restored.updatedAt.getTime(), draft.updatedAt.getTime());
check('tags vuelve a ser un Set con «otoño»', restored.tags instanceof Set && restored.tags.has('otoño'), true);
check('answers vuelve a ser un Map', restored.answers instanceof Map && restored.answers.get('q2'), 'El envío tardó 2 días');
check('la respuesta vacía se conserva', restored.answers instanceof Map && restored.answers.get('q3'), '');
check('un JSON roto devuelve null', restoreResultOf('{"title": "roto",}'), null);

const copy = duplicateDraft(draft);
copy.answers.set('q1', 'Insatisfecho');
copy.tags.add('duplicado');
check('la copia no cambia las respuestas del original', draft.answers.get('q1'), 'Muy satisfecho');
check('la copia no cambia las etiquetas del original', draft.tags.has('duplicado'), false);
check('título de la copia', copy.title, 'Encuesta de satisfacción (copia)');
check('id de la copia', copy.id, 'encuesta-otono-copia');
check('el original conserva su título', draft.title, 'Encuesta de satisfacción');
```
