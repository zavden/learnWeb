# Promesas

## Por qué importa

La lección anterior terminó con una lista de problemas de los callbacks: pirámides de anidamiento, errores que hay que propagar a mano en cada nivel, errores que escapan del `try/catch` y, sobre todo, el control cedido a otro código, que puede llamarte dos veces o ninguna.

Una **promesa** le da la vuelta a la relación. En vez de pasarle tu callback a la operación, la operación te **devuelve un objeto** que representa su resultado futuro. Ese objeto se cumple o se rechaza **una sola vez**, se puede guardar, pasar a otras funciones y encadenar, y sus errores viajan solos hasta el primer `catch`. Casi toda la asincronía moderna de JavaScript (`fetch`, `async/await`, las APIs del navegador) está construida sobre promesas.

## Un valor que llegará

Una promesa nace **pendiente** (*pending*) y se **asienta** (*settles*) una sola vez, de una de dos formas: **cumplida** (*fulfilled*) con un valor, o **rechazada** (*rejected*) con un motivo, normalmente un `Error`. Después ya no cambia nunca.

```text
                 ┌── resolve(valor) ──►  fulfilled (cumplida)  ──► then(fn) recibe el valor
   pending  ─────┤
 (pendiente)     └── reject(error) ───►  rejected (rechazada)  ──► catch(fn) recibe el error
```

Con `then(fn)` dices «cuando se cumpla, llama a `fn` con el valor»; con `catch(fn)`, «si se rechaza, llama a `fn` con el error». La consola de LearnWeb, como la de Chrome, muestra el estado de una promesa al imprimirla:

[[exercise:01-estados-de-una-promesa.md-]]

```text
recién creada → Promise {<pending>}
Promise.resolve(0) → Promise {<fulfilled>: 0}
fin del script
solo cuenta la primera → PAY-1001
then → unidades de café: 12
ahora → Promise {<fulfilled>: 12}
catch → Producto desconocido: tamarindo
```

`Promise.resolve(valor)` y `Promise.reject(error)` crean promesas ya asentadas; son útiles para devolver una promesa cuando ya tienes el dato (una caché, por ejemplo).

### `then` siempre llega después

Dos reglas de tiempo, que el ejemplo muestra con números de orden. La primera: la función que recibe `new Promise` (el **ejecutor**) se ejecuta en el acto, dentro de la llamada; la operación **empieza en cuanto creas la promesa**. La segunda: los callbacks de `then` y `catch` son siempre **microtareas** (lección «El event loop»), aunque la promesa ya esté cumplida. El código que sigue a un `then` se ejecuta antes que su callback, siempre, tenga el dato en caché o no:

[[exercise:02-then-siempre-es-asincrono.md-]]

```text
1. antes de crear la promesa
2. ejecutor: empiezo el cobro (síncrono)
3. después de then
4. fin del script
5. then sobre una promesa ya cumplida → PAY-881
6. precio (desde la caché) → 210
7. precio (desde la «red») → 95
```

> **Desde Python:** aquí está la diferencia más importante entre las dos asincronías. Una corrutina de Python (`fetch_order()` sin `await`) es un objeto **dormido**: no ejecuta ni una línea hasta que alguien la espera con `await` o la programa con `asyncio.create_task`. Una promesa de JavaScript ya está en marcha desde que existe. Lo verás de nuevo en «async/await»: llamar a una función asíncrona sin `await` la **arranca**.

## Encadenar

`then` devuelve una promesa **nueva**, que depende de lo que haga su callback:

| El callback de `then`… | La promesa que devuelve `then`… |
|------------------------|---------------------------------|
| devuelve un valor `v` | se cumple con `v` |
| devuelve una promesa `p` | espera a `p` y se asienta igual que ella |
| lanza un error `e` | se rechaza con `e` |
| no devuelve nada | se cumple con `undefined` |

La segunda fila es la que importa: si un paso devuelve otra promesa, el siguiente `then` **espera** a que se asiente. Así, varios pasos asíncronos que dependen unos de otros se escriben uno debajo de otro, sin anidar. Es el pago en cinco pasos de la lección anterior, con una API que devuelve promesas: la pirámide se vuelve una cadena plana, con un solo `catch` para todos los pasos.

[[exercise:03-encadenar-then.md-]]

```text
¿then devuelve otra promesa? → true
▶ cliente C-1
  1. carrito → 2 producto(s), $305.00
  2. stock reservado → R-202
  3. cobrado → PAY-C-1-30500
  4. envío creado → MX-C-1-77
  5. email enviado
  ✅ pedido completado (MX-C-1-77)
▶ cliente C-2
  1. carrito → 1 producto(s), $180.00
  ⛔ pago fallido: sin stock de «mole poblano»
```

Los pasos que necesitan datos de pasos anteriores (el total del carrito, en el cobro) los toman de una variable de fuera, `order`. Es una incomodidad real de las cadenas de `then`, y una de las razones de que exista `async/await`.

