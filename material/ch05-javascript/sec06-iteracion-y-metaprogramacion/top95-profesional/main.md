# Ejemplos profesionales

## Por qué importa

Los iteradores, los generadores, los símbolos, los proxies y las plantillas etiquetadas son las piezas con las que están hechas muchas de las librerías que usarás: los *stores* reactivos de Vue y MobX, la copia al escribir de immer, los renderizadores como lit-html, los clientes SQL que no se dejan inyectar, los contenedores de dependencias de los frameworks, los paginadores de los SDK de las APIs. Esta página reúne doce programas de ese tipo, escritos con todo lo que has visto hasta ahora en el curso: los datos y las funciones de los primeros módulos, los prototipos y las clases, y las herramientas de metaprogramación de este.

Todos son programas de consola. Ábrelos con «▶ Run» o en el editor, y lee primero el bloque de comentarios del principio: explica las decisiones de diseño de cada uno.

## Qué tienen en común

- **Perezosos por defecto.** Logs, eventos, pedidos y tokens se procesan con generadores encadenados y *helpers*: solo se calcula lo que se consume, y varios ejemplos cuentan cuántos elementos llegaron a crearse para demostrarlo.
- **Limpieza garantizada.** Lo que se abre se cierra en un `finally` o en un `[Symbol.dispose]()`: los paginadores registran su cierre aunque el consumidor salga con `find`, los ámbitos de `using` liberan sus servicios en orden inverso y las tareas canceladas cuelgan el mandil.
- **Proxies que respetan al lenguaje.** Las trampas reenvían con `Reflect`, dejan pasar los símbolos y `toJSON`, no mienten sobre objetos congelados (los borradores usan objetivos vacíos) y nunca se imprimen directamente: se imprimen valores o `JSON.stringify`.
- **Datos frente a código.** Las plantillas etiquetadas tratan los trozos como código de confianza y los valores como datos: se escapan según su contexto o viajan como parámetros.
- **Símbolos como nombres privados.** Tokens de servicios, marcas de borrador, claves de estadísticas y metadatos usan símbolos: nada choca con nada, y nada aparece en JSON.
- **Nada depende del entorno.** El azar tiene semilla, el tiempo es simulado o se formatea en UTC con aritmética, `Intl` recibe siempre su idioma, y se cuentan llamadas, nunca milisegundos.

## Programas de consola

### Analizador de logs

El log de un servidor web es un generador **infinito**, como un `tail -f`: nunca se guarda entero. Cada etapa es otro generador (analizar con `split`, sin expresiones regulares, descartando las líneas cortadas; agrupar por minuto en flujo, como `itertools.groupby`; ventanas deslizantes de tres minutos) o un *helper*. Fíjate en las dos cifras de líneas generadas: la tabla de 12 minutos necesitó 487, y la búsqueda del primer minuto con más de un 5 % de errores, solo 328, porque `find` detuvo todo el flujo al encontrarlo.

[[exercise:01-analizador-de-logs.md-]]

```text
▼ Muestra del log
  2026-10-13T14:00:00Z GET /api/productos 200 72 ms
  …
(tabla: peticiones, errores 5xx, tasa de error y p95 de 14:00 a 14:11; el incidente de pagos sube los errores al 12.2 % a las 14:07)
líneas generadas → 487 | mal formadas → 5
ventanas de 3 min → 14:00-14:02: 0.0 % · … · 14:07-14:09: 9.6 % · 14:08-14:10: 5.0 % · 14:09-14:11: 1.7 %
🚨 primer minuto con más del 5 % de errores → 14:07 (12.2 %, p95 2237 ms)
   líneas que hizo falta generar → 328
más pedidos → GET /api/productos (154) · GET /api/productos/{id} (123) · POST /api/carrito (50)
```

### *Store* reactivo profundo

El estado de una tienda (usuario, carrito, interfaz) envuelto en proxies **anidados**, creados la primera vez que se lee cada objeto y guardados en un `WeakMap`, así que `state.cart === state.cart`. Cada cambio avisa con su ruta (`cart.items.0.qty`) a quien se suscribió a ese prefijo, los lotes agrupan varios cambios en un aviso y los valores calculados apuntan qué rutas leen para recalcularse **solo** cuando cambia una de ellas: el contador de recálculos no sube al cambiar el tema. Una clave symbol, `RAW`, da el objeto real, que sí se puede copiar con `structuredClone`; el proxy, no.

