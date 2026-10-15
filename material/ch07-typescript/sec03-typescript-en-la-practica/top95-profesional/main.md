# Ejemplos profesionales

## Por qué importa

Con este módulo termina el capítulo de TypeScript, y con él la parte del curso dedicada a construir interfaces: HTML, CSS, JavaScript, el navegador y ahora los tipos. Los doce programas de esta página usan todo eso a la vez, como lo haría una aplicación de verdad: un router, un almacén con deshacer, una capa de red que reintenta, ajustes guardados con versiones, una tabla genérica, traducciones, componentes accesibles, arrastrar y soltar, un gráfico, un bus de eventos, un formulario con validación y datos que llegan en directo.

Todos compilan sin un solo error de tipos y casi sin aserciones; las pocas que quedan están dentro de funciones pequeñas y con un comentario que explica por qué TypeScript no puede seguir el código. Úsalos en la tarjeta, o ábrelos con «▶ Run» o en el editor para ver la consola y leer el código, que empieza siempre con sus decisiones de diseño. Todos imprimen al cargar una línea `Listo: …`.

## Qué tienen en común

- **Los tipos salen de los datos.** Rutas, estados, idiomas, métricas y escenarios son objetos o tuplas `as const` (con `satisfies` cuando hay que comprobarlos), y de ellos salen las uniones que usa el resto del programa. Añadir un caso obliga a tratarlo: los `switch` acaban en un `never`.
- **Una frontera para todo lo que llega de fuera.** El DOM se busca con `$(selector, Tipo)`, que comprueba con `instanceof`; las respuestas de la red, `localStorage` y el `detail` de los eventos entran como `unknown` y pasan por un validador; `history.state` es `any` y se trata como `unknown`. Dentro de la frontera, el código confía en sus tipos.
- **Clases para lo que tiene estado y reglas.** El almacén, la tabla, el menú, el diálogo y el bus son clases con `#privados`, *parameter properties* y métodos genéricos; los datos son tipos sencillos.
- **Los fallos esperados son datos.** Las peticiones devuelven un `Result` o una unión de estados que la interfaz pinta (cargando, error, vacío, datos), y las cancelaciones con `AbortController` no se tratan como errores.
- **Accesibles y robustos.** Etiquetas, foco gestionado tras cada cambio, `aria-live`, `aria-sort`, `aria-expanded`, alternativas de teclado y avisos cuando la tarjeta aislada no permite algo (el historial). Nada de `href="#"`, nada de `console.error`, y `localStorage` siempre dentro de un `try`.

## Una tienda con rutas tipadas

**Objetivo:** una tienda de una sola página con inicio, categorías, fichas de producto y carrito. **Técnicas:** las rutas son patrones (`/producto/:sku`) y, con tipos de plantilla e `infer`, `Params<P>` saca sus parámetros; `Views` es un tipo mapeado que da a cada vista los suyos, y `href(ROUTES.product, { sku })` no compila sin el `sku`. La navegación usa el fragmento y `hashchange`; el historial guarda la profundidad para que «← Atrás» no saque al usuario de la página, y en la tarjeta aislada (donde `replaceState` lanza `SecurityError`) se avisa en la página. **Fíjate en** `history.state`: es `any`, y `currentDepth` lo trata como `unknown`.

[[exercise:01-tienda-con-rutas-tipadas.md]]

```text
🧭 #/ → Inicio
Listo: abre «Mole negro», añádelo al carrito, ve a «Carrito» y vuelve con «← Atrás»
// Tras pulsar «Mole negro» y «Añadir al carrito»:
🧭 #/producto/MOL-01 → Mole negro
🛒 Mole negro → 1 en el carrito
// Tras pulsar «Carrito (1)» en el menú:
🧭 #/carrito → Carrito (1)
// Tras pulsar «← Atrás» (en la tarjeta está desactivado: ábrelo con ▶):
🧭 #/producto/MOL-01 → Mole negro
```

## Un menú semanal con deshacer