### El `return` olvidado

La última fila de la tabla es la trampa más común con promesas. Si un `then` con llaves llama a algo que devuelve una promesa pero no escribe `return`, el callback devuelve `undefined`: la cadena no espera a esa operación, el siguiente `then` recibe `undefined`, y la operación sigue suelta por su cuenta:

[[exercise:04-olvidar-el-return.md-]]

```text
▶ sin return
  🐛 reserva → undefined (y el almacén aún no ha terminado)
    📦 (el almacén termina la reserva de 2 productos)
▶ con return
    📦 (el almacén termina la reserva de 2 productos)
  ✅ reserva → R-202 (el almacén ya terminó)
```

Una flecha de una sola expresión, `(items) => reserveStock(items)`, devuelve su expresión sin escribir `return` (lección «Formas de función»); con llaves, el `return` es obligatorio.

## Errores

Un `throw` dentro de un `then` (o cualquier error de JavaScript, como el `SyntaxError` de un `JSON.parse`) **rechaza** la promesa que devolvió ese `then`. El rechazo se salta todos los `then` siguientes hasta el primer `catch`, como una excepción que sube por la pila hasta el primer `except`. Y un `catch` que devuelve un valor **recupera** la cadena: lo que viene después se cumple con ese valor.

[[exercise:05-errores-y-catch.md-]]

```text
1. catch → SyntaxError
2. catch → El pedido P-732 necesita revisión manual
3. la cadena sigue → en revisión
4. lo atrapa el catch de después → TypeError
```

`catch(fn)` es exactamente `then(undefined, fn)`. Por eso `then(ok, fallo)` tiene una sorpresa: `fallo` solo ve los rechazos de **antes**, no los errores que lance el propio `ok`. Pon el `catch` aparte, al final.

### `finally`

`finally(fn)` se ejecuta tanto si la promesa se cumple como si se rechaza: es el sitio para ocultar un indicador de carga o cerrar una conexión. No recibe argumentos y deja pasar el resultado tal cual, salvo que lance un error, que entonces sustituye al resultado:

[[exercise:06-finally.md-]]

```text
⏳ (indicador de carga visible) cliente C-1
  📋 pedidos → P-1001, P-1002, P-1003
  ✋ (indicador de carga oculto)
⏳ (indicador de carga visible) cliente C-404
  ⛔ Cliente sin pedidos visibles
  ✋ (indicador de carga oculto)
finally deja pasar el valor → PAY-77
un throw en finally gana → no se pudo cerrar la sesión de pago
```

### El rechazo que nadie escucha

Una promesa rechazada sin ningún `catch` es el equivalente asíncrono de un error sin atrapar. El navegador la anuncia en la consola con `Uncaught (in promise)`, y quien esperaba el resultado no se entera. Igual que con los callbacks, un `try/catch` alrededor de la llamada no sirve: la llamada solo devuelve una promesa pendiente, y el rechazo llega después.

[[exercise:07-rechazo-sin-manejar.md-]]

```text
🐛 try: ningún error… todavía
Uncaught (in promise) Error: Tarjeta **** 0002 rechazada: fondos insuficientes
✅ catch al final de la cadena → Tarjeta **** 0002 rechazada: fondos insuficientes
✅ cobrado → PAY-4242
```

La regla: toda cadena termina en un `catch`, o se **devuelve** a quien la llamó para que la termine él. Para registrar los rechazos que se escapen, el navegador lanza el evento `unhandledrejection` en `window` (los eventos se estudian en el capítulo 6).

## Crear promesas

Hasta aquí has usado promesas que te daban hechas. Para **fabricar** una, `new Promise(ejecutor)`: el ejecutor recibe dos funciones, `resolve` y `reject`, arranca la operación y, cuando termina, llama a una de las dos. Un `throw` dentro del ejecutor también rechaza la promesa. Con eso se escriben dos herramientas que usarás en todo el módulo: `wait(ms)`, una promesa que se cumple pasado un tiempo, y `promisify`, que convierte una función con callback «error primero» en una que devuelve promesas:

[[exercise:08-crear-promesas.md-]]

```text
wait(100) → esperó ≥ 100 ms: true
getOrder promisificada → Sofía Ríos
rechazo → Pedido P-999 no encontrado
throw en el ejecutor → rechazo: SyntaxError
```

### Envolver una promesa en otra

`new Promise` sirve para envolver lo que **no** es una promesa: un temporizador, un callback, un evento. Envolver algo que ya devuelve una promesa es un antipatrón conocido (*explicit construction anti-pattern*): el código es más largo y basta olvidar reenviar el rechazo para que la promesa de fuera se quede **pendiente para siempre** y el error salga como `Uncaught (in promise)`:

[[exercise:09-antipatron-new-promise.md-]]

