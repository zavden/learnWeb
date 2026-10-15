# async/await

## Por qué importa

Las promesas resolvieron los problemas de fondo de los callbacks, pero una cadena de `then` todavía se lee de forma extraña: cada paso es una función, los resultados intermedios hay que guardarlos fuera, y un bucle con pasos asíncronos se vuelve recursión. `async/await` es una sintaxis para **escribir código con promesas como si fuera síncrono**: de arriba abajo, con variables normales, `for`, `if` y `try/catch`.

No es un mecanismo nuevo. Debajo siguen estando las promesas y el event loop, y por eso las trampas de esta lección son de las dos clases: las que vienen de olvidar que hay promesas debajo (un `forEach` que no espera, un `return` sin `await` dentro de un `try`) y las que vienen de escribir en fila lo que podía ir a la vez. Si sabes `async def` y `await` de Python, la sintaxis es la misma; lo que cambia es **cuándo empieza** el trabajo.

## `async`: siempre una promesa

Una función con `async` delante **siempre devuelve una promesa**: lo que devuelva con `return` la cumple, y lo que lance con `throw` la rechaza. Dentro de ella, `await promesa` **pausa la función** hasta que la promesa se asienta y entonces devuelve su valor (o lanza su error). Mientras la función está pausada, el resto del programa sigue: la llamada ya volvió con una promesa pendiente.

[[exercise:01-async-y-await.md-]]

```text
getStock() → Promise {<fulfilled>: 12}
1. antes de llamar
2. P-1001: empieza (hasta el primer await, todo es síncrono)
3. la llamada volvió enseguida con → Promise {<pending>}
4. fin del script: prepareOrder sigue pausada
getPrice() rechazada → Sin precio para tamarindo
5. P-1001: continúa tras el await (50 ms después)
6. P-1001: stock → 12
7. then → P-1001 listo para enviar
```

`await` no bloquea nada: pausa **una** función y devuelve el control al event loop. Lo que viene detrás de un `await` es, literalmente, un `then`: se ejecuta como microtarea cuando la promesa se asienta.

```text
async function prepareOrder(id) {        function prepareOrder(id) {
  log('empieza');                          log('empieza');
  await wait(50);                 ≈        return wait(50).then(() => {
  log('continúa');                           log('continúa');
  return `${id} listo`;                      return `${id} listo`;
}                                          });
                                         }
```

### Por dentro: generadores y un planificador

Si hiciste el módulo 6, esto te sonará. En la lección «Generadores» viste que un generador se pausa en cada `yield` y se reanuda con `next(valor)`, y que antes de `async/await` algunas librerías lo usaban para escribir código asíncrono «en fila». Este es el truco entero: un generador que entrega promesas con `yield` y un conductor que, cuando cada promesa se cumple, reanuda el generador con su valor.

```js
function run(generatorFunction) {
  const generator = generatorFunction();
  return new Promise((resolve, reject) => {
    function step(method, input) {
      let result;
      try {
        result = generator[method](input); // next(valor) o throw(error)
      } catch (error) {
        return reject(error);
      }
      if (result.done) return resolve(result.value);
      Promise.resolve(result.value).then((value) => step('next', value), (error) => step('throw', error));
    }
    step('next');
  });
}

run(function* () {
  const cart = yield api.getCart('C-1'); // ≈ await
  const reservation = yield api.reserveStock(cart);
  return reservation;
});
```

`async function` es esa idea convertida en sintaxis: `function*` → `async function`, `yield` → `await`, y el conductor lo pone el motor. Es también el `CoopScheduler` del módulo 6 (top95, «planificador cooperativo»), donde las tareas cedían el turno con `yield sleep(…)`; aquí el planificador es el event loop.

## El pago, de arriba abajo

El pago en cinco pasos de las dos lecciones anteriores, con la misma API: cada paso es una línea con `await`, cada resultado es una variable normal (ya no hace falta el objeto `order` de fuera) y los errores se manejan con `try/catch/finally`, igual que en código síncrono. Un `await` sobre una promesa rechazada **lanza** en esa línea.

[[exercise:02-checkout-con-await.md-]]

```text
▶ cliente C-1
  1. carrito → 2 producto(s), $305.00
  2. stock reservado → R-202
  3. cobrado → PAY-C-1-30500
  4. envío creado → MX-C-1-77
  5. email enviado
  ✅ pedido completado (MX-C-1-77)
  🔓 carrito desbloqueado
▶ cliente C-2
  1. carrito → 1 producto(s), $180.00
  ⛔ pago fallido: sin stock de «mole poblano»
  🔓 carrito desbloqueado
```

