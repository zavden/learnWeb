# Integración: funciones y ámbito

## Por qué importa

Cada lección de este módulo estudió una pieza por separado: las formas de escribir una función, los parámetros, el ámbito, los closures, `this`, las funciones de orden superior y la recursión. En el código real aparecen todas a la vez. Un bus de eventos guarda sus oyentes en un closure, recibe métodos que pueden perder su `this` y usa *rest* y *spread* para reenviar argumentos. Un historial de deshacer combina un closure con actualizadores puros y currificados. Un perfilador es un decorador que envuelve una función recursiva. Los ejemplos de esta página combinan varias lecciones en cada programa, y los ejercicios te piden hacerlo a ti.

## Las decisiones que se repiten

Casi todas las decisiones de esta página salen de una tabla corta. Si dudas en un ejercicio, vuelve aquí:

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| estado privado que sobrevive entre llamadas | variables locales de una fábrica (closure) | «Closures» |
| una función configurada una vez y usada muchas | una fábrica, currying o aplicación parcial | «Closures», «Funciones de orden superior» |
| opciones con nombre y valores por defecto | `{ a = 1, b = 2 } = {}` en los parámetros | «Parámetros» |
| reenviar todos los argumentos | `(...args) => fn(...args)` | «Parámetros» |
| envolver un **método** sin perder su objeto | `function (...args) { return fn.apply(this, args); }` | «La palabra clave this» |
| pasar un método como callback | una flecha `(x) => obj.metodo(x)` o `obj.metodo.bind(obj)` | «La palabra clave this» |
| cambiar datos sin efectos sorpresa | crear una versión nueva y compartir lo que no cambia | «Funciones de orden superior» |
| recorrer datos anidados | recursión (o una pila explícita si son muy profundos) | «Recursión y pila de llamadas» |
| ver el paso del tiempo con salidas exactas | un reloj simulado que se pasa como parámetro | «Funciones de orden superior» |

El último punto merece una explicación. Varios ejemplos dependen del tiempo (*debounce*, un limitador de peticiones). En lugar de usar el reloj real, que daría una salida distinta en cada ejecución, reciben el reloj **como parámetro**: en la página sería `performance.now()` o `setTimeout`; aquí es una función que devuelve un número que controla el propio ejemplo. Así cada línea de la consola es exacta y reproducible, y de paso ves una idea muy útil para probar código: **inyectar** lo que cambia en lugar de leerlo directamente.

## Ejemplos combinados

### Calculadora de precios

Una tienda vende en España y en México, con IVA distinto por mercado y por categoría. El precio con impuestos es una función **currificada** (mercado → categoría → neto), así que `grossPrice('ES')('books')` es una función reutilizable. Los cupones se fabrican con closures que recuerdan su porcentaje y sus condiciones, y `quote` recibe un objeto de opciones con valores por defecto. Los `Intl.NumberFormat` se memoizan: el programa los usa decenas de veces, pero solo crea dos. Fíjate en el caso sin cupón: el descuento `-0` se escribiría «-0,00 €», el bicho de la lección «Números», y por eso se trata aparte.

[[exercise:01-calculadora-de-precios.md-]]

```text
▼ Presupuesto ES
  1 × Novela gráfica               24,96 €
  3 × Café de Veracruz 250 g       29,37 €
  2 × Taza de cerámica             27,84 €
  Subtotal                         82,17 €
  Cupón LECTURA10                  -2,50 €
  TOTAL                            79,67 €
▼ Presupuesto MX
  …
  Cupón BIENVENIDA                 -$66.62
  TOTAL                          $1,265.86
libros en España → [1040, 2496, 4150]
formateadores Intl creados → 2
```

### Bus de eventos

Un bus de eventos permite que las partes de una aplicación se avisen sin conocerse: el carrito, la analítica y el stock escuchan `item-added` sin saber quién lo emite. Los oyentes viven en un `Map` de `Set` dentro de un closure; `on` devuelve la **función de baja** y `once` se construye encima de `on`. Un oyente que lanza un error no impide que se ejecuten los demás. Y aparece el bicho de `this`: registrar `cartBadge.onItemAdded` sin más hace que el bus lo llame como función simple, y el contador acaba en `window.count` con `NaN`.

[[exercise:02-bus-de-eventos.md-]]

```text
  🛒 insignia: NaN (Té verde sencha)
🐛 cartBadge.count → 0 | window.count → NaN
▶ añadir productos
  🛒 insignia: 1 (Té verde sencha)
  🛒 insignia: 2 (Producto fantasma)
  ⚠️ un oyente de «item-added» ha fallado: sin stock registrado para XX-99
▶ pagar dos pedidos
  🎁 cupón de bienvenida para ana@example.com
✅ insignia → 2 | analítica → 2 | stock TE-01 → 11
oyentes: item-added → 3 | order-paid → 0
```

