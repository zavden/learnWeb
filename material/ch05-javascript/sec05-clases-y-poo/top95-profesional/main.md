# Ejemplos profesionales

## Por qué importa

Las clases son la forma en que se organiza la mayor parte del código JavaScript de las aplicaciones reales: modelos de dominio, capas de datos, librerías de validación, máquinas de estados, componentes de interfaz. Esta página reúne doce programas de ese tipo, escritos con todo lo que has visto hasta ahora en el curso: los datos y las funciones de los primeros módulos, los prototipos del módulo anterior y las clases, los privados, la herencia, los protocolos, los mixins y los patrones de este.

Varios de ellos resuelven problemas que ya conoces del módulo anterior (la biblioteca, el emisor de eventos, el dinero, el formateador con *plugins*), ahora con clases. Compáralos: el comportamiento es el mismo, pero los métodos ya no salen en los `for…in`, los estáticos se heredan sin ayuda, los datos internos son privados de verdad y los errores tienen su propio tipo.

## Qué tienen en común

- **Estado privado, interfaz pequeña.** Lo que un objeto no debe exponer (saldos, pilas de deshacer, mapas internos, oyentes) va en campos `#privados`; se lee con getters sin setter y se cambia con métodos que validan.
- **Objetos de valor inmutables.** Dinero, cantidades, vectores, intervalos de tiempo y movimientos de almacén son privados, se congelan (solo si `new.target` es su clase) y sus operaciones devuelven objetos nuevos. Se comparan con `equals`, nunca con `===`.
- **Errores con tipo.** Cada dominio tiene su jerarquía (`LibraryError`, `InventoryError`, `CurrencyError`…) con `name`, un `code` que el programa consulta y, cuando un fallo envuelve a otro, `cause`. Un `catch` relanza lo que no es suyo.
- **Bases abstractas y polimorfismo.** `Rule`, `Command`, `Plugin`, `Repository` y `Component` se protegen con `new.target` y un método que lanza «debe implementar…»; el resto del código trata igual a todas sus subclases.
- **Composición antes que herencia.** El reproductor *tiene* una máquina de estados, la caché *envuelve* un repositorio, el formateador *contiene* sus *plugins* y las reglas compuestas *contienen* otras reglas. La herencia se reserva para los «es un» de verdad.
- **Estáticos con intención.** Fábricas (`Money.of`, `CatalogItem.fromJSON`, `Component.mount`) que usan `new this(…)` para que las subclases las hereden; registros y contadores en estáticos privados nombrados por su clase.
- **Nada depende del entorno.** Las fechas se crean desde instantes ISO con `Z` o con desfase, `Intl` recibe siempre su idioma y su zona horaria, y el tiempo se simula con relojes inyectados.

Los ejemplos de consola usan grupos y tablas: ábrelos con «▶ Run» o en el editor y expande los objetos para ver su cadena de prototipos. El último ejemplo tiene interfaz y usa un mínimo de DOM (`querySelector`, `createElement`, `addEventListener`), que se estudia en el capítulo 6.

## Programas de consola

### Biblioteca con clases

El modelo de una biblioteca municipal: ejemplares (`CatalogItem` → `Book`, `Magazine`, `Film`), socios (`Member` → `StudentMember`), préstamos y la biblioteca que los compone. Las reglas que cambian con el tipo (días de préstamo, multa diaria, máximo de préstamos, descuento de estudiante) eran valores en cada prototipo en la versión del módulo anterior; aquí son **campos estáticos** que cada subclase sombrea, y las instancias los leen con `this.constructor`: la tabla final dice de qué clase sale cada regla. El catálogo se carga desde JSON con un registro de tipos, el ISBN se valida con su dígito de control y los errores llevan un `code` que el programa traduce. Fíjate en los préstamos: son objetos **inmutables**, y devolver un libro no modifica el préstamo, lo sustituye por otro creado con `withReturn`.

[[exercise:01-biblioteca-con-clases.md-]]