### `return await` dentro de un `try`

Una función `async` que hace `return promesa` sin `await` sale del `try` en el acto, con la promesa todavía pendiente. Si esa promesa se rechaza, lo hace cuando la función ya no está dentro del `try`, y su `catch` no se entera. Con `return await`, la función espera **dentro** del bloque:

[[exercise:03-return-sin-await-en-try.md-]]

```text
🐛 sin await → el error escapó del catch de dentro: Tarjeta **** 0002 rechazada
✅ con return await → pago contra entrega (Tarjeta **** 0002 rechazada)
✅ tarjeta buena → PAY-4242
```

Fuera de un `try`, las dos formas dan el mismo resultado; dentro, solo `return await` funciona. La regla más sencilla: en una función `async`, escribe siempre `return await`.

## Llamar sin `await`: ya está en marcha

Esta es la diferencia más importante con Python. En JavaScript, **llamar** a una función `async` la arranca en el acto: se ejecuta hasta su primer `await` antes de que la llamada vuelva, y sigue sola cuando le toca. El `await` no arranca nada; solo **espera** a algo que ya está en marcha. Por eso se puede lanzar varias operaciones y esperarlas después:

[[exercise:04-llamar-sin-await.md-]]

```text
▶ llamar sin await
  📨 P-1: empiezo a generar la factura
  la llamada volvió: la factura ya se está generando
  📨 P-1: factura enviada
  resultado → FAC-P-1
▶ una detrás de otra
  📨 P-2: empiezo a generar la factura
  📨 P-2: factura enviada
  🏷️ P-2: empiezo a imprimir la etiqueta
  🏷️ P-2: etiqueta impresa
  tardó ≥ 200 ms → true
▶ las dos a la vez
  📨 P-3: empiezo a generar la factura
  🏷️ P-3: empiezo a imprimir la etiqueta
  📨 P-3: factura enviada
  🏷️ P-3: etiqueta impresa
  resultados → (2) ['FAC-P-3', 'ETQ-P-3'] | tardó < 180 ms → true
```

> **Desde Python:** `send_invoice('P-1')` sin `await` crea una corrutina **dormida** que no ejecuta ni una línea; si nadie la espera, Python avisa con `RuntimeWarning: coroutine 'send_invoice' was never awaited`. Para lanzarla sin esperarla hay que crear una tarea:

```python
import asyncio

async def main():
    invoice = asyncio.create_task(send_invoice('P-3'))  # arranca
    label = asyncio.create_task(print_label('P-3'))     # arranca
    results = await asyncio.gather(invoice, label)      # espera a las dos
```

En JavaScript la llamada misma es el `create_task`. La otra cara: una promesa lanzada y nunca esperada ni atrapada es una promesa **suelta**, y si se rechaza, sale como `Uncaught (in promise)`.

## En fila o a la vez

`await` hace muy fácil escribir en fila cosas que podrían ir a la vez. Un `await` dentro de un bucle espera a que termine cada operación antes de **lanzar** la siguiente: tres peticiones independientes de 120 ms tardan 360. Si no dependen entre sí, lánzalas todas (un `map` crea las promesas, ya en marcha) y espéralas juntas con `Promise.all`:

[[exercise:05-await-en-bucle.md-]]

```text
🐛 secuencial → (3) ['pagado', 'enviado', 'pagado']
   tardó ≥ 360 ms (3 × 120) → true (≈ 362 ms; varía)
✅ en paralelo → (3) ['pagado', 'enviado', 'pagado']
   tardó < 240 ms (≈ una sola) → true (≈ 121 ms; varía)
```

El bucle en fila es lo correcto cuando cada paso depende del anterior (el cursor de la página siguiente), cuando el orden importa o cuando el servidor limita las peticiones simultáneas.

### `forEach` no espera

El error contrario: `forEach` con un callback `async`. `forEach` llama al callback por cada elemento e **ignora** lo que devuelve, que son promesas; termina en el acto y devuelve `undefined`, así que ni siquiera se puede esperar. El código que sigue lee el total antes de que llegue ningún dato:

[[exercise:06-foreach-con-async.md-]]

```text
🐛 total tras forEach → 0
🐛 …y 100 ms después, cuando ya nadie lo mira → 48500
✅ for…of + await → 48500
✅ Promise.all + map → 48500
```

Los arreglos son los dos de la sección anterior: `for…of` con `await` (en fila) o `Promise.all` con `map` (a la vez). Lo mismo pasa con `filter`, `some` o `reduce` y un callback `async`: ninguno espera.

