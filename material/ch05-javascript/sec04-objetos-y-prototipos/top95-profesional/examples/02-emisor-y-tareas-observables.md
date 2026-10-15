---
example_description: "Un tablero kanban con un EventEmitter hecho con prototipos: tareas que heredan del emisor, accesores generados que validan y emiten cambios, actualizaciones agrupadas, eventos reemitidos por el tablero y oyentes aislados"
example_tags: "javascript|profesional|eventos|observador|accesores|herencia"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// TABLERO KANBAN con un emisor de eventos y tareas observables.
//
// Decisiones:
// - EventEmitter es un tipo base (constructora + prototipo). Cada emisor crea SU mapa
//   de oyentes en la constructora, no enumerable: en el prototipo, todos los emisores
//   compartirían el mismo mapa (el bug del array compartido).
// - on() devuelve la función de baja y once() se construye sobre on(). emit() recorre
//   una COPIA de la lista (un oyente puede darse de baja mientras se emite) y aísla los
//   errores: un oyente que falla no impide que se ejecuten los demás.
// - Task hereda de EventEmitter. Sus campos son accesores generados en Task.prototype
//   con defineProperty: validan, ignoran lo que no cambia nada (Object.is) y emiten
//   'change' con el valor anterior y el nuevo.
// - update() valida TODO el parche antes de tocar nada y agrupa los cambios en un solo
//   evento.
// - Board también es un emisor: escucha a sus tareas con flechas (this = el tablero) y
//   reemite sus cambios hacia arriba.
// - Las «vistas» (registro, límite de trabajo en curso, celebración) solo escuchan: el
//   modelo no sabe que existen.
//
// Alcance: módulos 1-4.

// ── Helpers de tipos ────────────────────────────────────────────────────
function extendPrototype(Type, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(Type.prototype, key, { value, writable: true, enumerable: false, configurable: true });
  }
}
function inherit(Child, Parent) {
  Object.setPrototypeOf(Child.prototype, Parent.prototype);
}

// ── EventEmitter ────────────────────────────────────────────────────────
function EventEmitter() {
  Object.defineProperty(this, '_listeners', { value: new Map() });
}
extendPrototype(EventEmitter, {
  on(type, listener) {
    if (typeof listener !== 'function') throw new TypeError(`on('${type}'): el oyente debe ser una función`);
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(listener);
    return () => this.off(type, listener);
  },
  once(type, listener) {
    const off = this.on(type, (payload) => {
      off();
      listener.call(this, payload);
    });
    return off;
  },
  off(type, listener) {
    const list = this._listeners.get(type) ?? [];
    const index = list.indexOf(listener);
    if (index !== -1) list.splice(index, 1);
  },
  emit(type, payload) {
    for (const listener of [...(this._listeners.get(type) ?? [])]) {
      try {
        listener.call(this, payload);
      } catch (error) {
        console.warn(`⚠️ un oyente de «${type}» ha fallado: ${error.message}`);
      }
    }
    return this;
  },
  listenerCount(type) {
    return this._listeners.get(type)?.length ?? 0;
  },
});

// ── Task: un emisor con campos observables ──────────────────────────────
const STATUSES = Object.freeze(['pendiente', 'en curso', 'revisión', 'hecha']);
const TEAM = Object.freeze(['Ana', 'Bruno', 'Carla']);
const FIELD_RULES = Object.freeze({
  title: (value) => (typeof value === 'string' && value.trim().length >= 3) || 'el título necesita 3 caracteres',
  status: (value) => STATUSES.includes(value) || `estado desconocido «${value}»`,
  assignee: (value) => value === null || TEAM.includes(value) || `«${value}» no está en el equipo`,
  points: (value) => [1, 2, 3, 5, 8].includes(value) || `${value} no es un valor de la escala (1, 2, 3, 5, 8)`,
});

let lastId = 0;
function Task(fields) {
  EventEmitter.call(this);
  lastId += 1;
  Object.defineProperties(this, {
    id: { value: `T-${String(lastId).padStart(3, '0')}`, enumerable: true },
    _values: { value: { title: '', status: 'pendiente', assignee: null, points: 1 } },
    _batch: { value: null, writable: true },
  });
  this.update(fields, { silent: true });
}
inherit(Task, EventEmitter);

function checkField(task, field, value) {
  if (!Object.hasOwn(FIELD_RULES, field)) throw new TypeError(`${task.id}: campo desconocido «${field}»`);
  const verdict = FIELD_RULES[field](value);
  if (verdict !== true) throw new RangeError(`${task.id}.${field}: ${verdict}`);
}

