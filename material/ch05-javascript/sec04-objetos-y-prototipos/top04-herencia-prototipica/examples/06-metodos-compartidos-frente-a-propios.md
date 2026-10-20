---
example_description: "Métodos en el prototipo (uno para todos) frente a métodos propios creados en la constructora (uno por objeto, con closure privado o this fijo) y sobrescritura de un solo objeto"
example_tags: "javascript|herencia|metodos|closures|memoria|this"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
function Stopwatch(label) {
  this.label = label;

  // PROPIO: se crea un closure nuevo en cada new. Coste: una función por objeto.
  // Ventaja: elapsedMs es privada de verdad (lección «Closures»).
  let elapsedMs = 0;
  this.addLap = function (ms) {
    elapsedMs += ms;
    return this;
  };
  this.elapsed = function () {
    return elapsedMs;
  };

  // PROPIO con flecha: this queda fijado al objeto (lección «this»), así que
  // se puede pasar como callback sin perderlo.
  this.report = () => `${this.label}: ${(elapsedMs / 1000).toFixed(1)} s`;
}

// COMPARTIDO: una sola función para todos, en el prototipo.
Stopwatch.prototype.isLongerThan = function (other) {
  return this.elapsed() > other.elapsed();
};

const running = new Stopwatch('Carrera');
const cycling = new Stopwatch('Bicicleta');
running.addLap(61200).addLap(59800);
cycling.addLap(95000);

console.log('propias →', Object.keys(running)); // ['label', 'addLap', 'elapsed', 'report']
console.log('¿mismo addLap? →', running.addLap === cycling.addLap);                  // false
console.log('¿mismo isLongerThan? →', running.isLongerThan === cycling.isLongerThan); // true
console.log('running.elapsedMs →', running.elapsedMs); // undefined: no es una propiedad
console.log('isLongerThan →', running.isLongerThan(cycling)); // true

// report es una flecha propia: funciona aunque se pase suelta como callback.
const reports = [running, cycling].map((watch) => watch.report).map((report) => report());
console.log('reports →', reports);

// Sobrescribir UN objeto: un método propio sombrea al del prototipo solo en él.
// Uso típico al depurar: «espiar» las llamadas de un objeto concreto.
const sharedIsLongerThan = Stopwatch.prototype.isLongerThan;
cycling.isLongerThan = function (other) {
  console.log(`  🔍 ${this.label}.isLongerThan(${other.label})`);
  return sharedIsLongerThan.call(this, other); // delega en el compartido
};
console.log('cycling.isLongerThan(running) →', cycling.isLongerThan(running)); // false
console.log('running.isLongerThan(cycling) →', running.isLongerThan(cycling)); // true, sin espía
console.log('¿running tiene uno propio? →', Object.hasOwn(running, 'isLongerThan')); // false
delete cycling.isLongerThan; // al quitar el propio, vuelve a usar el compartido
```
