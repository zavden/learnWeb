---
example_description: "Un array en el prototipo lo comparten todos los objetos: push lee el heredado y lo muta, y el cambio aparece en todos. Los datos mutables deben ser propios"
example_tags: "javascript|python|prototipos|mutabilidad|estado-compartido|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un prototipo con métodos… y, por descuido, también con DATOS mutables.
const basePlaylist = {
  name: 'Sin título',
  songs: [], // 🐛 un único array, guardado en el prototipo
  add(song) {
    this.songs.push(song);
    return this;
  },
};

const morning = Object.create(basePlaylist);
morning.name = 'Mañanas'; // ✅ asignación → propiedad PROPIA de morning
morning.add('Here Comes the Sun');

const night = Object.create(basePlaylist);
night.name = 'Noches';
night.add('Clair de lune');

// 🐛 this.songs.push(…) no es una asignación a songs: LEE songs (la búsqueda
// llega al prototipo) y muta ese array. Todas las listas comparten el mismo.
console.log('🐛 morning.songs →', morning.songs); // ['Here Comes the Sun', 'Clair de lune']
console.log('🐛 night.songs →', night.songs);     // el mismo array
console.log('¿songs propia de morning? →', Object.hasOwn(morning, 'songs')); // false

// ✅ Los métodos pueden compartirse; los datos mutables, NO: cada objeto
// necesita su propio array. Una función que crea el objeto lo garantiza.
const playlistMethods = {
  add(song) {
    this.songs.push(song);
    return this;
  },
};
function createPlaylist(name) {
  const playlist = Object.create(playlistMethods);
  playlist.name = name;
  playlist.songs = []; // propio: uno nuevo por lista
  return playlist;
}

const workout = createPlaylist('Gimnasio').add('Eye of the Tiger');
const study = createPlaylist('Estudio').add('Gymnopédie n.º 1');
console.log('✅ workout.songs →', workout.songs); // ['Eye of the Tiger']
console.log('✅ study.songs →', study.songs);     // ['Gymnopédie n.º 1']

// > Desde Python: es el mismo bug que un atributo de clase mutable,
//   class Playlist: songs = [], compartido por todas las instancias.
//   Allí se arregla con self.songs = [] en __init__; aquí, con el array propio.
```
