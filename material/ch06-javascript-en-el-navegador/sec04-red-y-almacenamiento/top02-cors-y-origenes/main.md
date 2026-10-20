# Orígenes y CORS

## Por qué importa

Tu navegador guarda tus sesiones abiertas: la cookie de tu banco, la de tu correo, la de la tienda donde compras. Cada vez que pide algo a esos sitios, adjunta su cookie, y el sitio te reconoce. Ahora imagina que cualquier página que visitas pudiera hacer `fetch('https://tubanco.example/movimientos')` y **leer** la respuesta: tus movimientos, con tu sesión, enviados a quien escribió esa página. La **política del mismo origen** existe para que eso no pueda pasar.

Esa protección tiene un precio: tu propia web, en `https://tienda.example`, tampoco puede leer sin más la API de `https://api.tienda.example`. **CORS** es el mecanismo con el que un servidor dice «esta otra web sí puede leerme». Es el error de red más famoso del desarrollo web («blocked by CORS policy»), y casi siempre se intenta arreglar en el lugar equivocado: el problema y el arreglo están en el **servidor**, no en tu `fetch`.

## El origen: esquema, host y puerto

En la lección «Cómo funciona la web» viste que una URL tiene esquema, host, puerto, ruta, query y fragmento, y que los tres primeros forman el **origen**: la identidad de un sitio para el navegador. Dos URLs son del **mismo origen** solo si coinciden las tres partes, comparadas como texto:

[[exercise:01-que-es-un-origen.md-]]

```text
origen de la página → https://tienda.example
✅ mismo origen · https://tienda.example — cambia la ruta
✅ mismo origen · https://tienda.example — 443 es el puerto por defecto de https
⛔ otro origen · http://tienda.example — cambia el esquema
⛔ otro origen · https://www.tienda.example — un subdominio es otro host
⛔ otro origen · https://tienda.example:8443 — cambia el puerto
⛔ otro origen · https://pagos.example — otro host
localhost:3001 y 127.0.0.1:3001, ¿mismo origen? → false
location.origin → http://localhost:3001
// En una tarjeta de la teoría: location.origin → null
```

El navegador no comprueba si dos nombres llevan a la misma máquina: `localhost` y `127.0.0.1` son el mismo servidor y dos orígenes distintos, cada uno con sus cookies y su almacenamiento. Este módulo usa esa pareja para probar CORS de verdad: la vista previa del editor vive en `http://localhost:3001`, y el servidor de prueba también contesta en `http://127.0.0.1:3001`, que para el navegador es otro sitio.

Hay un origen especial, el **origen opaco**, que se escribe `null`: lo tienen los iframes con `sandbox` sin `allow-same-origin`, los documentos `data:` y, a menudo, las páginas abiertas desde un archivo (`file://`). Cada origen opaco es único y no coincide con ningún otro, aunque todos se escriban igual, `null`.

## La política del mismo origen

La regla general: una página puede **usar** recursos de otros orígenes, pero no **leerlos**.

| Desde `https://tienda.example`… | ¿Se puede? |
|---------------------------------|------------|
| mostrar `<img src="https://cdn.example/foto.jpg">`, cargar un CSS o un script clásico de otro origen | sí: incrustar está permitido |
| enviar un formulario o seguir un enlace a otro origen | sí: navegar está permitido |
| leer con `fetch` la respuesta de `https://api.otra.example` | solo si **ese servidor** lo permite con CORS |
| leer los píxeles de una imagen de otro origen dibujada en un `<canvas>` | solo con CORS (`crossorigin` + permiso) |
| tocar el DOM de un iframe de otro origen (`frame.contentDocument`) | no: solo mensajes con `postMessage` |
| leer el `localStorage` o las cookies de otro origen | no: cada origen tiene los suyos (lección «Almacenamiento en el navegador») |

La segunda fila tiene una consecuencia importante: el navegador **envía** peticiones a otros orígenes, con sus cookies, aunque la página no pueda leer la respuesta. Lo que impide que una web ajena «envíe» un formulario de pago en tu nombre no es CORS, sino otras defensas (cookies `SameSite`, tokens en el formulario), que verás por encima en la lección «Almacenamiento en el navegador».

