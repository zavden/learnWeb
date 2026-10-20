---
example_description: "Una cafetería simulada con tareas cooperativas: cada tarea es un generador que con yield pide dormir, enviar o recibir por un canal; un planificador con reloj simulado las reanuda con next(valor), lanza los plazos vencidos con throw() y cancela con return() (los finally se ejecutan)"
example_tags: "javascript|profesional|generadores|corrutinas|planificador|simulacion|canales"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UNA MAÑANA EN UNA CAFETERÍA, simulada con tareas cooperativas.
//
// Decisiones:
// - Cada tarea (baristas, clientes, el cierre) es un GENERADOR. Con yield le
//   pide algo al planificador y se pausa hasta que se lo concede:
//     yield sleep(min)              → despiértame dentro de `min` minutos
//     yield send(canal, valor)      → deja un valor en un canal
//     yield receive(canal, plazo)   → espera un valor del canal; el planificador
//                                     me lo entrega con next(valor), o me lanza
//                                     un ChannelTimeoutError con throw() si vence el plazo
// - Un canal es una cola: cada valor lo recibe UNA sola tarea (dos baristas no
//   preparan el mismo pedido). Si nadie espera, el valor se queda en la cola.
// - El tiempo es un número de minutos (reloj simulado): ni setTimeout ni Date,
//   así que la simulación es instantánea y siempre igual.
// - cancel(id) llama a return() del generador: sus finally se ejecutan.
// - Es el mismo modelo que el event loop (módulo 7) o asyncio en Python: una
//   sola hebra y tareas que ceden el control en puntos explícitos.
//
// Alcance: módulos 1-6.

class ChannelTimeoutError extends Error {
  constructor(channel, minutes) {
    super(`nadie envió nada por «${channel}» en ${minutes} min`);
    this.name = 'ChannelTimeoutError';
  }
}

const sleep = (minutes) => ({ type: 'sleep', minutes });
const send = (channel, value) => ({ type: 'send', channel, value });
const receive = (channel, timeout = Infinity) => ({ type: 'receive', channel, timeout });

class CoopScheduler {
  #now = 0;
  #seq = 0;
  #ready = [];     // turnos pendientes: { task, input, error }
  #timers = [];    // { at, seq, resume, onFire } ordenados por hora y llegada
  #channels = new Map();
  #tasks = [];

  constructor(openingHour) {
    this.openingHour = openingHour;
  }
  get clock() { // 08:05 a partir de los minutos simulados
    const total = this.openingHour * 60 + this.#now;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
  log(text) {
    console.log(`[${this.clock}] ${text}`);
  }

  spawn(name, generator) {
    const task = { id: this.#tasks.length + 1, name, generator, status: 'activa', result: undefined };
    this.#tasks.push(task);
    this.#ready.push({ task });
    return task.id;
  }

  cancel(id) {
    const task = this.#tasks.find((candidate) => candidate.id === id);
    if (task.status !== 'activa') return;
    task.status = 'cancelada';
    task.generator.return(); // ejecuta sus finally
    this.#timers = this.#timers.filter((timer) => timer.task !== task);
    for (const channel of this.#channels.values()) channel.waiting = channel.waiting.filter((w) => w.task !== task);
  }

  #channel(name) {
    if (!this.#channels.has(name)) this.#channels.set(name, { values: [], waiting: [] });
    return this.#channels.get(name);
  }

  #addTimer(task, minutes, resume, onFire = () => {}) {
    const timer = { at: this.#now + minutes, seq: this.#seq++, task, resume, onFire };
    this.#timers.push(timer);
    this.#timers.sort((a, b) => a.at - b.at || a.seq - b.seq);
    return timer;
  }

  #handle(task, effect) {
    if (effect === undefined) return this.#ready.push({ task }); // yield a secas: ceder el turno
    if (effect.type === 'sleep') return this.#addTimer(task, effect.minutes, { task });
    const channel = this.#channel(effect.channel);
    if (effect.type === 'send') {
      const waiter = channel.waiting.shift();
      if (waiter) {
        this.#timers = this.#timers.filter((timer) => timer !== waiter.timer); // ya no vencerá
        this.#ready.push({ task: waiter.task, input: effect.value });
      } else {
        channel.values.push(effect.value);
      }
      return this.#ready.push({ task });
    }
    if (channel.values.length > 0) return this.#ready.push({ task, input: channel.values.shift() });
    const waiter = { task, timer: null };
    channel.waiting.push(waiter);
    if (effect.timeout !== Infinity) {
      waiter.timer = this.#addTimer(task, effect.timeout, { task, error: new ChannelTimeoutError(effect.channel, effect.timeout) }, () => {
        channel.waiting = channel.waiting.filter((w) => w !== waiter);
      });
    }
  }

