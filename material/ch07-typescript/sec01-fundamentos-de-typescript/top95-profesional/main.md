# Ejemplos profesionales

## Por qué importa

En un proyecto real, TypeScript no se nota en las anotaciones, que son pocas, sino en cómo se **modelan** los datos. Hay estados que no pueden mezclarse, acciones con nombre, listas cerradas de valores y fronteras donde todo lo que entra se comprueba. Cuando el modelo está bien hecho, el verificador hace casi todo el trabajo: un caso olvidado, un texto mal escrito o un `null` sin tratar salen en rojo antes de ejecutar. Las bibliotecas de estado (Redux, XState), los formularios con validación (Zod, Valibot) y los componentes accesibles de cualquier sistema de diseño usan las mismas piezas que verás aquí.

Esta página reúne once programas escritos con todo lo que has visto en el curso hasta ahora (HTML, CSS, el lenguaje JavaScript, el DOM, los eventos y este módulo), sin un solo error de tipos. Diez tienen interfaz: úsalos en la tarjeta, o ábrelos con «▶ Run» o en el editor para ver la consola y leer el código. Todos imprimen al cargar una línea `Listo: …` con lo que se puede probar. El último es un programa de consola.

## Qué tienen en común

- **Una sola puerta para los datos de fuera.** Lo que llega de un JSON, de un formulario o de un atributo `data-*` es `unknown` o `string`, y se convierte en los tipos del programa en un único sitio (`parseOrders`, `validateBooking`, `toTabId`, `toZone`…) que devuelve el valor bueno, `null` o una unión `ok`/`error`.
- **Uniones discriminadas para todo lo que tiene casos.** Estados de carga, acciones de un tablero, formas de pago, pasos de una selección, entradas de un registro. Cada una se trata con un `switch` que termina en `assertNever`, así que añadir un caso nuevo marca todos los sitios que hay que actualizar.
- **Los valores se escriben una vez.** Las listas de tallas, pestañas o comandos son arrays `as const`, y los tipos salen de ellos. Las tablas de tarifas y conversiones también son `as const`, y el código solo las recorre.
- **Inmutabilidad con `readonly`.** Los carritos, tableros, reservas y máquinas no se modifican: cada cambio crea un valor nuevo, y el tipo impide hacer `push` sobre lo que se comparte.
- **El DOM sin `null` ni aserciones.** Cada elemento se obtiene con una función que lanza un error si falta y estrecha con `instanceof` (`byId`, `inputById`, `selectById`…). No hay ni un `as` ni un `!` en toda la página; en el módulo 3 verás `querySelector<T>`, que acorta este código.
- **Accesibles.** Etiquetas en todos los controles, estados anunciados con `aria-live`, `aria-invalid`, `aria-pressed` o `aria-selected`, teclado completo y foco que no se pierde al volver a pintar.

## Estados de carga

**Objetivo:** el panel de pedidos de una cocina, con sus cinco estados: inicial, cargando, con datos, vacío y error. **Técnicas:** el estado es una unión discriminada, así que no existe un «cargando con pedidos» ni un «error sin mensaje»; un único `render` con un `switch` exhaustivo traduce cada estado a la pantalla (y a `aria-busy`); el servidor simulado responde texto tras 700 ms (con `setTimeout` y una promesa, del capítulo 5), y `parseOrders` lo comprueba entero desde `unknown` antes de que exista un solo `Order`. **Fíjate en** «Datos rotos»: el JSON llega bien formado, pero un total viene como texto, y la frontera lo convierte en un estado de error con un mensaje que dice qué pedido falla.

[[exercise:01-estados-de-carga.md]]

```text
estado → idle
Listo: elige una respuesta simulada y pulsa «Cargar pedidos»
// Tras pulsar «Cargar pedidos» (la segunda línea llega 0,7 s después):
estado → loading (intento 1)
estado → success: 3 pedidos, $1,147.50 en total (intento 1)
// Tras elegir «Error» y pulsar «Cargar pedidos»:
estado → loading (intento 2)
estado → error: El servidor no respondió (503) (intento 2)
// Tras elegir «Datos rotos» y pulsar «Reintentar»:
estado → loading (intento 3)
estado → error: Datos no válidos: P-2044: total no es un número (intento 3)
// Tras elegir «Sin pedidos» y pulsar «Reintentar»:
estado → loading (intento 4)
estado → empty (intento 4)
```

