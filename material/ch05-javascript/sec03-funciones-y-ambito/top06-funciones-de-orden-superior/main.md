# Funciones de orden superior

## Por qué importa

Una **función de orden superior** es una función que recibe funciones como argumento, devuelve una función, o las dos cosas. Ya las usas: `map`, `filter`, `toSorted` y `reduce` reciben funciones; las fábricas de la lección «Closures» devuelven funciones. Esta lección convierte esa idea en herramientas que verás en cualquier proyecto: componer funciones pequeñas, fijar argumentos (*currying* y aplicación parcial), recordar resultados (memoización), envolver funciones como los decoradores de Python y controlar cuántas veces se ejecuta algo (*debounce* y *throttle*).

Todas esas herramientas funcionan mejor con **funciones puras**, que no modifican lo que reciben. Por eso la lección empieza por ahí, y cumple una promesa de la lección «JSON y copias»: en lugar de modificar un objeto, crear uno **nuevo** con lo que cambia. Ese estilo se llama **inmutabilidad**, y es la base de cómo se escribe hoy el código de las interfaces web.

## Funciones que reciben y devuelven funciones

| Recibe funciones | Devuelve funciones | Las dos cosas |
|------------------|--------------------|---------------|
| `map`, `filter`, `reduce`, `toSorted` | las fábricas (`makeIdGenerator`) | `memoize(fn)`, `debounce(fn, ms)` |
| `addEventListener` (capítulo 6) | `bind` | `pipe(f, g, h)` |

> **Desde Python:** `map`, `filter`, `sorted(key=…)` y `functools.reduce` reciben funciones; un **decorador** recibe una función y devuelve otra. Todo lo de esta lección tiene un equivalente directo en Python, casi siempre en el módulo `functools`.

## Funciones puras

Una función es **pura** si cumple dos condiciones: con los mismos argumentos devuelve **siempre** el mismo resultado, y no cambia **nada** fuera de ella (no tiene efectos secundarios). Una función que lee una variable global que puede cambiar no cumple la primera; una que modifica el objeto que recibe no cumple la segunda.

[[exercise:01-funciones-puras.md-]]

Un programa necesita efectos secundarios: escribir en la consola, cambiar la página, guardar datos, pedir cosas a un servidor. La idea no es eliminarlos, sino **reunirlos en pocos sitios** y que la lógica (calcular un total, aplicar un descuento, ordenar un catálogo) esté en funciones puras. Las funciones puras se prueban con una línea, se pueden reutilizar en cualquier contexto y, como verás más abajo, se pueden memoizar sin riesgo.

## Inmutabilidad: crear en lugar de modificar

En la lección «Parámetros» viste que una función que recibe un objeto puede modificarlo, y que quien la llama ve el cambio. En «JSON y copias» viste que las copias con spread son superficiales. Juntando las dos ideas aparece el estilo **inmutable**: nunca se modifica un objeto o un array existente; se crea una **versión nueva** con lo que cambia, y lo que no cambia se **comparte**.

| Quieres… | En lugar de mutar… | Crea una versión nueva |
|----------|--------------------|------------------------|
| cambiar una propiedad | `user.name = 'Ana'` | `{ ...user, name: 'Ana' }` |
| cambiar algo anidado | `user.address.city = 'Cádiz'` | `{ ...user, address: { ...user.address, city: 'Cádiz' } }` |
| quitar una propiedad | `delete user.tags` | `const { tags, ...rest } = user` |
| añadir al final | `items.push(x)` | `[...items, x]` |
| quitar un elemento | `items.splice(i, 1)` | `items.toSpliced(i, 1)` o `filter` |
| cambiar un elemento | `items[i] = x` | `items.with(i, x)` |
| cambiar un objeto de la lista | `task.done = true` | `tasks.map((t) => (t.id === id ? { ...t, done: true } : t))` |
| ordenar | `items.sort(f)` | `items.toSorted(f)` |

[[exercise:02-actualizar-sin-mutar.md-]]

Fíjate en la última línea del ejemplo: `tasks[0] === toggled[0]` es `true`. La versión nueva **reutiliza** los objetos que no han cambiado; solo se crean de nuevo el contenedor y el camino hasta lo que cambia. Por eso la inmutabilidad es barata: no hay que copiar todo, como haría `structuredClone`, sino solo lo que se toca.

```text
tasks   ──► [ A, B  ]      A  = { id: 1, done: false }   ← el mismo objeto en las dos listas
toggled ──► [ A, B2 ]      B  = { id: 2, done: false }   ← solo en la lista original
                           B2 = { id: 2, done: true }    ← nuevo (junto con el array toggled)
```

### Por qué importa

