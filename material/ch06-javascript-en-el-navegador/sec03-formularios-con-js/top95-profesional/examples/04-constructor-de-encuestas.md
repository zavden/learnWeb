---
example_description: "Un constructor de encuestas: un formulario crea preguntas (texto, una opción, varias o escala), las opciones se trocean con una regex y un fieldset disabled apaga las que no aplican; la encuesta se genera con el DOM y sus respuestas se serializan a JSON con su tipo (getAll para las múltiples, valueAsNumber para la escala)"
example_tags: "javascript|formularios|profesional|encuesta|formdata|getall|valueasnumber|json|dom"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Encuesta del taller de barro negro</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <details>
    <summary>Añadir una pregunta</summary>
    <form id="builder" action="/encuestas/preguntas" method="post">
      <label for="q-title">Pregunta</label>
      <input id="q-title" name="title" required maxlength="80">
      <label for="q-type">Tipo</label>
      <select id="q-type" name="type">
        <option value="single">Una opción</option>
        <option value="multiple">Varias opciones</option>
        <option value="scale">Escala del 1 al 5</option>
        <option value="text">Texto libre</option>
      </select>
      <fieldset id="q-options-group">
        <legend>Opciones</legend>
        <label for="q-options">Una por línea o separadas por comas (mínimo 2)</label>
        <textarea id="q-options" name="options" rows="3" required></textarea>
      </fieldset>
      <button type="submit">Añadir pregunta</button>
    </form>
  </details>
  <form id="survey" action="/encuestas/respuestas" method="post"></form>
  <h2>Respuestas en JSON</h2>
  <pre id="json" class="json" tabindex="0" aria-label="Respuestas en JSON">—</pre>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --field: #7b8794;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