## Carrito de playeras

**Objetivo:** el carrito de la tienda de un festival, con modelos, tallas, cantidades y dos monedas. **Técnicas:** las tallas salen de un array `as const` y los precios de una tabla `as const`; el carrito es un `readonly CartLine[]` y `addToCart`/`removeFromCart` son funciones puras que devuelven otro carrito (añadir una línea que ya existe suma la cantidad); los valores de los radios y de los `data-*` de los botones pasan por `toSize`/`toModel` antes de usarse; `formatPrice` tiene un caso por moneda. **Fíjate en** el foco al quitar una línea: el botón pulsado desaparece al volver a pintar, y el foco pasa al título del carrito en lugar de perderse.

[[exercise:02-carrito-de-playeras.md]]

```text
Listo: elige modelo, talla y cantidad y pulsa «Añadir al carrito»
// Tras añadir Clásica M (cantidad 2), Vintage L (1) y otra vez Clásica M (1):
➕ Clásica M ×2 → total $698.00
➕ Vintage L ×1 → total $1,127.00
➕ Clásica M ×1 → total $1,476.00
// Tras cambiar la moneda a dólares y quitar la Vintage L:
💱 USD → total 79.78 USD
➖ Vintage L → total 56.59 USD
```

## Tablero kanban con un reductor

**Objetivo:** el tablero de producción de una revista. **Técnicas:** un **reductor**, la función `reduce(estado, acción) → estado nuevo`, es el único sitio donde cambia el tablero. Las acciones (`add`, `move`, `remove`, `clear-done`) son una unión discriminada, y tanto `reduce` como `describeAction` terminan en `assertNever`. La interfaz solo hace dos cosas: pintar el estado y convertir clics en acciones (`dispatch`), con un listener delegado. Las columnas salen de un array `as const` y `neighbour` calcula la de al lado. **Fíjate en** el foco: al mover una tarjeta, su botón se vuelve a crear en otra columna, y el código devuelve el foco al mismo botón de la tarjeta movida, o al otro si este quedó desactivado.

[[exercise:03-tablero-kanban.md]]

```text
Listo: añade una tarea, muévela con ← → o archiva las terminadas
// Tras escribir «Mapa de las rutas del mezcal» y pulsar «Añadir»:
➕ T-5 «Mapa de las rutas del mezcal» en Por hacer
// Tras pulsar → dos veces en esa tarjeta:
➡️ T-5 «Mapa de las rutas del mezcal»: Por hacer → En curso
➡️ T-5 «Mapa de las rutas del mezcal»: En curso → Hecho
// Tras «Archivar las terminadas»:
🗄️ archivadas 2 tarea(s) terminada(s)
```

Este patrón (estado `readonly`, acciones discriminadas y un reductor exhaustivo) es el de Redux y el del *hook* `useReducer` de React. Con él, cada cambio del programa se puede registrar, repetir o deshacer, porque es un objeto con nombre.

## Paleta de comandos

**Objetivo:** la paleta Ctrl/⌘ + K del panel de una cocina. **Técnicas:** los identificadores de los comandos salen de un array `as const` y `runCommand` tiene un caso por identificador; la paleta es un `<dialog>` modal (que devuelve el foco al cerrarse y se cierra con Escape) con un campo que sigue el patrón *combobox* de WAI-ARIA (`aria-activedescendant` sobre la opción activa); `event.key` se convierte en la unión `NavKey` antes del `switch`, y la búsqueda ignora mayúsculas y tildes. **Fíjate en** «Alternar contraste alto»: el comando cambia las variables de color de la aplicación, y su mensaje dice el estado resultante.

[[exercise:04-paleta-de-comandos.md]]

