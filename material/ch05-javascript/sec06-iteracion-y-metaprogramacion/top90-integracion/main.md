# Integración: iteradores, generadores y metaprogramación

## Por qué importa

Las cinco lecciones de este módulo enseñan a enganchar tu código a los mecanismos del propio lenguaje: el protocolo iterable decide qué entra en un `for…of`, los generadores escriben iteradores pausando una función, los símbolos dan nombres que no chocan con nada, los proxies interceptan las operaciones de un objeto y las plantillas etiquetadas separan el texto que escribes de los datos que llegan. En un programa real se combinan, y sus sorpresas también: un *store* con proxies que agrupa cambios con `using`, una etiqueta SQL que usa símbolos bien conocidos para prohibir que la conviertan en texto, un buffer con `#privados` al que un proxy añade índices negativos sin romperlo.

Los ejemplos de esta página mezclan varias lecciones en cada programa, y los ejercicios te piden escribir generadores, trampas y arreglar los bugs típicos del módulo.

## Las decisiones que se repiten

Si dudas en un ejercicio, vuelve a esta tabla:

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| que tu colección funcione con `for…of`, spread, `Array.from` | `*[Symbol.iterator]() { … yield … }` | «Protocolo iterable», «Generadores» |
| recorrer datos que no caben en memoria o no terminan | un generador perezoso + *helpers* (`filter`, `map`, `take`) | «Generadores» |
| `zip`, `chunk`, ventanas: lo que `Iterator` no trae | un generador propio de pocas líneas | «Generadores» |
| recorrer un árbol | un generador recursivo con `yield*` | «Generadores» |
| liberar algo aunque el consumidor salga con `break` | `try/finally` en el generador, o `return()` en el iterador | «Protocolo iterable», «Generadores» |
| un dato o método que no choque con ningún nombre | una clave `Symbol('…')`; compartida por todo el programa, `Symbol.for('app.…')` | «Symbol» |
| liberar recursos al salir de un bloque | `using` + `[Symbol.dispose]()` (Chrome 134+) | «Symbol» |
| validar, dar valores por defecto o avisar de cada cambio | un `Proxy` con trampas que reenvían con `Reflect` y el `receiver` | «Proxy y Reflect» |
| envolver con un proxy una clase con `#privados`, un `Map` o un `Set` | leer con el objetivo como `receiver` y enlazar los métodos con `bind` | «Proxy y Reflect» |
| montar HTML, SQL o mensajes con datos de fuera | una plantilla etiquetada que trate distinto los trozos y los valores | «Plantillas etiquetadas» |

Dos reglas atraviesan la tabla. La primera: un **iterador se gasta**; guarda y pasa iterables, y convierte a array una sola vez cuando necesites varias pasadas. La segunda: el lenguaje también lee tus objetos (busca `toJSON`, `Symbol.iterator`, `Symbol.toPrimitive`…), así que una trampa `get` o una etiqueta debe dejar pasar lo que no es suyo.

## Ejemplos combinados

### Una tubería perezosa de ventas

Cien mil tickets de una cadena de panaderías, generados al vuelo con azar con semilla (los mismos números en cualquier navegador). La misma pregunta, «los tres primeros tickets grandes de Mérida», se responde dos veces: con arrays, que crean y filtran los cien mil, y con *helpers*, que se detienen en el ticket 31. Después, tres herramientas de `itertools` escritas con `yield`: `chunk` (totales por lotes de mil), `windowed` (una media móvil) y `zip`, que trabaja con iteradores a mano y por eso cierra en un `finally` los que no se agotaron, como hace `for…of` por ti.

[[exercise:01-tuberia-perezosa-de-ventas.md-]]

```text
arrays  → (3) [28, 30, 31] | tickets creados: 100000
helpers → (3) [28, 30, 31] | tickets creados: 31
¿el mismo resultado? → true
lotes → (3) ['$380,804.00', '$414,769.00', '$389,224.00'] | tickets creados: 3000
media móvil → 4.67 · 4.67 · 4.67 · 3.33 · 3.67
T-00001 · Puebla · 4 × concha = $56.00
T-00002 · Oaxaca · 5 × concha = $70.00
T-00003 · Querétaro · 5 × rosca = $1,900.00
```

### Un árbol de archivos

