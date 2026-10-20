# Ejemplos profesionales

## Por qué importa

Este módulo cambia la forma de escribir programas. Hasta ahora, una función era un trozo de código con nombre; ahora es un **valor** que se fabrica, se guarda, se combina y se pasa a otras funciones, y que recuerda su entorno. Con esas piezas se construyen muchas de las herramientas que usan las aplicaciones reales: librerías de validación, almacenes de estado, reintentos, tuberías de *middlewares*, cachés, buscadores con *debounce* o historiales de deshacer. Esta página reúne doce programas de ese tipo. Ninguno usa clases ni promesas, que llegan en módulos posteriores; lo que los hace profesionales son las **decisiones**, explicadas en el comentario inicial de cada uno.

## Qué tienen en común

- **Funciones pequeñas que se combinan.** Validadores, filtros, comparadores, *middlewares* y actualizadores son funciones de una sola tarea, fabricadas con su configuración y combinadas con funciones de orden superior (`all`, `pipe`, `compose`, `when`).
- **Estado privado en closures, sin variables globales.** Cachés, historiales, oyentes, temporizadores y contadores viven dentro de la fábrica que los usa, y salen al exterior solo a través de una API pequeña.
- **Datos inmutables.** Los cambios se expresan como funciones puras que devuelven un estado nuevo; lo que no cambia se comparte, y `===` basta para saber si algo cambió.
- **Recursión para lo anidado**, con una salida iterativa cuando la profundidad puede ser enorme.
- **Nada depende del entorno.** El tiempo se simula o se fija (`NOW`, relojes falsos, azar con semilla) y cada `Intl` lleva su `locale` y su `timeZone`, así que cada salida es exacta y se puede comprobar.
- **Los envoltorios conservan `this`** (`function` + `fn.apply(this, args)`) y los callbacks que llaman a métodos usan flechas o `bind`.

Los ejemplos con interfaz usan un mínimo de DOM y eventos (`querySelector`, `createElement`, `append`, `addEventListener`), que se estudian en el capítulo 6, y `setTimeout`, que se estudia en el módulo «Asincronía y event loop»; cada uno lo indica en un comentario.

## Programas de consola

### Librería de validación

El formulario de alta de un espacio de *coworking* se valida con piezas de una línea: `required()`, `minLength(10)`, `isEmail()`, `oneOf(PLANS)`, `minAge(18)`. Cada una es una fábrica que devuelve un validador (un closure que recuerda su configuración y su mensaje), y se combinan con `all` (el primer error), `optional` y `when` (solo si se cumple una condición sobre los demás campos, como pedir la empresa en el plan anual). El esquema tiene la misma forma que los datos, y `validate` lo recorre con **recursión**, devolviendo todos los errores con su ruta (`guests[1].email`). Fíjate en dos detalles: `isIsoDate` rechaza el 30 de febrero, que `Date` convertiría en marzo, y la edad se calcula comparando fechas como texto `AAAA-MM-DD`, sin zonas horarias.

[[exercise:01-libreria-de-validacion.md-]]

```text
▼ lucia.ortega@example.com: ✅ alta válida
▼ marta@@example.com: 10 errores
    name             Este campo es obligatorio
    email            El email no es válido
    …
    guests[1].email  El email no es válido
▼ bruno@example.org: 3 errores
    birthDate        Debes tener al menos 18 años
    company          El plan anual se factura a una empresa
    guests           Como mucho 3
newsletter → [{path: 'topics[1]', message: 'Elige css, js o a11y'}]
```

### Almacén de estado

La idea de Redux en unas pocas funciones y sin clases. Los *reducers* son funciones puras que devuelven el **mismo** estado si la acción no les concierne; `combineReducers` reparte el estado en rebanadas y conserva la raíz si nada cambia; `createStore` guarda el estado y los oyentes en un closure y solo avisa cuando `===` detecta un cambio. Los *middlewares* son funciones currificadas (`store => next => action`) que se encadenan con `reduceRight`: uno registra cada acción y otro rechaza las inválidas antes de llegar al *reducer*. El resumen del carrito es un selector memoizado por referencia: cambiar el tema no lo recalcula, porque la rebanada del carrito sigue siendo el mismo objeto.

[[exercise:02-almacen-de-estado.md-]]

```text
▶ cart/add
    🛒 3 unidades · 22,75 €
▶ cart/add
    ⚠️ producto desconocido «XX-99»
    · sin cambios
▶ preferences/toggleTheme
    ¿el tema ha tocado el carrito? → false
…
estado final → {"session":{"user":null},"cart":[],"preferences":{"theme":"oscuro"}}
¿el estado inicial sigue intacto? → {"session":{"user":null},"cart":[],"preferences":{"theme":"claro"}}
cálculos del resumen → 5 (uno por cada carrito distinto)
```