```text
▼ Alta del catálogo
  ⛔ CatalogError [bad-isbn] «Rayuela»: el ISBN 978-84-9759-234-6 no es válido
  ⛔ CatalogError [bad-id] «Amores perros»: el código LIB-0009 debe empezar por DVD-
  ⛔ CatalogError [bad-type] Tipo de ejemplar desconocido: «podcast»
▼ Préstamos y devoluciones
  1 sep ✅ Lucía Moreno se lleva 🎬 «Roma» (2018) hasta el 4 sep
  1 sep ⛔ reference-only: 📰 «Arqueología Mexicana», n.º 199 es de consulta en sala
  …
  7 sep ✅ Lucía Moreno devuelve 🎬 «Roma» (2018): 3 día(s) tarde, multa $45.00
  10 sep ✅ Pablo Ibáñez devuelve 📰 «Arqueología Mexicana», n.º 198: 2 día(s) tarde, multa $2.00
  24 sep ⛔ suspended: Pablo Ibáñez tiene préstamos vencidos
(tabla de vencidos y tabla de reglas: Book 14 días, heredado de CatalogItem · Magazine 7 · Film 3)
Object.keys(película) → (2) ['title', 'year'] | id → DVD-0002
préstamo → abierto | vence → 4 oct | ¿congelado? → true
```

### Inventario y errores de dominio

El almacén de una tostadora de café: entradas desde un CSV, reservas de pedidos, envíos, cancelaciones y recuentos físicos. El estado (existencias, reservas, historial) es privado, y cada cambio queda en un **movimiento** inmutable creado por una fábrica estática con número correlativo. La reserva de un pedido es **atómica**: valida todas las líneas y, si alguna falla, no reserva ninguna y lanza un único `BatchError` que contiene todos los problemas. Cada línea mala del CSV se convierte en un error del dominio con el error original como `cause`. El almacén es iterable: el historial se recorre con `for…of` y la desestructuración sin exponer el array.

[[exercise:02-inventario-y-errores-de-dominio.md-]]

```text
▼ Importar entradas
  ⛔ Línea 3 del CSV → SyntaxError: «MOL-RUTA-01;cinco;ALB-1032» no tiene el formato sku;cantidad;albarán
  ⛔ Línea 4 del CSV → UnknownSkuError: No existe el artículo CAF-OAXA-500
▼ Pedidos
  ✅ PED-2001 reservado
  ⛔ El pedido PED-2002 no se puede reservar: 3 problema(s)
     · [out-of-stock] CAF-CHIA-500: se piden 30 y hay 28 disponibles
     · [bad-quantity] Cantidad no válida: 0
     · [unknown-sku] No existe el artículo TAZ-0001
  …
recuento de CAF-CHIA-500 → diferencia -1
(tabla: existencias, reservadas y disponibles de cada artículo)
historial:
  #1 entrada CAF-CHIA-500    40  ALB-1031
  …
  #6 ajuste  CAF-CHIA-500    -1  RECUENTO-OCT
¿el primer movimiento sigue igual? → true | claves del almacén → []
```

### Bus de eventos y *store*

El estado de un carrito organizado como lo hacen las librerías de estado: un *store* con un **reductor puro** (estado y acción entran, sale un estado nuevo), estado congelado en profundidad, *middleware* encadenado con `reduceRight` (uno valida, otro anuncia los cambios) y suscripciones con **selector**, que solo avisan cuando cambia la parte del estado que les interesa. El bus de eventos tiene un esquema: emitir un evento no declarado, o sin los datos obligatorios, es un error inmediato. Mira qué no produce ningún aviso: aplicar el mismo cupón dos veces (el reductor devuelve el mismo objeto) y una acción desconocida.

[[exercise:03-bus-de-eventos-y-store.md-]]

```text
▼ Acciones
  ▶ cart/add ×1
    🛒 contador: 0 → 1
    💲 total: $210.00
    📡 cart/changed {"type":"cart/add"}
  …
  ▶ coupon/apply
  ▶ cart/add ×0
    ⛔ ActionError: Acción «cart/add» rechazada: cantidad 0
  ▶ ui/theme
  ▶ cart/remove (el contador ya se dio de baja)
    💲 total: $0.00
    📡 cart/changed {"type":"cart/remove"}
▼ Pagos
  🎉 primer pago de la sesión: $378.00
  …
  ⛔ TypeError: Evento no declarado: «checkout/finished»
  ⛔ TypeError: «checkout/started» necesita: totalCents
⛔ TypeError: Cannot add property 0, object is not extensible
estado final → {"items":[],"coupon":"CAFE10"}
```

### Librería de validación

