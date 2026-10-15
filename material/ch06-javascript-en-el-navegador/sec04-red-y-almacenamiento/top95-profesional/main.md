# Ejemplos profesionales: red y almacenamiento

## Por qué importa

Casi toda aplicación web es, por debajo, una conversación con un servidor y una memoria en el navegador: un catálogo que filtra sin recargar, un carrito que no se pierde, un formulario largo que guarda su borrador, una subida con su barra, un panel que recibe datos en vivo. Esta página reúne doce piezas así, escritas como en un proyecto real con todo lo que has visto hasta ahora en el curso: HTML, CSS, el lenguaje JavaScript, el DOM, los eventos y este módulo.

Todas hablan con el servidor de prueba de LearnWeb (`/api/demo/echo`, `/api/demo/stream`) o leen `assets/coffees.json`, el catálogo de la tienda. Varias usan la dirección, `sessionStorage` o IndexedDB, que en una tarjeta de la teoría (un iframe aislado, de origen `null`) no existen o son una simulación en memoria: en ese caso lo dicen en la propia página. **Ábrelas con «▶ Run» o en el editor**, y con ↗ cuando el ejemplo pida una segunda pestaña. Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño.

## Qué tienen en común

- **Cada fallo tiene su respuesta en la interfaz.** Cargando (`aria-busy`), vacío, error con una salida («Vuelve a intentarlo», «Reanudar»), sin conexión con datos guardados. El estado se dice en palabras en una región `role="status"`, y nunca queda una excepción suelta en la consola.
- **Las peticiones se pueden cancelar y tienen plazo.** Un `AbortController` por operación, `AbortSignal.timeout` por intento y `AbortSignal.any` para juntarlos; una búsqueda nueva cancela la anterior.
- **Lo que viene de fuera se valida.** La respuesta (`ok`, `Content-Type`), la URL (que cualquiera escribe) y lo guardado (que otra versión, otra pestaña o el usuario pueden haber dejado roto). Lo desconocido toma el valor por defecto; nada se mete en `innerHTML`.
- **El estado que importa vive donde debe.** En la URL lo que se comparte y se deshace con «atrás»; en `localStorage` lo que se recuerda entre visitas (con versión); en `sessionStorage` lo de una pestaña; en IndexedDB lo grande o lo que debe funcionar sin red. Las claves empiezan por `lw-red-`; las que persisten a propósito tienen su botón para borrarlas.
- **Nada sale de la vista previa.** Los botones «← Atrás» guardan la profundidad en `history.state` y se desactivan en la primera entrada, porque el historial de la vista previa es el de la pestaña de LearnWeb.
- **Poca carga.** Los flujos tienen como mucho 50 trozos de 64 KB, y las descargas y subidas grandes empiezan cuando las pides.

## Catálogo con filtros en la URL

**Objetivo:** el catálogo de una tostadora con búsqueda, tueste, precio máximo, orden y «solo disponibles». **Técnicas:** la URL es la fuente de verdad: el formulario se rellena desde ella al cargar y con `popstate`, y solo guarda lo que no es por defecto; los cambios discretos son `pushState` y escribir es `replaceState` con *debounce*; cada búsqueda cancela la anterior; búsqueda sin tildes con `normalize('NFD')`. **Fíjate en:** abre el ejemplo con ↗, filtra y recarga con ⌘R: todo vuelve igual. Si marcas dos tuestes muy seguidos verás una línea `✖ cancelada`.

[[exercise:01-catalogo-con-filtros-en-la-url.md]]

```text
📦 catálogo cargado: 12 cafés
Listo: marca «Oscuro», ordena por «Precio ↑», escribe «chiapas» y vuelve con «← Atrás»
🔎 (sin filtros) → 12 café(s)
// Tras marcar «Oscuro»:
🧭 pushState → ?tueste=oscuro
🔎 ?tueste=oscuro → 4 café(s)
// Tras elegir «Precio ↑» en «Ordenar»:
🧭 pushState → ?tueste=oscuro&orden=precio-asc
🔎 ?tueste=oscuro&orden=precio-asc → 4 café(s)
// Tras escribir «chiapas» de corrido (la entrada se sustituye, no se apila):
🔁 replaceState → ?q=chiapas&tueste=oscuro&orden=precio-asc
🔎 ?q=chiapas&tueste=oscuro&orden=precio-asc → 1 café(s)
// Tras «← Atrás»:
↩️ popstate → ?tueste=oscuro
🔎 ?tueste=oscuro → 4 café(s)
```