[[exercise:02-store-reactivo-profundo.md-]]

```text
inicio → 1 artículo(s), $210.00 | recálculos del total: 1
identidad estable → true true
▶ un cambio anidado
  🛒 carrito → cart.items.0.qty
  → 2 artículo(s), $420.00 | recálculos del total: 2
▶ un lote: tres cambios, UN aviso
  🛒 carrito → cart.items.1, cart.coupon, cart.items.0.qty
  → 4 artículo(s), $711.00 | recálculos del total: 3
▶ cambios que no tocan el total (no se recalcula)
  🎨 interfaz → ui.theme = oscuro
  → 4 artículo(s), $711.00 | recálculos del total: 3
…
structuredClone(state) → DataCloneError (un proxy no se puede clonar)
copia del estado real → {"items":[{"sku":"CAF-500","name":"Café de Chiapas","cents":21000,"qty":3},{"sku":"MOL-250","name":"Mole poblano","cents":16000,"qty":1}]}
JSON a través del proxy → {"theme":"oscuro"}
```

### Registros con esquema

Las fichas de producto de una tostadora de café, con un esquema hecho de reglas pequeñas que se combinan (`t.string`, `t.integer`, `t.oneOf`, `t.listOf`, `t.optional`). La fábrica valida **todo** al crear (un error con la lista de problemas) y devuelve un proxy que valida cada asignación y cada borrado; su trampa `defineProperty` cierra la puerta trasera de `Object.defineProperty`, y por eso `set` reenvía **sin** el proxy como `receiver`. Las listas se guardan congeladas, las actualizaciones son de todo o nada, `instanceof` funciona por marca con `Symbol.hasInstance` y la importación por lotes es un generador que entrega cada fila como registro o como lista de problemas.

[[exercise:03-registros-con-esquema.md-]]

```text
creado → {"sku":"CAF-500","name":"Café de Chiapas 500 g","cents":21000,"stock":40,"category":"café","tags":["orgánico"]}
⛔ coffee.cents = -5 → ValidationError: Product: 1 problema(s) → cents (mínimo 1)
⛔ coffee.price = 230 (errata) → ValidationError: Product: 1 problema(s) → price (campo desconocido)
…
⛔ Object.defineProperty(coffee, 'cents', …) → TypeError: Product: defineProperty('cents') se saltaría la validación
⛔ update { cents: 23000, stock: -1 } → ValidationError: Product: 1 problema(s) → stock (mínimo 0)
sin cambios tras los errores → {"sku":"CAF-500","name":"Café de Chiapas 500 g","cents":21000,"stock":40,"category":"café","tags":["orgánico"]}
cambios válidos → {"sku":"CAF-500","name":"Café de Chiapas 500 g","cents":23000,"stock":35,"category":"café"}
instanceof → true | copia con spread → false
importados → 2 | rechazados → 2
(tabla: línea, campo y problema de cada fila rechazada)
valor del inventario importado → $8,812.00
```

### `produce()`: copia al escribir

La idea de immer: la receta **modifica** un borrador como si fuera mutable (asignaciones, `push`, `splice`, `delete`) y el resultado es un estado nuevo y congelado que comparte, por identidad, todo lo que no cambió. Cada nivel se copia solo la primera vez que se escribe en él, y esa escritura marca a sus padres. El objetivo de cada proxy es un objeto vacío: con el estado congelado como objetivo, las invariantes impedirían devolver borradores. Los borradores se crean con `Proxy.revocable`, que devuelve el proxy y una función `revoke`; al terminar se revocan, y usar uno que se escapó de la receta lanza un error en vez de corromper nada.

[[exercise:04-produce-copia-al-escribir.md-]]

