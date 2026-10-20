---
example_description: "Si el constructor del padre llama a un método sobrescrito, ese método se ejecuta antes de que existan los campos de la hija: undefined o TypeError; orden de inicialización y cómo evitarlo"
example_tags: "javascript|python|clases|herencia|campos|constructor|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const log = [];
function trace(message, value) {
  log.push(message); // apunta el paso y devuelve el valor del campo
  return value;
}

class Widget {
  constructor(label) {
    log.push('2. constructor de Widget');
    this.label = label;
    this.render(); // 🐛 llama a un método que la hija sobrescribe
  }
  render() {
    log.push('   render de Widget');
  }
}

class Badge extends Widget {
  // Los campos de la hija se crean DESPUÉS de que super() vuelva.
  items = trace('3. campos de Badge', []);
  color = 'verde';

  constructor(label) {
    log.push('1. constructor de Badge, antes de super');
    super(label);
    log.push('4. constructor de Badge, después de super');
  }

  render() {
    log.push(`   render de Badge: color = ${this.color}, items = ${this.items}`); // 🐛 undefined
    try {
      this.items.push(this.label); // ❌ items todavía no existe
    } catch (error) {
      log.push(`   🐛 ${error.name}: ${error.message}`);
    }
  }
}

const badge = new Badge('Nuevo');
console.log(log.join('\n'));
console.log('después de new →', badge); // los campos llegaron tarde: items vacío
// Cuando el padre llama a render (¡el de Badge!), los campos de Badge no existen.

// ✅ El constructor solo prepara el estado; quien crea el objeto llama a render
//    después (o lo hace un método estático create que hace las dos cosas).
class SafeWidget {
  constructor(label) {
    this.label = label;
  }
  static create(...args) {
    const widget = new this(...args);
    widget.render(); // aquí el objeto ya está completo
    return widget;
  }
  render() {}
}
class SafeBadge extends SafeWidget {
  items = [];
  color = 'verde';
  render() {
    this.items.push(this.label);
    console.log(`✅ render de SafeBadge: color = ${this.color}, items = ${this.items}`);
  }
}
SafeBadge.create('Nuevo');

// > Desde Python: pasa lo mismo si el __init__ del padre llama a un método que usa
//   atributos que la hija asigna tras super().__init__(); aquí, los campos lo esconden.
```
