---
example_description: "En obj.metodo(), this es el objeto a la izquierda del punto en el momento de la llamada; la misma función en dos objetos da dos this distintos"
example_tags: "javascript|python|this|metodos|objetos"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Regla 2: LLAMADA COMO MÉTODO, obj.metodo(): this es el objeto que hay justo
// a la IZQUIERDA del punto en esa llamada.
const playlist = {
  name: 'Para estudiar',
  songs: ['Clair de lune', 'Gymnopédie n.º 1', 'Spiegel im Spiegel'],
  describe() {
    return `${this.name}: ${this.songs.length} canciones`;
  },
};
console.log('playlist.describe() →', playlist.describe());
console.log("con corchetes →", playlist['describe']()); // también cuenta

// La función no «pertenece» al objeto: es un valor guardado en una propiedad.
// La MISMA función puesta en dos objetos recibe un this distinto en cada llamada.
function describeOffice() {
  return `${this.name} (${this.city})`;
}
const madrid = { name: 'Oficina central', city: 'Madrid', describe: describeOffice };
const lima = { name: 'Sucursal', city: 'Lima', describe: describeOffice };
console.log('madrid.describe() →', madrid.describe()); // 'Oficina central (Madrid)'
console.log('lima.describe() →', lima.describe());     // 'Sucursal (Lima)'
console.log('¿misma función? →', madrid.describe === lima.describe); // true

// Con varios puntos, cuenta SOLO el último objeto antes del método.
const company = { name: 'Acme', offices: { main: madrid } };
console.log('company.offices.main.describe() →', company.offices.main.describe()); // Madrid, no Acme

// this permite que los métodos usen otros métodos del mismo objeto.
const timer = {
  seconds: 125,
  minutes() {
    return Math.floor(this.seconds / 60);
  },
  label() {
    return `${this.minutes()} min ${this.seconds % 60} s`;
  },
};
console.log('timer.label() →', timer.label()); // '2 min 5 s'

// > Desde Python: playlist.describe() funciona igual que obj.describe(), con
//   this en el papel de self. La diferencia está en el siguiente ejemplo.
```