El proyecto de una web como árbol de carpetas. La clase `FileTree` es iterable con un método generador que delega con `yield*` en un generador **estático privado** recursivo, y ofrece otro recorrido, en anchura, con una cola. Como todo es perezoso, `find` deja de recorrer en cuanto encuentra el primer `.css`: el contador dice que tocó 4 nodos de 12. `Symbol.toStringTag` le pone nombre en `Object.prototype.toString`.

[[exercise:02-arbol-de-archivos.md-]]

```text
▼ Vista del árbol (profundidad primero)
  📁 tienda/
     📄 index.html (4.1 KB)
     📁 css/
        📄 base.css (2.0 KB)
        📄 catalogo.css (6.8 KB)
     …
anchura primero → tienda → index.html → css → img → js → base.css → catalogo.css → logo.svg → productos → carrito.js → cafe.webp → mole.webp
tamaño total → 121.1 KB
imágenes → (3) ['tienda/img/logo.svg', 'tienda/img/productos/cafe.webp', 'tienda/img/productos/mole.webp']
primer .css → tienda/css/base.css | nodos visitados: 4 de 12
los 2 más grandes → (2) ['mole.webp', 'cafe.webp']
etiqueta → [object FileTree]
```

### Un buffer circular

Las últimas cinco lecturas de un sensor de humedad: cada lectura nueva pisa la más antigua. La clase guarda todo en `#privados`, se recorre con un método generador `values()` (que trae los *helpers*), se convierte en número (la media) o en texto con `Symbol.toPrimitive` y lleva su etiqueta. Después, un proxy le añade índices al estilo de Python (`readings[-1]`). El proxy lee y enlaza los métodos **sobre el objetivo**, porque los getters y métodos usan `#privados`; la última línea muestra lo que pasa sin esa precaución.

[[exercise:03-buffer-circular.md-]]

```text
en orden → (5) [64, 70, 68, 75, 73]
at(0), at(-1) → 64 73
plantilla → 5 lecturas, media 70.0 % | ¿media ≥ 70? → true
subidas → ·↑↓↑↓
etiqueta → [object RingBuffer]
readings[-1], readings[0] → 73 64
tras push → (5) [70, 68, 75, 73, 81] | size → 5
plantilla → 5 lecturas, media 73.4 %
🐛 proxy sin enlazar → TypeError | Cannot read private member #size from an object whose class did not declare it
```

### Un formulario que conversa

Un bot de reservas para una fonda escrito como generador: cada `yield` entrega una pregunta y recibe la respuesta, que llega con `next(respuesta)`; si no vale, la pregunta se repite con una pista. La reserva terminada se **devuelve** con `return`, y por eso el «chat» recorre la conversación con `next()` a mano: un `for…of` no podría enviar respuestas y además perdería el valor del `return`. La conversación se puede terminar desde fuera con `return()` (el cliente cancela) o con `throw()` (nadie responde), y el `finally` se ejecuta en los tres casos.

[[exercise:04-formulario-conversacional.md-]]

```text
▼ Conversación completa (con respuestas que no valen)
    🤖 ¿A nombre de quién?
    🙋 Ana Martínez
    🤖 ¿Cuántas personas?
    🙋 catorce
    🤖 ⚠️ un número del 1 al 12. ¿Cuántas personas?
    …
    🙋 sí
    (conversación cerrada)
  ✅ reserva → {"name":"Ana Martínez","guests":4,"time":"20:30","terrace":true}
▼ El cliente cancela
    …
    🙋 /cancelar
    (conversación cerrada)
  resultado → null
▼ Nadie responde
    …
    🙋 ⏰
    (conversación cerrada)
    ⛔ sin respuesta en 5 minutos
  resultado → null
```

### Una configuración validada

La configuración de una tienda en línea, cargada por capas (valores por defecto, archivo, entorno) y protegida con un proxy que valida al cargar y en cada asignación, y que detecta las erratas también al **leer**. La trampa `get` deja pasar los símbolos y `toJSON`, porque los lee el propio lenguaje (sin esa excepción, `JSON.stringify` lanzaría «clave desconocida»). Los metadatos (de dónde salió cada valor, cuántos cambios hubo) viven en una clave `Symbol.for`, invisible para JSON y `Object.keys` pero accesible desde cualquier parte del programa; el bloqueo es un método con un símbolo local, que solo puede usar quien lo tiene.

[[exercise:05-configuracion-validada.md-]]