```text
Listo: pulsa «Comandos» (o Ctrl/⌘ + K), escribe «ped», pulsa ↓ y Enter
// Tras abrir la paleta, escribir «ped», ↓ y Enter:
⌘ paleta abierta (5 comandos)
▶ Ver pedidos pendientes: 3 pedidos pendientes en cocina
// Tras Ctrl/⌘ + K (con el foco en la vista previa), escribir «contraste» y Enter:
⌘ paleta abierta (5 comandos)
▶ Alternar contraste alto: Contraste alto activado
// Tras abrirla y pulsar Escape:
⌘ paleta abierta (5 comandos)
⌘ paleta cerrada sin elegir
```

## Calculadora de envíos

**Objetivo:** el presupuesto de envío de una tienda en línea. **Técnicas:** toda la lógica de precios vive en tablas `as const` (zonas, velocidades y límites), y `quoteShipping` es una función pura que las recorre. Los plazos son tuplas `[min, max]` y el desglose es una lista de tuplas `[concepto, centavos]`. El resultado es una unión `ok`/`error`, y el error dice qué campo falla (`'weight' | 'declared'`), para marcarlo con `aria-invalid`, mostrar su mensaje enlazado con `aria-describedby` y llevarle el foco. **Fíjate en** «Recoger en tienda» con «Express»: la velocidad no se aplica (no hay transporte), y el código lo decide en una línea, con `effectiveSpeed`.

[[exercise:05-calculadora-de-envios.md]]

```text
📦 local · standard · 1 kg → $69.00 (1–2 días hábiles)
Listo: cambia destino, velocidad, peso o seguro y pulsa «Calcular»
// Tras elegir «Resto del país», «Express», peso 2.5 y «Calcular»:
📦 national · express · 2.5 kg → $350.40 (2–4 días hábiles)
// Tras marcar «Asegurar el paquete» (valor 1000) y «Calcular»:
📦 national · express · 2.5 kg · seguro $1000 → $370.40 (2–4 días hábiles)
// Tras escribir 45 en el peso y «Calcular»:
⚠️ weight: El peso debe estar entre 0.1 y 30 kg
// Tras volver a 2.5, elegir «Recoger en tienda» y «Calcular»:
📦 pickup · express · 2.5 kg · seguro $1000 → $20.00 (hoy mismo)
```

## Formulario de reserva

**Objetivo:** la reserva de mesa de un restaurante, que también puede importar una reserva guardada en JSON. **Técnicas:** el formulario se convierte en un objeto de tipo `unknown` (`readForm`), de modo que los datos del formulario y los del JSON pasan por la **misma** función, `validateBooking`. Esa función lee cada propiedad con `Reflect.get` (que devuelve `any`, guardado enseguida como `unknown`), la estrecha y acumula errores con su campo. Las horas válidas salen de un array `as const`, y una fecha imposible como `2026-02-30` se descarta comprobando la vuelta a texto. **Fíjate en** que el tipo `Booking` solo se construye en la última línea de `validateBooking`: no hay ningún camino por el que un objeto sin comprobar llegue a ser una reserva.

[[exercise:06-formulario-de-reserva.md]]

```text
Listo: pulsa «Reservar» con el formulario vacío, o abre «Importar» (el JSON trae 2 errores)
// Tras pulsar «Reservar» sin rellenar nada:
⚠️ Formulario: 2 errores (guest, email)
// Tras abrir «Importar una reserva guardada» y pulsar «Importar»:
⚠️ JSON: 2 errores (party, time)
// Tras cambiar en el JSON "party": 6 y "time": "20:30" y pulsar «Importar»:
📥 importada: Carmen Vidal, 6 personas, 2026-12-24 20:30
// Tras pulsar «Reservar»:
✅ mesa para 6 · 2026-12-24 a las 20:30 · Carmen Vidal (cumpleaños)
```

## Registro de actividad

