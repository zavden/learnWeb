# Peticiones con fetch

## Por qué importa

Hasta ahora, los datos de tus páginas estaban escritos en el HTML o en el propio script. Una aplicación de verdad los **pide mientras funciona**: busca recetas mientras escribes, guarda un pedido sin recargar, carga la página siguiente de un catálogo. `fetch` es la función del navegador para hacer peticiones HTTP desde JavaScript, y todo lo que estudiaste en el módulo «Asincronía y event loop» (promesas, `await`, `AbortController`) existe en buena parte para ella.

En la primera lección del curso, «Cómo funciona la web», viste `fetch` de pasada para mirar un código de estado y unas cabeceras. Aquí la usarás entera: leer la respuesta, distinguir los tres tipos de fallo, enviar datos, cancelar y mantener la interfaz al día cuando las respuestas llegan desordenadas. Casi todos los errores de esta lección son **silenciosos**: el programa sigue, sin excepción, con datos equivocados.

## El servidor de prueba

Los ejemplos de este módulo hablan con un pequeño servidor de prueba que viene con LearnWeb. No guarda nada: responde según lo que le pidas en la dirección, para que puedas provocar cada caso a voluntad.

| Dirección | Qué hace |
|-----------|----------|
| `/api/demo/echo` | Acepta cualquier método y contesta con un JSON que describe la petición que le llegó: `method`, `path`, `query`, algunas cabeceras (`content-type`, `accept`, `authorization` y las `x-…`) y el `body` ya analizado |
| `/api/demo/echo?status=404` | Contesta con ese código (de 200 a 599) |
| `/api/demo/echo?delay=1500` | Tarda esos milisegundos en contestar (máximo 10 000) |
| `/api/demo/stream` | Envía un texto poco a poco, en trozos (lección «Streams y progreso») |
| cualquier otra `/api/demo/…` | `404` con una página HTML, como un servidor típico |

Las rutas relativas sin barra inicial (`fetch('products.json')`) apuntan a la carpeta `assets/` de cada tema, que puedes abrir con el botón «Assets». Un archivo que no existe contesta `404` con el JSON `{"error":"Asset not found"}`.

## Una petición en dos tiempos

`fetch(url)` envía la petición y devuelve **en el acto** una promesa. Esa promesa se cumple con un objeto `Response` en cuanto llegan el **código de estado y las cabeceras**, no cuando ha llegado todo. El cuerpo, que puede ser enorme, sigue en camino y se lee aparte, con otra promesa:

```text
await fetch(url) ─────────► Response: status 200, cabeceras   (promesa 1)
                                 │
await response.json() ──────────►└─ cuerpo completo, analizado  (promesa 2)
```

Por eso casi todo `fetch` lleva dos `await`. El ejemplo lee el catálogo de la tienda desde `assets/products.json` y después mide las dos esperas con el servidor de prueba, que envía el cuerpo en cuatro trozos, uno cada 250 ms:

[[exercise:01-primera-peticion.md-]]

```text
status → 200 OK
ok (status entre 200 y 299) → true
Content-Type → application/json; charset=UTF-8
productos → 5
  · Café de Chiapas · 500 g: $210
  · Café de Veracruz · 250 g: $135
  · Cacao de Tabasco · 250 g: $145
  · Cajeta de Celaya · 370 g: $98
  · Vainilla de Papantla · 3 vainas: $160
1. Response (cabeceras) en menos de 200 ms → true
2. cuerpo completo tras 750 ms o más → true | 256 caracteres
```

Los ejemplos de esta lección usan `await` en el nivel superior del script. LearnWeb los carga como módulos al verlo (lo viste en la lección «async/await»), así que no necesitan una función `async function main()`.

## El objeto `Response`

