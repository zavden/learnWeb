# Integración: TypeScript en la práctica

## Por qué importa

Las cuatro lecciones del módulo enseñan TypeScript donde se usa de verdad: en el navegador. Y en una página real casi nunca aparecen solas. Una ficha de producto carga datos con `fetch`, los valida, busca elementos del DOM, emite eventos y guarda un carrito en una clase. Un formulario lee `FormData`, estrecha cada valor y envía el resultado a un servidor que puede fallar. Un componente tiene su clase, su etiqueta y sus eventos en los mapas del navegador.

Los seis ejemplos de esta página combinan dos, tres o las cuatro lecciones, sin un solo error de tipos. Fíjate en dónde están las comprobaciones: siempre en la **frontera**, justo donde algo llega de fuera del verificador (el HTML, una respuesta de la red, una biblioteca sin tipos, un evento). Dentro, el código ya trabaja con tipos ciertos y casi no necesita `if`. Los tres ejercicios del final parten de código que compila «limpio» gracias a aserciones y atajos; el objetivo es doble, comprobaciones ✓ y ningún error de tipos.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|---|---|---|
| un elemento obligatorio con su tipo exacto | `$(selector, Tipo)`, que comprueba con `instanceof` (nunca `querySelector<T>` ni `!`) | «DOM tipado» |
| el elemento real de un clic delegado | `event.target instanceof Element` y `closest('etiqueta')` | «DOM tipado» |
| un valor de un formulario | `valueAsNumber`, `typeof x === 'string'` con `FormData`, un predicado para las uniones | «DOM tipado» |
| un evento propio con datos | `CustomEvent<T>` y `declare global { interface HTMLElementEventMap {…} }` | «DOM tipado» |
| estado con reglas que nadie debe romper | una clase con `#privados` y *parameter properties* | «Clases en TypeScript» |
| datos de la red | `unknown` + un validador, nunca `as` sobre `json()` | «Asincronía tipada» |
| fallos que quien llama debe tratar | un `Result` o errores con un `kind` literal y un `switch` exhaustivo | «Asincronía tipada» |
| una biblioteca JavaScript sin tipos | sus declaraciones (`.d.ts`; en LearnWeb, un bloque `declare module`) | «Módulos y declaraciones» |
| datos que deja el servidor en `window` | `declare global { interface Window {…} }` | «Módulos y declaraciones» |

## Ejemplos combinados

### La ficha de un producto

Las cuatro lecciones en una página. El producto llega de `producto.json` (ábrelo con «Assets») y `isProduct` lo valida desde `unknown`; `loadProduct` devuelve un `Result`, así que la página decide qué hacer sin `try/catch`. «Añadir al carrito» emite un `cart:add` con un `CartAdd` comprobado al escribirlo, y el listener de `document` lo recibe tipado gracias a la ampliación de `DocumentEventMap`. El carrito es una clase con un `#lines` privado y el máximo por producto como *parameter property*. **Fíjate en** «Pagar»: la respuesta del servidor de prueba se comprueba igual que si viniera de otro, porque para el verificador es tan desconocida como cualquier otra.

[[exercise:01-ficha-de-producto.md]]

```text
Listo: Mole negro de Oaxaca (4 en almacén). Elige los frascos, pulsa «Añadir al carrito» y «Pagar»
// Tras elegir 2 frascos y pulsar «Añadir al carrito»:
🛒 +2 Mole negro de Oaxaca → 2 en el carrito
// Tras elegir 3 y pulsar «Añadir al carrito» otra vez:
⚠️ Mole negro de Oaxaca: el máximo es 4 frascos (ya tienes 2)
// Tras pulsar «Pagar»:
✅ 201 · pedido enviado: $330.00
```

### Una reserva en dos pasos

Un asistente para reservar un recorrido por Teotihuacan. El estado es un tipo, `TourBooking`, y los errores son `Partial<Record<keyof TourBooking, string>>`: solo pueden existir para campos que existen. Cada valor sale de `FormData` estrechado (`string | File | null` → texto) y el horario pasa por un predicado antes de ser un `TourId`. El envío devuelve un `Result` y distingue un servidor caído de un plazo agotado. **Fíjate en** `event.currentTarget instanceof HTMLButtonElement`: `currentTarget` también es `EventTarget | null` en los tipos.

[[exercise:02-reserva-en-dos-pasos.md]]

```text
Listo: elige el horario y las personas, pulsa «Siguiente», escribe tu correo y pulsa «Reservar»
// Tras escribir 8 personas y pulsar «Siguiente» (el campo muestra «Escribe un número de 1 a 6»):
// Tras escribir 3 y pulsar «Siguiente»:
➡️ paso 2 · Amanecer en globo para 3
// Tras escribir «ana@example.com» y pulsar «Reservar»:
Enviando…
✅ Amanecer en globo para 3 · confirmación enviada a ana@example.com
// Tras marcar «Simular que el servidor está caído» y pulsar «Reservar»:
Enviando…
⚠️ el servidor no pudo reservar (503); inténtalo en un momento
```

### Un cliente de API

Una clase `ApiClient` guarda la dirección base y el plazo como *parameter properties*, y su método genérico `get<T>(ruta, validador)` devuelve `Result<T, ApiError>`. Los errores combinan lo mejor de dos lecciones: son **clases** (tienen `name`, `message` y `instanceof`) y llevan un campo `readonly kind = 'http'` cuyo tipo es el literal, así que la unión `ApiError` se estrecha con un `switch` como una unión discriminada, y `explain` no compila si falta un caso. **Fíjate en** que las cinco peticiones salen a la vez y se esperan en orden.

[[exercise:03-cliente-de-api.md-]]