### Deshacer y rehacer

`createHistory` guarda tres cosas en un closure: los estados pasados, el presente y los deshechos. Cada cambio es un **actualizador puro y currificado**: `addTask('Comprar pan')` devuelve una función estado → estado que crea un estado nuevo con spread, `with` y `toSpliced`. Como nada se muta, deshacer es tan sencillo como volver a un estado guardado, y `===` basta para detectar un cambio que no cambia nada (renombrar una tarea con el mismo título no ensucia el historial). Las tareas que no cambian se comparten entre versiones.

[[exercise:03-deshacer-y-rehacer.md-]]

```text
  · sin cambios: renombrar con el mismo título
    ☑ Comprar pan | ☐ Llamar al taller (ITV)
    ☐ Llamar al taller (ITV)
¿la tarea 2 se ha copiado? → false
↶ deshacer → borrar «Comprar pan»
↶ deshacer → renombrar la tarea 2
    ☑ Comprar pan | ☐ Llamar al taller
↷ rehacer → renombrar la tarea 2
    ☑ Comprar pan | ☐ Llamar al taller (ITV)
↷ rehacer tras un cambio nuevo → null
    ☑ Comprar pan | ☐ Llamar al taller (ITV) | ☐ Pagar la luz
¿el primer estado sigue intacto? → true
```

### Búsqueda con *debounce*

El buscador de la lección de orden superior, sin interfaz y con el tiempo simulado. Un reloj falso guarda las tareas programadas y las ejecuta al avanzar; `debounce` recibe sus temporizadores como opciones (en la página serían `setTimeout` y `clearTimeout`). La consulta se normaliza con un `pipe` de funciones puras y los resultados se **memoizan** por consulta normalizada, así que «TE NE» y «té ne» comparten caché. De nueve pulsaciones salen tres búsquedas reales.

[[exercise:04-busqueda-con-debounce.md-]]

```text
  t=640 · 🔎 «te n» → Té negro Assam
  t=1200 · 🔎 «te ne» → Té negro Assam
  t=1900 · 🔎 «te ne» (caché) → Té negro Assam
  t=2920 · 🔎 «cafe» → Café de Etiopía, Café de Colombia
  t=3700 · «x» es muy corto: no se busca
pulsaciones: 9 · búsquedas lanzadas: 3 (más las respondidas desde la caché)
```

### Árbol de categorías

Las categorías de una tienda de deportes forman un árbol de profundidad variable. Tres funciones recursivas cuentan los productos, construyen las migas de pan y generan las opciones de un `<select>` con sangría. La cuarta, `updateNode`, aplica un **actualizador** (una función que recibes como argumento) a un nodo y devuelve un árbol nuevo: solo se crean de nuevo los nodos del camino hasta el que cambia, y las demás ramas se comparten. Si el id no existe, devuelve el mismo árbol.

[[exercise:05-arbol-de-categorias.md-]]

```text
Total → 154 productos
Migas → Deportes › Montaña › Escalada › Cuerdas
(tabla: Deportes (154) · — Running (94) · — — Zapatillas (38) · …)
Escalada antes / después → 16 / 28
¿original intacto? → Ropa técnica
¿Natación compartida? → true
¿Montaña copiada? → true
¿id inexistente? → true
```

### Tubería de limpieza

Contactos importados de una hoja de cálculo, con espacios, mayúsculas, emails mal escritos, teléfonos en mil formatos y un duplicado. Cada paso es una función pura que trabaja con **un** registro, y tres funciones currificadas (`mapEach`, `keepIf`, `uniqueBy`) las convierten en pasos para una **lista**. `pipe` las encadena, y `tap` deja ver cuántos registros llegan a cada punto sin tocarlos. Las mismas piezas forman una segunda tubería que solo saca los emails.

[[exercise:06-tuberia-de-limpieza.md-]]

```text
▶ tubería
  filas importadas       → 6
  con email válido       → 4
  sin duplicados         → 3
(tabla: María José de la Fuente · Álvaro Ruiz · Ana Torres y Blanco, con email y teléfono normalizados)
¿datos de entrada intactos? → true
solo emails → ['mj.fuente@example.com', 'alvaro.ruiz@example.com', 'ana.torres@example.org']
```

### Limitador de llamadas