```text
lecturas → Café La Huasteca MXN 0.16 24
JSON → {"storeName":"Café La Huasteca","currency":"MXN","taxRate":0.16,"pageSize":24,"maintenance":true}
Object.keys → (5) ['storeName', 'currency', 'taxRate', 'pageSize', 'maintenance']
origen → {"storeName":"config.json","currency":"por defecto","taxRate":"por defecto","pageSize":"config.json","maintenance":"entorno"}
⛔ leer config.pageSise → [unknown-key] clave desconocida «pageSise»
⛔ config.taxRate = 1.6 → [bad-value] taxRate = 1.6: fuera de 0-0.3
⛔ config.currency = 'GBP' → [bad-value] currency = "GBP": debe ser MXN, USD, EUR
⛔ config.pageSize = 24.5 → [bad-value] pageSize = 24.5: debe ser un entero
⛔ config.theme = "oscuro" → [unknown-key] clave desconocida «theme»
⛔ delete config.currency → [no-delete] no se puede borrar currency
⛔ tras bloquear → [locked] bloqueada: no se puede cambiar taxRate
cambios en ejecución → 1 | bloqueada → true | taxRate → 0.08
⛔ al cargar → [bad-value] pageSize = "20": debe ser de tipo number
```

### Un *store* con deshacer

El editor de la ficha de un producto, con deshacer y rehacer. Es el *store* de la lección «Proxy y Reflect» con un historial: cada asignación es un paso, y los cambios hechos dentro de un bloque `using publishing = product.batch('publicar')` se agrupan en **un** paso y **un** aviso, que se emiten cuando el bloque termina y se llama a `[Symbol.dispose]()`. Deshacer también asigna a través del proxy, así que una bandera evita que esas asignaciones se apilen como pasos nuevos. El historial se recorre con un generador, del paso más reciente al más antiguo.

[[exercise:06-store-con-deshacer.md-]]

```text
▶ ediciones sueltas: un paso cada una
  🔔 cents (cents: 21000 → 23500)
  🔔 stock (stock: 12 → 10)
▶ «publicar» cambia tres campos en UN paso
  🔔 publicar (name: "Café de Chiapas" → "Café de Chiapas 500 g", published: false → true, stock: 10 → 9)
  estado → {"name":"Café de Chiapas 500 g","cents":23500,"stock":9,"published":true}
  historial → (3) ['publicar', 'stock', 'cents']
▶ deshacer dos pasos
  🔔 ↩️ deshacer «publicar» (stock: 9 → 10, published: true → false, name: "Café de Chiapas 500 g" → "Café de Chiapas")
  🔔 ↩️ deshacer «stock» (stock: 10 → 12)
  estado → {"name":"Café de Chiapas","cents":23500,"stock":12,"published":false}
▶ rehacer uno
  🔔 ↪️ rehacer «stock» (stock: 12 → 10)
  estado → {"name":"Café de Chiapas","cents":23500,"stock":10,"published":false}
▶ un cambio nuevo borra lo que quedaba por rehacer
  🔔 cents (cents: 23500 → 22000)
  ¿se puede rehacer? → false
  los 2 pasos más recientes → (2) ['cents', 'stock']
```

### Un constructor de consultas SQL

Las consultas del panel de pedidos, montadas con una etiqueta `sql` que nunca mete un dato en el texto: cada valor se convierte en un parámetro `$1`, `$2`… Los fragmentos se anidan (las condiciones del `WHERE` son consultas pequeñas) y sus parámetros se renumeran al aplanarlos; cualquier iterable (un array, un `Set`) se expande para `IN`; los nombres de tabla pasan por una validación carácter a carácter. `Symbol.toPrimitive` lanza un error si alguien intenta `'Consulta: ' + query`, porque convertir la consulta en texto sería volver a mezclar datos y código.

[[exercise:07-constructor-de-consultas.md-]]

```text
▶ con todos los filtros (y un intento de inyección)
  SELECT id, customer, total FROM "orders" WHERE city = $1 AND total >= $2 AND status IN ($3, $4) ORDER BY total DESC LIMIT $5
  params → ["Mérida' OR '1'='1' --",500,"pagado","enviado",20]
▶ sin filtros
  SELECT id, customer, total FROM "orders" ORDER BY total DESC LIMIT $1
  params → [20]
▶ fragmento reutilizado
  SELECT count(*) FROM "orders" WHERE total >= $1
  params → [1000]
⛔ identifier('orders; DROP TABLE users') → TypeError: Nombre de tabla o columna no válido: «orders; DROP TABLE users»
⛔ statuses: [] → RangeError: IN con una lista vacía
⛔ 'Consulta: ' + query → TypeError: Una consulta no se convierte en texto: usa .text y .params
etiqueta → [object Sql]
```