main {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
}
h2 {
  font-size: 1rem;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--accent);
  background: var(--surface);
}
details {
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px dashed var(--field);
  border-radius: 0.5rem;
}
summary {
  font-weight: 600;
  cursor: pointer;
}
form {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--surface);
}
#survey {
  border: 1px solid var(--line);
}
fieldset {
  display: grid;
  gap: 0.3rem;
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}
fieldset:disabled {
  color: var(--muted);
}
legend {
  font-weight: 600;
}
label.choice {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
input,
select,
textarea,
button {
  font: inherit;
  color: var(--ink);
}
input:not([type="radio"], [type="checkbox"], [type="range"]),
select,
textarea {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
button {
  justify-self: start;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.json {
  margin: 0;
  padding: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-size: 0.8rem;
  white-space: pre-wrap;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Constructor de encuestas.
//
// Decisiones de diseño:
// - Las preguntas son datos (questions); la encuesta se genera con el DOM y el texto
//   que escribe quien la crea entra siempre con textContent.
// - En el constructor, las opciones solo aplican a «una» o «varias»: su <fieldset> se
//   desactiva con los otros tipos, y un control desactivado ni se valida ni se envía.
// - Las opciones se trocean con split(/\s*[\n,]\s*/); «al menos 2 distintas» es una
//   regla propia (setCustomValidity).
// - El JSON de respuestas respeta el tipo de cada pregunta: getAll para las
//   múltiples (siempre un array), valueAsNumber para la escala, null si no hay.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const builder = document.querySelector('#builder');
const survey = document.querySelector('#survey');
const logList = document.querySelector('#log');
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

const INITIAL = [
  { title: '¿Cómo conociste el taller?', type: 'single', options: ['Redes sociales', 'Una amiga o un amigo', 'El mercado de los sábados'] },
  { title: '¿Qué te gustaría aprender después?', type: 'multiple', options: ['Bruñido', 'Alebrijes', 'Textiles'] },
  { title: '¿Qué tan probable es que vuelvas?', type: 'scale' },
  { title: 'Comentarios', type: 'text' },
];
const questions = [];

const parseOptions = (text) => [...new Set(text.split(/\s*[\n,]\s*/).filter((option) => option !== ''))];
function element(tag, properties = {}, children = []) {
  const node = Object.assign(document.createElement(tag), properties);
  node.append(...children);
  return node;
}
function renderQuestion(question) {
  const { id, title, type } = question;
  if (type === 'single' || type === 'multiple') {
    const inputType = type === 'single' ? 'radio' : 'checkbox';
    const choices = question.options.map((option) => element('label', { className: 'choice' }, [
      element('input', { type: inputType, name: id, value: option }), option,
    ]));
    return element('fieldset', {}, [element('legend', { textContent: title }), ...choices]);
  }
  if (type === 'scale') {
    const range = element('input', { type: 'range', id, name: id, min: 1, max: 5, value: 3 });
    const value = element('output', { htmlFor: id, value: '3' });
    range.addEventListener('input', () => { value.value = range.value; });
    return element('fieldset', {}, [element('legend', { textContent: `${title} (1 = nada, 5 = mucho)` }),
      element('label', { htmlFor: id, textContent: 'Tu respuesta' }), range, value]);
  }
  return element('fieldset', {}, [element('legend', { textContent: title }),
    element('label', { htmlFor: id, textContent: 'Escribe aquí (opcional)' }), element('textarea', { id, name: id, rows: 2 })]);
}
const sendButton = element('button', { type: 'submit', textContent: 'Enviar respuestas' });
survey.append(sendButton);
// Cada pregunta nueva se inserta antes del botón: las respuestas ya dadas no se pierden.
function addQuestion(data) {
  const question = { id: `q${questions.length + 1}`, ...data };
  questions.push(question);
  sendButton.before(renderQuestion(question));
}

function collectAnswers() {
  const formData = new FormData(survey);
  return questions.map(({ id, title, type }) => {
    let answer = formData.get(id); // un string o null
    if (type === 'multiple') answer = formData.getAll(id);
    if (type === 'scale') answer = survey.elements[id].valueAsNumber;
    if (type === 'text') answer = answer.trim() || null;
    return { id, question: title, answer };
  });
}

// El constructor: el tipo decide si las opciones cuentan.
const optionsGroup = document.querySelector('#q-options-group');
const optionsField = builder.elements.options;
const updateOptionsState = () => {
  optionsGroup.disabled = !['single', 'multiple'].includes(builder.elements.type.value);
};
const checkOptions = () => {
  const count = parseOptions(optionsField.value).length;
  optionsField.setCustomValidity(optionsField.value !== '' && count < 2 ? 'Escribe al menos 2 opciones distintas.' : '');
};
builder.elements.type.addEventListener('change', updateOptionsState);
optionsField.addEventListener('input', checkOptions);
builder.addEventListener('submit', (event) => {
  event.preventDefault(); // la validación nativa ya pasó
  const { title, type } = builder.elements;
  addQuestion({ title: title.value.trim(), type: type.value, ...(optionsGroup.disabled ? {} : { options: parseOptions(optionsField.value) }) });
  logLine(`➕ pregunta ${questions.length}: «${title.value.trim()}» (${type.selectedOptions[0].text})`);
  builder.reset();
  updateOptionsState();
});
survey.addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = collectAnswers();
  document.querySelector('#json').textContent = JSON.stringify(answers, null, 2);
  logLine(`📨 ${answers.length} respuestas → ${JSON.stringify(answers.map((item) => item.answer))}`);
});

// ── Autocomprobación (simulada; deja las 4 preguntas iniciales sin responder).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  INITIAL.forEach(addQuestion);
  expect('4 preguntas generadas, cada una en su fieldset', survey.querySelectorAll('fieldset').length === 4);
  expect('«Sí, No» y «Tal vez» en otra línea dan 3 opciones', JSON.stringify(parseOptions('Sí, No\nTal vez')) === '["Sí","No","Tal vez"]');
  optionsField.value = 'Solo una';
  checkOptions();
  expect('una sola opción es un error propio', optionsField.validity.customError);
  builder.elements.type.value = 'scale';
  updateOptionsState();
  expect('con «Escala», las opciones no se validan ni se envían (fieldset disabled)', !optionsField.willValidate && !new FormData(builder).has('options'));
  survey.querySelector('[name="q1"][value="Una amiga o un amigo"]').checked = true;
  for (const box of survey.querySelectorAll('[name="q2"]')) box.checked = box.value !== 'Alebrijes';
  survey.elements.q3.value = '4';
  const answers = collectAnswers();
  expect('respuestas con su tipo: string, array, número y null', JSON.stringify(answers.map((item) => item.answer))
    === '["Una amiga o un amigo",["Bruñido","Textiles"],4,null]');
  builder.reset();
  checkOptions();
  updateOptionsState();
  survey.reset();
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: responde la encuesta y pulsa «Enviar respuestas»; abre «Añadir una pregunta», crea una de varias opciones y vuelve a enviar');
```