## CORS: el servidor da permiso

**CORS** (*Cross-Origin Resource Sharing*, «compartir recursos entre orígenes») es una conversación de cabeceras. Cuando tu script pide algo a otro origen, el navegador añade la cabecera `Origin` con tu origen. El servidor contesta y, si quiere compartir, incluye `Access-Control-Allow-Origin` con tu origen o con `*` («cualquiera»). Antes de entregar la respuesta a tu script, el navegador **comprueba** que el permiso encaja:

```text
página http://localhost:3001                         servidor http://127.0.0.1:3001
  fetch('http://127.0.0.1:3001/api/demo/echo')
        ── GET /api/demo/echo ─────────────────────►
           Origin: http://localhost:3001
        ◄─ 200 OK ──────────────────────────────────
           Access-Control-Allow-Origin: *
  navegador: ¿* encaja con http://localhost:3001? sí → el script recibe el Response
```

[[exercise:02-peticion-a-otro-origen.md-]]

```text
mismo origen → 200 | type: basic | pedido: P-1001
otro origen → 200 | type: cors | pedido: P-1001
```

`response.type` dice qué clase de respuesta tienes: `'basic'` (mismo origen: lo ves todo), `'cors'` (otro origen con permiso: ves el cuerpo y solo algunas cabeceras) u `'opaque'` (lo verás enseguida). En una tarjeta de la teoría las dos líneas dicen `cors`: luego verás por qué.

### Cuando falta el permiso

Si el servidor no envía `Access-Control-Allow-Origin` (o envía otro origen), el navegador **descarta** la respuesta y `fetch` se rechaza con el mismo error que un fallo de red: `TypeError: Failed to fetch`. Tu script no puede distinguir «CORS» de «servidor apagado», a propósito: si pudiera, una página podría explorar qué servidores existen en tu red. El motivo real aparece solo en la consola de DevTools.

[[exercise:03-bloqueada-por-cors.md-]]

```text
mismo origen, sin CORS → 200 OK
🐛 otro origen, sin CORS → TypeError: Failed to fetch
   ¿falló tras esperar la respuesta (≥ 800 ms)? → true
✅ otro origen, con CORS → 200 OK
```

La consola de LearnWeb solo ve lo que ve tu script, así que tampoco muestra el motivo. Para verlo, abre el ejemplo con el botón ↗ de la vista previa y la consola de DevTools (<kbd>⌥</kbd> <kbd>⌘</kbd> <kbd>I</kbd>): Chrome escribe en rojo «Access to fetch at '…' from origin 'http://localhost:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource», y en la pestaña Network la petición aparece como «CORS error».

Fíjate en la línea de los 800 ms: la petición **llegó** al servidor, que esperó, la procesó y contestó. CORS no impide enviar; impide leer. Por eso nunca es una defensa del servidor: un servidor no puede confiar en que el navegador bloquee nada (un `curl` o un script de Python no aplican CORS), y debe comprobar permisos en cada petición.

## Peticiones simples y preflight

Algunas peticiones podrían **hacer** algo en el servidor solo con llegar (un `DELETE`, un `PUT`), y un servidor antiguo que no conozca CORS no estaría preparado para recibirlas desde cualquier web. Por eso el navegador separa dos clases:

- **Simples**: método `GET`, `HEAD` o `POST`, solo cabeceras de una lista segura (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type`) y un `Content-Type` de los que ya podía enviar un formulario HTML (`application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`). Se envían directamente; un formulario ya podía hacerlas.
- **Con preflight**: todas las demás. `PUT`, `DELETE`, `PATCH`, un `POST` con JSON, cualquier `Authorization` o cabecera propia. Antes de enviarlas, el navegador pregunta con una petición `OPTIONS` (el **preflight**, «comprobación previa») y solo envía la de verdad si la respuesta lo permite.

```text
OPTIONS /api/demo/echo                              ← el navegador pregunta
  Origin: http://localhost:3001
  Access-Control-Request-Method: PUT
  Access-Control-Request-Headers: content-type,x-cart-version
204 No Content                                      → el servidor contesta
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS
  Access-Control-Allow-Headers: content-type, x-cart-version
  Access-Control-Max-Age: 0                         (cuánto recordar la respuesta)
PUT /api/demo/echo                                  ← ahora sí, la petición real
```

[[exercise:04-peticiones-con-preflight.md-]]

```text
GET sin cabeceras → false
POST de formulario → false
POST con JSON → true
GET con Authorization → true
DELETE → true
✅ PUT con JSON → 200 | llegó: PUT {sku: 'CAF-500', quantity: 3} | X-Cart-Version: 7
⛔ con Idempotency-Key → TypeError: Failed to fetch
```

El preflight cuesta un viaje de ida y vuelta más. Los servidores lo amortiguan con `Access-Control-Max-Age` (el navegador recuerda la respuesta unos segundos o minutos); el de prueba envía `0` para que veas el `OPTIONS` cada vez en la pestaña Network.

## Lo que el script ve y lo que no

| Caso | `type` | `status` | cuerpo | cabeceras |
|------|--------|----------|--------|-----------|
| mismo origen | `'basic'` | el real | sí | todas (menos `Set-Cookie`) |
| otro origen con permiso CORS | `'cors'` | el real | sí | solo las seguras y las expuestas |
| otro origen sin permiso | — | — | — | `fetch` se rechaza: `TypeError: Failed to fetch` |
| otro origen con `mode: 'no-cors'` | `'opaque'` | `0` | vacío | ninguna |

### `mode: 'no-cors'` no es un arreglo

El mensaje de CORS de Chrome termina con una sugerencia: «If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled». Parece la solución, y es una trampa: con `mode: 'no-cors'` la promesa se cumple, pero con una respuesta **opaca**, que el navegador tiene y no te deja ver.

[[exercise:05-no-cors-respuesta-opaca.md-]]

```text
🐛 ¿se rechazó? → no | type: opaque
🐛 status → 0 | ok → false
🐛 cabeceras visibles → 0
🐛 cuerpo → ""
🐛 json() → SyntaxError: Unexpected end of input
✅ con permiso → type: cors | pedido: P-1001
```

`no-cors` existe para peticiones cuya respuesta no necesitas (un aviso de analítica) y para que un *service worker* guarde en caché recursos ajenos. Si necesitas los datos, solo hay dos caminos: que el servidor envíe CORS, o pedirlos desde **tu** servidor, que los reenvía a tu página (un *proxy*). Entre servidores no hay CORS: es una regla del navegador.

> **Desde Python:** `requests.get('https://api.otra.example')` funciona siempre, porque CORS no existe fuera del navegador. Si un endpoint «funciona en Python y falla en la web», casi siempre es CORS. El servidor de desarrollo de Flask o Django no envía CORS por defecto; extensiones como `flask-cors` o `django-cors-headers` añaden las cabeceras.

### Cabeceras que no se ven

Con una respuesta `'cors'`, el script solo puede leer las cabeceras de una lista segura: `Cache-Control`, `Content-Language`, `Content-Length`, `Content-Type`, `Expires`, `Last-Modified` y `Pragma`. Las demás llegan al navegador (se ven en Network), pero `headers.get()` devuelve `null`, como si no existieran. El servidor las comparte con `Access-Control-Expose-Headers`:

[[exercise:06-cabeceras-no-expuestas.md-]]

```text
mismo origen → X-Demo-Server: LearnWeb
🐛 otro origen → X-Demo-Server: null
   has('x-demo-server') → false
   cabeceras que sí ves → (3) ['cache-control', 'content-length', 'content-type']
✅ expuesta → X-Demo-Server: LearnWeb
```

Es el fallo típico de las APIs paginadas que envían el total en `X-Total-Count`, o de las que limitan peticiones con `Retry-After`: en el mismo origen funciona y, al separar la API en su propio dominio, el total sale `null`.

### Credenciales

Por defecto, `fetch` envía cookies solo a tu propio origen (`credentials: 'same-origin'`). Con `credentials: 'include'` las envía también a otros, y entonces el permiso tiene que ser más estricto: el servidor debe **nombrar tu origen exacto** (no vale `*`) y añadir `Access-Control-Allow-Credentials: true`. Un comodín no basta para datos privados de un usuario:

[[exercise:07-credenciales-con-asterisco.md-]]

```text
sin credenciales, Allow-Origin: * → 200 OK
🐛 credentials: include, Allow-Origin: * → TypeError: Failed to fetch
✅ credentials: include, Allow-Origin: <tu origen> → 200 OK
```

| `credentials` | Cookies y autenticación HTTP |
|---------------|------------------------------|
| `'omit'` | nunca |
| `'same-origin'` (por defecto) | solo a tu origen |
| `'include'` | también a otros orígenes (el servidor debe permitirlo) |

Ojo con la tentación de configurar el servidor para que copie cualquier `Origin` y permita credenciales: equivale a abrir los datos de tus usuarios a cualquier web. Se copia solo si el origen está en una lista conocida.

## Otros recursos que piden CORS

`fetch` no es lo único que aplica estas reglas. Las cargas que se **incrustan** sin leerse (imágenes, CSS, scripts clásicos) funcionan entre orígenes sin CORS, pero hay excepciones:

- Los **módulos** (`<script type="module">`, `import`) se piden siempre con CORS. Es la promesa del módulo «Módulos y organización»: por eso un módulo de un CDN necesita que el CDN envíe `Access-Control-Allow-Origin` (esm.sh lo hace), y por eso una página abierta con doble clic (`file://`, origen opaco) no puede cargar sus propios módulos: hay que servirla por HTTP, como hace LearnWeb.
- Las **fuentes** de `@font-face` de otro origen necesitan CORS.
- Una imagen de otro origen se **dibuja** en un `<canvas>` sin problema, pero entonces el canvas queda «contaminado» y leer sus píxeles lanza un `SecurityError`, salvo que la imagen tenga `crossorigin="anonymous"` y el servidor envíe CORS (módulo «Gráficos y animación»).

## Lo que el navegador cuenta: `Origin` y `Referer`

Cada petición dice de dónde viene. `Origin` (solo el origen) va en las peticiones a otros orígenes y en los `POST`; es la cabecera que lee CORS. `Referer` (con su falta de ortografía histórica) lleva la dirección de la página que hizo la petición, y una **política de referente** decide cuánta: la de Chrome por defecto, `strict-origin-when-cross-origin`, envía la URL completa a tu propio origen, solo el origen a otros, y nada si se pasa de `https` a `http`. En la lección «Iframes y contenido embebido» viste el atributo `referrerpolicy`; `fetch` tiene la opción equivalente:

```js
// No contar a la API de mapas en qué página (ni con qué query) estaba el usuario.
fetch('https://mapas.example/tiles/19/115/220.png', { referrerPolicy: 'no-referrer' });
```

La política importa cuando tus URLs llevan datos: `/buscar?q=resultado+de+mi+análisis` o un token en la query acabarían, con una política laxa, en los registros de cualquier servidor al que pidas una imagen.

## La vista previa de LearnWeb es otro origen

Ya tienes las piezas para entender dónde se ejecutan los ejemplos del curso. En el editor (y con «▶ Run» bajo un código), el ejemplo es una página de verdad servida desde `http://localhost:3001`. Las **tarjetas** de la teoría, en cambio, son iframes con el atributo `sandbox` y sin el permiso `allow-same-origin`: su origen es opaco, `null`. Para una tarjeta, cada petición es de otro origen, y un servidor sin CORS no le contesta:

[[exercise:08-la-tarjeta-es-otro-origen.md]]

[[exercise:08-la-tarjeta-es-otro-origen.md-(script.js)]]

```text
location.origin → http://localhost:3001
/api/demo/echo?cors=no → ✅ 200 · type basic
/api/demo/echo → ✅ 200 · type basic
http://127.0.0.1:3001/api/demo/echo → ✅ 200 · type cors
// En la tarjeta de arriba (origen null):
location.origin → null
/api/demo/echo?cors=no → ⛔ TypeError: Failed to fetch
/api/demo/echo → ✅ 200 · type cors
http://127.0.0.1:3001/api/demo/echo → ✅ 200 · type cors
```

Por eso los ejemplos de este módulo se miran con su código y «▶ Run»: varios dan otro resultado en una tarjeta. Los archivos de `assets/` y el servidor de prueba envían `Access-Control-Allow-Origin: *` para que las tarjetas puedan pedirlos.

## Bestiario

- **«blocked by CORS policy».**
  Síntoma: `fetch` a otro origen se rechaza con `TypeError: Failed to fetch`; la consola de DevTools habla de CORS.
  Causa: el servidor no envió `Access-Control-Allow-Origin` (o no con tu origen); el navegador recibió la respuesta y la escondió.
  Solución: configurar CORS en el servidor, o llamar desde tu propio servidor (proxy). Nada en el `fetch` lo arregla.
  → [ver ejemplo](03-bloqueada-por-cors.md)
- **`no-cors` «funciona» pero no hay datos.**
  Síntoma: con `mode: 'no-cors'` desaparece el error, pero `status` es `0`, las cabeceras están vacías y `json()` falla.
  Causa: es una respuesta opaca: existe para usarla sin leerla.
  Solución: quita `no-cors` y arregla el permiso en el servidor.
  → [ver ejemplo](05-no-cors-respuesta-opaca.md)
- **Una cabecera de la respuesta es `null`.**
  Síntoma: `response.headers.get('X-Total-Count')` es `null` aunque Network muestra la cabecera.
  Causa: en respuestas CORS solo se leen las cabeceras seguras.
  Solución: el servidor añade `Access-Control-Expose-Headers: X-Total-Count`.
  → [ver ejemplo](06-cabeceras-no-expuestas.md)
- **Con cookies, el `*` deja de valer.**
  Síntoma: la petición funciona sin `credentials: 'include'` y falla con ella.
  Causa: con credenciales, `Access-Control-Allow-Origin: *` no se acepta.
  Solución: el servidor responde con el origen exacto (de una lista) y `Access-Control-Allow-Credentials: true`.
  → [ver ejemplo](07-credenciales-con-asterisco.md)

## Resumen

- Origen = esquema + host + puerto, comparados como texto; `localhost` y `127.0.0.1` son orígenes distintos; los iframes aislados tienen origen `null`.
- Una página puede incrustar y enviar a otros orígenes, pero solo **lee** sus respuestas si el servidor lo permite con CORS.
- CORS es una conversación de cabeceras: `Origin` en la petición, `Access-Control-Allow-Origin` en la respuesta; el navegador decide.
- Sin permiso, el script solo ve `TypeError: Failed to fetch`; el motivo está en la consola de DevTools (abre la vista previa con ↗).
- Métodos que no son `GET`/`HEAD`/`POST`, JSON, `Authorization` y cabeceras propias provocan un preflight `OPTIONS`.
- `mode: 'no-cors'` da respuestas opacas; las cabeceras no seguras necesitan `Access-Control-Expose-Headers`; las credenciales necesitan el origen exacto.
- CORS protege a los usuarios en el navegador, no al servidor: la petición llega igual.

## Para profundizar

- [MDN: Control de acceso HTTP (CORS)](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- [MDN: Política del mismo origen](https://developer.mozilla.org/es/docs/Web/Security/Same-origin_policy)
- [javascript.info: Fetch: Cross-Origin Requests](https://es.javascript.info/fetch-crossorigin)
- [web.dev: Cross-Origin Resource Sharing (en inglés)](https://web.dev/articles/cross-origin-resource-sharing)
- [MDN: Referrer-Policy (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