Mutar datos compartidos produce los errores más difíciles de rastrear, porque el síntoma aparece lejos de la causa. Una función que solo debía **consultar** el top de ventas ordena con `sort()` y desordena el catálogo para todo el programa. Un historial que guarda el mismo objeto una y otra vez no conserva el pasado y no puede saber si algo cambió:

[[exercise:03-mutar-el-argumento.md-]]

Con datos inmutables, la pregunta «¿ha cambiado algo?» se responde con `===`: si es el mismo objeto, no ha cambiado; si es otro, sí. Las librerías de interfaz como React se basan exactamente en esa comparación para decidir qué volver a pintar. Y deshacer cambios es trivial: basta con guardar las versiones anteriores, como en el historial del ejemplo.

> **Desde Python:** Python ofrece tipos inmutables de serie (`tuple`, `frozenset`, `str`) y `dataclasses.replace(obj, campo=valor)` para crear una copia con un cambio. JavaScript no tiene tuplas ni registros inmutables (`Object.freeze` llega en el módulo «Objetos y prototipos»); la inmutabilidad es una **disciplina**: usar siempre las operaciones de la columna derecha de la tabla.

## Composición

**Componer** es construir una función grande encadenando funciones pequeñas: la salida de una es la entrada de la siguiente. `pipe(f, g, h)` devuelve una función que aplica `f`, luego `g` y luego `h`; se escribe en una línea con `reduce`. `compose` hace lo mismo de derecha a izquierda, como la composición matemática `f ∘ g`.

[[exercise:04-composicion.md-]]

La composición premia las funciones puras de una entrada y una salida: cada pieza se entiende y se prueba por separado, y se reutiliza en otras tuberías (en el ejemplo, `normalizeSearch` comparte tres piezas con `slugify`). Encadenar métodos de array, `filter(…).map(…)`, es la misma idea con los métodos del lenguaje.

## Currying

El **currying** transforma una función de varios argumentos en una cadena de funciones de un argumento: `add(a, b)` se convierte en `add(a)(b)`. Cada paso es un closure que recuerda los argumentos anteriores. Sirve para dar primero la **configuración** y al final los **datos**, y obtener por el camino funciones intermedias reutilizables:

[[exercise:05-currying.md-]]

Un currificador genérico usa `fn.length` (los parámetros que declara la función, lección «Parámetros») para saber cuándo tiene todos los argumentos. Ojo con eso: los parámetros con valor por defecto o *rest* no cuentan en `length`, así que esas funciones no se currifican bien de forma automática.

## Aplicación parcial

La **aplicación parcial** fija algunos argumentos de una función y devuelve otra que espera el resto, todos de una vez. Hay tres formas de hacerlo, de menos a más flexible: `bind` (fija los primeros argumentos; el primer parámetro de `bind` es el `this`, que aquí no se usa y se pasa como `null`), una flecha que llama a la función original, o un `partial` genérico con *rest* y *spread*:

[[exercise:06-aplicacion-parcial.md-]]

> **Desde Python:** `functools.partial(apply_vat, 0.21)` equivale a `applyVat.bind(null, 0.21)`. Python no tiene la distinción con el currying porque casi nunca se currifica: se usa `partial` o una `lambda`.

## Memoización

**Memoizar** una función es guardar sus resultados para no recalcularlos: la primera vez se calcula y se guarda en una caché; las siguientes, se devuelve lo guardado. `memoize(fn)` es una función de orden superior que devuelve una versión de `fn` con una caché privada, un `Map` dentro de un closure:

[[exercise:07-memoizacion.md-]]

Tres precauciones. Solo se memoizan funciones **puras**: si el resultado depende de la hora o de una variable global, la caché devolverá datos viejos. Las claves de un `Map` se comparan por **referencia**, así que dos objetos iguales son claves distintas; con varios argumentos o con objetos hace falta construir una clave (en el ejemplo, `JSON.stringify(args)`). Y la caché crece sin límite mientras viva la función. Verás la memoización otra vez en la próxima lección, para salvar a Fibonacci de una explosión de llamadas.

> **Desde Python:** es `@functools.cache` o `@functools.lru_cache(maxsize=…)`, que además limita el tamaño de la caché.

## Envolver funciones: los decoradores de Python

Un **decorador** de Python es una función que recibe una función y devuelve otra que la envuelve, añadiendo algo antes o después de llamarla. JavaScript no tiene la sintaxis `@` para funciones sueltas, pero el patrón es el mismo: `const f = decorador(f)`. Con *rest* y *spread* (`(...args) => fn(...args)`), el envoltorio funciona con cualquier número de argumentos:

[[exercise:08-envolver-funciones.md-]]

```python
@once
def connect_payments():
    ...
```

```js
const connectPayments = once(() => { … });
```