### Reintentos con espera exponencial

El proveedor de correo de una tienda está caído cinco segundos y hay cuatro emails que enviar. `retryWithBackoff` reintenta solo los errores **transitorios** (una dirección sin dominio falla al instante y no se reintenta), espera cada vez el doble con un ±20 % de *jitter* y se rinde al agotar sus intentos. Un cortacircuitos deja de llamar al proveedor tras tres fallos seguidos y prueba de nuevo con una sola llamada pasado el descanso. Todo funciona sin promesas: un planificador simulado ejecuta las tareas en orden de tiempo, y el azar sale de un generador con semilla, así que la línea de tiempo es idéntica en cada ejecución.

[[exercise:03-reintentos-con-espera.md-]]

```text
t=    0 ana@example.com   intento 1: ✗ 503 servicio no disponible · reintento en 403 ms
t=    0 luis@example.com  intento 1: ✗ 503 servicio no disponible · reintento en 499 ms
t=    0 pedro@example     intento 1: ✗ 550 dirección rechazada: pedro@example · no se reintenta
t=    0 ⚡ cortacircuitos: cerrado → abierto
…
t= 6750 ⚡ cortacircuitos: abierto → semiabierto
t= 6750 ⚡ cortacircuitos: semiabierto → cerrado
t= 6750 ana@example.com   intento 5: ✓ enviado
t= 7658 luis@example.com  intento 5: ✓ enviado
▼ Resumen
  ✅ ana@example.com   5 intento(s), t=6750 ms
  ✅ luis@example.com  5 intento(s), t=7658 ms
  ❌ pedro@example     1 intento(s), t=0 ms · 550 dirección rechazada: pedro@example
  ❌ sara@example.com  3 intento(s), t=1616 ms · ⚡ circuito abierto: ni se intenta
```

### El cambio con el mínimo de monedas

Un problema clásico resuelto de cuatro maneras. La recursión ingenua, que copia la definición, hace 66 282 llamadas para devolver 20 céntimos. La memoizada, fabricada por `makeChangeSolver` con su caché privada, guarda además qué moneda dio el óptimo para reconstruir el desglose sin recalcular. Con las monedas británicas anteriores a 1971, el algoritmo voraz («la moneda más grande que quepa») falla: 48 peniques son 30 + 12 + 6, pero bastan dos florines. La cuenta de las formas de pagar 2 € (73 682) memoiza por dos claves. Y el final muestra que el **orden** en que se prueban las monedas decide la profundidad de la recursión: de menor a mayor, 500 € desbordan la pila; de mayor a menor, bastan 257 marcos. Para importes enormes, la versión iterativa no usa la pila.

[[exercise:04-cambio-de-monedas.md-]]

```text
ingenua: 20 cént. → 1 moneda (66282 llamadas)
   4,99 € → 8 monedas: 2 × 2 € + 1 × 50 cént. + 2 × 20 cént. + 1 × 5 cént. + 2 × 2 cént.
  12,34 € → 10 monedas: 6 × 2 € + 1 × 20 cént. + 1 × 10 cént. + 2 × 2 cént.
   0,88 € → 6 monedas: 1 × 50 cént. + 1 × 20 cént. + 1 × 10 cént. + 1 × 5 cént. + 1 × 2 cént. + 1 × 1 cént.
memoizada → {calls: 9543, cached: 1234, maxDepth: 10}
48 peniques, voraz → 30 + 12 + 6 (3 monedas)
48 peniques, óptimo → 2 × 24 (2 monedas)
formas de pagar 2 € → {total: 73682, cached: 483}
500 €, monedas de menor a mayor → RangeError | Maximum call stack size exceeded
500 €, monedas de mayor a menor → profundidad máxima 257
iterativa: 2500,00 € → 1250 monedas
```

### Explorador de JSON

Una única función recursiva, `walk`, recorre cualquier JSON y llama a un **visitante** en cada nodo; aplanar los datos en rutas (`customer.addresses[0].zip`), contar los tipos y buscar valores son solo visitantes distintos. `setIn` actualiza sin mutar copiando únicamente el camino hasta el cambio, y `unflatten` reconstruye los datos a partir de las rutas, lo que `deepEqual` confirma. El recorrido lleva en un `WeakSet` los objetos del camino actual: así detecta una referencia circular (una línea de pedido que apunta a su pedido) antes de desbordar la pila, sin confundirla con un objeto compartido por dos ramas.

[[exercise:05-explorador-de-json.md-]]

