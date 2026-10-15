---
example_description: "Las flechas no tienen this propio: usan el del método que las rodea, por eso son el callback ideal dentro de un método (y function no)"
example_tags: "javascript|this|flecha|callbacks|metodos"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// Las flechas NO tienen this propio: usan el this del sitio donde están ESCRITAS
// (igual que cualquier otra variable de fuera: ámbito léxico).
const order = {
  id: 'PED-0042',
  lines: [
    { name: 'Café con leche', cents: 180 },
    { name: 'Tostada', cents: 250 },
  ],

  printWithArrow() {
    // Aquí this es order, porque se llama order.printWithArrow().
    this.lines.forEach((line) => {
      // ✅ La flecha usa el this de printWithArrow → order.
      console.log(`  ✅ ${this.id} · ${line.name}: ${line.cents} cts`);
    });
  },

  printWithFunction() {
    this.lines.forEach(function (line) {
      // 🐛 Una function tiene SU PROPIO this, y forEach la llama como función
      // simple: this es window, y window.id no existe.
      console.log(`  🐛 ${this.id} · ${line.name}: ${line.cents} cts`);
    });
  },
};

order.printWithArrow();
order.printWithFunction();

// Antes de las flechas se usaban dos apaños que verás en código antiguo:
//   const self = this;  (y dentro del callback, self.id)
//   this.lines.forEach(function (line) { … }, this);  (forEach acepta un thisArg)

// El this de una flecha no se puede cambiar: call, apply y bind lo ignoran.
const arrow = () => this;
console.log('arrow.call({}) === window →', arrow.call({ id: 'otro' }) === window); // true

// Regla práctica:
//   - métodos de un objeto → sintaxis de método: nombre() { … }
//   - callbacks DENTRO de un método → flechas
```