`once`, el registro de llamadas y el valor de respaldo ante errores son envoltorios clásicos. Igual que en Python, se pueden apilar: `withLogging(withFallback(JSON.parse, null))` es como escribir dos decoradores seguidos.

## Controlar la frecuencia: debounce y throttle

Hay eventos que llegan en ráfagas: cada pulsación en un buscador, cada píxel de *scroll*, cada movimiento del ratón. Si cada uno lanza una búsqueda en el servidor o un cálculo pesado, la página se vuelve lenta. Dos funciones de orden superior, ambas construidas con closures, limitan cuántas veces se ejecuta el trabajo de verdad.

**Debounce** espera a que los eventos **paren**: cada llamada cancela la anterior y programa una nueva para dentro de `waitMs`. Solo se ejecuta la última, cuando el usuario deja de escribir. Escribe en el buscador y compara el contador de pulsaciones con el de búsquedas:

[[exercise:09-debounce.md]]

El ejemplo usa `setTimeout` y `clearTimeout`, que se estudian en el módulo «Asincronía y event loop», y un evento de teclado, que se estudia en el capítulo 6. La parte de esta lección es la función `debounce`: siete líneas que guardan el temporizador pendiente en un closure.

**Throttle** deja pasar como mucho **una llamada cada `intervalMs`**, por muchos eventos que lleguen, mientras sigan llegando. Para ver el comportamiento exacto sin depender del ratón, el ejemplo simula el reloj: la función recibe `now` como parámetro (en una página real sería `performance.now()`):

[[exercise:10-throttle.md-]]

```text
  t =   0 ms → guardar posición 0 px
  t = 112 ms → guardar posición 280 px
  t = 224 ms → guardar posición 560 px
eventos: 21 · llamadas: 3
```

| | Debounce | Throttle |
|---|---|---|
| Cuándo ejecuta | una vez, cuando los eventos paran | periódicamente, mientras siguen llegando |
| Uso típico | buscador, validar al terminar de escribir, guardar un borrador | *scroll*, `mousemove`, redimensionar la ventana |
| Riesgo | si los eventos no paran nunca, no se ejecuta | puede perder el último evento si no tiene llamada final |

## Bestiario

- **La función de consulta que desordena tus datos.**
  Síntoma: después de pedir el top de ventas, el catálogo aparece reordenado en otras partes del programa.
  Causa: la función usa `sort()` (o `push`, `splice`, asignaciones…) sobre el array que recibe, que es el mismo que tiene quien la llama.
  Solución: operaciones que devuelven copias: `toSorted`, `toSpliced`, `with`, spread.
  → [ver ejemplo](03-mutar-el-argumento.md)
- **El historial que no recuerda nada.**
  Síntoma: todas las versiones guardadas son iguales y `prev !== next` dice que no hubo cambios.
  Causa: se guardó varias veces el mismo objeto y se modificó entre medias.
  Solución: cada cambio crea un objeto nuevo (`{ ...version, theme: 'oscuro' }`).
  → [ver ejemplo](03-mutar-el-argumento.md)
- **La caché que devuelve datos viejos.**
  Síntoma: una función memoizada sigue devolviendo el resultado antiguo después de que cambien los datos.
  Causa: la función no era pura: dependía de algo externo que no forma parte de la clave.
  Solución: memoiza solo funciones puras, o incluye en la clave todo lo que afecta al resultado.
  → [ver ejemplo](07-memoizacion.md)

## Resumen

- Una función de orden superior recibe o devuelve funciones; casi todas se construyen con closures.
- Una función pura da el mismo resultado con los mismos argumentos y no cambia nada fuera de ella.
- Inmutabilidad: en vez de modificar, crea una versión nueva (`{ ...obj, x }`, `with`, `toSorted`, `map`); lo que no cambia se comparte y `===` detecta los cambios.
- `pipe`/`compose` encadenan funciones pequeñas; el currying y la aplicación parcial fijan argumentos.
- `memoize` guarda resultados en un `Map` privado: solo para funciones puras.
- Los decoradores de Python son funciones que envuelven funciones: `const f = once(f)`.
- Debounce ejecuta cuando los eventos paran; throttle, como mucho una vez por intervalo.

## Para profundizar

- [MDN: funciones de primera clase](https://developer.mozilla.org/es/docs/Glossary/First-class_Function)
- [javascript.info: decoradores y redirecciones, call/apply](https://es.javascript.info/call-apply-decorators)
- [javascript.info: currying](https://es.javascript.info/currying-partials)
- [MDN: métodos de array que copian (toSorted, toSpliced, with)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods)
- [CSS-Tricks: debouncing y throttling explicados con ejemplos](https://css-tricks.com/debouncing-throttling-explained-examples/)
