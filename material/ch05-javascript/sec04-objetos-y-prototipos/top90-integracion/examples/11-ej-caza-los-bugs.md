---
example_description: "Ejercicio: una app de música con cinco bugs del módulo (setter recursivo, array compartido en el prototipo, prototype reemplazado, Child.prototype = Parent.prototype y un prototipo nativo extendido)"
example_tags: "javascript|ejercicio|depuracion|prototipos|herencia|setters"
exercise: true
exercise_title: "Caza los cinco bugs de la app de música"
exercise_instructions: "Ejecuta el ejemplo y lee qué comprobaciones salen con ✗ || Bug 1: que createUser guarde el email normalizado sin desbordar la pila || Bug 2: que cada lista de reproducción tenga sus propias canciones || Bug 3: que la suscripción de prueba, creada antes que los métodos, pueda renovarse y siga siendo una Subscription || Bug 4: que pistas y podcasts tengan cada uno su describe, y que el constructor de un podcast sea Podcast || Bug 5: que ningún array tenga métodos de más; convierte el método en una función normal totalSeconds(tracks) || Termina cuando todas las comprobaciones salgan con ✓"
exercise_hints: "Bug 1: dentro de set email, this.email = … vuelve a llamar al setter; ¿dónde se guarda el dato? («Propiedades a fondo») || Bug 2: this.songs.push() LEE songs; si está en el prototipo, todas las listas lo comparten («La cadena de prototipos») || Bug 3: reemplazar el objeto prototype no cambia el enlace de los objetos ya creados; añade los métodos al que ya existe («Funciones constructoras y new») || Bug 4: Podcast.prototype = Track.prototype hace que los dos nombres apunten al MISMO objeto («Herencia prototípica») || Bug 5: una asignación a Array.prototype crea una propiedad enumerable que for…in recorre en todos los arrays («Prototipos nativos»)"
exercise_solution_example: 11-ej-caza-los-bugs-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: la app de una plataforma de música tiene CINCO bugs de este módulo.
// Arregla cada TODO hasta que todas las comprobaciones del final salgan ✓.
const duration = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Bug 1 — usuarios con el email normalizado.
const userProto = {
  get email() {
    return this._email;
  },
  set email(value) {
    // TODO 1: esta línea desborda la pila al crear un usuario.
    this.email = value.trim().toLowerCase();
  },
};
function createUser(name, email) {
  const user = Object.create(userProto);
  user.name = name;
  user.email = email;
  return user;
}

// Bug 2 — listas de reproducción.
function Playlist(name) {
  this.name = name;
}
// TODO 2: las canciones de una lista aparecen en todas.
Playlist.prototype.songs = [];
Playlist.prototype.add = function (song) {
  this.songs.push(song);
  return this;
};
const focus = new Playlist('Concentración').add('Clair de lune').add('Gymnopédie n.º 1');
const party = new Playlist('Fiesta').add('La Bamba');

// Bug 3 — suscripciones. La de prueba se crea al cargar la app…
function Subscription(plan) {
  this.plan = plan;
}
const trial = new Subscription('prueba');
// …y los métodos se añaden más abajo, en otro archivo.
// TODO 3: después de esto, trial no tiene renew y ya no es una Subscription.
Subscription.prototype = {
  renew() {
    return `${this.plan}: renovada`;
  },
};

// Bug 4 — pistas y podcasts.
function Track(title, seconds) {
  this.title = title;
  this.seconds = seconds;
}
Track.prototype.describe = function () {
  return `${this.title} (${duration(this.seconds)})`;
};
function Podcast(title, seconds, host) {
  Track.call(this, title, seconds);
  this.host = host;
}
// TODO 4: describe se llama a sí mismo sin fin, en pistas Y en podcasts.
Podcast.prototype = Track.prototype;
Podcast.prototype.describe = function () {
  return `🎙️ ${Track.prototype.describe.call(this)} con ${this.host}`;
};
const song = new Track('Bésame mucho', 236);
const episode = new Podcast('Historias del jazz latino', 1830, 'Marta Gil');

// Bug 5 — un «atajo» que alguien añadió a TODOS los arrays de la página.
// TODO 5: convierte el método en una función normal: totalSeconds(tracks).
Array.prototype.totalSeconds = function () {
  return this.reduce((sum, track) => sum + track.seconds, 0);
};
const queue = [song, episode];
// El reproductor (código de otro equipo) recorre la cola con for…in:
const positions = [];
for (const index in queue) positions.push(index);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
delete Array.prototype.totalSeconds; // limpieza: que el bug 5 no afecte al resto de la página
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Ejecuta fn y devuelve su resultado, o el error como texto (así nada detiene el script).
function attempt(fn) {
  try {
    return fn();
  } catch (error) {
    return `${error.name}: ${error.message}`;
  }
}

check('Bug 1: email normalizado', attempt(() => createUser('Ana', '  Ana.Ruiz@Example.COM ').email), 'ana.ruiz@example.com');
check('Bug 2: canciones de cada lista', `${focus.songs.length} ${party.songs.length}`, '2 1');
check('Bug 3: la prueba se renueva', attempt(() => trial.renew()), 'prueba: renovada');
check('Bug 3: sigue siendo una Subscription', trial instanceof Subscription, true);
check('Bug 4: describe de una pista', attempt(() => song.describe()), 'Bésame mucho (3:56)');
check('Bug 4: describe de un podcast', attempt(() => episode.describe()), '🎙️ Historias del jazz latino (30:30) con Marta Gil');
check('Bug 4: constructor de un podcast', episode.constructor.name, 'Podcast');
check('Bug 5: for…in solo ve las posiciones', positions.join(), '0,1');
check('Bug 5: duración total de la cola', attempt(() => duration(totalSeconds(queue))), '34:26');
```
