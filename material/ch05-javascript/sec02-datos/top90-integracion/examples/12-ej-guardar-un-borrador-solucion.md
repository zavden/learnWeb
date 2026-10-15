---
example_description: "Solución: serializar Map y Set como arrays, restaurar con try/catch reconstruyendo Date, Set y Map, y duplicar con structuredClone"
example_tags: "javascript|solucion|json|copias|map|set"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: guardar y restaurar un borrador.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const draft = {
  id: 'encuesta-otono',
  title: 'Encuesta de satisfacción',
  updatedAt: new Date('2026-10-12T16:45:00Z'),
  tags: new Set(['clientes', 'otoño']),
  answers: new Map([['q1', 'Muy satisfecho'], ['q2', 'El envío tardó 2 días'], ['q3', '']]),
};

function serializeDraft(value) {
  // Un objeto nuevo (spread) con las colecciones convertidas en arrays; el borrador no cambia.
  // updatedAt no necesita nada: Date tiene toJSON y se escribe como string ISO.
  return JSON.stringify({ ...value, tags: [...value.tags], answers: [...value.answers] });
}

function restoreDraft(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    if (error.name === 'SyntaxError') return null; // texto que no es JSON: no hay borrador
    throw error; // cualquier otro error es un fallo del programa: que se vea
  }
  return {
    ...data,
    updatedAt: new Date(data.updatedAt),
    tags: new Set(data.tags),
    answers: new Map(data.answers),
  };
}

function duplicateDraft(value) {
  // structuredClone copia TODOS los niveles y conserva Date, Map y Set.
  // { ...value } compartiría el Map y el Set con el original.
  const copy = structuredClone(value);
  copy.id = `${value.id}-copia`;
  copy.title = `${value.title} (copia)`;
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