Una librería de validación para formularios y APIs. `Rule` es una base abstracta; las reglas atómicas (tipo, longitud, rango, valores admitidos, predicado) heredan de ella, y las compuestas (`AndRule`, `OrRule`, `Optional`, `WithMessage`, `ObjectRule`, `ArrayRule`) **contienen** otras reglas y delegan en ellas, así que se combinan sin límite. La API es fluida e **inmutable**: `rule.optional()` devuelve una regla nueva y la original sigue siendo obligatoria. Un objeto pequeño, `v`, hace de lenguaje para describir esquemas. `check` reúne **todos** los problemas con su ruta (`addresses[0].postalCode`) en un solo `ValidationError`.

[[exercise:04-libreria-de-validacion.md-]]

```text
⛔ 9 problema(s) de validación
(tabla: name too-short · contact any-of · age range · plan one-of · password weak · addresses[0].postalCode digits · addresses[1].city too-short · addresses[1].floor unknown · newsletter unknown)
✅ alta válida → true
¿la misma regla al hacerla opcional? → false | ¿sigue obligatoria? → true
⛔ TypeError: Rule es abstracta: usa una regla concreta
⛔ Error: Broken debe implementar validate(value, path)
```

### Máquina de estados de un reproductor

Una máquina de estados genérica gobierna un reproductor de audio. La configuración (estados, eventos, destinos y **guardas**) se valida al crear la máquina, así que un destino mal escrito falla en el arranque y no en mitad de una sesión. El reproductor **compone** una máquina y ofrece acciones con sentido (`play`, `pause`, `seek`); su posición y su pista son privadas, y un reloj simulado (`tick`) hace avanzar el tiempo. Las acciones imposibles lanzan un `TransitionError` que explica por qué, y la tabla de qué admite cada estado sale de la propia configuración.

[[exercise:05-maquina-de-estados.md-]]

```text
▼ Sesión
  play()                         ⛔ «PLAY» en «idle»: no está permitido
  load(«La Llorona»)             → ⏹ ready 0:00 / 4:12 · La Llorona
  …
  seek(400)                      ⛔ «SEEK» en «paused»: la posición está fuera de la pista
  seek(240)                      → ⏸ paused 4:00 / 4:12 · La Llorona
  play()                         → ▶ playing 4:00 / 4:12 · La Llorona
  tick(20)                       → ⏮ ended 4:12 / 4:12 · La Llorona
  …
  load(«Cielito lindo» en .ogg)  → ⚠️ error 0:00 / 3:05 · Cielito lindo
  load(«Cielito lindo» en .mp3)  → ⏹ ready 0:00 / 3:05 · Cielito lindo
transiciones → 13 | las tres últimas → (3) ['loading --FAIL--> error', 'error --LOAD--> loading', 'loading --LOADED--> ready']
(tabla: los eventos que admite cada estado)
⛔ configuración con una errata → TypeError: idle --PLAY--> «plying»: estado destino desconocido
```

### Vectores y transformaciones

La geometría de un editor de diseño: `Vec2`, `Matrix2D` y `Polygon` son objetos de valor privados y congelados. Sin sobrecarga de operadores, se suma con `v.plus(w)`, y `Symbol.toPrimitive` da texto en las plantillas pero lanza un error si alguien escribe `v + w`. `Symbol.iterator` permite desestructurar un vector (`const [x, y] = v`). Las matrices usan el orden de la función `matrix()` de CSS, y `then` compone transformaciones en el orden en que se aplican: girar 30° alrededor del centro de una tarjeta produce exactamente la matriz que escribiría el navegador para `transform-origin: 60px 40px; transform: rotate(30deg)`. Mira cómo el área se conserva al girar (determinante 1) y se multiplica por 4 al ampliar al doble.

[[exercise:06-vectores-y-transformaciones.md-]]

```text
centro → (60, 40) | ¿el giro lo deja en su sitio? → true
(tabla: los cuatro vértices, originales, girados y girados y ampliados)
áreas → original 9600 | girado 9600 | ×2 38400
determinantes → giro 1 | giro y ×2 4
CSS → transform: matrix(0.866, 0.5, -0.5, 0.866, 28.0385, -24.641);
¿la inversa deshace el giro? → true
fromAngle(60°, 10) → 5 8.66 | JSON → {"center":[60,40]}
⛔ TypeError: Vec2 no se convierte a número: usa .length, .plus() o .equals()
⛔ RangeError: La matriz no tiene inversa (determinante 0)
⛔ RangeError: El vector cero no tiene dirección
⛔ RangeError: Un polígono necesita al menos 3 vértices
```

