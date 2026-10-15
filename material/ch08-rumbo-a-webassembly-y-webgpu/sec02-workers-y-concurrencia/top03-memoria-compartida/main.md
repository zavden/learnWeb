# Memoria compartida

## Por qué importa

Hasta ahora, la página y sus workers no comparten nada. Los datos viajan copiados o transferidos, y en cada momento cada byte tiene **un solo dueño**. Es un modelo seguro y fácil de razonar, pero tiene un límite: si cuatro workers trabajan sobre la misma imagen de 32 MB, o un programa de C++ compilado a WebAssembly lanza ocho hilos que leen y escriben las mismas estructuras, mover los datos de un lado a otro sin parar no sirve. Hace falta lo que tienen los programas nativos: **memoria compartida**, unos bytes que varios hilos ven y cambian **a la vez**.

JavaScript la tiene, con `SharedArrayBuffer` y `Atomics`, y esta lección cuenta tres cosas. Qué es y qué problemas trae: las **carreras de datos**, que no existen con un solo hilo. Por qué en la vista previa del curso (y en la mayoría de las webs) no está disponible: un ataque contra los procesadores llamado Spectre y la respuesta de los navegadores, el **aislamiento cross-origin**. Y qué hacer en su lugar. Todo lo que se puede ejecutar aquí, se ejecuta; lo que no, se simula de forma honesta y se dice.

## Qué es la memoria compartida

Un **`SharedArrayBuffer`** se parece a un `ArrayBuffer`: un bloque de bytes que se lee y se escribe con vistas (`Int32Array`, `Float32Array`…). La diferencia está en `postMessage`: un `ArrayBuffer` se copia o se transfiere, y un `SharedArrayBuffer` se **comparte**. El worker recibe otra referencia al **mismo** bloque, y desde ese momento lo que escribe un hilo lo ve el otro, sin mensajes:

```text
   ArrayBuffer transferido: un dueño cada vez      SharedArrayBuffer: dos hilos, los mismos bytes
 página            worker                          página                     worker
 [      ]  ────►  [■■■■■■]                         Int32Array ──┐       ┌── Int32Array
 0 bytes          los bytes                                      ▼       ▼
                                                              [■■■■■■■■■■■■]  (un solo bloque)
```

> **Desde Python:** en Python, los hilos de `threading` comparten **todo** (cada objeto del programa), y por eso existen `threading.Lock` y compañía. Los procesos de `multiprocessing` no comparten nada, salvo lo que se crea a propósito como compartido: `multiprocessing.Value`, `multiprocessing.Array` o `multiprocessing.shared_memory`. La web se parece al segundo modelo: nada compartido por defecto, y solo bloques de bytes cuando se piden.

## Por qué casi nunca está: aislamiento cross-origin

En enero de 2018 se publicó **Spectre**, un fallo de diseño de los procesadores modernos. Para ir más rápido, una CPU ejecuta instrucciones por adelantado (de forma *especulativa*) y, si se equivocó, descarta el resultado… pero deja rastros en la caché. Midiendo cuánto tarda en leer ciertas direcciones de memoria, un programa puede deducir bytes que nunca debería ver. En un navegador, eso significa que el JavaScript de una página podría leer datos de otros sitios que compartan su proceso: contraseñas, cookies, el contenido de una imagen de otro origen.

El ataque necesita un **reloj muy preciso**, y `SharedArrayBuffer` regala uno: un worker que incrementa un contador en memoria compartida sin parar, y la página que lo lee, forman un cronómetro de nanosegundos. Los navegadores reaccionaron en días: recortaron la precisión de `performance.now()` y desactivaron `SharedArrayBuffer`. Desde 2021, solo lo devuelven a las páginas que demuestran que en su proceso no hay datos ajenos: las páginas **aisladas de otros orígenes** (*cross-origin isolated*).

Una página se aísla con **dos cabeceras** en su respuesta HTTP:

| Cabecera | Valor | Qué exige |
|----------|-------|-----------|
| `Cross-Origin-Opener-Policy` (COOP) | `same-origin` | la página no comparte grupo de ventanas con otros orígenes: si abre un popup de otro sitio, o la abren desde otro sitio, `window.opener` queda cortado |
| `Cross-Origin-Embedder-Policy` (COEP) | `require-corp` | cada recurso de otro origen (imágenes, scripts, iframes…) debe dar permiso: con CORS (lección «Orígenes y CORS») o con la cabecera `Cross-Origin-Resource-Policy: cross-origin` |
| COEP, la alternativa | `credentialless` | los recursos de otro origen sin CORS se cargan **sin cookies**, así que no hace falta su permiso (no traen nada privado) |