```text
hojas: 26
(tabla: id → 'P-1042' · customer.name → 'Lucía Ortega' · customer.email → … )
tipos → {counts: {object: 9, string: 20, array: 3, number: 4, null: 1}, maxDepth: 4}
emails → ['customer.email', 'payment.receiptEmail']
getIn('lines[1].options.color') → negro
qty original / nueva → 2 / 3
¿customer compartido? → true
¿unflatten(flatten(order)) igual al original? → true
compartido → 2 hojas
circular → referencia circular en «lines[0].order»
```

### Tubería de *middlewares*

La API de reservas de un restaurante, simulada en memoria al estilo de Koa. Cada capa es una función `(ctx, next)`, y `compose` las convierte en una sola mediante una función `dispatch` que se llama a sí misma a través de `next`; un closure detecta el error de llamar a `next()` dos veces. Los *plugins* registran capas y rutas, y la aplicación recuerda en un `Set` cuáles ya están instalados. La capa de errores traduce `error.status` en respuesta y oculta los detalles de los fallos internos; la de tiempos usa `finally` para medir también las peticiones que fallan. Las diez peticiones de prueba recorren todos los códigos: 200, 201, 400, 401, 404, 409, 429 y 500.

[[exercise:06-tuberia-de-middlewares.md-]]

```text
  · el plugin authPlugin ya estaba instalado
req-001 GET  /tables        → 200 (4 ms) ["M1","M2","M3"]
req-002 POST /reservations  → 401 (0 ms) {"error":"Falta un token válido"}
req-003 POST /reservations  → 400 (0 ms) {"error":"El cuerpo no es JSON válido"}
req-004 POST /reservations  → 201 (12 ms) {"id":1,"name":"Ana","people":2,"table":"M1","by":"ana"}
…
req-007 GET  /tables        → 429 (0 ms) {"error":"Demasiadas peticiones: espera un momento"}
req-010 GET  /broken        → 500 (0 ms) {"error":"Error interno del servidor"}
        registro interno: TypeError: Cannot read properties of undefined (reading 'length')
middleware defectuoso → next() se ha llamado dos veces
```

### Fábrica de formateadores

La confirmación de un pedido en España, México y Estados Unidos. `createFormatters(market)` devuelve un objeto de funciones (dinero, porcentaje, peso, fecha, rango de entrega, «mañana», listas y plurales), todas closures con el `locale`, la moneda y la zona horaria de su mercado. Los objetos `Intl` se memoizan en una caché compartida: tras mil importes más, siguen siendo 27. Mira la línea de la entrega: a las 05:30 UTC, en Madrid y Nueva York la entrega es «mañana», pero en Ciudad de México todavía es la noche anterior y es «pasado mañana». Y el 1 de noviembre de 2026 Nueva York ya ha cambiado al horario de invierno, mientras que México no cambia de hora.

[[exercise:07-fabrica-de-formateadores.md-]]

```text
▼ ES · Europe/Madrid
  Realizado el 31 de octubre de 2026 a las 6:10
  Total 60,61 € (incluye un 15 % de descuento)
  Entrega mañana: domingo, 1 de noviembre, 16:00–20:00
▼ MX · America/Mexico_City
  Realizado el 30 de octubre de 2026 a las 11:10 p.m.
  Entrega pasado mañana: domingo, 1 de noviembre, 9:00 a.m. – 1:00 p.m.
▼ US · America/New_York
  5 items: cast-iron teapot, sencha green tea, and ceramic cup
  Delivery tomorrow: Sunday, November 1, 10:00 AM – 2:00 PM
  Parcel: 4.1 lb
tras 1000 importes más: 27 objetos Intl para 1032 usos
```

### Tareas con dependencias

El proceso de despliegue de una web (instalar, comprobar tipos, compilar, probar, publicar) es un grafo de tareas. Un recorrido en profundidad **recursivo** da el orden de ejecución, y la copia de la pila de llamadas que lleva consigo convierte un ciclo en un mensaje legible (`deploy → smoke → deploy`). El instante en que termina cada tarea es una definición recursiva que se memoiza, y el camino crítico se reconstruye hacia atrás siguiendo la dependencia que termina más tarde. El diagrama de Gantt en texto muestra qué se ejecuta en paralelo: 77 segundos en lugar de 120.

[[exercise:08-tareas-con-dependencias.md-]]

```text
orden → install · lint · typecheck · test · build-css · build-js · images · bundle · e2e · deploy
en serie: 120 s · en paralelo: 77 s (cálculos de finish: 10)
camino crítico → install → typecheck → build-js → bundle → e2e → deploy
▼ Gantt (1 carácter = 2 s)
  install   │██████████ 0–20 s
  typecheck │          █████ 20–29 s
  build-js  │               ██████ 29–41 s
  …
  deploy    │                                   ████ 70–77 s
si cambia build-css, repetir → bundle, e2e, deploy
⚠️ ciclo → dependencia circular: deploy → smoke → deploy
⚠️ errata → «docs» depende de «instal», que no existe
```