### Editor con deshacer

Deshacer y rehacer con el patrón **comando**: cada cambio es un objeto que sabe aplicarse y revertirse. `Command` es abstracta; `InsertText` y `DeleteRange` heredan de ella, y `MacroCommand` es un comando hecho de comandos (composición) del que hereda `ReplaceAll`, que reemplaza todas las apariciones de la última a la primera para no mover las posiciones pendientes y se deshace de una vez. `InsertText.mergeWith` fusiona las pulsaciones seguidas en una palabra, como los editores reales. El historial guarda sus pilas en privados, tiene un límite estático por defecto y genera las etiquetas del menú («Deshacer escribir «rojo»»). Un comando nuevo vacía la pila de rehacer.

[[exercise:07-editor-con-deshacer.md-]]

```text
escribir (21 teclas)       "Mole de olla y arroz "                    [Deshacer escribir «arroz »] [Nada que rehacer]
escribir «rojo»            "Mole de olla y arroz rojo"                [Deshacer escribir «rojo»] [Nada que rehacer]
reemplazar o → 0           "M0le de 0lla y arr0z r0j0"                [Deshacer reemplazar «o» por «0» (5)] [Nada que rehacer]
deshacer                   "Mole de olla y arroz rojo"                [Deshacer escribir «rojo»] [Rehacer reemplazar «o» por «0» (5)]
borrar «de olla »          "Mole y arroz rojo"                        [Deshacer borrar «de olla »] [Nada que rehacer]
deshacer ×2                "Mole de olla y arroz "                    [Deshacer escribir «arroz »] [Rehacer escribir «rojo»]
rehacer                    "Mole de olla y arroz rojo"                [Deshacer escribir «rojo»] [Rehacer borrar «de olla »]
escribir «!»               "Mole de olla y arroz rojo!"               [Deshacer escribir «rojo!»] [Nada que rehacer]
¿se puede rehacer tras un cambio nuevo? → false
límite 2 → deshechos 2, queda "uno "
⛔ TypeError: Command es abstracta
⛔ RangeError: Rango fuera del texto: 0-999
el texto sigue intacto → "Mole de olla y arroz rojo!"
```

### Formateador con *plugins*

Un mini Markdown para el blog de una cocina, hecho de *plugins* que son clases. Su prioridad y sus opciones por defecto son **campos estáticos** que se heredan por la cadena de las clases (`Wrap` no define `priority` y usa la de `Plugin`; `Bold` e `Italic` heredan de `Wrap` y solo cambian la marca y la etiqueta). El protocolo es *duck typing*: un *plugin* implementa `block` o `inline`, y la base lo comprueba al crearlo. Lo ya convertido viaja como `{ html }` y ningún *plugin* lo vuelve a tocar, por eso el contenido de un `código` no se convierte en negrita; el texto que queda se escapa al final, y el enlace `javascript:` se bloquea. El formateador es inmutable: los comentarios usan uno derivado del de los artículos, sin encabezados ni citas y con enlaces `nofollow`. Un mixin, `Counting`, cuenta lo que hace un *plugin* llamando a su `inline` con `super`.

[[exercise:08-formateador-con-plugins.md-]]

```text
orden → Heading → CodeSpan → BulletList → CountingLink → Quote → Bold → Italic → Emoji → Typography
▼ Artículo
  <h2>Mole poblano 🌶️</h2>
  <p>Un <strong>mole</strong> de verdad pide <em>paciencia</em> — y un buen metate…</p>
  <ul><li>4 chiles mulatos</li><li>60 g de chocolate de mesa</li><li>1 taza de <a href="/recetas/caldo-de-pollo">caldo casero</a></li></ul>
  <blockquote><p>Sin prisa no hay mole.</p></blockquote>
  <p>Para resaltar, escribe <code>**así**</code>. Más recetas en <a href="mailto:boletin@example.com">nuestro boletín</a> o en este sitio <small>(enlace bloqueado)</small>.</p>
▼ Comentario (sin encabezados ni citas, enlaces con nofollow)
  <p># ¡Qué rico! &lt;script&gt;robarCookies()&lt;/script&gt; Mira <a href="https://cocina.example.org" rel="nofollow ugc">mi blog</a></p>
enlaces convertidos por el plugin del artículo → 3
…
¿priority propia? → Link: true | Wrap: false (hereda 50 de Plugin)
```