| Propiedad | Qué es |
|-----------|--------|
| `status` | el código: `200`, `201`, `404`, `500`… |
| `statusText` | su texto: `'OK'`, `'Not Found'`… (en HTTP/2 llega vacío: no lo uses para decidir) |
| `ok` | `true` si `status` está entre 200 y 299 |
| `headers` | un objeto `Headers`: `get(nombre)` (sin distinguir mayúsculas), `has`, y se recorre con `for…of` |
| `url` | la dirección final, después de las redirecciones |
| `redirected` | `true` si hubo alguna redirección por el camino |
| `type` | `'basic'`, `'cors'` u `'opaque'`: lo verás en la lección «Orígenes y CORS» |
| `body` | el cuerpo como flujo de bytes (`ReadableStream`): lección «Streams y progreso» |
| `bodyUsed` | `true` en cuanto alguien empezó a leer el cuerpo |

Para leer el cuerpo hay un método por formato, y todos devuelven una promesa:

| Método | Da | Para |
|--------|----|------|
| `json()` | el valor analizado (`JSON.parse` del texto) | APIs |
| `text()` | un string | HTML, CSV, texto |
| `blob()` | un `Blob`: bytes con un tipo MIME | imágenes y archivos (capítulo 8) |
| `arrayBuffer()` | un `ArrayBuffer`: bytes sin más | formatos binarios (capítulo 8) |
| `formData()` | un `FormData` | respuestas de formulario (raras) |

```js
const photo = await fetch('mercado.jpg');
const blob = await photo.blob();          // Blob {size: 48213, type: 'image/jpeg'}
const bytes = await (await fetch('mercado.jpg')).arrayBuffer(); // otra petición: ver abajo por qué
```

> **Desde Python:** `fetch` se parece a `requests`, con nombres distintos y una diferencia de diseño: `requests.get` descarga el cuerpo entero antes de volver, y `fetch` vuelve con las cabeceras.

| `requests` | `fetch` |
|------------|---------|
| `r = requests.get(url)` | `const r = await fetch(url)` |
| `r.status_code`, `r.reason` | `r.status`, `r.statusText` |
| `r.ok` | `r.ok` |
| `r.headers['Content-Type']` | `r.headers.get('content-type')` |
| `r.json()`, `r.text`, `r.content` | `await r.json()`, `await r.text()`, `await r.arrayBuffer()` |
| `r.raise_for_status()` | `if (!r.ok) throw new Error(…)` |
| `requests.post(url, json=datos)` | `fetch(url, { method: 'POST', headers: {…}, body: JSON.stringify(datos) })` |

Una nota sobre datos de la propia aplicación. En el módulo «Módulos y organización» viste que un JSON se puede importar como módulo (`import data from './x.json' with { type: 'json' }`), y se dijo que, para datos que cambian mientras la página está abierta, se usa `fetch`. La diferencia: un módulo se carga **una vez** y queda guardado para toda la página; cada `fetch` vuelve a preguntar al servidor y trae los datos de ese momento.

### El cuerpo se lee una sola vez

El cuerpo es un **flujo** de bytes que se consume al leerlo. Después de `json()`, el `Response` ya no tiene cuerpo: `text()`, `blob()` o un segundo `json()` fallan. Si necesitas dos lecturas (los datos y el texto para un registro), lee una vez como texto y analiza tú con `JSON.parse`, o haz `response.clone()` **antes** de leer:

[[exercise:02-el-cuerpo-se-lee-una-vez.md-]]

```text
json() → 5 productos | bodyUsed → true
🐛 text() después de json() → TypeError: Failed to execute 'text' on 'Response': body stream already read
✅ text() → 378 caracteres | JSON.parse → 5 productos
✅ clone() → json: 5 productos | text: 378 caracteres
🐛 clone() tarde → TypeError: Failed to execute 'clone' on 'Response': Response body is already used
```

## Un 404 no es un error para `fetch`

Esta es la sorpresa más famosa de `fetch`. La promesa se **rechaza** solo cuando no hay respuesta HTTP: sin conexión, servidor apagado, un bloqueo de CORS o una cancelación. Si el servidor contesta, aunque sea con `404 Not Found` o `500 Internal Server Error`, la promesa se **cumple**: para `fetch`, la petición salió bien; el servidor contestó, solo que con malas noticias.