```text
(tabla: ¿mismo objeto que v1? estado false · user true · catalog true · cart false · items[0] false · items[1] true)
v1.cart → {"items":[{"sku":"CAF-500","qty":1},{"sku":"MOL-250","qty":2}],"coupon":null}
v2.cart → {"items":[{"sku":"CAF-500","qty":2},{"sku":"MOL-250","qty":2},{"sku":"CAC-070","qty":1}],"coupon":"CAFE10"}
¿todo congelado? → true true
v3.cart → {"items":[{"sku":"CAF-500","qty":2},{"sku":"CAC-070","qty":1}]}
sin cambios, ¿devuelve el mismo estado? → true
borrador usado fuera → TypeError | Cannot perform 'get' on a proxy that has been revoked
v1 → v2: comparten user, catalog
v2 → v3: comparten user, catalog
deshacer hasta v1 → [{"sku":"CAF-500","qty":1},{"sku":"MOL-250","qty":2}]
```

### Renderizador HTML

Una etiqueta `html` que escapa cada valor según su **contexto**, deducido del trozo que lo precede: texto, valor de atributo, URL (donde `javascript:` se bloquea, incluso escondido con un tabulador, porque el navegador los ignora dentro de una URL) o atributo booleano con la sintaxis de lit-html, `?disabled=${…}`. Prohíbe los atributos de evento con valores y los atributos sin comillas, anida plantillas y listas sin escaparlas dos veces y guarda el análisis de cada plantilla en un `WeakMap` con el array `strings` como clave: tres renderizados más no analizan nada nuevo. El resultado es un string; en el capítulo 6 lo meterás en la página.

[[exercise:05-renderizador-html.md-]]

```text
<section aria-labelledby="catalog-title">
  <h2 id="catalog-title">Catálogo (3)</h2>
  <article class="card" data-sku="CAF-500">
    <h3><a href="/productos/cafe-de-chiapas">Café de Chiapas</a></h3>
    <span class="badge">Nuevo</span>
    …
    <h3><a href="#url-bloqueada">Mole "de la abuela" &lt;poblano&gt;</a></h3>
    …
    <button type="button" disabled>Agotado</button>
  …
</section>
avisos → ['URL bloqueada: javascript:alert(document.cookie)']
análisis nuevos en 3 renderizados → 0 | plantillas analizadas → 3 (página, tarjeta y etiqueta)
⛔ onclick="${…}" → TypeError: Atributo de evento «onclick» con un valor: prohibido
⛔ alt=${…} sin comillas → TypeError: El atributo «alt» necesita comillas: alt="${…}"
```

### Calculadora de fórmulas

Las fórmulas de una hoja de presupuesto, evaluadas sin `eval` ni expresiones regulares. Un **tokenizador generador** lee el texto carácter a carácter; la clase `Lookahead` envuelve cualquier iterador y le añade `peek()`; un **parser descendente recursivo** construye un árbol con las precedencias de Python (`-3 ^ 2` es `-9`, la potencia se asocia por la derecha), y el evaluador solo conoce las variables de la hoja y tres funciones permitidas. Los errores llevan la columna, marcada con `^`, y un generador recursivo con `yield*` recorre el árbol para listar sus variables. Fíjate en la primera línea: `12500 * 1.16` da `14499.999999999998` en coma flotante, y por eso el resultado se muestra con `Intl`.

[[exercise:06-calculadora-de-formulas.md-]]

```text
✅ subtotal * (1 + iva) = 14,500
✅ max(precio - descuento, 0) * unidades = 4,020
✅ round(subtotal * (1 + iva) / meses, 2) = 2,416.67
✅ 2 ^ 3 ^ 2 = 512
✅ -3 ^ 2 = -9
⛔ 12 * (3 + )
             ^ columna 11: se esperaba un número, un nombre o «(» y llegó «)»
⛔ precio $ 2
          ^ columna 8: carácter inesperado «$»
…
árbol → {"type":"binary","op":"*","left":{"type":"call","name":"max","args":[{"type":"binary","op":"-","left":{"type":"name","name":"precio"},"right":{"type":"name","name":"descuento"}},{"type":"number","value":0}]},"right":{"type":"name","name":"unidades"}}
variables que usa → (3) ['precio', 'descuento', 'unidades']
tokens leídos hasta el error → 4 (el tokenizador se detuvo con el parser)
```