## Reintentos con `await`

En el módulo «Funciones y ámbito», el ejemplo profesional «Reintentos con espera» tenía que simular el tiempo con un planificador hecho a mano, porque aún no había promesas. Con `await`, el mismo algoritmo (espera exponencial con *jitter*, solo los errores transitorios se reintentan) es un bucle `for` con un `await wait(retraso)`. Y como `wait` acepta una señal, un `AbortSignal.timeout` pone un presupuesto de tiempo al conjunto de intentos:

[[exercise:07-reintentos-con-await.md-]]

```text
▶ ana@example.com
  ✗ intento 1: 503 servicio no disponible · reintento en 32 ms
  ✗ intento 2: 503 servicio no disponible · reintento en 80 ms
  ✗ intento 3: 503 servicio no disponible · reintento en 183 ms
  ✓ enviado → msg-4
▶ pedro@example
  ⛔ no se reintenta → 550 dirección rechazada: pedro@example
▶ luis@example.com
  ✗ intento 1: 503 servicio no disponible · reintento en 36 ms
  ✗ intento 2: 503 servicio no disponible · reintento en 76 ms
  ⏰ presupuesto de 100 ms agotado: se deja para más tarde
```

Fíjate en el `return await task()` dentro del `try`: sin el `await`, el `catch` no vería los fallos (ejemplo 3).

## Generadores asíncronos y `for await…of`

Un **generador asíncrono** (`async function*`) combina las dos ideas: puede usar `await` dentro y entrega valores con `yield`, que llegan con el tiempo. Se recorre con **`for await…of`**, que espera a cada valor. El protocolo es el de la lección «Protocolo iterable» con una promesa en medio: `next()` devuelve una promesa de `{ value, done }`, y un objeto es recorrible con `for await` si tiene un método `[Symbol.asyncIterator]()`.

Es la forma natural de leer datos que llegan por partes. El paginador por cursores del módulo 6 (top95, «paginador con cursores») prometía que, con una API asíncrona, «la estructura del código no cambia». Aquí está: `function*` pasa a `async function*`, cada petición lleva un `await`, y se recorre con `for await`. El reintento, el `finally` que cuenta las páginas y el `break` que cierra el generador funcionan igual:

[[exercise:08-generadores-asincronos.md-]]

```text
▶ los 3 primeros pedidos cancelados
  ↻ 503 Servicio no disponible: reintento
  (búsqueda: 2 página(s) leída(s))
  resultado → (3) ['P-1002', 'P-1006', 'P-1010'] | peticiones → 3 (una falló y se reintentó)
▶ el historial completo, con Symbol.asyncIterator
  (historial: 5 página(s) leída(s))
  pedidos → 23 | peticiones → 5
▶ Array.fromAsync: todas las páginas en un array
  (exportación: 5 página(s) leída(s))
  tamaños → (5) [5, 5, 5, 5, 3] | peticiones → 5
```

Una diferencia con el módulo 6: allí la búsqueda era `items(api).filter(…).take(3)`. Los *helpers* de iteradores (`filter`, `map`, `take`…) solo existen para iteradores **síncronos**; los asíncronos todavía son una propuesta, así que aquí la búsqueda es un `for await` con `break`. `Array.fromAsync(iterable)` (Chrome 121) es el `Array.from` asíncrono. `for await…of` también acepta un iterable normal de promesas (un array de peticiones) y las espera en orden.

> **Desde Python:** `async function*` es `async def` con `yield`; `for await (const x of it)` es `async for x in it`; `[Symbol.asyncIterator]()` es `__aiter__`, y `Array.fromAsync(it)` es `[x async for x in it]`.

## `await using`

En la lección «Symbol» viste `using`, que llama al `[Symbol.dispose]()` de un recurso al salir del bloque. Su versión asíncrona, **`await using`** (Chrome 134, 2025), llama a `[Symbol.asyncDispose]()` y **espera** a que la limpieza termine antes de seguir: cerrar una conexión que necesita confirmación del servidor, vaciar un búfer a disco. Los recursos se liberan en orden inverso y también cuando hay un error:

[[exercise:09-await-using.md-]]

```text
▶ salida normal
  🔌 abro ventas
  🔌 abro inventario
  consulta → ventas ← total de octubre
  consulta → inventario ← productos agotados
  🔌 cierro inventario (confirmado por el servidor)
  🔌 cierro ventas (confirmado por el servidor)
  resultado → informe listo
▶ con un error
  🔌 abro ventas
  🔌 cierro ventas (confirmado por el servidor)
  ⛔ consulta prohibida en ventas (la conexión ya estaba cerrada)
```

