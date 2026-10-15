---
example_description: "Una máquina de estados genérica (configuración validada al crearla, guardas, historial y oyentes) que gobierna un reproductor de audio con un reloj simulado; las acciones imposibles lanzan un error que explica por qué"
example_tags: "javascript|profesional|clases|maquina-de-estados|composicion|observador|errores"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UN REPRODUCTOR DE AUDIO gobernado por una máquina de estados.
// - StateMachine es genérica: recibe una configuración (estados, eventos,
//   destinos y guardas), la valida al crearla y lanza un TransitionError con
//   el motivo cuando un evento no está permitido en el estado actual.
// - MediaPlayer COMPONE una máquina (no hereda de ella): su API pública son
//   acciones con sentido (play, pause, seek) y su estado interno es privado.
// - El tiempo es un reloj simulado (tick): la asincronía llega en el módulo 7.

class TransitionError extends Error {
  constructor(state, event, reason) {
    super(`«${event}» en «${state}»: ${reason}`);
    this.name = 'TransitionError';
    Object.assign(this, { state, event });
  }
}

class StateMachine {
  #config;
  #state;
  #history = [];
  #listeners = new Set();

  constructor(config) {
    const names = Object.keys(config.states);
    if (!names.includes(config.initial)) throw new TypeError(`Estado inicial desconocido: «${config.initial}»`);
    for (const [name, { on = {} }] of Object.entries(config.states)) {
      for (const [event, transition] of Object.entries(on)) {
        const { target } = StateMachine.#normalize(transition);
        if (!names.includes(target)) throw new TypeError(`${name} --${event}--> «${target}»: estado destino desconocido`);
      }
    }
    this.#config = config;
    this.#state = config.initial;
  }

  // Un destino puede ser un texto ('paused') o un objeto con guarda.
  static #normalize(transition) {
    return typeof transition === 'string' ? { target: transition } : transition;
  }

  get state() {
    return this.#state;
  }
  get history() {
    return this.#history.map(({ from, event, to }) => `${from} --${event}--> ${to}`);
  }

  can(event, context) {
    const transition = this.#config.states[this.#state].on?.[event];
    if (!transition) return false;
    const { guard } = StateMachine.#normalize(transition);
    return !guard || guard(context);
  }

  send(event, context = {}) {
    const transition = this.#config.states[this.#state].on?.[event];
    if (!transition) throw new TransitionError(this.#state, event, 'no está permitido');
    const { target, guard, reason = 'la guarda lo impide' } = StateMachine.#normalize(transition);
    if (guard && !guard(context)) throw new TransitionError(this.#state, event, reason);
    const step = { from: this.#state, event, to: target };
    this.#state = target;
    this.#history.push(step);
    for (const listener of [...this.#listeners]) listener(step);
    return target;
  }

  onTransition(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const seekGuard = { guard: ({ to, duration }) => to >= 0 && to <= duration, reason: 'la posición está fuera de la pista' };

class MediaPlayer {
  static CONFIG = Object.freeze({
    initial: 'idle',
    states: {
      idle: { on: { LOAD: 'loading' } },
      loading: { on: { LOADED: 'ready', FAIL: 'error' } },
      ready: { on: { PLAY: 'playing', LOAD: 'loading' } },
      playing: { on: { PAUSE: 'paused', STOP: 'ready', END: 'ended', SEEK: { target: 'playing', ...seekGuard } } },
      paused: { on: { PLAY: 'playing', STOP: 'ready', SEEK: { target: 'paused', ...seekGuard } } },
      ended: { on: { PLAY: 'playing', LOAD: 'loading' } },
      error: { on: { LOAD: 'loading' } },
    },
  });

  #machine = new StateMachine(MediaPlayer.CONFIG);
  #track = null;
  #position = 0;
  log = [];

  constructor() {
    this.#machine.onTransition(({ from, event, to }) => this.log.push(`${from} --${event}--> ${to}`));
  }

  get state() { return this.#machine.state; }
  get status() {
    const icons = { idle: '⏹', loading: '⏳', ready: '⏹', playing: '▶', paused: '⏸', ended: '⏮', error: '⚠️' };
    const where = this.#track ? ` ${formatTime(this.#position)} / ${formatTime(this.#track.seconds)} · ${this.#track.title}` : '';
    return `${icons[this.state]} ${this.state}${where}`;
  }

  load(track) {
    this.#machine.send('LOAD');
    this.#track = track;
    this.#position = 0;
    this.#machine.send(track.file.endsWith('.mp3') ? 'LOADED' : 'FAIL'); // carga simulada
  }
  play() {
    if (this.state === 'ended') this.#position = 0; // volver a empezar
    this.#machine.send('PLAY');
  }
  pause() { this.#machine.send('PAUSE'); }
  stop() {
    this.#machine.send('STOP');
    this.#position = 0;
  }
  seek(seconds) {
    this.#machine.send('SEEK', { to: seconds, duration: this.#track?.seconds ?? 0 });
    this.#position = seconds;
  }
  tick(seconds) { // el reloj simulado
    if (this.state !== 'playing') return;
    this.#position = Math.min(this.#position + seconds, this.#track.seconds);
    if (this.#position === this.#track.seconds) this.#machine.send('END');
  }
}

// ── Una sesión de escucha ─────────────────────────────────────────────
const player = new MediaPlayer();
const session = [
  ['play()', () => player.play()],
  ['load(«La Llorona»)', () => player.load({ title: 'La Llorona', file: 'la-llorona.mp3', seconds: 252 })],
  ['play()', () => player.play()],
  ['tick(65)', () => player.tick(65)],
  ['pause()', () => player.pause()],
  ['tick(30)', () => player.tick(30)], // en pausa, el reloj no avanza
  ['seek(400)', () => player.seek(400)],
  ['seek(240)', () => player.seek(240)],
  ['play()', () => player.play()],
  ['tick(20)', () => player.tick(20)],
  ['pause()', () => player.pause()],
  ['play()', () => player.play()],
  ['load(«Cielito lindo» en .ogg)', () => player.load({ title: 'Cielito lindo', file: 'cielito-lindo.ogg', seconds: 185 })],
  ['stop()', () => player.stop()],
  ['load(«Cielito lindo» en .ogg)', () => player.load({ title: 'Cielito lindo', file: 'cielito-lindo.ogg', seconds: 185 })],
  ['load(«Cielito lindo» en .mp3)', () => player.load({ title: 'Cielito lindo', file: 'cielito-lindo.mp3', seconds: 185 })],
];
console.group('Sesión');
for (const [label, action] of session) {
  try {
    action();
    console.log(`${label.padEnd(30)} → ${player.status}`);
  } catch (error) {
    if (!(error instanceof TransitionError)) throw error;
    console.warn(`${label.padEnd(30)} ⛔ ${error.message}`);
  }
}
console.groupEnd();
console.log('transiciones →', player.log.length, '| las tres últimas →', player.log.slice(-3));

// ¿Qué acciones admite cada estado? Sale de la configuración, sin listas aparte.
const events = ['LOAD', 'LOADED', 'FAIL', 'PLAY', 'PAUSE', 'STOP', 'SEEK', 'END'];
const matrix = {};
for (const [state, { on = {} }] of Object.entries(MediaPlayer.CONFIG.states)) {
  matrix[state] = Object.fromEntries(events.map((event) => [event, Object.hasOwn(on, event) ? '✓' : '']));
}
console.table(matrix);

try {
  new StateMachine({ initial: 'idle', states: { idle: { on: { PLAY: 'plying' } } } });
} catch (error) {
  console.warn(`⛔ configuración con una errata → ${error.name}: ${error.message}`);
}
```
