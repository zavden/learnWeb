---
example_description: "Los campos de una clase son propiedades propias que cada instancia recibe antes del cuerpo del constructor; en Python la misma sintaxis crea un atributo de clase compartido"
example_tags: "javascript|python|clases|campos|dataclass|estado"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
let nextId = 1;

class Playlist {
  // Campos: propiedades PROPIAS de cada instancia, creadas al hacer new,
  // antes de que se ejecute el cuerpo del constructor.
  id = nextId++;          // el inicializador se evalúa en CADA new
  songs = [];             // un array nuevo para cada lista: nada compartido
  owner = 'anónimo';      // valor por defecto que el constructor puede cambiar
  durationSeconds;        // sin inicializador: vale undefined, pero existe

  constructor(name, owner) {
    console.log(`  constructor de «${name}»: ¿songs ya existe? →`, Array.isArray(this.songs));
    this.name = name;
    if (owner) this.owner = owner;
  }

  add(title, seconds) {
    this.songs.push(title);
    this.durationSeconds = (this.durationSeconds ?? 0) + seconds;
    return this;
  }
}

const roadTrip = new Playlist('Viaje a Oaxaca', 'Lucía');
const study = new Playlist('Para estudiar');
roadTrip.add('La Llorona', 245).add('Cielito lindo', 180);

console.log('roadTrip →', roadTrip);
console.log('study →', study);
console.log('¿comparten songs? →', roadTrip.songs === study.songs); // false
console.log('propias de study →', Object.keys(study)); // los campos primero, en orden
console.log("¿'songs' en el prototype? →", Object.hasOwn(Playlist.prototype, 'songs')); // false

// > Desde Python: ¡la misma sintaxis significa lo contrario!
//   class Playlist:
//       songs = []      ← atributo de CLASE, compartido por todas las listas
//   (el bug del array compartido del módulo anterior). En JavaScript,
//   songs = [] dentro de class es un campo de INSTANCIA, como
//   songs: list = field(default_factory=list) en una dataclass.
//   Lo que pertenece a la clase se marca con static (lección «Encapsulación»).
```
