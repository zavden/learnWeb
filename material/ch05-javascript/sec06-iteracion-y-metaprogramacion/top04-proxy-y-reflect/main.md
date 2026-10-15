# Proxy y Reflect

## Por qué importa

Hasta ahora, cada protocolo que has visto deja que tu objeto responda a **una** operación concreta del lenguaje: `Symbol.iterator` al recorrerlo, `Symbol.toPrimitive` al convertirlo, un getter al leer **una** propiedad con nombre conocido. Pero hay cosas que no se pueden hacer así: responder a la lectura de **cualquier** propiedad, incluidas las que no existen; validar **todas** las asignaciones; enterarse de cada cambio para avisar a quien dependa de él. En la lección «Polimorfismo y protocolos» quedó una lista de métodos mágicos de Python sin equivalente: `__getattr__`, `__setattr__` y `__getitem__` con índices negativos.

Un **`Proxy`** cubre ese hueco. Es un objeto que **envuelve** a otro y deja que intercepten sus operaciones fundamentales (leer, escribir, borrar, preguntar con `in`, listar claves, llamar) unas funciones llamadas **trampas**. Es la herramienta de metaprogramación más potente de JavaScript: con ella están hechos los sistemas de reactividad de Vue 3 y MobX, librerías de validación y los *mocks* de las herramientas de pruebas. Y su compañero, **`Reflect`**, es la forma correcta de hacer «lo normal» desde dentro de una trampa.

## Un objeto que intercepta

`new Proxy(objetivo, manejador)` crea un objeto nuevo. El **objetivo** (*target*) es el objeto envuelto; el **manejador** (*handler*) es un objeto con trampas, métodos con nombres fijos (`get`, `set`, `has`…). Cada operación sobre el proxy busca su trampa en el manejador: si existe, la llama; si no, hace la operación directamente sobre el objetivo.

```text
prefs.fontSize ──► proxy ──► ¿handler.get? ──sí──► get(target, 'fontSize', proxy)
                                          └─no──► target.fontSize
```

La trampa `get(target, key, receiver)` intercepta **todas** las lecturas. En el ejemplo da valores por defecto a las preferencias que el usuario no ha cambiado, y apunta cada clave que ve. Como no hay trampa `set`, las escrituras llegan tal cual al objetivo:

[[exercise:01-primer-proxy.md-]]

```text
theme → oscuro
fontSize → 16
language → es-MX
lecturas → theme, fontSize, language
objetivo tras escribir → {theme: 'oscuro', fontSize: 20}
fontSize → 20
JSON → {"theme":"oscuro","fontSize":20}
JSON.stringify leyó → toJSON, theme, fontSize
```

Fíjate en las dos últimas líneas. La trampa ve también las lecturas que hace el propio lenguaje: `JSON.stringify` busca primero un método `toJSON` y después lee las claves **propias** del objetivo. Por eso `language`, que solo «existe» gracias a la trampa `get`, no sale en el JSON: para eso habría que interceptar también la lista de claves (trampa `ownKeys`, más abajo).

Un detalle de la consola: si imprimes un proxy entero, Chrome DevTools lo muestra como `Proxy(Object) {…}` sin ejecutar sus trampas, porque es una herramienta del navegador. La consola de LearnWeb está escrita en JavaScript y lo inspecciona como a cualquier objeto, así que **pasa por sus trampas** (`ownKeys`, `getOwnPropertyDescriptor`, `get`…), y si esas trampas apuntan o avisan de algo, lo verás pasar. Por eso los ejemplos imprimen propiedades concretas o `JSON.stringify(proxy)`, no el proxy entero. Y es la prueba de una propiedad importante de los proxies: desde el código JavaScript, un proxy es indistinguible de un objeto normal.

> **Desde Python:** la trampa `get` se parece a `__getattr__`, pero se comporta como `__getattribute__`: `__getattr__` solo se llama cuando el atributo **no** existe, y `get` se llama **siempre**. Además, como `obj.x` y `obj['x']` son la misma operación en JavaScript, `get` hace también de `__getitem__`.

### Índices negativos: el `__getitem__` que faltaba