```text
🐛 envuelta, camino feliz → 30500
Uncaught (in promise) Error: Pedido P-999 no encontrado
✅ sin envoltorio, el error llega → Pedido P-999 no encontrado
🐛 la envuelta, 300 ms después → Promise {<pending>}
```

### `Promise.withResolvers` y `Promise.try`

Dos incorporaciones recientes. `Promise.withResolvers()` (Chrome 119, 2023) devuelve `{ promise, resolve, reject }` por separado, para cuando quien cumple la promesa no es quien la crea: una confirmación que se resuelve cuando el usuario pulsa un botón, una señal de «el SDK ya cargó». `Promise.try(fn)` (Chrome 128, 2024) ejecuta `fn` en el acto y convierte su resultado, o su error **síncrono**, en una promesa, de modo que un solo `catch` cubre los dos tipos de fallo:

[[exercise:10-withresolvers-y-promise-try.md-]]

```text
❓ ¿Vaciar el carrito (3 productos)? [Confirmar] [Cancelar]
sin Promise.try → el error sale como throw síncrono: RangeError
un solo catch para los dos tipos de error → RangeError
cupón aplicado → 15 %
respuesta → cancelado
```

Una última pieza del mecanismo: `then` y `await` aceptan cualquier objeto con un método `then` (un ***thenable***) y lo tratan como una promesa. Por eso conviven promesas de distintas librerías, y por eso no conviene que tus objetos tengan un método llamado `then` por casualidad.

> **Desde Python:** una promesa se parece a un `asyncio.Future`, con algunas diferencias:

| Python (`asyncio`) | JavaScript |
|--------------------|------------|
| `fut = loop.create_future()` | `const { promise, resolve, reject } = Promise.withResolvers()` |
| `fut.set_result(v)`, `fut.set_exception(e)` | `resolve(v)`, `reject(e)` |
| `fut.add_done_callback(fn)` (no encadena) | `promise.then(fn)` (devuelve otra promesa) |
| `asyncio.sleep(s)` | `wait(ms)`, escrito con `new Promise` y `setTimeout` |
| «Task exception was never retrieved» | `Uncaught (in promise)` |
| una corrutina no hace nada hasta el `await` | una promesa ya está en marcha al crearse |

## Bestiario

- **La cadena que no espera.**
  Síntoma: un `then` recibe `undefined` en vez del resultado del paso anterior, y se ejecuta antes de que ese paso termine.
  Causa: el `then` anterior tiene llaves y no escribe `return`: la promesa que creó queda suelta.
  Solución: `return` delante de cada llamada que devuelva una promesa (o una flecha de una sola expresión).
  → [ver ejemplo](04-olvidar-el-return.md)
- **`Uncaught (in promise)`.**
  Síntoma: el error aparece en la consola aunque la llamada está en un `try/catch`, y la interfaz se queda esperando.
  Causa: la promesa se rechazó y nadie le puso un `catch`; el `try` síncrono terminó antes del rechazo.
  Solución: termina cada cadena en `catch`, o devuélvela a quien la llamó; con `async/await`, `await` dentro del `try`.
  → [ver ejemplo](07-rechazo-sin-manejar.md)
- **La promesa que nunca termina.**
  Síntoma: una función que envuelve otra promesa en `new Promise` funciona en el camino feliz, pero ante un error se queda pendiente para siempre y aparece un `Uncaught (in promise)`.
  Causa: el ejecutor llama a `resolve` dentro de un `then` y no reenvía el rechazo a `reject`.
  Solución: no envuelvas promesas; devuelve la cadena (`return getOrder(id).then(…)`).
  → [ver ejemplo](09-antipatron-new-promise.md)

## Resumen

- Una promesa es un resultado futuro: pendiente → cumplida (valor) o rechazada (error), una sola vez.
- El ejecutor de `new Promise` se ejecuta en el acto; los callbacks de `then`/`catch`/`finally` son siempre microtareas.
- `then` devuelve una promesa nueva: con lo que devuelve su callback, o esperando a la promesa que devuelve.
- Un `throw` en cualquier paso rechaza la cadena hasta el primer `catch`; un `catch` que devuelve un valor la recupera.
- Escribe `return` en los `then` con llaves y termina cada cadena en `catch`.
- `new Promise` solo para envolver APIs que no son promesas (`wait`, `promisify`); nunca alrededor de otra promesa.
- `Promise.withResolvers()` separa la promesa de sus funciones; `Promise.try(fn)` convierte también los errores síncronos en rechazos.
- A diferencia de las corrutinas de Python, una promesa está en marcha desde que se crea.

## Para profundizar

- [MDN: usar promesas](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Using_promises)
- [javascript.info: promesas, encadenamiento y manejo de errores](https://es.javascript.info/promise-basics)
- [MDN: Promise.withResolvers (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)
- [MDN: Promise.try (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try)
- [Python: Futures en asyncio](https://docs.python.org/es/3/library/asyncio-future.html)