| Lo que pasa | `fetch` | `response.ok` |
|-------------|---------|---------------|
| `200 OK`, `201 Created`, `204 No Content` | se cumple | `true` |
| `301`/`302` (redirección) | la sigue sola y se cumple con la respuesta final | según la final |
| `404`, `401`, `403`, `422`… (error del cliente) | se cumple | `false` |
| `500`, `502`, `503`… (error del servidor) | se cumple | `false` |
| sin red, servidor apagado, CORS | **se rechaza** (`TypeError`) | — |
| cancelada con una señal | **se rechaza** (`AbortError`, `TimeoutError`) | — |

Un código sin `response.ok` trata la respuesta de error como si fueran los datos. En el ejemplo, un nombre de archivo mal escrito hace que el catálogo sea el objeto `{error: 'Asset not found'}`, y nada avisa hasta que algo más adelante intenta recorrerlo:

[[exercise:03-fetch-no-rechaza-en-404.md-]]

```text
🐛 ningún error; «products» → {error: 'Asset not found'}
🐛 ¿es la lista de productos? → false
🐛 500 → la promesa se CUMPLIÓ | ok: false | status: 500 Internal Server Error
✅ catch → HTTP 404 Not Found al pedir productos.json
✅ con el nombre bien → 5 productos
```

La regla: después de cada `fetch`, **mira `response.ok`** y lanza tú el error. Si abres el ejemplo con ↗ y miras la consola de DevTools, verás además una línea roja `GET … 404 (Not Found)` por cada petición fallida: la escribe la parte de red del navegador, no tu código, y la consola de LearnWeb no la muestra.

### «Unexpected token '<'»

La variante más desconcertante: pides JSON a una dirección equivocada, el servidor contesta `404` con su página de error en HTML, y `response.json()` intenta analizar ese HTML. El error habla de un carácter `<`, no de un 404:

[[exercise:04-json-de-una-pagina-de-error.md-]]

```text
🐛 SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
status → 404 | Content-Type → text/html; charset=utf-8
primeros 15 caracteres → <!DOCTYPE html>
✅ HTTP 404 Not Found (llegó text/html)
```

Traducido: «me pediste JSON y te di HTML». Las causas típicas son una ruta mal escrita, una sesión caducada que redirige a la página de login (que llega con `200`) o un proxy que pone su propia página de error. Comprueba `ok` y el `Content-Type` antes de llamar a `json()`, y mira la pestaña **Network** de DevTools antes de sospechar de tu JSON.

## Tres formas de fallar

Una petición puede salir mal de tres maneras, y cada una pide una reacción distinta:

| Fallo | Cómo se ve | Qué hacer |
|-------|-----------|-----------|
| **de red** | `fetch` se rechaza con `TypeError: Failed to fetch` | avisar «sin conexión» y reintentar más tarde |
| **HTTP** | `response.ok === false`; el `status` dice cuál | `4xx`: el error es de la petición, reintentar no sirve (salvo `408`/`429`); `5xx`: reintentar con espera |
| **de contenido** | `json()` lanza `SyntaxError`, o el `Content-Type` no es el esperado | es un error de programación o de configuración: registrarlo |

Una función `getJSON` reutilizable convierte esos casos en errores propios (`NetworkError`, `HttpError` con su `status` y el cuerpo que explicó el servidor), y quien la llama decide con `instanceof`. Las cancelaciones pasan tal cual: no son fallos de red.

[[exercise:05-getjson-y-tipos-de-error.md-]]

```text
✅ catálogo → 5 productos
⛔ pedido inexistente → HTTP 404 Not Found: reintentar no sirve (pedido P-9999)
⏳ informe de ventas → HTTP 503 Service Unavailable: falla el servidor, reintentar más tarde
📡 sin servidor → NetworkError: no se pudo conectar con http://localhost:59999/ (causa: Failed to fetch)
❓ texto plano → TypeError: se esperaba JSON y llegó text/plain; charset=utf-8
```

