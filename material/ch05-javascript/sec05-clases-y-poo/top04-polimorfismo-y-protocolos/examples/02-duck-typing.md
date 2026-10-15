---
example_description: "Duck typing: una función acepta cualquier objeto con los métodos que usa, sea de la clase que sea o un literal; capacidades opcionales con ?.() y Symbol.hasInstance para un instanceof por forma"
example_tags: "javascript|python|polimorfismo|duck-typing|symbol-hasinstance"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una función que exporta un informe a «algo donde se pueda escribir».
// No pregunta por clases: solo usa write(text) y, si existe, flush().
function exportReport(lines, target) {
  for (const line of lines) target.write(line);
  target.flush?.(); // capacidad OPCIONAL: se llama solo si existe
}

class MemoryFile {
  #chunks = [];
  write(text) {
    this.#chunks.push(text);
  }
  get content() {
    return this.#chunks.join('\n');
  }
}

class BufferedLog {
  #pending = [];
  write(text) {
    this.#pending.push(text);
  }
  flush() {
    console.log(`  [log] ${this.#pending.length} líneas: ${this.#pending.join(' · ')}`);
    this.#pending = [];
  }
}

const lines = ['Ventas de octubre', 'Puebla: 120', 'Mérida: 85'];

const file = new MemoryFile();
exportReport(lines, file);
console.log('MemoryFile →', JSON.stringify(file.content));

exportReport(lines, new BufferedLog()); // este sí tiene flush

// Un objeto literal también vale: no hace falta ninguna clase.
const counter = { total: 0, write(text) { this.total += text.length; } };
exportReport(lines, counter);
console.log('literal → caracteres:', counter.total);

// Lo que no «grazna» falla al usarlo:
try {
  exportReport(lines, { send() {} });
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}

// instanceof por FORMA: Symbol.hasInstance decide qué responde instanceof.
class Writable {
  static [Symbol.hasInstance](value) {
    return typeof value?.write === 'function';
  }
}
console.log('instanceof Writable →', file instanceof Writable, counter instanceof Writable, {} instanceof Writable);

// > Desde Python: el duck typing es el mismo. Symbol.hasInstance hace el papel
//   de __instancecheck__ / __subclasshook__ de las ABC, y typing.Protocol el de
//   las interfaces de TypeScript (capítulo 7).
```