La lista de la compra de la lección «Polimorfismo y protocolos» no podía responder a `list[0]`: eso necesitaba un proxy. El ejemplo hace algo más: índices negativos como los de Python, sobre un array. La lección importante está en el primer intento: la clave que recibe la trampa nunca es un número. Llega como **string** (`temps[-1]` es `temps['-1']`, regla de la lección «Objetos literales») o como **símbolo**, cuando el lenguaje busca un protocolo, y `Number(símbolo)` lanza un error:

[[exercise:02-indices-negativos.md-]]

```text
naive[-1] → 22
🤔 spread → TypeError | Cannot convert a Symbol value to a number
temps[-1] → 22 | temps[-2] → 24
temps[0] → 14 | length → 5
spread → (5) [14, 17, 21, 24, 22]
métodos → 14 °C, 17 °C, 21 °C, 24 °C, 22 °C
¿es un array? → true
```

El spread leyó `naive[Symbol.iterator]` para obtener el iterador (lección «Protocolo iterable»), y la trampa ingenua intentó convertir ese símbolo en número. La versión correcta comprueba `typeof key === 'string'` antes de tratar la clave como índice, y deja todo lo demás a `Reflect.get`, que hace la lectura normal (lo verás en la sección «Reflect»). Los arrays ya tienen `at(-1)` para esto: el proxy es para entender el mecanismo.

## Validar: `set` y `deleteProperty`

La trampa `set(target, key, value, receiver)` intercepta **todas** las asignaciones, y `deleteProperty(target, key)` todos los `delete`. Son el sitio para validar: comprobar que la clave existe (una errata como `booking.gests = 2`, que en un objeto normal crearía una propiedad nueva sin avisar), que el valor tiene el tipo y el rango correctos, o que no se borra un campo obligatorio:

[[exercise:03-validar-con-set.md-]]

```text
reserva → {"name":"Familia Hernández","guests":6,"notes":"mesa junto a la ventana"}
⛔ RangeError: Valor no válido para guests: 0
⛔ RangeError: Valor no válido para guests: "6"
⛔ TypeError: Campo desconocido: gests
⛔ TypeError: No se puede borrar name: es obligatorio
reserva → {"name":"Familia Hernández","guests":6}
trampa que devuelve false → 2
```

`set` y `deleteProperty` deben devolver `true` si la operación funcionó. Si devuelven `false`, la operación se considera rechazada: en un script clásico, **en silencio** (la última línea del ejemplo); en código estricto (dentro de una clase o de un módulo), con un `TypeError` genérico. Lo más claro es lanzar tú el error, con un mensaje útil, y devolver `true` en el camino normal.

> **Desde Python:** `set` es `__setattr__` y `deleteProperty` es `__delattr__`. Rechazar las claves desconocidas es lo que en Python consigues con `__slots__`.

## Preguntar: `has` y `ownKeys`

Otras dos trampas interceptan las preguntas sobre el objeto. `has(target, key)` decide qué responde el operador `in`, así que un horario puede contestar a `14 in businessHours` sin guardar ninguna propiedad. `ownKeys(target)` decide qué claves ven `Object.keys`, `Object.entries`, `for…in`, `JSON.stringify` y `Reflect.ownKeys`; junto con `has` y `get`, permite que un objeto esconda sus claves internas:

[[exercise:04-has-y-ownkeys.md-]]

```text
14 in businessHours → true
20 in businessHours → false
9.5 in businessHours → false
Object.keys → (2) ['name', 'email']
JSON → {"name":"Lucía Méndez","email":"lucia@example.com"}
for…in → (2) ['name', 'email']
'_passwordHash' in user → false
user._passwordHash → undefined
```

Esconder no es proteger: quien tenga el objeto original lo ve todo, como verás en el ejemplo de la identidad. Hay más trampas (`defineProperty`, `getOwnPropertyDescriptor`, `getPrototypeOf`, `setPrototypeOf`, `isExtensible`, `preventExtensions`, `apply` y `construct`): una por cada operación interna del lenguaje, trece en total.

> **Desde Python:** `has` es `__contains__`. Pero en Python `x in obj` pregunta por **elementos** y `hasattr(obj, 'x')` por atributos; en JavaScript `in` solo pregunta por propiedades, y la trampa `has` lo intercepta.