Con las dos, `crossOriginIsolated` vale `true`, el constructor `SharedArrayBuffer` aparece, `postMessage` puede compartirlo y, en Chrome, `performance.now()` pasa de saltos de 100 microsegundos a saltos de 5. La vista previa del curso no las envía, y no puede: las tarjetas de la teoría son iframes aislados de origen `null` y los recursos van y vienen entre los dos puertos de LearnWeb; con COEP, todo eso dejaría de cargar. El ejemplo lo comprueba en la propia página:

[[exercise:01-aislamiento-cross-origin.md-]]

```text
crossOriginIsolated → false
typeof SharedArrayBuffer → undefined
salto más pequeño de performance.now() → 0.100 ms
cross-origin-opener-policy → null
cross-origin-embedder-policy → null
```

Es la décima de milisegundo de la que hablaba la lección «Frames de animación y tiempo» cuando decía que la precisión del reloj «está recortada a propósito». Ahora sabes contra qué.

## Un `SharedArrayBuffer` de verdad

Hay una puerta lateral, y sirve para ver un `SharedArrayBuffer` sin trampas. La memoria de WebAssembly (módulo «WebAssembly») puede crearse **compartible**, con `shared: true`, porque así la necesitan los programas con hilos compilados a WebAssembly. En Chrome, ese constructor funciona aunque la página no esté aislada, y su búfer **es** un `SharedArrayBuffer`. No es un agujero de seguridad: sin aislamiento no hay forma de entregárselo a otro hilo, así que no se puede fabricar el cronómetro.

[[exercise:02-un-sharedarraybuffer-de-verdad.md-]]

```text
tipo → [object SharedArrayBuffer]
byteLength → 65536 (una página de 64 KiB)
bytes[0], bytes[1] → 2 1 (little-endian)
Atomics.add(counters, 0, 10) devuelve el valor ANTERIOR → 258
Atomics.load(counters, 0) → 268
typeof shared.transfer → undefined
¿tiene la propiedad detached? → false
```

Se usa con vistas, como cualquier búfer, y no tiene `transfer()` ni se desconecta nunca: compartir es justo lo contrario de cambiar de dueño. No cuentes con este truco fuera de Chrome; aquí sirve para ejecutar de verdad los ejemplos de `Atomics` de esta lección.

### 🐛 Compartirlo con un worker falla

Lo que no se puede hacer sin aislamiento es lo único para lo que existe la memoria compartida: dársela a otro hilo. `postMessage` lanza un `DataCloneError` que nombra el requisito. Y hay un segundo error, que no depende del aislamiento: `Atomics.wait`, que duerme al hilo hasta que otro le avise, está **prohibido en el hilo principal**, siempre, porque dormiría la página entera.

[[exercise:03-compartir-con-un-worker-falla.md-]]

```text
🐛 postMessage → DataCloneError: Failed to execute 'postMessage' on 'Worker': SharedArrayBuffer transfer requires self.crossOriginIsolated.
🐛 Atomics.wait → TypeError: Atomics.wait cannot be called in this context
✅ el worker recibió una copia → 120, 4, 0, 7
```

En una web propia, la solución son las dos cabeceras (y revisar que todos los recursos de otros orígenes las toleran). En este curso, la solución es la de la lección anterior: copiar o transferir.

## Carreras de datos

Con memoria compartida aparece un problema que JavaScript no tenía: dos hilos pueden ejecutar **a la vez** código que toca los mismos bytes. Algo tan inocente como `sold[0] = sold[0] + 1` son dos pasos para la CPU, **leer** y luego **escribir**, y otro hilo se puede colar entre los dos:

```text
taquilla A: lee 0 ─────────────► escribe 1
taquilla B:          lee 0 ─────────────► escribe 1      → dos ventas, y el contador dice 1
```

Es una **carrera de datos** (*data race*): el resultado depende de cómo se intercalen los pasos de los hilos, y eso cambia en cada ejecución, en cada máquina y según la carga del sistema. Como aquí no hay dos hilos con memoria compartida, el ejemplo **simula** dos taquillas con generadores (lección «Generadores»): cada `yield` es un punto en el que el «sistema» puede pasar al otro hilo, y un planificador decide el orden. Así la carrera se puede repetir paso a paso:

[[exercise:04-una-carrera-de-datos.md-]]

```text
✅ leer y escribir, una detrás de otra → 1000 de 1000 entradas
🐛 leer y escribir, alternando → 500 de 1000 entradas
🐛 leer y escribir, orden aleatorio (semilla 2026) → 612 de 1000 entradas
✅ Atomics.add, alternando → 1000 de 1000 entradas
✅ Atomics.add, orden aleatorio (semilla 2026) → 1000 de 1000 entradas
A lee 0 · B lee 0 · A escribe 1 · B escribe 1 → 2 ventas, el contador dice 1
```

Fíjate en la primera línea: sin intercalado, el código «con carrera» funciona. Por eso estos fallos son tan traicioneros: pasan todas las pruebas, y un día, con otra carga o en otro ordenador, faltan 388 entradas. Y no hay error ni aviso. La solución es que leer, sumar y escribir sean **un solo paso** que nadie pueda partir: una operación **atómica**. `Atomics.add(sold, 0, 1)` lo es, y el resultado es 1000 con cualquier orden.

> **Desde Python:** en Python pasa lo mismo con `threading`: `counter += 1` son varias instrucciones del intérprete (leer, sumar, guardar) y dos hilos pueden intercalarlas. El GIL hace que ocurra con menos frecuencia, pero no lo impide. La solución de Python es un cerrojo: `with lock: counter += 1`, con `lock = threading.Lock()`.

## `Atomics`

El objeto global `Atomics` reúne las operaciones atómicas sobre typed arrays de **enteros** (`Int32Array`, `Uint8Array`, `BigInt64Array`…). Cada una es indivisible: ningún otro hilo puede ver un estado intermedio. Y las que modifican devuelven el valor **anterior**, para que quien las llama sepa qué había justo antes de su cambio.

| Operación | Qué hace | Devuelve |
|-----------|----------|----------|
| `Atomics.load(v, i)` / `store(v, i, x)` | leer / escribir | el valor / `x` |
| `Atomics.add`, `sub`, `and`, `or`, `xor` | modificar en un paso | el valor anterior |
| `Atomics.exchange(v, i, x)` | escribir `x` | el valor anterior |
| `Atomics.compareExchange(v, i, esperado, x)` | escribir `x` **solo si** el valor es `esperado` | el valor anterior (si es `esperado`, se escribió) |
| `Atomics.wait` / `waitAsync` / `notify` | dormir hasta que cambie un valor / despertar | ver más abajo |

[[exercise:05-atomics-paso-a-paso.md-]]

```text
store → 120 | load → 120
sub(4) devuelve → 120 | ahora → 116
add(4) devuelve → 0 | ahora → 4
exchange(7) devuelve → 0
compareExchange(7 → 8) devuelve → 7 | ahora → 8
compareExchange(7 → 9) devuelve → 8 | ahora → 8
flags → 010
TypeError: [object Float32Array] is not an integer typed array.
```

`load` y `store` también importan: sin ellas, el compilador y la CPU pueden reordenar las lecturas y escrituras de un hilo, y otro hilo podría ver los cambios en otro orden. Las operaciones de `Atomics` ponen orden: lo escrito antes de un `Atomics.store` es visible para quien lo lea después con `Atomics.load`.

### 🐛 Comprobar y luego actuar

La otra carrera clásica no pierde sumas, sino decisiones. «Si el asiento está libre, resérvalo» son dos pasos: dos compradores pueden ver libre el último asiento antes de que ninguno lo reserve, y los dos reciben su confirmación. `compareExchange` convierte comprobar y escribir en **un** paso: «si vale libre, pon mi número». Solo uno lo consigue, y el valor que devuelve le dice a cada uno si ha sido él.

[[exercise:06-comprobar-y-reservar.md-]]

```text
🐛 comprobar y luego reservar: Ana ve el 12A libre · Beto ve el 12A libre · Ana lo reserva · Beto lo reserva
   confirmaciones → Ana: sí, Beto: sí · el asiento es de Beto
✅ compareExchange: Ana lo reserva · Beto llega tarde
   confirmaciones → Ana: sí, Beto: no · el asiento es de Ana
primer tryLock → true | segundo tryLock → false
tras abrirlo, tryLock → true
```