**Objetivo:** el menú de la semana de una cocina económica, con deshacer y rehacer. **Técnicas:** `Store<S, A>` es una clase genérica con un reductor puro, suscriptores y dos pilas de estados; las acciones son una unión discriminada y el reductor acaba en un `never`; el estado es `Readonly<Record<Day, DishId | null>>` y además está congelado, así que la línea que intenta cambiarlo a mano lanza un `TypeError` (modo estricto). **Fíjate en** el foco: la tabla se repinta entera con cada cambio y el foco vuelve al control que lo tenía.

[[exercise:02-menu-semanal-con-deshacer.md]]

```text
🧊 el estado no se puede cambiar a mano: TypeError
Listo: 2 de 5 días · $180.00 por persona. Elige platos, pulsa «Quitar», «Vaciar la semana», «Deshacer» y «Rehacer»
// Tras elegir «Chiles en nogada» el martes y pulsar «Quitar» el lunes:
📝 assign martes → chiles · 3 de 5 días · $300.00 por persona
📝 clear-day lunes · 2 de 5 días · $205.00 por persona
// Tras pulsar «Deshacer», «Vaciar la semana», «Deshacer» y «Rehacer»:
📝 undo · 3 de 5 días · $300.00 por persona
📝 clear-week · 0 de 5 días · $0.00 por persona
📝 undo · 3 de 5 días · $300.00 por persona
📝 redo · 0 de 5 días · $0.00 por persona
```

## Un catálogo con reintentos

**Objetivo:** cargar un catálogo de un servidor que falla, tarda o está vacío, sin que la página se quede colgada. **Técnicas:** `fetchWithRetry<T>` recibe la URL de cada intento, un validador y las reglas; reintenta solo lo que puede arreglarse solo (red, plazo, 5xx) con espera exponencial; cada intento tiene su `AbortSignal.timeout`, combinado con la señal de «Cancelar» mediante `AbortSignal.any`. La interfaz es una unión discriminada de estados con `aria-busy`. **Fíjate en** «Se recupera al tercer intento»: los dos primeros intentos van a `/api/demo/echo?status=503` y el tercero a `catalog.json`.

[[exercise:03-catalogo-con-reintentos.md]]

```text
Listo: elige un servidor y pulsa «Cargar»; con «Lento» o «Caído», prueba también «Cancelar»
// Tras pulsar «Cargar» con «Estable»:
▶ stable
✅ 4 productos (1 intento(s))
// Tras elegir «Se recupera al tercer intento» y pulsar «Cargar»:
▶ recovers
⏳ intento 1: el servidor respondió 503 · reintento en 200 ms
⏳ intento 2: el servidor respondió 503 · reintento en 400 ms
✅ 4 productos (3 intento(s))
// Tras elegir «Caído (503)» y pulsar «Cargar» (algo más de un segundo):
▶ down
⏳ intento 1: el servidor respondió 503 · reintento en 200 ms
⏳ intento 2: el servidor respondió 503 · reintento en 400 ms
⏳ intento 3: el servidor respondió 503 · reintento en 800 ms
⚠️ el servidor respondió 503 (4 intento(s))
// Tras elegir «Lento (3 s)», pulsar «Cargar» y enseguida «Cancelar»:
▶ slow
⏹️ cancelado por el usuario
// Tras elegir «Sin productos» y pulsar «Cargar»:
▶ empty
✅ 0 productos (1 intento(s))
```

## Ajustes con versiones

**Objetivo:** los ajustes de lectura de un recetario, que sobreviven a tres cambios de formato. **Técnicas:** cada versión guardada es un tipo (`V1`, `V2`, `V3`) que un predicado reconoce desde `unknown`; las migraciones son un tipo mapeado sobre «versión → siguiente», así que la de 1 recibe un `V1` y debe devolver un `V2`; `upgrade` las encadena con un `switch`. Lo que no se reconoce se descarta y se avisa. Los ajustes se guardan en `localStorage` con la clave `lw-ts3-ajustes-lectura` y se conservan entre ejecuciones (recarga con ⟳); «Restablecer» los borra. En la tarjeta, `localStorage` es una copia en memoria. **Fíjate en** «Simular datos de 2024»: el tamaño `'large'` de la versión 1 se convierte en un 120 %.