## `Reflect`: hacer lo normal

Dentro de una trampa casi siempre hay que hacer, además de lo tuyo, la operación **normal**: leer de verdad, asignar de verdad. Para eso existe `Reflect`, un objeto con **un método por cada trampa**, con el mismo nombre y los mismos argumentos: `Reflect.get(target, key, receiver)`, `Reflect.set(target, key, value, receiver)`, `Reflect.has`, `Reflect.deleteProperty`, `Reflect.ownKeys`… Cada uno hace la operación sin trucos, y devuelve `true` o `false` donde los métodos de `Object` lanzarían un error o fallarían en silencio:

[[exercise:05-reflect.md-]]

```text
Reflect.get → Pozole rojo
Reflect.has → true
Reflect.ownKeys → (2) ['name', 'cents']
Reflect.set → true
Reflect.set en congelado → false
Reflect.defineProperty → false
Object.defineProperty → TypeError | Cannot define property extra, object is not extensible
cambios → (2) ['cents: 15000 → 16000', 'name: Pozole rojo → Pozole verde']
envío → 70 245
llamadas → (2) ['2 kg, local', '5 kg, nacional']
```

El patrón de reenvío es la forma de escribir trampas: haz tu trabajo (apuntar, validar, avisar) y termina con `return Reflect.trampa(...mismos argumentos)`. La última parte del ejemplo usa la trampa `apply`, que solo existe en los proxies de **funciones** e intercepta sus llamadas: aquí cuenta cuántas veces se calcula un envío y con qué argumentos.

> **Desde Python:** `Reflect.get`, `set`, `has` y `deleteProperty` son `getattr`, `setattr`, `hasattr` y `delattr`. La trampa `apply` recuerda a `__call__`, pero solo puede envolver una función: un objeto normal no se vuelve «llamable» con un proxy.

## Las sorpresas de los proxies

### Invariantes: lo que un proxy no puede ocultar

Un proxy puede inventar casi cualquier respuesta, salvo las que contradicen lo que el objetivo **garantiza**. Si una propiedad del objetivo es de solo lectura y no configurable (por ejemplo, porque el objeto está congelado), la trampa `get` debe devolver su valor real, `has` no puede negarla y `ownKeys` no puede omitirla. El motor comprueba estas reglas, llamadas **invariantes**, después de cada trampa, y lanza un `TypeError` si se incumplen:

[[exercise:06-invariantes.md-]]

```text
🐛 display.currency → TypeError: 'get' on proxy: property 'currency' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected 'mxn' but got 'MXN')
🐛 '_apiKey' in display → TypeError: 'has' on proxy: trap returned falsish for property '_apiKey' which exists in the proxy target as non-configurable
🐛 Object.keys(display) → TypeError: 'ownKeys' on proxy: trap result did not include '_apiKey'
✅ currency → MXN | ¿_apiKey? → false
✅ claves → (2) ['currency', 'country'] | JSON → {"currency":"MXN","country":"MX"}
```

Las invariantes existen para que nadie pueda usar un proxy para «descongelar» un objeto congelado ante el resto del código. La solución, cuando necesitas transformar, es que el objetivo **no** haga esas promesas: una copia sin congelar, o un objeto vacío desde cuyas trampas lees el original.

### `this` en los getters: el `receiver`

El tercer argumento de `get` (y el cuarto de `set`), `receiver`, es el objeto sobre el que se hizo la operación: normalmente, el propio proxy. Importa cuando la propiedad es un **getter**. Si la trampa devuelve `target[key]`, el getter se ejecuta con `this` = el objetivo, y sus lecturas internas (`this.name`, `this.currency`) se saltan el proxy. `Reflect.get(target, key, receiver)` ejecuta el getter con `this` = `receiver`, y esas lecturas también pasan por la trampa:

[[exercise:07-getters-y-receiver.md-]]

```text
🐛 currency → MXN
🐛 label → Café de Chiapas · 210.00 undefined
✅ label → Café de Chiapas · 210.00 MXN
🐛 con target[key] → label
✅ con Reflect.get → label, name, cents, currency
```

La regla práctica: dentro de una trampa, reenvía siempre con `Reflect` y pasa el `receiver`. Es la razón principal de que `Reflect` exista.

