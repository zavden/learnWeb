---
example_description: "toJSON decide qué guarda JSON.stringify de un objeto de clase (incluidos sus privados) y un estático fromJSON lo reconstruye con su prototipo; ida y vuelta completa"
example_tags: "javascript|python|protocolos|tojson|json|static|serializacion"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
class Task {
  #doneAt = null; // privado: JSON.stringify no lo vería por su cuenta

  constructor(title, { doneAt = null } = {}) {
    this.title = title;
    this.#doneAt = doneAt;
  }

  complete(isoInstant) {
    this.#doneAt = isoInstant;
    return this;
  }

  get done() {
    return this.#doneAt !== null;
  }

  // JSON.stringify llama a toJSON si existe y serializa lo que devuelve.
  toJSON() {
    return { type: 'Task', title: this.title, doneAt: this.#doneAt };
  }

  // El camino de vuelta: un estático que crea una instancia de verdad.
  // Usa Task (no this), así que se puede pasar suelto a map sin perder nada.
  static fromJSON(data) {
    if (data?.type !== 'Task') throw new TypeError('No es una tarea');
    return new Task(data.title, { doneAt: data.doneAt });
  }
}

const tasks = [
  new Task('Pagar el predial').complete('2026-10-02T16:30:00Z'),
  new Task('Renovar el pasaporte'),
];

const json = JSON.stringify(tasks);
console.log('JSON →', json);

// JSON.parse devuelve objetos literales: sin prototipo de Task ni métodos.
const plain = JSON.parse(json);
console.log('🐛 sin reconstruir →', plain[0].done, '| instanceof →', plain[0] instanceof Task);

// ✅ fromJSON los convierte en instancias (también se puede usar en un reviver).
const restored = plain.map(Task.fromJSON);
console.log('✅ reconstruidas →', restored.map((task) => `${task.title}: ${task.done ? 'hecha' : 'pendiente'}`));
console.log('✅ instanceof →', restored[0] instanceof Task, '| ida y vuelta igual →', JSON.stringify(restored) === json);

// > Desde Python: json.dumps(tasks, default=lambda t: t.to_dict()) y un
//   Task.from_dict(data) como @classmethod. Aquí, toJSON hace el papel del
//   default y fromJSON el del classmethod.
```