> **Desde Python:** es `async with`, y `[Symbol.asyncDispose]()` hace de `__aexit__`. `AsyncDisposableStack` es `contextlib.AsyncExitStack`.

## `await` fuera de una función

Hasta aquí, cada ejemplo envolvía su código en `async function main() { … }`, porque en un script normal `await` solo se permite dentro de funciones `async`. En los **módulos** (`<script type="module">`, que se estudian en el módulo 8) se puede usar `await` en el nivel superior (*top-level await*). LearnWeb lo detecta y carga el script como módulo automáticamente, y eso trae otras diferencias que el ejemplo enseña: un `var` de nivel superior no acaba en `window`, `this` vale `undefined` y todo el código está en modo estricto.

[[exercise:10-await-en-el-nivel-superior.md-]]

```text
1. empieza el módulo
2. ajustes cargados → {currency: 'MXN', taxRate: 0.16}
3. pedidos y clientes → 42 7
¿un var de nivel superior acaba en window? → false
this en el nivel superior → undefined
¿modo estricto? → true
```

## De Python a JavaScript

| Python (`asyncio`) | JavaScript |
|--------------------|------------|
| `async def f():` | `async function f() {}`, `async () => {}`, `async metodo() {}` |
| `await x` | `await x` |
| `asyncio.run(main())` | nada: el event loop ya está en marcha (o *top-level await* en un módulo) |
| `f()` sin `await`: corrutina dormida | `f()` sin `await`: **ya está en marcha** |
| `asyncio.create_task(f())` | `f()` (guarda la promesa y espérala después) |
| `await asyncio.gather(a(), b())` | `await Promise.all([a(), b()])` |
| `await asyncio.sleep(0.1)` | `await wait(100)` |
| `async with recurso:` | `await using recurso = …` |
| `async for x in agen:` | `for await (const x of agen)` |
| `async def` con `yield` | `async function*` |

## Bestiario

- **El `catch` que no ve el error.**
  Síntoma: una función `async` con `try/catch` devuelve el resultado de otra promesa, y cuando esta falla, el error sale de la función en vez de llegar a su `catch`.
  Causa: `return promesa` sin `await` sale del `try` antes de que la promesa se rechace.
  Solución: `return await promesa` dentro de `try/catch` y `try/finally` (o siempre).
  → [ver ejemplo](03-return-sin-await-en-try.md)
- **El bucle lento.**
  Síntoma: una lista de peticiones independientes tarda la suma de todas.
  Causa: el `await` dentro del bucle espera a cada una antes de lanzar la siguiente.
  Solución: lánzalas todas con `map` y espéralas con `await Promise.all(...)`; deja el bucle en fila para pasos que dependen unos de otros.
  → [ver ejemplo](05-await-en-bucle.md)
- **El `forEach` que no espera.**
  Síntoma: después de un `forEach` con callback `async`, los resultados están vacíos o a medias.
  Causa: `forEach` ignora las promesas que devuelve el callback y termina en el acto; no hay nada que esperar.
  Solución: `for…of` con `await` (en fila) o `await Promise.all(lista.map(async …))` (a la vez).
  → [ver ejemplo](06-foreach-con-async.md)

## Resumen

- Una función `async` siempre devuelve una promesa; `return` la cumple, `throw` la rechaza.
- `await` pausa solo esa función; lo que viene detrás es un `then` que se ejecuta como microtarea.
- Con `await`, los errores se manejan con `try/catch/finally`; dentro de un `try`, escribe `return await`.
- Llamar a una función `async` la arranca en el acto (en Python haría falta `create_task`); `await` solo espera.
- `await` en un bucle va en fila; `Promise.all(lista.map(…))` va a la vez; `forEach` no espera nunca.
- `async function*` + `for await…of` + `[Symbol.asyncIterator]` recorren datos que llegan por partes.
- `await using` + `[Symbol.asyncDispose]` es el `async with` de Python (Chrome 134).
- `await` en el nivel superior solo existe en los módulos.

## Para profundizar

- [MDN: async function](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/async_function)
- [javascript.info: async/await](https://es.javascript.info/async-await)
- [javascript.info: iteradores y generadores asíncronos](https://es.javascript.info/async-iterators-generators)
- [MDN: for await...of (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
- [Python: corrutinas y tareas](https://docs.python.org/es/3/library/asyncio-task.html)