## Notas de cata sin conexión

**Objetivo:** apuntar notas de cata en una finca sin cobertura y que lleguen al servidor al volver la señal. **Técnicas:** IndexedDB con dos almacenes, las notas y una **cola de salida**; guardar la nota y su envío pendiente en una sola transacción; una sincronización que vacía la cola en orden y se detiene al primer fallo; «Sin conexión» simulado con una dirección donde nadie contesta. **Fíjate en:** guardar nunca espera a la red, y una nota enviada cambia de «⏳ pendiente» a «☁️ enviada». Las notas persisten a propósito en la base `lw-red-notas`; «Borrar todo» la elimina.

[[exercise:02-notas-sin-conexion.md]]

```text
🗄️ notas guardadas: 0 · pendientes: 0
Listo: guarda una nota; marca «Sin conexión» y guarda otra; después desmárcala
// Tras guardar «Pluma Hidalgo» con sus notas:
💾 «Pluma Hidalgo» guardada en el navegador (pendiente)
☁️ «Pluma Hidalgo» enviada: 201 Created
// Tras marcar «Sin conexión» y guardar «Café de Xilitla»:
💾 «Café de Xilitla» guardada en el navegador (pendiente)
📡 sin conexión: 1 pendiente(s), se enviarán al volver
// Tras desmarcar «Sin conexión»:
☁️ «Café de Xilitla» enviada: 201 Created
// Tras «Borrar todo»:
🗑️ base borrada
```

## Carrito entre pestañas

**Objetivo:** el carrito de una tienda que es el mismo en todas las pestañas y sobrevive a cerrar el navegador. **Técnicas:** una sola fuente de verdad en `localStorage` (JSON con versión, validado al leer contra el catálogo y las existencias), el evento `storage` para las demás pestañas, un listener delegado para todos los botones y el total en una región `aria-live`. **Fíjate en:** cada clic vuelve a leer lo guardado antes de cambiarlo, porque otra pestaña pudo cambiarlo entretanto. Persiste a propósito; «Vaciar» lo borra.

[[exercise:03-carrito-entre-pestanas.md]]

```text
🛒 carrito recuperado: 0 artículo(s)
Listo: añade cafés; abre el ejemplo con ↗, cambia el carrito allí y vuelve a esta pestaña
// Tras «Añadir» dos veces en Café de Chiapas y una en Café de Coatepec:
➕ Café de Chiapas → 1 · total $210
➕ Café de Chiapas → 2 · total $420
➕ Café de Coatepec → 1 · total $555
// Tras quitar un Café de Chiapas (−) en la pestaña de ↗, en esta:
📨 otra pestaña cambió el carrito: 2 artículo(s) · total $345
```

## Consulta de pedido con reintentos

**Objetivo:** consultar el estado de un envío aunque el servidor esté inestable. **Técnicas:** reintentos solo para red, plazos, `5xx` y `429`; espera exponencial con *jitter* del ±20 % (con semilla, para que cada consulta dé los mismos tiempos) y respeto a `Retry-After`; un plazo por intento y la señal de «Cancelar» combinados con `AbortSignal.any`; un selector que simula el servidor con `?status=` y `?delay=`. **Fíjate en:** el 404 no se reintenta, y «Cancelar» corta también la espera entre intentos.

[[exercise:04-reintentos-y-servidor-caido.md]]

```text
Listo: elige cómo se comporta el servidor y pulsa «Consultar» (prueba «Cancelar» con el servidor caído)
// Tras «Consultar» con «Funciona»:
✅ intento 1 → 200 OK: pedido P-2041 en camino
// Con «Falla 2 veces y se recupera»:
🔄 intento 1 → 503 Service Unavailable · reintento en 242 ms
🔄 intento 2 → 503 Service Unavailable · reintento en 592 ms
✅ intento 3 → 200 OK: pedido P-2041 en camino
// Con «Caído (503 siempre)»:
🔄 intento 1 → 503 Service Unavailable · reintento en 242 ms
🔄 intento 2 → 503 Service Unavailable · reintento en 592 ms
🔄 intento 3 → 503 Service Unavailable · reintento en 1051 ms
⛔ intento 4 → 503 Service Unavailable: sin más reintentos
// Con «Lento (3 s por respuesta)» (unos 6 s en total):
🔄 intento 1 → sin respuesta en 1 s · reintento en 242 ms
🔄 intento 2 → sin respuesta en 1 s · reintento en 592 ms
🔄 intento 3 → sin respuesta en 1 s · reintento en 1051 ms
⛔ intento 4 → sin respuesta en 1 s: sin más reintentos
// Con «Pedido inexistente (404)»:
⛔ intento 1 → 404 Not Found: no se reintenta
// Con «Caído (503 siempre)» y «Cancelar» durante la primera espera:
🔄 intento 1 → 503 Service Unavailable · reintento en 242 ms
🛑 consulta cancelada
```