### Planificador cooperativo

Una mañana en una cafetería, simulada con tareas que son **generadores**: con `yield` piden dormir, enviar un valor por un canal o esperar uno con un plazo. El planificador, con un reloj simulado en minutos, las reanuda con `next(valor)`, les lanza un error con `throw()` cuando vence un plazo (Diego se va sin su frappé) y las cancela con `return()` a la hora de cerrar, momento en que los `finally` de los baristas se ejecutan. Un canal entrega cada pedido a **un** solo barista, y lo que nadie recoge se queda en la cola. Es el modelo del event loop del módulo siguiente y de `asyncio` en Python: una sola hebra y tareas que ceden el control en puntos explícitos.

[[exercise:07-planificador-cooperativo.md-]]

```text
[08:00] 🚪 llega Ana y pide americano
[08:00] ☕ Marta prepara americano para Ana (3 min)
…
[08:06] ☕ Joel prepara frappé para Diego (8 min)
[08:08] 😤 Diego se va sin su frappé: nadie envió nada por «listo:Diego» en 6 min
…
[08:14] 🔔 frappé para Diego, listo
[08:30] 🔒 hora de cerrar
[08:30] 🧺 Marta cuelga el mandil tras 3 bebida(s)
[08:30] 🧺 Joel cuelga el mandil tras 2 bebida(s)
(tabla: estado y resultado de cada tarea; los baristas, cancelados)
sin recoger → ['listo:Diego: frappé']
```

### Paginador con cursores

El historial de pedidos de una tienda, leído de una API que pagina con **cursores opacos**. `pages()` es un generador que pide cada página solo cuando el consumidor llega a ella, reintenta los fallos transitorios (un 503) y registra en un `finally` cuántas páginas leyó; `items()` aplana con `yield*`. La búsqueda de cuatro pedidos cancelados hace 4 peticiones (3 páginas y un reintento) en vez de 5, y la exportación por tandas guarda el cursor como punto de control, porque `take(2)` cierra el generador y la segunda parte necesita uno nuevo. La API es síncrona: en el módulo de asincronía será la misma estructura con promesas y `for await…of`.

[[exercise:08-paginador-con-cursores.md-]]

```text
▶ 4 pedidos cancelados de más de $500
  ↻ 503 Servicio no disponible: reintento 1 de 2
  (búsqueda: 3 página(s) leída(s))
  resultado → (4) ['P-1006 Sofía Ríos $1,300.00', 'P-1012 Iván Mena $1,240.00', 'P-1018 Jorge Lara $1,180.00', 'P-1024 Ana Ruiz $1,120.00']
  peticiones → 4 (la tercera falló y se reintentó)
▶ totales por estado (recorrido completo)
  (informe: 5 página(s) leída(s))
(tabla: pagado 16 · enviado 24 · cancelado 7, con sus totales)
  peticiones → 5
▶ exportar 2 páginas ahora y el resto después
  exporto P-1001…P-1010
  exporto P-1011…P-1020
  (exportación, parte 1: 2 página(s) leída(s))
  punto de control guardado → after:P-1020
  (exportación, parte 2: 3 página(s) leída(s))
  parte 2 → (3) ['P-1021…P-1030', 'P-1031…P-1040', 'P-1041…P-1047']
▶ un cursor manipulado
  (cursor malo: 0 página(s) leída(s))
  ⛔ ApiError: 400 Cursor no válido: after:P-9999
```

### Contenedor de dependencias

La caja de una cafetería montada con un contenedor de inyección de dependencias cuyos servicios se identifican con **símbolos**: dos plugins pueden registrar su propio «Logger» sin pisarse, y la descripción de cada símbolo da los mensajes de error. Hay tres vidas (singleton, scoped, transient), y cada ticket se cobra dentro de un ámbito declarado con `using`: al salir del bloque, también cuando la tarjeta es rechazada, sus servicios se liberan en orden inverso y la transacción se confirma o se deshace. Los errores de configuración (ciclos, tokens sin registrar, dependencias cautivas) explican la cadena que los provocó.

[[exercise:09-contenedor-de-dependencias.md-]]