`once`, `after` y un limitador de **ventana deslizante** (como mucho tres peticiones por segundo), cada uno con su estado en un closure. Todos devuelven una `function` que llama a `fn.apply(this, args)`, y el ejemplo muestra por qué: un envoltorio hecho con una flecha llama al método como función simple y la URL sale `undefined/tracking/ES123`; el limitador, colocado como método, conserva el `this` de `shippingApi`. Al tercer rechazo, `after(3, …)` avisa al equipo.

[[exercise:07-limitador-de-llamadas.md-]]

```text
  🔌 conectando con https://api.example.com/v2…
connect ×3 → sesión-7f3a sesión-7f3a sesión-7f3a
🐛 flecha → undefined/tracking/ES123
t=   0 · A1 → https://api.example.com/v2/tracking/A1
…
t= 600 · A4 → ⏳ espera (t=600)
t= 900 · A5 → ⏳ espera (t=900)
t=1250 · A6 → https://api.example.com/v2/tracking/A6
…
t=1500 · A9 → ⏳ espera (t=1500)
  ⚠️ 3 peticiones rechazadas: avisa al equipo
rechazadas → ['A4', 'A5', 'A9']
```

### Perfilador de funciones recursivas

`profile` es un decorador que cuenta las llamadas de una función y la profundidad máxima que alcanza en la pila. Para que las llamadas **recursivas** también pasen por él, la función se reasigna (`fib = profile(fib)`), como hace un decorador `@` de Python. Compara Fibonacci ingenuo con el memoizado (misma profundidad, 21 891 llamadas frente a 39), perfila un método recursivo que conserva su `this` gracias a `apply` y provoca un desbordamiento de pila: el `finally` mantiene la cuenta de la profundidad correcta aunque la función termine con un error.

[[exercise:08-perfilador-de-recursion.md-]]

```text
fib(20) → 6765 · fib: 21891 llamadas, profundidad máxima 20
fibMemo(20) → 6765 · fibMemo: 39 llamadas, profundidad máxima 20
comentarios → 7 · countComments: 8 llamadas, profundidad máxima 4
countdown(2.5) → RangeError | Maximum call stack size exceeded
countdown(5) → despegue · countdown: 6 llamadas, profundidad máxima 6
```

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al final del código hay una función `check` que compara lo que obtienes con lo esperado e imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Al abrir cada ejercicio verás casi todo en rojo; tu objetivo es dejarlo todo en verde. Las instrucciones, las pistas y la solución están en el panel del ejercicio.

### Escribe tus propias utilidades de funciones

Cuatro utilidades que encontrarás en cualquier librería: `once`, `memoize` (con varios argumentos), `pipe` y `partial`. Una de las comprobaciones usa `once` para envolver un **método**, así que tu versión tiene que conservar `this`.

[[exercise:09-ej-utilidades-de-funciones.md-]]

### Recorre y limpia un árbol de carpetas

Cinco funciones recursivas sobre el árbol de un proyecto web: tamaño total, número de archivos, el archivo más grande, la ruta de un archivo y una limpieza **inmutable** que quita los temporales. Las comprobaciones verifican también que el original no cambia y que las carpetas sin temporales se comparten entre los dos árboles.

[[exercise:10-ej-arbol-de-carpetas.md-]]

### Caza los cinco bugs de la cafetería

El panel de pedidos de una cafetería tiene cinco bugs, uno por cada bestiario del módulo: una flecha que debía devolver un objeto, un método que pierde su `this`, `var` en un bucle con closures, un objeto de opciones sin `= {}` y un `let` olvidado que estropea la caja. Ninguno detiene el script: las comprobaciones atrapan los errores y los muestran como texto.

[[exercise:11-ej-caza-los-bugs.md-]]

## Resumen

- Un closure es el lugar natural para el estado privado: historiales, cachés, oyentes, contadores y temporizadores pendientes.
- Las fábricas, el currying y la aplicación parcial dan funciones configuradas una vez; la memoización evita repetir trabajo puro.
- Los envoltorios que pueden recibir métodos usan `function` y `fn.apply(this, args)`; los callbacks que llaman a un método usan una flecha o `bind`.
- Los cambios se expresan como funciones puras que devuelven estados nuevos; `===` detecta si algo cambió.
- La recursión recorre árboles y construye versiones nuevas compartiendo las ramas que no cambian.
- Lo que depende del tiempo recibe el reloj como parámetro: así se prueba con salidas exactas.

## Para profundizar

- [javascript.info: decoradores y redirecciones, call/apply](https://es.javascript.info/call-apply-decorators)
- [javascript.info: ámbito de variable y closures](https://es.javascript.info/closure)
- [MDN: Function.prototype.apply](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
- [Refactoring Guru: patrón observador (bus de eventos)](https://refactoring.guru/es/design-patterns/observer)
