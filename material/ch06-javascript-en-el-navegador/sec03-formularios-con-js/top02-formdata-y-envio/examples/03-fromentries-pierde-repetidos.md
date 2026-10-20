---
example_description: "Object.fromEntries(formData) guarda solo el ÚLTIMO valor de cada nombre repetido: de dos casillas marcadas queda una. getAll da todos; para un objeto fiable, pide con getAll los campos que pueden repetirse"
example_tags: "javascript|formularios|formdata|fromentries|getall|checkbox|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Inscripción al taller de cerámica</h1>
  <form id="workshop" action="/talleres/inscripcion" method="post">
    <p><label>Nombre <input name="student" value="Bruno Díaz"></label></p>
    <fieldset>
      <legend>Días que puedes venir</legend>
      <label><input type="checkbox" name="days" value="fri"> Viernes</label>
      <label><input type="checkbox" name="days" value="sat" checked> Sábado</label>
      <label><input type="checkbox" name="days" value="sun" checked> Domingo</label>
    </fieldset>
  </form>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
form {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
input:not([type="checkbox"]) {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
const form = document.querySelector('#workshop');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function report() {
  const formData = new FormData(form);
  logLine(`entradas → ${JSON.stringify([...formData])}`);
  // 🐛 Un objeto no puede tener dos claves 'days': cada par pisa al anterior.
  logLine(`🐛 Object.fromEntries → ${JSON.stringify(Object.fromEntries(formData))}`);
  // ✅ Los campos que pueden repetirse, con getAll: SIEMPRE un array (vacío si no hay).
  const data = {
    student: formData.get('student'),
    days: formData.getAll('days'),
  };
  logLine(`✅ con getAll → ${JSON.stringify(data)}`);
}

report();
form.addEventListener('change', report);
logLine('Listo: marca el viernes; luego desmarca los tres días');

// No conviertas «el que se repite» en array automáticamente: con un día marcado
// tendrías un string y con dos, un array. Decide tú qué campos son listas.
```