## Gestor de descargas

**Objetivo:** las descargas de la zona de clientes: catálogo, fotos e informe. **Técnicas:** una cola con dos descargas a la vez; el progreso de cada una con `Content-Length` y un `<progress>` con nombre accesible, indeterminado cuando el servidor no anuncia el tamaño; `for await` sobre `response.body`; cancelar con un `AbortController` por archivo; el resultado como `Blob`. **Fíjate en:** «Reanudar» vuelve a empezar desde cero: continuar a mitad exigiría un servidor con `Accept-Ranges` y una petición con `Range: bytes=N-`, que el de prueba no admite.

[[exercise:05-gestor-de-descargas.md]]

```text
Listo: pulsa «Descargar todo» (dos a la vez; la tercera espera en cola) y prueba «Cancelar» y «Reanudar»
// Tras «Descargar todo»:
⬇️ empieza Catálogo de otoño.pdf
⬇️ empieza Fotos del tueste.zip
✅ Catálogo de otoño.pdf: 160 KB
⬇️ empieza Informe de ventas.csv
✅ Fotos del tueste.zip: 480 KB
✅ Informe de ventas.csv: 60 KB (sin Content-Length)
// Tras «Cancelar» en las fotos a mitad y «Reanudar»:
⏹️ cancelada Fotos del tueste.zip
⬇️ empieza Fotos del tueste.zip
✅ Fotos del tueste.zip: 480 KB
```

## Visor de registros en vivo

**Objetivo:** el registro del servidor de la tienda, como el de un panel de administración. **Técnicas:** una tubería `response.body` → `TextDecoderStream` → `TransformStream` de líneas → objetos; filtros por nivel que solo ocultan (no se pierde nada); una pausa que acumula lo que llega sin cortar la conexión; desplazamiento automático solo si el usuario lo quiere; «Detener / Conectar» con `AbortController`. **Fíjate en:** la lista de líneas no es una región `aria-live` (sería un torrente para un lector de pantalla); el resumen sí.

[[exercise:06-visor-de-registros.md]]

```text
Listo: mira el registro; desmarca «info», prueba «Pausar» y «Detener»
📡 conectado
✅ fin del flujo: 24 líneas · info 17 · warn 5 · error 2
// Tras «Conectar», «Pausar» a mitad y «Reanudar» (los números dependen del momento):
📡 conectado
⏸️ en pausa: lo que llegue se acumula
▶️ reanudado: 6 línea(s) acumuladas
✅ fin del flujo: 24 líneas · info 17 · warn 5 · error 2
// Tras «Conectar» y «Detener» a mitad (los números dependen del momento):
📡 conectado
⏹️ detenido · info 9 · warn 2 · error 1
```

## Página de ajustes

**Objetivo:** los ajustes de una cuenta: tema, densidad, moneda y avisos. **Técnicas:** un único objeto JSON con versión, validado campo a campo; aplicar es poner atributos `data-*` que el CSS interpreta (`light-dark()`, `color-scheme`, una variable de espaciado); precios con `Intl.NumberFormat`; el evento `storage` para las demás pestañas. **Fíjate en:** «Restablecer» **borra** la clave en vez de guardar los valores por defecto: así el tema vuelve a seguir al sistema si el usuario cambia su sistema después.

[[exercise:07-pagina-de-ajustes.md]]