```text
▶ ticket T-501
  📝 15:01 UTC 🔓 abre transacción
  📝 15:02 UTC 💾 confirma 1 pedido(s)
  📝 15:03 UTC ✅ T-501 cobrado: $167.04
  📝 15:04 UTC 🔒 cierra transacción
  🧹 ámbito «T-501» liberado
▶ ticket T-502 (la tarjeta falla)
  📝 15:05 UTC 🔓 abre transacción
  📝 15:06 UTC ↩️ deshace 1 pedido(s)
  📝 15:07 UTC 🔒 cierra transacción
  🧹 ámbito «T-502» liberado
  ⛔ tarjeta rechazada en T-502
pedidos confirmados → [{"ticket":"T-501","total":16704}]
…
(tabla: singleton, el mismo siempre · scoped, uno por ámbito · transient, uno por resolución)
…
  ⛔ ciclo → Ciclo: NotificationService → EmailService → NotificationService
  ⛔ token sin registrar → Servicio no registrado: Refunds
  ⛔ falta una dependencia → Servicio no registrado: PaymentGateway (lo necesita TipJar)
  ⛔ dependencia cautiva → Dependencia cautiva: DailyReport (singleton) no puede depender de OrderRepository (scoped)
  ⛔ scoped desde la raíz → OrderRepository vive en un ámbito: resuélvelo con scope.resolve()
  🔌 plugin: mi propio logger
¿los dos tokens «Logger» son el mismo? → false | descripción → Logger
```

### Trazas y memoria de funciones

Tres envoltorios de funciones hechos con proxies. `traced()` dibuja el árbol de llamadas con la trampa `apply`, `memoize()` guarda resultados en una caché LRU (un `Map` conserva el orden de inserción: un acierto se mueve al final y, si se llena, sale la primera clave) y `countInstances()` cuenta los `new` con la trampa `construct`, sin romper `instanceof`, los `#privados` ni las subclases. Las estadísticas se leen con una clave symbol del propio proxy. Fíjate en la recursión: solo pasa por el proxy porque la función se llama a sí misma a través de la variable reasignada. Y en lo que se mide: llamadas, nunca tiempos.

[[exercise:10-trazas-y-memoria-de-funciones.md-]]

```text
fib(20) sin caché → 21891 llamadas | con caché → 39 (21 cálculos)
fib(70) con la caché → 190392490709135 | llamadas nuevas → 101
▼ árbol de fib(4): 9 llamadas, profundidad 4
  fib(4) = 3
  │ fib(3) = 2
  │ │ fib(2) = 1
  │ │ │ fib(1) = 1
  │ │ │ fib(0) = 0
  │ │ fib(1) = 1
  │ fib(2) = 1
  │ │ fib(1) = 1
  │ │ fib(0) = 0
envío a 06700 (2 kg) → $140
…
(tabla: shippingCost: 6 llamadas, 1 acierto, 5 cálculos, 2 expulsiones)
expulsados de la caché → (2) ['["64000",5]', '["06700",2]']
creados → 2 | tamaños → (2) [2, 1]
instanceof → true true | name → Order
subclase → TrackedDelivery 1 | creados → 3
```

### Embudo de conversión

La analítica de una tienda calculada sobre un flujo de clics. La actividad de cada uno de los 40 usuarios es un generador con su propia semilla, y el flujo de la tienda los **mezcla** por orden de tiempo (en cada paso sale el evento más temprano de todos). Después se quitan los dobles clics, se parte la actividad en sesiones cuando pasan más de 30 minutos sin eventos y se calcula hasta qué paso del embudo llegó cada sesión, en total y por dispositivo con `Map.groupBy`. La última línea es perezosa de principio a fin: encontrar la primera compra de vainilla solo necesitó 57 eventos.

[[exercise:11-embudo-de-conversion.md-]]