`Failed to fetch` no dice **por qué**: el navegador oculta a la página el motivo real (servidor apagado, DNS, certificado, CORS), porque una página maliciosa podría usarlo para explorar tu red. El motivo aparece en la consola de DevTools y en la pestaña Network. Los reintentos con espera exponencial los escribiste en la lección «async/await»: con `getJSON`, se reintenta solo si el error es `NetworkError` o un `HttpError` con `status >= 500`.

## Enviar datos

El segundo argumento de `fetch` es un objeto de opciones. Las que más usarás:

| Opción | Valores | Para |
|--------|---------|------|
| `method` | `'GET'` (por defecto), `'POST'`, `'PUT'`, `'PATCH'`, `'DELETE'` | qué hacer con el recurso |
| `headers` | un objeto `{ 'Content-Type': … }` o un `Headers` | describir la petición |
| `body` | string, `FormData`, `URLSearchParams`, `Blob`, bytes | los datos |
| `signal` | una `AbortSignal` | cancelar (más abajo) |
| `credentials`, `mode` | `'include'`, `'no-cors'`… | lección «Orígenes y CORS» |

Para enviar JSON hacen falta **dos** cosas: convertir el objeto en texto con `JSON.stringify` y avisar con la cabecera `Content-Type: application/json`. El servidor de prueba devuelve lo que recibió, así que puedes comprobar las dos:

[[exercise:06-post-con-json.md-]]

```text
status → 201 Created
el servidor recibió → POST /api/demo/echo
Content-Type → application/json
X-Request-Id → pedido-0042
cuerpo (ya analizado por el servidor) → {customer: 'C-1042', items: Array(1), notes: 'Entregar por la tarde'}
¿el mismo pedido? → true
respuesta Content-Type → application/json; charset=utf-8
FormData → multipart/form-data {name: 'Lucía Ramírez', newsletter: 'sí'}
```

Cada tipo de `body` trae su `Content-Type` automático, y por eso con `FormData` no debes escribirlo tú: el navegador añade el separador (`boundary`) que necesita. El módulo «Formularios con JavaScript» enseña a construir el `FormData` desde un formulario. Una petición `GET` o `HEAD` no puede llevar cuerpo (la promesa de `fetch` se rechaza con un `TypeError`); sus datos van en la query (`?q=mole`), que aprenderás a construir sin errores en la lección «URL e historial».

| `body` | `Content-Type` que pone el navegador |
|--------|--------------------------------------|
| un string | `text/plain;charset=UTF-8` |
| `URLSearchParams` | `application/x-www-form-urlencoded;charset=UTF-8` |
| `FormData` | `multipart/form-data; boundary=…` |
| `Blob` | el `type` del blob (o ninguno) |
| un objeto cualquiera | se convierte en el string `'[object Object]'` |

### Los dos olvidos

La última fila de la tabla es el primer olvido. Un objeto no es un cuerpo válido, pero `fetch` no lo rechaza: lo convierte en texto con `String(objeto)` y envía `[object Object]`. Este servidor contesta `400 Bad Request`; otros guardan el texto sin mirar:

[[exercise:07-post-sin-stringify.md-]]

```text
🐛 status → 400 Bad Request
🐛 el servidor recibió → [object Object]
🐛 y contestó → Invalid JSON body
String(order) → [object Object]
✅ status → 200 OK
✅ el servidor recibió → {customer: 'C-1042', sku: 'CAF-500', quantity: 2}
```

El segundo olvido es más silencioso: `JSON.stringify` sin la cabecera. El cuerpo es un string, así que el navegador lo anuncia como `text/plain`, y la mayoría de los servidores solo analizan JSON cuando el `Content-Type` lo dice. El pedido llega como texto, con `status 200`:

[[exercise:08-post-sin-content-type.md-]]

```text
Content-Type automático → text/plain;charset=UTF-8
🐛 status → 200 (sin error)
🐛 Content-Type recibido → text/plain;charset=UTF-8
🐛 typeof del cuerpo en el servidor → string
🐛 body.quantity → undefined
✅ Content-Type recibido → application/json
✅ typeof del cuerpo → object | quantity → 2
```

La defensa contra los dos es la misma: una función `postJSON(url, datos)` que haga el `stringify` y ponga la cabecera, y que nadie escriba `fetch` con JSON a mano en cada sitio.

