---
example_description: "Herencia sin constructoras: objetos que delegan en otros con Object.create, añaden métodos, sobrescriben uno y llaman al original con call"
example_tags: "javascript|python|herencia|delegacion|object-create|call"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un objeto base con un dato y un método.
const logger = {
  prefix: 'app',
  log(message) {
    console.log(`[${this.prefix}] ${message}`);
  },
};

// httpLogger DELEGA en logger: hereda log y prefix, cambia prefix (sombreado)
// y añade un método propio que usa el heredado con this.log.
const httpLogger = Object.create(logger);
httpLogger.prefix = 'http';
httpLogger.request = function (method, url, status) {
  this.log(`${method} ${url} → ${status}`);
};

// alertLogger SOBRESCRIBE log… y dentro llama al original de logger.
// No sirve this.log (sería él mismo): hay que nombrar el objeto del que se hereda.
const alertLogger = Object.create(logger);
alertLogger.prefix = 'alerta';
alertLogger.log = function (message) {
  logger.log.call(this, `⚠️ ${message.toUpperCase()}`); // el log de logger, con ESTE this
};

logger.log('aplicación iniciada');
httpLogger.request('GET', '/api/orders', 200);
httpLogger.log('caché vaciada');      // heredado, con el prefix de httpLogger
alertLogger.log('disco casi lleno');  // el suyo, que reutiliza el de logger

//   httpLogger { prefix, request } ─┐
//                                   ├──► logger { prefix, log } ──► Object.prototype ──► null
//   alertLogger { prefix, log } ────┘

// Una cadena puede tener más eslabones: un objeto que delega en httpLogger.
const apiLogger = Object.create(httpLogger);
apiLogger.prefix = 'api';
apiLogger.request('POST', '/api/payments', 201); // request de httpLogger, log de logger

console.log('¿request propio de apiLogger? →', Object.hasOwn(apiLogger, 'request')); // false
console.log('apiLogger →', apiLogger); // expándelo: tres [[Prototype]] seguidos

// > Desde Python: es herencia sin clases. logger.log.call(this, …) cumple el
//   papel de super().log(…): llamar a la versión del «padre» con el mismo self.
```
