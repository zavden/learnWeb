# Ejemplos profesionales

## Por qué importa

En un proyecto real, los tipos avanzados casi nunca están a la vista de quien usa el código: están dentro de las piezas que el resto del equipo llama. Un bus de eventos, un almacén de preferencias, una tabla de columnas o un módulo de dinero se escriben una vez, con genéricos, tipos mapeados y plantillas, y a partir de ahí cada llamada queda comprobada sin que nadie escriba un tipo más. Las bibliotecas que usarás en el futuro (los *routers*, las de formularios, las de validación como Zod, las de traducciones) están hechas exactamente así.

Esta página reúne once programas escritos con todo lo que has visto en el curso hasta ahora (HTML, CSS, JavaScript, el DOM, los eventos, la red y el almacenamiento, y los dos módulos de TypeScript), sin un solo error de tipos. Nueve tienen interfaz: úsalos en la tarjeta, o ábrelos con «▶ Run» o en el editor para ver la consola y leer el código; todos imprimen al cargar una línea `Listo: …`. Los otros dos son módulos de consola.

## Qué tienen en común

- **Los tipos salen de los valores.** Las tablas de configuración (banderas, preferencias, países, estados de una máquina, columnas) son objetos `as const satisfies …`: se comprueban y conservan sus literales, y `keyof typeof`, los tipos indexados e `infer` sacan de ellos los tipos que usa el resto del programa.
- **Genéricos que relacionan una clave con su valor.** `on<E>`, `get<K>`, `set<K>`, `translate<P>` o `select<K>` usan `K extends keyof …` para que el tipo de los datos dependa del nombre que se pasa. Cuando TypeScript no ve la relación dentro de una unión, la tabla se mira como un tipo mapeado indexado por un `K` genérico (la «correlación de uniones»).
- **Una sola puerta para los datos de fuera.** Un JSON, una respuesta de la API o un valor de `localStorage` entran como `unknown` y pasan por un validador o un esquema que anota cada problema con su ruta. Ningún `as` convierte datos sin comprobar.
- **Marcas para lo que no debe mezclarse.** Ids, códigos de producto, precios y monedas son tipos con marca, y solo los fabrica una función que comprueba el valor.
- **Los `as` que quedan están explicados.** Aparecen dentro de funciones pequeñas (`Object.keys`, `Object.fromEntries`, el bucle de un esquema), donde TypeScript no puede seguir una transformación, y cada uno lleva un comentario que dice por qué.
- **Accesibles.** Etiquetas en todos los controles, regiones vivas para los avisos, `aria-sort`, `aria-current`, `aria-busy`, interruptores con `role="switch"` y foco que no se pierde cuando un botón desaparece al volver a pintar.

## Catálogo validado

**Objetivo:** el catálogo de una tienda de productos oaxaqueños, descargado de `catalog.json` (ábrelo con «Assets»), con dos productos rotos. **Técnicas:** un esquema propio con `s.brand`, que valida y además pone la marca (`Sku`, `Pesos`), campos opcionales detectados con un condicional y `Infer<typeof ProductSchema>` para el tipo `Product`; los problemas se reúnen con su ruta y se muestran en un `<details>`; los filtros (existencias y etiqueta) solo trabajan con productos ya validados. **Fíjate en** el filtro de etiquetas: sus opciones salen de los datos válidos, así que un producto roto no puede añadir una etiqueta.

[[exercise:01-catalogo-validado.md]]

```text
📦 6 de 8 productos válidos
⚠️ items[3].price: debe ser un entero ≥ 1 (llegó "195")
⚠️ items[5].sku: debe ser un código como MOL-01 (llegó "cho-2")
⚠️ items[5].stock: debe ser un entero ≥ 0 (llegó -1)
Listo: marca «Solo con existencias», elige una etiqueta o abre el panel de problemas
// Tras marcar «Solo con existencias»:
🔎 5 de 6 productos · con existencias
// Tras elegir la etiqueta «mole»:
🔎 1 de 6 productos · con existencias · etiqueta «mole»
// Tras desmarcar «Solo con existencias»:
🔎 2 de 6 productos · etiqueta «mole»
```

## Bus de eventos del carrito

**Objetivo:** el carrito de una tienda de discos, en el que el catálogo, el carrito, el contador, los avisos de existencias y el registro no se conocen entre sí. **Técnicas:** un `EventBus<Events>` con nombres con espacio de nombres (`'cart:added'`, `'stock:low'`); `Namespace<Name>` saca `'cart'` con `infer` en una plantilla y `Envelope<Events, 'cart'>` construye una unión discriminada de todos los eventos del carrito, que `logCart` trata con un `switch`; las acciones (`addToCart`, `removeFromCart`, `clearCart`) solo cambian el estado y emiten. **Fíjate en** la casilla del registro: darse de baja es llamar a la función que devolvió `onNamespace`, y el resto de la página sigue funcionando igual.