```text
⚙️ tema sistema · densidad cómoda · moneda MXN · ofertas no (por defecto)
Listo: cambia el tema y la moneda, pulsa ⟳ (se recuerdan); abre el ejemplo con ↗ y cambia algo allí
// Tras elegir «Claro» y «Dólar (USD)»:
💾 tema claro · densidad cómoda · moneda MXN · ofertas no
💾 tema claro · densidad cómoda · moneda USD · ofertas no
// Tras pulsar ⟳:
⚙️ tema claro · densidad cómoda · moneda USD · ofertas no (guardados)
Listo: cambia el tema y la moneda, pulsa ⟳ (se recuerdan); abre el ejemplo con ↗ y cambia algo allí
// Tras elegir «Oscuro» en la pestaña de ↗, en esta:
📨 otra pestaña cambió los ajustes: tema oscuro · densidad cómoda · moneda USD · ofertas no
// Tras «Restablecer»:
↺ ajustes restablecidos: el tema vuelve a seguir al sistema
```

## Comprobador de CORS

**Objetivo:** una herramienta de diagnóstico que explica qué hará el navegador con una petición a otro origen. **Técnicas:** `predict()` aplica las reglas de la lección «Orígenes y CORS» sin hacer la petición (mismo origen, permiso con `*`, sin permiso, preflight, cabeceras no permitidas, credenciales, `no-cors`, cabeceras expuestas); `check()` la hace y compara `response.type`, `status` y la cabecera `X-Demo-Server`; nueve casos al cargar y un formulario para combinar opciones. **Fíjate en:** el «mismo origen» se calcula con `location.origin`, así que las predicciones también aciertan en una tarjeta (origen `null`), donde todo es de otro origen.

[[exercise:08-comprobador-de-cors.md]]

```text
✓ GET a este servidor, sin CORS → basic 200 · mismo origen: CORS no interviene
✓ GET a 127.0.0.1, Allow-Origin * → cors 200 · permiso con «*»; X-Demo-Server oculta (no expuesta)
✓ GET a 127.0.0.1, sin CORS → bloqueada · la respuesta no trae Access-Control-Allow-Origin
✓ PUT con JSON y X-Cart-Version → cors 200 · preflight aceptado; permiso con «*»; X-Demo-Server oculta (no expuesta)
✓ POST con Idempotency-Key → bloqueada · el preflight no permite la cabecera idempotency-key
✓ GET con credenciales y «*» → bloqueada · con credenciales no vale «*»
✓ GET con credenciales, origen reflejado → cors 200 · el servidor nombra tu origen y permite credenciales; X-Demo-Server oculta (no expuesta)
✓ GET no-cors a un servidor sin CORS → opaque 0 · no-cors: respuesta opaca (status 0, nada legible)
✓ GET a 127.0.0.1 con expose=1 → cors 200 · permiso con «*»; X-Demo-Server visible (expuesta)
9 de 9 resultados coinciden con la predicción
Listo: combina opciones en el formulario y pulsa «Comprobar»; con ↗ y DevTools verás el motivo de cada bloqueo
// Tras elegir «otro origen», «sin cabeceras CORS» y «Comprobar»:
✓ GET 127.0.0.1:3001?cors=no → bloqueada · la respuesta no trae Access-Control-Allow-Origin
```

## Subida con barra de progreso

**Objetivo:** subir el informe de ventas de una sucursal viendo cuánto falta. **Técnicas:** `XMLHttpRequest` y los eventos `progress` de `xhr.upload`, que `fetch` no ofrece, envueltos en una promesa con el contrato de `fetch` (`{ signal }`, rechazo con `signal.reason`); `FormData` del formulario, sin `Content-Type` a mano; el límite de 1 MB comprobado antes de enviar. **Fíjate en:** en `localhost` la subida es casi instantánea y la barra avanza a saltos; contra un servidor lejano se vería fluida. Un botón genera un CSV de unos 700 KB para no tener que buscar un archivo.

[[exercise:09-subida-con-progreso.md]]

```text
Listo: pulsa «Generar un archivo de prueba» y después «Subir» (o elige un archivo tuyo de menos de 1 MB)
// Tras «Generar un archivo de prueba» y «Subir»:
📄 archivo de prueba: ventas-octubre.csv (693 KB)
⬆️ subiendo ventas-octubre.csv (693 KB)…
✅ 201 Created · el servidor recibió ventas-octubre.csv · 709358 bytes · text/csv · «Ventas de octubre»
```

## Tienda con enlaces profundos