### Mensajes traducidos

Una etiqueta de traducción para una tienda en español y en inglés. La clave del catálogo se calcula a partir de los **trozos** de la plantilla (`'Hola, {0}: tu pedido de {1} llega el {2}.'`), y cada traducción puede reordenar los valores. El análisis de cada mensaje se guarda en un `WeakMap` cuya clave es el array `strings`, que es el mismo en cada ejecución del mismo sitio del código: 8 llamadas, 6 análisis. Los números y las fechas se formatean con `Intl`, siempre con idioma y zona horaria explícitos, y los objetos que lo necesitan (el dinero, los plurales) se formatean solos con un **protocolo propio**: un método cuya clave es un símbolo.

[[exercise:08-mensajes-traducidos.md-]]

```text
▼ es-MX
  Hola, Valeria: tu pedido de $1,250.50 llega el 16 de octubre de 2026.
  Llevas 1 producto en el carrito.
  Llevas 3 productos en el carrito.
  Mensaje sin traducir: 1,234.5 puntos.
▼ en-US
  Hi Valeria! Your MX$1,250.50 order arrives on October 16, 2026.
  You have 1 item in your cart.
  You have 3 items in your cart.
  Mensaje sin traducir: 1,234.5 puntos.
llamadas a t → 8 | mensajes analizados → 6 (uno por sitio del código e idioma)
```

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al final del código hay una función `check` que calcula cada resultado (atrapando los errores, para que un fallo no detenga el resto) y lo compara con lo esperado. Imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Las instrucciones, las pistas y la solución están en el panel del ejercicio.

### `itertools` en JavaScript

Seis herramientas de `itertools` que los *helpers* no traen: `range` (que debe validar **al llamarla**, no en el primer `next()`), `cycle` (que funcione también con un iterador de un solo uso), `batched`, `pairwise`, `zip` (que cierre los iterables que no se agotaron) y `takeWhile`. Al abrirlo, las doce comprobaciones salen en rojo.

[[exercise:09-ej-itertools-en-javascript.md]]

### Colecciones al estilo de Python

Tres proxies: un `defaultdict` que crea las claves que faltan (pero no las que lee el propio lenguaje, como `toJSON` o los símbolos), una lista con índices negativos e `in` que busca valores, y una vista de solo lectura que protege también los objetos anidados. Tres comprobaciones ya salen ✓ al abrirlo: vigilan que tu `defaultdict` no cree claves de más, y deben seguir en verde.

[[exercise:10-ej-colecciones-al-estilo-python.md]]

### Caza los seis bugs de la heladería

El panel de una heladería tiene seis bugs, uno por cada idea con sorpresa del módulo: un objeto en un `for…of`, un iterador recorrido dos veces, una limpieza escrita fuera del `finally`, dos `Symbol()` que deberían ser el mismo, un proxy que rompe una clase con `#privados` y una etiqueta `html` que escapa lo que no debe. Ninguno detiene el script; tres comprobaciones ya salen ✓ y deben seguir así.

[[exercise:11-ej-caza-los-bugs.md]]

## Resumen

- Una clase se vuelve iterable con un método generador; los generadores recursivos con `yield*` recorren árboles de forma perezosa.
- Las tuberías con *helpers* y generadores propios (`chunk`, `windowed`, `zip`) solo procesan lo que se consume; con arrays, todo.
- Quien maneja iteradores a mano (como `zip`) debe cerrarlos con `return()`; `for…of`, la desestructuración y los *helpers* lo hacen solos.
- Un generador con `next(valor)` lleva una conversación; su resultado final se recoge del `done: true`, no con `for…of`.
- Las claves symbol guardan metadatos y protocolos propios sin ensuciar JSON ni chocar con nadie; `using` agrupa y libera.
- Un proxy que valida o vigila debe dejar pasar lo que lee el lenguaje (símbolos, `toJSON`) y, con `#privados`, trabajar sobre el objetivo.
- Las etiquetas separan código (trozos) y datos (valores): parámetros SQL, HTML escapado, mensajes traducidos con caché por sitio.

## Para profundizar

- [MDN: protocolos de iteración](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Iteration_protocols)
- [Python: itertools (recetas)](https://docs.python.org/es/3/library/itertools.html#itertools-recipes)
- [javascript.info: Proxy y Reflect](https://es.javascript.info/proxy)
- [OWASP: consultas parametrizadas (en inglés)](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html)