**Objetivo:** el registro de lo que pasa en una tienda: pedidos, avisos de inventario y notas del turno. **Técnicas:** las entradas son una unión discriminada por `level`. Los suscriptores tienen el tipo de función `(entry, position) => void`, y `subscribe` devuelve `Unsubscribe`, la función que da de baja. Cuatro partes independientes se suscriben sin conocerse: la lista (que respeta el filtro), los contadores, la consola y los avisos emergentes. El getter `entries` devuelve `readonly LogEntry[]`, así que nadie puede añadir entradas sin pasar por `add`. **Fíjate en** la casilla «Avisos emergentes»: desmarcarla llama a la función de baja, y volver a marcarla suscribe otra vez el mismo listener.

[[exercise:07-registro-de-actividad.md]]

```text
#1 ℹ️ Turno de mañana abierto
Listo: pulsa «Nuevo pedido», «Aviso de inventario» o «Nota del turno»; prueba el filtro y desactiva los avisos
// Tras «Nuevo pedido» y «Aviso de inventario» (el aviso emergente dura 4 s):
#2 🧾 pedido P-3001 · $385.00
#3 ⚠️ MOL-02: quedan 2 bolsas de mole negro
// Tras desmarcar «Avisos emergentes» y pulsar «Aviso de inventario» (ya no sale el aviso):
🔕 avisos emergentes desactivados
#4 ⚠️ CAF-CHI: quedan 3 bolsas de café de Chiapas
// Tras elegir «Avisos» en «Mostrar»:
🔎 filtro: warning → 2 de 4 entradas
```

## Conversor de cocina

**Objetivo:** una receta de pan de muerto que se escala por porciones y se pasa a unidades de EE. UU., con un conversor rápido. **Técnicas:** masas y volúmenes son dos uniones de literales con sus tablas de equivalencias `as const`. `convert` tiene dos sobrecargas, masa con masa y volumen con volumen, así que `convert(1, 'cup', 'g')` es un error de tipos; `formatAmount` acepta una cantidad con su unidad o un ingrediente entero. **Fíjate en** el conversor rápido: los `<select>` dan textos, y antes de llamar a `convert` cada familia se estrecha por separado. Pasarle directamente un `Unit` (la unión de las dos) no encajaría en ninguna sobrecarga, como en la lección 6.

[[exercise:08-conversor-de-cocina.md]]

```text
🍞 8 porciones · metric · Harina de trigo 500 g · Leche 120 ml
Listo: cambia las porciones o las unidades; prueba el conversor con taza → ml y taza → g
// Tras subir las porciones a 12 (cada cambio escribe una línea; esta es la última):
🍞 12 porciones · metric · Harina de trigo 750 g · Leche 180 ml
// Tras elegir «De EE. UU.»:
🍞 12 porciones · us · Harina de trigo 1.65 lb · Leche 0.75 tz
// Tras pulsar «Convertir» (2 tazas a ml):
⚖️ 2 tz → 480 ml
// Tras elegir «g» en «A» y pulsar «Convertir»:
⚠️ tz → g: no se puede convertir una masa en un volumen (o al revés) sin la densidad
```

## Calendario de reservas

**Objetivo:** las fechas de una cabaña en diciembre, con noches ya ocupadas y tarifas por tipo de noche. **Técnicas:** una estancia es la tupla `[llegada, salida]` (la salida no se cobra). La selección es una unión de tres pasos (`check-in`, `check-out` y `done`), así que «una salida sin llegada» no se puede representar. Las tarifas están en una tabla `as const` indexada por `NightKind`. La rejilla usa *roving tabindex*: solo un día está en el orden de Tab, y las flechas, convertidas en la unión `ArrowKey`, mueven el foco por días y semanas. **Fíjate en** la salida del día 26: es la primera noche ocupada, pero se puede salir ese día, porque `nightsOf` no incluye la noche de salida.

[[exercise:09-calendario-de-reservas.md]]