```text
catálogo → ✅ Mole negro, Café de Chiapas, Chocolate de metate
catálogo antiguo → ⚠️ 3 problema(s) en la respuesta: [0].price: llegó "165.00" | [1].price: llegó "210.00" | [2].price: llegó "95.00"
sin archivo → ⛔ HTTP 404 en catalogo.json
lento → ⏱️ sin respuesta en 300 ms
sin servidor → 📡 no se pudo conectar con http://localhost:59999/catalog
```

### Un componente con sus eventos

`<qty-stepper>` es un elemento propio escrito en TypeScript: una clase con campos `#privados`, un `value` con getter y setter que limita el número, `static observedAttributes` y un evento `qty:change` con `{ value, previous }`. `declare global` añade la etiqueta a `HTMLElementTagNameMap` y el evento a `HTMLElementEventMap`, y el carrito que lo usa no necesita ni un `as`: `line.querySelector('qty-stepper')` es un `QtyStepper | null` y `event.detail.previous` es un `number`. **Fíjate en** las anotaciones de `#minus` y `#plus`: sin ellas, TypeScript entra en un círculo (`TS7022`), porque `createElement` consulta un mapa que incluye la propia clase.

[[exercise:04-componente-con-eventos.md]]

```text
Listo: total $500.00. Usa «−» y «+» (el cacao llega como máximo a 3)
// Tras pulsar «+» en el café:
🔢 Café de Chiapas: 1 → 2 · total $710.00
// Tras pulsar «+» en el cacao (llega a 3 y su «+» se desactiva):
🔢 Cacao de Tabasco: 2 → 3 · total $855.00
```

### Caza de mentiras

Cuatro errores clásicos de TypeScript en el navegador, que compilan sin una sola línea roja, junto a su versión honrada: `querySelector<T>` sobre un `<select>`, `json() as Product[]` con precios en texto, `event.target as HTMLButtonElement` cuando el clic cae en el icono, y una promesa sin `await` cuyo error escapa del `try`. La página los ejecuta al cargar (el clic se simula con `dispatchEvent`) y un listener de `unhandledrejection` recoge el rechazo que nadie esperaba. **Fíjate en** que tres de las cuatro mentiras usan `as` o su disfraz genérico: buscar `as` en un proyecto es una buena forma de encontrar fallos.

[[exercise:05-caza-de-mentiras.md]]

```text
🐛 1 · <HTMLInputElement> → total NaN
✅ 1 · instanceof → total 330
🐛 2 · as Product[] → total 0165.00210.0095.00
✅ 2 · unknown + predicado → 0 productos válidos de 3
🐛 3 · as HTMLButtonElement → target <span> · ¿botón desactivado? false
✅ 3 · closest('button') → ¿botón desactivado? true
🐛 4 · sin await → el error escapó del try: Error: HTTP 500 al guardar el carrito
✅ 4 · con await → el catch lo recibe: Error: HTTP 500 al guardar el carrito
```

### Una biblioteca sin tipos

La página de «recoge en tienda» usa `sucursales.js`, una biblioteca JavaScript sin tipos, y una configuración que el servidor deja en `window.__STORE_CONFIG__`. Un bloque `declare module` hace el papel de su `.d.ts` (con un tipo de plantilla para las horas, `` `${number}:${number}` ``) y `declare global` amplía `Window`. A partir de ahí, `nearestBranches` devuelve `Array<Branch & { distance: number }>` y la página se comprueba entera. **Fíjate en** `isClock`: el `value` de un `<input type="time">` es un `string`, y para pasarlo a una función que pide `Clock` hay que comprobarlo; el tipo de plantilla no se gana gratis.

[[exercise:06-biblioteca-sin-tipos.md]]

```text
📍 06600 a las 19:30 → Roma Norte, Ciudad de México (abierta), Coyoacán, Ciudad de México (cerrada) · recoge en 2 días
Listo: cambia el código postal o la hora y pulsa «Buscar»
// Tras escribir 68050 y pulsar «Buscar»:
📍 68050 a las 19:30 → Centro, Oaxaca (abierta), Centro, Puebla (cerrada) · recoge en 2 días
```

## Ejercicios

Los tres ejercicios se corrigen solos: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Están terminados cuando todas salen ✓ **y** el verificador no marca ningún error de tipos (en el editor o en la franja del diálogo «▶ Run»). Las comprobaciones no hace falta tocarlas.

### Un manejador de eventos sin `as`

La lista de canciones favoritas compila sin errores porque cada valor dudoso lleva un `as`, y las cuatro comprobaciones salen ✗: un clic en el icono de la estrella no marca nada, el contador no cambia y un clic fuera de los botones «marca» la fila. Quita todos los `as` y estrecha de verdad, con `$` y con `closest`. Cuatro comprobaciones.

[[exercise:07-ej-manejador-sin-as.md]]

### De `as` a `Result`

`loadCatalog` promete un `Result`, pero se fía de `json()` con un `as`, trata un 404 como si fuera el catálogo y deja escapar el error de red. Conviértelo en una función que nunca lanza: comprueba `response.ok`, valida desde `unknown` y devuelve un fallo tipado para cada caso. Cinco comprobaciones.

[[exercise:08-ej-fetch-con-result.md]]

### Una reserva con *parameter properties*

Una clase `Reservation` escrita «a la antigua» deja el código de acceso en el JSON, guarda un total que no sigue a las noches y tiene un método sin tipos (`TS7006`). Reescríbela con *parameter properties*, un `#privado`, un getter e `implements Priced`, sin cambiar cómo se crea. Cinco comprobaciones.

[[exercise:09-ej-clase-con-parameter-properties.md]]