## Cancelar y poner plazos

En el módulo «Asincronía y event loop» construiste operaciones cancelables con `{ signal }`, y se te prometió que `fetch` acepta la misma opción. Aquí está: `fetch(url, { signal })` se rechaza con el motivo de la señal en cuanto se cancela, y el navegador **cierra la conexión** (el servidor de prueba deja de preparar su respuesta). Las tres herramientas de entonces funcionan igual: `AbortController` para el botón «Cancelar», `AbortSignal.timeout(ms)` para un plazo y `AbortSignal.any([...])` para las dos a la vez.

[[exercise:09-cancelar-con-signal.md-]]

```text
1. cancelada → AbortError: signal is aborted without reason
2. plazo → TimeoutError: signal timed out
3. informe rápido (50 ms) → ✅ 200 OK
   informe lento (1000 ms) → ⏰ plazo de 300 ms agotado
   el usuario cancela a los 100 ms → 🛑 cancelado por el usuario
4. status 200 pero el cuerpo → AbortError
```

El punto 4 es fácil de olvidar: la señal sigue mandando mientras se lee el cuerpo. Un plazo de `AbortSignal.timeout` cubre la petición **entera**, cabeceras y descarga.

## Respuestas viejas y estados de la interfaz

Un buscador que pide resultados en cada tecla lanza varias peticiones seguidas, y nada garantiza que lleguen en orden: una búsqueda corta («m») puede costarle más al servidor que una larga («mole»). Si cada respuesta pinta al llegar, la **última en llegar** gana, aunque sea una búsqueda que el usuario ya dejó atrás. Es la carrera que simulaste en la integración del módulo «Asincronía y event loop», ahora con peticiones reales: el servidor de prueba tarda más cuanto más corta es la búsqueda.

El ejemplo tiene una casilla para activar el arreglo, que es el de siempre: antes de cada búsqueda, `abort()` de la anterior. Prueba «Simular tecleo» sin la casilla y con ella, y marca también «Simular servidor caído» para ver el estado de error:

[[exercise:10-buscador-sin-respuestas-viejas.md]]

[[exercise:10-buscador-sin-respuestas-viejas.md-(script.js)]]

```text
Listo: pulsa «Simular tecleo» sin marcar «Cancelar la petición anterior» y después con la casilla marcada
// Tras «Simular tecleo» sin la casilla (🐛):
→ pido «m» (tarda 1000 ms)
→ pido «mo» (tarda 700 ms)
→ pido «mol» (tarda 400 ms)
→ pido «mole» (tarda 100 ms)
← llega «mole»: 3 receta(s)
🐛 llega «mol»: 5 receta(s), pero el campo dice «mole»
🐛 llega «mo»: 6 receta(s), pero el campo dice «mole»
🐛 llega «m»: 8 receta(s), pero el campo dice «mole»
// Tras marcar «Cancelar la petición anterior» y «Simular tecleo»:
→ pido «m» (tarda 1000 ms)
→ pido «mo» (tarda 700 ms)
✖ «m» cancelada
→ pido «mol» (tarda 400 ms)
✖ «mo» cancelada
→ pido «mole» (tarda 100 ms)
✖ «mol» cancelada
← llega «mole»: 3 receta(s)
// Tras marcar también «Simular servidor caído» y «Simular tecleo»:
→ pido «m» (tarda 1000 ms)
→ pido «mo» (tarda 700 ms)
✖ «m» cancelada
→ pido «mol» (tarda 400 ms)
✖ «mo» cancelada
→ pido «mole» (tarda 100 ms)
✖ «mol» cancelada
⛔ «mole»: HTTP 503 Service Unavailable
```

Fíjate también en los **estados** de la página, que todo componente que pide datos necesita: inicial («Escribe para buscar»), cargando («Buscando…», con `aria-busy="true"` en la lista), vacío («Ninguna receta con…»), error (con un mensaje que propone qué hacer) y éxito. El texto del estado vive en un elemento con `role="status"`, que los lectores de pantalla anuncian sin mover el foco. En la integración del módulo de eventos se añadía además un *debounce*, que ahorra peticiones; la cancelación sigue haciendo falta, porque un *debounce* reduce las carreras pero no las impide.