```text
▼ Los primeros eventos de la mañana
  08:15 u015 (escritorio) view MOL-250
  …
eventos → 241 | sin dobles clics → 215
sesiones → 69 | usuarios → 40
(tabla del embudo: ver producto 69 · añadir al carrito 40 · iniciar pago 25 · comprar 19)
escritorio → 17 sesiones, conversión 12 %
móvil → 52 sesiones, conversión 33 %
más vistos → Café de Chiapas (44) · Chocolate de mesa (28) · Vainilla de Papantla (22)
primera compra de vainilla → 08:54 (u012) | eventos generados hasta entonces → 57
```

### Colecciones al estilo de Python

Un recetario de cocina mexicana analizado con las colecciones que echarías de menos al venir de Python. `Counter` hereda de `Map` y añade `mostCommon`, un generador `elements()` y la resta; `defaultDict` es un proxy que, con una fábrica que se llama a sí misma, da el árbol que se crea solo (`tree = lambda: defaultdict(tree)`); `pyList` añade índices negativos, `IndexError` y rebanadas con la sintaxis de Python como clave de texto (`temps['1:6:2']`), y `namedTuple` fabrica clases de registros inmutables que se desestructuran por posición. Fíjate en el `in` de `pyList`: `24 in temps` llega a la trampa como la clave `'24'`, así que la búsqueda compara también como texto.

[[exercise:12-colecciones-al-estilo-python.md-]]

```text
▼ Counter
  más usados → tortilla ×3 · cerdo ×3 · cebolla morada ×2
  get('azafrán') → 0 | total → 27 | etiqueta → [object Counter]
  lista de la compra → {"tortilla":1,"cebolla morada":1,"lima":1} | elements() → (3) ['tortilla', 'cebolla morada', 'lima']
▼ defaultdict
  por región → {"Puebla":["Mole poblano","Chiles en nogada"],"Yucatán":["Cochinita pibil","Sopa de lima"],"Guerrero":["Pozole rojo"],"Oaxaca":["Tlayuda"]}
  árbol → {"octubre":{"Centro":{"pozole":42,"tlayuda":18},"Coyoacán":{"pozole":35}}}
▼ Listas al estilo de Python
  temps[-1], temps['-3:'] → 16 (3) [22, 19, 16]
  temps['::-1'] → (7) [16, 19, 22, 24, 21, 17, 14] | temps['1:6:2'] → (3) [17, 24, 19]
  temps['5:1:-2'] → (2) [19, 24] | temps[':-1'].length → 6
  24 in temps → true | 30 in temps → false
  tras temps[-1] = 18 → 14, 17, 21, 24, 22, 19, 18
  ⛔ temps[7] → IndexError: list index out of range: 7 (len 7)
  ⛔ temps[-8] → IndexError: list index out of range: -8 (len 7)
▼ namedtuple
  la mejor → Tlayudas Lupita, en Oaxaca | Store(name="Tlayudas Lupita", city="Oaxaca", rating=4.9)
  with → Store(name="Tlayudas Lupita", city="Ciudad de México", rating=4.9) | original intacto → Oaxaca | ¿congelado? → true
  equals → true | campos → (3) ['name', 'city', 'rating'] | clase → Store
  ⛔ TypeError: Store espera 3 valores y recibió 1
```

## Resumen

- Un generador por etapa y *helpers* para unirlas: los flujos infinitos o grandes se procesan sin guardarlos, y `find` o `take` detienen todo el flujo.
- `finally` y `[Symbol.dispose]()` garantizan la limpieza; `using` la ata a un bloque.
- Los proxies profesionales reenvían con `Reflect`, dejan pasar lo que lee el lenguaje, cachean sus proxies hijos en un `WeakMap` y usan objetivos vacíos cuando el original está congelado.
- `Proxy.revocable` evita que un proxy sobreviva a su uso; `apply` y `construct` envuelven funciones y clases.
- Las plantillas etiquetadas escapan por contexto, parametrizan y cachean su análisis por sitio del código.
- Los símbolos nombran servicios, marcas y metadatos sin chocar con nada.

## Para profundizar

- [immer: cómo funciona (en inglés)](https://immerjs.github.io/immer/)
- [Vue.js: la reactividad en profundidad (en inglés)](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [lit-html: expresiones en plantillas (en inglés)](https://lit.dev/docs/templates/expressions/)
- [Python: collections](https://docs.python.org/es/3/library/collections.html)