  #step({ task, input, error }) {
    if (task.status !== 'activa') return;
    let result;
    try {
      result = error ? task.generator.throw(error) : task.generator.next(input);
    } catch (failure) {
      task.status = 'falló';
      task.result = failure.message;
      return;
    }
    if (result.done) {
      task.status = 'terminada';
      task.result = result.value;
    } else {
      this.#handle(task, result.value);
    }
  }

  run() {
    while (this.#ready.length > 0 || this.#timers.length > 0) {
      if (this.#ready.length === 0) { // nadie listo: el reloj salta al siguiente despertar
        const timer = this.#timers.shift();
        this.#now = timer.at;
        timer.onFire();
        this.#ready.push(timer.resume);
      }
      this.#step(this.#ready.shift());
    }
  }

  leftovers() { // valores que nadie recogió
    return [...this.#channels].filter(([, channel]) => channel.values.length > 0).map(([name, channel]) => `${name}: ${channel.values.join(', ')}`);
  }
  summary() {
    return this.#tasks.map(({ name, status, result }) => ({ tarea: name, estado: status, resultado: result ?? '—' }));
  }
}

// ── Las tareas de la cafetería ─────────────────────────────────────────────
const cafe = new CoopScheduler(8);

function* barista(name) {
  let served = 0;
  try {
    while (true) {
      const order = yield receive('pedidos');
      cafe.log(`☕ ${name} prepara ${order.drink} para ${order.customer} (${order.minutes} min)`);
      yield sleep(order.minutes);
      cafe.log(`🔔 ${order.drink} para ${order.customer}, listo`);
      served += 1;
      yield send(`listo:${order.customer}`, order.drink);
    }
  } finally {
    cafe.log(`🧺 ${name} cuelga el mandil tras ${served} bebida(s)`); // también al cancelar
  }
}

function* customer(name, drink, { arrivesAt, minutes, patience }) {
  yield sleep(arrivesAt);
  cafe.log(`🚪 llega ${name} y pide ${drink}`);
  yield send('pedidos', { customer: name, drink, minutes });
  try {
    const served = yield receive(`listo:${name}`, patience);
    cafe.log(`😋 ${name} recoge su ${served}`);
    return 'servido';
  } catch (error) {
    if (!(error instanceof ChannelTimeoutError)) throw error;
    cafe.log(`😤 ${name} se va sin su ${drink}: ${error.message}`);
    return 'se fue';
  }
}

function* closing(at, staff) {
  yield sleep(at);
  cafe.log('🔒 hora de cerrar');
  for (const id of staff) cafe.cancel(id);
  return `${staff.length} barista(s) a casa`;
}

const staff = [cafe.spawn('barista Marta', barista('Marta')), cafe.spawn('barista Joel', barista('Joel'))];
cafe.spawn('Ana', customer('Ana', 'americano', { arrivesAt: 0, minutes: 3, patience: 10 }));
cafe.spawn('Bruno', customer('Bruno', 'capuchino', { arrivesAt: 1, minutes: 5, patience: 10 }));
cafe.spawn('Carla', customer('Carla', 'chocolate', { arrivesAt: 2, minutes: 6, patience: 8 }));
cafe.spawn('Diego', customer('Diego', 'frappé', { arrivesAt: 2, minutes: 8, patience: 6 }));
cafe.spawn('Elena', customer('Elena', 'té chai', { arrivesAt: 9, minutes: 4, patience: 10 }));
cafe.spawn('cierre', closing(30, staff));

cafe.run();
console.table(cafe.summary());
console.log('sin recoger →', cafe.leftovers());
```