### Caché LRU y repositorio

La capa de datos de una tienda. `LRUCache` aprovecha que un `Map` recuerda el orden de inserción: al leer una clave la borra y la vuelve a insertar, así que la primera es siempre la menos usada y es la que sale cuando no cabe nada más; además caduca las entradas con un **reloj inyectado**, que el ejemplo adelanta a voluntad. `Repository` es la interfaz; `ApiRepository` la implementa simulando un servidor y `CachedRepository` la implementa **envolviendo** a otro repositorio (el patrón decorador): el resto del código no sabe si habla con la caché o con el servidor. Guardar invalida la entrada, y `findMany`, escrito una vez en la base, funciona con las dos implementaciones. La tabla muestra, visita a visita, de dónde sale cada producto y el orden de la caché.

[[exercise:09-cache-lru-y-repositorio.md-]]

```text
(tabla: 10 visitas con su hora en Ciudad de México, el origen (🌐 servidor o ⚡ caché) y el orden de la caché)
peticiones al servidor → 6 de 10 | estadísticas → {hits: 4, misses: 6, evictions: 2, expirations: 1, hitRate: 40}
precio de la taza → $349.00 → $299.00
findMany → (2) ['Café de Veracruz 250 g', 'Molinillo manual Ruta']
⛔ NotFoundError: No existe el producto CAF-OAXA-500
⛔ TypeError: Repository es una interfaz: usa una implementación
⛔ RangeError: Capacidad no válida: 0
```

### Dinero y divisas

La facturación de una diseñadora de Ciudad de México con clientes de fuera. Cada divisa es una instancia **única**, creada en un bloque `static` con una llave privada que impide usar el constructor desde fuera, así que `Currency.of('mxn') === Currency.of('MXN')`. `Money` guarda unidades mínimas enteras y se crea desde **texto**, sin pasar nunca por la coma flotante; respeta los decimales de cada divisa (el yen no tiene, el dinar kuwaití tiene tres). El tipo de cambio es un instante ISO en UTC que se muestra en la zona que se pida, el reparto entre colaboradores no pierde ni inventa centavos y `toJSON` guarda el importe como texto. `Symbol.toPrimitive` permite las plantillas y prohíbe `+`.

[[exercise:10-dinero-y-divisas.md-]]

```text
▼ Factura F-2026-087
  importe → $2,450.00 (USD 2,450.00)
  tipo (CDMX) → 1 USD = 18.4215 MXN · tipo de cambio del banco, 12 oct 2026, 12:00 p.m. GMT-6
  tipo (Madrid) → 1 USD = 18.4215 MXN · tipo de cambio del banco, 12 oct 2026, 20:00 CEST
  cobrado → $45,132.68
  comisión bancaria → $350.00 · neto → $44,782.68
  reparto 50/30/20 → $22,391.34 · $13,434.80 · $8,956.54
  ¿suman el neto? → true
▼ Cada divisa con sus decimales y su idioma
  EUR en de-DE → 1.234,50 € | JSON {"amount":"1234.50","currency":"EUR"}
  JPY en ja-JP → ￥1,234 | JSON {"amount":"1234","currency":"JPY"}
  CLP en es-CL → $1.234 | JSON {"amount":"1234","currency":"CLP"}
  KWD en es-MX → KWD 1,234.567 | JSON {"amount":"1234.567","currency":"KWD"}
ordenadas → (3) ['$99.90', '$450.00', '$1,200.00']
⛔ CurrencyError [too-many-decimals]: MXN admite 2 decimales («12.345»)
…
¿una moneda por código? → true | ¿congelado? → true
```

### Agenda con objetos de valor

¿Cuándo puede reunirse un equipo repartido entre Ciudad de México, Bogotá y Madrid? `Duration` y `TimeRange` son objetos de valor; un intervalo solo se crea desde instantes ISO con `Z` o con desfase, nunca desde una hora «local» ambigua. Cada persona tiene su zona y su horario laboral, y su hora local se calcula con `Intl.DateTimeFormat` y su `timeZone`, así que el resultado es el mismo en cualquier navegador. El calendario rechaza los solapes con un `ConflictError` que dice con qué reunión choca. Lo más interesante está en los huecos libres: Madrid deja el horario de verano el 25 de octubre de 2026 (México y Colombia no tienen), y el mismo cálculo da un hueco más el 3 de noviembre que el 20 de octubre.