[[exercise:02-bus-de-eventos-del-carrito.md]]

```text
Listo: añade discos (Re solo tiene 2), quita una línea, vacía el carrito o desactiva el registro
// Tras pulsar «Añadir» en Re dos veces:
🛒 cart:added · Re (+1)
⚠️ stock:low · Re: queda 1
🛒 cart:added · Re (+1)
⚠️ stock:low · Re: agotado
// Tras pulsar «Quitar» en la línea de Re:
🛒 cart:removed · Re
// Tras desmarcar «Registrar la actividad del carrito», añadir Amor prohibido y pulsar «Vaciar carrito»:
🔕 registro del carrito desactivado
```

## Traducciones tipadas

**Objetivo:** el resumen de una compra en español y en inglés, con claves anidadas comprobadas. **Técnicas:** el español es la referencia (`as const`), y `Widen<T>`, un tipo mapeado recursivo, obliga a que el inglés tenga la misma forma; `Paths<T>` calcula todas las claves (`'checkout.total'`…) con plantillas y recursión, `Lookup` encuentra el texto de cada una y `ParamsOf` saca sus marcadores `{amount}` con `infer`; `translate` usa un parámetro *rest* condicional, así que una clave sin marcadores no admite valores y una con marcadores los exige todos. **Fíjate en** el cambio de idioma: además de los textos, cambian los formatos de moneda y fecha de `Intl` y el `lang` del documento, para que los lectores de pantalla lean con la voz correcta.

[[exercise:03-traducciones-tipadas.md]]

```text
🌐 es-MX → Tu pedido · Total: $1,089.00 · Llega entre el 20 de octubre y el 23 de octubre
Listo: cambia el idioma o pulsa el botón de pago
// Tras elegir «English (US)»:
🌐 en-US → Your order · Total: MX$1,089.00 · Arrives between October 20 and October 23
// Tras pulsar el botón de pago:
💳 Pay MX$1,089.00
```

## Tabla con columnas tipadas

**Objetivo:** la tabla de conciertos de una gira, ordenable por cualquier columna. **Técnicas:** cada columna es un `Column<T, K>` con su clave y un formateador que recibe `T[K]`; `AnyColumn<T>` es un tipo mapeado indexado por `keyof T`, una unión en la que el formateador de `price` recibe un `number` y el de `soldOut` un `boolean`; `compareBy<T, K>` es un comparador genérico. Las cabeceras son botones dentro de `<th>` con `aria-sort`, y un párrafo `aria-live` anuncia el nuevo orden. **Fíjate en** `cellText`: con la unión, TypeScript no puede comprobar que `format` y `row[column.key]` encajan; tipando la columna como `ColumnMap<Concert>[K]` con `K` genérico, sí.

[[exercise:04-tabla-con-columnas-tipadas.md]]

```text
Listo: pulsa «Desde» (dos veces cambia el sentido) o cualquier otra cabecera
// Tras pulsar «Desde» dos veces y luego «Ciudad»:
↕ Ordenado por Desde, ascendente · primero: Oaxaca
↕ Ordenado por Desde, descendente · primero: Ciudad de México
↕ Ordenado por Ciudad, ascendente · primero: Ciudad de México
```

## Deshacer y rehacer

**Objetivo:** un editor de recetas que escala los ingredientes por porciones y permite deshacer y rehacer cada cambio. **Técnicas:** el estado es `DeepReadonly<Recipe>` y además está congelado (en modo estricto, cambiarlo lanza un `TypeError`); cada cambio es una acción de una unión discriminada que `applyAction` convierte en una receta nueva con un `switch` exhaustivo; `UndoHistory<T>` es una clase genérica con el pasado, el presente y el futuro, y los botones se desactivan cuando no queda nada que deshacer o rehacer. **Fíjate en** el teclado: Ctrl/⌘ + Z deshace y con Mayús rehace, salvo dentro del campo del título, donde se respeta el deshacer del navegador.

[[exercise:05-deshacer-y-rehacer.md]]

```text
Listo: cambia las porciones, quita o añade ingredientes y usa «Deshacer»/«Rehacer» (o Ctrl/⌘ + Z)
// Tras pulsar «+» y «Quitar» en el agua de azahar:
✏️ +1 porción → 9 porciones · 6 ingredientes · harina 563 g
✏️ quitar agua de azahar → 9 porciones · 5 ingredientes · harina 563 g
// Tras pulsar «Deshacer» dos veces y «Rehacer» una:
↩️ deshacer → 9 porciones · 6 ingredientes · harina 563 g
↩️ deshacer → 8 porciones · 6 ingredientes · harina 500 g
↪️ rehacer → 9 porciones · 6 ingredientes · harina 563 g
```