## Pequeñas aplicaciones con interfaz

Los cuatro ejemplos siguientes combinan este módulo con los capítulos de HTML y CSS: campos con su `label`, grupos con `fieldset` y `legend`, mensajes en regiones `aria-live`, foco visible y un diseño que se adapta al ancho. La lógica está separada de la interfaz: las funciones que calculan no tocan la página, y la página solo traduce eventos en llamadas y pinta los resultados. Pruébalos en la vista previa y ábrelos a pantalla completa con el botón ↗ si quieres más espacio.

### Buscador con resaltado

Un recetario de cocina española y latinoamericana con un buscador que ignora tildes y mayúsculas. El texto se «pliega» para buscar, pero se recuerda de qué posición del original viene cada carácter, así que el resaltado con `<mark>` cae sobre el texto original con sus tildes («maiz» resalta «maíz»). Cada término debe aparecer, y una coincidencia en el nombre pesa más que en una etiqueta o un ingrediente. La búsqueda se memoiza por la consulta plegada y se lanza con *debounce*; las sugerencias, al hacer clic, buscan al instante. Todo se pinta con `createElement` y `textContent`, nunca con `innerHTML`.

[[exercise:09-buscador-con-resaltado.md]]

### Lista de la compra con deshacer

Cada acción (añadir, marcar, subir, bajar, quitar) es un actualizador puro y currificado, y el historial vive en un closure con los estados pasados, el presente y los futuros. La lista de versiones muestra en qué punto del historial estás y cuántos objetos se reutilizan de la versión anterior. Los botones de deshacer y rehacer dicen en su `title` qué van a deshacer, y responden también a <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Z</kbd> (con <kbd>Mayús</kbd> para rehacer). Fíjate en el foco: aunque la lista se repinta entera, el control que tenía el foco lo recupera gracias a una clave en `data-focus-key`.

[[exercise:10-editor-con-deshacer.md]]

### Selectores de cantidad

Una sola fábrica, `createStepper`, crea cuatro tipos de selector: cantidades de una cesta (con el stock como máximo), adultos y niños de una reserva (que se limitan entre sí con `setMax` para no pasar de 8), un termostato con medios grados y formato `21,5 °C` con `Intl`, y la duración de una reunión que se lee y se escribe como «1 h 30 min». Cada selector guarda su valor en un closure y cumple el patrón *spinbutton* de WAI-ARIA: flechas, <kbd>RePág</kbd>, <kbd>AvPág</kbd>, <kbd>Inicio</kbd>, <kbd>Fin</kbd> y `aria-valuetext` con las unidades. Al quitar una línea de la cesta, `destroy` elimina sus oyentes y sus nodos, y la consola muestra cuántos selectores siguen activos.

[[exercise:11-selectores-de-cantidad.md]]

### Catálogo con filtros

El catálogo de una librería con búsqueda, géneros, idioma, precio máximo, disponibilidad y orden. Cada filtro sale de una fábrica que devuelve un predicado, y la consulta es una tubería (`pipe`) de los filtros activos más un comparador fabricado por `sortBy`, con desempate por título. Los recuentos junto a cada género aplican todos los filtros **menos** el de género, que es lo que espera quien usa una tienda online. Los resultados se memoizan por los criterios (la consola muestra cuántas consultas son reales) y los datos originales no se modifican nunca.

[[exercise:12-catalogo-con-filtros.md]]

## Resumen

- Fabrica funciones pequeñas con su configuración (validadores, filtros, comparadores, formateadores) y combínalas con funciones de orden superior.
- Guarda el estado en closures y expón solo una API mínima; devuelve siempre una función de baja o de destrucción para lo que registres.
- Expresa los cambios como funciones puras sobre datos inmutables: el historial, la detección de cambios y la memoización salen casi gratis.
- Recorre lo anidado con recursión, memoiza lo que se repite y pasa a una versión iterativa cuando la profundidad puede ser enorme.
- Inyecta el tiempo y el azar (relojes simulados, semillas, `NOW`) y fija `locale` y `timeZone`: así la salida es exacta y comprobable.
- Separa la lógica de la interfaz: la página traduce eventos en llamadas y pinta lo que devuelven.

## Para profundizar

- [Redux: conceptos básicos (reducers, store, middlewares)](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow)
- [Koa: middlewares en cascada](https://koajs.com/#cascading)
- [AWS Architecture Blog: espera exponencial y jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [WAI-ARIA APG: patrón spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)
- [MDN: Intl](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl)
