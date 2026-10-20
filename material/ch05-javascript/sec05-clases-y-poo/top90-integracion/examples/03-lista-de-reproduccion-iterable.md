---
example_description: "Una lista de reproducción que habla todos los protocolos: Symbol.iterator con un next() a mano, Symbol.toPrimitive (duración como número, resumen como texto), toJSON y fromJSON, Symbol.toStringTag y operaciones que devuelven listas nuevas"
example_tags: "javascript|integracion|clases|symbol-iterator|symbol-toprimitive|tojson|inmutabilidad"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// UNA LISTA DE REPRODUCCIÓN que se comporta como un tipo nativo.
// Integra: privados y static («Encapsulación»), los protocolos («Polimorfismo y
// protocolos») y operaciones que devuelven objetos nuevos («Patrones de diseño»).
const formatDuration = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

class Playlist {
  #songs; // array congelado de canciones congeladas: nadie lo cambia desde fuera

  constructor(name, songs = []) {
    this.name = name;
    this.#songs = Object.freeze(songs.map((song) => Object.freeze({ ...song })));
  }

  // 'Título — Artista — 3:45' → { title, artist, seconds }
  static parse(name, lines) {
    return new Playlist(name, lines.map((line) => {
      const [title, artist, duration] = line.split(' — ');
      const [minutes, seconds] = duration.split(':').map(Number);
      return { title, artist, seconds: minutes * 60 + seconds };
    }));
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    return new Playlist(data.name, data.songs);
  }

  get size() {
    return this.#songs.length;
  }
  get totalSeconds() {
    return this.#songs.reduce((sum, song) => sum + song.seconds, 0);
  }
  at(index) {
    return this.#songs.at(index);
  }

  // Operaciones que NO cambian la lista: devuelven otra.
  filter(predicate) {
    return new Playlist(`${this.name} (filtrada)`, this.#songs.filter(predicate));
  }
  with(song) {
    return new Playlist(this.name, [...this.#songs, song]);
  }

  // Iterable: un iterador nuevo en cada for…of (los generadores lo acortarán).
  [Symbol.iterator]() {
    const songs = this.#songs;
    let index = 0;
    return {
      next() {
        return index < songs.length ? { value: songs[index++], done: false } : { value: undefined, done: true };
      },
    };
  }

  // Número → duración en segundos (para comparar y sumar); texto → resumen.
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.totalSeconds;
    return `${this.name} (${this.size} canciones, ${formatDuration(this.totalSeconds)})`;
  }

  toJSON() {
    return { name: this.name, songs: [...this] };
  }

  get [Symbol.toStringTag]() {
    return 'Playlist';
  }
}

const roadTrip = Playlist.parse('Carretera a Oaxaca', [
  'La Llorona — Lila Downs — 4:12',
  'Oye cómo va — Tito Puente — 3:58',
  'Bésame mucho — Consuelo Velázquez — 2:51',
  'Cielito lindo — Mariachi Vargas — 3:05',
]);
const shortTrip = roadTrip.filter((song) => song.seconds < 240);

for (const [index, song] of [...roadTrip].entries()) console.log(`${index + 1}. ${song.title} · ${formatDuration(song.seconds)}`);
console.log(`plantilla → ${roadTrip}`);
console.log('+roadTrip →', +roadTrip, 'segundos | ¿más larga que la filtrada? →', roadTrip > shortTrip);
const [first, , third] = roadTrip;
console.log('desestructuración →', first.title, '|', third.title);
console.log('artistas →', new Set(Array.from(roadTrip, (song) => song.artist)).size, '| la más corta →', formatDuration(Math.min(...Array.from(roadTrip, (s) => s.seconds))));
console.log('ordenadas por duración →', [roadTrip, shortTrip].sort((a, b) => a - b).map(String));

// Inmutable por fuera: with devuelve otra lista y la original no cambia.
const longer = roadTrip.with({ title: 'México lindo y querido', artist: 'Jorge Negrete', seconds: 187 });
console.log('with → tamaños', roadTrip.size, longer.size);
roadTrip.at(0).seconds = 1; // canción congelada: no cambia (en silencio)
console.log('at(0) tras «cambiarla» →', roadTrip.at(0).seconds);

// Ida y vuelta por JSON, con el prototipo recuperado.
const json = JSON.stringify(shortTrip);
const restored = Playlist.fromJSON(json);
console.log('JSON →', json);
console.log('restaurada →', `${restored}`, '| etiqueta →', Object.prototype.toString.call(restored));
```
