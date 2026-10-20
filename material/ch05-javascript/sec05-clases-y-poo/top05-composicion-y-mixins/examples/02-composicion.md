---
example_description: "Composición: un Notifier TIENE un canal y unas políticas (reintentos, registro) que recibe en el constructor y puede cambiar en tiempo de ejecución, sin una clase por cada combinación"
example_tags: "javascript|python|clases|composicion|delegacion|diseno"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Las piezas: cada canal sabe ENVIAR, y nada más.
class EmailChannel {
  send(to, text) {
    return `📧 ${to}: ${text}`;
  }
}
class SmsChannel {
  #failuresLeft;
  constructor(failuresLeft = 0) {
    this.#failuresLeft = failuresLeft; // simula una red inestable
  }
  send(to, text) {
    if (this.#failuresLeft > 0) {
      this.#failuresLeft -= 1;
      throw new Error('red móvil no disponible');
    }
    return `📱 ${to}: ${text.slice(0, 160)}`; // un SMS admite 160 caracteres
  }
}

// El objeto compuesto: TIENE un canal y unas opciones; delega el envío.
class Notifier {
  #history = [];
  constructor({ channel, retries = 0, log = false }) {
    this.channel = channel; // la pieza es pública: se puede cambiar
    this.retries = retries;
    this.log = log;
  }

  notify(to, text) {
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      try {
        const receipt = this.channel.send(to, text); // delegación
        if (this.log) this.#history.push(`intento ${attempt + 1}: ok`);
        return receipt;
      } catch (error) {
        if (this.log) this.#history.push(`intento ${attempt + 1}: ${error.message}`);
      }
    }
    return `⛔ no se pudo avisar a ${to}`;
  }

  get history() {
    return [...this.#history];
  }
}

// Cualquier combinación sin clases nuevas:
const plain = new Notifier({ channel: new EmailChannel() });
const robust = new Notifier({ channel: new SmsChannel(2), retries: 3, log: true });
const fragile = new Notifier({ channel: new SmsChannel(5), retries: 1 });

console.log(plain.notify('ana@example.com', 'Tu pedido 1042 ya salió'));
console.log(robust.notify('+52 55 1234 5678', 'Tu pedido 1042 llega hoy entre 16:00 y 18:00'));
console.log('registro →', robust.history);
console.log(fragile.notify('+52 33 8765 4321', 'Tu pedido 1043 llega mañana'));

// Y la pieza se puede cambiar en tiempo de ejecución (con herencia, imposible):
fragile.channel = new EmailChannel();
console.log(fragile.notify('mateo@example.com', 'Tu pedido 1043 llega mañana'));

// > Desde Python: igual que pasar objetos a __init__ y guardarlos en self.
//   «Tiene un» (composición) frente a «es un» (herencia).
```