```text
Listo: pulsa la llegada y la salida (las fechas tachadas están ocupadas), o usa Tab y las flechas
// Tras pulsar el 10 y el 13:
📅 llegada 2026-12-10
🛏️ 2026-12-10 → 2026-12-13: 3 noches · $6,600.00
// Tras pulsar el 17 y el 22:
📅 llegada 2026-12-17
⚠️ 2026-12-17 → 2026-12-22 cruza noches ocupadas: elige otra llegada
// Tras pulsar el 23 y el 26:
📅 llegada 2026-12-23
🛏️ 2026-12-23 → 2026-12-26: 3 noches · $8,200.00
// Tras pulsar el 6:
⚠️ no se puede llegar el 2026-12-06: esa noche está ocupada
```

## Pestañas tipadas

**Objetivo:** la información práctica de un museo, en pestañas. **Técnicas:** el patrón de pestañas de WAI-ARIA con activación automática y *roving tabindex*. Los identificadores salen de un array `as const`, las teclas se traducen a la unión `Move` y `destination` calcula la pestaña de destino con un `switch` exhaustivo, con vuelta al principio. Los enlaces dentro de los paneles llevan su destino en `data-goto`, un texto libre que pasa por `toTabId` antes de usarse. **Fíjate en** «Ver la tienda del museo», un enlace con un destino que no existe: en lugar de dejar la página sin ningún panel visible, el enlace se ignora con un aviso.

[[exercise:10-pestanas-tipadas.md]]

```text
Listo: pulsa una pestaña, o Tab hasta «Horario» y usa ← → Inicio Fin; prueba los enlaces de los paneles
// Tras pulsar «Precios», → y Fin:
📑 hours → prices (clic)
📑 prices → access (teclado)
📑 access → directions (teclado)
// Tras → (vuelve al principio) y el enlace «Mira los precios para grupos»:
📑 directions → hours (teclado)
📑 hours → prices (enlace)
// Tras pulsar «Accesibilidad» y el enlace «Ver la tienda del museo»:
📑 prices → access (clic)
⚠️ «museum-shop» no es una pestaña: el enlace se ignora
```

## Máquina expendedora

**Objetivo:** la máquina de botanas de una estación de metro, como máquina de estados. **Técnicas:** tres estados y cinco eventos, los dos como uniones discriminadas. `transition` es una función pura con un `switch` por estado y, dentro, otro por evento, los dos exhaustivos. Devuelve la tupla `[máquina nueva, mensajes]`, y las existencias se copian con `{ ...stock, [code]: … }`. Las monedas son la unión de literales numéricos `1 | 2 | 5 | 10`: el sensor mide un número cualquiera y `toCoin` lo convierte o lo rechaza, por eso una moneda de 20 no llega ni a ser un evento. **Fíjate en** el mantenimiento con crédito: la transición devuelve dos mensajes, la devolución y el aviso, porque la tupla admite cualquier número de ellos.

[[exercise:11-maquina-expendedora.md-]]

```text
elige B1         [idle] 💬 Cacahuates enchilados cuesta $12: inserta monedas
moneda $10       [collecting] 🪙 crédito $10
elige B1         [collecting] 💬 faltan $2 para Cacahuates enchilados
sensor $20       [collecting] ↩️ moneda no aceptada
moneda $5        [collecting] 🪙 crédito $15
elige A2         [collecting] 💬 Jugo de mango está agotado
elige B1         [idle] 📦 sale Cacahuates enchilados · cambio $3 (2 + 1)
moneda $2        [collecting] 🪙 crédito $2
mantenimiento    [out-of-service] ↩️ devueltos $2 (2) · 🔧 fuera de servicio: reposición de producto
moneda $1        [out-of-service] ↩️ moneda de $1 devuelta: fuera de servicio
fin del servicio [idle] ✅ de vuelta en servicio
existencias → {A1: 3, A2: 0, B1: 4}
```

## Para profundizar

- [Manual de TypeScript: estrechamiento y uniones discriminadas (en inglés)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [WAI-ARIA Authoring Practices: patrones de pestañas y combobox (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Redux: reductores y acciones (en inglés)](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers)
- [Kent C. Dodds: haz imposibles los estados imposibles (en inglés)](https://kentcdodds.com/blog/make-impossible-states-impossible)