## Dinero con marca

**Objetivo:** la cuenta de una cena en Oaxaca, con propina, reparto entre tres personas y conversión a dólares y euros. **Técnicas:** los importes son centavos enteros con la moneda en la marca (`Cents<'MXN'>`), así que `0.1 + 0.2` da exactamente 30 centavos; las operaciones son genéricas sobre la moneda, la conversión es la única forma de pasar de una a otra, y `split` reparte sin perder centavos. **Fíjate en** `NoInfer<C>` (TypeScript 5.4) en `add` y `format`: sin él, `add(pesos, dólares)` haría que TypeScript dedujera `C = 'MXN' | 'USD'` a partir de los dos argumentos y aceptaría la mezcla. Con él, `C` sale solo del primero y el segundo debe coincidir.

[[exercise:06-dinero-con-marca.md-]]

```text
Tlayuda con tasajo     $185.00
Mole negro             $210.50
Mezcal espadín         $95.00
Agua de chilacayota    $45.00
Subtotal $535.50 · propina 15 % $80.33 · total $615.83
entre 3 → $205.28 + $205.28 + $205.27 = $615.83
en dólares → $11.09
en euros → 10,26 €
0.1 + 0.2 → 0.30000000000000004 | en centavos → $0.30
```

## Preferencias guardadas

**Objetivo:** las preferencias de una tienda (tema, moneda, precios visibles y búsquedas recientes) guardadas en `localStorage` con las claves `lw-ts-prefs-*`. **Técnicas:** una tabla `satisfies` con el valor por defecto y el validador de cada preferencia; `PrefValues` saca el tipo de cada valor con `infer`, y el mismo objeto se ve como un tipo mapeado para que `get<K>`/`set<K>` relacionen la clave con su tipo; lo que se lee pasa por `JSON.parse` dentro de un `try` y por el validador, y un valor dañado se borra y se avisa. **Fíjate en** «Simular un valor dañado»: escribe `"YEN"` como si lo hubiera guardado otra versión de la aplicación, y la página sigue funcionando con `MXN`. Las preferencias se conservan entre ejecuciones (recarga con ⟳ para comprobarlo); «Restablecer» las borra. En la tarjeta, `localStorage` es una copia en memoria, y en la página real (▶ o el editor) es el almacenamiento de verdad.

[[exercise:07-preferencias-guardadas.md]]

```text
⚙️ tema auto · moneda MXN · precios visibles · 0 búsquedas
Listo: cambia el tema o la moneda, busca algo, recarga con ⟳ o pulsa «Simular un valor dañado» y «Restablecer»
// Tras elegir el tema «Oscuro» y la moneda «USD»:
💾 lw-ts-prefs-theme = "dark"
💾 lw-ts-prefs-currency = "USD"
// Tras escribir «Mole» y pulsar «Buscar»:
💾 lw-ts-prefs-recentSearches = ["mole"]
// Tras pulsar «Simular un valor dañado»:
⚠️ lw-ts-prefs-currency no era válido ("YEN"): se usa "MXN"
⚙️ tema dark · moneda MXN · precios visibles · 1 búsquedas
// Tras pulsar «Restablecer»:
🧹 preferencias restablecidas · ⚙️ tema auto · moneda MXN · precios visibles · 0 búsquedas
```

## Banderas de funcionalidad

**Objetivo:** activar funciones de una tienda por país, para un porcentaje de usuarios o a mano, y ver el resultado en una vista previa del pago. **Técnicas:** la tabla de reglas es `as const satisfies Record<string, FlagRule>` y de ella sale `FlagName`; la evaluación devuelve un `Record<FlagName, Decision>` (ninguna bandera se puede olvidar) con el motivo de cada decisión; los ajustes manuales son un `Partial<Record<FlagName, boolean>>`; el despliegue gradual usa un *hash* estable del usuario y la bandera, para que cada persona caiga siempre del mismo lado. **Fíjate en** que la vista previa solo lee decisiones: ninguna parte de la interfaz comprueba países ni porcentajes.

[[exercise:08-banderas-de-funcionalidad.md]]

```text
👤 Lucía (mx): oneStepCheckout on · giftWrap on · pickupPoints on · darkHeader off
Listo: cambia de usuario, activa o desactiva una bandera, o quita los ajustes manuales
// Tras elegir «Iván (Estados Unidos)»:
👤 Iván (us): oneStepCheckout off · giftWrap off · pickupPoints off · darkHeader off
// Tras activar «Cabecera oscura»:
🎚️ darkHeader → on (ajuste manual)
// Tras elegir «Carmen (España)» y pulsar «Quitar los ajustes manuales»:
👤 Carmen (es): oneStepCheckout on · giftWrap off · pickupPoints on · darkHeader on
🧹 sin ajustes manuales: oneStepCheckout on · giftWrap off · pickupPoints on · darkHeader off
```