[[exercise:11-agenda-con-objetos-de-valor.md-]]

```text
▼ Huecos de 45 min el 2026-10-20
  Ciudad de México: 8:00–8:45 a.m. · Bogotá: 9:00 a 9:45 a. m. · Madrid: 16:00–16:45
▼ Huecos de 45 min el 2026-11-03
  Ciudad de México: 8:00–8:45 a.m. · Bogotá: 9:00 a 9:45 a. m. · Madrid: 15:00–15:45
  Ciudad de México: 10:00–10:45 a.m. · Bogotá: 11:00 a 11:45 a. m. · Madrid: 17:00–17:45
▼ Agenda
  Revisión de diseño → mar 20 de oct, 9:00–9:30 a.m. GMT-6
  Dentista → mar 3 de nov, 9:00–10:00 a.m. GMT-6
⛔ ConflictError: «Kickoff» choca con «Revisión de diseño» en la agenda de Iker
⛔ RangeError: «2026-10-20T10:00» no dice su zona: añade Z o un desfase
⛔ RangeError: Invalid time zone specified: Europe/Madird
⛔ RangeError: Duración no válida: 0 min
¿una hora dura más que 45 min? → true | 1 h 30 min
```

## Una aplicación con interfaz

### Componentes de interfaz

La ficha de un café de especialidad con dos componentes que heredan de una clase base `Component`: un selector de cantidad y una valoración con estrellas. La base reúne lo común: opciones por defecto en un campo estático que cada subclase sombrea, estado inmutable con `setState` (que vuelve a pintar y avisa con `onChange`), oyentes que se registran con `listen` y que `destroy` quita usando la **misma** función, un `render` abstracto y un `WeakMap` estático privado que impide montar dos componentes en el mismo nodo. Los componentes se crean con el estático `mount`, no con `new`: el constructor de la base no llama a `setup` ni a `render`, porque los privados de la subclase todavía no existirían (la trampa del orden de inicialización de la lección «Herencia con extends»). Es **mejora progresiva**: sin JavaScript hay un campo numérico y un desplegable que funcionan; los componentes añaden los botones y las estrellas con sus roles y atributos ARIA, y el teclado del patrón *radio group* de WAI-ARIA (flechas, <kbd>Inicio</kbd> y <kbd>Fin</kbd>). Los botones de cantidad usan `aria-disabled`, no `disabled`, para no perder el foco al llegar al límite. El botón «Mejoras activadas» desmonta los componentes y restaura el HTML original; púlsalo otra vez para montarlos. Prueba con el teclado y abre la consola.

[[exercise:12-componentes-de-interfaz.md]]

## Resumen

- Un modelo de dominio con clases: datos privados, reglas por tipo en estáticos que se heredan y se sombrean, y fábricas con `new this(…)`.
- Los objetos de valor (dinero, cantidades, vectores, intervalos) son inmutables, se crean desde texto o instantes ISO y se comparan con `equals`.
- Una jerarquía de errores por dominio, con `code` y `cause`, permite al programa reaccionar a cada fallo y conservar su origen.
- Las bases abstractas (`new.target` y métodos que exigen su implementación) definen contratos; el polimorfismo hace el resto.
- La composición construye lo grande: decoradores que envuelven, reglas que contienen reglas, objetos que tienen una máquina de estados o un emisor.
- Los protocolos (`Symbol.iterator`, `Symbol.toPrimitive`, `toJSON`) integran tus clases con el lenguaje, y también pueden prohibir operaciones sin sentido.
- Un componente de interfaz con clases separa estado, pintado y limpieza, y mejora un HTML que ya funciona sin JavaScript.

## Para profundizar

- [MDN: usar clases (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes)
- [Refactoring Guru: el patrón Comando](https://refactoring.guru/es/design-patterns/command)
- [WAI-ARIA Authoring Practices: patrón radio group (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [MDN: Intl.DateTimeFormat y zonas horarias](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Martin Fowler: Value Object (en inglés)](https://martinfowler.com/bliki/ValueObject.html)
