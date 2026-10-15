---
example_description: "Solución: el dato del setter en _email, el array en cada lista, Object.assign sobre el prototype existente, Object.create para encadenar y una función normal en lugar de extender Array.prototype"
example_tags: "javascript|solucion|depuracion|prototipos|herencia|setters"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: los cinco bugs de la app de música, uno por lección del módulo.
const duration = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Bug 1 — usuarios con el email normalizado.
const userProto = {
  get email() {
    return this._email;
  },
  set email(value) {
    // ✅ Bug 1: el dato vive en OTRA propiedad; this.email = … llamaría otra vez al setter.
    this._email = value.trim().toLowerCase();
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
  this.songs = []; // ✅ Bug 2: los datos mutables, propios de cada lista
}
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
// ✅ Bug 3: se AÑADE al prototype que ya existe; trial sigue enlazado a él.
Object.assign(Subscription.prototype, {
  renew() {
    return `${this.plan}: renovada`;
  },
});

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
// ✅ Bug 4: un eslabón NUEVO que hereda de Track.prototype, con su constructor.
Podcast.prototype = Object.create(Track.prototype);
Object.defineProperty(Podcast.prototype, 'constructor', {
  value: Podcast, writable: true, enumerable: false, configurable: true,
});
Podcast.prototype.describe = function () {
  return `🎙️ ${Track.prototype.describe.call(this)} con ${this.host}`;
};
const song = new Track('Bésame mucho', 236);
const episode = new Podcast('Historias del jazz latino', 1830, 'Marta Gil');

// ✅ Bug 5: una función normal que recibe el array; Array.prototype queda intacto.
function totalSeconds(tracks) {
  return tracks.reduce((sum, track) => sum + track.seconds, 0);
}
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