for (const field of Object.keys(FIELD_RULES)) {
  Object.defineProperty(Task.prototype, field, {
    get() {
      return this._values[field];
    },
    set(value) {
      checkField(this, field, value);
      const previous = this._values[field];
      if (Object.is(previous, value)) return; // sin cambio, sin evento
      this._values[field] = value;
      const change = { from: previous, to: value };
      if (this._batch) this._batch[field] = change;
      else this.emit('change', { task: this, changes: { [field]: change } });
    },
  });
}
extendPrototype(Task, {
  update(patch, { silent = false } = {}) {
    for (const [field, value] of Object.entries(patch)) checkField(this, field, value); // todo o nada
    this._batch = {};
    try {
      Object.assign(this, patch); // cada asignación pasa por su setter
    } finally {
      const changes = this._batch;
      this._batch = null;
      if (!silent && Object.keys(changes).length > 0) this.emit('change', { task: this, changes });
    }
    return this;
  },
  toJSON() {
    return { id: this.id, ...this._values };
  },
  toString() {
    return `${this.id} ${this.title} [${this.points} pt${this.assignee ? `, ${this.assignee}` : ''}]`;
  },
});

// ── Board: un emisor que reemite lo que pasa en sus tareas ──────────────
function Board(name) {
  EventEmitter.call(this);
  this.name = name;
  Object.defineProperties(this, { tasks: { value: [] }, _unsubscribe: { value: new Map() } });
}
inherit(Board, EventEmitter);
extendPrototype(Board, {
  add(fields) {
    const task = new Task(fields);
    this.tasks.push(task);
    // Flecha: su this es el tablero, no la tarea que emite.
    this._unsubscribe.set(task, task.on('change', (event) => {
      this.emit('task-change', event);
      if (event.changes.status?.to === 'hecha') this.emit('task-done', event);
    }));
    this.emit('task-added', { task });
    return task;
  },
  remove(task) {
    this._unsubscribe.get(task)?.();
    this._unsubscribe.delete(task);
    this.tasks.splice(this.tasks.indexOf(task), 1);
    this.emit('task-removed', { task });
  },
  column(status) {
    return this.tasks.filter((task) => task.status === status);
  },
  print() {
    console.group(`▼ ${this.name}`);
    for (const status of STATUSES) {
      const tasks = this.column(status);
      const points = tasks.reduce((sum, task) => sum + task.points, 0);
      console.log(`${status.toUpperCase().padEnd(10)} (${points} pt) ${tasks.map(String).join(' · ') || '—'}`);
    }
    console.groupEnd();
  },
});

// ── Vistas: solo escuchan ───────────────────────────────────────────────
const board = new Board('Sprint 14 · tienda online');
const describeChanges = (changes) =>
  Object.entries(changes).map(([field, { from, to }]) => `${field}: ${from ?? '—'} → ${to ?? '—'}`).join(', ');

const activity = [];
const stopActivity = board.on('task-change', ({ task, changes }) => {
  activity.push(`${task.id} ${describeChanges(changes)}`);
  console.log(`✎ ${task.id} ${describeChanges(changes)}`);
});
board.on('task-added', ({ task }) => console.log(`＋ ${task}`));
board.on('task-change', function () {
  const inProgress = this.column('en curso').length; // function: this = el tablero que emite
  if (inProgress > 2) console.warn(`⚠️ límite de trabajo en curso: ${inProgress} tareas (máximo 2)`);
});
board.once('task-done', ({ task }) => console.log(`🎉 primera tarea terminada del sprint: ${task.title}`));
board.on('task-change', ({ task }) => {
  // Un oyente con un bug: falla con las tareas sin responsable.
  if (task.assignee.length > 10) console.log('nombre largo');
});

console.group('Planificación');
const checkout = board.add({ title: 'Pago con tarjeta en el checkout', points: 8, assignee: 'Ana' });
const search = board.add({ title: 'Búsqueda sin tildes', points: 5, assignee: 'Bruno' });
const footer = board.add({ title: 'Enlaces legales en el pie', points: 1 });
const invoice = board.add({ title: 'Factura en PDF', points: 3, assignee: 'Carla' });
console.groupEnd();

console.group('Durante el sprint');
checkout.status = 'en curso';
footer.status = 'en curso';                                   // sin responsable: el oyente con el bug falla
search.status = 'en curso';
footer.update({ assignee: 'Carla', status: 'hecha' });        // un solo evento para dos cambios
search.status = 'en curso';                                   // no cambia nada: sin evento
for (const attempt of [() => { invoice.points = 4; }, () => invoice.update({ status: 'revisión', assignee: 'Dani' })]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
console.log(`¿la factura cambió a medias? → ${invoice.status}`); // pendiente: todo o nada
stopActivity(); // el registro deja de escuchar
checkout.update({ status: 'revisión' });
search.update({ status: 'hecha' });                           // once ya no celebra
board.remove(invoice);
invoice.points = 2;                                           // ya no es del tablero: nadie se entera
console.groupEnd();

board.print();
console.log('registro →', activity);
console.log('oyentes de task-change →', board.listenerCount('task-change'), '| de la factura →', invoice.listenerCount('change'));
console.log('JSON →', JSON.stringify(board.tasks));
console.log('checkout →', checkout); // expande: Task.prototype (accesores) → EventEmitter.prototype
```