### Privados y ranuras internas

El caso contrario: hay objetos cuyos métodos **necesitan** que `this` sea el objetivo. Una clase con campos `#privados` falla a través de un proxy, aunque el proxy no tenga ni una trampa: el getter o el método se ejecuta con `this` = el proxy, y los privados no son propiedades (lección «Encapsulación»): viven en el objeto original, y el proxy no puede reenviarlos. Lo mismo les pasa a `Map`, `Set` y `Date`, que guardan sus datos en **ranuras internas** del objeto, que tampoco son propiedades:

[[exercise:08-privados-y-ranuras-internas.md-]]

```text
🐛 wallet.balance → TypeError | Cannot read private member #balanceCents from an object whose class did not declare it
🐛 wallet.deposit() → TypeError | Cannot read private member #balanceCents from an object whose class did not declare it
🐛 stock.get() → TypeError | Method Map.prototype.get called on incompatible receiver #<Map>
🐛 stock.size → TypeError | Method get Map.prototype.size called on incompatible receiver #<Map>
✅ wallet → $510.00
✅ stock → 12 | size → 2
```

La solución es que la trampa `get` lea los getters con el objetivo como `receiver` y devuelva los métodos **enlazados** al objetivo con `bind` (lección «La palabra clave this»). Tiene un precio: dentro de esos métodos, las lecturas ya no pasan por las trampas. Los arrays no tienen el problema, porque sus elementos y su `length` son propiedades normales.

### El proxy no es el objetivo

Un proxy es **otro objeto**. `proxy === target` es `false`, así que un `Set` o un `Map` que guarda uno no encuentra el otro, e `includes` tampoco. Y hay algo peor: quien conserve una referencia al **objetivo** puede cambiarlo directamente, sin pasar por ninguna trampa, y toda la validación desaparece:

[[exercise:09-el-proxy-no-es-el-objetivo.md-]]

```text
🐛 booking === raw → false
🐛 confirmed.has(booking) → false
🐛 tables.get(raw) → undefined
typeof, instanceof → object true
🐛 booking.guests → 250
⛔ RangeError: Invitados no válidos: 250
✅ safeBooking.guests → 2
✅ por id → true
```

Dos costumbres lo evitan. Crea el objetivo dentro de la llamada (`validated({ … })`, `new Proxy({ ...initialState }, …)`), para que la única referencia que circule sea el proxy. Y usa siempre ese mismo objeto en `Set`, `Map` y comparaciones, o compara por un dato como el `id`. No hay ninguna forma de preguntar «¿es esto un proxy?»: `typeof`, `instanceof` y `Array.isArray` ven a través de él.

## Un mini store reactivo

Juntando la trampa `set` con el patrón observador de la lección «Patrones de diseño» sale un **store reactivo**: un estado que avisa solo de cada cambio, sin que nadie tenga que llamar a `emit()`. Asignar `cart.state.items += 1` ya es suficiente para que la insignia del carrito y el registro de cambios se enteren:

[[exercise:10-mini-store-reactivo.md-]]

```text
▶ añadir un café
  🛒 insignia del carrito: 1
  📝 items: 0 → 1
  📝 totalCents: 0 → 21000
▶ el mismo total otra vez (no avisa)
▶ la insignia se da de baja
  📝 items: 1 → 2
  📝 coupon: null → "BUENFIN"
▶ quitar el cupón
  📝 coupon: "BUENFIN" → undefined
▶ un array dentro del estado
  📝 notes: undefined → []
  notas → 1 (nadie se enteró del push)
```

El store tiene un límite, visible en las últimas líneas: el proxy solo ve las asignaciones a **sus** propiedades. `cart.state.notes.push('regalo')` lee `notes` a través del proxy, pero `push` modifica el array, que es otro objeto sin proxy. Las librerías reactivas como Vue 3 lo resuelven envolviendo en otro proxy cada objeto anidado en el momento en que la trampa `get` lo lee. En el capítulo 6 conectarás un store así con el DOM, para que cada cambio redibuje la parte de la página que depende de él.

## Los métodos mágicos de Python, con `Proxy`