[[exercise:04-ajustes-con-versiones.md]]

```text
⚙️ sin ajustes guardados: valores por defecto · tema auto · texto 100% · animaciones normales
Listo: cambia el tema o el tamaño, o pulsa «Simular datos de 2024 (v1)», «Simular datos dañados» y «Restablecer»
// Tras pulsar «Simular datos de 2024 (v1)»:
🔄 ajustes de la versión 1 migrados (1 → 2, 2 → 3) · tema dark · texto 120% · animaciones normales
// Tras pulsar «Simular datos dañados»:
⚠️ los ajustes guardados no se reconocen: se restablecen · tema auto · texto 100% · animaciones normales
// Tras elegir «Oscuro»:
💾 tema dark · texto 100% · animaciones normales
// Tras pulsar «Restablecer»:
🧹 ajustes borrados · tema auto · texto 100% · animaciones normales
```

## Una tabla genérica

**Objetivo:** una tabla ordenable y filtrable que sirva para cualquier lista de objetos. **Técnicas:** `DataTable<T>` recibe columnas `Column<T, K>` con su clave (`K extends keyof T`) y un formateador que recibe `T[K]`; la lista de columnas es un tipo mapeado indexado, así que dentro del array de columnas el formateador de `tickets` recibe un `number` y el de `free` un `boolean`. Ordena con los valores crudos (`Intl.Collator` para los textos) y filtra por el texto visible. **Fíjate en** la página: la misma clase crea dos tablas con tipos distintos, y las cabeceras son botones con `aria-sort`.

[[exercise:05-tabla-generica.md]]

```text
↕ museos por Entradas, ascendente → primero: Museo Frida Kahlo
↕ museos por Entradas, descendente → primero: Museo Nacional de Antropología
↕ actividades por Fecha, ascendente → primero: Taller de papel picado
Listo: pulsa las cabeceras para ordenar (dos veces cambia el sentido) o escribe en un filtro
// Tras pulsar «Ingresos» dos veces:
↕ museos por Ingresos, ascendente → primero: Museo Soumaya
↕ museos por Ingresos, descendente → primero: Museo Frida Kahlo
// Tras escribir «hidalgo» en «Filtrar museos», la tabla dice «2 de 4 museos.»
```

## Traducciones con `Intl`

**Objetivo:** el resumen de un pedido en español y en inglés. **Técnicas:** `MessageParams` dice qué parámetros necesita cada mensaje y `Messages` es un tipo mapeado sobre él, así que el inglés no puede olvidar una clave ni cambiar sus parámetros; `t('items', { count })` exige los datos de esa clave, y `t('heading')` no admite ninguno. Los mensajes son funciones que usan `Intl.PluralRules`, `Intl.ListFormat`, la moneda, la fecha (en la zona de la tienda) y `Intl.RelativeTimeFormat`. **Fíjate en** el cambio de idioma: cambian también `<html lang>` y el título.

[[exercise:06-traducciones-con-intl.md]]

```text
🌐 es-MX → Tu pedido · 1 producto · Total: $165.00 · Llega el lunes, 2 de noviembre de 2026 (dentro de 3 días)
Listo: pulsa «Añadir otro producto», cambia el idioma o pulsa el botón de pago
// Tras pulsar «Añadir otro producto»:
🌐 es-MX → Tu pedido · 2 productos · Total: $375.00 · Llega el lunes, 2 de noviembre de 2026 (dentro de 3 días)
// Tras elegir «English (US)» y pulsar «Pay MX$375.00»:
🌐 en-US → Your order · 2 items · Total: MX$375.00 · Arrives Monday, November 2, 2026 (in 3 days)
💳 Pay MX$375.00
```

## Un menú y un diálogo accesibles