## Bestiario

- **Leer el cuerpo dos veces.**
  Síntoma: `TypeError: Failed to execute 'text' on 'Response': body stream already read`.
  Causa: el cuerpo es un flujo y se consume al leerlo; cada `Response` admite una sola lectura (`json`, `text`, `blob`…).
  Solución: lee una vez como texto y usa `JSON.parse`, o llama a `response.clone()` antes de la primera lectura.
  → [ver ejemplo](02-el-cuerpo-se-lee-una-vez.md)
- **El 404 que nadie vio.**
  Síntoma: con una URL equivocada o el servidor caído, el programa sigue sin error y trabaja con datos raros (`{error: …}`, `undefined`).
  Causa: `fetch` solo se rechaza cuando no hay respuesta; un `404` o un `500` cumplen la promesa.
  Solución: comprueba `response.ok` (o `status`) después de cada `fetch` y lanza un error propio con el código.
  → [ver ejemplo](03-fetch-no-rechaza-en-404.md)
- **`Unexpected token '<'`.**
  Síntoma: `response.json()` lanza `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
  Causa: llegó una página HTML (de error, de login, de un proxy) en vez de JSON.
  Solución: comprueba `ok` y `Content-Type` antes de `json()`; mira la respuesta real en la pestaña Network.
  → [ver ejemplo](04-json-de-una-pagina-de-error.md)
- **El servidor recibe `[object Object]`.**
  Síntoma: un `400`, o un registro guardado con el texto `[object Object]`.
  Causa: se pasó un objeto como `body` sin `JSON.stringify`; `fetch` lo convierte con `String()`.
  Solución: `body: JSON.stringify(datos)` siempre, mejor dentro de un `postJSON` reutilizable.
  → [ver ejemplo](07-post-sin-stringify.md)
- **El servidor no ve los campos del JSON.**
  Síntoma: `200 OK`, pero el servidor recibe un string o un cuerpo vacío; sus campos son `undefined`.
  Causa: sin cabecera, un body de texto se envía como `text/plain;charset=UTF-8` y el servidor no lo analiza como JSON.
  Solución: añade `'Content-Type': 'application/json'` a las cabeceras.
  → [ver ejemplo](08-post-sin-content-type.md)
- **Resultados de una búsqueda vieja.**
  Síntoma: el campo dice «mole» y la lista muestra resultados de «m».
  Causa: las respuestas llegan en cualquier orden y la última en llegar pinta, aunque sea de una petición antigua.
  Solución: guarda el `AbortController` de la petición en curso y llama a `abort()` antes de lanzar la siguiente.
  → [ver ejemplo](10-buscador-sin-respuestas-viejas.md)

## Resumen

- `fetch(url, opciones)` devuelve una promesa de `Response` que se cumple con las cabeceras; el cuerpo se lee después con `json()`, `text()`, `blob()` o `arrayBuffer()`, una sola vez.
- `fetch` solo se rechaza sin respuesta (red, CORS, cancelación); un `404` o un `500` la cumplen: mira siempre `response.ok`.
- Separa los fallos de red, los HTTP (con su `status`) y los de contenido; reintenta solo los de red y los `5xx`.
- Para enviar JSON: `method`, `headers: { 'Content-Type': 'application/json' }` y `body: JSON.stringify(datos)`. Con `FormData`, no pongas `Content-Type`.
- `{ signal }` cancela la petición y la lectura del cuerpo; `AbortSignal.timeout` y `AbortSignal.any` dan plazos y combinaciones.
- En un buscador, cancela la petición anterior y muestra los estados cargando, vacío y error.

## Para profundizar

- [MDN: Usando Fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: Response (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [javascript.info: Fetch](https://es.javascript.info/fetch)
- [javascript.info: Fetch: interrumpir](https://es.javascript.info/fetch-abort)
- [Fetch Standard (en inglés)](https://fetch.spec.whatwg.org/)