| Python | Trampa del `Proxy` | Operación que la dispara |
|--------|--------------------|--------------------------|
| `__getattribute__`, `__getattr__`, `__getitem__` | `get` | `obj.x`, `obj[x]` |
| `__setattr__`, `__setitem__` | `set` | `obj.x = v`, `obj[x] = v` |
| `__delattr__`, `__delitem__` | `deleteProperty` | `delete obj.x` |
| `__contains__`, `hasattr` | `has` | `x in obj` |
| `__dir__` | `ownKeys` | `Object.keys`, `for…in`, `JSON.stringify` |
| `__call__` | `apply` (solo funciones) | `fn(…)` |
| `__call__` de una metaclase (interceptar la creación) | `construct` (solo funciones) | `new Fn(…)` |
| `getattr`, `setattr`, `hasattr`, `delattr` | `Reflect.get`, `set`, `has`, `deleteProperty` | la operación normal |

## Bestiario

- **El proxy que lanza al leer un objeto congelado.**
  Síntoma: `TypeError: 'get' on proxy: property … is a read-only and non-configurable data property…` (o mensajes parecidos de `has` y `ownKeys`).
  Causa: la trampa contradice una garantía del objetivo (propiedad no configurable u objeto no extensible), y el motor comprueba esas invariantes.
  Solución: usa como objetivo un objeto que no esté congelado (una copia, o uno vacío desde cuyas trampas lees el original).
  → [ver ejemplo](06-invariantes.md)
- **El getter que no ve el proxy.**
  Síntoma: un getter devuelve `undefined` o datos sin transformar a través del proxy, aunque las propiedades sueltas sí funcionan.
  Causa: la trampa devuelve `target[key]`, que ejecuta el getter con `this` = el objetivo.
  Solución: `return Reflect.get(target, key, receiver)`.
  → [ver ejemplo](07-getters-y-receiver.md)
- **El proxy que rompe una clase, un `Map` o una fecha.**
  Síntoma: `Cannot read private member #x from an object whose class did not declare it` o `Method Map.prototype.get called on incompatible receiver`, incluso con un proxy sin trampas.
  Causa: los métodos se ejecutan con `this` = el proxy, que no tiene los privados ni las ranuras internas del objetivo.
  Solución: en la trampa `get`, devuelve los métodos enlazados al objetivo (`value.bind(target)`) y lee los getters con el objetivo como `receiver`.
  → [ver ejemplo](08-privados-y-ranuras-internas.md)
- **El proxy que no se encuentra y la validación que se salta.**
  Síntoma: `set.has(proxy)` es `false` aunque el `Set` tiene el objeto; un valor no válido aparece en un objeto validado.
  Causa: el proxy y el objetivo son objetos distintos, y quien tiene el objetivo lo cambia sin pasar por las trampas.
  Solución: crea el objetivo dentro de la llamada para que solo circule el proxy, y usa siempre el mismo objeto (o un `id`) para comparar.
  → [ver ejemplo](09-el-proxy-no-es-el-objetivo.md)

## Resumen

- `new Proxy(target, handler)` envuelve un objeto; las trampas del `handler` interceptan sus operaciones y las que faltan van al objetivo.
- `get` ve todas las lecturas (también las de símbolos y las del lenguaje); las claves llegan como strings o símbolos.
- `set` y `deleteProperty` validan; deben devolver `true` (con `false`, fallo silencioso en scripts clásicos).
- `has` intercepta `in`; `ownKeys` decide qué claves ven `Object.keys`, `for…in` y JSON; `apply` intercepta las llamadas a una función.
- `Reflect` tiene un método por trampa que hace la operación normal: reenvía con él y pasa el `receiver`.
- Las invariantes impiden mentir sobre un objetivo congelado; los privados y las ranuras internas de `Map`, `Set` y `Date` necesitan `this` = el objetivo.
- El proxy no es el objetivo: identidad distinta, y el objetivo a la vista se salta las trampas.
- Un store reactivo es un proxy cuya trampa `set` avisa a los suscriptores.

## Para profundizar

- [MDN: Proxy](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [javascript.info: Proxy y Reflect](https://es.javascript.info/proxy)
- [MDN: Reflect (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [Vue.js: la reactividad en profundidad (en inglés)](https://vuejs.org/guide/extras/reactivity-in-depth.html)