**Objetivo:** las acciones de una lista de recetas (duplicar, marcar como favorita y eliminar con confirmación). **Técnicas:** `MenuButton<A>` sigue el patrón de menú de WAI-ARIA (`aria-haspopup`, `aria-expanded`, foco móvil, flechas, Inicio, Fin y Escape) y entrega acciones de un tipo literal; `ConfirmDialog` envuelve un `<dialog>` modal y su `ask()` devuelve una `Promise<boolean>`, así que «¿seguro?» se escribe con un `await`. **Fíjate en** el foco: el diálogo empieza en «Cancelar», vuelve al botón que lo abrió, y tras eliminar o duplicar va al botón de la receta (o al primero, si ya no existe).

[[exercise:07-menu-y-dialogo-accesibles.md]]

```text
Listo: abre «Acciones» de una receta (con el ratón o con Enter y las flechas) y prueba «Duplicar» y «Eliminar…»
// Tras elegir «Duplicar» en mole-negro.txt:
📄 duplicada «mole-negro.txt» → «mole-negro (copia).txt»
// Tras elegir «Cambiar favorita» en pozole-rojo.txt:
⭐ «pozole-rojo.txt» ya no es favorita
// Tras elegir «Eliminar…» en tamales-oaxaquenos.txt y pulsar «Cancelar» (o Escape):
❎ se conserva «tamales-oaxaquenos.txt»
// Tras repetirlo y pulsar «Eliminar»:
🗑️ eliminada «tamales-oaxaquenos.txt»
```

## Una lista reordenable

**Objetivo:** el orden de canciones de un concierto. **Técnicas:** arrastrar y soltar con `DragEvent` y un tipo propio en el `DataTransfer` (`application/x-lw-track`), comprobado en `dragover`; `event.dataTransfer` es `DataTransfer | null` y se comprueba siempre. Como arrastrar no es accesible con teclado, cada canción tiene «Subir» y «Bajar» y responde a Alt + ↑/↓. Todo acaba en una sola función genérica, `move<T>`. **Fíjate en** el aviso: un párrafo `aria-live` dice la nueva posición, y el foco sigue a la canción movida.

[[exercise:08-lista-reordenable.md]]

```text
🎵 5 canciones · 17:46 · empieza con «La Bamba»
Listo: arrastra una canción a otra posición, pulsa «Subir»/«Bajar» o usa Alt + ↑/↓ con una canción enfocada
// Tras pulsar «Bajar» en La Bamba:
↕ botón «La Bamba»: 1 → 2
// Tras enfocar Bésame mucho y pulsar Alt + ↑:
↕ teclado «Bésame mucho»: 5 → 4
// Tras arrastrar La Llorona sobre la mitad de arriba de la primera canción:
↕ arrastrando «La Llorona»: 4 → 1
```

## Un gráfico de ventas

**Objetivo:** las ventas mensuales de una cafetería en un gráfico de barras. **Técnicas:** `ventas.json` (ábrelo con «Assets») llega como `unknown` y `parseReport` lo convierte en un `SalesReport` o en una lista de problemas; la métrica es una clave tipada (`'units' | 'revenue'`), y `METRICS` dice cómo se llama y cómo se formatea cada una. El canvas se dibuja a la densidad de la pantalla y se redibuja con `ResizeObserver` solo cuando cambia el ancho. **Fíjate en** la accesibilidad: el canvas es `role="img"`, un pie de figura dice el máximo y el mínimo, y la tabla de abajo tiene los mismos números.

[[exercise:09-grafico-de-ventas.md]]

```text
📊 unidades · máximo: oct 2026 (2,410) · mínimo: abr 2026 (1,820)
Listo: elige «Ingresos» o «Unidades», abre la tabla o cambia el ancho de la vista previa
// Tras elegir «Ingresos»:
📊 ingresos · máximo: jul 2026 ($114,720) · mínimo: abr 2026 ($81,900)
```

## Un bus de eventos nativo

**Objetivo:** cuatro piezas de una tienda de discos (catálogo, contador, avisos y estadísticas) que se comunican sin conocerse. **Técnicas:** `TypedEventTarget<M>` extiende el `EventTarget` del navegador y solo añade tipos: `on<K>` y `emit<K>` relacionan el nombre del evento con sus datos, como hace `HTMLElementEventMap` con `addEventListener`. Las bajas usan la opción `signal`, así que desactivar las estadísticas es un solo `abort()`. **Fíjate en** que dentro de `on` no hay ningún `as`: un `instanceof CustomEvent` basta.