**Objetivo:** una tienda de una sola página donde cada vista (un estado, un café, una página que ya no existe) tiene su dirección. **Técnicas:** rutas en la query, datos de `assets/coffees.json` con estado de carga, vistas como funciones puras que devuelven título, migas de pan y contenido construido con `textContent`, la tabla de rutas consultada con `Object.hasOwn`, `document.title`, foco en el encabezado y desplazamiento arriba al navegar. **Fíjate en:** el campo «Enlace a esta vista» muestra una dirección que se puede pegar en otra pestaña y abre exactamente esa vista.

[[exercise:10-tienda-con-enlaces-profundos.md]]

```text
📦 12 cafés cargados
🧭 (sin query) → «Cafés de México»
Listo: pulsa «Oaxaca», «Pluma Hidalgo» y la miga «Cafés»; prueba el café de Tabasco y «← Atrás»
// Tras pulsar «Oaxaca», «Pluma Hidalgo» y la miga «Cafés»:
🧭 ?vista=cafes&origen=Oaxaca → «Cafés de Oaxaca»
🧭 ?vista=cafe&sku=CAF-OAX-500 → «Pluma Hidalgo»
🧭 ?vista=cafes → «Todos los cafés»
// Tras «☕ Cafés de México» y «Café de Tabasco (ya no lo vendemos)»:
🧭 ?vista=inicio → «Cafés de México»
🧭 ?vista=cafe&sku=CAF-TAB-250 → «Café no encontrado»
// Tras «← Atrás»:
🧭 ?vista=inicio → «Cafés de México»
```

## Consola de peticiones

**Objetivo:** una consola como las de las herramientas para probar APIs, limitada al servidor de prueba. **Técnicas:** la query con `URLSearchParams` y las cabeceras con `new Headers()`, que rechaza nombres no válidos; el cuerpo comprobado con `JSON.parse` y su tamaño antes de enviar; plazo y cancelación; la respuesta con su status, su tiempo, sus cabeceras legibles y el cuerpo formateado; un historial de cinco peticiones en `localStorage`. **Fíjate en:** las cabeceras que muestra son todas las de la respuesta porque la petición es del mismo origen; desde una tarjeta (otro origen) verías solo las seguras.

[[exercise:11-consola-de-peticiones.md]]

```text
→ GET /api/demo/echo?pedido=P-1001
Listo: elige POST, añade la línea status=201 a la query y envía; prueba también un JSON roto y una ruta fuera de /api/demo/
← 200 OK · application/json; charset=utf-8
// Tras elegir POST, añadir la línea status=201 a la query y «Enviar»:
→ POST /api/demo/echo?pedido=P-1001&status=201
← 201 Created · application/json; charset=utf-8
// Tras borrar la llave final del cuerpo y «Enviar»:
⛔ SyntaxError: no se envió
// Tras cambiar la ruta a /api/topic y «Enviar»:
⛔ Error: no se envió
```

## Compra en pasos

**Objetivo:** el cierre de compra de la tienda: carrito, envío, pago y revisión. **Técnicas:** el paso en la URL (`?paso=envio`) y los datos en `sessionStorage`, que es por pestaña; un enlace a un paso sin los datos previos redirige con `replaceState`; la confirmación es un `POST` con una clave de idempotencia (`X-Idempotency-Key`) guardada **antes** de enviar, que se reutiliza si hay que reintentar; tras confirmar, los pasos anteriores redirigen a la confirmación. **Fíjate en:** el método de pago se guarda, pero un número de tarjeta nunca toca el almacenamiento: va directo a la pasarela del banco.

[[exercise:12-compra-en-pasos.md]]

```text
🛒 compra en esta pestaña: empieza en el carrito
Listo: avanza hasta «Revisar», marca «Simular un fallo de red», confirma dos veces y vuelve con «← Atrás»
// Tras «Continuar al envío», rellenar el envío y «Continuar al pago»:
🧭 paso: envio
💾 envío guardado (sessionStorage de esta pestaña)
🧭 paso: pago
// Tras elegir «Pago contra entrega» y «Revisar el pedido»:
🧭 paso: revisar
// Tras marcar «Simular un fallo de red» y pulsar «Confirmar pedido» dos veces:
📡 TypeError: el pedido no se confirmó; la clave se conserva para reintentar
📨 201 Created · pedido P-2042 · 2 intento(s), misma clave en todos: true
// Tras «← Atrás»:
↪️ «pago» no está disponible (el pedido ya está confirmado): voy a «hecho»
```
