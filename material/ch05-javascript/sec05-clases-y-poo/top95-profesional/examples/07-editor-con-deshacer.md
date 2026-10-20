---
example_description: "Deshacer y rehacer con el patrón comando: comandos que heredan de una base abstracta, un comando compuesto (reemplazar todo), fusión de pulsaciones en palabras y un historial con límite y etiquetas para el menú"
example_tags: "javascript|profesional|clases|patron-comando|herencia|composicion|privados"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// DESHACER Y REHACER EN UN EDITOR DE TEXTO, con el patrón «comando»: cada
// cambio es un objeto que sabe aplicarse (execute) y revertirse (undo).
// - Command es abstracta; InsertText y DeleteRange heredan de ella.
// - MacroCommand es un comando hecho de comandos (composición): ReplaceAll
//   hereda de él y se deshace de una vez.
// - InsertText.mergeWith fusiona las pulsaciones seguidas en una sola palabra,
//   como los editores reales: un «Deshacer» no borra letra a letra.
// - History guarda las pilas en privados, con un límite estático por defecto.

class TextDocument {
  #text = '';
  get text() { return this.#text; }
  #assertRange(from, to) {
    if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 0 && from <= to && to <= this.#text.length)) {
      throw new RangeError(`Rango fuera del texto: ${from}-${to}`);
    }
  }
  insert(at, text) {
    this.#assertRange(at, at);
    this.#text = this.#text.slice(0, at) + text + this.#text.slice(at);
  }
  remove(from, to) {
    this.#assertRange(from, to);
    const removed = this.#text.slice(from, to);
    this.#text = this.#text.slice(0, from) + this.#text.slice(to);
    return removed;
  }
}

class Command {
  constructor() {
    if (new.target === Command) throw new TypeError('Command es abstracta');
  }
  execute() { throw new Error(`${this.constructor.name} debe implementar execute(doc)`); }
  undo() { throw new Error(`${this.constructor.name} debe implementar undo(doc)`); }
  get label() { return this.constructor.name; }
  mergeWith() { return null; } // por defecto, un comando no se fusiona con el siguiente
}

class InsertText extends Command {
  constructor(at, text) {
    super();
    this.at = at;
    this.text = text;
  }
  execute(doc) { doc.insert(this.at, this.text); }
  undo(doc) { doc.remove(this.at, this.at + this.text.length); }
  get label() { return `escribir «${this.text}»`; }
  // Una letra justo detrás de la anterior se une a ella… hasta que llega un espacio.
  mergeWith(next) {
    const continues = next instanceof InsertText && next.at === this.at + this.text.length;
    return continues && !this.text.endsWith(' ') ? new InsertText(this.at, this.text + next.text) : null;
  }
}

class DeleteRange extends Command {
  #removed = '';
  constructor(from, to) {
    super();
    this.from = from;
    this.to = to;
  }
  execute(doc) { this.#removed = doc.remove(this.from, this.to); } // guarda lo borrado para deshacer
  undo(doc) { doc.insert(this.from, this.#removed); }
  get label() { return `borrar «${this.#removed}»`; }
}

class MacroCommand extends Command {
  #commands;
  #label;
  constructor(label, commands) {
    super();
    this.#label = label;
    this.#commands = Object.freeze([...commands]);
  }
  execute(doc) { for (const command of this.#commands) command.execute(doc); }
  undo(doc) { for (const command of [...this.#commands].reverse()) command.undo(doc); } // al revés
  get label() { return this.#label; }
}

class ReplaceAll extends MacroCommand {
  constructor(text, search, replacement) {
    const positions = [];
    for (let at = text.indexOf(search); at !== -1; at = text.indexOf(search, at + search.length)) positions.push(at);
    // De la última a la primera: así los cambios no mueven las posiciones pendientes.
    const steps = positions.reverse().flatMap((at) => [new DeleteRange(at, at + search.length), new InsertText(at, replacement)]);
    super(`reemplazar «${search}» por «${replacement}» (${positions.length})`, steps);
    this.count = positions.length;
  }
}

class History {
  static DEFAULT_LIMIT = 100;
  #doc;
  #undoStack = [];
  #redoStack = [];
  #limit;

  constructor(doc, { limit = History.DEFAULT_LIMIT } = {}) {
    this.#doc = doc;
    this.#limit = limit;
  }
  run(command) {
    command.execute(this.#doc);
    const merged = this.#undoStack.at(-1)?.mergeWith(command);
    if (merged) {
      this.#undoStack[this.#undoStack.length - 1] = merged;
    } else {
      this.#undoStack.push(command);
      if (this.#undoStack.length > this.#limit) this.#undoStack.shift(); // se olvida lo más antiguo
    }
    this.#redoStack = []; // un cambio nuevo invalida lo deshecho
  }
  undo() {
    const command = this.#undoStack.pop();
    if (!command) return false;
    command.undo(this.#doc);
    this.#redoStack.push(command);
    return true;
  }
  redo() {
    const command = this.#redoStack.pop();
    if (!command) return false;
    command.execute(this.#doc);
    this.#undoStack.push(command);
    return true;
  }
  get menu() {
    const undo = this.#undoStack.at(-1);
    const redo = this.#redoStack.at(-1);
    return `[${undo ? `Deshacer ${undo.label}` : 'Nada que deshacer'}] [${redo ? `Rehacer ${redo.label}` : 'Nada que rehacer'}]`;
  }
}

// ── Una sesión de edición ─────────────────────────────────────────────
const doc = new TextDocument();
const history = new History(doc);
const show = (step) => console.log(`${step.padEnd(26)} ${JSON.stringify(doc.text).padEnd(42)} ${history.menu}`);

const typeText = (text) => {
  for (const char of text) history.run(new InsertText(doc.text.length, char)); // una tecla, un comando
};
typeText('Mole de olla y arroz ');
show('escribir (21 teclas)');
typeText('rojo');
show('escribir «rojo»');
history.run(new ReplaceAll(doc.text, 'o', '0'));
show('reemplazar o → 0');
history.undo();
show('deshacer');
history.run(new DeleteRange(5, 13)); // borra «de olla »
show('borrar «de olla »');
history.undo();
history.undo();
show('deshacer ×2');
history.redo();
show('rehacer');
history.run(new InsertText(doc.text.length, '!'));
show('escribir «!»');
console.log('¿se puede rehacer tras un cambio nuevo? →', history.redo());

// Un historial con límite: solo recuerda los 2 últimos comandos.
const note = new TextDocument();
const shortHistory = new History(note, { limit: 2 });
for (const word of ['uno ', 'dos ', 'tres ']) shortHistory.run(new InsertText(note.text.length, word));
let undone = 0;
while (shortHistory.undo()) undone += 1;
console.log(`límite 2 → deshechos ${undone}, queda ${JSON.stringify(note.text)}`);

for (const attempt of [() => new Command(), () => history.run(new DeleteRange(0, 999))]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
console.log('el texto sigue intacto →', JSON.stringify(doc.text));
```