Con la misma operación se construye un **cerrojo** (*mutex*): un entero que vale 0 (abierto) o 1 (cerrado), que se cierra con `compareExchange(m, 0, 0, 1)` y se abre con `store(m, 0, 0)`. Quien cierra el cerrojo puede hacer varios pasos seguidos sin que nadie se cuele, como el `with lock:` de Python. Es la pieza con la que las bibliotecas de C y de Rust compiladas a WebAssembly protegen sus datos compartidos.

## Esperar sin gastar: `wait`, `notify` y `waitAsync`

Un hilo que espera a que otro termine podría preguntar sin parar («¿ya?, ¿ya?»), pero eso quema un núcleo entero sin hacer nada. `Atomics.wait(vista, i, valor)` **duerme** el hilo mientras `vista[i]` valga `valor`, y `Atomics.notify(vista, i)` despierta a los que esperan en esa posición. Con memoria compartida de verdad, un worker se usaría así:

```js
// En el worker: dormir hasta que la página diga que hay trabajo
Atomics.wait(signals, 0, 0);   // bloquea ESTE hilo mientras signals[0] valga 0
// En la página: avisar
Atomics.store(signals, 0, 1);
Atomics.notify(signals, 0);
```

`Atomics.wait` está prohibido en el hilo principal (ya lo viste: dormiría la página). Para la página existe **`Atomics.waitAsync`**, que en lugar de dormir devuelve una promesa: `{ async: true, value: promesa }`, que se cumple con `'ok'` cuando alguien llama a `notify`, o con `'timed-out'` si vence el plazo. Si el valor ya no es el esperado, no hay nada que esperar: `{ async: false, value: 'not-equal' }`. En Chrome funciona sobre la memoria compartida de WebAssembly, en un solo hilo, que basta para verlo:

[[exercise:07-wait-notify-y-waitasync.md-]]

```text
waitAsync → async: true · value es una promesa: true
notify despertó a → 1
resultado → ok
el valor ya es 1 → async: false · value: not-equal
con plazo de 30 ms → timed-out
worker: Atomics.wait → timed-out tras dormir ≥ 49 ms
```

La última línea viene de un worker: allí `Atomics.wait` sí está permitido, y bloquea ese hilo, no la página. Como nadie puede avisarle (no hay forma de compartir su memoria con la página), lo despierta el plazo.

## Lo que necesitan los hilos de WebAssembly

Un programa de C, C++ o Rust que usa hilos se compila a WebAssembly así: su memoria es una `WebAssembly.Memory` compartida, cada hilo es un worker que recibe esa memoria, y los cerrojos son instrucciones atómicas (las mismas operaciones que `Atomics`, dentro del propio WebAssembly). Por eso las aplicaciones web que usan WebAssembly con hilos (editores de vídeo, motores de juegos, herramientas de diseño) se sirven con COOP y COEP. En el módulo «WebAssembly» de este capítulo, los módulos se ejecutarán en un solo hilo, que es lo que la vista previa permite, y eso basta para entender cómo funciona la memoria lineal.

## Sin memoria compartida: mensajes y doble búfer

Sin `SharedArrayBuffer` se puede hacer casi todo, con los patrones de las dos lecciones anteriores:

- **Trozos y resultados**: el trabajo se parte, cada worker recibe su trozo y devuelve su resultado (el pool de primos de «Web workers»). Nadie comparte nada porque cada uno tiene lo suyo.
- **Ida y vuelta**: un búfer se transfiere al worker y vuelve transferido (lección «Transferibles»). Un solo dueño cada vez: imposible tener una carrera.
- **Doble búfer**: para datos que cambian en cada fotograma, como una simulación que la página dibuja. Hay **dos** marcos que circulan transferidos: mientras la página pinta uno, el worker llena el otro, y después se cambian. Ningún hilo espera al otro, y no se crea ni se copia ningún búfer por fotograma (el worker copia su estado dentro del marco, en su propio hilo).

[[exercise:08-doble-bufer-por-mensajes.md]]

[[exercise:08-doble-bufer-por-mensajes.md-(script.js)]]