## Consultas tipadas

**Objetivo:** un constructor de consultas inmutable sobre el catálogo de una tienda de discos. **Técnicas:** `Where<T>` es un tipo mapeado en el que cada campo admite condiciones según su tipo (un rango para los números, un valor, una lista o un `includes` para los textos), con un condicional; `select<K>` cambia el tipo de la consulta a `Query<T, K>` y `run()` devuelve `Pick<T, K>[]`; cada método devuelve una consulta nueva, con campos privados `readonly`. **Fíjate en** los corchetes de `Condition<V>`: sin ellos, la distributividad de la lección 3 convertiría `readonly V[]` de los géneros en una unión de arrays de un solo género, y `['rock', 'son']` no encajaría.

[[exercise:09-consultas-tipadas.md-]]

```text
💿 Re · Café Tacvba · $699
💿 Amor prohibido · Selena · $649
💿 Romance · Luis Miguel · $589
rock con «café» → LP-102 (1994), LP-106 (1996)
los 2 más baratos → El circo $239 · Sones de Veracruz $259
```

## Pedido como máquina de estados

**Objetivo:** el ciclo de vida de un pedido, del carrito a la entrega, con su cancelación. **Técnicas:** los eventos son una plantilla (`` `order.${Verb}` ``) y `VerbOf` los desarma con `infer`; la tabla de transiciones es `as const satisfies { [S in OrderState]: Partial<Record<OrderEvent, OrderState>> }`, un tipo mapeado que obliga a describir cada estado; `EventsFrom<S>` da los eventos de un estado (`never` para uno final) y `next<S, E>` devuelve, en tiempo de compilación, el estado exacto al que se llega. **Fíjate en** los botones: se generan con los eventos del estado actual, así que una transición imposible ni siquiera se puede pulsar, y el foco pasa a la siguiente acción.

[[exercise:10-pedido-como-maquina-de-estados.md]]

```text
Listo: el pedido está en «Carrito»; pulsa las acciones posibles (solo aparecen las válidas)
// Tras pulsar «Ir a pagar», «Pagar $1,080.00» y «Cancelar pedido»:
📦 cart --order.checkout--> checkout
📦 checkout --order.pay--> paid
📦 paid --order.cancel--> cancelled
// Tras pulsar «Volver al carrito» y «Empezar otro pedido»:
📦 cancelled --order.reopen--> cart
🔁 pedido nuevo: cart
```

## Compra validada con la API

**Objetivo:** la compra de entradas de un museo, enviada a la API de prueba de LearnWeb (`/api/demo/echo`, que devuelve lo que recibe). **Técnicas:** `requestJson<T>` es una función genérica que nunca lanza: devuelve un `Result<T>` (`ok` o `error`) y recibe la función que valida la respuesta; el límite de tiempo es un `AbortSignal.timeout`; la respuesta se comprueba desde `unknown` (`isEcho`, `parseOrder`) antes de usarse, y el formulario pasa por el mismo validador antes de enviarse. **Fíjate en** «Respuesta inesperada»: el servidor contesta 201, pero los datos no son válidos, y la página lo trata como un error con la ruta exacta. El módulo «TypeScript en la práctica» profundiza en `fetch` tipado.

[[exercise:11-compra-validada-con-la-api.md]]

```text
Listo: pulsa «Comprar» y luego prueba el error 422, la respuesta lenta y la respuesta inesperada
// Tras pulsar «Comprar»:
✅ 201 · POST /api/demo/echo · 2026-11-14 · 2 adulto + 1 estudiante = $250.00
// Tras pulsar «Simular un error 422»:
⚠️ 422 · el servidor rechazó la petición (422)
// Tras pulsar «Respuesta lenta (3 s)» (el aviso llega al cabo de 1 s):
⚠️ sin estado · sin respuesta en 1 s: la petición se canceló
// Tras pulsar «Respuesta inesperada»:
⚠️ 201 · respuesta no válida: body.tickets.adult debe ser un entero de 0 a 10, llegó "dos"
```

## Para profundizar

- [Manual de TypeScript: crear tipos a partir de tipos (en inglés)](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Notas de TypeScript 5.4: el tipo NoInfer (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type)
- [Notas de TypeScript 4.6: inferencia de accesos indexados, la base de la «correlación» (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-6.html#indexed-access-inference-improvements)
- [MDN: AbortSignal.timeout() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
- [WAI-ARIA Authoring Practices: tabla ordenable (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