[[exercise:10-bus-de-eventos-nativo.md]]

```text
Listo: añade discos (de «El circo» solo queda 1), desmarca las estadísticas y sigue añadiendo
// Tras pulsar «Añadir» en Re y en El circo:
📈 cart:added · re ×1 · quedan 1
📈 cart:added · circo ×1 · quedan 0
📉 stock:out · circo
// Tras desmarcar «Enviar estadísticas de uso» y añadir Amor prohibido (el contador llega a 3):
🔕 estadísticas desactivadas
```

## Una inscripción con validadores

**Objetivo:** la inscripción a un taller de cocina, con errores claros y un usuario que se comprueba en el servidor mientras se escribe. **Técnicas:** el formulario es un tipo (`Signup`) y un esquema mapeado sobre él: cada campo dice cómo se lee de `FormData` y qué reglas cumple, y una regla de texto en el campo numérico no compila; `validate<F>` sirve para cualquier esquema. Los errores aparecen junto a cada control (`aria-describedby`, `aria-invalid`) y en un resumen con enlaces que recibe el foco. La comprobación del usuario espera 300 ms sin teclear y cancela la anterior con `AbortController`. **Fíjate en** que el servidor de prueba solo pone el retraso: la lista de usuarios ocupados la simula la página.

[[exercise:11-inscripcion-con-validadores.md]]

```text
Listo: pulsa «Inscribirme» con el formulario vacío, prueba los usuarios «chef_ana» y «chef_lucia» y completa la inscripción
// Tras pulsar «Inscribirme» con el formulario vacío:
⚠️ 3 campos por corregir: Nombre, Correo, Usuario
// Tras escribir «chef_ana» en Usuario (menos de un segundo):
🔎 chef_ana → ocupado
// Tras cambiarlo por «chef_lucia»:
🔎 chef_lucia → disponible
// Tras escribir «Lucía Méndez» y «lucia@example.com» y pulsar «Inscribirme»:
✅ 201 · Lucía Méndez (chef_lucia) · 1 plaza · nivel básico
```

## Seguimiento en vivo

**Objetivo:** el seguimiento de un pedido cuyos estados llegan uno a uno desde el servidor. **Técnicas:** `/api/demo/stream` envía NDJSON poco a poco; `readLines` es un `AsyncGenerator<string>` que junta los trozos en líneas, y `trackOrder` otro que las convierte en eventos tipados (los estados son una tupla `as const`). La barra `<progress>` y la línea de tiempo avanzan con cada evento, y «Dejar de seguir» aborta la petición. **Fíjate en** el tipo del cuerpo: con TypeScript 5.9, `response.body` es un `ReadableStream<Uint8Array<ArrayBuffer>>`, y con `ReadableStream<Uint8Array>` a secas el `pipeThrough(new TextDecoderStream())` no encaja.

[[exercise:12-seguimiento-en-vivo.md]]

```text
Listo: pulsa «Seguir el pedido» (cada estado llega medio segundo después del anterior) y prueba «Dejar de seguir»
// Tras pulsar «Seguir el pedido» (unos 2 s):
📦 1/5 · Pedido recibido
📦 2/5 · Preparando tu mole
📦 3/5 · Empaquetado
📦 4/5 · En camino con la paquetería
📦 5/5 · Entregado
// Tras pulsar otra vez «Seguir el pedido» y, tras el primer estado, «Dejar de seguir»:
📦 1/5 · Pedido recibido
⏹️ seguimiento detenido
```

## Para profundizar

- [WAI-ARIA Authoring Practices: botón de menú (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [MDN: el elemento dialog (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [MDN: AbortSignal.any() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)
- [GOV.UK Design System: resumen de errores (en inglés)](https://design-system.service.gov.uk/components/error-summary/)
- [Manual de TypeScript: tipos de plantilla (en inglés)](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
