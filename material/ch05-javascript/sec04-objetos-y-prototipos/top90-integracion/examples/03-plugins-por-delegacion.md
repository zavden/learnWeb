---
example_description: "Un asistente de soporte ampliable con plugins: cada plugin es una capa creada con Object.create que responde o delega en la de debajo, y cada bot guarda sus datos propios"
example_tags: "javascript|integracion|delegacion|object-create|plugins|prototipos"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// ASISTENTE DE SOPORTE de una tienda online, ampliable con plugins.
// Cada plugin es una CAPA creada con Object.create(capa de debajo): responde a lo
// que sabe y, si no, delega en la capa de debajo llamándola por su nombre.
// Integra: Object.create, delegación y enlace en vivo («La cadena de prototipos»,
// «Herencia prototípica»), Object.hasOwn y datos propios frente a compartidos.

const baseBot = {
  layerName: 'base',
  reply(text) {
    return 'No te he entendido. Escribe «ayuda» para ver lo que sé hacer.';
  },
  handle(message) {
    const answer = this.reply(message.trim().toLowerCase());
    this.history.push(message); // history es PROPIA de cada bot (ver createBot)
    return answer;
  },
};

// Una capa nueva que delega en `below`; el plugin recibe `below` para poder
// llamarla por su nombre (this.reply() se llamaría a sí mismo sin fin).
function usePlugin(below, makePlugin) {
  return Object.assign(Object.create(below), makePlugin(below));
}

const greetings = (below) => ({
  layerName: 'saludos',
  topic: 'hola',
  reply(text) {
    if (text.startsWith('hola') || text.startsWith('buenas')) return `¡Hola! Soy ${this.botName}. ¿En qué te ayudo?`;
    return below.reply.call(this, text); // mismo this: el bot que recibió el mensaje
  },
});

const ORDERS = new Map([
  ['1042', { status: 'en reparto', carrier: 'Correos Express' }],
  ['1043', { status: 'preparándose en el almacén', carrier: '—' }],
]);
const orderStatus = (below) => ({
  layerName: 'pedidos',
  topic: 'pedido 1042',
  reply(text) {
    if (!text.startsWith('pedido')) return below.reply.call(this, text);
    const id = text.slice('pedido'.length).trim();
    const order = ORDERS.get(id);
    return order ? `El pedido ${id} está ${order.status} (${order.carrier}).` : `No encuentro el pedido «${id}».`;
  },
});

const SHIPPING = Object.freeze({ españa: ['España', '4,90 €'], portugal: ['Portugal', '7,50 €'], méxico: ['México', '19,90 €'] });
const shipping = (below) => ({
  layerName: 'envíos',
  topic: 'envío a méxico',
  reply(text) {
    if (!text.startsWith('envío a ')) return below.reply.call(this, text);
    const country = text.slice('envío a '.length);
    // hasOwn y no `in`: «constructor» no es un país, aunque SHIPPING lo herede.
    if (!Object.hasOwn(SHIPPING, country)) return `Todavía no enviamos a «${country}».`;
    const [name, price] = SHIPPING[country];
    return `El envío a ${name} cuesta ${price}.`;
  },
});

const help = (below) => ({
  layerName: 'ayuda',
  topic: 'ayuda',
  reply(text) {
    if (text !== 'ayuda') return below.reply.call(this, text);
    // Recorre la cadena y reúne el «topic» PROPIO de cada capa.
    const topics = [];
    for (let layer = this; layer !== null; layer = Object.getPrototypeOf(layer)) {
      if (Object.hasOwn(layer, 'topic')) topics.push(`«${layer.topic}»`);
    }
    return `Prueba con ${new Intl.ListFormat('es', { type: 'disjunction' }).format(topics.toReversed())}.`;
  },
});

let stack = baseBot;
for (const plugin of [greetings, orderStatus, shipping, help]) stack = usePlugin(stack, plugin);

// Cada bot es un objeto más que delega en la pila de plugins, con sus datos propios.
function createBot(botName, layers) {
  const bot = Object.create(layers);
  bot.layerName = `bot ${botName}`;
  bot.botName = botName;
  bot.history = []; // 🐛 si estuviera en baseBot, todos los bots compartirían el array
  return bot;
}
const lucia = createBot('Lucía', stack);
const mateo = createBot('Mateo', stack);

for (const message of ['Hola', 'ayuda', 'Pedido 1042', 'pedido 9999', 'envío a México', 'envío a constructor', '¿Hacéis factura?']) {
  console.log(`👤 ${message}\n🤖 ${lucia.handle(message)}`);
}
console.log('Mateo →', mateo.handle('buenas tardes'));

// La cadena de un bot y dónde se resuelve cada propiedad:
const names = [];
for (let layer = lucia; layer !== null; layer = Object.getPrototypeOf(layer)) {
  names.push(Object.hasOwn(layer, 'layerName') ? layer.layerName : 'Object.prototype');
}
console.log('cadena →', [...names, 'null'].join(' → '));
const ownerOf = (obj, key) => {
  while (obj !== null && !Object.hasOwn(obj, key)) obj = Object.getPrototypeOf(obj);
  return obj === null ? '—' : obj.layerName;
};
console.log('reply →', ownerOf(lucia, 'reply'), '| handle →', ownerOf(lucia, 'handle'), '| botName →', ownerOf(lucia, 'botName'));
console.log('historiales →', lucia.history.length, 'y', mateo.history.length); // 7 y 1: propios

// Enlace en vivo: cambiar la base afecta a todos los bots ya creados.
baseBot.reply = function () {
  return 'Ahora mismo no sé responder a eso: escribe a soporte@example.com.';
};
console.log('Mateo →', mateo.handle('¿Tenéis tienda física?'));
```