```text
Listo: pulsa «Calentar»; prueba también «Pausa» y «Detener»
// Tras pulsar «Calentar» y esperar unos 3 s:
🔥 600 pasos en 150 fotogramas · temperatura media 61.3 °C · marcos creados: 2
// Tras pulsar «Calentar» y enseguida «Detener» (el paso cambia en cada intento):
⏹ detenido: paso 96 de 600
```

Es la misma idea que el *double buffering* de los gráficos (se dibuja en un búfer oculto y se muestra el otro) y que usan los motores de juegos para separar la simulación del dibujo. Con memoria compartida, la página leería el estado directamente; sin ella, cuesta un mensaje por fotograma, y a cambio es imposible que la página pinte un estado a medio calcular.

## Bestiario

- **`typeof SharedArrayBuffer` es `'undefined'` y `postMessage` lanza `DataCloneError: … SharedArrayBuffer transfer requires self.crossOriginIsolated.`**
  Síntoma: un código que usa `SharedArrayBuffer` falla con `ReferenceError: SharedArrayBuffer is not defined`, o al enviarlo a un worker.
  Causa: la página no está aislada (`crossOriginIsolated` es `false`): sin las cabeceras COOP y COEP, los navegadores no permiten compartir memoria entre hilos, por Spectre.
  Solución: en una web propia, servir la página con `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp` (o `credentialless`); si no se puede, copiar o transferir búferes (ida y vuelta, doble búfer).
  → [ver ejemplo](03-compartir-con-un-worker-falla.md)
- **`TypeError: Atomics.wait cannot be called in this context`.**
  Síntoma: `Atomics.wait` lanza `TypeError` en la página.
  Causa: el hilo principal no puede bloquearse nunca, ni con aislamiento.
  Solución: `Atomics.waitAsync` en la página (devuelve una promesa); `Atomics.wait` solo dentro de workers.
  → [ver ejemplo](03-compartir-con-un-worker-falla.md)
- **Faltan ventas: un contador compartido cuenta de menos.**
  Síntoma: con varios hilos, un total sale menor de lo esperado, distinto en cada ejecución; con uno solo, siempre bien.
  Causa: `x = x + 1` son dos pasos (leer y escribir) y otro hilo puede colarse entre ellos: una carrera de datos.
  Solución: `Atomics.add` (y el resto de operaciones de `Atomics`) para modificar en un solo paso; o que cada hilo cuente lo suyo y se sumen al final.
  → [ver ejemplo](04-una-carrera-de-datos.md)
- **Dos confirmaciones para el mismo asiento.**
  Síntoma: dos hilos «consiguen» el mismo recurso; el último en escribir se lo queda y el otro cree que lo tiene.
  Causa: «comprobar y luego actuar» son dos pasos separados.
  Solución: `Atomics.compareExchange` comprueba y escribe en uno; para varios pasos seguidos, un cerrojo construido con él.
  → [ver ejemplo](06-comprobar-y-reservar.md)

## Resumen

- Un `SharedArrayBuffer` es un bloque de bytes que varios hilos ven a la vez: `postMessage` lo comparte, no lo copia ni lo transfiere.
- Por Spectre, solo está en páginas aisladas: `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` (o `credentialless`) → `crossOriginIsolated` es `true`.
- En la vista previa del curso no hay aislamiento: no existe el constructor, `postMessage` lanza `DataCloneError` y el reloj va a saltos de 0,1 ms.
- Con memoria compartida llegan las carreras de datos: leer y escribir por separado pierde actualizaciones; comprobar y luego actuar da dos ganadores.
- `Atomics` hace indivisibles las operaciones sobre enteros (`add`, `compareExchange`…) y devuelve el valor anterior; con `compareExchange` se construyen cerrojos.
- `Atomics.wait` duerme un worker (nunca la página); `notify` lo despierta; `waitAsync` es la versión con promesa para la página.
- Sin memoria compartida: trozos y resultados, ida y vuelta de búferes, y doble búfer para datos que cambian en cada fotograma.

## Para profundizar

- [MDN: SharedArrayBuffer y sus requisitos de seguridad (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements)
- [web.dev: Aislar tu web de otros orígenes con COOP y COEP (en inglés)](https://web.dev/articles/coop-coep)
- [web.dev: Por qué hace falta el aislamiento cross-origin (en inglés)](https://web.dev/articles/why-coop-coep)
- [MDN: Atomics (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [Documentación de Python: threading.Lock](https://docs.python.org/es/3/library/threading.html#lock-objects)
